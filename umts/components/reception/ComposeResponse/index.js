import React, { Fragment, useState, useEffect } from 'react'
import RoomsTab from '../Tabs/roomsTab'
import InterestsTab from '../Tabs/interestsTab'
import ReplyMessageTab from '../Tabs/replyMessageTab'
import Close from '../../icons/close'
import receptionLabels from '../../../translations/reception.json'
import '@mts-online/library/dist/esm/index.css'
import ErrorBoundary from '../../shared/errorBoundary'
import Calendar from '../../icons/calendar'
import { Calendar as CalendarWidget, ThemeProvider } from '../../componentLibrary'
import ResponseSummary from '../ResponseSummary'
import { getCalendar, getRateplans } from '../useHooks'

const ComposeResponse = ({
  language,
  clientId,
  selectedData,
  setSelectedData,
  requestInPopup,
  maxRoomsPerBooking,
  handleQuickResponse,
  handleSmartResponseTemplate,
  rooms,
  interests,
  offers,
  maxAdults,
  maxChildAge,
  calendarInComposeRequest,
  styletmp,
  responseIndex,
  fetchAvailableOffers,
  handleLanguageChange,
  blockProps,
}) => {
  const [popupLayout, setPopupLayout] = useState('room1')
  const [selectedRange, setSelectedRange] = useState(() => ({
    checkIn:
      selectedData?.period?.arrival &&
      new Date(new Date().toISOString().slice(0, 10)) <= new Date(selectedData.period.arrival)
        ? new Date(selectedData.period.arrival.concat('T00:00:00'))
        : null,
    checkOut:
      selectedData?.period?.departure &&
      new Date(new Date().toISOString().slice(0, 10)) <= new Date(selectedData.period.departure)
        ? new Date(selectedData.period.departure.concat('T00:00:00'))
        : null,
  }))
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarData, setCalendarData] = useState({})
  const [calLoading, setCalLoading] = useState(false)
  const [rateplans, setRateplans] = useState([])
  const [dataLoading, setDataLoading] = useState({
    roomsLoading: false,
    roomsMessage: '',
    offersLoading: false,
    offersMessage: '',
    interestsLoading: false,
    interestsMessage: '',
  })
  const days = receptionLabels.days[language]
  const months = receptionLabels.months[language]

  const handleTabs = (layout) => () => {
    if (
      selectedData?.occupancy?.every((_, idx) => selectedData?.rateCodes?.[idx] || selectedData?.offerCodes?.[idx]) ||
      layout.match(/room/g)
    ) {
      setPopupLayout(layout)
    }
  }

  const nextTab = () => {
    const tabs = [...selectedData?.occupancy?.map((_, idx) => `room${idx + 1}`), 'interests', 'replyMessage']
    const nextTabValue = tabs.indexOf(popupLayout) + 1
    const idx = nextTabValue === tabs.length ? 0 : nextTabValue
    setPopupLayout(tabs[idx])
  }

  const tabTooltip =
    !selectedData?.occupancy?.every((_, idx) => selectedData?.rateCodes?.[idx] || selectedData?.offerCodes?.[idx]) &&
    popupLayout.match(/room/g) ? (
      <div className="absolute bottom-[12px] flex-col items-center hidden mb-6 group-hover:flex w-full">
        <span className="relative z-50 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg w-full rounded-md">
          {receptionLabels.tooltipLabel[language]}
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
      </div>
    ) : (
      <></>
    )

  const handleAddRoom = () => {
    setSelectedData((st) => {
      const tempSelectedData = [...st]
      tempSelectedData[responseIndex].occupancy = [...tempSelectedData[responseIndex].occupancy]
      tempSelectedData[responseIndex].occupancy.push({
        adults: '2',
        children: '0',
        childage: [],
      })
      if (!popupLayout.match(/room/g)) {
        setPopupLayout(`room${tempSelectedData[responseIndex].occupancy.length}`)
      }
      return tempSelectedData
    })
  }

  const handleRemoveRoom = (idx) => (e) => {
    e.stopPropagation()
    setSelectedData((st) => {
      const tempSelectedData = [...st]
      tempSelectedData[responseIndex].occupancy = [...tempSelectedData[responseIndex].occupancy]
      tempSelectedData[responseIndex].occupancy.splice(idx, 1)
      if (popupLayout === `room${tempSelectedData[responseIndex].occupancy.length + 1}`) {
        setPopupLayout(`room${tempSelectedData[responseIndex].occupancy.length}`)
      }
      return tempSelectedData
    })
  }

  const handleSelectedRange = () => {
    if (selectedRange?.checkIn && selectedRange?.checkOut && selectedRange?.checkIn !== selectedRange?.checkOut) {
      const cindd = selectedRange?.checkIn?.getDate()
      const coutdd = selectedRange?.checkOut?.getDate()
      const cinmm = selectedRange?.checkIn?.getMonth()
      const coutmm = selectedRange?.checkOut?.getMonth()
      const cinyy = selectedRange?.checkIn?.getFullYear()
      const coutyy = selectedRange?.checkOut?.getFullYear()
      const cin = new Date(Date.UTC(cinyy, cinmm, cindd, 0, 0, 0, 0, 0))
      const cout = new Date(Date.UTC(coutyy, coutmm, coutdd, 0, 0, 0, 0, 0))
      setSelectedData((st) => {
        const tempSelectedData = [...st]
        tempSelectedData[responseIndex] = {
          ...tempSelectedData[responseIndex],
          period: { arrival: cin?.toISOString()?.substr(0, 10), departure: cout?.toISOString()?.substr(0, 10) },
        }
        return tempSelectedData
      })
      setPopupLayout('room1')
    }
  }

  useEffect(() => {
    getCalendar({
      occupancy: selectedData.occupancy,
      language,
      setCalLoading,
      clientId,
      setCalendarData,
    })
    getRateplans({
      occupancy: selectedData.occupancy,
      language,
      clientId,
      setRateplans,
      setDataLoading,
    })
    if (selectedRange.checkIn && selectedRange.checkOut) {
      fetchAvailableOffers(responseIndex, setDataLoading)
    }
  }, [selectedData.period, selectedData.occupancy])

  useEffect(() => {
    if (requestInPopup?.language) {
      handleLanguageChange(responseIndex)
    }
  }, [requestInPopup?.language])

  return (
    <>
      {!calendarInComposeRequest && (
        <ResponseSummary
          language={language}
          selectedData={selectedData}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          styletmp={styletmp}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
          calendarData={calendarData}
          calLoading={calLoading}
          handleSelectedRange={handleSelectedRange}
          setPopupLayout={setPopupLayout}
        />
      )}
      <div className="flex justify-between">
        <div className="flex flex-row gap-4">
          <div>
            <button
              type="button"
              className={`text-sm text-white py-1.5 px-3 rounded-lg ${
                selectedData?.occupancy?.length === maxRoomsPerBooking
                  ? 'bg-[#cccccc] font-medium cursor-not-allowed'
                  : 'bg-primary-400 hover:font-medium'
              }`}
              onClick={handleAddRoom}
              disabled={selectedData?.occupancy?.length === maxRoomsPerBooking}
            >
              {receptionLabels.addRoomButtonLabel[language]}
            </button>
          </div>
          {calendarInComposeRequest ? (
            <div className="flex items-center">
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                          <style>
                            #__MTS span.MTS__text-\\[10px\\].MTS__leading-\\[initial\\].md\\:MTS__text-xs {
                              display: none;
                            }
                          </style>
                        `,
                }}
              ></div>
              <ErrorBoundary>
                <div className="flex flex-col flex-auto gap-3">
                  <div
                    className="text-sm flex justify-between cursor-pointer"
                    onClick={(event) => {
                      event.stopPropagation()
                      setShowCalendar(true)
                    }}
                  >
                    <Calendar className="fill-[#9F9687] shake" />
                  </div>
                  <div
                    className={`reception-price-calculator absolute left-[50%] top-[50%] z-50 w-[350px] shadow-lg border border-[#00000050] ${
                      showCalendar ? 'visible' : 'invisible'
                    }`}
                    style={{ ...styletmp, transform: 'translate(-50%,-50%)' }}
                  >
                    {showCalendar && (
                      <div
                        id="__MTS"
                        data-mts-view="pricecalculator-mts"
                        data-mts-language="de"
                        data-mts-user="u1045"
                        data-mts-id="0"
                        data-mts-version="1"
                      >
                        <ThemeProvider>
                          <CalendarWidget
                            loading={calLoading}
                            options={{
                              showMonths: 1,
                              lang: language,
                              dateSelected: {
                                checkin: selectedRange?.checkIn?.getTime(),
                                checkout: selectedRange?.checkOut?.getTime(),
                              },
                              isRangeSelection: true,
                              restrictRangeHover: false,
                              priceRestrict: false,
                              backSelectRestrict: true,
                              onlyRangeSelection: true,
                              days:
                                typeof days === 'string'
                                  ? (() => {
                                      const calendarDaysLabel = [...days.split(',')]
                                      calendarDaysLabel.push(calendarDaysLabel.shift())
                                      return calendarDaysLabel
                                    })()
                                  : [],
                              months: typeof months === 'string' ? months.split(',') : [],
                              bookRange: calendarData?.days?.split('|') || [],
                              priceRange: '1'.repeat(365).split('').join('|'),
                              closedto: calendarData?.closedto,
                              maxRange: calendarData?.maxstay?.split('|'),
                              blacklistedStays: calendarData?.blacklistedStays,
                              currencyCode: '',
                            }}
                            labels={{
                              minStay: 'Min.',
                              noArrival: 'No arrival',
                              nights: 'Nights',
                              night: 'Night',
                              closeForDept: 'Closed for departure',
                              closeForArrDept: 'Closed for arrival & departure',
                              closeForGap: 'Not available',
                            }}
                            setSelectedRange={setSelectedRange}
                          />
                        </ThemeProvider>
                      </div>
                    )}
                    <div className="py-2 bg-white flex justify-center">
                      <button
                        type="button"
                        className={`text-sm text-white py-1.5 px-3 rounded-lg bg-primary-400 hover:font-medium`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectedRange()
                          setShowCalendar(false)
                        }}
                      >
                        {receptionLabels.calendarCloseButtonLabel[language]}
                      </button>
                    </div>
                  </div>
                </div>
              </ErrorBoundary>
            </div>
          ) : (
            <></>
          )}
          {selectedData?.occupancy?.map((_, idx) => (
            <div
              className="p-1.5 px-8 rounded-t-md cursor-pointer z-10 relative"
              style={{
                borderRight: '1px solid #796b5f66',
                borderLeft: '1px solid #796b5f66',
                borderTop: `${popupLayout === `room${idx + 1}` ? '5px solid #63D0C2' : '1px solid #796b5f66'}`,
                borderBottom: `3px solid ${popupLayout === `room${idx + 1}` ? 'white' : 'transparent'}`,
                ...(popupLayout === `room${idx + 1}` && { paddingTop: '2px' }),
                height: '37px',
              }}
              onClick={handleTabs(`room${idx + 1}`)}
              key={idx}
            >
              {receptionLabels.roomLabel[language]}
              {selectedData?.occupancy?.length > 1 ? <i>#{idx + 1}</i> : <></>}
              {selectedData.occupancy.length > 1 && (
                <div
                  onClick={handleRemoveRoom(idx)}
                  className={`cursor-pointer p-0.5 w-5 h-5 bg-[#000000E6] absolute ${
                    popupLayout === `room${idx + 1}` ? '-top-3' : '-top-2'
                  } -right-2.5 text-white font-bold rounded-full text-center`}
                >
                  <Close className="fill-white" />
                </div>
              )}
            </div>
          ))}

          <div
            className={`p-1.5 px-8 rounded-t-md z-10 ${
              !selectedData?.occupancy?.every(
                (_, idx) => selectedData?.rateCodes?.[idx] || selectedData?.offerCodes?.[idx],
              )
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer'
            } group relative flex justify-center`}
            style={{
              borderRight: '1px solid #796b5f66',
              borderLeft: '1px solid #796b5f66',
              borderTop: `${popupLayout === 'interests' ? '5px solid #63D0C2' : '1px solid #796b5f66'}`,
              borderBottom: `3px solid ${popupLayout === 'interests' ? 'white' : 'transparent'}`,
              ...(popupLayout === 'interests' && { paddingTop: '2px' }),
              height: '37px',
            }}
            onClick={handleTabs('interests')}
          >
            {receptionLabels.interestLabel[language]}
            {tabTooltip}
          </div>
          {!blockProps?.landingPage?.landingPageStatus && (
            <div
              className={`p-1.5 px-8 rounded-t-md z-10 ${
                !selectedData?.occupancy?.every(
                  (_, idx) => selectedData?.rateCodes?.[idx] || selectedData?.offerCodes?.[idx],
                )
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer'
              } group relative flex justify-center`}
              style={{
                borderRight: '1px solid #796b5f66',
                borderLeft: '1px solid #796b5f66',
                borderTop: `${popupLayout === 'replyMessage' ? '5px solid #63D0C2' : '1px solid #796b5f66'}`,
                borderBottom: `3px solid ${popupLayout === 'replyMessage' ? 'white' : 'transparent'}`,
                ...(popupLayout === 'replyMessage' && { paddingTop: '2px' }),
                height: '37px',
              }}
              onClick={handleTabs('replyMessage')}
            >
              {receptionLabels.replyMessageLabel[language]}
              {tabTooltip}
            </div>
          )}
        </div>
      </div>

      <div
        className="w-full grow shrink basis-auto h-0 custom-scrollbar-2 py-2 rounded-md overflow-y-auto mb-3 transition-all"
        style={{
          borderWidth: '0.5px',
          marginTop: '-2px',
          border: '1px solid #796b5f66',
        }}
      >
        {selectedData?.occupancy?.map((_, idx) => {
          const roomCodes = rateplans?.[idx]?.rates?.map((item) => item.roomCode)
          const roomsWithRateplans = rooms?.filter((room) => roomCodes?.includes(room.code)) || []
          const assortedOffers = offers?.[idx]?.filter((offer) => {
            const offerRoomQuantity = offer?.rates?.[0]?.quantity
            if (
              selectedData?.rateCodes?.[idx]?.[offer.code] ||
              selectedData?.offerCodes?.[idx]?.[offer.code] ||
              selectedData?.roomTitles?.[offer.code]?.count < offerRoomQuantity ||
              selectedData?.offerTitles?.[offer.code]?.count < offerRoomQuantity ||
              (!selectedData?.roomTitles?.[offer.code] && !selectedData?.offerTitles?.[offer.code])
            ) {
              return true
            }
            return false
          })
          if (popupLayout === `room${idx + 1}`) {
            return (
              <Fragment key={`room${idx + 1}`}>
                <RoomsTab
                  show={popupLayout === `room${idx + 1}`}
                  loading={dataLoading}
                  maxAdults={maxAdults}
                  maxChildAge={maxChildAge}
                  rooms={roomsWithRateplans}
                  rateplans={rateplans[idx]}
                  offers={assortedOffers || []}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                  language={language}
                  roomOccupancyIndex={idx}
                  setShowCalendar={setShowCalendar}
                  responseIndex={responseIndex}
                />
              </Fragment>
            )
          } else {
            return <Fragment key={`room${idx + 1}`}></Fragment>
          }
        })}

        {popupLayout === 'interests' && (
          <InterestsTab
            show={popupLayout === 'interests'}
            loading={dataLoading}
            interests={interests}
            selectedData={selectedData}
            setSelectedData={setSelectedData}
            responseIndex={responseIndex}
          />
        )}

        {popupLayout === 'replyMessage' && !blockProps?.landingPage?.landingPageStatus && (
          <ReplyMessageTab
            show={popupLayout === 'replyMessage'}
            selectedData={selectedData}
            setSelectedData={setSelectedData}
            language={language}
            languageRequested={requestInPopup?.language}
            responseIndex={responseIndex}
          />
        )}
      </div>

      {!blockProps?.landingPage?.landingPageStatus && (
        <div className="flex justify-center mb-3">
          <button
            type="button"
            className={`text-sm text-white py-1.5 px-3 rounded-lg mr-2 ${
              selectedData?.rateCodes?.filter(Boolean)?.length ||
              selectedData?.offerCodes?.filter(Boolean)?.length ||
              requestInPopup?.quick_response === false
                ? 'bg-[#cccccc] font-medium cursor-not-allowed'
                : 'bg-primary-400 hover:font-medium'
            }`}
            onClick={handleQuickResponse}
            disabled={
              selectedData?.rateCodes?.filter(Boolean)?.length ||
              selectedData?.offerCodes?.filter(Boolean)?.length ||
              requestInPopup?.quick_response === false
            }
          >
            {receptionLabels.quickResponseLabel[language]}
          </button>

          {popupLayout !== 'replyMessage' && <button
            onClick={nextTab}
            type="button"
            disabled={
              popupLayout === `room${selectedData?.occupancy?.length}` &&
              !selectedData?.occupancy?.every(
                (_, idx) => selectedData?.rateCodes?.[idx] || selectedData?.offerCodes?.[idx],
              )
            }
            className={`text-sm text-white py-2 px-5 rounded-lg mr-2 ${
              popupLayout !== `room${selectedData?.occupancy?.length}` ||
              selectedData?.occupancy?.every(
                (_, idx) => selectedData?.rateCodes?.[idx] || selectedData?.offerCodes?.[idx],
              )
                ? 'bg-primary-400  hover:font-bold'
                : 'bg-[#cccccc] font-medium cursor-not-allowed'
            }`}
          >
            {receptionLabels.nextLabel[language]}
          </button>}

          <button
            onClick={handleSmartResponseTemplate('preview')}
            type="button"
            disabled={
              !selectedData?.occupancy?.every(
                (_, idx) => selectedData?.rateCodes?.[idx] || selectedData?.offerCodes?.[idx],
              )
            }
            className={`text-sm text-white py-2 px-5 rounded-lg ${
              selectedData?.occupancy?.every(
                (_, idx) => selectedData?.rateCodes?.[idx] || selectedData?.offerCodes?.[idx],
              )
                ? 'bg-primary-400  hover:font-bold'
                : 'bg-[#cccccc] font-medium cursor-not-allowed'
            }`}
          >
            {receptionLabels.previewLabel[language]}
          </button>
        </div>
      )}
    </>
  )
}

export default ComposeResponse
