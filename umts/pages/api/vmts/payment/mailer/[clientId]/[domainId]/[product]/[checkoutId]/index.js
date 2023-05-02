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
// import middleware from '../../../../../../../../../middlewares/middleware'
// import cors from '../../../../../../../../../middlewares/cors'
// import { getVmtsVoucherCheckout, updateVmtsVoucher } from '../../../../../../../../../lib/db'
// import Mailer from '../../../../../../../../../lib/mail2'

// const handler = nextConnect()

// handler.use(middleware).use(cors)

// handler.post(async (req, res) => {
//   try {
//     // const { subject, output, to } = JSON.parse(req.body)
//     const { domainId, clientId, product, checkoutId } = req.query
//     const voucher = await getVmtsVoucherCheckout(req, { checkoutId: checkoutId, domainId, clientId, product })
//     console.log({voucher})
//     if (voucher?.length) {
//         if(voucher?.[0]?.paymentStatus === "success" && !voucher?.[0]?.mailSent){
        
//         for (const item of voucher?.[0]?.voucherItems) {
//           const filename = `voucher-${item.code}.pdf`
//           const mailSubject = item.type
//           const emails = [{ to: item.buyer.email, body: '' }]
//           const pdf =
//             // item.templateString &&
//             await pdfBuilder({
//               html: item?.templateString?.replace(`{{ refno }}`, item.code) || `Something went wrong`,
//               filename,
//             })

//           if (!pdf) {
//             res.status(500).send({ error: 'problems sending voucher mail', data: null })
//             return
//           }
//           console.log("emails:",emails)
//           for (const email of emails) {
//               // Send Mail
//             const mailStatus = await Mailer({
//               req,
//               clientId,
//               domainId,
//               emailPayload: {
//                 subject: email?.subject || mailSubject,
//                 output: email?.body || '',
//                 to: email.to,
//                 files: [{ filename, path: `./vouchers/${filename}` }],
//               },
//             })
//             console.log("mailStatus: ==>",mailStatus)
//             fs.appendFile(
//               './voucher_email_log.txt',
//               `\n${new Date(
//                 Date.now(),
//               ).toISOString()} | DOMAIN: ${domainId} | CLIENT: ${clientId} | TRANSACTION ID: ${checkoutId} | MAIL_SENT: ${mailStatus.error ? "FAIL" : "SUCCESS"} | VOUCHER_ITEM: ${item.code}`,
//               function (err) {
//                 console.log(err)
//               },
//             )
//             if (mailStatus.error) {
//                 console.log(mailStatus.error)
//             } else {
//                 const result = await updateVmtsVoucher(
//                     req,
//                     { checkoutId: checkoutId },
//                     { mailSent: new Date(Date.now()).toLocaleString() },
//                 )
//             }
//             }
//         }
//         }else{
//             console.log("payment failed")
//         }
//       } else {
//         console.log('Didnt found voucher for this')
//       }
//   } catch (e) {
//     console.log('catch block', e.message)
//     res.json({ error: e.message, success: false })
//   }
// })

// export default handler