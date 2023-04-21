import React from 'react'
import '@mts-online/library/dist/esm/index.css'
import ErrorBoundary from '../../shared/errorBoundary'
import Calendar from '../../icons/calendar'
import { Calendar as CalendarWidget, ThemeProvider } from '../../componentLibrary'
import receptionLabels from '../../../translations/reception.json'

const ResponseSummary = ({
  language,
  selectedData,
  showCalendar,
  setShowCalendar,
  styletmp,
  selectedRange,
  setSelectedRange,
  calendarData,
  calLoading,
  handleSelectedRange,
  setPopupLayout,
}) => {
  const days = receptionLabels.days[language]
  const months = receptionLabels.months[language]
  return (
    <>
      <div className="px-4 py-2 mb-3" style={{ background: '#68d0c266', borderRadius: '6px' }}>
        <div className="flex">
          {selectedData?.period && (
            <span className="flex gap-3">
              <p>
                {receptionLabels.periodLabel[language]}:{' '}
                {selectedData?.period?.arrival?.split('-')?.reverse().join('.')} -{' '}
                {selectedData?.period?.departure?.split('-')?.reverse().join('.')} (
                {days.split(',')[new Date(selectedData?.period?.arrival).getDay()]?.toUpperCase()} -{' '}
                {days.split(',')[new Date(selectedData?.period?.departure).getDay()]?.toUpperCase()}){' '}
              </p>
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
                  <div className="flex flex-col flex-auto gap-3 select-none">
                    <div
                      className="text-sm flex justify-between cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation()
                        if (
                          selectedData.occupancy.some((o, index) => {
                            if (!o.adults || isNaN(Number(o.adults)) || Number(o.adults) < 1) {
                              setPopupLayout(`room${index + 1}`)
                              return true
                            }
                            return false
                          })
                        ) {
                          return
                        }
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
            </span>
          )}
          <span className="mx-8" style={{ border: '1px solid rgba(0, 0, 0, 0.4)' }}></span>
          <span>
            <p>
              {receptionLabels.stayLabel[language]}:{' '}
              {(new Date(selectedData?.period?.departure).getTime() -
                new Date(selectedData?.period?.arrival).getTime()) /
                86400000}{' '}
              {receptionLabels.nightsLabel[language]}
            </p>
          </span>
          <span className="mx-8" style={{ border: '1px solid rgba(0, 0, 0, 0.4)' }}></span>
          <span>
            <p>
              {selectedData?.roomTitles && (Object.keys(selectedData?.roomTitles)?.length || '')}{' '}
              {receptionLabels.roomLabel[language]}:{' '}
              {selectedData?.roomTitles &&
                Object.values(selectedData?.roomTitles)
                  .map((t) => `${t.title} x ${t.count}`)
                  .join(', ')}
            </p>
          </span>
          <span className="mx-8" style={{ border: '1px solid rgba(0, 0, 0, 0.4)' }}></span>
          <span>
            <p>
              {selectedData?.offerTitles && (Object.keys(selectedData?.offerTitles)?.length || '')}{' '}
              {receptionLabels.offerLabel[language]}:{' '}
              {selectedData?.offerTitles &&
                Object.values(selectedData?.offerTitles)
                  .map((t) => `${t.title} x ${t.count}`)
                  .join(', ')}
            </p>
          </span>
        </div>
      </div>
    </>
  )
}

export default ResponseSummary
