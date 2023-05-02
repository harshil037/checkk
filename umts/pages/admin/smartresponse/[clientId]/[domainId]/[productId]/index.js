import React, { useState, useEffect, useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import PopUp from '../../../../../../components/dialog/popUp'
import Authenticate from '../../../../../../lib/authenticate'
import GridMaster from '../../../../../../components/layout/gridMaster'
import { AppContext } from '../../../../../../context/appContext'
import Reception from '../../../../../../components/reception'
import receptionLabels from '../../../../../../translations/reception.json'
import Calendar from '../../../../../../components/icons/calendar'
import UpArrow from '../../../../../../components/icons/upArrow'
import Plus from '../../../../../../components/icons/plus'
import Edit from '../../../../../../components/icons/edit'
import Delete from '../../../../../../components/icons/delete'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_green.css'
import { English } from 'flatpickr/dist/l10n/default.js'
import { German } from 'flatpickr/dist/l10n/de.js'
import { Italian } from 'flatpickr/dist/l10n/it.js'
import {
  getRequests,
  getDomainInfoAndProps,
  getAvailableOffers,
  getBookability,
  getRooms,
  SMTS_URL_HOST,
  getInterests,
} from '../../../../../../components/reception/useHooks'
import useConfirm from '../../../../../../components/dialog/useConfirm'

let timer

const Requests = () => {
  const [requests, setRequests] = useState([])
  const [requestInPopup, setRequestInPopup] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [rooms, setRooms] = useState([])
  const [interests, setInterests] = useState([])
  const [offers, setOffers] = useState({})
  const [selectedData, setSelectedData] = useState([{}]) // for selection of smart response data.
  const [gridInfo, setGridInfo] = useState({
    length: 0,
    currentPage: 1,
    perPage: 10,
    sort: { name: true },
    searchText: '',
    searchToggle: false,
    pageList: { start: 0, end: 5 },
  })
  const [sortOrder, setSortOrder] = useState({
    order: '0',
    direction: 'desc',
  })
  const [searchFilter, setSearchFilter] = useState({})
  const [maxAdults, setMaxAdults] = useState(null)
  const [maxChildAge, setMaxChildAge] = useState(null)
  const [language, setLanguage] = useState('de')
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [domain, setDomain] = useState({})

  const [timeStampFilter, setTimeStampFilter] = useState([])
  const [periodFilter, setPeriodFilter] = useState([])
  const [showTimeStampCalendar, setShowTimeStampCalendar] = useState(false)
  const [showPeriodCalendar, setShowPeriodCalendar] = useState(false)
  const [maxRoomsPerBooking, setMaxRoomsPerBooking] = useState(Number.MAX_SAFE_INTEGER)
  const [isValid, setIsValid] = useState({
    salutation: true,
    firstname: true,
    lastname: true,
    email: true,
  })
  const [enquiryPopup, setEnquiryPopup] = useState(false)
  const [popupLoading, setPopupLoading] = useState(false)
  const [blockProps, setBlockProps] = useState({})

  const { isConfirmed } = useConfirm()

  const [_, setContextData, setLoading] = useContext(AppContext)

  const router = useRouter()
  const { clientId, domainId, productId } = router.query
  const provider = 'kognitiv'

  const formData = useMemo(() => {
    const arrayOfColumns = [
      '0',
      'salutation',
      'firstname',
      'lastname',
      'language',
      'email',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
    ]
    const fData = new FormData()

    arrayOfColumns.forEach((column, index) => {
      const subColumnFields = {
        '[data]': column,
        '[name]': '',
        '[searchable]': 'true',
        '[orderable]': 'true',
        '[search][value]': '',
        '[search][regex]': 'false',
      }
      Object.entries(subColumnFields).forEach(([key, value]) => {
        const fDataKey = `columns[${index}]${key}`
        fData.append(fDataKey, value)
        if (searchFilter.hasOwnProperty(fDataKey)) {
          fData.set(fDataKey, searchFilter[fDataKey])
        }
      })
    })

    const subFields = {
      'order[0][column]': sortOrder.order,
      'order[0][dir]': sortOrder.direction,
      start: (gridInfo.currentPage - 1) * gridInfo.perPage,
      length: gridInfo.perPage,
      'search[value]': '',
      'search[regex]': 'false',
    }

    Object.entries(subFields).forEach(([key, value]) => {
      if (fData.has(key)) {
        fData.set(key, value)
      } else {
        fData.append(key, value)
      }
    })

    return fData
  }, [gridInfo, sortOrder, searchFilter])

  const styletmp = {
    '--MTS-backgroundColor-widget': '#ffffff',
    '--MTS-backgroundColor-primary-darker': '#000000',
    '--MTS-backgroundColor-primary-dark': '#31312d',
    '--MTS-backgroundColor-primary-light': '#796b5f',
    '--MTS-backgroundColor-primary-lighter': '#b6b6b6',
    '--MTS-backgroundColor-secondary-lighter': '#a8aaa5',
    '--MTS-backgroundColor-danger': '#ef444480',
    '--MTS-backgroundColor-success': '#38b981a1',
    '--MTS-backgroundColor-success-light': '#c5f2ba',
    '--MTS-backgroundColor-surface-dark': '#796b5f5e',
    '--MTS-backgroundColor-surface': '#ffffff',
    '--MTS-color-primary-light': '#796b5f',
    '--MTS-color-primary-selected': '#796b5f',
    '--MTS-color-surface': '#fff',
    '--MTS-fontSize-base': '12px',
  }

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'domains',
    }))
  }, [])

  const handleSort = (columnID) => () => {
    const tempSortOrder = { ...sortOrder }
    if (tempSortOrder.order === columnID) {
      tempSortOrder.direction = tempSortOrder.direction === 'asc' ? 'desc' : 'asc'
    } else {
      tempSortOrder.order = columnID
      tempSortOrder.direction = 'asc'
    }
    setSortOrder(tempSortOrder)
  }

  const handleSearchFilters = (columnID) => (evt) => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }
    timer = setTimeout(() => {
      setSearchFilter((st) => ({
        ...st,
        [`columns[${columnID}][search][value]`]: evt.target.value,
      }))
      clearTimeout(timer)
      timer = undefined
    }, 1000)
  }

  const handlePopupWithRequest = (request) => {
    if (request?.channel === 'umts') {
      setEnquiryPopup(true)
    } else {
      setEnquiryPopup(false)
    }
    setOffers({})
    setShowModal(true)
    setPopupLoading(true)
    setRequestInPopup(request)
    const tempSelectedData = []
    if (blockProps?.landingPage?.landingPageStatus && request.autoreply_landingpage) {
      request.autoreply_landingpage.forEach((reply) => {
        tempSelectedData.push({
          period: reply.period,
          occupancy: reply.occupancy.map(({ adults, children, childage }) => ({
            adults: parseInt(adults),
            children: parseInt(children),
            childage: childage.map(Number),
          })),
          replyMessage:
            reply.replyMessage ||
            receptionLabels.defaultReplyText[request?.language].replace('Caravan Park Sexten', domain.name),
          landingPageMessage:
            reply.landingPageMessage ||
            receptionLabels.defaultReplyText[request?.language].replace('Caravan Park Sexten', domain.name),
        })
      })
    } else if (request.autoreply) {
      tempSelectedData.push({
        period: request.autoreply.period,
        occupancy: request.autoreply.occupancy.map(({ adults, children, childage }) => ({
          adults: parseInt(adults),
          children: parseInt(children),
          childage: childage.map(Number),
        })),
        replyMessage:
          request.autoreply.replyMessage ||
          receptionLabels.defaultReplyText[request?.language].replace('Caravan Park Sexten', domain.name),
        ...(blockProps?.landingPage?.landingPageStatus
          ? {
              landingPageMessage:
                request.autoreply.landingPageMessage ||
                receptionLabels.defaultReplyText[request?.language].replace('Caravan Park Sexten', domain.name),
            }
          : {}),
      })
    } else {
      tempSelectedData.push({
        period: {
          arrival: new Date(request?.period?.[0]?.arrival).toISOString().substr(0, 10),
          departure: new Date(request?.period?.[0]?.departure).toISOString().substr(0, 10),
        },
        occupancy:
          (Array.isArray(request?.room) ? request?.room : Object.values(request?.room || {}))?.map(
            ({ adults, children, childage }) => ({
              ...(parseInt(adults) + parseInt(children) <= maxAdults
                ? { adults: parseInt(adults), children: parseInt(children), childage: childage?.map(Number) || [] }
                : { adults: 0, children: 0, childage: [] }),
            }),
          ) || [],
        replyMessage: receptionLabels.defaultReplyText[request?.language].replace('Caravan Park Sexten', domain.name),
        ...(blockProps?.landingPage?.landingPageStatus
          ? {
              landingPageMessage: receptionLabels.defaultReplyText[request?.language].replace(
                'Caravan Park Sexten',
                domain.name,
              ),
            }
          : {}),
      })
    }
    setSelectedData(tempSelectedData)
    setIsValid({
      salutation: true,
      firstname: true,
      lastname: true,
      email: true,
    })
    setPopupLoading(false)
  }

  const handlePopupWithoutRequest = () => {
    setEnquiryPopup(true)
    setOffers({})
    setSelectedData([
      {
        period: {
          arrival: '',
          departure: '',
        },
        occupancy: [{ adults: '2', children: '0', childage: [] }],
        replyMessage: receptionLabels.defaultReplyText[language].replace('Caravan Park Sexten', domain.name),
        ...(blockProps?.landingPage?.landingPageStatus
          ? {
              landingPageMessage: receptionLabels.defaultReplyText[language].replace(
                'Caravan Park Sexten',
                domain.name,
              ),
            }
          : {}),
      },
    ])
    setShowModal(true)
    setRequestInPopup({
      language,
      room: [],
      rooms: 0,
      quick_response: false,
      no_availability: 0,
    })
    setIsValid({
      salutation: true,
      firstname: true,
      lastname: true,
      email: true,
    })
  }

  const getEnquiryData = () => {
    const childrenOccupancyCount = selectedData[0]?.occupancy?.reduce((acc, cur) => {
      if (cur.childage) {
        acc.push(...cur.childage)
      }
      return acc
    }, [])
    const newRequest = {
      ...(requestInPopup?.id ? { id: requestInPopup?.id } : {}),
      period: [
        {
          ...selectedData[0]?.period,
          nights: (
            (new Date(selectedData[0].period.departure).getTime() -
              new Date(selectedData[0].period.arrival).getTime()) /
            86400000
          ).toString(),
        },
      ],
      room: selectedData[0]?.occupancy,
      rooms: selectedData[0]?.occupancy?.length,
      adults: selectedData[0]?.occupancy?.reduce((acc, cur) => {
        acc += cur.adults * 1
        return acc
      }, 0),
      children: childrenOccupancyCount?.length,
      childage: childrenOccupancyCount?.join(','),
      channel: 'umts',
      email: requestInPopup.email,
      salutation: requestInPopup.salutation,
      firstname: requestInPopup.firstname,
      lastname: requestInPopup.lastname,
      language: requestInPopup.language,
      no_availability: requestInPopup.no_availability,
      quick_response: requestInPopup.quick_response,
    }
    setRequestInPopup(newRequest)
    return newRequest
  }

  const getAssortedAutoReplyData = (status) => {
    const requestedData = enquiryPopup ? getEnquiryData() : requestInPopup
    const autoreplyArr = []
    for (let responseIndex = 0; responseIndex < selectedData.length; responseIndex++) {
      const selectedResponseData = selectedData[responseIndex]
      const autoreply = {
        _id: requestedData?.id,
        ...(enquiryPopup
          ? requestedData?.id
            ? { update_enquiry: requestedData }
            : { create_enquiry: requestedData }
          : {}),
        status,
        period: selectedResponseData.period,
        data: [],
        source: 'reception',
        interests: {},
        replyMessage: selectedResponseData?.replyMessage || '',
        ...(blockProps?.landingPage?.landingPageStatus
          ? {
              landingPageMessage: selectedResponseData?.landingPageMessage || '',
            }
          : {}),
        //Show standard template when one room is requested and response contains the suggested rooms with same occupancy
        //For e.g., one room with 4 adults is requested and response contains rooms which can occupy 4 adults
        //Show occupancy oriented template when one room is requested and response contains suggested rooms with occpancy divided in multiple rooms
        //For e.g., A villa is requested with 8 adults but in response we provide rooms which support 4 adults each
        isStandard:
          selectedResponseData.occupancy.length === requestedData?.room?.length &&
          selectedResponseData?.occupancy?.length === 1
            ? 1
            : 0,
        //Show room mapping template when requested rooms are present in response
        isRoomMapping:
          selectedResponseData.occupancy.length === requestedData?.room?.length && requestedData?.room?.length !== 1
            ? 1
            : 0,
        //When multiple rooms with different occupancies is supplied
        bookPackage: selectedResponseData.occupancy.length > 1 ? 1 : 0,
        //Show occupancy mapping template when in response, the occupancy is changed compared to requested occupancy
        isOccupancyMapping: selectedResponseData.occupancy.length !== requestedData?.room?.length ? 1 : 0,
      }

      const requestedRooms = requestedData?.room?.map((r) => r?.code || '') || []

      const responseRooms =
        offers[`response${responseIndex + 1}`]?.map((room, idx) =>
          room
            ?.filter(
              (offer) =>
                Object.keys(selectedResponseData?.rateCodes[idx] || {})?.includes(offer.code) ||
                Object.keys(selectedResponseData?.offerCodes[idx] || {})?.includes(offer.code),
            )
            ?.map((offer) => offer.code),
        ) || []

      //Dont show root level message when requested rooms are there in response for the requested dates
      //Incase if no room is requested consider only requested dates and don't show message on root level if requested date and response date are same
      //Also the template shouldn't be showing occupancy mapping which clearly means there is modification in response occupancy compared to what is requested by the user
      autoreply.no_message =
        requestedRooms?.every((roomCode, idx) => responseRooms?.[idx]?.includes(roomCode) || !requestedRooms?.[idx]) &&
        ((requestedData?.period?.[0]?.arrival === selectedResponseData?.period?.arrival &&
          requestedData?.period?.[0]?.departure === selectedResponseData?.period?.departure) ||
          (requestedData?.period?.[1]?.arrival === selectedResponseData?.period?.arrival &&
            requestedData?.period?.[1]?.departure === selectedResponseData?.period?.departure)) &&
        !autoreply.isOccupancyMapping
          ? 1
          : 0

      autoreply.data = selectedResponseData?.occupancy?.reduce((accRequestedRoom, _, indexOfRequestedRoom) => {
        const requestedRoomKey = autoreply?.isRoomMapping
          ? `${
              requestedData?.room?.[indexOfRequestedRoom]?.code
                ? requestedData?.room?.[indexOfRequestedRoom]?.code + '_'
                : ''
            }${indexOfRequestedRoom}`
          : `${indexOfRequestedRoom}`

        accRequestedRoom[requestedRoomKey] = offers[`response${responseIndex + 1}`][indexOfRequestedRoom]
          .filter((offer) => responseRooms?.[indexOfRequestedRoom]?.includes(offer.code))
          .map((singleOffer) => {
            const AROffer = { ...singleOffer }
            const rateCodesInRoom = selectedResponseData?.rateCodes?.[indexOfRequestedRoom]?.[AROffer.code] || []
            const offerCodesInRoom = selectedResponseData?.offerCodes?.[indexOfRequestedRoom]?.[AROffer.code] || []

            const nights = (
              (new Date(autoreply.period.departure).getTime() - new Date(autoreply.period.arrival).getTime()) /
              86400000
            ).toString()

            if (AROffer?.rates && AROffer.rates.length) {
              AROffer.rates = AROffer.rates.filter((rate) => {
                if (rateCodesInRoom.includes(rate.code)) {
                  rate.alternativeDate = {
                    ...autoreply.period,
                    nights,
                  }
                  return true
                }
                return false
              })
            }

            if (AROffer?.offers && AROffer.offers.length) {
              AROffer.offers = AROffer.offers.filter((offer) => {
                if (offerCodesInRoom.includes(offer.code)) {
                  offer.alternativeDate = {
                    ...autoreply.period,
                    nights,
                  }
                  return true
                }
                return false
              })
            }

            AROffer.alternativeDate = {
              ...autoreply.period,
              nights,
            }

            //For messages in template
            AROffer.no_message =
              requestedData?.period?.[0]?.arrival === selectedResponseData?.period?.arrival &&
              requestedData?.period?.[0]?.departure === selectedResponseData?.period?.departure &&
              (requestedRooms[indexOfRequestedRoom] === AROffer.code || !requestedRooms[indexOfRequestedRoom])
                ? 1
                : 0

            AROffer.isSingledate = requestedData?.period?.length === 1 ? 1 : 0

            AROffer.isAdditionalAlternativeRoom =
              responseRooms?.[indexOfRequestedRoom]?.includes(requestedRooms?.[indexOfRequestedRoom]) &&
              requestedRooms?.[indexOfRequestedRoom] !== AROffer.code
                ? 1
                : 0

            if (!AROffer.no_message || !requestedRooms[indexOfRequestedRoom]) {
              AROffer.isAlternativeDate =
                requestedData?.period?.[0]?.arrival === selectedResponseData?.period?.arrival &&
                requestedData?.period?.[0]?.departure === selectedResponseData?.period?.departure
                  ? 0
                  : requestedData?.period?.[1]?.arrival === selectedResponseData?.period?.arrival &&
                    requestedData?.period?.[1]?.departure === selectedResponseData?.period?.departure
                  ? 2
                  : 1

              AROffer.isNextAvailability = AROffer.isAlternativeDate === 1 ? 1 : 0

              AROffer.isAlternativeRoom =
                requestedRooms[indexOfRequestedRoom] === AROffer.code || !requestedRooms[indexOfRequestedRoom] ? 0 : 1
            }

            return AROffer
          })
          .sort((AROffer) => (requestedRooms[indexOfRequestedRoom] === AROffer.code ? -1 : 1))

        return accRequestedRoom
      }, {})
      autoreply.occupancy = [...selectedResponseData.occupancy]
      autoreply.interests = selectedResponseData.interestCodes?.reduce((acc, interestCode, index, traversingArr) => {
        const interest = interests.find((interest) => interest.code === interestCode)
        if (!acc['category_code']) {
          acc['category_code'] = [...interest.categories.filter((interest) => interest.match(/^INT_.*/g))]
        } else {
          acc['category_code'] = [
            ...acc['category_code'],
            ...interest.categories.filter((interest) => interest.match(/^INT_.*/g)),
          ]
        }
        interest.categories.forEach((interestCategory) => {
          if (interestCategory.match(/^INT_.*/g)) {
            if (!acc[interestCategory] || !Array.isArray(acc[interestCategory])) {
              acc[interestCategory] = []
            }
            interest['image'] = interest?.images?.[0]?.url?.replace(
              'https://images.seekda.net',
              'https://res.cloudinary.com/seekda/image/upload/w_160,h_120,c_fill/production',
            )
            interest['position'] = index % 2 === 0 ? 'ltr' : 'rtl'
            acc[interestCategory].push(interest)
          }
        })
        return acc
      }, {})

      autoreplyArr.push(autoreply)
    }
    return autoreplyArr
  }

  const validateRequestForm = () => {
    const objValid = { ...isValid }
    let valid = true
    for (let key in objValid) {
      if (!requestInPopup[key] || !requestInPopup[key].length) {
        objValid[key] = false
        valid = false
      }
      if (
        key === 'email' &&
        !requestInPopup?.[key]?.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
      ) {
        objValid[key] = false
        valid = false
      }
    }
    setIsValid(objValid)
    return valid
  }

  const handleSmartResponseTemplate = (status) => async () => {
    if (enquiryPopup && !validateRequestForm()) {
      return
    }
    const autoreply = getAssortedAutoReplyData(status)
    await fetch(`https://${SMTS_URL_HOST}/${clientId}/${requestInPopup?.language}/enquiry/autoreplyumts`, {
      method: 'POST',
      body: JSON.stringify(autoreply),
    })
      .then((res) => res.json())
      .then((res) => {
        setPreviewUrl(res)
        setRequestInPopup((st) => ({
          ...st,
          id: new URL(res?.template).searchParams.get('enquiry_id'),
        }))
      })
    !showPreview && setShowPreview(true)
    if (status === 'pending') {
      setShowModal(false)
      setShowPreview(false)
      getRequests({ setLoading, setRequests, gridInfo, clientId, formData })
    }
  }

  const handleQuickResponse = () => {
    const quickResponse = [
      {
        _id: requestInPopup?.id,
        quick_response: true,
        status: 'pending',
      },
    ]
    fetch(`https://${SMTS_URL_HOST}/${clientId}/${requestInPopup?.language}/enquiry/autoreplyumts`, {
      method: 'POST',
      body: JSON.stringify(quickResponse),
    }).then(() => {
      setShowModal(false)
      getRequests({ setLoading, setRequests, gridInfo, clientId, formData })
    })
  }

  const handleTemplateRedirect = (request, templateType) => () => {
    const url = `https://${SMTS_URL_HOST}/${request.user_id}/${request.language}/enquiry/${templateType}.html?enquiry_id=${request.id}`
    window.open(url, '_blank')
  }

  const handleSelectedOffers = (offers, responseIndex) => {
    const rateCodes = []
    const roomTitles = {}
    const offerCodes = []
    const offerTitles = {}

    selectedData[responseIndex]?.rateCodes?.forEach((rooms, index) => {
      const offerForRooms = offers?.[index]
      const applicableRates = {}

      for (let roomCode in rooms) {
        const offerForRoomCode = offerForRooms?.find((o) => o.code === roomCode)
        if (offerForRoomCode) {
          rooms[roomCode].forEach((rateplanCode) => {
            if (offerForRoomCode.rates.find((rate) => rate.code === rateplanCode)) {
              if (!applicableRates?.[roomCode]) {
                applicableRates[roomCode] = []
              }
              applicableRates[roomCode].push(rateplanCode)
              roomTitles[roomCode]
                ? roomTitles[roomCode].count++
                : (roomTitles[roomCode] = {
                    title: offerForRoomCode.title,
                    count: 1,
                  })
            }
          })
        }
      }

      Object.values(applicableRates).length && rateCodes.push(applicableRates)
    })

    selectedData[responseIndex]?.offerCodes?.forEach((rooms, index) => {
      const offerForRooms = offers?.[index]
      const applicableOffers = {}

      for (let roomCode in rooms) {
        const offerForRoomCode = offerForRooms?.find((o) => o.code === roomCode)
        if (offerForRoomCode) {
          rooms[roomCode].forEach((offerCode) => {
            const offerTitle = offerForRoomCode?.offers?.find((offer) => offer.code === offerCode)?.title
            if (offerTitle) {
              if (!applicableOffers?.[roomCode]) {
                applicableOffers[roomCode] = []
              }
              applicableOffers[roomCode].push(offerCode)
              offerTitles[roomCode]
                ? offerTitles[roomCode].count++
                : (offerTitles[roomCode] = {
                    title: offerTitle,
                    count: 1,
                  })
            }
          })
        }
      }

      Object.values(applicableOffers).length && offerCodes.push(applicableOffers)
    })

    setSelectedData((st) => {
      const tempSelectedData = [...st]
      tempSelectedData[responseIndex] = {
        ...tempSelectedData[responseIndex],
        rateCodes,
        roomTitles,
        offerCodes,
        offerTitles,
      }
      return tempSelectedData
    })
  }

  useEffect(() => {
    if (!showModal) {
      getRequests({ setLoading, setRequests, gridInfo, clientId, formData })
    }
  }, [formData, showModal])

  useEffect(() => {
    getDomainInfoAndProps({ domainId, productId, setBlockProps, setDomain })
    getBookability({
      language,
      provider,
      clientId,
      setMaxRoomsPerBooking,
    })
    getRooms({
      language,
      provider,
      clientId,
      maxAdults,
      maxChildAge,
      setMaxAdults,
      setMaxChildAge,
      setRooms,
    })
  }, [language])

  useEffect(() => {
    getInterests({
      language,
      clientId,
      setInterests,
    })
  }, [])

  const fetchAvailableOffers = async (responseIndex, setDataLoading) => {
    setDataLoading((e) => ({
      ...e,
      roomsLoading: true,
      roomsMessage: '',
    }))
    const start = selectedData[responseIndex].period.arrival
    const end = selectedData[responseIndex].period.departure
    getAvailableOffers({
      start,
      end,
      occupancy: selectedData[responseIndex].occupancy,
      language,
      clientId,
    }).then((res) => {
      if (res && res.length) {
        setOffers((st) => ({
          ...st,
          [`response${responseIndex + 1}`]: res,
        }))
        handleSelectedOffers(res, responseIndex)
      }
      setDataLoading((e) => ({
        ...e,
        roomsLoading: false,
        ...(!res?.length ? { roomsMessage: receptionLabels.noRoomTextLabel[language] } : { roomsMessage: '' }),
      }))
    })
  }

  const handleDeleteRequest = async (request) => {
    let confirmed = await isConfirmed('Are you sure you want to delete this enquiry?')

    if (confirmed) {
      const deleteEnquiry = [
        {
          flag: 'delete_enquiry',
          _id: request.id,
        },
      ]

      fetch(`https://${SMTS_URL_HOST}/${clientId}/${request?.language}/enquiry/autoreplyumts`, {
        method: 'POST',
        body: JSON.stringify(deleteEnquiry),
      }).then(() => {
        getRequests({ setLoading, setRequests, gridInfo, clientId, formData })
      })
    }
  }

  const handleLanguageChange = (responseIndex) => {
    setSelectedData((st) => {
      const tempSelectedData = [...st]
      tempSelectedData[responseIndex] = {
        ...tempSelectedData[responseIndex],
        replyMessage: receptionLabels.defaultReplyText[requestInPopup?.language].replace(
          'Caravan Park Sexten',
          domain.name,
        ),
        ...(blockProps?.landingPage?.landingPageStatus
          ? {
              landingPageMessage: receptionLabels.defaultReplyText[requestInPopup?.language].replace(
                'Caravan Park Sexten',
                domain.name,
              ),
            }
          : {}),
      }
      return tempSelectedData
    })
  }

  return (
    <div className="mt-6">
      <div className="bg-white flex gap-5 px-2 py-2 mb-2 rounded-lg">
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="channel">{receptionLabels.languageLabel[language]} : </label>
          <select
            id="channel"
            className="p-1 bg-white border border-green-500 rounded-lg outline-none cursor-pointer"
            onChange={(e) => {
              setLanguage(e.target.value)
            }}
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
            <option value="it">IT</option>
          </select>
        </div>
        <div className="">
          <button
            type="button"
            className={`text-sm text-black py-1.5 px-3 flex items-center gap-2 cursor-pointer rounded-lg border border-primary-400 hover:bg-primary-400 hover:font-medium`}
            onClick={handlePopupWithoutRequest}
          >
            <Plus className="fill-black" /> {receptionLabels.offerButtonLabel[language]}
          </button>
        </div>
      </div>
      <GridMaster
        headerText={receptionLabels.requestsLabel[language]}
        passedData={requests}
        length={requests.length}
        gridInfo={gridInfo}
        setGridInfo={setGridInfo}
        showNewButton={false}
        showSearch={false}
      >
        <div className="w-full min-h-[500px] mt-5 custom-scrollbar-2 overflow-x-auto bg-white">
          <table
            className="text-gray-600 rounded-lg border-collapse relative"
            style={{ borderSpacing: '0 1px' }}
            width="100%"
          >
            <thead>
              <tr className="font-semibold text-left">
                <th className="p-4 cursor-pointer min-w-[190px]" itemname="timestamp">
                  <div>
                    <div className="flex items-center cursor-pointer" onClick={handleSort('0')}>
                      <p>{receptionLabels.timeStampLabel[language]}</p>
                      {sortOrder.order === '0' ? (
                        <UpArrow
                          className={`fill-primary-400 ml-3 transition-all ${
                            sortOrder.direction === 'asc' ? 'rotate-0' : 'rotate-180'
                          }`}
                        />
                      ) : (
                        <>
                          <UpArrow className={`fill-[#B3B3B3] ml-3`} />
                          <UpArrow className={`fill-[#B3B3B3] rotate-180`} />
                        </>
                      )}
                    </div>
                    <div
                      className="cursor-pointer flex justify-between items-center border border-[#796B5F66] mt-2 py-1 px-2 rounded-md font-normal"
                      onClick={() => {
                        setShowTimeStampCalendar((st) => !st)
                      }}
                    >
                      <p className="text-xs text-gray-400">
                        {(searchFilter?.['columns[0][search][value]'] &&
                          JSON.parse(searchFilter?.['columns[0][search][value]'])?.join(' to ')) ||
                          `${receptionLabels.timeStampPlaceholderLabel[language]}`}
                      </p>
                      <Calendar className="fill-[#9F9687] w-[18px] h-[18px]" />
                    </div>
                    {showTimeStampCalendar && (
                      <div className="flex flex-col bg-white shadow-lg absolute z-10 calendar">
                        <Flatpickr
                          style={{
                            border: '1px solid #ccc',
                          }}
                          className={`rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-outline hidden`}
                          value={timeStampFilter}
                          options={{
                            showMonths: 2,
                            mode: 'range',
                            dateFormat: 'd-m-Y',
                            enableTime: false,
                            inline: true,
                            position: 'auto',
                            locale:
                              language == 'de'
                                ? { ...German, firstDayOfWeek: 1 }
                                : language == 'it'
                                ? { ...Italian, firstDayOfWeek: 1 }
                                : { ...English, firstDayOfWeek: 1 },
                          }}
                          onChange={([date1, date2]) => {
                            if (date1 && date2 && date1.getTime() !== date2.getTime()) {
                              const dat1 = date1.getDate() + '.' + (date1.getMonth() + 1) + '.' + date1.getFullYear()
                              const dat2 = date2.getDate() + '.' + (date2.getMonth() + 1) + '.' + date2.getFullYear()
                              const d1 =
                                date1.getFullYear() +
                                '-' +
                                (date1.getMonth() + 1 < 10 ? 0 + '' + (date1.getMonth() + 1) : date1.getMonth() + 1) +
                                '-' +
                                (date1.getDate() < 10 ? 0 + '' + date1.getDate() : date1.getDate())
                              const d2 =
                                date2.getFullYear() +
                                '-' +
                                (date2.getMonth() + 1 < 10 ? 0 + '' + (date2.getMonth() + 1) : date2.getMonth() + 1) +
                                '-' +
                                (date2.getDate() < 10 ? 0 + '' + date2.getDate() : date2.getDate())
                              setTimeStampFilter([dat1, dat2])
                              handleSearchFilters('0')({ target: { value: JSON.stringify([d1, d2]) } })
                              setShowTimeStampCalendar(false)
                            } else if (date1 && date2 && date1.getTime() === date2.getTime()) {
                              setTimeStampFilter([])
                              setShowTimeStampCalendar(false)
                              handleSearchFilters('0')({ target: { value: '' } })
                            }
                          }}
                        />
                        <div className="my-1 flex justify-center">
                          <button
                            type="button"
                            className={`text-sm text-white py-1.5 px-3 rounded-lg bg-primary-400 hover:font-medium`}
                            onClick={() => {
                              setTimeStampFilter([])
                              setShowTimeStampCalendar(false)
                              handleSearchFilters('0')({ target: { value: '' } })
                            }}
                          >
                            {receptionLabels.resetButtonLabel[language]}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="p-4 cursor-pointer" itemname="contact">
                  <div>
                    <div className="flex items-center" onClick={handleSort('6')}>
                      <p>{receptionLabels.contactLabel[language]} </p>
                      {sortOrder.order === '6' ? (
                        <UpArrow
                          className={`fill-primary-400 ml-2 transition-all ${
                            sortOrder.direction === 'asc' ? 'rotate-0' : 'rotate-180'
                          }`}
                        />
                      ) : (
                        <>
                          <UpArrow className={`fill-[#B3B3B3] ml-2`} />
                          <UpArrow className={`fill-[#B3B3B3] rotate-180`} />
                        </>
                      )}
                    </div>
                    <input
                      className="cursor-pointer flex justify-between items-center border border-[#796B5F66] mt-2 py-1.5 px-2 rounded-md font-normal text-xs"
                      placeholder={receptionLabels.contactPlaceholderLabel[language]}
                      onChange={handleSearchFilters('6')}
                    />
                  </div>
                </th>
                <th className="p-4 cursor-pointer" itemname="period">
                  <div>
                    <div className="flex items-center" onClick={handleSort('7')}>
                      <p>{receptionLabels.periodLabel[language]} </p>
                      {sortOrder.order === '7' ? (
                        <UpArrow
                          className={`fill-primary-400 ml-3 transition-all ${
                            sortOrder.direction === 'asc' ? 'rotate-0' : 'rotate-180'
                          }`}
                        />
                      ) : (
                        <>
                          <UpArrow className={`fill-[#B3B3B3] ml-3`} />
                          <UpArrow className={`fill-[#B3B3B3] rotate-180`} />
                        </>
                      )}
                    </div>
                    <div
                      className="cursor-pointer flex justify-between items-center border border-[#796B5F66] mt-2 py-1 px-2 rounded-md font-normal"
                      onClick={() => {
                        setShowPeriodCalendar((st) => !st)
                      }}
                    >
                      <p className="text-xs text-gray-400">
                        {(searchFilter?.['columns[7][search][value]'] &&
                          JSON.parse(searchFilter?.['columns[7][search][value]'])?.join(' to ')) ||
                          `${receptionLabels.periodPlaceholderLabel[language]}`}
                      </p>
                      <Calendar className="fill-[#9F9687] w-[18px] h-[18px]" />
                    </div>
                    {showPeriodCalendar && (
                      <div className="flex flex-col bg-white shadow-lg absolute z-10 calendar">
                        <Flatpickr
                          style={{
                            border: '1px solid #ccc',
                          }}
                          className={`rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-outline hidden`}
                          value={periodFilter}
                          options={{
                            showMonths: 2,
                            mode: 'range',
                            dateFormat: 'd-m-Y',
                            enableTime: false,
                            inline: true,
                            position: 'auto',
                            locale:
                              language == 'de'
                                ? { ...German, firstDayOfWeek: 1 }
                                : language == 'it'
                                ? { ...Italian, firstDayOfWeek: 1 }
                                : { ...English, firstDayOfWeek: 1 },
                          }}
                          onChange={([date1, date2]) => {
                            if (date1 && date2 && date1.getTime() !== date2.getTime()) {
                              const dat1 = date1.getDate() + '.' + (date1.getMonth() + 1) + '.' + date1.getFullYear()
                              const dat2 = date2.getDate() + '.' + (date2.getMonth() + 1) + '.' + date2.getFullYear()
                              const d1 =
                                date1.getFullYear() +
                                '-' +
                                (date1.getMonth() + 1 < 10 ? 0 + '' + (date1.getMonth() + 1) : date1.getMonth() + 1) +
                                '-' +
                                (date1.getDate() < 10 ? 0 + '' + date1.getDate() : date1.getDate())
                              const d2 =
                                date2.getFullYear() +
                                '-' +
                                (date2.getMonth() + 1 < 10 ? 0 + '' + (date2.getMonth() + 1) : date2.getMonth() + 1) +
                                '-' +
                                (date2.getDate() < 10 ? 0 + '' + date2.getDate() : date2.getDate())
                              setPeriodFilter([dat1, dat2])
                              handleSearchFilters('7')({ target: { value: JSON.stringify([d1, d2]) } })
                              setShowPeriodCalendar(false)
                            } else if (date1 && date2 && date1.getTime() === date2.getTime()) {
                              setPeriodFilter([])
                              setShowPeriodCalendar(false)
                              handleSearchFilters('7')({ target: { value: '' } })
                            }
                          }}
                        />
                        <div className="my-1 flex justify-center">
                          <button
                            type="button"
                            className={`text-sm text-white py-1.5 px-3 rounded-lg bg-primary-400 hover:font-medium`}
                            onClick={() => {
                              setPeriodFilter([])
                              setShowPeriodCalendar(false)
                              handleSearchFilters('7')({ target: { value: '' } })
                            }}
                          >
                            {receptionLabels.resetButtonLabel[language]}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="p-4 cursor-pointer" itemname="occupancy">
                  <div>
                    <div className="flex items-center" onClick={handleSort('8')}>
                      <p>{receptionLabels.occupancyLabel[language]} </p>
                      {sortOrder.order === '8' ? (
                        <UpArrow
                          className={`fill-primary-400 ml-3 transition-all ${
                            sortOrder.direction === 'asc' ? 'rotate-0' : 'rotate-180'
                          }`}
                        />
                      ) : (
                        <>
                          <UpArrow className={`fill-[#B3B3B3] ml-3`} />
                          <UpArrow className={`fill-[#B3B3B3] rotate-180`} />
                        </>
                      )}
                    </div>
                    <input className="invisible flex justify-between items-center border border-[#796B5F66] mt-2 py-1.5 px-2 rounded-md font-normal text-xs" />
                  </div>
                </th>
                <th className="p-4 cursor-pointer" itemname="referrer">
                  <div>
                    <div className="flex items-center" onClick={handleSort('9')}>
                      <p>{receptionLabels.referrerLabel[language]} </p>
                      {sortOrder.order === '9' ? (
                        <UpArrow
                          className={`fill-primary-400 ml-3 transition-all ${
                            sortOrder.direction === 'asc' ? 'rotate-0' : 'rotate-180'
                          }`}
                        />
                      ) : (
                        <>
                          <UpArrow className={`fill-[#B3B3B3] ml-3`} />
                          <UpArrow className={`fill-[#B3B3B3] rotate-180`} />
                        </>
                      )}
                    </div>
                    <input
                      className="cursor-pointer flex justify-between items-center border border-[#796B5F66] mt-2 py-1.5 px-2 rounded-md font-normal text-xs"
                      placeholder={receptionLabels.referrerPlaceholderLabel[language]}
                      onChange={handleSearchFilters('9')}
                    />
                  </div>
                </th>
                <th className="p-4 cursor-pointer" itemname="campaign">
                  <div>
                    <div className="flex items-center" onClick={handleSort('10')}>
                      <p>{receptionLabels.campaignLabel[language]} </p>
                      {sortOrder.order === '10' ? (
                        <UpArrow
                          className={`fill-primary-400 ml-3 transition-all ${
                            sortOrder.direction === 'asc' ? 'rotate-0' : 'rotate-180'
                          }`}
                        />
                      ) : (
                        <>
                          <UpArrow className={`fill-[#B3B3B3] ml-3`} />
                          <UpArrow className={`fill-[#B3B3B3] rotate-180`} />
                        </>
                      )}
                    </div>
                    <input
                      className="cursor-pointer flex justify-between items-center border border-[#796B5F66] mt-2 py-1.5 px-2 rounded-md font-normal text-xs"
                      placeholder={receptionLabels.campaignPlaceholderLabel[language]}
                      onChange={handleSearchFilters('10')}
                    />
                  </div>
                </th>
                <th className="p-4">
                  <div>
                    <p>E-mail</p>
                  </div>
                  <input className="invisible flex justify-between items-center border border-[#796B5F66] mt-2 py-1.5 px-2 rounded-md font-normal text-xs" />
                </th>
                <th className="p-4">
                  <div>
                    <p>Smart Response</p>
                  </div>
                  <input className="invisible flex justify-between items-center border border-[#796B5F66] mt-2 py-1.5 px-2 rounded-md font-normal text-xs" />
                </th>
              </tr>
            </thead>
            <caption
              className="absolute left-[50%] translate-x-[-50%] border-b border-black border-dashed border-bottom"
              style={{ width: '98%' }}
            ></caption>
            <tbody className="before:content-['-'] before:text-white">
              {requests.length > 0 ? (
                requests.map((request, index) => {
                  return (
                    <tr
                      key={request.id}
                      className={`text-left whitespace-pre ${index % 2 === 0 ? 'bg-[#cfcfcf33]' : 'bg-[#f5f5f566]'}`}
                    >
                      <td
                        className={`p-4 align-top ${
                          isNaN(Date.parse(request?.sent)) ||
                          !request?.autoreply ||
                          request?.autoreply?.status === 'preview'
                            ? 'border-l-4 border-[#FF0000]'
                            : ' border-l-4 border-[#68D0C2]'
                        }`}
                      >
                        {isNaN(Date.parse(request?.sent)) ? 'pending' : new Date(request?.sent).toLocaleString('de-DE')}
                      </td>
                      <td className="p-4 align-top">
                        <p>
                          {request?.firstname} {request?.lastname}
                        </p>
                        <p className="text-xs text-gray-500">{request?.email}</p>
                      </td>
                      <td className="p-4 align-top">
                        {Array.isArray(request?.period)
                          ? request?.period?.map((period, index) => (
                              <section key={index}>
                                <p>
                                  {period?.arrival?.split('-')?.reverse()?.join('.')} -{' '}
                                  {period?.departure?.split('-')?.reverse()?.join('.')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {period?.nights} {receptionLabels.nightsLabel[language]}
                                </p>
                              </section>
                            ))
                          : [request?.period]?.map((period, index) => (
                              <section key={index}>
                                <p>
                                  {period?.arrival?.split('-')?.reverse()?.join('.')} -{' '}
                                  {period?.departure?.split('-')?.reverse()?.join('.')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {period?.nights} {period?.nights && receptionLabels.nightsLabel[language]}
                                </p>
                              </section>
                            ))}
                      </td>
                      <td className="p-4 align-top">
                        {(Array.isArray(request?.room) ? request?.room : Object.values(request?.room || {}))?.map(
                          (item, index) => (
                            <p key={index}>
                              {item.adults} {receptionLabels.adultsLabel[language]}{' '}
                              {item.children > 0
                                ? ` - ${item.children} ${receptionLabels.childrenLabel[language]}`
                                : ''}
                            </p>
                          ),
                        )}
                        {request?.room.length > 1 && (
                          <p className="text-xs text-gray-500">
                            {request?.room.length} {receptionLabels.roomLabel[language]}
                          </p>
                        )}
                      </td>
                      <td className="p-4 align-top">
                        <p>{request?.referrer !== 'false' && request?.referrer && new URL(request?.referrer).host}</p>
                      </td>
                      <td className="p-4 align-top">
                        <p>{request?.campaign?.campaign}</p>
                        <section className="flex gap-2 p-1">
                          {' '}
                          <p className="w-1/2 text-center border-r border-gray-500">{request?.campaign?.source}</p>
                          <p className="w-1/2 px-2 text-center text-gray-500">{request?.campaign?.medium}</p>
                        </section>
                      </td>
                      <td
                        className="p-4 align-top text-green-500 cursor-pointer"
                        onClick={handleTemplateRedirect(request, 'mail')}
                      >
                        {receptionLabels.enquiryTemplateLabel[language]}
                      </td>
                      <td className="p-4 align-top">
                        {isNaN(Date.parse(request?.sent)) ||
                        !request?.autoreply ||
                        request?.autoreply?.status === 'preview' ? (
                          request?.channel === 'umts' ? (
                            <div className="flex items-center divide-x divide-dashed divide-black">
                              <span
                                onClick={() => {
                                  handlePopupWithRequest(request)
                                }}
                                className="group relative"
                              >
                                <Edit className="fill-[#4b5563] cursor-pointer w-7 h-7 mr-3" />
                                <div className="absolute left-[40%] -translate-x-1/2 -top-8 flex-col items-center hidden mb-6 group-hover:flex">
                                  <span className="relative z-50 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg w-full rounded-md">
                                    {receptionLabels.editRequestAndResponseLabel[language]}
                                  </span>
                                  <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
                                </div>
                              </span>
                              <span
                                onClick={() => {
                                  handleDeleteRequest(request)
                                }}
                                className="pl-3 group relative"
                              >
                                <Delete className="fill-red-500 cursor-pointer w-5 h-5" />
                                <div className="absolute left-[65%] -translate-x-1/2 -top-9 flex-col items-center hidden mb-6 group-hover:flex">
                                  <span className="relative z-50 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg w-full rounded-md">
                                    {receptionLabels.deleteEnquiryLabel[language]}
                                  </span>
                                  <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
                                </div>
                              </span>
                            </div>
                          ) : (
                            <p
                              className={`text-red-500 cursor-pointer`}
                              onClick={() => {
                                handlePopupWithRequest(request)
                              }}
                            >
                              {receptionLabels.responseCreateStatusLabel[language]}
                            </p>
                          )
                        ) : (
                          <p
                            className="text-green-500 cursor-pointer"
                            onClick={handleTemplateRedirect(request, 'autoreply')}
                          >
                            R - {request.no}
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-xl text-center">
                    No Requests Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GridMaster>

      {showModal && (
        <PopUp openModal={showModal}>
          <Reception
            popupLoading={popupLoading}
            language={language}
            clientId={clientId}
            requestInPopup={requestInPopup}
            setRequestInPopup={setRequestInPopup}
            setShowModal={setShowModal}
            selectedData={selectedData}
            setSelectedData={setSelectedData}
            styletmp={styletmp}
            maxRoomsPerBooking={maxRoomsPerBooking}
            handleQuickResponse={handleQuickResponse}
            handleSmartResponseTemplate={handleSmartResponseTemplate}
            rooms={rooms}
            interests={interests}
            offers={offers}
            setOffers={setOffers}
            maxAdults={maxAdults}
            maxChildAge={maxChildAge}
            isValid={isValid}
            setIsValid={setIsValid}
            enquiryPopup={enquiryPopup}
            fetchAvailableOffers={fetchAvailableOffers}
            handleLanguageChange={handleLanguageChange}
            blockProps={blockProps}
          />
        </PopUp>
      )}
      {showPreview && (
        <PopUp openModal={showPreview}>
          <div
            className="z-50"
            style={{ background: '#000000E6', height: '100vh', display: 'flex', justifyContent: 'center' }}
          >
            <div className="w-[80%] h-full bg-white">
              <div className="float-right">
                <svg
                  onClick={() => {
                    setShowPreview(false)
                  }}
                  className="w-8 h-8 cursor-pointer fill-current"
                  role="button"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div id="iframe-spinner" className={`flex items-center justify-center h-full`}>
                <div className="inline-block w-8 h-8 border-4 rounded-full spinner-border animate-spin" role="status">
                  <span className="visually-hidden"></span>
                </div>
              </div>
              <iframe
                width="100%"
                height="100%"
                onLoad={() => {
                  document.getElementById('iframe-spinner').style.cssText = 'display:none !important'
                }}
                src={previewUrl.template}
              ></iframe>
              <button
                onClick={handleSmartResponseTemplate('pending')}
                style={{
                  transform: 'translateX("-50%")',
                  right: '47.5%',
                }}
                type="button"
                className={`fixed bottom-10 text-white py-3 px-6 rounded-lg hover:font-medium ml-2 bg-primary-400`}
              >
                {receptionLabels.submitLabel[language]}
              </button>
            </div>
          </div>
        </PopUp>
      )}
    </div>
  )
}

export default Requests

export async function getServerSideProps(context) {
  return Authenticate(context)
}
