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
// import cors from '../../../../../middlewares/cors'
// import { generateRandomNumber } from '../../../../../lib/utils'
// import middleware from '../../../../../middlewares/middleware'
// import { getClientDataSource, addClientDataSource, getDomain } from '../../../../../lib/db'
// import FormData from 'form-data'
// import pdfBuilder from '../../../../../lib/pdf'
// import fs from 'fs'
// // import querystring from ('querystring')

// const storeData = (data, path) => {
//   try {
//     fs.writeFileSync(path, JSON.stringify(data))
//   } catch (err) {
//     console.log('!!!!!!')
//     console.error(err)
//   }
// }

// const getClientCredientals = async (req, domain, client, dataSource) => {
//   const data = await getClientDataSource(req, domain, client, dataSource)
//   return data ? data : null
// }

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
//     fs.appendFile(
//       './voucher_log.txt',
//       `${new Date(
//         Date.now(),
//       ).toISOString()} | DOMAIN: ${domainId} | CLIENT: ${clientId} | TRANSACTION ID: ${id} | ERROR: problems retrieving the transaction ID `,
//       function (err) {
//         console.log(err)
//       },
//     )
//     res.status(500).send({ error: 'problems retrieving the transaction ID', data: null })
//     return
//   }

//   console.log({ domainId })
//   console.log({ clientId })
//   console.log({ origin })
//   // const domain = await getDomain(req, domainId)
//   const og = origin
//   const vouchers = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsVouchers')) || []
//   const appointments = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsAppointments')) || []
//   const clientVouchers = vouchers.filter((v) => v.id === id)
//   const clientAppointments = appointments.filter((v) => v.id === id)
//   const credientals = clientId && (await getClientCredientals(req, og, clientId, 'hobex'))
//   console.log({ credientals })

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
//     '000.200.000',
//     '000.200.001',
//     '000.200.100',
//     '000.200.101',
//     '000.200.102',
//     '000.200.103',
//     '000.200.200',
//   ]

//   if (id && (clientVouchers?.length || clientAppointments?.length)) {
//     const entityId = credientals.entityId
//     const password = credientals.password
//     console.log({ entityId })
//     console.log({ password })
//     const status = await fetch(`https://oppwa.com/v1/checkouts/${id}/payment?entityId=${entityId}`, {
//       headers: {
//         // Authorization: 'Bearer OGE4Mjk0MTg1MzBkZjFkMjAxNTMxMjk5ZTJjMTE3YWF8ZzJnU3BnS2hLUw==',
//         Authorization: `Bearer ${password}`,
//       },
//     })

//     const result = await status.json()
//     console.log({ result })
//     console.log({ code: result?.result?.code })
//     fs.appendFile(
//       './voucher_log.txt',
//       `${new Date(
//         Date.now(),
//       ).toISOString()} | DOMAIN: ${domainId} | CLIENT: ${clientId} | TRANSACTION ID: ${id} | CODE: ${
//         result?.result?.code
//       }`,
//       function (err) {
//         console.log(err)
//       },
//     )
//     if (successCodes.includes(result?.result?.code)) {
//       const now = new Date(Date.now()).toISOString()
//       const updateVouchers = vouchers.map((v) =>
//         v.id === id && v.status !== 'redeemable' ? { ...v, status: 'redeemable', lastUpdatedAt: now } : v,
//       )
//       const saveRef = await addClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsVouchers', updateVouchers)
//       if (saveRef) {
//         for (const item of clientVouchers) {
//           const filename = `voucher-${item.code}.pdf`
//           const mailSubject = item.type
//           const emails = item.emails || []
//           const pdf =
//             item.templateString &&
//             (await pdfBuilder({ html: item.templateString.replace(`{{ refno }}`, item.code), filename }))
//           if (!pdf) {
//             res.status(500).send({ error: 'problems sending voucher mail', data: null })
//             return
//           }

//           for (const email of emails) {
//             console.log('-------------------------------------')
//             const form = new FormData()
//             form.append('subject', email.subject || mailSubject)
//             form.append('file0', pdf, { filename })
//             form.append('output', email.body)
//             form.append('to', `${email.to[0]} <${email.to[1]}>`)
//             await fetch(`https://u.mts-online.com/api/mail/${clientId}/server/${domainId}`, {
//               method: 'POST',
//               body: form,
//             })
//           }
//         }

//         // for (const item of clientVouchers) {
//         //   fs.writeFSyncile(`./vouchers/voucher-${item.code}.json`, JSON.stringify(it }))
//         // }

//         Promise.all(
//           clientVouchers.map((item, i) => {
//             return new Promise((resolve, reject) => {
//               fs.writeFile(`./vouchers/voucher-${item.code}.json`, JSON.stringify(item), 'utf-8', (err) => {
//                 if (err) {
//                   reject(err)
//                 } else {
//                   resolve()
//                 }
//               })
//             })
//           }),
//         )
//           .then(() => {
//             res.json({ error: null, data: 'ok' })
//             return
//           })
//           .catch((err) => {
//             res.status(500).send({ error: err, data: null })
//             return
//           })
//       } else {
//         res.status(500).send({ error: 'problems saving the data', data: null })
//         return
//       }
//     } else {
//       res.status(500).send({ error: 'problems saving the data', data: null })
//       return
//     }
//   } else {
//     res.status(500).send({ error: 'problems saving the data', data: null })
//     return
//   }
// })

// export default handler

// // https://test.oppwa.com/v1/checkouts//payment
