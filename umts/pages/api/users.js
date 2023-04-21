import nextConnect from 'next-connect'
import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isLength'
import isMongoId from 'validator/lib/isMongoId'
import normalizeEmail from 'validator/lib/normalizeEmail'
import bcrypt from 'bcryptjs'
import middleware from '../../middlewares/middleware'
import protectedAPI from '../../middlewares/protectedAPI'
import ensureReqBody from '../../middlewares/ensureReqBody'
import { extractUser } from '../../lib/api-helpers'
import { insert } from '../../lib/mongoHelpers'
import { ObjectId } from 'mongodb'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

handler.get(async (req, res) => {
  const currentUser = extractUser(req)
  const { superadmin, roles, _id } = currentUser
  const domains = superadmin
    ? [{}]
    : roles.reduce((acc, d) => {
        if (d.role === 'admin') {
          return d.domain !== '*' ? [...acc, { roles: { $elemMatch: { domain: d.domain } } }] : [...acc, {}]
        } else return [...acc, { _id }]
      }, [])

  const {
    query: { req_limit, req_offset, req_sort, req_search, req_domain_url },
  } = req

  const name = { $regex: '.*' + req_search + '.*', $options: 'i' }

  if (req_limit) {
    const length = await req.db
      .collection('users')
      .find(
        {
          name: { $regex: '.*' + req_search + '.*', $options: 'i' },
          $or:
            req_domain_url && req_domain_url != 'undefined'
              ? [{ roles: { $elemMatch: { domain: req_domain_url } } }]
              : [{}],
        },
        { $and: domains },
      )
      .count()
    await req.db
      .collection('users')
      .find(
        {
          $and: [
            { $or: [{ name: name }, { email: name }] },
            {
              $or:
                req_domain_url && req_domain_url != 'undefined'
                  ? [{ roles: { $elemMatch: { domain: req_domain_url } } }]
                  : [{}],
            },
          ],
        },
        { $and: domains },
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
            users: result,
            length: length,
          })
        }
      })
  } else {
    await req.db
      .collection('users')
      .find({ $and: domains })
      .toArray((error, result) => {
        if (error) {
          res.status(500).json({ error, users: null })
        } else {
          const users = result.map(({ password, ...user }) => user)
          res.status(200).json({
            error: null,
            users,
          })
        }
      })
  }
})

handler.post(async (req, res) => {
  const {
    name,
    password,
    superadmin: targetRole = false,
    roles: targetRoles = [],
    clients: targetClients,
    status = false,
    token,
  } = req.body

  const currentUser = extractUser(req)
  const { superadmin, roles, clients } = currentUser

  const email = normalizeEmail(req.body.email, { gmail_remove_dots: false, gmail_remove_subaddress: false })

  const rolesForDomains =
    (targetRoles && roles && authorizeUserRoles(targetRoles, roles, superadmin, { superadmin: null })) || false

  if (!superadmin && !rolesForDomains) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }

  if (targetRoles && !rolesForDomains) {
    res.status(401).send({ error: 'Not authorized to add roles', user: null })
    return
  }

  if (targetClients && !Array.isArray(targetClients)) {
    res.status(400).send({ error: 'Clients must be a type of an array', user: null })
  }

  const validClients =
    (targetClients &&
      clients &&
      targetClients.every((client) => isMongoId(client)) &&
      authorizeUserClients(targetClients, clients, superadmin, user)) ||
    false

  if (!superadmin && !validClients) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }

  if (targetClients && !validClients) {
    res.status(401).send({ error: 'Not authorized to add clients', user: null })
    return
  }

  if (!isEmail(email)) {
    res.status(400).send({ error: 'The email you entered is invalid.', user: null })
    return
  }

  if (!password || !name || !'status' in req.body) {
    res.status(400).send({ error: 'Missing field(s)', user: null })
    return
  }

  if ('status' in req.body && typeof status !== 'boolean') {
    res.status(400).send({ error: 'Status must be a type of boolean', user: null })
    return
  }

  if (!isLength(password, { min: 6, max: 256 })) {
    res.status(400).send({ error: 'Password needs to be longer', user: null })
    return
  }

  if ((await req.db.collection('users').countDocuments({ email })) > 0) {
    res.status(403).send({ error: 'The email has already been used.', user: null })
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const _id = ObjectId()
  const document = {
    _id,
    email,
    password: hashedPassword,
    name,
    token,
    superadmin: targetRole,
    status,
    ...(rolesForDomains && { roles: rolesForDomains }),
    ...(validClients && { clients: targetClients }),
  }

  const { data: user, error: userError } = await insert({ db: req.db, collection: 'users', document })
  const { password: _password, ...userClean } = user || null

  res.status(201).send({
    error: null,
    user: userClean,
  })
})

