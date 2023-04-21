import nextConnect from 'next-connect'
import { ObjectId } from 'mongodb'
import axios from 'axios'
import middleware from '../../../../middlewares/middleware'
import cors from '../../../../middlewares/cors'
import { saveFastCheckinRecord, getContent } from '../../../../lib/db'
import { validate } from '../../../../middlewares/validationMiddleware'
import fastCheckInSchema from '../../../../validations/fastCheckIns'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN

const handler = nextConnect()

handler.use(middleware).use(cors).use(validate(fastCheckInSchema))

handler.post(async (req, res) => {
  if (req.headers['x-access-token'] === ACCESS_TOKEN) {
    const data = JSON.parse(req.body)

    if (data.guests && data.guests.length) {
      const result = await saveFastCheckinRecord(req, data)

      if (data.productId) {
        const product = await getContent(req, [ObjectId(data.productId)])

        if (product && product.length) {
          // sending mail to hotel
          const sendMail = await axios.post('https://worker.mts-online.com/api/fast-checkin/mail', {
            ...data,
            language: product[0].components[0].blockProps.emailLanguage || 'de',
          })
        }
      }

      if (result) {
        res.status(200).send({ success: true })
      } else {
        console.log('error while saving inquiry in db', req.body)
        res.status(500).send({ success: false })
      }
    } else {
      res.status(400).send({ success: false, message: 'empty body' })
    }
  } else {
    res.status(401).send({ success: false, message: 'Unauthorized' })
  }
})

export default handler
