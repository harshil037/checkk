import nextConnect from 'next-connect'
import axios from 'axios'
import middleware from '../../../../middlewares/middleware'
import { getParkingToken } from '../../../../lib/db'
import { update, insert } from '../../../../lib/mongoHelpers'
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
      // Checking for parking availability
      const getParkings = await axios({
        method: 'GET',
        url: `${BASE_URL}/parkings?fromDate=${body.fromDate}&toDate=${body.toDate}`,
        headers: header,
      })

      // finding the same parking spot
      const parkingSpot = getParkings.data.find(
        (parking) => parking.fareAttrs.en.parkingCode === body.voucherCode && parking.fareType.id === body.fareTypeId,
      )

      if (parkingSpot) {
        // reserving the parking spot
        const reserveParkings = await axios({
          method: 'POST',
          url: `${BASE_URL}/parkings/reserve`,
          data: {
            tickets: [
              {
                fareId: parkingSpot.fareId,
                fareTypeId: parkingSpot.fareType.id,
                fromDate: parkingSpot.timeSlot.start,
                toDate: parkingSpot.timeSlot.end,
              },
            ],
          },
          headers: header,
        })

        if (reserveParkings?.data?.respTickets?.[0]?.ticketId) {
          // Adding the user details to the reserved parking
          await axios({
            method: 'PUT',
            url: `${BASE_URL}/parkings/reserve`,
            data: {
              tickets: [
                {
                  _id: reserveParkings.data.respTickets[0].ticketId,
                  user: {
                    name: body.name,
                    surname: body.surname,
                    nationality: body.nationality,
                    email: body.email,
                    plate: body.plate[0],
                    phone: body.phone,
                    tnc: body.tnc,
                    commercial: body.commercial,
                    lang: body.language,
                  },
                },
              ],
            },
            headers: header,
          })

          // confirming the parking
          const confirmReservation = await axios({
            method: 'POST',
            url: `${BASE_URL}/parkings/reserve/confirm`,
            data: {
              tickets: [
                {
                  _id: reserveParkings.data.respTickets[0].ticketId,
                  paymentIntentId: reserveParkings.data.intentTicketsIds[0],
                },
              ],
            },
            headers: header,
          })

          if (confirmReservation?.data?.bookings?.length) {
            const parkingCode = []

            for (const booking of confirmReservation.data.bookings) {
              parkingCode.push(booking.ticket.code.split('##')[0])
            }

            const document = {
              ...body,
              fareId: confirmReservation.data.bookings[0].ticket.fare._id,
              ticketId: [confirmReservation.data.bookings[0].ticket._id],
              oldTicketId: body.ticketId,
              createdAt: new Date(confirmReservation.data.bookings[0].createdAt),
              updatedAt: new Date(confirmReservation.data.bookings[0].createdAt),
              env: ENV,
              recreatedFromUmts: true,
              paymentStatus: 'success',
              htmlEmails: confirmReservation.data.htmlEmails,
              parkingCode: parkingCode,
              isRebooked: true,
            }

            delete document._id

            await insert({ db: req.db, collection: 'parkingCheckout', document })
          }
        }
        res.status(200).send({ success: true })
      } else {
        res.status(404).send({ success: false, error: 'parking spot unavailable' })
      }
    } catch (e) {
      console.log('==>', e.message)
      res.status(500).send({ success: false, error: e.message })
    }
  } else {
    res.status(400).send({ success: false, error: 'empty body' })
  }
})

export default handler
