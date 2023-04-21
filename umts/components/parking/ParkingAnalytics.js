import React, { useState, useContext, useEffect, useRef } from 'react'
import { AppContext } from '../../context/appContext'
import translations from '../../translations/parking.json'
import PopUp from '../dialog/popUp'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_green.css'
import { English } from 'flatpickr/dist/l10n/default.js'
import { German } from 'flatpickr/dist/l10n/de.js'
import { Italian } from 'flatpickr/dist/l10n/it.js'

const ParkingAnalytics = ({ language = 'en' }) => {
  const refCalendar = useRef()
  const appendTo = refCalendar?.current
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const [notificationModal, setNotificationModal] = useState({ open: false, message: '', title: '', type: 'succes' })

  const [selectedDate, setSelectedDate] = useState([new Date(), new Date()])
  const [analytics, setAnalytics] = useState({})

  const customDateYMD = (parkingDateFrom) => {
    return `${parkingDateFrom.getFullYear()}-${('0' + (parkingDateFrom.getMonth() + 1)).slice(-2)}-${(
      '0' + parkingDateFrom.getDate()
    ).slice(-2)}`
  }
  const customDateDMY = (parkingDateFrom) => {
    return `${('0' + parkingDateFrom.getDate()).slice(-2)}-${('0' + (parkingDateFrom.getMonth() + 1)).slice(
      -2,
    )}-${parkingDateFrom.getFullYear()}`
  }

  const handleDailyAnalitycs = async (arrDate) => {
    setLoading(true)
    try {
      // const from = arrDate[0].toISOString().split('T')[0]
      // const to = arrDate[1].toISOString().split('T')[0]
      const from = customDateYMD(arrDate[0])
      const to = customDateYMD(arrDate[1])

      const res = await fetch(`/api/parking/analytics?fromDate=${from}&toDate=${to}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      setLoading(false)
      setAnalytics(data?.data)
    } catch (e) {
      setNotificationModal({
        open: true,
        message: e.message,
        title: 'Error',
        type: 'danger',
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    handleDailyAnalitycs(selectedDate)
  }, [selectedDate])

  // multi language
  const [labels, setLabels] = useState({})
  const getTranslation = (translations, language) => {
    const translationObj = {}
    for (const translation in translations) {
      translationObj[translation] = translations[translation][language] || translation
    }
    return translationObj
  }
  useEffect(() => {
    const translation = getTranslation(translations.analytics, language)
    setLabels(translation)
  }, [language])

  // /** allowed language for calendar locale prop */
  const calenderLocale = {
    en: 'en-US',
    de: 'de-DE',
    it: 'it-IT',
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg">
      <div className="flex justify-between py-3 mx-4 border-b border-black border-solid ">
        <div className="flex items-center justify-between py-1 text-gray-600">
          <h3 className="text-xl font-bold">{labels.parkingAnalytics}</h3>
        </div>
      </div>
      <div>
        {/* <div className={styles.calendar}>
          <Calendar
            className={`text-xs lg:text-base`}
            onChange={(value) => {
              setSelectedDate(value)
            }}
            // onChange={setSelectedDate}
            value={selectedDate}
            calendarType="ISO 8601"
            selectRange={true}
            returnValue={'range'}
            locale={calenderLocale[language]}
            showDoubleView={true}
            // allowPartialRange={true}
          ></Calendar>
        </div> */}
        <div ref={refCalendar} className={`calendar`}>
          <Flatpickr
            style={{
              border: '1px solid #ccc',
            }}
            className={`rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-outline hidden`}
            value={selectedDate}
            options={{
              showMonths: 1,
              mode: 'range',
              dateFormat: 'd-m-Y',
              enableTime: false,
              inline: true,
              position: 'auto',
              appendTo,
              locale:
                language == 'de'
                  ? { ...German, firstDayOfWeek: 1 }
                  : language == 'it'
                  ? { ...Italian, firstDayOfWeek: 1 }
                  : { ...English, firstDayOfWeek: 1 },
            }}
            onChange={([date1, date2]) => {
              if (date1 && date2) setSelectedDate([date1, date2])
            }}
          />
        </div>
        {/* {Object.keys(analytics).length > 0 && ( */}
        <>
          <div
            className="flex flex-wrap justify-center gap-4 mx-auto my-8 text-center lg:w-full"
            // style={{ width: '70vw' }}
          >
            <div className="flex flex-col p-8 mx-5 my-0 border border-gray-200 rounded-md shadow-md cursor-pointer place-items-center">
              <span className="text-base lg:text-lg">{labels.totalSoldTickets}</span>
              <div className="flex mx-0 my-3">
                <span className="text-3xl font-semibold">{analytics?.dailySold}</span>
              </div>
              <span className="text-base text-gray-400">
                {customDateDMY(selectedDate[0])}/{customDateDMY(selectedDate[1])}
              </span>
            </div>
            <div className="flex flex-col p-8 mx-5 my-0 border border-gray-200 rounded-md shadow-md cursor-pointer place-items-center">
              <span className="text-base lg:text-lg">{labels.totalParking}</span>
              <div className="flex mx-0 my-3">
                <span className="text-3xl font-semibold">{analytics?.dailyExid}</span>
              </div>
              <span className="text-base text-gray-400">
                {customDateDMY(selectedDate[0])}/{customDateDMY(selectedDate[1])}
              </span>
            </div>
            <div className="flex flex-col p-8 mx-5 my-0 border border-gray-200 rounded-md shadow-md cursor-pointer place-items-center">
              <span className="text-base lg:text-lg">{labels.totalSalesPrice}</span>
              <div className="flex mx-0 my-3">
                <span className="text-3xl font-semibold">
                  {`${new Intl.NumberFormat(`${language}-${language?.toUpperCase()}`, {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(analytics?.totalAmount)}`}
                </span>
              </div>
              <span className="text-base text-gray-400">
                {customDateDMY(selectedDate[0])}/{customDateDMY(selectedDate[1])}
              </span>
            </div>
            <div className="flex flex-col p-8 mx-5 my-0 border border-gray-200 rounded-md shadow-md cursor-pointer place-items-center">
              <span className="text-base lg:text-lg">{labels.voucherTickets}</span>
              <div className="flex mx-0 my-3">
                <span className="text-3xl font-semibold">{analytics?.voucherCount}</span>
              </div>
              <span className="text-base text-gray-400">
                {customDateDMY(selectedDate[0])}/{customDateDMY(selectedDate[1])}
              </span>
            </div>
            <div className="flex flex-col p-8 mx-5 my-0 border border-gray-200 rounded-md shadow-md cursor-pointer place-items-center">
              <span className="text-base lg:text-lg">{labels.dailyTickets}</span>
              <div className="flex mx-0 my-3">
                <span className="text-3xl font-semibold">{analytics?.dailyCount}</span>
              </div>
              <span className="text-base text-gray-400">
                {customDateDMY(selectedDate[0])}/{customDateDMY(selectedDate[1])}
              </span>
            </div>
          </div>
          {/* <div className="flex justify-center text-gray-600">
            <h3 className="text-lg font-bold lg:text-xl">{labels.totalSoldTickets}</h3>
          </div> */}
        </>
        {/* )} */}
      </div>
      {notificationModal.open && (
        <PopUp openModal={notificationModal.open}>
          <div className="h-full p-6 mx-auto my-auto mt-32 overflow-hidden bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-2/5">
            <div className="flex items-center justify-between pb-2 border-b border-black border-solid">
              <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">
                {notificationModal.title}
              </h1>
              <div className="flex items-center gap-2">
                <svg
                  onClick={() => {
                    setNotificationModal({ open: false, message: '', title: '', type: 'success' })
                  }}
                  className="w-4 h-4 cursor-pointer fill-current sm:w-6 sm:h-6"
                  role="button"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>
            <div
              className={`text-center ${notificationModal.type === 'danger' ? 'text-red-500' : 'text-green-500'} mt-6`}
            >
              {notificationModal.message}
            </div>
          </div>
        </PopUp>
      )}
    </div>
  )
}

export default ParkingAnalytics
