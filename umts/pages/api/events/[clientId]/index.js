import nextConnect from 'next-connect'
import cors from '../../../../middlewares/cors'
import middleware from '../../../../middlewares/middleware'
import { insert, aggregate, update } from '../../../../lib/mongoHelpers'
// import { v4 as uuidv4 } from 'uuid'
// import querystring from ('querystring')

const handler = nextConnect()

handler.use(middleware).use(cors)

handler.options((req, res) => {
  res.end()
})

handler.get(async (req, res) => {
  try {
    const { clientId, req_offSet, req_limit, req_search, req_sort, req_filter } =
    req.query
  let limit = req_limit ? parseInt(req_limit) : 500
  let skip = req_offSet ? parseInt(req_offSet) : 0
  let expr = (req_search && req_search.trim().replace(/ /g, '.*|.*')) || ''
  expr = `.*${expr}.*`
  let searchRegex = { $regex: expr, $options: 'i' }

  let query = req_search
    ? {
       clientId: clientId,
        $or: [
          { eventName: searchRegex },
          { eventType: searchRegex }
        ],
      }
    : {  clientId: clientId }

//   if (req_filter) query.paymentStatus = req_filter
   
  const events = req_sort
  ? await aggregate({
      db: req.db,
      query,
      collection: 'events',
      skip,
      limit,
      sort: JSON.parse(req_sort),
    })
  : await aggregate({ db: req.db, query, collection: 'events', skip, limit })
  if (!events || !events.data) {
    res.status(200).json({ success: false })
  } else {
    res.status(200).json({ success: true, events })
  }

    // const { clientId, product } = req.query
    // const confirmedCheckouts = await getTicketCheckout(req, { concert:product, status:"confirmed", }) //paymentMode: "live"
    // res.send({ error: null, data: confirmedCheckouts })
      // return
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: err, data: null })
  }
})
handler.post(async (req, res) => {
  try {
    const { clientId} = req.query
    const { eventType, eventName} = req.body
    const event = {...req.body, clientId, createdAt : new Date(Date.now())};
    const { error, data } = await insert({ db: req.db, collection: 'events', document: event })
  if (!error) {
    res.status(200).json({ error, data })
  } else {
    res.status(200).json({ success: false, error })
  }
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: err, data: null })
  }
})
handler.patch(async (req, res) => {
  try {
    const { clientId} = req.query
    const { eventType, eventName, eventId} = req.body
    const event = {...req.body};
    const { error, data } = await update({ db: req.db, query:{eventId: eventId, clientId: clientId}, collection: 'events', document: event })
  if (!error) {
    res.status(200).json({ error, data })
  } else {
    res.status(200).json({ success: false, error })
  }
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: err, data: null })
  }
})

export default handler
