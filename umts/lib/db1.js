import { isEmpty, slugify } from '../lib/utils'
import { getKeyFromPassword, getSalt, encrypt, decrypt } from '../lib/crypto'
import { replace, update, insert, remove, find } from '../lib/mongoHelpers'
import { ObjectID } from 'mongodb'
import isMongoId from 'validator/lib/isMongoId'

const isM = (_id) => {
  const id = (_id && _id.toString()) || ''
  return isMongoId(id)
}

export const getUser = async (req, userId) => {
  const user = await req.db.collection('users').findOne({
    _id: userId,
  })
  if (!user) return null
  const { _id, name, email, role, status, emailVerified } = user
  const isAuth = _id === req.user?._id
  return {
    _id,
    name,
    email: isAuth ? email : null,
    emailVerified: isAuth ? emailVerified : null,
    role: isAuth ? role : null,
    status: isAuth ? status : null,
  }
}

export const getProduct = async (req, url, product, version) => {
  const ignoreProtocol = /[a-z]+:\/\//
  const productVersion =
    version?.toString() === '0' || version?.toString() === '1' || !version ? '1' : version?.toString() || '1'
  // console.log({ productVersion })
  const domain =
    (await req.db.collection('domains').findOne({ url: url.replace(ignoreProtocol, '') })) ||
    (await req.db.collection('domains').findOne({ url: `www.${url.replace(ignoreProtocol, '')}` }))
  if (!domain || !url || !product) return null
  return domain.products?.find(
    (p) => p.name.toLowerCase() === product.toLowerCase() && p.version.toString() === productVersion,
  )
}

export const getDomains = async (req, domains) => {
  if (domains) {
    const ignoreProtocol = /[a-z]+:\/\//
    const { error, data } = await find({ db: req.db, collection: 'domains', find: { url: { $in: domains } } })
    if (!data || error) return null
    return data
  } else {
    const { error, data } = await find({ db: req.db, collection: 'domains' })
    if (!data || error) return null
    return data
  }
}

export const getContent = async (req, contentIds) => {
  // console.log('__________________________________________________')
  // console.log({ contentIds })
  const { error, data } = await find({ db: req.db, find: { _id: { $in: contentIds } }, collection: 'content' })
  if (!data || error) return null
  return data
}

export const getSMTSConfig = async (req, user_id) => {
  return await req.db.collection('smts').findOne({ user_id })
}

export const getDomainByUrl = async (req, url) => {
  const ignoreProtocol = /[a-z]+:\/\//
  const domain = await req.db.collection('domains').findOne({
    $or: [
      { url: url.replace(ignoreProtocol, '') },
      { url: 'www' + url.replace(ignoreProtocol, '') },
      { aliases: { $in: [url.replace(ignoreProtocol, '')] } },
    ],
  })

  if (!domain || !url) return null
  return domain
}

export const getDomain = async (req, id) =>
  req && id && isM(id) && (await req.db.collection('domains').findOne({ _id: ObjectID(id) }))

export const getClient = async (req, clientNumber) =>
  req && clientNumber && (await req.db.collection('clients').findOne({ clientNumber }))

export const removeClientDataSource = async (req, domain, clientNumber, dataSource) => {
  const client = await req.db.collection('clients').findOne({ clientNumber })
  if (!client || !domain || !dataSource) return null
  const ignoreProtocol = /[a-z]+:\/\//
  const url = domain.replace(ignoreProtocol, '')
  const slug = slugify(url)
  const dataSourceId = client.dataSources?.[slug]?.[dataSource] || null

  const dataSources = {
    ...client.dataSources,
    [slug]: Object.entries(client.dataSources[slug]).reduce((acc, [key, value]) => {
      return key !== dataSource ? { ...acc, [key]: value } : acc
    }, {}),
  }

  const { error, data } = await remove({
    db: req.db,
    collection: 'dataSources',
    document: {
      _id: dataSourceId,
    },
  })
  if (!data || error) {
    return null
  }
  const { error: clientError, data: clientData } = await update({
    db: req.db,
    collection: 'clients',
    query: { clientNumber },
    document: {
      $set: {
        dataSources,
      },
    },
    options: { returnOriginal: false, upsert: true },
  })
  if (!clientData || clientError) {
    return null
  }
  return clientData
}

