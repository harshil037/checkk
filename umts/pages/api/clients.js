import nextConnect from 'next-connect'
import isURL from 'validator/lib/isURL'
import isEmail from 'validator/lib/isEmail'
import isMongoId from 'validator/lib/isMongoId'
import normalizeEmail from 'validator/lib/normalizeEmail'
import middleware from '../../middlewares/middleware'
import protectedAPI from '../../middlewares/protectedAPI'
import ensureReqBody from '../../middlewares/ensureReqBody'
import { extractUser, extractUserDetail } from '../../lib/api-helpers'
import { getDomains } from '../../lib/db'
import { ObjectId } from 'mongodb'
import { find } from '../../lib/mongoHelpers'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

const findClients = async (req, roles, superadmin) => {
  const userDomains = roles?.map((r) => r.domain)
  const domains = await getDomains(req, userDomains)
  const clientsQuery = domains?.map((d) => d._id)
  const matchedDomains = superadmin
    ? { $or: clientsQuery }
    : {
        $or: clientsQuery.reduce((acc, d) => {
          return [...acc, { domains: { $elemMatch: { $eq: ObjectId(d) } } }]
        }, []),
      }
  return { clientsQuery, matchedDomains }
}

handler.get(async (req, res) => {
  const {
    query: { req_limit, req_offset, req_sort, req_search, req_domainId, id },
  } = req

  const { superadmin, roles } = extractUserDetail(req)
  const { clientsQuery, matchedDomains } = !superadmin ? await findClients(req, roles, superadmin) : [{}]

  const getClientsWithPagination = async () => {
    const name = { $regex: '.*' + req_search + '.*', $options: 'i' }
    const length = await req.db
      .collection('clients')
      .find(
        {
          name: name,
          $or:
            req_domainId && req_domainId != 'undefined'
              ? clientsQuery.reduce((acc, d) => {
                  return [...acc, { domains: { $elemMatch: { $eq: ObjectId(req_domainId) } } }]
                }, [])
              : [{}],
        },
        { $or: matchedDomains },
      )
      .count()

    await req.db
      .collection('clients')
      .find(
        {
          $and: [
            { $or: [{ name: name }, { clientNumber: name }] },
            {
              $or:
                req_domainId && req_domainId != 'undefined'
                  ? clientsQuery.reduce((acc, d) => {
                      return [...acc, { domains: { $elemMatch: { $eq: ObjectId(req_domainId) } } }]
                    }, [])
                  : [{}],
            },
          ],
        },
        { $or: matchedDomains },
      )
      .collation({ locale: 'en' })
      .sort({ name: parseInt(req_sort) })
      .skip(parseInt(req_offset))
      .limit(parseInt(req_limit))
      .toArray((error, result) => {
        if (error) {
          res.status(500).json({ error, domains: null, length: 0 })
        } else {
          res.status(200).json({
            error: null,
            clients: result,
            length: length,
          })
        }
      })
  }

  const getDomainClient = async () => {
    const clients = await req.db
      .collection('clients')
      .find({ domains: { $elemMatch: { $eq: ObjectId(req_domainId) } } })
      .toArray()
    if (clients) {
      res.status(200).json({
        error: null,
        clients,
      })
    } else {
      res.status(200).json({})
    }
  }

  const getAllClients = async () => {
    const clients = await req.db.collection('clients').find(matchedDomains).toArray()
    if (clients) {
      res.status(200).json({
        error: null,
        clients,
      })
    } else {
      res.status(200).json({})
    }
  }
  const getSingleClient = async () => {
    if (isMongoId(id)) {
      res.json(await find({ db: req.db, collection: 'clients', find: { _id: ObjectId(id) }, limit: 1 }))
    } else {
      res.json(await find({ db: req.db, collection: 'clients', find: { clientNumber: id }, limit: 1 }))
    }
  }

  if (typeof id != 'undefined') {
    await getSingleClient()
  } else if (req_limit) {
    if (req_domainId != 'undefined') {
      await getDomainClient()
    } else {
      await getClientsWithPagination()
    }
  } else {
    await getAllClients()
  }
})

