import nextConnect from 'next-connect'
import cors from '../../../../../../../middlewares/cors'
import middleware from '../../../../../../../middlewares/middleware'
import { getClientDataSource } from '../../../../../../../lib/db'
// import querystring from ('querystring')

const handler = nextConnect()

const getClientCredentials = async (req, domain, client, dataSource) => {
  const data = await getClientDataSource(req, domain, client, dataSource)
  return data ? data : null
}

handler.use(middleware).use(cors)

handler.options((req, res) => {
  res.end()
})

handler.get(async (req, res) => {
  try {
   
    const { clientId, domain, product } = req.query
    const locals = ['http://10.10.10.119:3004', 'http://localhost:3000']
    const origin = req.headers?.origin
    const envType =  !locals.includes(origin) ? 'live' : 'test'

    const concertData =
    clientId &&
    (await getClientCredentials(
      req,
      envType === 'test' ? 'mts-online.com' : origin,
      envType === 'test' ? 'u0000' : clientId,
      product,
    ))

    if (concertData) {
        delete concertData.entityId
        delete concertData.password
        delete concertData._id
      res.json({ error: null, concertData })
      return
    } else {
      res.status(500).send({ error: 'problems fetching price', data: null })
      return
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: err, data: null })
  }
})

export default handler