export const addClientDataSource = async (req, domain, clientNumber, dataSource, payload) => {
  const client = await req.db.collection('clients').findOne({ clientNumber })
  const clientDomain = await getDomainByUrl(req, domain)
  if (!client || !domain || !dataSource || !clientDomain) return null
  const ignoreProtocol = /[a-z]+:\/\//
  const url = domain.replace(ignoreProtocol, '')
  const slug = slugify(url)
  const payloadWithHashedSecrets = Array.isArray(payload)
    ? { data: payload }
    : {
        ...payload,
        ...(payload.password && {
          password: encrypt(payload.password, getKeyFromPassword(Buffer.from('tofisch123'), getSalt())),
        }),
      }

  const dataId = client.dataSources?.[slug]?.[dataSource]
  const { data: currentData, error: currentDataError } = (dataId &&
    (await find({ db: req.db, collection: 'dataSources', find: { _id: dataId }, limit: 1 }))) || {
    data: null,
    error: 'No valid ID',
  }

  const removeItemsObj =
    currentData &&
    payloadWithHashedSecrets &&
    Object.entries(currentData).reduce((acc, [key, value]) => {
      const { _id, ...rest } = value
      return key === '_id'
        ? { ...acc }
        : payloadWithHashedSecrets.hasOwnProperty(key)
        ? { ...acc }
        : { ...acc, [key]: value }
    }, {})

  const isEmptyItemsObj = (obj) => {
    if (!obj || (obj && isEmpty(obj))) return true
    return false
  }

  const { error, data } = await update({
    db: req.db,
    collection: 'dataSources',
    query: { _id: client.dataSources?.[slug]?.[dataSource] || ObjectID() },
    document: { $set: payloadWithHashedSecrets, ...(!isEmptyItemsObj(removeItemsObj) && { $unset: removeItemsObj }) },
    options: { returnOriginal: false, upsert: true },
  })
  if (!data || error) {
    return null
  }
  const newItem = { ...(client.dataSources?.[slug] && client.dataSources[slug]), [dataSource]: data._id }

  const tempDataSource = client.dataSources
  tempDataSource[slug] = newItem

  const { error: clientError, data: clientData } = await update({
    db: req.db,
    collection: 'clients',
    query: { clientNumber },
    document: {
      $set: {
        dataSources: Array.isArray(client.dataSources) ? { [slug]: newItem } : tempDataSource,
      },
    },
    options: { returnOriginal: false, upsert: true },
  })

  if (!clientData || clientError) {
    return null
  }
  return clientData
}

export const addProductDataSource = async (req, product, dataSource) => {
  const tempd = dataSource.reduce((acc, item) => {
    const [itemEntry] = Object.entries(item)
    return itemEntry[0] ? { ...acc, [itemEntry[0]]: itemEntry[1] } : { ...acc }
  }, {})

  const dataId = tempd.hasOwnProperty('_id')
    ? ObjectID(tempd._id)
    : product?.dataSource
    ? ObjectID(product.dataSource)
    : ObjectID()

  if (tempd.hasOwnProperty('_id')) {
    delete tempd._id
  }

  // const dataId = product?.dataSource && ObjectID(product.dataSource)
  const { data: currentData, error: currentDataError } = (dataId &&
    (await find({ db: req.db, collection: 'dataSources', find: { _id: dataId }, limit: 1 }))) || {
    data: null,
    error: 'No valid ID',
  }

  const removeItemsObj = currentData
    ? Object.entries(currentData).reduce((acc, [key, value]) => {
        const { _id, ...rest } = value
        return key === '_id' ? { ...acc } : tempd.hasOwnProperty(key) ? { ...acc } : { ...acc, [key]: value }
      }, {})
    : {}

  const { error, data } = await update({
    db: req.db,
    collection: 'dataSources',
    query: { _id: dataId },
    document: { $set: tempd, $unset: removeItemsObj },
    options: { returnOriginal: false, upsert: true },
  })

  if (!data || error) {
    console.log('error occured ', error)
    return null
  }

  const { error: clientError, data: clientData } = await update({
    db: req.db,
    collection: 'domains',
    query: { 'products._id': product._id },
    document: {
      $set: {
        'products.$.dataSource': ObjectID(data._id),
      },
    },
    options: { returnOriginal: false, upsert: true },
  })
  if (!clientData || clientError) {
    return null
  }
  return clientData
}

export const getClientDataSource = async (req, domain, clientNumber, dataSource) => {
  const client = await req.db.collection('clients').findOne({ clientNumber })

  if (!client || !domain || !dataSource) return null
  const ignoreProtocol = /[a-z]+:\/\//
  const slug = slugify(domain.replace(ignoreProtocol, ''))
  const dataId = client.dataSources?.[slug]?.[dataSource]
  const { data, error } = await find({ db: req.db, collection: 'dataSources', find: { _id: dataId }, limit: 1 })
  if (!data || error) return null
  if (Array.isArray(data?.data)) {
    return data.data
  } else {
    const dataWithDecryptedSecrets = data && {
      ...data,
      ...(data.password && {
        password: decrypt(data.password.buffer, getKeyFromPassword(Buffer.from('tofisch123'), getSalt())).toString(),
      }),
    }
    return dataWithDecryptedSecrets
  }
}

export const getFacebookKeys = async (req, clientId, domainId) => {
  const { data, error } = await find({
    db: req.db,
    collection: 'facebookKeys',
    find: { clientId: clientId, domainId: domainId },
    limit: 1,
  })
  if (!data || error) return null
  if (data) {
    return data
  }
}

export const updateFacebookToken = async (req, id, newToken) => {
  const fbData = await req.db
    .collection('dataSources')
    .updateOne({ _id: id }, { $set: { longLivedUserAccessToken: newToken, tokenCreatedAt: new Date() } })
  if (fbData) {
    return fbData
  }
}

