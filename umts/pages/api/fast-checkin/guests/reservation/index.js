import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import cors from '../../../../../middlewares/cors'
import { getFastCheckinGuest } from '../../../../../lib/db'
import axios from 'axios'

const handler = nextConnect()

handler.use(middleware).use(cors)

handler.get(async (req, res) => {
  const reservationId = req.query.id

  //Local
  // const BASE_URL = 'http://smtsonlinewidget.radixdev65.com'

  //Live
  const BASE_URL = 'https://s.mts-online.com'

  try {
    const response = await axios.get(`${BASE_URL}/booking/getguestdata?reservation_id=${reservationId}`)

    // console.log('==>', response.data)

    if (response.data && response.data.success) {
      const data = await getFastCheckinGuest(req, { reservationId })
      if (data.length) {
        res.status(200).send({ success: true, reservationExists: true, kognitivReservation: true })
      } else {
        res
          .status(200)
          .send({ success: true, reservationExists: false, data: response.data.data, kognitivReservation: true })
      }
    } else {
      // res.status(200).send({ success: false, error: 'Invalid Reservation Id' })
      const data = await getFastCheckinGuest(req, { reservationId })

      if (data.length) {
        // console.log('second')
        res.status(200).send({ success: true, reservationExists: true, kognitivReservation: false })
      } else {
        // console.log('first')
        res.status(200).send({ success: true, reservationExists: false, data: false, kognitivReservation: false })
      }
    }
  } catch (e) {
    res.status(500).send({ success: false, error: 'Some thing went worng' })
  }
})

export default handler
