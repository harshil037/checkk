import nextConnect from 'next-connect'
import isEmail from 'validator/lib/isEmail'
import isMongoId from 'validator/lib/isMongoId'
import isURL from 'validator/lib/isURL'
import normalizeEmail from 'validator/lib/normalizeEmail'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import anonymousAPI from '../../../middlewares/anonymousAPI'
import ensureReqBody from '../../../middlewares/ensureReqBody'
import { extractUser } from '../../../lib/api-helpers'
import { addProductDataSource } from '../../../lib/db'
import { ObjectId } from 'mongodb'
import { remove } from '../../../lib/mongoHelpers'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(anonymousAPI)
  .use(protectedAPI)
  .use(ensureReqBody)

handler.get(async (req, res) => {
  const currentUser = extractUser(req)

  const { superadmin, roles } = currentUser
  const domains = superadmin ? [{}] : roles.map((r) => ({ url: r.domain })).filter((r) => r !== null)

  if (domains.length > 0) {
    const {
      query: { req_limit, req_offset, req_sort, req_search, req_clientId },
    } = req

    if (req_limit) {
      if (req_search != '' || (req_clientId != '' && req_clientId != 'undefined')) {
        const tempC = await req.db.collection('clients').find({ name: req_clientId }).toArray()

        const tempD = await req.db
          .collection('domains')
          .find(
            { $or: domains },
            {
              url: { $regex: '.*' + req_search + '.*', $options: 'i' },
            },
          )
          .collation({ locale: 'en' })
          .sort({ url: parseInt(req_sort) })
          .toArray()
        let finalDomains = []
        finalDomains = tempD.filter(
          (x) =>
            (tempC.length > 0 && tempC[0]?.domains.toString().includes(x._id)) ||
            (req_search && x.url.toLowerCase().toString().includes(req_search.toLowerCase())),
        )

        res.status(200).json({
          error: null,
          domains: finalDomains.slice(parseInt(req_offset), parseInt(req_offset) + parseInt(req_limit)),
          length: finalDomains.length,
        })
      } else {
        const length = await req.db.collection('domains').find({ $or: domains }).count()
        await req.db
          .collection('domains')
          .find({ $or: domains })
          .collation({ locale: 'en' })
          .sort({ url: parseInt(req_sort) })
          .skip(parseInt(req_offset))
          .limit(parseInt(req_limit))
          .toArray((error, result) => {
            if (error) {
              res.status(500).json({ error, domains: null, length: 0 })
            } else {
              res.status(200).json({
                error: null,
                domains: result,
                length: length,
              })
            }
          })
      }
    } else {
      await req.db
        .collection('domains')
        .find({ $or: domains })
        .collation({ locale: 'en' })
        .sort({ url: 1 })
        .toArray((error, result) => {
          if (error) {
            res.status(500).json({ error, domains: null })
          } else {
            res.status(200).json({
              error: null,
              domains: result,
            })
          }
        })
    }
  } else
    res.status(200).json({
      error: null,
      domains: [],
    })
})

handler.post(async (req, res) => {
  const {
    url,
    name,
    emails,
    products,
    aliases,
    status = false,
    restrictions,
    roomsConfig = [],
    languages = ['en', 'de', 'it'],
    styles,
  } = req.body

  const currentUser = extractUser(req)
  const { superadmin } = currentUser

  const validEmails = (emails && validateEmails(emails)) || false

  if (emails && !validEmails) {
    res.status(400).send({ error: 'The email you entered is invalid.', domain: null })
    return
  }

  if (!url || !name || !'status' in req.body) {
    res.status(400).send({ error: 'Missing field(s)', domain: null })
    return
  }

  if ('status' in req.body && typeof status !== 'boolean') {
    res.status(400).send({ error: 'Status must be a type of boolean', user: null })
    return
  }

  if (products && !Array.isArray(products)) {
    res.status(400).send({ error: 'No valid Products array provided', client: null })
    return
  }

  if (restrictions && !Array.isArray(restrictions)) {
    res.status(400).send({ error: 'No valid restrictions array provided', client: null })
    return
  }

  if (!url || !isURL(url)) {
    res.status(400).send({ error: 'No valid URL provided', domain: null })
    return
  }

  if (!superadmin) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }

  if ((await req.db.collection('domains').countDocuments({ url })) > 0) {
    res.status(403).send({ error: 'The URL has already been used.', domain: null })
    return
  }

  const domain = await req.db
    .collection('domains')
    .insertOne({
      url,
      name,
      status,
      ...(products && { products }),
      ...(validEmails && { emails: validEmails }),
      aliases: aliases && aliases.filter((x) => x != '').length > 0 ? aliases.filter((x) => x != '') : [],
      ...(restrictions && { restrictions }),
      roomsConfig,
      languages,
      styles,
    })
    .then(({ ops }) => ops[0])

  res.status(201).json({
    error: null,
    domain,
  })
})

