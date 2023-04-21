import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import { slugify } from '../../../../../lib/utils'
import { ObjectId } from 'mongodb'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  const {
    query: { domainId, productName },
  } = req
  try {
    const ignoreProtocol = /[a-z]+:\/\//
    const domains = await req.db.collection('domains').find().toArray()
    const singleDomain = domains.find(
      (x) => slugify(x.url.replace(ignoreProtocol, '')) == slugify(domainId.replace(ignoreProtocol, '')),
    )
    const productItem = singleDomain?.products?.find((p) => slugify(p.name) === slugify(productName))
    if (productItem) {
      const contentId = productItem.contentId
      const result = await req.db.collection('contents').findOne({ _id: ObjectId(contentId) })

      res.status(200).json({
        result: {
          data: result,
          products: singleDomain?.products,
          module: productItem.module,
          id: singleDomain._id,
        },
        error: false,
      })
    } else {
      res.status(500).json({
        result: null,
        error: true,
      })
    }
  } catch (e) {
    res.status(500).json({
      result: null,
      error: true,
    })
  }
})

export default handler
