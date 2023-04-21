import nextConnect from 'next-connect'
import cors from '../../../../../../middlewares/cors'
import middleware from '../../../../../../middlewares/middleware'
// import { getTicketCheckout } from '../../../../../../lib/db'
import { aggregate } from '../../../../../../lib/mongoHelpers'
// import { v4 as uuidv4 } from 'uuid'
// import querystring from ('querystring')

const handler = nextConnect()

handler.use(middleware).use(cors)

handler.options((req, res) => {
  res.end()
})

handler.get(async (req, res) => {
  try {
    const { clientId, product , req_offSet, req_limit, req_search, req_sort, req_filter } =
    req.query
  let limit = req_limit ? parseInt(req_limit) : 500
  let skip = req_offSet ? parseInt(req_offSet) : 0
  let expr = (req_search && req_search.trim().replace(/ /g, '.*|.*')) || ''
  expr = `.*${expr}.*`
  let searchRegex = { $regex: expr, $options: 'i' }

  let query = req_search
    ? {
        concert:product, clientId: clientId, paymentMode: "live",
        $or: [
          { "personalData.firstName": searchRegex },
          { "personalData.lastName": searchRegex },
          { "personalData.telephone": searchRegex },
          { "personalData.email": searchRegex },
          { codes: searchRegex },
        ],
      }
    : {  concert:product, paymentMode: "live", clientId: clientId }
    if (req_filter){
      query.paymentStatus = req_filter === "pending" ? {$exists : false} : req_filter
    } 
   
  const confirmedCheckouts = req_sort
  ? await aggregate({
      db: req.db,
      query,
      collection: 'productTicketBookings',
      skip,
      limit,
      sort: JSON.parse(req_sort), 
    })
  : await aggregate({ db: req.db, query, collection: 'productTicketBookings', skip, limit })
  if (!confirmedCheckouts || !confirmedCheckouts.data) {
    res.status(200).json({ success: false })
  } else {
    res.status(200).json({ success: true, confirmedCheckouts })
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

export default handler
