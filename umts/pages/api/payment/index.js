import { createProxyMiddleware } from 'http-proxy-middleware'

const apiProxy = createProxyMiddleware({
  target: 'https://worker.mts-online.com',
  changeOrigin: true,
  secure: false,
})

export default function (req, res) {
  const origin = req.headers

  apiProxy(req, res, (result) => {
    if (result instanceof Error) {
      throw result
    }

    throw new Error(`Request '${req.url}' is not proxied! We should never reach here!`)
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
// import nextConnect from 'next-connect'
// import cors from '../../../middlewares/cors'
// import { generateRandomNumber } from '../../../lib/utils'
// import middleware from '../../../middlewares/middleware'
// import { getClientDataSource, addClientDataSource } from '../../../lib/db'

// const handler = nextConnect()

// const createRefno = () => {
//   const date = new Date()
//   const year = date.getFullYear()
//   const month = date.getMonth()
//   return `VMTS-${year}-${month}-${generateRandomNumber(5)}`
// }

// const config = {
//   paymentMethods: ['ECA', 'VIS', 'PFC', 'AMX', 'TWI'],
//   currency: 'EUR',
//   refno: createRefno(),
// }

// const encodeCredientals = ({ username, password }) => Buffer.from(`${username}:${password}`).toString('base64')

// const getClientDataTransCredientals = async (req, domain, client, dataSource) => {
//   const { data, error } = await getClientDataSource(req, domain, client, dataSource)
//   if (error || !data) return null
//   return data
// }

// handler.use(middleware).use(cors)

// handler.options((req, res) => {
//   res.end()
// })

// handler.post(async (req, res) => {
//   const {
//     headers: { origin },
//     body: { client, domain, options },
//   } = req
//   const credientals = (client && (await getClientDataTransCredientals(req, origin, client, 'datatrans'))) || {
//     username: 'a1100024162',
//     password: 'XfyY9MeJrLeNoedo',
//   }
//   const transaction = await fetch('https://api.sandbox.datatrans.com/v1/transactions', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Basic ${encodeCredientals(credientals)}`,
//     },
//     body: JSON.stringify({ ...config, ...options }),
//   })
//   const { transactionId } = await transaction.json()
//   console.log('______')
//   console.log(transactionId)
//   if (transactionId) {
//     res.json({ error: null, transactionId: transactionId })
//   } else {
//     res.status(401).send({ error: 'Not authorized', data: null })
//   }
// })

// export default handler
