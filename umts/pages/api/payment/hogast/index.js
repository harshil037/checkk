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
// import { getClient, getClientDataSource, addClientDataSource } from '../../../../lib/db'
// import { v4 as uuidv4 } from 'uuid'
// // import querystring from ('querystring')

// const handler = nextConnect()

// const createRefno = () => {
//   const date = new Date()
//   const year = date.getFullYear()
//   const month = date.getMonth()
//   return `VMTS-${year}-${month}-${generateRandomNumber(5)}`
// }

// const createConfig = (config) => ({ ...config })

// // const encodeCredientals = ({ password }) => Buffer.from(`${password}`).toString('base64')
// const encodeCredientals = ({ entityId, password }) => {
//   // console.log(Buffer.from(`${entityId}|${password}`).toString('base64'))
//   return Buffer.from(`${entityId}|${password}`).toString('base64')
// }

// const getClientCredientals = async (req, domain, client, dataSource) => {
//   const data = await getClientDataSource(req, domain, client, dataSource)
//   return data ? data : null
// }

// const createBodyString = (options) =>
//   Object.entries(options).reduce((acc, [key, value], i) => {
//     return `${acc}${key}=${value}${Object.entries(options).length !== i + 1 ? '&' : ''}`
//   }, '')

// handler.use(middleware).use(cors)

// handler.options((req, res) => {
//   res.end()
// })

// handler.post(async (req, res) => {
//   const {
//     body: { clientId, language, basket, options },
//   } = req
//   const origin = req.headers?.origin

//   // find client credientals
//   const credientals = clientId && (await getClientCredientals(req, origin, clientId, 'hobex'))

//   // create unique reference number
//   const now = new Date(Date.now()).toISOString()
//   const value = parseFloat(options.amount).toFixed(2).toString()

//   // const optionsWithRefs = {
//   //   ...options,
//   //   // entityId: credientals.entityId,
//   //   entityId: '8a829418530df1d201531299e097175c',
//   //   paymentType: 'DB',
//   //   amount: value,
//   //   merchantTransactionId: refno,
//   //   redirect: { url: `${options.redirect?.successUrl || ''}/${refno}` },
//   // }

//   const bodyString = createBodyString({
//     entityId: credientals.entityId,
//     // entityId: '8a829418530df1d201531299e097175c',
//     amount: value,
//     currency: options.currency || 'EUR',
//     paymentType: 'DB',
//   })

//   // console.log('dataString: ', dataString)

//   // console.log(`Bearer ${encodeCredientals(credientals)}`)

//   const transaction = await fetch('https://oppwa.com/v1/checkouts', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       Authorization: `Bearer ${credientals.password}`,
//       // Authorization: 'Bearer OGE4Mjk0MTg1MzBkZjFkMjAxNTMxMjk5ZTJjMTE3YWF8ZzJnU3BnS2hLUw==',
//     },
//     body: bodyString,
//   })
//   const result = await transaction.json()
//   const { id } = result

//   if (!id) {
//     res.status(500).send({ error: 'problems retrieving the transaction ID', data: null })
//     return
//   }

//   const vouchers = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsVouchers')) || []
//   const appointments = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsAppointments')) || []
//   const client = getClient(req, clientId)
//   // const purchases = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsPurchases')) || []

//   // console.log({ appointments })
//   // console.log({ basket })

//   const singleVouchers =
//     basket.voucher?.items.reduce((acc, v) => {
//       return [...acc, ...Array(v.quantity).fill({ ...v, quantity: 1 })]
//     }, []) || []

//   console.log('singleVouchers: ', singleVouchers.length)

//   const voucherItems = singleVouchers.reduce(
//     (acc, v, i) => {
//       const buyerLastName = basket.personalData?.lastname
//       const buyerFirstName = basket.personalData?.firstname
//       const buyerEmail = basket.personalData?.email
//       const buyerCompany = basket.personalData?.company

//       const servicesString =
//         (v.services &&
//           Object.entries(v.services).reduce((sAcc, [key, service]) => {
//             return `${sAcc}${service.title} (${service.code}) - ${service.quantity} x ${service.price.amount} ${
//               service.price.currency
//             } ${i + 1 !== Object.entries(v.services).length ? '| ' : ''}`
//           }, '')) ||
//         ''

