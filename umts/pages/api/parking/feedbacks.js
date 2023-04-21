import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import { aggregate } from '../../../lib/mongoHelpers'

// To get feedback details

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  const { req_offSet, req_limit, req_search, req_sort } = req.query
  let limit = req_limit ? parseInt(req_limit) : 500
  let skip = req_offSet ? parseInt(req_offSet) : 0
  let expr = (req_search && req_search.trim().replace(/ /g, '.*|.*')) || ''
  expr = `.*${expr}.*`
  let searchRegex = { $regex: expr, $options: 'i' }

  let query = req_search
    ? {
        $or: [{ name: searchRegex }, { email: searchRegex }, { message: searchRegex }],
      }
    : {}

  const feedbacks = req_sort
    ? await aggregate({
        db: req.db,
        query,
        collection: 'parkingFeedback',
        skip,
        limit,
        sort: JSON.parse(req_sort),
      })
    : await aggregate({ db: req.db, query, collection: 'parkingFeedback', skip, limit })

  if (!feedbacks || !feedbacks.data) {
    res.status(200).json({ success: false })
  } else {
    res.status(200).json({ success: true, feedbacks })
  }
})

export default handler
