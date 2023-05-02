import React, { useState, useEffect, useRef, useMemo, memo } from 'react'
import ChevronLeft from '../../icons/chevronLeft'
import TickSquare from '../../icons/tickSquare'
import SuccessRectangle from '../../icons/successRectangle'
import ActiveSuccessRectangle from '../../icons/activeSuccessRectangle'
import DangerRectangle from '../../icons/dangerRectangle'
import WrappedBox from '../../icons/wrappedBox'
import MultiSelect from '../../parking/MultiSelect'
import { Select } from '../../componentLibrary'
import receptionLabels from '../../../translations/reception.json'
import { deepClone } from '../../../lib/object'

const getElementCountByScreenWidth = () => {
  const scrnWidth = window.screen.width
  if (scrnWidth > 2200) {
    return Math.round(window.screen.width / 100) + 5
  }
  if (scrnWidth > 1800) {
    return Math.round(window.screen.width / 100) + 4
  }
  if (scrnWidth > 1500) {
    return Math.round(window.screen.width / 100) + 3
  }
  if (scrnWidth > 1000) {
    return Math.round(window.screen.width / 100) - 1
  }
  return Math.floor(window.screen.width / 100)
}

const RoomsTab = ({
  show,
  maxAdults,
  maxChildAge,
  rooms,
  loading,
  rateplans,
  offers,
  selectedData,
  setSelectedData,
  language,
  roomOccupancyIndex,
  setShowCalendar,
  responseIndex,
}) => {
  const [dates, setDates] = useState([])
  const [filteredRooms, setFilteredRooms] = useState(() =>
    rooms.map((room) => {
      return room.code
    }),
  )
  const [filteredMealPlans, setFilteredMealPlans] = useState(() =>
    Object.entries(rateplans?.mealplans || {}).map(([key]) => key.toString()),
  )
  const refOccupancySelect = useRef()
  const [limit, setLimit] = useState(getElementCountByScreenWidth)
  const [offset, setOffset] = useState(0)
  const [rightRowHeadRef, setRightRowHeadRef] = useState(null)
  const [leftRowHeadRef, setLeftRowHeadRef] = useState(null)
  const [rightRowEleWidth, setRightRowEleWidth] = useState([])
  const [rightRowWidth, setRightRowWidth] = useState(0)
  const [leftRowWidth, setLeftRowWidth] = useState(0)
  const [showOccSelection, setShowOccSelection] = useState(0)
  const [availableRooms, setAvailableRooms] = useState([]) //Remove after sorted offers
  const [availableDates, setAvailableDates] = useState([])
  const [accordionState, setAccordionState] = useState({})
  const [opacity, setOpacity] = useState(0)
  const [occupancy, setOccupancy] = useState(selectedData.occupancy)
  const [localizedRateSelection, setLocalizedRateSelection] = useState(
    selectedData?.rateCodes?.[roomOccupancyIndex] || {},
  )
  const [localizedRoomTitles, setLocalizedRoomTitles] = useState(selectedData?.roomTitles || {})
  const [localizedOfferSelection, setLocalizedOfferSelection] = useState(
    selectedData?.offerCodes?.[roomOccupancyIndex] || {},
  )
  const [localizedOfferTitles, setLocalizedOfferTitles] = useState(selectedData?.offerTitles || {})
  const [sortedRatePlans, setSortedRatePlans] = useState(rateplans)

  const availabilitiesToRoomMap = useMemo(
    () =>
      rateplans?.rates?.reduce((acc, rate) => {
        acc[rate.roomCode] = rate?.rateplans?.[0]?.availabilities?.split('|')?.slice(offset, offset + limit)
        return acc
      }, {}),
    [rateplans, limit, offset],
  )

  const restructuredOffers = useMemo(() => {
    return offers.reduce((acc, offer) => {
      acc[offer.code] = {
        rates: offer.rates.reduce((pre, cur) => {
          pre[cur.code] = cur.total
          return pre
        }, {}),
        offers: offer.offers.reduce((pre, cur) => {
          pre[cur.code] = cur.total
          return pre
        }, {}),
      }
      return acc
    }, {})
  }, [offers])

  const days = receptionLabels.days[language]
  const months = receptionLabels.months[language]

  const getMonth = (number) => {
    return months.split(',')[number]
  }
  const getDay = (number) => {
    return days.split(',')[number]
  }

  // to get date after n number of days.
  const nthDate = (n) => {
    return new Date().setDate(new Date().getDate() + n)
  }

  const formatNumbers = (str) => {
    return str > 9 ? str : '0' + str
  }

  const pagePrev = () => {
    setOffset((o) => (o > 0 ? (o - limit < 0 ? 0 : o - limit) : 0))
  }

  const pageNext = () => {
    setOffset((o) => (o + limit < dates.length ? o + limit : o))
  }

  const handleAccordion = (room) => () => {
    setAccordionState((ac) => ({
      ...ac,
      [room.code]: !ac?.[room.code],
    }))
  }

  const handleRateplanCheckbox = (rateplan, roomTitle) => () => {
    const tempLocalizedRateSelection = { ...localizedRateSelection }
    const tempLocalizedRoomTitles = { ...localizedRoomTitles }
    if (!tempLocalizedRateSelection?.[rateplan.room_code]) {
      tempLocalizedRateSelection[rateplan.room_code] = []
    }

    const idxOfRate = tempLocalizedRateSelection?.[rateplan.room_code]?.indexOf(rateplan.rate_code)

    if (idxOfRate > -1) {
      tempLocalizedRateSelection?.[rateplan.room_code]?.splice(idxOfRate, 1)
      if (tempLocalizedRateSelection?.[rateplan.room_code].length === 0) {
        delete tempLocalizedRateSelection?.[rateplan.room_code]
      }
    } else {
      tempLocalizedRateSelection?.[rateplan.room_code]?.push(rateplan.rate_code)
    }
    if (!tempLocalizedRoomTitles?.[rateplan.room_code]) {
      tempLocalizedRoomTitles[rateplan.room_code] = {
        title: roomTitle,
        count: 1,
      }
    } else {
      tempLocalizedRoomTitles[rateplan.room_code] = {
        title: roomTitle,
        count: tempLocalizedRoomTitles[rateplan.room_code].count + (idxOfRate > -1 ? -1 : 1),
      }
      if (!tempLocalizedRoomTitles?.[rateplan.room_code]?.count) {
        delete tempLocalizedRoomTitles?.[rateplan.room_code]
      }
    }

    setLocalizedRateSelection(tempLocalizedRateSelection)
    setLocalizedRoomTitles(tempLocalizedRoomTitles)
    setSelectedData((st) => {
      const tempSelectedData = [...st]
      if (!tempSelectedData?.[responseIndex]?.rateCodes) {
        tempSelectedData[responseIndex].rateCodes = []
      }
      if (!Object.values(tempLocalizedRateSelection).length) {
        tempSelectedData?.[responseIndex]?.rateCodes?.splice(roomOccupancyIndex, 1, null)
      } else {
        tempSelectedData[responseIndex].rateCodes[roomOccupancyIndex] = tempLocalizedRateSelection
      }
      tempSelectedData[responseIndex].roomTitles = tempLocalizedRoomTitles
      return tempSelectedData
    })
  }

  const handleOfferCheckbox = (offerCode, offerTitle, roomCode) => () => {
    const tempLocalizedOfferSelection = { ...localizedOfferSelection }
    const tempLocalizedOfferTitles = { ...localizedOfferTitles }

    if (!tempLocalizedOfferSelection?.[roomCode]) {
      tempLocalizedOfferSelection[roomCode] = []
    }

    const idxOfRate = tempLocalizedOfferSelection?.[roomCode]?.indexOf(offerCode)

    if (idxOfRate > -1) {
      tempLocalizedOfferSelection?.[roomCode]?.splice(idxOfRate, 1)
      if (tempLocalizedOfferSelection?.[roomCode].length === 0) {
        delete tempLocalizedOfferSelection?.[roomCode]
      }
    } else {
      tempLocalizedOfferSelection?.[roomCode]?.push(offerCode)
    }

    if (!tempLocalizedOfferTitles?.[roomCode]) {
      tempLocalizedOfferTitles[roomCode] = {
        title: offerTitle,
        count: 1,
      }
    } else {
      tempLocalizedOfferTitles[roomCode] = {
        title: offerTitle,
        count: tempLocalizedOfferTitles[roomCode].count + (idxOfRate > -1 ? -1 : 1),
      }
      if (!tempLocalizedOfferTitles?.[roomCode]?.count) {
        delete tempLocalizedOfferTitles?.[roomCode]
      }
    }

    setLocalizedOfferSelection(tempLocalizedOfferSelection)
    setLocalizedOfferTitles(tempLocalizedOfferTitles)
    setSelectedData((st) => {
      const tempSelectedData = [...st]
      if (!tempSelectedData?.[responseIndex]?.offerCodes) {
        tempSelectedData[responseIndex].offerCodes = []
      }
      if (!Object.values(tempLocalizedOfferSelection).length) {
        tempSelectedData[responseIndex]?.offerCodes?.splice(roomOccupancyIndex, 1, null)
      } else {
        tempSelectedData[responseIndex].offerCodes[roomOccupancyIndex] = tempLocalizedOfferSelection
      }
      tempSelectedData[responseIndex].offerTitles = tempLocalizedOfferTitles
      return tempSelectedData
    })
  }

  const handleRooms = () => {
    const tempRoom = rooms
      .filter((room) => filteredRooms.includes(room.code))
      .reduce((acc, cur) => {
        acc[cur.code] = cur
        return acc
      }, {})
    setAvailableRooms(tempRoom)
  }

  const updateWindowDimensions = () => {
    setLimit(getElementCountByScreenWidth())
  }

  useEffect(() => {
    let dateArr = []
    for (let i = 0; i < 365; i++) {
      dateArr.push(new Date(nthDate(i)))
    }
    setDates(dateArr)
    window.addEventListener('resize', updateWindowDimensions)
    return () => window.removeEventListener('resize', updateWindowDimensions)
  }, [])

  const datesAndAvailabilityViewSize = () => {
    if (rightRowHeadRef && rightRowHeadRef?.querySelector('table') && limit && offset >= 0) {
      const eleInRightRow = []
      rightRowHeadRef?.querySelectorAll('td').forEach((ele) => {
        eleInRightRow.push(window.getComputedStyle(ele).width)
      })
      eleInRightRow?.length && setRightRowEleWidth(eleInRightRow)
      const tempRightRowWidth = parseFloat(window.getComputedStyle(rightRowHeadRef)?.width)
      !isNaN(tempRightRowWidth) && setRightRowWidth(tempRightRowWidth.toFixed(1))
    }
    if (leftRowHeadRef) {
      const tempLeftRowWidth = parseFloat(window.getComputedStyle(leftRowHeadRef)?.width)
      !isNaN(tempLeftRowWidth) && setLeftRowWidth(tempLeftRowWidth.toFixed(1))
    }
    window.addEventListener('resize', datesAndAvailabilityViewSize)
    return () => {
      window.removeEventListener('resize', datesAndAvailabilityViewSize)
    }
  }

  useEffect(datesAndAvailabilityViewSize, [rightRowHeadRef, leftRowHeadRef, availableDates, rateplans, rooms])

  useEffect(() => {
    setFilteredRooms(
      rooms.map((room) => {
        return room.code
      }),
    )
    setFilteredMealPlans(
      Object.keys(rateplans?.mealplans || {}).map((item) => {
        return item.toString()
      }),
    )
  }, [rooms])

  useEffect(() => {
    if (selectedData?.period?.arrival) {
      const dateIndex = dates.findIndex(
        (date) => date && date.toISOString().substr(0, 10) === selectedData.period.arrival,
      )
      if (dateIndex >= 0) {
        setOffset(dateIndex)
      }
    }
  }, [rateplans, selectedData, dates])

  useEffect(() => {
    handleRooms()
  }, [filteredRooms, restructuredOffers])

  useEffect(() => {
    if (rateplans) {
      const tempRateplans = deepClone(rateplans)
      tempRateplans.rates
        .sort((rate) => (restructuredOffers?.[rate.roomCode] ? -1 : 1))
        .forEach((rate) => {
          rate.rateplans
            .sort((rp) => (restructuredOffers?.[rate.roomCode]?.rates?.[rp.rate_code] ? -1 : 1))
            .forEach((rp) => {
              rp.availabilities = rp.availabilities.split('|').slice(offset, offset + limit)
            })
          rate.offers
            .sort((o) => (restructuredOffers?.[rate.roomCode]?.offers?.[o.rate_code] ? -1 : 1))
            .forEach((o) => {
              o.availabilities = o.availabilities.split('|').slice(offset, offset + limit)
            })
        })
      setSortedRatePlans(tempRateplans)
    }
  }, [restructuredOffers, rateplans, offset, limit])

  useEffect(() => {
    const tempDates = [...dates.slice(offset, offset + limit)]
    setAvailableDates(tempDates)
  }, [dates, limit, offset])

  useEffect(() => {
    const tempAccordionState = { ...accordionState }
    Object.keys(localizedRateSelection || {}).forEach((roomCode) => {
      tempAccordionState[roomCode] = Object.prototype.hasOwnProperty.call(tempAccordionState, roomCode)
        ? tempAccordionState[roomCode]
        : true
    })
    Object.keys(localizedOfferSelection || {}).forEach((roomCode) => {
      tempAccordionState[roomCode] = Object.prototype.hasOwnProperty.call(accordionState, roomCode)
        ? accordionState[roomCode]
        : true
    })
    setAccordionState(tempAccordionState)
  }, [offers])

  useEffect(() => {
    let timer
    if (show) {
      setOpacity(0)
      timer = setTimeout(() => {
        setOpacity(100)
        clearTimeout(timer)
      }, 250)
    } else {
      setOpacity(0)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [show])

  if (loading.roomsLoading) {
    return (
      <div
        className={`flex items-center justify-center h-full ${
          !show && 'hidden'
        } transition-opacity duration-200 opacity-${opacity}`}
      >
        <div className="inline-block w-8 h-8 border-4 rounded-full spinner-border animate-spin" role="status">
          <span className="visually-hidden"></span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`custom-scrollbar-2 text-sm px-5 py-2 overflow-x-hidden transition-opacity duration-200 ${
        !show && 'hidden'
      } opacity-${opacity}`}
    >
      <div className="border-b border-dashed border-[#0000004d] flex items-center gap-5">
        <div
          ref={setLeftRowHeadRef}
          className="flex flex-wrap 2xl:flex-nowrap items-center gap-1 justify-between py-1 pb-3"
          style={{ width: '50%' }}
        >
          <div className="" style={{ flex: '1 1 auto' }}>
            <MultiSelect
              label={receptionLabels.roomLabel[language]}
              options={rooms.map((room) => {
                return { title: room.title, value: room.code }
              })}
              onChange={(values) => {
                setFilteredRooms(values)
              }}
              values={filteredRooms}
              reset={false}
              onReset={() => {
                setFilteredRooms(
                  rooms.map((room) => {
                    return room.code
                  }),
                )
              }}
            />
          </div>
          <div className="" style={{ flex: '1 1 auto' }}>
            <MultiSelect
              label={receptionLabels.mealplansLabel[language]}
              options={Object.entries(rateplans?.mealplans || {}).map(([key, value]) => {
                return { title: value, value: key }
              })}
              onChange={(values) => {
                setFilteredMealPlans(values)
              }}
              values={filteredMealPlans}
              reset={false}
              onReset={() => {
                setFilteredMealPlans(
                  Object.entries(rateplans?.mealplans || {}).map(([key]) => {
                    return key
                  }),
                )
              }}
            />
          </div>
          <div className="relative items-center pl-3 pr-1 py-1  border border-green-500 justify-center flex rounded-lg text-gray-700">
            <span className="mx-5">{receptionLabels.occupancyLabel[language]}</span>
            <span
              className="flex items-center w-8 py-1 pl-2 text-gray-600 border-l border-gray-200 cursor-pointer select-none"
              onClick={(e) => {
                e.stopPropagation()
                setShowOccSelection(true)
              }}
            >
              <svg version="1.1" className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path
                  d="M17.418,6.109c0.272-0.268,0.709-0.268,0.979,0s0.271,0.701,0,0.969l-7.908,7.83
                  c-0.27,0.268-0.707,0.268-0.979,0l-7.908-7.83c-0.27-0.268-0.27-0.701,0-0.969c0.271-0.268,0.709-0.268,0.979,0L10,13.25
                  L17.418,6.109z"
                ></path>
              </svg>
            </span>
            {showOccSelection ? (
              <div
                className="absolute top-[40px] z-20 w-[300px] left-0 bg-white"
                style={{ boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.20)' }}
                ref={refOccupancySelect}
              >
                <div className="mx-auto bg-[#68D0C2] px-4 py-3 text-white">
                  {receptionLabels.roomOccupancyLabel[language]}
                </div>
                <div className="p-2">
                  <div className="flex items-center justify-between p-1 px-4">
                    <span className="w-1/2">{receptionLabels.adultsLabel[language]}</span>
                    <span className="w-1/2">
                      <Select
                        onChange={(e) => {
                          let children = occupancy?.[roomOccupancyIndex].children
                          if (e.target.value > maxAdults - children) {
                            children = maxAdults - e.target.value
                          }
                          setOccupancy((t) => {
                            const occ = [...t]
                            occ[roomOccupancyIndex] = {
                              ...occ[roomOccupancyIndex],
                              adults: e.target.value,
                              children: children,
                            }
                            return occ
                          })
                        }}
                        variant="primary"
                        className="!py-1"
                        defaultValue={occupancy?.[roomOccupancyIndex]?.adults}
                        value={occupancy?.[roomOccupancyIndex]?.adults}
                      >
                        <option value={0}>{`0 ${receptionLabels.adultLabel[language]}`}</option>
                        {Array(maxAdults - (occupancy?.[roomOccupancyIndex]?.children || 0))
                          .fill(1)
                          .map((item, index) => {
                            const adultCount = item + index
                            return (
                              <option key={adultCount} value={adultCount}>
                                {adultCount}{' '}
                                {adultCount > 1
                                  ? receptionLabels.adultsLabel[language]
                                  : receptionLabels.adultLabel[language]}
                              </option>
                            )
                          })}
                      </Select>
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1 px-4">
                    <span className="w-1/2">{receptionLabels.childrenLabel[language]}</span>
                    <span className="w-1/2">
                      <Select
                        onChange={(e) => {
                          let arr = occupancy?.[roomOccupancyIndex]?.childage
                          if (arr.length > parseInt(e.target.value)) {
                            arr = arr.slice(0, e.target.value)
                          } else {
                            arr = [
                              ...occupancy?.[roomOccupancyIndex]?.childage,
                              ...Array(
                                parseInt(e.target.value) - occupancy?.[roomOccupancyIndex]?.childage.length,
                              ).fill(0),
                            ]
                          }
                          setOccupancy((t) => {
                            const occ = [...t]
                            occ[roomOccupancyIndex] = {
                              ...occ[roomOccupancyIndex],
                              children: e.target.value,
                              childage: arr,
                            }
                            return occ
                          })
                        }}
                        variant="primary"
                        className="!py-1"
                        defaultValue={occupancy?.[roomOccupancyIndex]?.children}
                        value={occupancy?.[roomOccupancyIndex]?.children}
                      >
                        {Array(maxAdults)
                          .fill(1)
                          .map((_, index) => {
                            if (index <= maxAdults - occupancy?.[roomOccupancyIndex]?.adults) {
                              return (
                                <option key={index} value={index}>
                                  {index}{' '}
                                  {index > 1
                                    ? receptionLabels.childrenLabel[language]
                                    : receptionLabels.childLabel[language]}
                                </option>
                              )
                            }
                          })}
                      </Select>
                    </span>
                  </div>
                  {occupancy?.[roomOccupancyIndex]?.childage.map((item, i) => {
                    if (i < maxAdults - occupancy?.[roomOccupancyIndex]?.adults) {
                      return (
                        <div className="flex items-center justify-between p-1 px-4">
                          <span className="w-1/2">{i === 0 && 'Age of Children'}</span>
                          <span className="w-1/2">
                            <Select
                              onChange={(e) => {
                                let childage = occupancy?.[roomOccupancyIndex]?.childage
                                childage.splice(i, 1, e.target.value)
                                setOccupancy((t) => {
                                  const occ = [...t]
                                  occ[roomOccupancyIndex] = {
                                    ...occ[roomOccupancyIndex],
                                    childage: childage,
                                  }
                                  return occ
                                })
                              }}
                              variant="primary"
                              className="!py-1"
                              defaultValue={item}
                              value={item}
                            >
                              {Array(maxChildAge + 1)
                                .fill(1)
                                .map((_, index) => {
                                  return (
                                    <option key={index} value={index}>
                                      {index} {receptionLabels.yearsLabel[language]}
                                    </option>
                                  )
                                })}
                            </Select>
                          </span>
                        </div>
                      )
                    }
                  })}
                </div>
                <div className="py-2 bg-white flex justify-center">
                  <button
                    type="button"
                    className={`text-sm text-white py-1.5 px-3 rounded-lg bg-primary-400 hover:font-medium`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowOccSelection(false)
                      setSelectedData((st) => {
                        const tempSelectedData = [...st]
                        tempSelectedData[responseIndex] = {
                          ...tempSelectedData[responseIndex],
                          occupancy,
                        }
                        return tempSelectedData
                      })
                    }}
                  >
                    {receptionLabels.calendarCloseButtonLabel[language]}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center" ref={setRightRowHeadRef}>
          <span className="cursor-pointer select-none" onClick={pagePrev}>
            <ChevronLeft className="fill-[#000]" />
          </span>
          {!!availableDates.length && (
            <table className={`${availableDates.length === getElementCountByScreenWidth() && 'mx-auto'}`}>
              <tbody>
                <tr>
                  {availableDates.length ? (
                    availableDates.map((date, i) => {
                      const day = getDay(date.getDay())
                      return (
                        <td
                          className={`select-none px-3 py-[1.5px] mx-[1px] text-center ${
                            date.getDay() === 0 || date.getDay() === 6 ? 'bg-[#efefef]' : ''
                          } ${
                            i !== 0 && date.getDate() === 1 && 'border-l border-dashed border-[#0000004D]'
                          } cursor-pointer`}
                          key={i}
                          onClick={() => {
                            setShowCalendar(true)
                          }}
                        >
                          <span className={`${i !== 0 && date.getDate() !== 1 && 'invisible'}`}>
                            {i === 0 || date.getDate() === 1 ? getMonth(date.getMonth()) : '-'}
                          </span>
                          <span className="block">{day}</span>
                          <span className={`${(date.getDay() === 0 || date.getDay() === 6) && 'font-bold'}`}>
                            {formatNumbers(date.getDate())}
                          </span>
                        </td>
                      )
                    })
                  ) : (
                    <td></td>
                  )}
                </tr>
              </tbody>
            </table>
          )}
          <span className="cursor-pointer ml-auto select-none" onClick={pageNext}>
            <ChevronLeft className="fill-[#000] rotate-[180deg]" />
          </span>
        </div>
      </div>
      {!selectedData.period.arrival && !selectedData.period.departure ? (
        <>
          <div
            className={`flex items-center justify-center mt-40 ${
              !show && 'hidden'
            } transition-opacity duration-200 opacity-${opacity}`}
          >
            <h1 className="text-lg font-bold">
              {receptionLabels.openCalendarLabel[language].slice(
                0,
                receptionLabels.openCalendarLabel[language].indexOf(`(${receptionLabels.clickLabel[language]})`),
              )}
              <a
                className="text-blue-400 underline underline-offset-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowCalendar(true)
                }}
              >
                {receptionLabels.clickLabel[language]}
              </a>{' '}
              {receptionLabels.openCalendarLabel[language]
                .slice(receptionLabels.openCalendarLabel[language].indexOf(`(${receptionLabels.clickLabel[language]})`))
                .replace(`(${receptionLabels.clickLabel[language]})`, '')}
            </h1>
          </div>
        </>
      ) : (
        <>
          {sortedRatePlans &&
          !!sortedRatePlans?.rates?.length &&
          !isNaN(Number(occupancy?.[roomOccupancyIndex]?.adults)) &&
          Number(occupancy?.[roomOccupancyIndex]?.adults) > 0 ? (
            sortedRatePlans.rates.map(({ roomCode, rateplans, offers }, index) => {
              const roomAndAvailability = availabilitiesToRoomMap?.[roomCode]
              const roomDetails = availableRooms[roomCode]
              const filteredRateplans = rateplans?.filter((rateplan) =>
                filteredMealPlans.includes(rateplan?.meal_plan_code),
              )
              const filteredOffers = offers?.filter((offer) => filteredMealPlans.includes(offer?.meal_plan_code))
              return (
                <div key={`${roomCode}-${index}`}>
                  <div
                    className={`flex my-2 py-2 ${
                      restructuredOffers[roomCode] ? 'bg-[#68d0c226]' : 'bg-gray-100'
                    } gap-5`}
                  >
                    <div className="pl-2" style={{ width: `${leftRowWidth}px` }}>
                      <div className="flex justify-between" style={{ width: '90%' }}>
                        <span
                          className="flex items-center cursor-pointer select-none"
                          onClick={handleAccordion(roomDetails, index)}
                        >
                          <span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className={`fill-[#68D0C2] transition-all duration-200 ${
                                accordionState?.[roomCode] ? 'rotate-[270deg]' : 'rotate-[180deg]'
                              }`}
                            >
                              <path
                                d="M11.3312 1.80638C11.2016 1.67598 11.0248 1.60078 10.84 1.59998C10.656 1.59838 10.4776 1.67278 10.3496 1.80638L4.65439 7.50157C4.52399 7.63037 4.44955 7.80798 4.44955 7.99198C4.44955 8.17678 4.52399 8.35356 4.65439 8.48316L10.3488 14.18C10.4776 14.3176 10.6568 14.3968 10.844 14.4C11.0328 14.4032 11.2144 14.3304 11.348 14.1968C11.4808 14.0632 11.5544 13.8816 11.5504 13.6936C11.548 13.5056 11.468 13.3264 11.3312 13.1976L6.12797 7.99198L11.332 2.78878C11.4632 2.65918 11.536 2.48157 11.536 2.29757C11.536 2.11357 11.4624 1.93678 11.3312 1.80638Z"
                                fill="inherit"
                                fillOpacity="1"
                              />
                            </svg>
                          </span>
                          <span className="ml-2">
                            <span className="text-lg">{roomDetails?.title}</span> ( Min {roomDetails?.occupancy.min},
                            Std {roomDetails?.occupancy.std}, Max {roomDetails?.occupancy.max} )
                          </span>
                        </span>
                        <span className="text-[#00000059]">{roomCode}</span>
                      </div>
                    </div>
                    <div className="flex items-center" style={{ width: `${rightRowWidth}px` }}>
                      <span style={{ width: '16px' }}></span>
                      {!!roomAndAvailability?.length && (
                        <table
                          className={`${roomAndAvailability.length === getElementCountByScreenWidth() && 'mx-auto'}`}
                        >
                          <tbody>
                            <tr>
                              {rightRowEleWidth.length ? (
                                roomAndAvailability?.map((availability, i) => {
                                  return (
                                    <td
                                      style={{
                                        width: rightRowEleWidth[i],
                                      }}
                                      className={`px-3 py-[1.5px] mx-[1px] cursor-pointer text-center ${
                                        i !== 0 &&
                                        availableDates?.[i]?.getDate() === 1 &&
                                        'border-l border-dashed border-[#0000004D]'
                                      }`}
                                      key={i}
                                      onClick={() => {
                                        setShowCalendar(true)
                                      }}
                                    >
                                      <span style={{ color: `${+availability === 0 ? '#ff0000a6' : '#12972fbf'}` }}>
                                        {+availability > 9 ? availability : '0'.concat(availability)}
                                      </span>
                                    </td>
                                  )
                                })
                              ) : (
                                <td></td>
                              )}
                            </tr>
                          </tbody>
                        </table>
                      )}
                      <span style={{ width: '16px' }} className="ml-auto"></span>
                    </div>
                  </div>
                  {accordionState?.[roomCode] && (
                    <div>
                      {filteredRateplans?.map((rateplan) => {
                        const priceTotalOfRateplan = restructuredOffers?.[roomCode]?.rates?.[rateplan.rate_code]
                        return (
                          <div key={rateplan.rate_code}>
                            <div className="flex my-[1.5px] gap-5">
                              <div
                                className="pl-6 border-r border-dashed border-[#000000]"
                                style={{ width: `${leftRowWidth}px` }}
                              >
                                <div
                                  className="flex py-2 justify-between border-b border-dashed border-[#00000026]"
                                  style={{ width: '90%' }}
                                >
                                  <span
                                    className="flex items-center cursor-pointer select-none"
                                    onClick={
                                      priceTotalOfRateplan && handleRateplanCheckbox(rateplan, roomDetails?.title)
                                    }
                                  >
                                    {localizedRateSelection?.[rateplan.room_code]?.includes(rateplan.rate_code) &&
                                    priceTotalOfRateplan ? (
                                      <>
                                        <TickSquare className="fill-[#68D0C2] cursor-pointer w-4 h-4 select-none" />
                                      </>
                                    ) : (
                                      <span
                                        className={`w-4 h-4 border-2 border-[#CACACA] rounded-sm select-none ${
                                          !priceTotalOfRateplan && 'bg-gray-300'
                                        }`}
                                      />
                                    )}
                                    <span className="pl-2">{rateplan.title}</span>
                                  </span>
                                  <span className="text-[#00000059]">
                                    {priceTotalOfRateplan &&
                                      `${receptionLabels.priceLabel[language]}: ${
                                        language === 'en'
                                          ? priceTotalOfRateplan?.toLocaleString('en-US', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })
                                          : priceTotalOfRateplan?.toLocaleString('de-DE', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })
                                      } €`}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center" style={{ width: `${rightRowWidth}px` }}>
                                <span style={{ width: '16px' }}></span>
                                <span
                                  className={`py-2 border-b border-dashed border-[#00000026] ${
                                    roomAndAvailability.length === getElementCountByScreenWidth() && 'mx-auto'
                                  }`}
                                >
                                  {!!rateplan?.availabilities.length && (
                                    <table>
                                      <tbody>
                                        <tr>
                                          {rightRowEleWidth.length ? (
                                            rateplan?.availabilities?.map((availability, i) => {
                                              return (
                                                <td
                                                  style={{
                                                    width: rightRowEleWidth?.[i],
                                                    maxWidth: rightRowEleWidth?.[i],
                                                  }}
                                                  className="px-[5.5px] py-[1.5px]"
                                                  key={`${rateplan.rate_code}-${i}`}
                                                >
                                                  <span className="flex justify-center">
                                                    {+availability > 0 ? (
                                                      priceTotalOfRateplan &&
                                                      localizedRateSelection?.[rateplan.room_code]?.includes(
                                                        rateplan.rate_code,
                                                      ) &&
                                                      dates[offset + i].toISOString().substr(0, 10) >=
                                                        selectedData?.period?.arrival &&
                                                      dates[offset + i].toISOString().substr(0, 10) <
                                                        selectedData?.period?.departure ? (
                                                        <ActiveSuccessRectangle />
                                                      ) : (
                                                        <SuccessRectangle />
                                                      )
                                                    ) : (
                                                      <DangerRectangle />
                                                    )}
                                                  </span>
                                                </td>
                                              )
                                            })
                                          ) : (
                                            <td></td>
                                          )}
                                        </tr>
                                      </tbody>
                                    </table>
                                  )}
                                </span>
                                <span style={{ width: '16px' }} className="ml-auto"></span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {!!filteredOffers?.length && (
                        <div className="pl-6 mt-2 text-lg flex items-center gap-2">
                          {receptionLabels.offerLabel[language]}
                          <span>
                            <WrappedBox />
                          </span>
                        </div>
                      )}
                      {filteredOffers?.map((offer) => {
                        const priceTotalOfOffer = restructuredOffers?.[roomCode]?.offers?.[offer.rate_code]
                        return (
                          <div key={offer.rate_code}>
                            <div className="flex my-[1.5px] gap-5">
                              <div
                                className="pl-6 border-r border-dashed border-[#000000]"
                                style={{ width: `${leftRowWidth}px` }}
                              >
                                <div
                                  className="flex py-2 justify-between border-b border-dashed border-[#00000026]"
                                  style={{ width: '90%' }}
                                >
                                  <span
                                    className="flex items-center cursor-pointer select-none"
                                    onClick={
                                      priceTotalOfOffer &&
                                      handleOfferCheckbox(offer.rate_code, offer.title, roomDetails?.code)
                                    }
                                  >
                                    {localizedOfferSelection?.[offer.room_code]?.includes(offer.rate_code) &&
                                    priceTotalOfOffer ? (
                                      <>
                                        <TickSquare className="fill-[#68D0C2] cursor-pointer w-4 h-4 select-none" />
                                      </>
                                    ) : (
                                      <span
                                        className={`w-4 h-4 border-2 border-[#CACACA] rounded-sm select-none ${
                                          !priceTotalOfOffer && 'bg-gray-300'
                                        }`}
                                      />
                                    )}
                                    <span className="pl-2">{offer.title}</span>
                                  </span>
                                  <span className="text-[#00000059]">
                                    {priceTotalOfOffer &&
                                      `${receptionLabels.priceLabel[language]}: ${
                                        language === 'en'
                                          ? priceTotalOfOffer?.toLocaleString('en-US', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })
                                          : priceTotalOfOffer?.toLocaleString('de-DE', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })
                                      } €`}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center" style={{ width: `${rightRowWidth}px` }}>
                                <span style={{ width: '16px' }}></span>
                                <span
                                  className={`py-2 border-b border-dashed border-[#00000026] ${
                                    roomAndAvailability.length === getElementCountByScreenWidth() && 'mx-auto'
                                  }`}
                                >
                                  {!!offer?.availabilities.length && (
                                    <table>
                                      <tbody>
                                        <tr>
                                          {rightRowEleWidth.length ? (
                                            offer?.availabilities?.map((availability, i) => {
                                              return (
                                                <td
                                                  style={{
                                                    width: rightRowEleWidth?.[i],
                                                    maxWidth: rightRowEleWidth?.[i],
                                                  }}
                                                  className="px-[5.5px] py-[1.5px]"
                                                  key={`${offer.rate_code}-${i}`}
                                                >
                                                  <span className="flex justify-center">
                                                    {+availability > 0 ? (
                                                      priceTotalOfOffer &&
                                                      localizedOfferSelection?.[offer.room_code]?.includes(
                                                        offer.rate_code,
                                                      ) &&
                                                      dates[offset + i].toISOString().substr(0, 10) >=
                                                        selectedData?.period?.arrival &&
                                                      dates[offset + i].toISOString().substr(0, 10) <
                                                        selectedData?.period?.departure ? (
                                                        <ActiveSuccessRectangle />
                                                      ) : (
                                                        <SuccessRectangle />
                                                      )
                                                    ) : (
                                                      <DangerRectangle />
                                                    )}
                                                  </span>
                                                </td>
                                              )
                                            })
                                          ) : (
                                            <td></td>
                                          )}
                                        </tr>
                                      </tbody>
                                    </table>
                                  )}
                                </span>
                                <span style={{ width: '16px' }} className="ml-auto"></span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          ) : isNaN(Number(occupancy?.[roomOccupancyIndex]?.adults)) ||
            Number(occupancy?.[roomOccupancyIndex]?.adults) < 1 ? (
            <div
              className={`flex items-center justify-center mt-40 ${
                !show && 'hidden'
              } transition-opacity duration-200 opacity-${opacity}`}
            >
              <h1 className="text-lg font-bold">{receptionLabels.occupancyNotSupportedLabel[language]}</h1>
            </div>
          ) : (
            <div
              className={`flex items-center justify-center mt-40 ${
                !show && 'hidden'
              } transition-opacity duration-200 opacity-${opacity}`}
            >
              <h1 className="text-lg font-bold">{loading.roomsMessage}</h1>
            </div>
          )}
        </>
      )}
    </div>
  )
}
export default memo(RoomsTab)
