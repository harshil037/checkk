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
// import nodemailer from 'nodemailer'

// import cors from '../../../../../middlewares/cors'
// import middleware from '../../../../../middlewares/middleware'
// import protectedAPI from '../../../../../middlewares/protectedAPI'
// import ensureReqBody from '../../../../../middlewares/ensureReqBody'
// import { getClient, getDomain } from '../../../../../lib/db'
// import formidable from 'formidable'
// import fs from 'fs'

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// const handler = nextConnect()

// handler
//   .use(middleware)
//   .use(cors)
//   .post(async (req, res) => {
//     const {
//       query: { client: clientNumber, domainId },
//       headers: { origin },
//       body,
//     } = req

//     const client = await getClient(req, clientNumber)
//     const domain = await getDomain(req, domainId)
//     const emailData = domain?.emails?.find((d) => d.name === 'main')
//     const name = domain?.name || email?.from

//     const ignoreProtocol = /[a-z]+:\/\//
//     const domainUrl = domain.url && domain.url.replace(ignoreProtocol, '').replace('www.', '')
//     const url = domainUrl

//     console.log('=============')
//     console.log({ domainUrl })
//     console.log({ client })
//     console.log({ domain })
//     console.log({ emailData })
//     console.log(
//       'client.domains?.find((d) => d.toString() === domain._id.toString()): ',
//       client.domains?.find((d) => d.toString() === domain._id.toString()),
//     )

//     if (
//       !client ||
//       !domain ||
//       !emailData ||
//       !client.domains?.find((d) => d.toString() === domain._id.toString()) ||
//       (domainUrl && domainUrl !== url)
//     ) {
//       console.log("this won't work")
//       return {
//         error: 'Error sending mail',
//         data: null,
//       }
//       return
//     }

//     const { smtpHost, smtpProtocol, smtpPort, smtpUser, smtpPassword, from, to, address } = emailData
//     if (!from || !to || !address) {
//       return {
//         error: 'Error sending mail',
//         data: null,
//       }
//       return
//     }

//     const form = new formidable.IncomingForm()
//     form.keepExtensions = true

//     console.log('HERE')
//     form.parse(req, (err, fields, files) => {
//       if (err) {
//         console.log({ err })
//         return {
//           error: 'Error sending mail',
//           data: null,
//         }
//         return
//       }

//       const { subject, output, to: toMail } = fields

//       console.log({ output })
//       console.log({ subject })
//       console.log({ toMail })
//       console.log({ fields, files })
//       const transporter = nodemailer.createTransport({
//         host: smtpHost || 'i-mts.net',
//         port: smtpPort || 25,
//         secure: smtpUser && smtpPassword ? true : false,
//         auth: {
//           user: smtpUser || 'mail@i-mts.net',
//           pass: smtpPassword || 'ASA1!%%ZdWF3E!r4XsD!gv!C',
//         },
//       })

//       const filesArr =
//         files &&
//         Object.entries(files).map(([key, value]) => {
//           return {
//             filename: value.name,
//             path: value.path,
//           }
//         })

//       const mailOptions = {
//         from: `${name} <${from}>`,
//         bcc: ['ji@mts-online.com', from],
//         to: toMail,
//         subject: subject || `${name} | mail`,
//         html: output,
//         attachments: filesArr,
//       }

//       if (output) {
//         transporter.sendMail(mailOptions, (error, info) => {
//           if (error) {
//             console.log(error)
//           } else {
//             mailOptions.attachments?.map((a) => {
//               console.log({ a })
//               console.log(`deleteting ${a.path}`)
//               return fs.unlinkSync(a.path)
//             })
//             console.log('Email sent: ' + info.response)
//             res.json({ error: null, data: info.response })
//             return
//           }
//         })

//         return {
//           error: null,
//           data: 'ok',
//         }
//         return
//       } else {
//         return {
//           error: 'Error sending mail',
//           data: null,
//         }
//       }
//     })
//   })

// export default handler
