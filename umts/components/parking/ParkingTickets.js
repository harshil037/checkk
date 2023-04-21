import React, { useState, useContext, useEffect, useRef } from 'react'

import { useUser, useIsMounted } from '../../lib/hooks'
import PopUp from '../dialog/popUp'
import { Input } from '../componentLibrary'
import Button from '../common/Button'
import useConfirm from '../dialog/useConfirm'
import { AppContext } from '../../context/appContext'
import { useRouter } from 'next/router'
import GridMaster from '../layout/gridMaster'
import translations from '../../translations/parking.json'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_green.css'
import { English } from 'flatpickr/dist/l10n/default.js'
import { German } from 'flatpickr/dist/l10n/de.js'
import { Italian } from 'flatpickr/dist/l10n/it.js'

// import MultiSelect from '../../../components/parking/MultiSelect'
// import { CSVLink } from 'react-csv'

const ParkingTickets = ({ language, visibleColumns, paymentStatus }) => {
  const refFlrCreatedAt = useRef(null)
  const refFlrPeriod = useRef(null)
  const [dailyAnalytics, setDailyAnalytics] = useState({})
  const [isComponentMounted, setIsComponentMounted] = useState(false)
  const [user, { mutate: userMutate }] = useUser()
  const [checkoutData, setCheckoutData] = useState([])
  const [selectedCheckout, setSelectedCheckout] = useState({})
  const [openModal, setOpenModal] = useState(false)
  const [openRebookModal, setOpenRebookModal] = useState(false)
  const [notificationModal, setNotificationModal] = useState({ open: false, message: '', title: '', type: 'succes' })

  const [isSearching, setIsSearching] = useState(false)
  const [resend, setResend] = useState(false)

  const isMounted = useIsMounted()
  const { isConfirmed } = useConfirm()
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const router = useRouter()
  const { domainUrl } = router.query
  const [mailStatus, setMailStatus] = useState('')
  const [confirmingReservation, setConfirmingReservation] = useState({
    id: '',
    status: false,
  })
  const [confirmationError, setConfirmationError] = useState({
    id: '',
    message: '',
  })

  const [gridInfo, setGridInfo] = useState({
    length: 0,
    currentPage: 1,
    perPage: 10,
    sort: { name: true },
    searchText: '',
    searchToggle: false,
    pageList: { start: 0, end: 5 },
  })

  const [sort, setSort] = useState({ createdAt: -1 })
  // const [language, setLanguage] = useState('en')
  const [labels, setLabels] = useState({})
  // const [paymentStatus, setPaymentStatus] = useState('')

  // date filter
  const [flrCreatedAt, setFlrCreatedAt] = useState([])
  const [flrPeriod, setFlrPeriod] = useState([])
  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear()
    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    if (month && day && year) {
      return [year, month, day].join('-')
    } else {
      return ''
    }
  }

  const sendEmail = async () => {
    setLoading(true)
    if (selectedCheckout.emailTemplate) {
      const result = await fetch('https://parking.mts-online.com/v1/checkout/sendmailToUser', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Prags parking 4 ticket',
          to: selectedCheckout.email,
          ticketId: selectedCheckout.ticketId,
        }),
      })
      const res = await result.json()
      if (res.data) {
        setMailStatus('Sent')
      } else {
        setMailStatus('Failed')
      }
      setLoading(false)
    }
  }

  const handleDailyAnalitycs = async () => {
    setLoading(true)
    try {
      const todayDate = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/parking/analytics?fromDate=${todayDate}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      setLoading(false)
      setDailyAnalytics(data.data)
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

  const { tickets, general } = translations
  const getTranslation = (translations, language) => {
    const translationObj = {}
    for (const translation in translations) {
      translationObj[translation] = translations[translation][language] || translation
    }
    return translationObj
  }

  useEffect(() => {
    const translation = getTranslation({ ...tickets, ...general }, language)
    setLabels(translation)
  }, [language])

  useEffect(() => {
    handleDailyAnalitycs()
  }, [])

  useEffect(async () => {
    if (!isSearching && user) {
      await getCheckoutData()
    }
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort, domainUrl, sort, paymentStatus, flrCreatedAt, flrPeriod])

  useEffect(async () => {
    const delayDebounceFn = setTimeout(async () => {
      if (isSearching) {
        await getCheckoutData()
      }
      if (isMounted.current) {
        setIsSearching(false)
      }
    }, 1500)
    return () => clearTimeout(delayDebounceFn)
  }, [gridInfo.searchText])

  const getCheckoutData = async () => {
    setLoading(true)
    const sortQuery = JSON.stringify(sort)

    let res = fetch(
      `/api/parking/checkouts?req_offSet=${gridInfo.perPage * (gridInfo.currentPage - 1)}&req_limit=${
        gridInfo.perPage
      }&req_search=${gridInfo.searchText}&req_sort=${sortQuery}&req_filter=${paymentStatus}&createdFrom=${formatDate(
        flrCreatedAt[0],
      )}&createdTo=${formatDate(flrCreatedAt[1])}&periodFrom=${formatDate(flrPeriod[0])}&periodTo=${formatDate(
        flrPeriod[1],
      )}`,
      {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    res
      .then((response) => {
        if (!isMounted.current) {
          return
        }
        return response.json()
      })
      .then((result) => {
        if (result?.checkouts?.data) {
          setCheckoutData(result.checkouts.data)
          setGridInfo((state) => ({
            ...state,
            // currentPage: result?.checkouts?.data?.length > 0 ? state.currentPage : 1,
            ['length']: result?.checkouts?.length?.total,
          }))
          // getExportData(result?.checkouts?.length?.total)
          setLoading(false)
        }
      })
  }

  useEffect(() => setIsComponentMounted(true), [])
  if (!isComponentMounted) {
    return null
  }

  const handleSort = (type) => () => {
    switch (type) {
      case 'email':
        if (sort.email === 1) {
          setSort({ email: -1 })
        } else {
          setSort({ email: 1 })
        }
        break
      case 'parkingDate':
        if (sort.fromDate === 1) {
          setSort({ fromDate: -1, toDate: -1 })
        } else {
          setSort({ fromDate: 1, toDate: 1 })
        }
        break
      case 'createdAt':
        if (sort.createdAt === 1) {
          setSort({ createdAt: -1 })
        } else {
          setSort({ createdAt: 1 })
        }
        break
      case 'name':
        if (sort.name === 1) {
          setSort({ name: -1 })
        } else {
          setSort({ name: 1 })
        }
        break
      case 'surname':
        if (sort.surname === 1) {
          setSort({ surname: -1 })
        } else {
          setSort({ surname: 1 })
        }
        break
      case 'paymentStatus':
        if (sort.paymentStatus === 1) {
          setSort({ paymentStatus: -1 })
        } else {
          setSort({ paymentStatus: 1 })
        }
        break
      case 'plate':
        if (sort.plate === 1) {
          setSort({ plate: -1 })
        } else {
          setSort({ plate: 1 })
        }
        break
      default:
        setSort({})
        break
    }
  }

  const handleConfirm = async (checkout) => {
    const res = await fetch('/api/parking/confirm', { method: 'POST', body: JSON.stringify(checkout) })
    const result = await res.json()
    if (result?.success) {
      getCheckoutData()
    } else if (!result?.success) {
      setConfirmationError({
        id: checkout.ticketId[0],
        message: result.error,
      })
      const timer = setTimeout(() => {
        setConfirmationError({
          id: '',
          message: '',
        })
        clearTimeout(timer)
      }, 5000)
    }
  }

  const handleReBook = async (checkout) => {
    const res = await fetch('/api/parking/book', { method: 'POST', body: JSON.stringify(checkout) })
    const result = await res.json()

    if (result?.success) {
      setOpenRebookModal(false)
      setSelectedCheckout({})
      getCheckoutData()
    } else if (!result?.success) {
      setConfirmationError({
        id: checkout.ticketId[0],
        message: result.error,
      })
      const timer = setTimeout(() => {
        setConfirmationError({
          id: '',
          message: '',
        })
        clearTimeout(timer)
      }, 5000)
    }
  }

  const confirmReservation = (checkout) => async () => {
    let confirmed = await isConfirmed('Are you sure to confirm this parking')
    if (confirmed) {
      setConfirmingReservation({
        id: checkout.ticketId[0],
        status: true,
      })
      await handleConfirm(checkout)
      setConfirmingReservation({
        id: '',
        status: false,
      })
    }
  }

  const reReservation = (checkout) => async () => {
    let confirmed = await isConfirmed('Are you sure to Rebook this parking')
    if (confirmed) {
      setConfirmingReservation({
        id: checkout.ticketId[0],
        status: true,
      })
      await handleReBook(checkout)
      setConfirmingReservation({
        id: '',
        status: false,
      })
    }
  }

  const convertInputDateFormate = (date) => {
    const dateObj = new Date(date)
    const mnth = ('0' + (dateObj.getMonth() + 1)).slice(-2)
    const day = ('0' + dateObj.getDate()).slice(-2)
    return [dateObj.getFullYear(), mnth, day].join('-')
  }

  const handleDateChange = (type) => (e) => {
    Date.prototype.addDays = function (days) {
      let date = new Date(this.valueOf())

      date.setDate(date.getDate() - days)

      return date
    }

    let fromDate = new Date(e.target.value).addDays(1)
    fromDate = new Date(fromDate).toISOString()
    fromDate = fromDate.split('T')[0]
    fromDate = fromDate + 'T22:00:00Z'

    let toDate = new Date(e.target.value)
    toDate = new Date(toDate).toISOString()
    toDate = toDate.split('T')[0]
    toDate = toDate + 'T21:59:59Z'

    setSelectedCheckout((prev) => ({
      ...prev,
      [type]: e.target.value,
      toDate: toDate,
      fromDate: fromDate,
      isDateModified: true,
    }))
  }

  const handleChange = (key) => (e) => {
    if (key === 'plate') {
      setSelectedCheckout((prev) => ({
        ...prev,
        [key]: [e.target.value],
      }))
    } else {
      setSelectedCheckout((prev) => ({
        ...prev,
        [key]: e.target.value,
      }))
    }
  }

  const handleCancel =
    ({ ticketId, language, _id }) =>
    async () => {
      const confirmed = await isConfirmed('Are you sure to cancel this parking?')
      if (confirmed) {
        setLoading(true)
        // console.log('first', JSON.stringify({ ticketId, language, cancelFrom: 'admin' }))
        // Live
        const BASE_URL = 'https://parking.mts-online.com'

        // Locale
        // const BASE_URL = 'http://10.10.10.119:3008'

        try {
          const res = await fetch(`${BASE_URL}/v1/checkout/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketId, language, cancelFrom: 'admin' }),
          })

          const data = await res.json()

          const cancelTicketTest = /^(000\.000\.|000\.100\.1|000\.[36])/.test(data?.data?.cancelTicket?.result?.code)
          if (cancelTicketTest) {
            await getCheckoutData()
            setLoading(false)
            setNotificationModal({
              open: true,
              message: 'Cancellation successfull',
              title: 'Cancellation',
              type: 'success',
            })
          } else {
            if (data?.code === 400 || data?.cancelTicket?.code === 400) {
              setNotificationModal({
                open: true,
                message:
                  data?.message?.result?.description?.en ||
                  data?.result?.description?.en ||
                  data?.message?.en ||
                  data?.errorMsg?.en ||
                  data?.message ||
                  data?.errorMsg,
                title: 'Error',
                type: 'danger',
              })
            } else {
              setNotificationModal({
                open: true,
                message: 'Opps, Something went wrong',
                title: 'Error',
                type: 'danger',
              })
            }
            await getCheckoutData()
            setLoading(false)
          }
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
    }

  // Flatpickr Options
  const optFlatpickr = {
    showMonths: 2,
    mode: 'range',
    dateFormat: 'd-m-Y',
    enableTime: false,
    locale:
      language == 'de'
        ? { ...German, firstDayOfWeek: 1 }
        : language == 'it'
        ? { ...Italian, firstDayOfWeek: 1 }
        : { ...English, firstDayOfWeek: 1 },
  }

  return (
    <div>
      <div className="flex flex-col flex-wrap justify-end gap-4 mb-4 place-items-end lg:flex-row">
        <div className="relative flex place-items-center">
          <Flatpickr
            ref={refFlrCreatedAt}
            // className="w-full p-2 border"
            style={{
              width: '100%',
              // padding: '8px',
              border: '1px solid #ccc',
            }}
            className={`rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-outline `}
            value={flrCreatedAt}
            placeholder={labels.filterCreatedAt}
            options={optFlatpickr}
            onChange={([date1, date2]) => {
              if (date1 && date2) {
                setFlrCreatedAt([date1, date2])
                setGridInfo((state) => ({
                  ...state,
                  currentPage: 1,
                }))
              }
            }}
          />
          {refFlrCreatedAt?.current?.flatpickr?.selectedDates?.length > 1 && (
            <span className="absolute right-2">
              <svg
                onClick={() => {
                  setFlrCreatedAt([])
                  if (refFlrCreatedAt?.current?.flatpickr) {
                    // console.log(refFlrCreatedAt?.current?.flatpickr)
                    refFlrCreatedAt.current.flatpickr.clear()
                  }
                }}
                className="w-4 h-4 cursor-pointer fill-current"
                role="button"
                viewBox="0 0 20 20"
              >
                <path
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </span>
          )}
        </div>
        <div className="relative flex place-items-center">
          <Flatpickr
            ref={refFlrPeriod}
            // className="w-full p-2 border"
            style={{
              // width: '100%',
              // padding: '8px',
              border: '1px solid #ccc',
            }}
            className={`rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-outline`}
            value={flrPeriod}
            placeholder={labels.filterPeriod}
            options={optFlatpickr}
            onChange={([date1, date2]) => {
              if (date1 && date2) {
                setFlrPeriod([date1, date2])
                setGridInfo((state) => ({
                  ...state,
                  currentPage: 1,
                }))
              }
            }}
          />
          {refFlrPeriod?.current?.flatpickr?.selectedDates?.length > 1 && (
            <span className="absolute right-2">
              <svg
                onClick={() => {
                  setFlrPeriod([])
                  if (refFlrPeriod?.current?.flatpickr) {
                    // console.log(refFlrPeriod?.current?.flatpickr)
                    refFlrPeriod.current.flatpickr.clear()
                  }
                }}
                className="w-4 h-4 cursor-pointer fill-current"
                role="button"
                viewBox="0 0 20 20"
              >
                <path
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </span>
          )}
        </div>
      </div>

      <GridMaster
        newButtonText=""
        headerText={
          <div className="flex flex-wrap gap-4">
            <div>{labels.parkingTickets}</div>
            {/* {Object.keys(dailyAnalytics).length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 text-xs font-bold text-gray-100 bg-gray-600 rounded-full">
                  {labels.dailySold}: {dailyAnalytics?.dailySold}
                </span>
                <span className="px-4 py-2 text-xs font-bold text-gray-100 bg-gray-600 rounded-full">
                  {labels.dailyEntrance}: {dailyAnalytics?.dailyEntrance}
                </span>
                <span className="px-4 py-2 text-xs font-bold text-gray-100 bg-gray-600 rounded-full">
                  {labels.dailyExid}: {dailyAnalytics?.dailyExid}
                </span>
              </div>
            )} */}
          </div>
        }
        onSort={() => {
          setGridInfo((prevState) => ({
            ...prevState,
            sort: {
              ...prevState.sort,
              name: !prevState.sort.name,
            },
          }))
        }}
        setGridInfo={setGridInfo}
        gridInfo={gridInfo}
        length={checkoutData.length}
        setIsSearching={setIsSearching}
        passedData={checkoutData || []}
        showNewButton={false}
        rowsPerPage={labels.rowsPerPage}
      >
        {checkoutData.length > 0 ? (
          <div className="w-full overflow-x-auto bg-white">
            <table className="relative rounded-lg" width="100%">
              <thead>
                <tr className="font-normal text-left">
                  {visibleColumns['checkoutId'] && (
                    <td className="py-4 pl-4">
                      <span className="flex text-base">{labels.checkoutId}</span>
                    </td>
                  )}
                  {visibleColumns['createdAt'] && (
                    <td className="py-4 pl-4">
                      <span className="flex text-base">
                        {labels.createdAt}
                        <img
                          className={`inline-block px-2 cursor-pointer ${
                            sort.createdAt === 1 && 'transform rotate-180'
                          }`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('createdAt')}
                        />
                      </span>
                    </td>
                  )}
                  {visibleColumns['name'] && (
                    <td className="py-4 pl-4">
                      <span className="flex text-base">
                        {labels.firstName}
                        <img
                          className={`inline-block px-2 cursor-pointer ${sort.name === 1 && 'transform rotate-180'}`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('name')}
                        />
                      </span>
                    </td>
                  )}
                  {visibleColumns['surname'] && (
                    <td className="py-4 pl-4">
                      <span className="flex text-base">
                        {labels.lastName}
                        <img
                          className={`inline-block px-2 cursor-pointer ${sort.surname === 1 && 'transform rotate-180'}`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('surname')}
                        />
                      </span>
                    </td>
                  )}
                  {visibleColumns['email'] && (
                    <td className="py-4 pl-4 cursor-pointer">
                      <span className="flex text-base">
                        {labels.email}
                        <img
                          className={`inline-block px-2 cursor-pointer ${sort.email === 1 && 'transform rotate-180'}`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('email')}
                        />
                      </span>
                    </td>
                  )}
                  {visibleColumns['phone'] && <td className="py-4 pl-4">{labels.phoneNumber}</td>}
                  {visibleColumns['parkingDate'] && (
                    <td className="py-4 pl-4 cursor-pointer">
                      <span className="flex text-base">
                        {labels.parkingDate}
                        <img
                          className={`inline-block px-2 cursor-pointer ${
                            sort.fromDate === 1 && 'transform rotate-180'
                          }`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('parkingDate')}
                        />
                      </span>
                    </td>
                  )}
                  {visibleColumns['plate'] && (
                    <td className="py-4 pl-4">
                      <span className="flex text-base">
                        {labels.plates}
                        <img
                          className={`inline-block px-2 cursor-pointer ${sort.plate === 1 && 'transform rotate-180'}`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('plate')}
                        />
                      </span>
                    </td>
                  )}
                  {visibleColumns['ticketId'] && <td className="py-4 pl-4">{labels.ticketId}</td>}
                  {visibleColumns['paymentStatus'] && (
                    <td className="py-4 pl-4">
                      <span className="flex text-base">
                        {labels.status}
                        <img
                          className={`inline-block px-2 cursor-pointer ${
                            sort.paymentStatus === 1 && 'transform rotate-180'
                          }`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('paymentStatus')}
                        />
                      </span>
                    </td>
                  )}
                  {visibleColumns['merchantTransactionId'] && (
                    <td className="py-4 pl-4">{labels.merchantTransactionId}</td>
                  )}
                  {visibleColumns['nationality'] && <td className="py-4 pl-4">{labels.nationality}</td>}
                  {visibleColumns['parkingCode'] && <td className="py-4 pl-4">{labels.parkingCode}</td>}
                  {visibleColumns['transactionId'] && <td className="py-4 pl-4">{labels.transactionId}</td>}
                  {visibleColumns['updatedAt'] && <td className="py-4 pl-4">{labels.updatedAt}</td>}
                  {visibleColumns['price'] && <td className="py-4 pl-4">{labels.price}</td>}
                  {visibleColumns['purpose'] && <td className="py-4 pl-4">{labels.purpose}</td>}
                  {visibleColumns['voucherCode'] && <td className="py-4 pl-4">{labels.type}</td>}
                  {visibleColumns['sendEmail'] && <td className="py-4 pl-4">{labels.sendEmail}</td>}
                  {visibleColumns['confirmBooking'] && <td className="py-4 pl-4">{labels.confirmBooking}</td>}
                  {visibleColumns['rebook'] && <td className="py-4 pr-4">{labels.rebook}</td>}
                  {visibleColumns['cancel'] && <td className="py-4 pr-4">{labels.cancel}</td>}
                </tr>
              </thead>
              <caption
                className="absolute mx-4 border-b border-black border-dashed border-bottom"
                style={{ width: 'calc(100% - 30px)' }}
              />
              <tbody>
                {checkoutData.map((checkout, i) => {
                  const toDate = checkout?.toDate.split('T')[0].split('-')
                  // const newToDate = `${toDate.pop()}-${toDate.pop()}-${toDate.pop()}`
                  const newToDate = `${toDate[2]}-${toDate[1]}-${toDate[0]}` || checkout?.toDate.split('T')[0]
                  return (
                    <tr key={'user' + i} className={`rounded-lg  ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      {visibleColumns['checkoutId'] && (
                        <td className="py-4 pl-4 text-sm text-left">{checkout.checkoutId}</td>
                      )}
                      {visibleColumns['createdAt'] && (
                        <td className="py-4 pl-4 text-sm text-left">{new Date(checkout.createdAt).toLocaleString()}</td>
                      )}
                      {visibleColumns['name'] && <td className="py-4 pl-4 text-sm text-left">{checkout.name}</td>}
                      {visibleColumns['surname'] && <td className="py-4 pl-4 text-sm text-left">{checkout.surname}</td>}
                      {visibleColumns['email'] && <td className="py-4 pl-4 text-sm text-left">{checkout.email}</td>}
                      {visibleColumns['phone'] && <td className="py-4 pl-4 text-sm text-left">{checkout.phone}</td>}
                      {visibleColumns['parkingDate'] && (
                        <td className="py-4 pl-4 text-sm text-left">
                          {/* <span className="mx-2">{new Date(checkout?.fromDate).toLocaleDateString()} </span>-{' '}
                          <span className="mx-2"> {new Date(checkout?.toDate).toLocaleDateString()} </span> */}
                          <span className="mx-2">{newToDate} </span>
                        </td>
                      )}
                      {visibleColumns['plate'] && (
                        <td className="py-4 pl-4 text-sm text-left">
                          {checkout.plate?.map((item, i) => {
                            return (
                              <span className="block" key={i}>
                                <span>{item}</span>
                                {i !== checkout.plate.length - 1 && <span>,</span>}
                              </span>
                            )
                          })}
                        </td>
                      )}
                      {visibleColumns['ticketId'] && (
                        <td className="py-4 pl-4 text-sm text-left">
                          {checkout.ticketId?.map((item, i) => {
                            return (
                              <span className="block" key={i}>
                                <span>{item}</span>
                                {i !== checkout.ticketId.length - 1 && <span>,</span>}
                              </span>
                            )
                          })}
                        </td>
                      )}
                      {visibleColumns['paymentStatus'] && (
                        <td
                          className={`py-4 pl-4 text-sm text-left ${
                            checkout?.paymentStatus == 'success'
                              ? 'text-green-700'
                              : checkout?.paymentStatus == 'Decline'
                              ? 'text-red-500'
                              : checkout?.paymentStatus == 'cancelTicket'
                              ? 'text-yellow-700'
                              : checkout?.paymentStatus == 'deleted'
                              ? 'text-gray-700'
                              : checkout?.paymentStatus == 'checkout'
                              ? 'text-blue-700'
                              : checkout?.paymentStatus == 'fail'
                              ? 'text-red-900'
                              : ''
                          }`}
                        >
                          {checkout?.paymentStatus}
                        </td>
                      )}
                      {visibleColumns['merchantTransactionId'] && (
                        <td className="py-4 pl-4 text-sm text-left">{checkout?.merchantTransactionId}</td>
                      )}
                      {visibleColumns['nationality'] && (
                        <td className="py-4 pl-4 text-sm text-left">{checkout?.nationality}</td>
                      )}
                      {visibleColumns['parkingCode'] && (
                        <td className="py-4 pl-4 text-sm text-left">{checkout?.parkingCode}</td>
                      )}
                      {visibleColumns['transactionId'] && (
                        <td className="py-4 pl-4 text-sm text-left">{checkout?.transactionId}</td>
                      )}

                      {visibleColumns['updatedAt'] && (
                        <td className="py-4 pl-4 text-sm text-left">
                          {new Date(checkout?.updatedAt).toLocaleString()}
                        </td>
                      )}
                      {visibleColumns['price'] && <td className="py-4 pl-4 text-sm text-left">{checkout?.price}</td>}
                      {visibleColumns['purpose'] && (
                        <td className="py-4 pl-4 text-sm text-left">{checkout?.purpose}</td>
                      )}
                      {visibleColumns['voucherCode'] && (
                        <td className="py-4 pl-4 text-sm text-left">
                          {checkout?.voucherCode === '20' ? `${labels.parkingWithVoucher}` : `${labels.parkingOnly}`}
                        </td>
                      )}

                      {visibleColumns['sendEmail'] && (
                        <td className="py-4 pl-4 text-sm text-left">
                          <Button
                            onClick={() => {
                              setOpenModal(true)
                              setSelectedCheckout({
                                ...checkout,
                                emailTemplate: Object.values(checkout?.htmlEmails || {})?.[0] || '',
                              })
                            }}
                            variant="primary"
                            disabled={checkout.paymentStatus !== 'success'}
                          >
                            {labels.sendEmail}
                          </Button>
                        </td>
                      )}
                      {visibleColumns['confirmBooking'] && (
                        <td className="py-4 pl-4 text-sm text-left">
                          {confirmationError.id === checkout.ticketId[0] && confirmationError.message ? (
                            <div className="w-32 text-red-700">
                              <p className="inline-block break-words whitespace-normal">{confirmationError.message}</p>
                            </div>
                          ) : checkout?.paymentStatus === 'checkout' ? (
                            <Button
                              onClick={confirmReservation(checkout)}
                              variant="primary"
                              disabled={
                                confirmingReservation.id === checkout.ticketId[0] && confirmingReservation.status
                              }
                            >
                              {confirmingReservation.id === checkout.ticketId[0] && confirmingReservation.status
                                ? labels.confirming
                                : labels.confirm}
                            </Button>
                          ) : (
                            labels.confirmed
                          )}
                        </td>
                      )}
                      {visibleColumns['rebook'] && (
                        <td className="py-4 pr-4 text-sm text-left">
                          <Button
                            onClick={() => {
                              // reReservation(checkout)
                              setOpenRebookModal(true)
                              setSelectedCheckout({ ...checkout })
                            }}
                            variant="primary"
                            disabled={confirmingReservation.id === checkout.ticketId[0] && confirmingReservation.status}
                          >
                            {confirmingReservation.id === checkout.ticketId[0] && confirmingReservation.status
                              ? labels.rebooking
                              : labels.rebook}
                          </Button>
                        </td>
                      )}
                      {visibleColumns['cancel'] && (
                        <td className="py-4 pr-4 text-sm text-left">
                          {checkout?.paymentStatus !== 'cancelTicket' ? (
                            <Button
                              onClick={handleCancel(checkout)}
                              variant="danger"
                              disabled={
                                confirmingReservation.id === checkout.ticketId[0] && confirmingReservation.status
                              }
                            >
                              {labels.cancel}
                            </Button>
                          ) : (
                            ''
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
              {/* <tfoot className={`bg-gray-50 border-t`}>
                <tr>
                  <td className="p-4" colSpan="100%">
                    Total records: {gridInfo.length}
                  </td>
                </tr>
              </tfoot> */}
            </table>
          </div>
        ) : (
          <div className="mt-5 mb-5 text-center table-responsive">
            {!contextData.isLoading && <div>{labels.noRecordsFound}</div>}
          </div>
        )}

        {openModal && (
          <PopUp openModal={openModal}>
            <div className="h-full p-6 mx-auto my-auto mt-32 overflow-hidden bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-2/5">
              <div className="flex items-center justify-between pb-2 border-b border-black border-solid">
                <h1 className="text-xl sm:text-[22px] text-heading font-bold text-left">
                  {selectedCheckout.emailTemplate ? labels.email : ''}
                </h1>
                <div className="flex items-center gap-2">
                  {selectedCheckout.emailTemplate ? (
                    <Button
                      onClick={() => {
                        setResend(true)
                      }}
                      className="w-auto mr-2"
                      variant="primary"
                    >
                      {labels.resendEmail}
                    </Button>
                  ) : null}
                  <svg
                    onClick={() => {
                      setOpenModal(false)
                      setSelectedCheckout({})
                      setResend(false)
                      setMailStatus('')
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
              {selectedCheckout.emailTemplate ? (
                <>
                  {resend ? (
                    <>
                      <div className="flex items-center justify-between p-2">
                        <Input
                          id="email"
                          className="mr-4"
                          style={{ width: '80%' }}
                          value={selectedCheckout.email}
                          onChange={(e) => {
                            setSelectedCheckout({ ...selectedCheckout, email: e.target.value })
                          }}
                          type="text"
                          variant="primary"
                        />
                        <Button
                          onClick={sendEmail}
                          className="w-auto"
                          variant="primary"
                          disabled={mailStatus ? true : false}
                        >
                          {mailStatus ? mailStatus : labels.sendEmail}
                        </Button>
                      </div>
                      {mailStatus ? (
                        <p
                          className={`${
                            mailStatus === 'Failed' ? 'text-red-500' : 'text-green-500'
                          } font-semibold text-center mb-2`}
                        >
                          {mailStatus}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                  {/* <div
                    className="overflow-scroll h-5/6"
                    style={{ maxHeight: '85vh' }}
                    dangerouslySetInnerHTML={{
                      __html: selectedCheckout.emailTemplate,
                    }}
                  ></div> */}
                  <div className="w-full h-full" style={{ height: '85vh' }}>
                    <iframe
                      className="w-full h-full"
                      // style={{ maxHeight: '85vh' }}
                      srcDoc={selectedCheckout.emailTemplate}
                      frameBorder="0"
                    ></iframe>
                  </div>
                </>
              ) : (
                <div className="text-center">{labels.noTemplateFound}</div>
              )}
            </div>
          </PopUp>
        )}

        {openRebookModal && (
          <PopUp openModal={openRebookModal}>
            <div className="h-full p-6 mx-auto my-auto mt-32 overflow-hidden bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-2/5">
              <div className="flex items-center justify-between pb-2 border-b border-black border-solid">
                <h1 className="text-xl sm:text-[22px] font-bold w-10/12 text-left">{labels.rebookParking}</h1>
                <div className="flex items-center gap-2">
                  <svg
                    onClick={() => {
                      setOpenRebookModal(false)
                      setSelectedCheckout({})
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
              <div className="grid grid-cols-2 gap-2 pt-2 text-left">
                <div>
                  <label className="font-semibold">{labels.firstName} :</label>{' '}
                  <Input
                    onChange={handleChange('name')}
                    value={selectedCheckout.name}
                    variant="primary"
                    placeholder="name"
                  />
                </div>
                <div>
                  <label className="font-semibold">{labels.lastName} :</label>
                  <Input
                    variant="primary"
                    onChange={handleChange('surname')}
                    value={selectedCheckout.surname}
                    placeholder="surname"
                  />
                </div>
                <div>
                  <label className="font-semibold">{labels.email} :</label>
                  <Input
                    onChange={handleChange('email')}
                    variant="primary"
                    value={selectedCheckout.email}
                    placeholder="email"
                  />
                </div>
                <div>
                  <label className="font-semibold ">{labels.plates} :</label>
                  <Input
                    onChange={handleChange('plate')}
                    variant="primary"
                    value={selectedCheckout.plate[0]}
                    placeholder="plate"
                  />
                </div>
                <div>
                  <label className="font-semibold ">{labels.phoneNumber} :</label>
                  <Input
                    onChange={handleChange('phone')}
                    variant="primary"
                    placeholder="phone"
                    value={selectedCheckout.phone}
                  />
                </div>
                <div>
                  <label className="font-semibold ">{labels.date} :</label>
                  <Input
                    type="date"
                    variant="primary"
                    value={convertInputDateFormate(selectedCheckout.toDate.split('T')[0])}
                    onChange={handleDateChange('fromDate')}
                  />
                </div>
                <div>
                  <label className="font-semibold ">{labels.price} :</label>{' '}
                  <div className="w-full px-3 py-3 text-sm text-gray-700 border border-gray-400 rounded-lg cursor-not-allowed">
                    {selectedCheckout.price}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end">
                {confirmationError.id && confirmationError.message ? (
                  <div className="mx-auto text-red-700">{confirmationError.message}</div>
                ) : null}
                <Button
                  variant="primary"
                  disabled={confirmingReservation.id && confirmingReservation.status}
                  onClick={reReservation(selectedCheckout)}
                >
                  {confirmingReservation.id && confirmingReservation.status ? labels.rebooking : labels.rebook}
                </Button>
              </div>
            </div>
          </PopUp>
        )}

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
                className={`text-center ${
                  notificationModal.type === 'danger' ? 'text-red-500' : 'text-green-500'
                } mt-6`}
              >
                {notificationModal.message}
              </div>
            </div>
          </PopUp>
        )}
      </GridMaster>
    </div>
  )
}
export default ParkingTickets
