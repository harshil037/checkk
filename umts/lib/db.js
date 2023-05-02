import { isEmpty, slugify } from '../lib/utils'
import { getKeyFromPassword, getSalt, encrypt, decrypt } from '../lib/crypto'
import { replace, update, insert, remove, find, aggregate } from '../lib/mongoHelpers'
import { ObjectId } from 'mongodb'
import isMongoId from 'validator/lib/isMongoId'

const isM = (_id) => {
  const id = (_id && _id.toString()) || ''
  return isMongoId(id)
}

const findClients = async (req, roles) => {
  const userDomains = roles?.map((r) => r.domain)
  const domains = await getDomains(req, userDomains)
  const domainIds = domains?.map((d) => d._id)
  return domainIds
}

export const getUser = async (req, userId) => {
  const user = await req.db.collection('users').findOne({
    _id: userId,
  })
  if (!user) return null
  const { _id, name, email, role, status, emailVerified } = user
  const { superadmin, roles } = user
  const clientsQuery = !superadmin ? await findClients(req, roles) : [{}]
  const d = superadmin
    ? { $or: clientsQuery }
    : {
        $or: clientsQuery.reduce((acc, d) => {
          return [...acc, { domains: { $elemMatch: { $eq: ObjectId(d) } } }]
        }, []),
      }
  const clients = await req.db.collection('clients').find(d).toArray()
  const isAuth = _id === req.user?._id
  return {
    _id,
    clients,
    name,
    email: isAuth ? email : null,
    emailVerified: isAuth ? emailVerified : null,
    role: isAuth ? role : null,
    status: isAuth ? status : null,
  }
}

