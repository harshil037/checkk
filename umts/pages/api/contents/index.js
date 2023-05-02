import nextConnect from 'next-connect'
import { v4 as uuid } from 'uuid'
import { ObjectId } from 'mongodb'
import { find, insert, update } from '../../../lib/mongoHelpers'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI)

// to create new content
handler.post(async (req, res) => {
  try {
    const document = JSON.parse(req.body)

    document.timestamp = new Date()

    const { domainId } = document

    delete document.domainId

    const { data, error } = await insert({ db: req.db, collection: 'contents', document })

    if (data) {
      // saving the content id in the domain
      const result = await find({ db: req.db, collection: 'domains', find: { _id: ObjectId(domainId) } })

      if (!result.error) {
        const domain = result.data[0]

        if (domain.products) {
          const product = domain.products.find(
            (item) => item.name === data.name && item.type === data.type && item.version === data.version,
          )

          if (product) {
            // if product is already there the only adding content id
            product.contentId = ObjectId(data._id)
          } else {
            // if the current product does not exists then pushing the product in the domain
            domain.products.push({
              _id: uuid(),
              name: data.name,
              module: data.module,
              type: data.type,
              version: data.version,
              status: data.status,
              contentId: ObjectId(data._id),
            })
          }
        } else {
          // if there is no products in the domain
          domain.products = [
            {
              _id: uuid(),
              name: data.name,
              module: data.module,
              type: data.type,
              version: data.version,
              status: data.status,
              contentId: ObjectId(data._id),
            },
          ]
        }

        // delete domain._id

        const updateResulet = await update({
          db: req.db,
          collection: 'domains',
          query: { _id: ObjectId(domainId) },
          document: { $set: { products: domain.products } },
        })
      }

      res.status(200).json({ data: { _id: data._id }, error: null })
    } else {
      res.status(500).json({ data: null, error })
    }
  } catch (e) {
    res.status(500).json({ data: null, error: e.message })
  }
})

export default handler
