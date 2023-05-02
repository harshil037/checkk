import React from 'react'
import receptionLabels from '../../../translations/reception.json'

const ShowRequest = ({ language, requestInPopup }) => {
  const days = receptionLabels.days[language]
  return (
    <>
      <div className="mb-3 px-4 py-3" style={{ border: '1px solid #796b5f66', borderRadius: '6px' }}>
        <p className="mb-1">{receptionLabels.enquirySummaryLabel[language]}:</p>
        <div className="border-0 border-t-2 border-[#796b5f66] mb-1 w-60"></div>
        <div className="grid grid-cols-6 gap-2 xl:flex xl:flex-wrap">
          <span>
            <p>
              {receptionLabels.periodLabel[language]}:{' '}
              {(requestInPopup?.period?.[0]?.arrival?.split('-')?.reverse().join('.') || '') +
                ' - ' +
                (requestInPopup?.period?.[0]?.departure?.split('-')?.reverse().join('.') || '')}{' '}
              {requestInPopup?.period?.[0]?.arrival &&
                `(${days.split(',')[new Date(requestInPopup?.period?.[0]?.arrival).getDay()]?.toUpperCase()} - ${days
                  .split(',')
                  [new Date(requestInPopup?.period?.[0]?.departure).getDay()]?.toUpperCase()})`}
            </p>
            <p>
              <i className="text-[#00000059]">
                {receptionLabels.alternativeLabel[language]}:{' '}
                {(requestInPopup?.period?.[1]?.arrival?.split('-')?.reverse().join('.') || '') +
                  ' - ' +
                  (requestInPopup?.period?.[1]?.departure?.split('-')?.reverse().join('.') || '')}{' '}
                {requestInPopup?.period?.[1]?.arrival &&
                  `(${days.split(',')[new Date(requestInPopup?.period?.[1]?.arrival).getDay()]?.toUpperCase()} - ${days
                    .split(',')
                    [new Date(requestInPopup?.period?.[1]?.departure).getDay()]?.toUpperCase()})`}
              </i>
            </p>
          </span>
          <span className="border-0 border-r-2 border-[#796b5f66] xl:mx-4 2xl:mx-8"></span>
          <span>
            <p>
              {receptionLabels.guestsLabel[language]}:{' '}
              {requestInPopup?.adults && `${receptionLabels.adultsLabel[language]} (${requestInPopup?.adults})`}
              {!!requestInPopup?.children &&
                `, ${receptionLabels.childrenLabel[language]} (${requestInPopup?.children}), ${
                  receptionLabels.ageLabel[language]
                } (${requestInPopup?.childage
                  .split(', ')
                  .map((e) => e + ` ${receptionLabels.yearsLabel[language]}`)
                  .join(', ')})`}
            </p>
          </span>
          <span className="border-0 border-r-2 border-[#796b5f66] xl:mx-4 2xl:mx-8"></span>
          <span>
            <p>
              {receptionLabels.offerLabel[language]}: {requestInPopup?.offer?.title || '-'}
            </p>
          </span>
          <span className="border-0 border-r-2 border-[#796b5f66] xl:mx-4 2xl:mx-8 invisible xl:visible"></span>
          <span>
            <p>
              {receptionLabels.stayLabel[language]}:{' '}
              {requestInPopup?.period?.[0]?.nights
                ? `${requestInPopup?.period?.[0]?.nights} ${receptionLabels.nightsLabel[language]}`
                : '-'}
            </p>
            <p>
              <i className="text-[#00000059]">
                {receptionLabels.stayLabel[language]}:{' '}
                {requestInPopup?.period?.[1]?.nights
                  ? `${requestInPopup?.period?.[1]?.nights} ${receptionLabels.nightsLabel[language]}`
                  : '-'}
              </i>
            </p>
          </span>
          <span className="border-0 border-r-2 border-[#796b5f66] xl:mx-4 2xl:mx-8"></span>
          <span>
            {requestInPopup?.room?.map((room, index) => {
              return (
                <p key={index}>
                  {index + 1} {receptionLabels.roomLabel[language]}: {room.title}
                </p>
              )
            }) || <p>{receptionLabels.roomLabel[language]}: -</p>}
          </span>
          <span className="border-0 border-r-2 border-[#796b5f66] xl:mx-4 2xl:mx-8"></span>
          <span>
            <p>
              {receptionLabels.mealplansLabel[language]}: {requestInPopup?.mealplan?.title || '-'}
            </p>
          </span>
        </div>
        <div className="w-full mt-2">
          <p className="mb-1">{receptionLabels.messageLabel[language]}:</p>
          <div className="border-0 border-t-2 border-[#796b5f66] mb-1 w-20"></div>
          <p>{requestInPopup?.message}</p>
        </div>
      </div>
    </>
  )
}

export default ShowRequest