export const getLoginUser = async (req, token) => {
  const user = await req.db.collection('users').findOne({
    token: token,
  })

  if (!user) return null
  const { _id, name, email, status, emailVerified } = user
  const { superadmin, roles } = user
  const clientsQuery = !superadmin ? await findClients(req, roles) : [{}]
  const d = superadmin
    ? { $or: clientsQuery }
    : {
        $or: clientsQuery.reduce((acc, d) => {
          return [...acc, { domains: { $elemMatch: { $eq: ObjectId(d) } } }]
        }, []),
      }
  const clients = await req.db.collection('clients').find(d).toArray()
  return {
    _id,
    clients,
    name,
    email: email,
    emailVerified: emailVerified,
    roles: roles,
    status: status,
    superadmin: superadmin,
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

// export const getContent = async (req, contentIds) => {
//   // console.log('__________________________________________________')
//   // console.log({ contentIds })
//   const { error, data } = await find({ db: req.db, find: { _id: { $in: contentIds } }, collection: 'content' })
//   if (!data || error) return null
//   return data
// }

export const getContent = async (req, contentId) => {
  const { error, data } = await find({ db: req.db, find: { _id: contentId }, collection: 'contents' })
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
  req && id && isM(id) && (await req.db.collection('domains').findOne({ _id: ObjectId(id) }))

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

  if (Object.keys(dataSources?.[slug]).length == 0) {
    delete dataSources?.[slug]
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
    query: { _id: client.dataSources?.[slug]?.[dataSource] || ObjectId() },
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
  // Add datasource only if its not empty
  if (dataSource.length > 0) {
    const tempd = dataSource.reduce((acc, item) => {
      const [itemEntry] = Object.entries(item)
      return itemEntry[0] ? { ...acc, [itemEntry[0]]: itemEntry[1] } : { ...acc }
    }, {})

    const dataId = tempd.hasOwnProperty('_id')
      ? ObjectId(tempd._id)
      : product?.dataSource
      ? ObjectId(product.dataSource)
      : ObjectId()

    if (tempd.hasOwnProperty('_id')) {
      delete tempd._id
    }

    // const dataId = product?.dataSource && ObjectId(product.dataSource)
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

    if (Object.keys(tempd).length > 0) {
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
            'products.$.dataSource': ObjectId(data._id),
          },
        },
        options: { returnOriginal: false, upsert: true },
      })
      if (!clientData || clientError) {
        return null
      }
      return clientData
    } else {
      let delResult = await remove({
        db: req.db,
        collection: 'dataSources',
        document: { _id: dataId },
      })
      if (delResult.error) {
        res.status(404).send({ error: 'error updating documents' })
      }

      const { error: clientError, data: clientData } = await update({
        db: req.db,
        collection: 'domains',
        query: { 'products._id': product._id },
        document: {
          $unset: {
            'products.$[].dataSource': 1,
          },
        },
        options: { returnOriginal: false, upsert: true },
      })
      if (!clientData || clientError) {
        return null
      }
      return clientData
    }
  }
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
export const getAllDataSource = async (req, clientNumber, dataSource) => {
  const client = await req.db.collection('clients').findOne({ clientNumber })

  if (!client || !dataSource) return null
  const allData = Object.keys(client.dataSources).reduce((res, item) => {
    if (client.dataSources?.[item]?.[dataSource]) {
      res.push({ domain: item, dataId: client.dataSources?.[item]?.[dataSource] })
    }
    return res
  }, [])
  if (allData?.length) {
    let datasources = []
    for (let i = 0; i < allData.length; i++) {
      const { data, error } = await find({
        db: req.db,
        collection: 'dataSources',
        find: { _id: allData?.[i]?.dataId },
        limit: 1,
      })
      if (!data || error) {
      } else if (Array.isArray(data?.data)) {
        datasources.push({ ...data.data, _domain: allData?.[i]?.domain })
      } else {
        const dataWithDecryptedSecrets = data && {
          ...data,
          ...(data.password && {
            password: decrypt(
              data.password.buffer,
              getKeyFromPassword(Buffer.from('tofisch123'), getSalt()),
            ).toString(),
          }),
        }
        datasources.push({ ...dataWithDecryptedSecrets, _domain: allData?.[i]?.domain })
      }
    }
    return datasources
  } else {
    return {}
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

export const getVoucherData = async (req, _id) =>
  req && _id && (await req.db.collection('productVmtsVouchers').findOne({ _id }))

export const createVoucherRecord = async (req, document) => {
  const result = await insert({ db: req.db, collection: 'productVmtsVouchers', document })
  return result
}

export const updateVoucherData = async (req, id, voucherData, options) => {
  const result = await update({
    db: req.db,
    collection: 'productVmtsVouchers',
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
    collection: 'productVmtsVouchers',
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
    collection: 'productVmtsVouchers',
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
export const saveWebhookData = async (req, document) => {
  const { error, data } = await insert({ db: req.db, collection: 'webhooks', document: document })
  if (!data || error) return null

  return true
}

export const getParkingToken = async (req, env) => {
  const { error, data } = await find({ db: req.db, collection: 'parkingToken', find: { is_active: true, env } })
  if (!data || error) return null
  return data
}

export const updateRequest = async (req, id, requestData) => {
  const { error, data } = await update({
    db: req.db,
    collection: 'channelRequests',
    query: { _id: ObjectId(id) },
    document: { $set: requestData },
  })
  if (!data || error) return false
  return true
}

// for hobex webhook

export const getHobexSecret = async (req, clientId) => {
  const { error, data } = await find({
    db: req.db,
    collection: 'dataSources',
    find: { clientId, hobexSecret: { $exists: true } },
  })
  if (!data || error) return null
  return data[0]
}

// for iiQ data cache

export const findIiqCachedRecord = async (req, iiqData) => {
  const { error, data } = await find({
    db: req.db,
    collection: 'iiqcached',
    find: { clientId: iiqData.clientId, domainId: iiqData.domainId },
    limit: 1,
  })
  if (!data || error) return null
  return data
}

export const createIiqCacheRecord = async (req, iiqData) => {
  const { error, data } = await insert({ db: req.db, collection: 'iiqcached', document: iiqData })
  if (!data || error) return null
  return true
}

export const updateIiqCachedRecord = async (req, iiqData) => {
  const { error, data } = await update({
    db: req.db,
    collection: 'iiqcached',
    query: { clientId: iiqData.clientId, domainId: iiqData.domainId },
    document: { $set: iiqData },
  })
  if (!data || error) return null
  return true
}

// To get parking checkout details
// export const getParkingCheckout = async (req, params) => {
//   const { fromDate, toDate } = params
//   const { error, data } = await find({
//     db: req.db,
//     collection: 'parkingCheckout',
//     find: {
//       fromDate,
//       toDate,
//     },
//   })
//   if (!data || error) return null
//   return data
// }

export const getParkingDetails = async (req, fromDate, toDate) => {
  let response = {}
  let filter = {
    createdAt: { $gte: new Date(fromDate + 'T00:00:00.000Z'), $lte: new Date(toDate + 'T23:59:59.999Z') },
    paymentStatus: 'success',
  }
  response.dailySold = await req.db.collection('parkingCheckout').countDocuments(filter)
  filter = { toDate: { $gte: fromDate + 'T00:00:00.000Z', $lte: toDate + 'T23:59:59.999Z' }, paymentStatus: 'success' }
  response.dailyEntrance = await req.db.collection('parkingCheckout').countDocuments(filter)
  let sum = await req.db
    .collection('parkingCheckout')
    .aggregate([
      {
        $match: {
          $and: [
            { toDate: { $gte: fromDate + 'T00:00:00.000Z' } },
            { toDate: { $lte: toDate + 'T23:59:59.999Z' } },
            { paymentStatus: 'success' },
          ],
        },
      },
      { $group: { _id: null, sum: { $sum: '$price' } } },
    ])
    .toArray()
  response.totalAmount = sum[0] ? sum[0].sum : 0
  response.dailyExid = response.dailyEntrance
  filter = {
    toDate: { $gte: fromDate + 'T00:00:00.000Z', $lte: toDate + 'T23:59:59.999Z' },
    voucherCode: '20',
    paymentStatus: 'success',
  }
  response.voucherCount = await req.db.collection('parkingCheckout').countDocuments(filter)
  filter = {
    toDate: { $gte: fromDate + 'T00:00:00.000Z', $lte: toDate + 'T23:59:59.999Z' },
    voucherCode: '00',
    paymentStatus: 'success',
  }
  response.dailyCount = await req.db.collection('parkingCheckout').countDocuments(filter)
  return response
}

export const getCustomer = async (req) => {
  let sort = {}
  sort[req.query.sortField] = Number(req.query.sortValue)
  let expr = (req.query.reqSearch && req.query.reqSearch.trim().replace(/ /g, '.*|.*')) || ''
  expr = `.*${expr}.*`
  let searchRegex = { $regex: expr, $options: 'i' }
  let data = await req.db
    .collection('parkingCheckout')
    .aggregate([
      {
        $group: {
          _id: {
            email: '$email',
          },
          doc: { $first: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          count: '$count',
          email: '$_id.email',
          name: '$doc.name',
          surname: '$doc.surname',
          purpose: '$doc.purpose',
          inspiration: '$doc.inspiration',
          nationality: '$doc.nationality',
          phone: '$doc.phone',
          tnc: '$doc.tnc',
          commercial: '$doc.commercial',
          language: '$doc.language',
          voucherCode: '$doc.voucherCode',
          createdAt: '$doc.createdAt',
        },
      },
      {
        $match: {
          $or: [
            { name: searchRegex },
            { surname: searchRegex },
            { phone: searchRegex },
            { email: searchRegex },
            { purpoe: searchRegex },
            { nationality: searchRegex },
          ],
        },
      },
      {
        $sort: sort,
      },
      {
        $skip: Number(req.query.reqOffset),
      },
      {
        $limit: Number(req.query.reqLimit),
      },
    ])
    .toArray()
  let total = await req.db
    .collection('parkingCheckout')
    .aggregate([
      {
        $group: {
          _id: {
            email: '$email',
          },
          doc: { $first: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          count: '$count',
          email: '$_id.email',
          name: '$doc.name',
          surname: '$doc.surname',
          purpose: '$doc.purpose',
          inspiration: '$doc.inspiration',
          nationality: '$doc.nationality',
          phone: '$doc.phone',
          tnc: '$doc.tnc',
          commercial: '$doc.commercial',
          language: '$doc.language',
          voucherCode: '$doc.voucherCode',
        },
      },
      {
        $match: {
          $or: [
            { name: searchRegex },
            { surname: searchRegex },
            { phone: searchRegex },
            { email: searchRegex },
            { purpoe: searchRegex },
            { nationality: searchRegex },
          ],
        },
      },
      {
        $count: 'count',
      },
    ])
    .toArray()
  var finalTotal = total[0] ? total[0].count : 0
  return { data: data, total: finalTotal }
}

export const getTransactions = async (req) => {
  let sort = {}
  sort[req.query.sortField] = Number(req.query.sortValue)
  let expr = (req.query.reqSearch && req.query.reqSearch.trim().replace(/ /g, '.*|.*')) || ''
  expr = `.*${expr}.*`
  let searchRegex = { $regex: expr, $options: 'i' }
  let data = await req.db
    .collection('parkingCheckout')
    .aggregate([
      {
        $group: {
          _id: {
            transactionId: '$transactionId',
          },
          doc: { $last: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          transactionId: '$_id.transactionId',
          transactionLog: '$doc.transactionLog',
          paymentStatus: '$doc.paymentStatus',
          parkingCode: '$doc.parkingCode',
          fareId: '$doc.fareId',
          voucherCode: '$doc.voucherCode',
          price: '$doc.price',
          refundTransactionId: '$doc.refundTransactionId',
          refundTransactionLog: '$doc.refundTransactionLog',
          htmlEmails: '$doc.htmlEmails',
          createdAt: '$doc.createdAt',
        },
      },
      {
        $match: {
          $or: [
            { transactionId: searchRegex },
            { paymentStatus: searchRegex },
            { parkingCode: searchRegex },
            { fareId: searchRegex },
            { price: searchRegex },
            { refundTransactionId: searchRegex },
          ],
        },
      },
      {
        $sort: sort,
      },
      {
        $skip: Number(req.query.reqOffset),
      },
      {
        $limit: Number(req.query.reqLimit),
      },
    ])
    .toArray()
  let total = await req.db
    .collection('parkingCheckout')
    .aggregate([
      {
        $group: {
          _id: {
            transactionId: '$transactionId',
          },
          doc: { $last: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          transactionId: '$_id.transactionId',
          transactionLog: '$doc.transactionLog',
          paymentStatus: '$doc.paymentStatus',
          parkingCode: '$doc.parkingCode',
          fareId: '$doc.fareId',
          voucherCode: '$doc.voucherCode',
          price: '$doc.price',
          refundTransactionId: '$doc.refundTransactionId',
          refundTransactionLog: '$doc.refundTransactionLog',
        },
      },
      {
        $match: {
          $or: [
            { transactionId: searchRegex },
            { paymentStatus: searchRegex },
            { parkingCode: searchRegex },
            { fareId: searchRegex },
            { price: searchRegex },
            { refundTransactionId: searchRegex },
          ],
        },
      },
      {
        $count: 'count',
      },
    ])
    .toArray()
  var finalTotal = total[0] ? total[0].count : 0
  return { data: data, total: finalTotal }
}

// config
export const getConfigRecord = async (req, name) => {
  return await req.db.collection('config').findOne({ name })
}

export const createConfigRecord = async (req, configData) => {
  const { error, data } = await insert({ db: req.db, collection: 'config', document: configData })
  if (!data || error) return null
  return true
}

export const updateConfigData = async (req, name, configData) => {
  const { error, data } = await update({
    db: req.db,
    collection: 'config',
    query: { name },
    document: { $set: configData },
    options: { returnOriginal: false, upsert: true },
  })

  if (!data || error) return null
  return true
}

export const saveApiLogs = async (req, logs) => {
  const { error, data } = await insert({ db: req.db, collection: 'applicationLogs', document: logs })
  if (!data || error) return null
  return true
}

/**
 * To Add VMTS voucher checkout entry into productVmtsVouchers collection
 * @param {Object} req request object
 * @param {Object} checkout data of checkout
 */
export const addVmtsVoucherCheckout = async (req, checkout) => {
  const { error, data } = await insert({ db: req.db, collection: 'productVmtsVouchers', document: checkout })
  if (!data || error) return null
  return data
}

/**
 * To Get VMTS voucher checkout data
 * @param {Object} req request object
 * @param {Object} query query to find document
 */
export const getVmtsVoucherCheckout = async (req, query) => {
  const { error, data } = await find({ db: req.db, collection: 'productVmtsVouchers', find: query })
  if (!data || error) return null
  return data
}

/**
 * To Update VMTS voucher entry
 * @param {Object} req request object
 * @param {Object} query query to find document
 * @param {Object} voucher data of checkout
 */
export const updateVmtsVoucher = async (req, query, voucher) => {
  const { error, data } = await update({
    db: req.db,
    collection: 'productVmtsVouchers',
    query: query,
    document: { $set: voucher },
  })
  if (!data || error) return null
  return data
}

// payment widget
export const getAllPaymentRecords = async (req) => {
  const { error, data } = await find({ db: req.db, collection: 'paymentWidget' })
  if (!data || error) return null
  return data
}
export const createPaymentRecord = async (req, document) => {
  const { error, data } = await insert({ db: req.db, collection: 'paymentWidget', document })
  if (error) return { error }
  return { data }
}

export const updatePaymentRecord = async (req, id, paymentData) => {
  const { error, data } = await update({
    db: req.db,
    collection: 'paymentWidget',
    query: { _id: id },
    document: { $set: paymentData },
    options: { returnOriginal: false, upsert: true },
  })
  if (error) return { error }
  return { data }
}

/**
 * To Get Payment records by payment widget
 * @param {Object} req request object
 * @param {Object} query query to find document
 */
export const getPaymentRecords = async (req, query) => {
  const { error, data } = await find({ db: req.db, collection: 'paymentWidget', find: query })
  if (!data || error) return null
  return data
}

/**
 * To Update Payment checkout entry
 * @param {Object} req request object
 * @param {Object} query query to find document
 * @param {Object} checkout data of checkout
 */
export const updatePaymentRecords = async (req, query, checkout) => {
  const { error, data } = await update({
    db: req.db,
    collection: 'paymentWidget',
    query: query,
    document: { $set: checkout },
  })
  if (!data || error) return null
  return data
}

export const getClientCredientals = async (req, domain, client, dataSource) => {
  const data = await getClientDataSource(req, domain, client, dataSource)
  return data ? data : null
}

/**
 * To Revert any hobex payment done.
 * @param {Object} req request object
 * @param {Object} options options :{amount, currency, checkoutId, test:true|false }
 * @param {string} clientId clientId
 * @param {string} origin origin of request i.e req.headers.origin
 */
export const revertHobexPayment = async (req, options, clientId, origin) => {
  const getClientCredientals = async (req, domain, client, dataSource) => {
    const data = await getClientDataSource(req, domain, client, dataSource)
    return data ? data : null
  }
  // find client credientals
  const credientals =
    clientId &&
    (await getClientCredientals(
      req,
      options.test ? 'mts-online.com' : origin,
      options.test ? 'u0000' : clientId,
      'hobex',
    ))

  const createBodyString = (options) =>
    Object.entries(options).reduce((acc, [key, value], i) => {
      return `${acc}${key}=${value}${Object.entries(options).length !== i + 1 ? '&' : ''}`
    }, '')

  const bodyString = createBodyString({
    entityId: credientals.entityId,
    amount: parseFloat(options.amount).toFixed(2).toString(),
    currency: options.currency || 'EUR',
    paymentType: 'RF',
  })
  // console.log(bodyString)
  const testHobexUrl = `https://eu-test.oppwa.com/v1/payment/${options.checkoutId}`
  const liveHobexUrl = `https://oppwa.com/v1/payment/${options.checkoutId}`

  const transaction = await fetch(options.test ? testHobexUrl : liveHobexUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${credientals.password}`,
      // Authorization: 'Bearer OGE4Mjk0MTg1MzBkZjFkMjAxNTMxMjk5ZTJjMTE3YWF8ZzJnU3BnS2hLUw==',
    },
    body: bodyString,
  })
  return await transaction.json()
}

/**
 * To Get all clients having particular widget.
 * @param {Object} req request object
 * @param {string} module Name of the widget
 * @param {string} version widget version
 */
export const getClientsByWidget = async (req, module, version) => {
  if (version) {
    const { error, data } = await find({
      db: req.db,
      find: { module, version },
      collection: 'contents',
    })

    const clients = data.map((content) => {
      return content.blockProps.clientId
    })

    if (!data || error) return null
    return clients
  } else {
    const { error, data } = await find({
      db: req.db,
      find: { module },
      collection: 'contents',
    })

    const clients = data.map((content) => {
      return content.blockProps.clientId
    })

    if (!data || error) return null
    return clients
  }
}

/**
 * To Add Ticket checkout entry into productTicketBookings collection
 * @param {Object} req request object
 * @param {Object} checkout data of checkout
 */
export const addTicketCheckout = async (req, checkout) => {
  const { error, data } = await insert({ db: req.db, collection: 'productTicketBookings', document: checkout })
  if (!data || error) return null
  return data
}

/**
 * To Get Ticket booking checkout data
 * @param {Object} req request object
 * @param {Object} query query to find document
 */
export const getTicketCheckout = async (req, query) => {
  const { error, data } = await find({ db: req.db, collection: 'productTicketBookings', find: query })
  if (!data || error) return null
  return data
}

/**
 * To Update Ticket booking entry
 * @param {Object} req request object
 * @param {Object} query query to find document
 * @param {Object} ticket data of checkout
 */
export const updateTicketCheckout = async (req, query, ticket) => {
  const { error, data } = await update({
    db: req.db,
    collection: 'productTicketBookings',
    query: query,
    document: { $set: ticket },
  })
  if (!data || error) return null
  return data
}

export const getWidgetPageTree = async (req, domainId, widgetName) => {
  const { error, data } = await find({
    db: req.db,
    collection: 'pageTrees',
    find: {
      domainId: ObjectId(domainId),
      'draft.pages': { $elemMatch: { modules: { $elemMatch: { name: widgetName } } } },
    },
  })
  if (!data || error) return null
  return data
}

export const deleteWidgetPageTree = async (req, domainId, widgetName) => {
  const { error: getDraftError, data: getDraftData } = await find({
    db: req.db,
    collection: 'pageTrees',
    find: {
      domainId: ObjectId(domainId),
      'draft.pages': { $elemMatch: { modules: { $elemMatch: { name: widgetName } } } },
    },
  })

  const getPublishedData =
    getDraftData &&
    getDraftData[0]?.published?.pages?.filter((page) => page?.modules.filter((mod) => mod.name === widgetName))

  if (getDraftData && getDraftData.length > 0) {
    if (getPublishedData && getPublishedData.length > 0) {
      const { error, data } = await update({
        db: req.db,
        collection: 'pageTrees',
        query: {
          domainId: ObjectId(domainId),
        },
        document: {
          $pull: {
            'draft.pages.$[].modules': { name: widgetName },
            'published.pages.$[].modules': { name: widgetName },
          },
        },
        options: { returnOriginal: false },
        multi: true,
      })
      if (!data || error) {
        return error
      }
      return data
    } else {
      const { error, data } = await update({
        db: req.db,
        collection: 'pageTrees',
        query: {
          domainId: ObjectId(domainId),
        },
        document: {
          $pull: {
            'draft.pages.$[].modules': { name: widgetName },
          },
        },
        options: { returnOriginal: false },
        multi: true,
      })
      if (!data || error) {
        return error
      }
      return data
    }
  } else {
    return 1
  }
}

// Skyalps functions STARTS

export const createSkyalpsRecord = async (req, interfaceData) => {
  const { error, data } = await insert({ db: req.db, collection: 'skyalps', document: interfaceData })
  if (!data || error) return null
  return true
}

export const getSkyalpsData = async (req, clientId) => {
  const { error, data } = await find({ db: req.db, collection: 'skyalps', find: { clientId: clientId }, limit: 1 })
  if (!data || error) return null
  return data
}

export const getSkyalpsKognitivHotelCodeMappings = async (req, kognitivHotelCode) => {
  const { error, data } = await find({ db: req.db, collection: 'skyalps', find: { kognitivHotelCode }, limit: 1 })
  if (!data || error) return null
  return data
}

export const getAllSkyalpsRecords = async (req) => {
  const { error, data } = await find({ db: req.db, collection: 'skyalps' })
  if (!data || error) return null
  return data
}

export const updateSkyalpsData = async (req, clientId, skyalpsData) => {
  const { error, data } = await update({
    db: req.db,
    collection: 'skyalps',
    query: { clientId: clientId },
    document: { $set: skyalpsData },
  })
  if (!data || error) return null
  return true
}

export const deleteSkyalpsData = async (req, clientId) => {
  const { error, data } = await remove({
    db: req.db,
    collection: 'skyalps',
    document: {
      clientId: clientId,
    },
  })
  if (!data || error) return null
  return true
}

export const createSkyalpsErrorRecord = async (req, errorData) => {
  const { error, data } = await insert({ db: req.db, collection: 'skyalpsErrors', document: errorData })
  if (!data || error) return null
  return true
}

// Skyalps functions END
