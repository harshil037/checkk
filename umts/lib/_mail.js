import nodemailer from 'nodemailer'

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
              console.log('Email sent: ' + info.response)
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

export default Mailer
