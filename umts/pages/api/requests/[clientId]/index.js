import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'

import protectedAPI from '../../../../middlewares/protectedAPI'
import { aggregate } from '../../../../lib/mongoHelpers'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI)

handler.get(async (req, res) => {
  const { clientId, req_offSet, req_limit, req_search, req_sort } = req.query
  let limit = req_limit ? parseInt(req_limit) : 10
  let skip = req_offSet ? parseInt(req_offSet) : 0
  let query = req_search ? { clientId, channel: req_search } : { clientId }

  const requests = req_sort
    ? await aggregate({ db: req.db, query, collection: 'channelRequests', skip, limit, sort: JSON.parse(req_sort) })
    : await aggregate({ db: req.db, query, collection: 'channelRequests', skip, limit })

  if (!requests || !requests.data) {
    res.status(200).json({ success: false })
  } else {
    res.status(200).json({ success: true, requests })
  }
})

export default handler