handler.patch(async (req, res) => {
  const { name, status, roles: targetRoles, superadmin: targetRole, clients: targetClients, password, token } = req.body
  const _id = isMongoId(req.body._id) ? ObjectId(req.body._id) : null
  const email =
    req.body.email && normalizeEmail(req.body.email, { gmail_remove_dots: false, gmail_remove_subaddress: false })

  const currentUser = extractUser(req)
  const { superadmin, roles, clients } = currentUser

  if (!_id) {
    res.status(400).send({ error: 'Missing or non-valid _id field', user: null })
    return
  }

  if (targetRole && !superadmin) {
    res.status(401).send({ error: 'Not authorized to change role', user: null })
    return
  }

  const user = await req.db.collection('users').findOne({
    _id,
  })

  if (!user) {
    res.status(404).send({ error: 'No user found', user: null })
    return
  }

  const rolesForDomains = (targetRoles && roles && authorizeUserRoles(targetRoles, roles, superadmin, user)) || false
  if (targetRoles && !rolesForDomains) {
    res.status(401).send({ error: 'Not authorized to change roles', user: null })
    return
  }

  if ('status' in req.body && typeof status !== 'boolean') {
    res.status(400).send({ error: 'Status must be a type of boolean', user: null })
    return
  }

  if ('superadmin' in req.body && !superadmin) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }

  const validClients =
    (targetClients &&
      clients &&
      targetClients.every((client) => isMongoId(client)) &&
      authorizeUserClients(targetClients, clients, superadmin, user)) ||
    false

  if (targetClients && superadmin && !validClients) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }

  if (targetClients && !validClients) {
    res.status(401).send({ error: 'Not authorized to change clients', user: null })
    return
  }

  if (email && !isEmail(email)) {
    res.status(400).send({ error: 'The email you entered is invalid.', user: null })
    return
  }

  if (email && user.email !== email && (await req.db.collection('users').countDocuments({ email })) > 0) {
    res.status(403).send({ error: 'The email has already been used.', user: null })
    return
  }

  if (password && !isLength(password, { min: 6, max: 256 })) {
    res.status(400).send({ error: 'Password needs to be longer', user: null })
    return
  }

  const hashedPassword = password && (await bcrypt.hash(password, 10))

  const changes = {
    ...(name && { name }),
    ...(email && { email }),
    ...(token && { token }),
    ...('status' in req.body && { status }),
    ...(hashedPassword && { password: hashedPassword }),
    ...(rolesForDomains && { roles: rolesForDomains }),
    ...('superadmin' in req.body && { superadmin: targetRole }),
    ...(validClients && { clients: targetClients }),
  }

  if (Object.entries(changes).length === 0) {
    res.status(200).json({
      error: null,
      user,
    })
    return
  }

  await req.db.collection('users').findOneAndUpdate(
    { _id },
    {
      $set: changes,
    },
    { returnOriginal: false },
    function (error, { value }) {
      const { password, ...user } = value || null
      res.status(200).json({
        error,
        user,
      })
    },
  )
})

handler.delete(async (req, res) => {
  const currentUser = extractUser(req)
  const { superadmin, roles } = currentUser
  // console.log('deleting started 111')
  let result
  const { ids, isMul } = req.body
  if (isMul && isMul == true) {
    // console.log('deleting started 222')
    result = await req.db
      .collection('users')
      .deleteMany({ _id: { $in: ids.map((x) => ObjectId(x)) } })
      .then(({ result, deletedCount }) => {
        return result?.ok
          ? { deletedCount: deletedCount, error: null }
          : { deletedCount: 0, error: 'error deleting documents' }
      })
  } else {
    const _id = isMongoId(req.body._id) ? ObjectId(req.body._id) : null
    if (!_id) {
      res.status(400).send({ error: 'Missing or non-valid _id field', user: null })
      return
    }

    const user = await req.db.collection('users').findOne({
      _id,
    })

    if (!user) {
      res.status(404).send({ error: 'No user found', user: null })
      return
    }

    const rolesForDomains = (user.roles && roles && authorizeUserRoles(user.roles, roles, superadmin, user)) || false
    if (user.roles && !rolesForDomains) {
      res.status(401).send({ error: 'Not authorized to delete this user', user: null })
      return
    }

    result = await req.db.collection('users').deleteOne({ _id })
  }
  if (result && result.deletedCount > 0) {
    res.status(202).json({
      error: null,
      data: 'User removed',
    })
  } else {
    res.status(500).json({
      error: "Couldn't remove a user",
      data: null,
    })
  }
})

const authorizeUserRoles = (targetRoles, roles, superadmin, user) =>
  targetRoles.reduce((acc, r) => {
    const userDomain = roles.find((d) => d.domain === r.domain)
    if (!acc) return false
    if (superadmin || (userDomain && userDomain.role === 'admin' && !user.superadmin)) {
      return [...acc, r]
    } else return false
  }, [])

const authorizeUserClients = (targetClients, clients, superadmin) =>
  targetClients &&
  targetClients.reduce((acc, r) => {
    const userClient = clients.find((c) => c === r._id)
    if (!acc) return false
    if (superadmin || userClient) {
      return [...acc, r]
    } else return false
  }, [])

const authorizeRoleChange = (superadmin, targetRole) => (superadmin ? targetRole : false)

export default handler
