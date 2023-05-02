import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import { aggregate } from '../../../lib/mongoHelpers'

// For to get Parking checkout list

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  const { req_offSet, req_limit, req_search, req_sort, req_filter, createdFrom, createdTo, periodFrom, periodTo } =
    req.query
  let limit = req_limit ? parseInt(req_limit) : 500
  let skip = req_offSet ? parseInt(req_offSet) : 0
  let expr = (req_search && req_search.trim().replace(/ /g, '.*|.*')) || ''
  expr = `.*${expr}.*`
  let searchRegex = { $regex: expr, $options: 'i' }

  let query = req_search
    ? {
        paymentStatus: { $ne: 'deleted' },
        $or: [
          { name: searchRegex },
          { surname: searchRegex },
          { phone: searchRegex },
          { email: searchRegex },
          { ticketId: searchRegex },
          { plate: searchRegex },
        ],
      }
    : { paymentStatus: { $ne: 'deleted' } }

  if (req_filter) query.paymentStatus = req_filter

  if (createdFrom && createdTo) {
    let dateFilter = {
      createdAt: { $gte: new Date(createdFrom), $lte: new Date(createdTo + 'T23:59:59.000Z') },
    }
    query = { ...query, ...dateFilter }
  }
  if (periodFrom && periodTo) {
    const newDtFrom = periodFrom + 'T00:00:00:000Z'
    const newDt = periodTo + 'T21:59:59.999Z'
    let dateFilter = {
      toDate: {
        $gte: newDtFrom,
        $lte: newDt,
      },
    }
    query = { ...query, ...dateFilter }
  }

  // console.log(`query ==>`, JSON.stringify(query))
  const checkouts = req_sort
    ? await aggregate({
        db: req.db,
        query,
        collection: 'parkingCheckout',
        skip,
        limit,
        sort: JSON.parse(req_sort),
      })
    : await aggregate({ db: req.db, query, collection: 'parkingCheckout', skip, limit })

  if (!checkouts || !checkouts.data) {
    res.status(200).json({ success: false })
  } else {
    res.status(200).json({ success: true, checkouts })
  }
})

export default handler