//       const comments = `NAME: ${v.name} | EMAIL: ${v.email ? v.email : basket.personalData?.email} | VIA ${
//         v.sendVia
//       } | TO: ${v.sendTo} ${
//         v.streetno || basket.personalData?.streetno
//           ? `| ADDRESS: ${
//               v.sendTo === 'me' ? basket.personalData.firstname + ' ' + basket.personalData.lastname : v.name
//             } - ${v.streetno || basket.personalData.streetno} - ${v.zip || basket.personalData.zip} - ${
//               v.place || basket.personalData.place
//             } - ${v.country || basket.personalData.country}`
//           : ''
//       } ${
//         basket.personalData?.company
//           ? `| COMPANY: ${basket.personalData.company} VAT: ${basket.personalData.vatId}`
//           : ''
//       } ${servicesString && servicesString !== '' ? `| SERVICES: ${servicesString}` : ''}`

//       const value = parseFloat(v.value).toFixed(2).toString()
//       const refno = createRefno()

//       const voucher = {
//         ...v,
//         ps: 'Hobex',
//         buyer: {
//           ...(buyerFirstName && { firstname: buyerFirstName }),
//           ...(buyerLastName && { lastname: buyerLastName }),
//           ...(buyerCompany && { company: buyerCompany }),
//           ...(buyerEmail && { email: buyerEmail }),
//         },
//         code: refno,
//         clientno: clientId,
//         status: 'registered',
//         type: 'VOUCHER',
//         language,
//         createdAt: now,
//         lastUpdatedAt: now,
//         basket,
//         id,
//         initialValue: value,
//         currentValue: value,
//         comments,
//         email: v.email ? v.email : basket.personalData?.email,
//         transactions: [
//           {
//             id: uuidv4(),
//             type: 'sale',
//             createdAt: now,
//             amount: value,
//           },
//         ],
//       }
//       return [...acc, voucher]
//     },
//     [...vouchers],
//   )

//   // const vouchersRes = await voucherItems
//   // const vouchersObj = await voucherItems
//   // const vouchersRes = vouchersObj?.data

//   const appointmentItems = basket.appointment?.items?.reduce(
//     (acc, v, i) => {
//       const buyerLastName = basket.personalData?.lastname
//       const buyerFirstName = basket.personalData?.firstname
//       const buyerEmail = basket.personalData?.email
//       const buyerCompany = basket.personalData?.company

//       const refno = createRefno()

//       const appointment = {
//         ...v,
//         ps: 'Hobex',
//         code: refno,
//         clientno: clientId,
//         buyer: {
//           ...(buyerFirstName && { firstname: buyerFirstName }),
//           ...(buyerLastName && { lastname: buyerLastName }),
//           ...(buyerCompany && { company: buyerCompany }),
//           ...(buyerEmail && { email: buyerEmail }),
//         },
//         status: 'registered',
//         type: 'APPOINTMENT',
//         email: v.email ? v.email : basket.personalData?.email,
//         language,
//         createdAt: now,
//         lastUpdatedAt: now,
//         basket,
//         id,
//       }
//       return [...acc, appointment]
//     },
//     [...appointments],
//   )

//   const saveVouchersRef =
//     voucherItems?.length > 0 &&
//     (await addClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsVouchers', voucherItems))
//   const saveAppointmentRef =
//     appointmentItems?.length > 0 &&
//     (await addClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsAppointments', appointmentItems, saveVouchersRef))

//   // const purchase = {
//   //   ps: 'Hobex',
//   //   clientno: clientId,
//   //   language,
//   //   createdAt: now,
//   //   lastUpdatedAt: now,
//   //   basket,
//   //   id,
//   //   value,
//   // }

//   // const appointmentsObj = await appointmentItems
//   // const appointmentsRes = appointmentsObj?.data

//   // console.log({ vouchersRes })
//   // console.log({ appointmentsRes })

//   // if ((vouchersRes && vouchersRes.length > 0) || (appointmentsRes && appointmentsRes?.length > 0)) {
//   if ((voucherItems && voucherItems.length > 0) || (appointmentItems && appointmentItems.length > 0)) {
//     res.json({ error: null, id })
//     return
//   } else {
//     res.status(500).send({ error: 'problems saving the data', data: null })
//     return
//   }
// })

// export default handler
