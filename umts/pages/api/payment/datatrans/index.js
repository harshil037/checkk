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
// import cors from '../../../../middlewares/cors'
// import { generateRandomNumber } from '../../../../lib/utils'
// import middleware from '../../../../middlewares/middleware'
// import { getClientDataSource, addClientDataSource } from '../../../../lib/db'

// const handler = nextConnect()

// const createRefno = () => {
//   const date = new Date()
//   const year = date.getFullYear()
//   const month = date.getMonth()
//   return `VMTS-${year}-${month}-${generateRandomNumber(5)}`
// }

// const createConfig = (config) => ({ ...config })

// const encodeCredientals = ({ username, password }) => Buffer.from(`${username}:${password}`).toString('base64')

// const getClientCredientals = async (req, domain, client, dataSource) => {
//   const data = await getClientDataSource(req, domain, client, dataSource)
//   return data ? data : null
// }

// handler.use(middleware).use(cors)

// handler.options((req, res) => {
//   res.end()
// })

// handler.post(async (req, res) => {
//   const {
//     headers: { origin },
//     body: { client, language, basket, options },
//   } = req

//   // find client credientals
//   const credientals = (client && (await getClientCredientals(req, origin, client, 'datatrans'))) || {
//     username: 'a1100024162',
//     password: 'XfyY9MeJrLeNoedo',
//   }

//   // create unique reference number
//   const refno = createRefno()
//   const config = createConfig({ refno, currency: 'EUR', paymentMethods: ['ECA', 'VIS', 'PFC', 'AMX', 'TWI'] })
//   const optionsWithRefs = {
//     ...options,
//     amount: parseFloat(options.amount) * 100, // price in cents
//     redirect: {
//       ...(options?.redirect?.successUrl && { successUrl: `${options.redirect.successUrl}/${refno}` }),
//       ...(options?.redirect?.cancelUrl && { cancelUrl: `${options.redirect.cancelUrl}/${refno}` }),
//       ...(options?.redirect?.errorUrl && { errorUrl: `${options.redirect.errorUrl}/${refno}` }),
//     },
//   }
//   const transaction = await fetch('https://api.sandbox.datatrans.com/v1/transactions', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Basic ${encodeCredientals(credientals)}`,
//     },
//     body: JSON.stringify({ ...config, ...optionsWithRefs }),
//   })
//   const { transactionId } = await transaction.json()

//   if (!transactionId) {
//     res.status(500).send({ error: 'problems retrieving the transaction ID', data: null })
//     return
//   }

//   const voucher = {
//     ps: 'DataTrans',
//     code: refno,
//     clientno: client,
//     status: 'registered',
//     type: 'VOUCHER',
//     language,
//     createdAt: new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
//     lastUpdatedAt: new Date(Date.now()).toISOString(),
//     basket,
//     initialValue: parseFloat(options.amount),
//     currentValue: parseFloat(options.amount),
//     value: optionsWithRefs,
//   }
//   const vouchers = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmts')) || []
//   const saveRef = await addClientDataSource(req, 'mts-online.com', 'u0000', 'vmts', [...vouchers, voucher])

//   if (!saveRef) {
//     res.status(500).send({ error: 'problems saving the data', data: null })
//     return
//   }

//   if (transactionId && vouchers && saveRef) {
//     res.json({ error: null, transactionId, refno })
//     return
//   } else {
//     res.status(500).send({ error: 'problems saving the data', data: null })
//     return
//   }
// })

// export default handler
