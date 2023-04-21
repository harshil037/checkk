import nextConnect from 'next-connect'
import middleware from '../../../../../../middlewares/middleware'
import { getSkyalpsKognitivHotelCodeMappings, createSkyalpsErrorRecord } from '../../../../../../lib/db'
import axios from 'axios'
import { makeAvailabilitySoapBody, makeRatesSoapBody } from '../../../../../../lib/skyalpsHelpers'
import { soapRequest } from '../../../../../../lib/soapRequest'

const handler = nextConnect()

/**
 * to gate days in particular
 * @param {number} month number from 1(Jan) to 12(Dec)
 * @param {number} year full year eg : 2022
 * @returns {number} number of days eg : 30
 */
function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate()
}

/**
 * @typedef Month
 * @property {number} month represents month from 1(JAN) to 2(DEC)
 * @property {number} year full year eg: 2022
 * @property {number[]} availabilityInfo rooms's availability
 * @property {number[]} ratesInfo rooms's rates
 * @property {string[]} restriction room's restriction
 */
/**
 * this function will get the room's availability from kognitiv and skyalps and make calendar data.
 * @param {number[]} availabilityInfo array of room's availability
 * @param {number[]} ratesInfo array of room's rate
 * @param {string[]} restrictions array of room's restrictions
 * @param {string} startDate startdate
 * @returns {Month[]} calendar data
 */
const makeCalendarData = (availabilityInfo = [], ratesInfo = [], restrictions = [], startDate = null) => {
  const date = startDate ? new Date(startDate) : new Date()

  const arr = new Array(date.getDate() - 1).fill('-')

  let newAvailArr = [...arr, ...availabilityInfo]
  let newRatesArr = [...arr, ...ratesInfo]
  let restArr = [...arr, ...restrictions]

  let currentMonth = date.getMonth() + 1
  let currentYear = date.getFullYear()
  let calanderData = []

  while (newAvailArr.length > 0) {
    if (currentMonth <= 12) {
      let currentAvailInfo = newAvailArr.splice(0, daysInMonth(currentMonth, currentYear))
      let currentRatesInfo = newRatesArr.splice(0, daysInMonth(currentMonth, currentYear))
      let currentRest = restArr.splice(0, daysInMonth(currentMonth, currentYear)) || ''
      calanderData.push({
        month: currentMonth,
        year: currentYear,
        availabilityInfo: currentAvailInfo,
        ratesInfo: currentRatesInfo,
        restriction: currentRest,
      })
      currentMonth++
    } else {
      currentMonth = 1
      currentYear++
    }
  }

  return calanderData
}

handler.use(middleware) //
//   .use(protectedAPI)
//   .use(ensureReqBody)

/**
 * to get date difference
 * @param {string} firstDate
 * @param {string} secondDate
 * @returns {number}
 */
const getDateDifference = (firstDate, secondDate) => {
  const date1 = new Date(firstDate)
  const date2 = new Date(secondDate)
  const diffTime = Math.abs(date2 - date1)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

handler.post(async (req, res) => {
  const token = 42
  const { hotelCode, updateTimestamp, updates } = req.body

  for (let i = 0; i < updates.length; i++) {
    const update = updates[i]
    const { roomCode, ratePlanCode = null, startDate, endDate } = update

    const overviewLength = getDateDifference(startDate, endDate) + 1

    const overviewType = 'rate'

    try {
      const result = await getSkyalpsKognitivHotelCodeMappings(req, hotelCode)

      if (result && result.isActive) {
        const { skyalpsHostId, xtoken, skyalpsHotelCode, mappings } = result

        const room = ratePlanCode
          ? mappings.filter((room) => room.roomCode === roomCode && room.rateCode === ratePlanCode && room.skyalpsRoom)
          : mappings.filter((room) => room.roomCode === roomCode && room.skyalpsRoom)

        if (room.length) {
          const { skyalpsRoom } = room[0]

          const response = await axios.get(
            `https://switch.seekda.com/switch/latest/json/offersOverview.json?skd-property-code=${hotelCode}${
              startDate ? `&skd-start-date=${startDate}` : ''
            }&skd-overview-length=${overviewLength}&token=${token}${roomCode ? `&skd-room-codes=${roomCode}` : ''}${
              ratePlanCode ? `&skd-rate-codes=${ratePlanCode}` : ''
            }&skd-overview-type=${overviewType}&skd-channel-id=GOOGLE`,
          )

          const { overview } = response.data

          const availability = overview.entities[0].availabilities
          const rates = overview.entities[0].prices
          const restrictions = overview.entities[0].restrictions.split('')

          const roomData = makeCalendarData(availability, rates, restrictions, startDate)

          const availXML = makeAvailabilitySoapBody(
            roomData,
            skyalpsRoom.roomCode,
            skyalpsHostId,
            xtoken,
            skyalpsHotelCode,
          )

          const ratesXML = ratePlanCode
            ? makeRatesSoapBody(
                roomData,
                skyalpsRoom.rateCode,
                skyalpsRoom.roomCode,
                skyalpsHostId,
                xtoken,
                skyalpsHotelCode,
              )
            : ''

          const url = 'http://avesnet02.datagest.it:8080/skyalps.az1.test/interop/channelManagerAves/v2/soap'

          const availabilityHeaders = {
            'Content-Type': 'text/xml;charset=UTF-8',
            soapAction: 'urn:IChannelManagerService/ManageAvailability',
          }

          const ratesHeaders = {
            'Content-Type': 'text/xml;charset=UTF-8',
            soapAction: 'urn:IChannelManagerService/ManageRates',
          }

          const { response: avilResponse } = await soapRequest({
            url: url,
            headers: availabilityHeaders,
            xml: availXML,
          })

          const { headers, body, statusCode } = avilResponse

          if (statusCode === 200) {
            if (ratesXML) {
              const { response: ratesResponse } = await soapRequest({ url: url, headers: ratesHeaders, xml: ratesXML })
              const { headers, body, statusCode } = ratesResponse

              if (statusCode !== 200) {
                await createSkyalpsErrorRecord(req, {
                  type: 'rates and availability',
                  payload: { hotelCode, ...update },
                  error: 'error while sending rates to skyalps',
                  updateTimestamp: updateTimestamp,
                })
              }
            }
          } else {
            await createSkyalpsErrorRecord(req, {
              type: 'rates and availability',
              payload: { hotelCode, ...update },
              error: 'error while sending availability to skyalps',
              updateTimestamp: updateTimestamp,
            })
          }
        }
      }
    } catch (error) {
      console.log('eror while getting hotel info from kognitiv =>', error)
      await createSkyalpsErrorRecord(req, {
        type: 'rates and availability',
        payload: { hotelCode, ...update },
        error: error,
        updateTimestamp: updateTimestamp,
      })
    }
  }

  res.status(200).json({ success: true })
})

export default handler
