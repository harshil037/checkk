import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import protectedAPI from '../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../middlewares/ensureReqBody'
import { getAllSkyalpsRecords } from '../../../../lib/db'
import axios from 'axios'

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
 * @returns {Month[]} calendar data
 */
const makeCalendarData = (availabilityInfo = [], ratesInfo = [], restrictions = []) => {
  const date = new Date()
  const arr = new Array(date.getDate() - 1).fill('-')
  // const availability = data.overview.entities[0].availabilities
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
// .use(protectedAPI)
// .use(ensureReqBody)

handler.get(async (req, res) => {
  const syncLength = 10
  const date = new Date()
  const startDate = date.toISOString().split('T')[0]

  const result = await getAllSkyalpsRecords(req)
  const abcd = []

  const hotels = []
  for (let i = 0; i < result.length; i++) {
    const hotel = {
      clientId: result[i].clientId,
      kognitivHotelCode: result[i].kognitivHotelCode,
      skyalpsHostId: result[i].skyalpsHostId,
      xtoken: result[i].xtoken,
      skyalpsHotelCode: result[i].skyalpsHotelCode,
      isActive: result[i].isActive,
      mappings: result[i].mappings.filter((item) => item.skyalpsRoom !== null),
    }
    hotels.push(hotel)
  }

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i]
    const mappings = hotel.mappings
    const { isActive } = hotel
    if (isActive) {
      for (let j = 0; j < mappings.length; j++) {
        const room = mappings[j]
        const kognitivUrl = `/api/channel/kognitiv/get/overview/${hotel.kognitivHotelCode}?roomCode=${room.roomCode}&rateCode=${room.rateCode}&startDate=${startDate}&overviewLength=${syncLength}&overviewType=rate`

        try {
          const res = await fetch(kognitivUrl)
          const { overview } = await res.json()
          const availability = overview.entities[0].availabilities
          const rates = overview.entities[0].prices
          const restrictions = overview.entities[0].restrictions.split('')
          const kognitivData = makeCalendarData(availability, rates, restrictions)

          try {
            const manageRes = await fetch('/api/channel/skyalps/manage/availability', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                roomData: kognitivData,
                roomCode: room.skyalpsRoom.roomCode,
                rateCode: room.skyalpsRoom.rateCode,
                hostId: hotel.skyalpsHostId,
                xtoken: hotel.xtoken,
                hotelCode: hotel.skyalpsHotelCode,
              }),
            })
            const manageResult = await manageRes.json()

            abcd.push({
              data: {
                // roomData: kognitivData,
                skyalpsHotelCode: hotel.skyalpsHotelCode,
                roomCode: room.skyalpsRoom.roomCode,
                rateCode: room.skyalpsRoom.rateCode,
              },
              success: manageResult.success,
            })
          } catch (error) {
            console.log('=== error in sending data to skyalps ===>', error)
          }
        } catch (error) {
          console.log('=== error in getting data from kognitiv ===>', error)
        }
      }
    }
  }

  res.send({ success: true, data: abcd })
})

export default handler
