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
// import cors from '../../../../../../middlewares/cors'
// import { generateRandomNumber } from '../../../../../../lib/utils'
// import middleware from '../../../../../../middlewares/middleware'
// import { getClientDataSource, addClientDataSource, getDomain } from '../../../../../../lib/db'
// import FormData from 'form-data'
// import pdfBuilder from '../../../../../../lib/pdf'
// import Mailer from '../../../../../../lib/mail'
// // import querystring from ('querystring')

// const createBodyString = (options) =>
//   Object.entries(options).reduce((acc, [key, value], i) => {
//     return `${acc}${key}=${value}${Object.entries(options).length !== i + 1 ? '&' : ''}`
//   }, '')

// const handler = nextConnect()

// handler.use(middleware).use(cors)

// handler.options((req, res) => {
//   res.end()
// })

// handler.post(async (req, res) => {
//   const {
//     query: { id: id },
//     body: { domainId, clientId },
//     headers: { origin },
//   } = req

//   if (!id) {
//     return({ error: 'problems retrieving the transaction ID', data: null })
//   }

//   console.log({ clientId })
//   console.log({ domainId })
//   // const domain = await getDomain(req, domainId)
//   const vouchers = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsVouchers')) || []
//   const appointments = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsAppointments')) || []
//   const clientVouchers = vouchers.filter((v) => v.id === id)
//   const clientAppointments = appointments.filter((v) => v.id === id)

//   const successCodes = [
//     '000.000.000',
//     '000.000.100',
//     '000.100.105',
//     '000.100.106',
//     '000.100.110',
//     '000.100.111',
//     '000.100.112',
//     '000.300.000',
//     '000.300.100',
//     '000.300.101',
//     '000.300.102',
//     '000.310.100',
//     '000.310.101',
//     '000.310.110',
//     '000.600.000',
//     '000.400.000',
//     '000.400.010',
//     '000.400.020',
//     '000.400.040',
//     '000.400.050',
//     '000.400.060',
//     '000.400.070',
//     '000.400.080',
//     '000.400.081',
//     '000.400.082',
//     '000.400.090',
//     '000.400.100',
//   ]

//   if (id && (clientVouchers?.length || clientAppointments?.length)) {
//     const status = await fetch(
//       `https://test.oppwa.com/v1/checkouts/${id}/payment?entityId=8a829418530df1d201531299e097175c`,
//       {
//         headers: {
//           Authorization: 'Bearer OGE4Mjk0MTg1MzBkZjFkMjAxNTMxMjk5ZTJjMTE3YWF8ZzJnU3BnS2hLUw==',
//         },
//       },
//     )

//     const result = await status.json()
//     console.log({ result })
//     if (successCodes.includes(result?.result?.code)) {
//       const now = new Date(Date.now()).toISOString()
//       const updateVouchers = vouchers.map((v) =>
//         v.id === id && v.status !== 'redeemable' ? { ...v, status: 'redeemable', lastUpdatedAt: now } : v,
//       )
//       const saveRef = await addClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsVouchers', updateVouchers)
//       console.log({ saveRef })
//       if (saveRef) {
//         for (const item of clientVouchers) {
//           console.log('--------------------')
//           const mailSubject = item.type
//           const form = new FormData()
//           console.log('============')
//           const pdf = await pdfBuilder(item.templateString)
//           console.log(pdf)
//           form.append('subject', mailSubject)
//           form.append('file0', pdf)
//           form.append('output', `<div>test mail</div>`)

//           await Mailer({ req, clientId, domainId, id, origin })
//         }

//         // const sendVouchers = clientVouchers.forEach(async (item) => {})
//         // console.log('_________________________')
//         // console.log(sendVouchers)
//         return({ error: null, data: saveRef })
//       } else {
//         return({ error: 'problems saving the data', data: null })
//       }
//     } else {
//       return({ error: 'problems saving the data', data: null })
//     }
//   } else {
//     return({ error: 'problems saving the data', data: null })
//   }
// })

// export default handler

// // https://test.oppwa.com/v1/checkouts//payment
