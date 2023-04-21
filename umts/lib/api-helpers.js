import { slugify } from './utils.js'
import { find } from '../lib/mongoHelpers'

const extractUser = (req) => {
  if (!req.user) return null
  // console.log(req.user)
  const { _id, name, email, superadmin, status, emailVerified } = req.user
  const roles = superadmin && !req.user.roles ? [{ domain: '*', role: 'admin' }] : req.user.roles
  const clients = superadmin && !req.user.clients ? ['*'] : req.user.clients
  return {
    _id,
    clients,
    name,
    email,
    superadmin,
    roles,
    status,
    emailVerified,
  }
}

const extractUserDetail = (req) => {
  if (!req.user) return null
  // console.log(req.user)
  const { _id, name, email, superadmin, status, emailVerified } = req.user
  const roles = superadmin && !req.user.roles ? [{ domain: '*', role: 'admin' }] : req.user.roles
  const clients = superadmin && !req.user.clients ? ['*'] : req.user.clients
  return {
    _id,
    clients,
    name,
    email,
    superadmin,
    roles,
    status,
    emailVerified,
  }
}

const findDomainWithProducts = async (req, res, { client, productName, superadmin, roles, productNameI }) => {
  const domainWithProducts = await req.db
    .collection('domains')
    .aggregate([
      { $match: { products: { $elemMatch: { name: productNameI } } } },
      {
        $lookup: {
          from: 'clients',
          let: { domainId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$clientNumber', client] }, { $in: ['$$domainId', '$domains'] }],
                },
              },
            },
          ],
          as: 'clients',
        },
      },
    ])
    .toArray()

  // validate domain access right and the client
  const validDomain = authorizeDomain(domainWithProducts, superadmin, roles)
  const validClient = validDomain.clients?.find((c) => c.clientNumber === client)

  if (!validDomain || !validClient) {
    return {
      data: null,
      errorCode: 401,
      error: { error: 'Not authorized', product: null, domain: null, content: null },
    }
  } else {
    const product = validDomain.products?.find((p) => slugify(p.name) === slugify(productName))
    const { data: content, contentError } =
      product &&
      (await find({
        db: req.db,
        collection: 'content',
        find: {
          _id: { $in: product.contents },
        },
      }))
    if (contentError) {
      return {
        data: null,
        errorCode: 401,
        error: { error: contentError, product: null, domain: null, content: null },
      }
    }
    const { data: availableComponents, error: availableComponentsError } =
      product &&
      (await find({
        db: req.db,
        collection: 'library',
      }))
    if (availableComponentsError) {
      return {
        data: null,
        errorCode: 401,
        error: { error: availableComponentsError, product: null, domain: null, content: null },
      }
    }
    const result = {
      error: null,
      ...(product && { product }),
      ...(validClient && { client: validClient }),
      ...(validDomain && { domain: validDomain }),
      ...(content && { content }),
      ...(availableComponents && { availableComponents }),
    }
    return { error: null, data: result }
  }
}

const authorizeDomain = (domains, superadmin, roles) => {
  const domain = domains[0]
  if (superadmin && domain) {
    return domain
  } else if (domain && roles.map((r) => r.domain).includes(domain.url)) {
    return domain
  }
  return null
}

export { extractUser, extractUserDetail, findDomainWithProducts }
