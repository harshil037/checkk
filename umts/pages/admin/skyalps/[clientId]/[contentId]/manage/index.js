import { useEffect, useState, useRef, useContext } from 'react'
import { useRouter } from 'next/router'
import AvailabilityCalendar from '../../../../../../components/AvailabilityCalendar'
import { AppContext } from '../../../../../../context/appContext'
import Authenticate from '../../../../../../lib/authenticate'
import { useUser } from '../../../../../../lib/hooks'
import Button from '../../../../../../components/common/Button'
import useConfirm from '../../../../../../components/dialog/useConfirm'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export default function Availability() {
  const router = useRouter()
  const sliderRef = useRef(null)
  const sliderRef2 = useRef(null)

  const [room, setRoom] = useState([])
  const [kognitivCalendarData, setKognitivCalendarData] = useState([])
  const [skyalpsCalendarData, setSkyalpsCalendarData] = useState([])
  const [page, , setLoading] = useContext(AppContext)
  const [overviewLength, setOverviewLength] = useState(365)
  const [currency, setCurrency] = useState('EUR')
  const [skyalpsHotelId, setSkyalpsHotelId] = useState('')
  const [skyalpsXtoken, setSkyalpsXtoken] = useState('')
  const [skyalpsHostId, setSkyalpsHostId] = useState('')

  const [user, { mutate }] = useUser()

  const { isConfirmed } = useConfirm()

  const date = new Date()

  const startDate = date.toISOString().split('T')[0]

  // const propertyCode = 'S004006'

  const { kognitivRoomCode, skyalpsRoomCode, skyalpsRateCode, kognitivRateCode, propertyCode, clientId, contentId } =
    router.query

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
  const makeCalendarData = (availabilityInfo, ratesInfo = [], restrictions = []) => {
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

  /**
   * this function will get the room's availability from kognitiv and skyalps and make calendar data.
   * @param {string} skyalpsHostId skyalps host id
   * @param {string} skyalpsXtoken skyalps xtoken
   * @param {string} skyalpsHotelCode skyalps hotel code
   * @returns {Promise}
   */
  const syncData = async (skyalpsHostId, skyalpsXtoken, skyalpsHotelCode) => {
    setLoading(true)

    const kognitivUrl = `/api/channel/kognitiv/get/overview/${propertyCode}?roomCode=${kognitivRoomCode}&rateCode=${kognitivRateCode}&startDate=${startDate}&overviewLength=${overviewLength}&overviewType=rate`

    const response = await fetch(kognitivUrl)

    const data = await response.json()

    console.log({ data })

    if (data.overview.entities.length > 0) {
      const restrictions = data.overview.entities[0].restrictions.split('')

      setRoom(data.overview.entities[0])

      setKognitivCalendarData(
        makeCalendarData(data.overview.entities[0].availabilities, data.overview.entities[0].prices, restrictions),
      )

      setCurrency(data.overview.currency.toUpperCase())

      const res = await fetch('/api/channel/skyalps/get/availability-and-rates', {
        method: 'post',
        body: JSON.stringify({
          hostId: skyalpsHostId,
          xtoken: skyalpsXtoken,
          hotelCode: skyalpsHotelCode,
          roomCode: skyalpsRoomCode,
          rateCode: skyalpsRateCode,
          startDate: startDate,
          periodLength: overviewLength,
        }),
      })

      const skyalpsRoom = await res.json()
      const skyalpsRateData = skyalpsRoom.DateList.DateInfo.map((skyRoom) => parseInt(skyRoom.Amount))
      const skyalpsAvilData = skyalpsRoom.DateList.DateInfo.map((skyRoom) => parseInt(skyRoom.Avail))

      setSkyalpsCalendarData(makeCalendarData(skyalpsAvilData, skyalpsRateData))

      setLoading(false)
    } else {
      setLoading(false)
      await isConfirmed('No data available for selected room or rate plan', true)
      setLoading(true)
      router.push(`/admin/skyalps/${clientId}/${contentId}`)
    }
  }

  useEffect(async () => {
    if (kognitivRoomCode && user) {
      const res = await fetch(`/api/channel/${clientId}/mappings`)
      const response = await res.json()
      setSkyalpsHotelId(response.skyalpsHotelCode)
      setSkyalpsHostId(response.skyalpsHostId)
      setSkyalpsXtoken(response.xtoken)

      // console.log(response)
      if (response.success) {
        await syncData(response.data.skyalpsHostId, response.data.xtoken, response.data.skyalpsHotelCode)
      }
    }
  }, [kognitivRoomCode, overviewLength])

  // const handleAvailabilitySync = async () => {
  //   const confirm = await isConfirmed('Are you sure you want to sync availability for selected period?')
  //   if (confirm) {
  //     setLoading(true)
  //     const res = await fetch('/api/channel/skyalps/manage/availability', {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         roomData: kognitivCalendarData,
  //         roomCode: skyalpsRoomCode,
  //         rateCode: skyalpsRateCode,
  //         hostId: skyalpsHostId,
  //         xtoken: skyalpsXtoken,
  //         hotelCode: skyalpsHotelId,
  //       }),
  //     })
  //     const result = await res.json()

  //     if (result.success) {
  //       setTimeout(async () => {
  //         await syncData(skyalpsHostId, skyalpsXtoken, skyalpsHotelId)
  //       }, 8000)
  //     } else {
  //       setLoading(false)
  //     }
  //   }

  //   // ***********************
  //   // const res = await fetch('/api/channel/runner')
  //   // const result = await res.json()
  //   // console.log(result)
  // }

  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    adaptiveHeight: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  return (
    <div className="text-left font-ptsans">
      <div className="bg-white rounded-lg mt-8 p-4">
        <div className="flex justify-between mt-4">
          <h1 className="text-gray-600 font-bold text-3xl">Sync Room</h1>
          <div className="text-gray-600">
            <span className="text-lg">Manage Period :</span>
            <select
              className="py-2 ml-4 px-4 rounded-md outline-none border bg-white border-gray-400"
              onChange={(e) => setOverviewLength(e.target.value)}
              value={overviewLength}
            >
              <option value={30}>1 Month</option>
              <option value={91}>3 Months</option>
              <option value={182}>6 Months</option>
              <option value={365}>12 Months</option>
            </select>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-600 my-4">Room: {room.name}</h2>
        <div className="mt-4 availability-slider mx-auto">
          <div className="text-gray-500 flex justify-between">
            <h2 className="text-xl">Kognitiv Availability</h2>
            <h2 className="text-xl">
              Room Code: <span className="text-gray-600 text-xl">{room.room_code}</span>
            </h2>
            <h2 className="text-xl">
              Rate Code: <span className="text-gray-600 text-xl">{room.rate_code}</span>
            </h2>
          </div>
          <div className="relative my-4 bg-gray-50 border p-2 border-gray-300 mx-auto">
            {kognitivCalendarData.length > 4 && (
              <div
                className="absolute z-10 flex items-center justify-center w-8 h-8  top-5 left-3  cursor-pointer select-none"
                onClick={() => sliderRef.current.slickPrev()}
              >
                <img src="/images/availability-arrow.svg" width="40" height="40" />
              </div>
            )}
            <Slider {...settings} ref={sliderRef}>
              {kognitivCalendarData.map((calendar, index) => (
                <AvailabilityCalendar
                  month={calendar.month}
                  year={calendar.year}
                  availabilityInfo={calendar.availabilityInfo}
                  ratesInfo={calendar.ratesInfo}
                  key={calendar.month + '-' + index}
                  currency={currency}
                />
              ))}
            </Slider>
            {kognitivCalendarData.length > 4 && (
              <div
                className="z-10 absolute flex items-center justify-center w-8 h-8 top-5 right-3  transform rotate-180 cursor-pointer select-none "
                onClick={() => sliderRef.current.slickNext()}
              >
                <img src="/images/availability-arrow.svg" width="40" height="40" />
              </div>
            )}
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 calendar-green"></div>
            <span className="mx-3 mr-10 text-sm opacity-80">Available</span>
            <div className="w-5 h-5 calendar-red"></div>
            <span className="mx-3 mr-10 text-sm opacity-80">Not Available</span>
            <div className="w-5 h-5 calendar-gray"></div>
            <span className="mx-3 mr-10 text-sm opacity-80">Disabled</span>
          </div>
        </div>

        <div className="mt-16 availability-slider mx-auto">
          <div className="text-gray-500 flex justify-between">
            <h2 className="text-xl">Skyalps Availability</h2>
            <h2 className="text-xl">
              Room Code: <span className="text-gray-600 text-xl">{skyalpsRoomCode}</span>
            </h2>
            <h2 className="text-xl">
              Rate Code: <span className="text-gray-600 text-xl">{skyalpsRateCode}</span>
            </h2>
          </div>
          <div className="relative my-4 bg-gray-50 border p-2 border-gray-300 mx-auto">
            {skyalpsCalendarData.length > 4 && (
              <div
                className="absolute z-10 flex items-center justify-center w-8 h-8  top-5 left-3  cursor-pointer select-none"
                onClick={() => sliderRef2.current.slickPrev()}
              >
                <img src="/images/availability-arrow.svg" width="40" height="40" />
              </div>
            )}
            <Slider {...settings} ref={sliderRef2}>
              {skyalpsCalendarData.map((calendar, index) => (
                <AvailabilityCalendar
                  month={calendar.month}
                  year={calendar.year}
                  availabilityInfo={calendar.availabilityInfo}
                  ratesInfo={calendar.ratesInfo}
                  key={calendar.month + '-' + index}
                  currency={currency}
                />
              ))}
            </Slider>
            {skyalpsCalendarData.length > 4 && (
              <div
                className="z-10 absolute flex items-center justify-center w-8 h-8 top-5 right-3 transform rotate-180 cursor-pointer select-none "
                onClick={() => sliderRef2.current.slickNext()}
              >
                <img src="/images/availability-arrow.svg" width="40" height="40" />
              </div>
            )}
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 calendar-green"></div>
            <span className="mx-3 mr-10 text-sm opacity-80">Available</span>
            <div className="w-5 h-5 calendar-red"></div>
            <span className="mx-3 mr-10 text-sm opacity-80">Not Available</span>
            <div className="w-5 h-5 calendar-gray"></div>
            <span className="mx-3 mr-10 text-sm opacity-80">Disabled</span>
          </div>
        </div>

        {/* <div className="text-right">
          <Button type="button" variant="primary" onClick={handleAvailabilitySync}>
            Sync Availability
          </Button>
        </div> */}
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  return Authenticate(context)
}
