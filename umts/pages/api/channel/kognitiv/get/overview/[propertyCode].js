import nextConnect from 'next-connect'
import middleware from '../../../../../../middlewares/middleware'
import protectedAPI from '../../../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../../../middlewares/ensureReqBody'
import axios from 'axios'

const handler = nextConnect()

// handler
//   .use(middleware) //
//   .use(protectedAPI)
//   .use(ensureReqBody)

handler.get(async (req, res) => {
  const token = 42
  //   const overviewType = 'room'
  const {
    propertyCode,
    overviewLength = 20,
    startDate = null,
    checkIn = null,
    los = null,
    occupancy = null,
    roomCode = null,
    rateCode = null,
    overviewType = 'room',
  } = req.query

  const result = await axios.get(
    `https://switch.seekda.com/switch/latest/json/offersOverview.json?skd-property-code=${propertyCode}${
      startDate ? `&skd-start-date=${startDate}` : ''
    }${checkIn ? `&skd-checkin=${checkIn}` : ''}${los ? `&skd-length-of-stay=${los}` : ''}${
      occupancy ? `&skd-occupancy=${occupancy}` : ''
    }&skd-overview-length=${overviewLength}&token=${token}${roomCode ? `&skd-room-codes=${roomCode}` : ''}${
      rateCode ? `&skd-rate-codes=${rateCode}` : ''
    }&skd-overview-type=${overviewType}&skd-channel-id=skyalps`,
  )

  const data = await result.data

  res.status(200).json(data)
})

export default handler
