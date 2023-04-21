import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import protectedAPI from '../../../../../middlewares/protectedAPI'
import anonymousAPI from '../../../../../middlewares/anonymousAPI'
import ensureReqBody from '../../../../../middlewares/ensureReqBody'
import { getDomain, getContent, getClient } from '../../../../../lib/db'
import { slugify } from '../../../../../lib/utils'
import { extractUser } from '../../../../../lib/api-helpers'
import { find } from '../../../../../lib/mongoHelpers'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(anonymousAPI)
  .use(protectedAPI)
  .use(ensureReqBody)

handler.get(async (req, res) => {
  const {
    query: { clientId, domainId, productName },
  } = req

  const currentUser = extractUser(req)
  const { superadmin, roles } = currentUser

  const domain = await getDomain(req, domainId)
  const client = await getClient(req, clientId)

  const product = domain?.products?.find((p) => slugify(p.name) === slugify(productName))
  const authorizeUse = superadmin
    ? true
    : roles.find((r) => {
        const ignoreProtocol = /[a-z]+:\/\//
        const url = domain.url?.replace(ignoreProtocol, '')
        const rDomain = r.domain?.replace(ignoreProtocol, '')
        return url === rDomain && (r.role === 'admin' || r.role === 'editor')
      })
  if (!domain || !authorizeUse) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }
  const content = (product && (await getContent(req, product.contents))) || []
  const { data: availableComponents } = await find({ db: req.db, collection: 'library' })
  res.status(200).send({ error: null, client, product, content, availableComponents, domain })
})

export default handler