handler.patch(async (req, res) => {
  const { status, url, name, emails } = req.body
  let {
    products,
    productId,
    dataSource,
    objNote,
    addressItems,
    restrictions,
    roomsConfig = [],
    languages = ['en', 'de', 'it'],
    styles,
  } = req.body
  let { aliases } = req.body

  const _id = isMongoId(req.body._id) ? ObjectId(req.body._id) : null

  // this will convert contents id from string to ObjectId.
  let newProducts = products?.map((item) => {
    let newItem = item

    if (newItem.pageTree)
      newItem.pageTree = typeof newItem.pageTree === 'object' ? newItem.pageTree : ObjectId(newItem.pageTree)

    if (newItem.dataSource) {
      newItem.dataSource = typeof newItem.dataSource === 'object' ? newItem.dataSource : ObjectId(newItem.dataSource)
    }

    if (newItem.contentId) {
      newItem.contentId = typeof newItem.contentId === 'object' ? newItem.contentId : ObjectId(newItem.contentId)
    }

    return newItem
  })

  // storing new products data with object id.
  products = newProducts

  const currentUser = extractUser(req)
  const { superadmin, roles } = currentUser

  if (!_id) {
    res.status(400).send({ error: 'Missing _id field', domains: null })
    return
  }

  if (!superadmin) {
    res.status(401).send({ error: 'Not authorized', domains: null })
    return
  }

  if ('status' in req.body && typeof status !== 'boolean') {
    res.status(400).send({ error: 'Status must be a type of boolean', user: null })
    return
  }

  if (products && !Array.isArray(products)) {
    res.status(400).send({ error: 'No valid Products array provided', client: null })
    return
  }

  if (restrictions && !Array.isArray(restrictions)) {
    res.status(400).send({ error: 'No valid restrictions array provided', client: null })
    return
  }

  const domain = await req.db.collection('domains').findOne({
    _id,
  })

  if (!domain) {
    res.status(404).send({ error: 'No domain found', domain: null })
    return
  }

  const validEmails = (emails && validateEmails(emails)) || false

  if (emails && !validEmails) {
    res.status(400).send({ error: 'The email you entered is invalid.', domain: null })
    return
  }

  if (url && !isURL(url)) {
    res.status(400).send({ error: 'No valid URL provided', domain: null })
    return
  }

  if (url && domain.url !== url && (await req.db.collection('domains').countDocuments({ url })) > 0) {
    res.status(403).send({ error: 'The URL has already been used.', domain: null })
    return
  }

  if (!objNote) {
    const changes = {
      ...('status' in req.body && { status }),
      ...(url && { url }),
      ...(name && { name }),
      ...(products && { products }),
      ...(addressItems && { addressItems }),
      ...(typeof req.body.aliases != 'undefined' && {
        aliases:
          aliases && aliases.filter((x) => x.trim() != '').length > 0 ? aliases.filter((x) => x.trim() != '') : [],
      }),
      ...(validEmails && { emails: validEmails }),
      ...(restrictions && { restrictions }),
      roomsConfig,
      languages,
      styles,
    }

    if (Object.entries(changes).length === 0) {
      res.status(200).json({
        error: null,
        domain,
      })
      return
    }

    await req.db.collection('domains').findOneAndUpdate(
      { _id },
      {
        $set: changes,
      },
      { returnOriginal: false },
      async function (error, { value }) {
        if (!error && productId) {
          const product = newProducts.find((x) => x._id == productId)
          await addProductDataSource(req, product, dataSource)
        }
        res.status(200).json({
          error,
          domain: value,
        })
      },
    )
  } else {
    let tempNotes = domain?.notes || []

    if (tempNotes.filter((item) => item.id == objNote.note.id).length > 0) {
      const tempIndex = tempNotes.findIndex((item) => item.id == objNote.note.id)

      if (objNote.isDelete) {
        tempNotes.splice(tempIndex, 1)
      } else {
        tempNotes[tempIndex] = objNote.note
      }
    } else {
      tempNotes.push(objNote.note)
    }
    const changes = {
      notes: tempNotes,
    }
    await req.db.collection('domains').findOneAndUpdate(
      { _id },
      {
        $set: changes,
      },
      { returnOriginal: false },
      async function (error, { value }) {
        res.status(200).json({
          error,
          domain: value,
        })
      },
    )
  }
})

