import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import ensureReqBody from '../../../middlewares/ensureReqBody'
import { find } from '../../../lib/mongoHelpers'
import { ObjectID } from 'mongodb'

const handler = nextConnect()
handler.use(middleware).use(protectedAPI).use(ensureReqBody)
handler.get(async (req, res) => {
  const { productId } = req.query

  try {
    let product = await req.db
      .collection('domains')
      .aggregate([
        { $unwind: '$products' },
        { $match: { 'products._id': productId } },
        { $group: { _id: '$_id', products: { $push: '$products' }, url: { $push: '$url' } } },
      ])
      .toArray()

    if (product.length > 0 && product[0].products[0]?.dataSource) {
      const { data, error } = await find({
        db: req.db,
        collection: 'dataSources',
        find: { _id: ObjectID(product[0].products[0]?.dataSource) },
        limit: 1,
      })
      res.status(200).send({ data: data, error: null })
    } else {
      res.status(200).send({ data: [], error: null })
    }
  } catch {
    res.status(500).send({ error: 'error occured .. ' })
  }
})

export default handler
