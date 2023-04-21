import nodemailer from 'nodemailer'
import { getClient, getDomain } from './db'
import formidable from 'formidable'
import fs from 'fs'

/**
 * To Send Email.
 * @param {Object} req request object
 * @param {string} domainId domainId
 * @param {string} clientId clientId
 * @param {string} origin origin
 * @param {Object} emailPayload mailPayload ={ subject, output, to , files: {filename,path} }
 */
const Mailer = async ({ req, domainId, clientId: clientNumber, origin, emailPayload }) => {
  const client = await getClient(req, clientNumber)
  const domain = await getDomain(req, domainId)
  // console.log(domain,'domain')
  const emailData = domain?.emails?.find((d) => d.name === 'main')
  const name = domain?.name || email?.from

  const ignoreProtocol = /[a-z]+:\/\//
  const domainUrl = domain.url && domain.url.replace(ignoreProtocol, '').replace('www.', '')
  const url = domainUrl

  // console.log('=============')
  // console.log({ domainUrl })
  // console.log({ client })
  // console.log({ domain })
  // console.log({ emailData })
  // console.log(
  //   'client.domains?.find((d) => d.toString() === domain._id.toString()): ',
  //   client.domains?.find((d) => d.toString() === domain._id.toString()),
  // )

  if (
    !client ||
    !domain ||
    !emailData ||
    !client.domains?.find((d) => d.toString() === domain._id.toString()) ||
    (domainUrl && domainUrl !== url)
  ) {
    return {
      error: 'Error sending mail',
      data: null,
    }
  }

  const { smtpHost, smtpProtocol, smtpPort, smtpUser, smtpPassword, from, address } = emailData
  if (!from || !address) {
    return {
      error: 'Error sending mail',
      data: null,
    }
  }

  // const form = new formidable.IncomingForm()
  // form.keepExtensions = true

  //  return new Promise ((resolve, reject)=>{

  const { subject, output, to, files } = emailPayload

  // form.parse(req, (err, fields, files) => {
  //   console.log("hi")
  //   console.log({ fields })
  //   console.log({ files })
  //   if (err) {
  //     console.log({ err })
  //     return {
  //       error: 'Error sending mail',
  //       data: null,
  //     }
  //   }

  // console.log({ output })
  const transporter = nodemailer.createTransport({
    host: smtpHost || 'i-mts.net',
    port: smtpPort || 25,
    secure: smtpUser && smtpPassword ? true : false,
    auth: {
      user: smtpUser || process.env.SMTP_USER,
      pass: smtpPassword || process.env.SMTP_PASSWORD,
    },
  })

  // const filesArr =
  //   files &&
  //   Object.entries(files).map(([key, value]) => {
  //     return {
  //       filename: value.name,
  //       path: value.path,
  //     }
  //   })

  const mailOptions = {
    from: `${name} <${from}>`,
    // cc: 'ji@mts-online.com',
    to,
    // to: 'ji@mts-online.com',
    subject: subject || `${name} | mail`,
    html: output,
    attachments: files,
  }

  if (output) {
    const mailFn = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('error from mailer sendmail', error.message)
            reject({ error: error, data: null })
          } else {
            console.log('Email sent: ' + info.response)
            resolve({ data: info.response, error: null })
          }
        })
      })
    }
    return mailFn()
  } else {
    return {
      error: 'Error sending mail',
      data: null,
    }
  }
  // })
  // })
  console.log('!!!!')
}

export default Mailer
