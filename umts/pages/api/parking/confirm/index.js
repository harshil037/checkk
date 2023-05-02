import nextConnect from 'next-connect'
import axios from 'axios'
import middleware from '../../../../middlewares/middleware'
import { getParkingToken } from '../../../../lib/db'
import { update } from '../../../../lib/mongoHelpers'
import protectedAPI from '../../../../middlewares/protectedAPI'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI)

handler.post(async (req, res) => {
  const body = JSON.parse(req.body)

  // const ENV = 'TEST'
  const ENV = 'LIVE'

  if (body) {
    const BASE_URL = ENV === 'TEST' ? 'https://test-api.openmove.com' : 'https://api-beta.openmove.com'

    const token = await getParkingToken(req, ENV)

    const header = {
      Authorization: `Bearer ${token[0].token}`,
    }

    try {
      const confirmReservation = await axios({
        method: 'POST',
        url: `${BASE_URL}/parkings/reserve/confirm`,
        data: {
          tickets: [
            {
              _id: body.ticketId[0],
              paymentIntentId: body.ticketId[0],
            },
          ],
        },
        headers: header,
      })
      let parkingCode = []
      if (confirmReservation?.data?.bookings?.length) {
        parkingCode.push(confirmReservation.data.bookings[0].ticket.code.split('##')[0])
        await update({
          db: req.db,
          query: {
            name: body.name,
            surname: body.surname,
            phone: body.phone,
            email: body.email,
            ticketId: body.ticketId[0],
          },
          collection: 'parkingCheckout',
          document: {
            $set: {
              fareId: confirmReservation.data.bookings[0].ticket.fare._id,
              ticketId: [confirmReservation.data.bookings[0].ticket._id],
              // oldTicketId: body.ticketId,
              updatedAt: confirmReservation.data.bookings[0].createdAt,
              parkingCode: parkingCode,
              env: ENV,
              recreatedFromUmts: true,
              paymentStatus: 'success',
              htmlEmails: confirmReservation.data.htmlEmails,
            },
          },
        })
      }
      res.status(200).send({ success: true })
    } catch (e) {
      console.log('==>', e.message)
      res.status(500).send({ success: false, error: e.message })
    }
  } else {
    res.status(400).send({ success: false, error: 'empty body' })
  }
})

export default handler
