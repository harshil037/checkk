import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import protectedAPI from '../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../middlewares/ensureReqBody'
import cors from '../../../../middlewares/cors'
import { getAllPaymentRecords, createPaymentRecord } from '../../../../lib/db'

const handler = nextConnect()

handler.use(middleware)
//  .use(protectedAPI).use(ensureReqBody).use(cors)

handler.get(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)

  const result = await getAllPaymentRecords(req)
  res.json(result)
})

handler.post(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)

  try {
    let data = JSON.parse(req.body)
    console.log({ body: req.body })
    const paymentStatusResponse = await fetch(
      `https://eu-test.oppwa.com/v1/checkouts/${data.payment.checkoutId}/payment?entityId=8a829418530df1d201531299e097175c`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer OGE4Mjk0MTg1MzBkZjFkMjAxNTMxMjk5ZTJjMTE3YWF8ZzJnU3BnS2hLUw==`,
        },
      },
    )
    if (!paymentStatusResponse.ok) {
      return res.json({
        data: null,
        error: 'Error in payment',
      })
    }
    const paymentStatus = await paymentStatusResponse.json()
    data = {
      ...data,
      payment: {
        ...data.payment,
        ...paymentStatus,
      },
    }
    const result = await createPaymentRecord(req, data)
    const transporter = nodemailer.createTransport({
      host: 'mail.mailtest.radixweb.net',
      port: 465,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: 'testphp@mailtest.radixweb.net',
        pass: 'Radixweb8',
      },
    })

    const mailOptions = {
      from: `testphp@mailtest.radixweb.net`,
      // cc: ` ${cc}`,
      to: data.customer.email,
      subject: `Payment Test`,
      html: `Test Mail`,
    }

    let info = await transporter.sendMail(mailOptions)
    if (info) {
      res.json(result)
    } else {
      res.json({
        data: null,
        error: 'Mail not sent',
      })
    }
    // res.json(result)
  } catch (error) {
    return res.json({
      code: 400,
      message: error.response.data,
      field: 'FIELD',
      type: 'TYPE',
    })
  }
})

export default handler
