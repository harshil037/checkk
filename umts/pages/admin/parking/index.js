import React, { useState, useContext, useEffect } from 'react'
import ParkingTickets from '../../../components/parking/ParkingTickets'
import CustomerAccounts from '../../../components/parking/CustomerAccounts'
import ParkingAnalytics from '../../../components/parking/ParkingAnalytics'
import ParkingTransactions from '../../../components/parking/ParkingTransactions'

import Authenticate from '../../../lib/authenticate'
import { AppContext } from '../../../context/appContext'
import translations from '../../../translations/parking.json'
import { CSVLink } from 'react-csv'
import MultiSelect from '../../../components/parking/MultiSelect'

const Parking = () => {
  const ticketsTab = 'ticketsTab'
  const accountTab = 'accountTab'
  const transactionTab = 'transactionTab'
  const analyticsTab = 'analyticsTab'
  const [tab, setTab] = useState(ticketsTab)
  const [contextData, setContextData, setLoading] = useContext(AppContext)

  // multi language
  const [language, setLanguage] = useState('en')
  const [labels, setLabels] = useState({})
  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'parking',
    }))

    if (window.localStorage.getItem('mts-language')) {
      setLanguage(window.localStorage.getItem('mts-language'))
    } else {
      window.localStorage.setItem('mts-language', language)
    }

    if (window.localStorage.getItem('mts-parking')) {
      const parking = JSON.parse(window.localStorage.getItem('mts-parking'))
      setColumns(parking.columns)
    } else {
      window.localStorage.setItem('mts-parking', JSON.stringify({ columns }))
    }

    if (window.localStorage.getItem('mts-tab')) {
      setTab(window.localStorage.getItem('mts-tab'))
    } else {
      window.localStorage.setItem('mts-tab', tab)
    }
  }, [])

  const { parkingTabs, tickets, header } = translations
  const getTranslation = (translations, language) => {
    const translationObj = {}
    for (const translation in translations) {
      translationObj[translation] = translations[translation][language] || translation
    }
    return translationObj
  }
  useEffect(() => {
    const translation = getTranslation({ ...parkingTabs, ...tickets, ...header }, language)
    setLabels(translation)
  }, [language])

  const handleLanguage = (e) => {
    setLanguage(e.target.value)
    window.localStorage.setItem('mts-language', e.target.value)
  }

  // export
  const [exportData, setExportData] = useState([])
  // columns : Multi Select
  const options = [
    { title: labels.createdAt, value: 'createdAt' },
    { title: labels.firstName, value: 'name' },
    { title: labels.lastName, value: 'surname' },
    { title: labels.email, value: 'email' },
    { title: labels.parkingDate, value: 'parkingDate' },
    { title: labels.plates, value: 'plate' },
    { title: labels.ticketId, value: 'ticketId' },
    { title: labels.status, value: 'paymentStatus' },
    { title: labels.sendEmail, value: 'sendEmail' },
    { title: labels.confirmBooking, value: 'confirmBooking' },
    { title: labels.rebook, value: 'rebook' },
    { title: labels.cancel, value: 'cancel' },
    { title: labels.checkoutId, value: 'checkoutId' },
    { title: labels.phoneNumber, value: 'phone' },
    { title: labels.merchantTransactionId, value: 'merchantTransactionId' },
    { title: labels.nationality, value: 'nationality' },
    { title: labels.parkingCode, value: 'parkingCode' },
    { title: labels.transactionId, value: 'transactionId' },
    { title: labels.price, value: 'price' },
    { title: labels.purpose, value: 'purpose' },
    { title: labels.updatedAt, value: 'updatedAt' },
    { title: labels.type, value: 'voucherCode' },
  ]

  const initialColumnState = [
    'createdAt',
    'name',
    'surname',
    'email',
    'parkingDate',
    'plate',
    'ticketId',
    'paymentStatus',
    'sendEmail',
    'confirmBooking',
    'rebook',
    'cancel',
  ]

  const [columns, setColumns] = useState(initialColumnState)
  const [visibleColumns, setVisibleColumns] = useState({})

  useEffect(() => {
    const obj = {}
    for (let column of columns) {
      obj[column] = true
    }
    setVisibleColumns(obj)
  }, [columns])

  // status
  const [paymentStatus, setPaymentStatus] = useState('')

  return (
    <div className="w-full mt-8">
      <div>
        <div className="inline-block ml-auto">
          <div className="flex flex-wrap justify-center gap-4 px-4 py-2 mb-4 bg-white rounded-lg place-items-center">
            {tab === accountTab && exportData?.length > 1 && (
              <CSVLink
                className="px-3 py-2 bg-white border border-green-500 rounded-lg outline-none"
                data={exportData}
                filename={'user_details.csv'}
              >
                {labels.exportUser}
              </CSVLink>
            )}
            {tab === ticketsTab && (
              <>
                <span className="inline-block w-64 p-1 text-sm">
                  <MultiSelect
                    label={labels.columns}
                    options={options}
                    onChange={(values) => {
                      setColumns(values)
                      window.localStorage.setItem('mts-parking', JSON.stringify({ columns: values }))
                    }}
                    values={columns}
                    reset={true}
                    onReset={() => {
                      setColumns(initialColumnState)
                      window.localStorage.setItem('mts-parking', JSON.stringify({ columns: initialColumnState }))
                    }}
                  />
                </span>
                <span className="inline-block">
                  <label htmlFor="status">{labels.status} : </label>
                  <select
                    id="status"
                    className="p-1 bg-white border border-green-500 rounded-lg outline-none"
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    value={paymentStatus}
                  >
                    <option value="">{labels.all}</option>
                    <option value="success">Success</option>
                    <option value="Decline">Decline</option>
                    <option value="deleted">Deleted</option>
                    <option value="checkout">Checkout</option>
                    <option value="cancelTicket">Cancelled</option>
                  </select>
                </span>
              </>
            )}
            <div>
              <label htmlFor="channel">{labels.language} : </label>
              <select
                id="channel"
                className="p-1 bg-white border border-green-500 rounded-lg outline-none"
                onChange={handleLanguage}
                value={language}
              >
                <option value="en">EN</option>
                <option value="de">DE</option>
                <option value="it">IT</option>
              </select>
            </div>
          </div>
        </div>
        <ul className="flex w-full gap-4 overflow-x-auto">
          <li
            key={ticketsTab}
            onClick={() => {
              setTab(ticketsTab)
              window.localStorage.setItem('mts-tab', ticketsTab)
            }}
            className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg ml-px ${
              tab === ticketsTab ? 'after:bg-primary-400' : 'after:bg-transparent'
            }`}
          >
            <span className="px-4 md:px-8">{labels.tickets}</span>
          </li>
          <li
            key={accountTab}
            onClick={() => {
              setTab(accountTab)
              window.localStorage.setItem('mts-tab', accountTab)
            }}
            className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg ${
              tab === accountTab ? 'after:bg-primary-400' : 'after:bg-transparent'
            }`}
          >
            <span className="px-4 md:px-8">{labels.customers}</span>
          </li>
          <li
            key={transactionTab}
            onClick={() => {
              setTab(transactionTab)
              window.localStorage.setItem('mts-tab', transactionTab)
            }}
            className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg ${
              tab === transactionTab ? 'after:bg-primary-400' : 'after:bg-transparent'
            }`}
          >
            <span className="px-4 md:px-8">{labels.transactions}</span>
          </li>
          <li
            key={analyticsTab}
            onClick={() => {
              setTab(analyticsTab)
              window.localStorage.setItem('mts-tab', analyticsTab)
            }}
            className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg ${
              tab === analyticsTab ? 'after:bg-primary-400' : 'after:bg-transparent'
            }`}
          >
            <span className="px-4 md:px-8">{labels.analytics}</span>
          </li>
        </ul>
      </div>

      <div className="relative">
        {tab == ticketsTab ? (
          <div className="p-4 bg-white border border-gray-300 border-solid rounded-tl-none rounded-xl">
            {/* <span className="px-4 md:px-8">Parking Checkout</span> */}
            <ParkingTickets
              language={language}
              visibleColumns={visibleColumns}
              paymentStatus={paymentStatus}
            ></ParkingTickets>
          </div>
        ) : tab == accountTab ? (
          <div className="p-4 bg-white border border-gray-300 border-solid rounded-tl-none rounded-xl">
            <CustomerAccounts language={language} setExportData={setExportData}></CustomerAccounts>
          </div>
        ) : tab == transactionTab ? (
          <div className="p-4 bg-white border border-gray-300 border-solid rounded-tl-none rounded-xl">
            <ParkingTransactions language={language}></ParkingTransactions>
          </div>
        ) : tab == analyticsTab ? (
          <div className="p-4 bg-white border border-gray-300 border-solid rounded-tl-none rounded-xl">
            <ParkingAnalytics language={language}></ParkingAnalytics>
          </div>
        ) : null}
      </div>
    </div>
  )
}
export default Parking

export async function getServerSideProps(context) {
  return Authenticate(context)
}
