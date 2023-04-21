import { getSMTSConfig } from '../../../../../../lib/db'
import nextConnect from 'next-connect'
import middleware from '../../../../../../middlewares/middleware'

const handler = nextConnect()

handler.use(middleware)

const PRODUCTS = [
  {
    smts: async (req, client) => {
      const result = await getSMTSConfig(req, client)
      return result
    },
  },
]

handler.get(async (req, res) => {
  if (req.headers['internal'] !== 'tofisch123') {
    res.statusCode = 403
    res.json({ error: 'forbidden', data: null })
  } else {
    const {
      query: { product, data: productData, client, version, filter, find, key, cache, debug, url },
    } = req

    const supportedProduct = PRODUCTS.find((p) => p[product])

    if (!supportedProduct) {
      res.statusCode = 404
      res.json({ error: 'Product not found', data: null })
    }

    // const options = {
    //   version: parseInt(version, 10),
    //   dataPath,
    //   dataSource,
    //   cache: cache ? stringToBoolean(cache) : true,
    //   ...(filter && { filter }), // retrieve parts of the data with a given filter
    //   ...(find && { find }), // finds data and returns an array of the results (e.g. find=name -> [{ name: 'Sonnwies', path: 'config.0.enquiry.smtp.to'}])
    //   ...(key && { key }), // retrieve data with a given path/key (e.g. key=seekda.hotelid)
    //   ...(debug && { debug }), // set a debug flag
    //   ...(url && { url }), // fetch data form another url (pass-through)
    // }

    const data = await supportedProduct[product](req, client, productData)

    res.statusCode = data ? 200 : 404
    if (data) {
      res.json(data)
    } else {
      res.json({})
    }
  }
})

export default handler
