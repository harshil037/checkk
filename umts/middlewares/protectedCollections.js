import { collections, apiMethods } from '../config'
import { extractUser } from '../lib/api-helpers'
import isMongoId from 'validator/lib/isMongoId'

const protectedCollections = async (req, res, next) => {
  const {
    query: { collection, id },
  } = req

  const currentUser = extractUser(req)
  const { superadmin, roles, _id } = currentUser
  const domains = superadmin
    ? [{}]
    : roles.reduce((acc, d) => {
        if (d.role === 'admin') {
          return d.domain !== '*' ? [...acc, { roles: { $elemMatch: { domain: d.domain } } }] : [...acc, {}]
        } else return [...acc, { _id }]
      }, [])

  if (!collections.include(collection) || !apiMethods.include(id) || !isMongoId(id)) {
    res.status(401).json({ error: 'Not authorized', data: null })
  } else {
    next()
  }
}

export default protectedCollections
