import { createProxyMiddleware } from 'http-proxy-middleware'

const apiProxy = createProxyMiddleware({
  target: 'https://worker.mts-online.com',
  changeOrigin: true,
  secure: false,
})

export default function (req, res) {
  const origin = req.headers
  console.log({ origin })
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
// import middleware from '../../../../../../middlewares/middleware'
// import cors from '../../../../../../middlewares/cors'
// import { getPaymentRecords, updatePaymentRecords } from '../../../../../../lib/db'
// import Mailer from '../../../../../../lib/mail2'

// const handler = nextConnect()

// handler.use(middleware).use(cors)

// handler.post(async (req, res) => {
//   try {
//     const origin = req.headers?.origin
//     // const { subject, output, to } = JSON.parse(req.body)
//     const { domainId, clientId, product, checkoutId } = req.query
//     const paymentRecordsData = await getPaymentRecords(req, { 'checkoutId': checkoutId })
//     const paymentRecord = paymentRecordsData[0]
//     if (!paymentRecord?.mailSent) {
//       if (paymentRecord?.paymentStatus === 'success') {
//         // Sending Mails to customer and hotel
//         const status = await Mailer({
//           req,
//           domainId,
//           clientId,
//           origin,
//           emailPayload: {
//             subject: paymentRecord?.customerTemplate?.successSubject,
//             output: paymentRecord?.customerTemplate?.template,
//             to: paymentRecord?.customer?.email,
//           },
//         })
//         const hotelMail = paymentRecord?.paymentMode==="live" &&  await Mailer({
//           req,
//           domainId,
//           clientId,
//           origin,
//           emailPayload: {
//             subject: paymentRecord?.hotelTemplate?.successSubject,
//             output: paymentRecord?.hotelTemplate?.template,
//             to: paymentRecord?.hotelTemplate?.to,
//           },
//         })
//         if (status.data) {
//           const result = await updatePaymentRecords(
//             req,
//             { 'checkoutId': checkoutId },
//             { ...paymentRecord, mailSent: new Date(Date.now()).toLocaleString() },
//           )
//           res.json({ success: true, data: 'mail sent' })
//         } else {
//           console.log('Unable to send mail', status.error)
//           res.json({ success: false, error: status.error })
//         }
//       } else if (paymentRecord?.paymentStatus === 'failed' ) {
//         // Sending Mail to customer & hotel
//         const status = await Mailer({
//           req,
//           domainId,
//           clientId,
//           origin,
//           emailPayload: {
//             subject: paymentRecord?.customerTemplate?.failureSubject,
//             output: paymentRecord?.customerTemplate?.failureTemplate,
//             to: paymentRecord?.customer?.email,
//           },
//         })
//         const hotelMail = paymentRecord?.paymentMode==="live" && await Mailer({
//           req,
//           domainId,
//           clientId,
//           origin,
//           emailPayload: {
//             subject: paymentRecord?.hotelTemplate?.failureSubject,
//             output: paymentRecord?.hotelTemplate?.failureTemplate,
//             to: paymentRecord?.hotelTemplate?.to,
//           },
//         })
//         if (status.data) {
//           const result = await updatePaymentRecords(
//             req,
//             { 'checkoutId': checkoutId },
//             { ...paymentRecord, mailSent: new Date(Date.now()).toLocaleString() },
//           )
//           res.json({ success: true, data: 'mail sent' })
//         } else {
//           console.log('Unable to send mail', status.error)
//           res.json({ success: false, error: status.error })
//         }
//       } else {
//         res.json({ success: false, error: 'not applicable for mail' })
//       }
//     } else {
//       res.json({ success: false, error: 'mail already sent' })
//     }
//   } catch (e) {
//     console.log('catch block')
//     res.json({ error: e.message, success: false })
//   }
// })

// export default handler
// // const data = await new Promise(function (resolve, reject) {
// // 	const form = new formidable.IncomingForm({ keepExtensions: true })
// // 	form.parse(req, (err, fields, files)=> {
// // 		console.log(err,fields, files)
// // 	  if (err) return reject(err)
// // 	  resolve({ fields, files })
// // 	})
// // })
// //   console.log("data" , data)
