import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'

import protectedAPI from '../../../../middlewares/protectedAPI'
import { aggregate, find } from '../../../../lib/mongoHelpers'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI)

handler.get(async (req, res) => {
  try {
    const { clientId, req_offSet, req_limit, req_search, req_sort } = req.query
    let limit = req_limit ? parseInt(req_limit) : 10
    let skip = req_offSet ? parseInt(req_offSet) : 0
    let query = req_search ? { user_id: clientId, channel: req_search } : { user_id: clientId }
    let sort = {}
    if (req_sort) {
      let sortQuery = JSON.parse(req_sort)

      // console.log(sortQuery,'sortQuery')
      Object.keys(sortQuery).reverse().forEach((item) => {
        if (item === 'contact') {
          sort['data.firstname'] = sortQuery.contact * -1
          sort['data.lastname'] = sortQuery.contact * -1
        }
        if (item === 'period') {
          sort['data.period.arrival'] = sortQuery.period
        }
        if (item === 'occupancy') {
          sort['data.room.occupancy.min'] = sortQuery.occupancy
        }
        if (item === 'referrer') {
          sort['data.referrer'] = sortQuery.referrer
        }
        if (item === 'campaign') {
          sort['data.campaign'] = sortQuery.campaign
        }
        if (item === 'timestamp') {
          sort['timestamp'] = sortQuery.timestamp
        }
      })
    }
    sort['_id'] = -1
    // console.log(sort, 'sortObj')

    // Aggregation
    // const requests = await aggregate({ db: req.db, query, collection: 'enquiries', skip, limit, sort: sort })
    // if (!requests || !requests.data) {
    //   res.status(200).json({ success: false })
    // } else {
    //   res.status(200).json({ success: true, requests })
    // }

    // Normal find method
    const [results, count] = await Promise.all([
      find({ db: req.db, query, collection: 'enquiries', skip, limit, sort }),
      find({ db: req.db, query, collection: 'enquiries' }),
    ])
    // console.log(results,'result', count.data.length, "count");
    if (results.data) {
      res.status(200).json({ success: true, requests: results, count: count.data.length })
    } else {
      res.status(200).json({ success: false, error: results?.error })
    }
  } catch (err) {
    console.log(err)
    res.json({ success: false, error: err.message })
  }
})

export default handler
