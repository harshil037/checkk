import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import nodemailer from 'nodemailer'

// For to get Parking checkout list

const handler = nextConnect()
handler.use(middleware)

handler.post(async (req, res) => {
  const {error, data} = await Mailer({req, emailData:{smtpHost:"i-mts.net", smtpPort:25, smtpUser:'mail@i-mts.net', smtpPassword:'ASA1!%%ZdWF3E!r4XsD!gv!C'}})
  if ((error)) {
    res.status(200).json({success:false, error:error})
  } else {
    res.status(200).json({ success: true, data })
  }
})

export default handler



const Mailer = async ({ req, emailData }) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPassword } = emailData || {}
    const { subject, output, from, to, cc } = req.body
    if (!from || !to) {
      return {
        error: 'Error sending mail',
        data: null,
      }
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost || 'localhost',
      port: smtpPort || 25,
      secure: smtpUser && smtpPassword ? true : false,
      auth: {
        user: smtpUser || 'mail@i-mts.net',
        pass: smtpPassword || 'ASA1!%%ZdWF3E!r4XsD!gv!C',
      },
    })

    const mailOptions = {
      from: ` ${from}`,
      cc: ` ${cc}`,
      to,
      subject: subject || `mail`,
      html: output,
    }

    if (output) {
      const mailFn = () => {
        return new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error.message)
              reject({error:error, data:null})
            } else {
              // console.log('Email sent: ' + info.response)
              resolve({data:info.response, error:null})
            }
          })
        })
      }
      return await mailFn();
    } else {
      return {
        error: 'Error sending mail',
        data: null,
      }
    }
  } catch (err) {
    console.log(err)
    return {
      error: err,
      data: null,
    }
  }
}