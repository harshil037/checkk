import nextConnect from 'next-connect'
import cors from '../../../../../../../middlewares/cors'
import middleware from '../../../../../../../middlewares/middleware'
import { getAllDataSource, getTicketCheckout } from '../../../../../../../lib/db'

const handler = nextConnect()

const getClientCredentials = async (req, client, dataSource) => {
  const data = await getAllDataSource(req, client, dataSource)
  return data ? data : null
}

handler.use(middleware).use(cors)

handler.options((req, res) => {
  res.end()
})

handler.post(async (req, res) => {
  try {
    const {
      body: { paymentMode },
    } = req
    const { clientId, domain, product } = req.query
    const locals = ['http://10.10.10.119:3004', 'http://localhost:3000', "http://10.10.10.119:3001"]
    const origin = req.headers?.origin
    const envType = paymentMode === 'live' && !locals.includes(origin) ? 'live' : 'test'

    const confirmedCheckouts = await getTicketCheckout(req, { concert: product, status: 'confirmed' })
    let bookedTickets = confirmedCheckouts?.length
      ? confirmedCheckouts?.reduce((res, curr) => {
          res += parseInt(curr?.quantity)
          return res
        }, 0)
      : 0
    // // find client credentials
    // const hobexCreds =
    //   clientId &&
    //   (await getClientCredentials(
    //     req,
    //     envType === 'test' ? 'u0000' : clientId,
    //     'hobex',
    //   ))
    const concertData =
      clientId &&
      (await getClientCredentials(
        req,
        envType === 'test' ? 'u0000' : clientId,
        product,
      ))
    const concertDataSources = {  ...concertData?.[0] }

    res.send({  available: (parseInt(concertDataSources?.total) - bookedTickets), total: parseInt(concertDataSources?.total),  error: null })
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: err, data: null })
  }
})

export default handler