export const getFbKeysClientDataSource = async (req, domain, clientNumber, dataSource) => {
  const client = await req.db.collection('clients').findOne({ clientNumber })
  const { data, error } = await find({
    db: req.db,
    collection: 'dataSources',
    find: { _id: client.dataSources.facebook },
    limit: 1,
  })
  if (!data || error) return null
  if (data) {
    return data
  }
}

export const storeSocialWallData = async (req, dataSourceId, clientId, socialWallData) => {
  //if collection exists Update else Create one
  const data = await req.db
    .collection('socialwall')
    .replaceOne(
      { clientId: clientId },
      { dataSourceId: dataSourceId, clientId: clientId, socialwallData: socialWallData, lastUpdatedAt: new Date() },
      { upsert: true },
    )
  if (data) {
    return data
  }
}

export const getSocialWallData = async (req, dataSourceId, clientId, req_offSet, req_limit, req_social_handles) => {
  let limit = req_limit ? parseInt(req_limit) : 500
  let offSet = req_offSet ? parseInt(req_offSet) : 0

  let socialWallData = await req.db
    .collection('socialwall')
    .aggregate([
      { $match: { clientId: clientId, dataSourceId: dataSourceId } },
      { $unwind: '$socialwallData' },
      { $skip: offSet },
      { $limit: limit },
      {
        $match: {
          'socialwallData.source': { $in: [req_social_handles ? req_social_handles : 'facebook', 'instagram'] },
        },
      },
      { $group: { _id: '$_id', socialwallData: { $push: '$socialwallData' } } },
    ])
    .toArray()

  return socialWallData.length > 0 ? socialWallData[0].socialwallData : []
}

export const getSmtsProps = async (req) => {
  const { data, error } = await find({ db: req.db, collection: 'library' })
  if (!data || error) return null
  let props = data[0].smts[0].props
  return props
}

export const getAllSmtsData = async (req) => {
  const { error, data } = await find({ db: req.db, collection: 'smts' })
  if (!data || error) return null
  return data
}

export const getSmtsData = async (req, smtsId) => {
  const { error, data } = await find({ db: req.db, collection: 'smts', find: { _id: smtsId }, limit: 1 })
  if (!data || error) return null
  return data
}

export const createSmtsRecord = async (req, smtsData) => {
  const { error, data } = await insert({ db: req.db, collection: 'smts', document: smtsData })
  if (!data || error) return null
  return true
}

export const updateSmtsData = async (req, id, smtsData) => {
  const { error, data } = await update({
    db: req.db,
    collection: 'smts',
    query: { _id: id },
    document: { $set: smtsData },
  })
  if (!data || error) return null
  return true
}

export const deleteSmtsData = async (req, id) => {
  const { error, data } = await remove({
    db: req.db,
    collection: 'smts',
    document: {
      _id: id,
    },
  })
  if (!data || error) return null
  return true
}

// to save SMTS enquiries
export const saveSmtsEnquiries = async (req, inquiry) => {
  const { error, data } = await insert({ db: req.db, collection: 'enquiries', document: inquiry })
  if (!data || error) return null
  return true
}

// to save guest data coming from fast-checkin
export const saveFastCheckinRecord = async (req, inquiry) => {
  const { error, data } = await insert({ db: req.db, collection: 'fastCheckIns', document: inquiry })
  if (!data || error) return null
  return true
}

export const getFastCheckinGuest = async (req, query) => {
  const { error, data } = await find({ db: req.db, collection: 'fastCheckIns', find: query })
  if (!data || error) return null
  return data
}

// VOUCHER

export const getVoucherData = async (req, _id) => req && _id && (await req.db.collection('vouchers').findOne({ _id }))

export const createVoucherRecord = async (req, document) => {
  const result = await insert({ db: req.db, collection: 'vouchers', document })
  // if (!data || error) return null
  // return true
  return result
}

export const updateVoucherData = async (req, id, voucherData, options) => {
  const result = await update({
    db: req.db,
    collection: 'vouchers',
    query: { _id: id },
    document: { $set: voucherData },
    options,
  })
  // if (!data || error) return null
  // return true
  return result
}

export const updateVoucherTransaction = async (req, id, transactionData, options) => {
  const result = await update({
    db: req.db,
    collection: 'vouchers',
    query: { _id: id },
    document: { $set: transactionData },
    options,
  })
  // if (!data || error) return null
  // return true
  return result
}

export const deleteVoucherData = async (req, _id, multi = false) => {
  const result = await remove({
    db: req.db,
    collection: 'vouchers',
    document: {
      _id,
    },
    multi,
  })
  // if (!data || error) return null
  return result
}

// for parking widget

/**
 * To save payments data that are coming from web hook
 */
export const savePayments = async (req, inquiry) => {
  const { error, data } = await insert({ db: req.db, collection: 'webhookParkingPayments', document: inquiry })
  if (!data || error) return null

  return true
}
