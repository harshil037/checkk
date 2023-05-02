import nodemailer from 'nodemailer'
import { getClient, getDomain } from './db'
import formidable from 'formidable'
import fs from 'fs'

const Mailer = async ({ req, domainId, clientId: clientNumber, origin }) => {
  const client = await getClient(req, clientNumber)
  const domain = await getDomain(req, domainId)
  const emailData = domain?.emails?.find((d) => d.name === 'main')
  const name = domain?.name || email?.from

  const ignoreProtocol = /[a-z]+:\/\//
  const domainUrl = domain.url && domain.url.replace(ignoreProtocol, '').replace('www.', '')
  const url = domainUrl

  console.log('=============')
  console.log({ domainUrl })
  console.log({ client })
  console.log({ domain })
  console.log({ emailData })
  console.log(
    'client.domains?.find((d) => d.toString() === domain._id.toString()): ',
    client.domains?.find((d) => d.toString() === domain._id.toString()),
  )

  if (
    !client ||
    !domain ||
    !emailData ||
    !client.domains?.find((d) => d.toString() === domain._id.toString()) ||
    (domainUrl && domainUrl !== url)
  ) {
    console.log("this won't work")
    return {
      error: 'Error sending mail',
      data: null,
    }
  }

  const { smtpHost, smtpProtocol, smtpPort, smtpUser, smtpPassword, from, to, address } = emailData
  if (!from || !to || !address) {
    return {
      error: 'Error sending mail',
      data: null,
    }
  }

  const form = new formidable.IncomingForm()
  form.keepExtensions = true

  form.parse(req, (err, fields, files) => {
    console.log({ fields })
    console.log({ files })
    if (err) {
      console.log({ err })
      return {
        error: 'Error sending mail',
        data: null,
      }
    }

    const { subject, output } = fields

    console.log({ output })
    console.log({ fields, files })
    const transporter = nodemailer.createTransport({
      host: smtpHost || 'i-mts.net',
      port: smtpPort || 25,
      secure: smtpUser && smtpPassword ? true : false,
      auth: {
        user: smtpUser || 'mail@i-mts.net',
        pass: smtpPassword || 'ASA1!%%ZdWF3E!r4XsD!gv!C',
      },
    })

    const filesArr =
      files &&
      Object.entries(files).map(([key, value]) => {
        return {
          filename: value.name,
          path: value.path,
        }
      })

    const mailOptions = {
      from: `${name} <${from}>`,
      cc: 'ji@mts-online.com',
      // to,
      to: 'ji@mts-online.com',
      subject: subject || `${name} | mail`,
      html: output,
      attachments: filesArr,
    }

    if (output) {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error)
        } else {
          mailOptions.attachments?.map((a) => {
            console.log(`deleteting ${a.path}`)
            return fs.unlinkSync(a.path)
          })
          console.log('Email sent: ' + info.response)
        }
      })

      return {
        error: null,
        data: 'ok',
      }
    } else {
      return {
        error: 'Error sending mail',
        data: null,
      }
    }
  })
  console.log('!!!!')
}

export default Mailer