handler.delete(async (req, res) => {
  const currentUser = extractUser(req)
  const { superadmin } = currentUser

  if (!superadmin) {
    res.status(401).send({ error: 'Not authorized', domain: null })
    return
  }

  let delResult
  const { ids, isMul } = req.body
  if (isMul && isMul == true) {
    delResult = await req.db
      .collection('domains')
      .deleteMany({ _id: { $in: ids.map((x) => ObjectId(x)) } })
      .then(({ result, deletedCount }) => {
        return result?.ok
          ? { deletedCount: deletedCount, error: null }
          : { deletedCount: 0, error: 'error deleting documents' }
      })
  } else {
    const _id = isMongoId(req.body._id) ? ObjectId(req.body._id) : null

    if (!_id) {
      res.status(400).send({ error: 'Missing or non-valid _id field', domain: null })
      return
    }

    const refClients = await req.db
      .collection('clients')
      .find({ domains: ObjectId(_id) })
      .toArray()

    if (refClients.length > 0) {
      res.status(400).send({
        error: 'Can not delete, reference found in client ... ' + refClients.map((x) => x.name)?.toString(),
        domain: null,
      })
      return
    }

    const domain = await req.db.collection('domains').findOne({
      _id,
    })

    if (!domain) {
      res.status(404).send({ error: 'No domain found', domain: null })
      return
    }
    delResult = await req.db.collection('domains').deleteOne({ _id })
    if (delResult.deletedCount > 0) {
      if (domain.products && domain.products.length > 0) {
        domain.products.map(async (product) => {
          // delete widget content
          if (product?.contentId) {
            let delResult = await remove({
              db: req.db,
              collection: 'contents',
              document: { _id: Object(product?.contentId) },
            })
            if (delResult.error) {
              res.status(404).send({ error: 'error updating documents' })
            }
          }

          // delete website page tree
          if (product?.pageTree) {
            let delResult = await remove({
              db: req.db,
              collection: 'pageTrees',
              document: { _id: Object(product?.pageTree) },
            })
            if (delResult.error) {
              res.status(404).send({ error: 'error updating documents' })
            }
          }

          // delete product datasource
          if (product?.dataSource) {
            let delResult = await remove({
              db: req.db,
              collection: 'dataSources',
              document: { _id: Object(product?.dataSource) },
            })
            if (delResult.error) {
              res.status(404).send({ error: 'error updating documents' })
            }
          }
        })
      }
    }
  }
  if (delResult.deletedCount > 0) {
    res.status(202).json({
      error: null,
      data: 'Domain removed',
    })
  } else {
    res.status(500).json({
      error: "Couldn't remove a domain",
      data: null,
    })
  }
})

const validateEmails = (emails) => {
  return emails.reduce((acc, email) => {
    const { name, address, from, to } = email
    if (!acc) return false
    if (!address || !isEmail(address)) return false
    if (from && !isEmail(from)) return false
    if (to && !isEmail(to)) return false
    return [
      ...acc,
      {
        name,
        ...(address && {
          address: normalizeEmail(address, { gmail_remove_dots: false, gmail_remove_subaddress: false }),
        }),
        ...(from && { from: normalizeEmail(from, { gmail_remove_dots: false, gmail_remove_subaddress: false }) }),
        ...(to && { to: normalizeEmail(to, { gmail_remove_dots: false, gmail_remove_subaddress: false }) }),
      },
    ]
  }, [])
}

export default handler