handler.post(async (req, res) => {
  const { name, clientNumber, contact, domains, languages, addresses, status = false } = req.body

  const currentUser = extractUser(req)
  const { superadmin, roles, clients } = currentUser

  if (!superadmin) {
    res.status(401).send({ error: 'Not authorized', client: null })
    return
  }

  const validContact = (contact && validateContact(contact)) || false

  if (contact && !validContact) {
    res.status(400).send({ error: 'The contact information you entered is invalid.', client: null })
    return
  }

  if (!clientNumber || !name || !'status' in req.body) {
    res.status(400).send({ error: 'Missing field(s)', client: null })
    return
  }

  if ('status' in req.body && typeof status !== 'boolean') {
    res.status(400).send({ error: 'Status must be a type of boolean', user: null })
    return
  }

  if ((await req.db.collection('clients').countDocuments({ clientNumber })) > 0) {
    res.status(403).send({ error: 'The ClientID has already been used.', client: null })
    return
  }

  if ((await req.db.collection('clients').countDocuments({ name })) > 0) {
    res.status(403).send({ error: 'The client name has already been used.', client: null })
    return
  }

  if (domains && !Array.isArray(domains)) {
    res.status(400).send({ error: 'No valid Domains array provided', client: null })
    return
  }

  const validDomains = domains && domains.every((domain) => isMongoId(domain))

  if (domains && !validDomains) {
    res.status(400).send({ error: 'No valid Domains array provided', client: null })
    return
  }

  const client = await req.db
    .collection('clients')
    .insertOne({
      name,
      clientNumber,
      ...(validDomains && { domains: domains.map((d) => ObjectId(d)) }),
      ...(validDomains && { dataSources: [] }),
      ...(validContact && { contact: validContact }),
      ...(languages && { languages }),
      ...(addresses && { addresses }),
      ...('status' in req.body && { status }),
    })
    .then(({ ops }) => ops[0])

  res.status(201).json({
    error: null,
    client,
  })
})

handler.patch(async (req, res) => {
  const { status, name, clientNumber, languages, addresses, contact, domains, dataSources } = req.body
  const _id = isMongoId(req.body._id) ? ObjectId(req.body._id) : null
  const currentUser = extractUser(req)
  const { superadmin } = currentUser

  if (!_id) {
    res.status(400).send({ error: 'Missing _id field', client: null })
    return
  }

  if (!superadmin) {
    res.status(401).send({ error: 'Not authorized', client: null })
    return
  }

  const validContact = (contact && validateContact(contact)) || false

  if (contact && !validContact) {
    res.status(400).send({ error: 'The contact information you entered is invalid.', client: null })
    return
  }

  const client = await req.db.collection('clients').findOne({
    _id,
  })

  if (!client) {
    res.status(404).send({ error: 'No client found', client: null })
    return
  }

  if ('status' in req.body && typeof status !== 'boolean') {
    res.status(400).send({ error: 'Status must be a type of boolean', user: null })
    return
  }

  if (
    clientNumber &&
    clientNumber !== client.clientNumber &&
    (await req.db.collection('clients').countDocuments({ clientNumber })) > 0
  ) {
    res.status(403).send({ error: 'The ClientID has already been used.', client: null })
    return
  }

  if (name && name !== client.name && (await req.db.collection('clients').countDocuments({ name })) > 0) {
    res.status(403).send({ error: 'The client name has already been used.', client: null })
    return
  }

  if (domains && !Array.isArray(domains)) {
    res.status(400).send({ error: 'No valid Domains array provided', client: null })
    return
  }

  const validDomains = domains && domains.every((domain) => isMongoId(domain))

  if (domains && !validDomains) {
    res.status(400).send({ error: 'No valid Domains array provided', client: null })
    return
  }

  const changes = {
    ...(name && { name }),
    ...(clientNumber && { clientNumber }),
    ...(languages && { languages }),
    ...(addresses && { addresses }),
    ...('status' in req.body && { status }),
    ...(validContact && { contact: validContact }),
    ...(validDomains && { domains: domains.map((d) => ObjectId(d)) }),
  }

  if (Object.entries(changes).length === 0) {
    res.status(200).json({
      error: null,
      user,
    })
    return
  }

  await req.db.collection('clients').findOneAndUpdate(
    { _id },
    {
      $set: changes,
    },
    { returnOriginal: false },
    function (error, { value }) {
      res.status(200).json({
        error,
        client: value,
      })
    },
  )
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
      .collection('clients')
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
    const client = await req.db.collection('clients').findOne({
      _id,
    })
    if (!client) {
      res.status(404).send({ error: 'No client found', domain: null })
      return
    }
    delResult = await req.db.collection('clients').deleteOne({ _id })
  }

  if (delResult.deletedCount > 0) {
    res.status(202).json({
      error: null,
      data: 'Client removed',
    })
  } else {
    res.status(500).json({
      error: "Couldn't remove a client",
      data: null,
    })
  }
})

const validateContact = (contact) => {
  const validEmail =
    (contact?.email &&
      isEmail(contact.email) &&
      normalizeEmail(contact.email, { gmail_remove_dots: false, gmail_remove_subaddress: false })) ||
    false
  const validUrl = (contact?.url && isURL(contact.url) && contact.url) || false
  const validPhone = contact?.phone || false
  return {
    ...(validEmail && { email: validEmail }),
    ...(validPhone && { phone: validPhone }),
    ...(validUrl && { url: validUrl }),
  }
}

export default handler
