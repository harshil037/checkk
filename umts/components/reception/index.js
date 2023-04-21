import React, { Fragment, useState } from 'react'
import receptionLabels from '../../translations/reception.json'
import ComposeRequest from './ComposeRequest'
import ComposeResponse from './ComposeResponse'
import MessageTab from './Tabs/messageTab'
import ShowRequest from './ShowRequest'
import Close from '../icons/close'
import { deepClone } from '../../lib/object'

const reception = ({
  language,
  clientId,
  requestInPopup,
  setRequestInPopup,
  setShowModal,
  selectedData,
  setSelectedData,
  styletmp,
  maxRoomsPerBooking,
  handleQuickResponse,
  handleSmartResponseTemplate,
  rooms,
  interests,
  offers,
  setOffers,
  maxAdults,
  maxChildAge,
  isValid,
  setIsValid,
  enquiryPopup,
  fetchAvailableOffers,
  handleLanguageChange,
  popupLoading,
  blockProps,
}) => {
  const [responseTab, setResponseTab] = useState('response1')

  const handleResponseTabs = (response) => () => {
    setResponseTab(response)
  }

  const handleAddAdditionalResponse = () => {
    const tempSelectedData = [...selectedData]
    tempSelectedData.push({
      period: deepClone(tempSelectedData[tempSelectedData.length - 1].period),
      occupancy: deepClone(tempSelectedData[tempSelectedData.length - 1].occupancy),
      replyMessage: tempSelectedData[tempSelectedData.length - 1].replyMessage,
      landingPageMessage: tempSelectedData[tempSelectedData.length - 1].landingPageMessage,
    })
    setSelectedData(tempSelectedData)
  }

  const handleRemoveAdditionalResponse = (idx) => (e) => {
    e.stopPropagation()
    const tempSelectedData = [...selectedData]
    tempSelectedData.splice(idx, 1)
    setSelectedData(tempSelectedData)
    setOffers((st) => {
      const tempOffers = { ...st }
      delete tempOffers[`response${idx + 1}`]
      return tempOffers
    })
    if (responseTab === `response${tempSelectedData.length + 1}`) {
      setResponseTab(`response${tempSelectedData.length}`)
    }
  }

  return (
    <div style={{ height: '100vh' }}>
      <div
        className="w-11/12 pt-1 px-6 mx-auto my-auto mt-32 overflow-hidden bg-white border border-gray-300 rounded-lg md:mt-6 text-left flex flex-col"
        style={{ color: '#000000a6', height: '95%' }}
      >
        <div className="flex items-center justify-end gap-2">
          <svg
            onClick={() => {
              setShowModal(false)
              setRequestInPopup({})
              setSelectedData([{}])
              setIsValid({
                salutation: true,
                firstname: true,
                lastname: true,
                email: true,
              })
            }}
            className="w-6 h-6 cursor-pointer fill-current"
            role="button"
            viewBox="0 0 20 20"
          >
            <path
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
        {popupLoading ? (
          <>
            <div className={`flex items-center justify-center h-full transition-opacity duration-200`}>
              <div className="inline-block w-8 h-8 border-4 rounded-full spinner-border animate-spin">
                <span className="visually-hidden"></span>
              </div>
            </div>
          </>
        ) : (
          <>
            {!enquiryPopup && <ShowRequest language={language} requestInPopup={requestInPopup} />}

            {blockProps?.landingPage?.landingPageStatus && (
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <div>
                    <button
                      type="button"
                      className={`text-sm text-white py-1.5 px-3 rounded-lg bg-primary-400 hover:font-medium`}
                      onClick={handleAddAdditionalResponse}
                    >
                      {receptionLabels.addResponseButtonLabel[language]}
                    </button>
                  </div>

                  {selectedData.map((_, idx) => (
                    <div
                      key={idx}
                      className={`p-1.5 px-8 rounded-t-md z-10 relative flex justify-center cursor-pointer`}
                      style={{
                        borderRight: '1px solid #796b5f66',
                        borderLeft: '1px solid #796b5f66',
                        borderTop: `${
                          responseTab === `response${idx + 1}` ? '5px solid #63D0C2' : '1px solid #796b5f66'
                        }`,
                        borderBottom: `3px solid ${responseTab === `response${idx + 1}` ? 'white' : 'transparent'}`,
                        ...(responseTab === `response${idx + 1}` && { paddingTop: '2px' }),
                        height: '37px',
                      }}
                      onClick={handleResponseTabs(`response${idx + 1}`)}
                    >
                      {receptionLabels.responseTabLabel[language]} <i>#{idx + 1}</i>
                      {idx > 0 && (
                        <div
                          onClick={handleRemoveAdditionalResponse(idx)}
                          className={`cursor-pointer p-0.5 w-5 h-5 bg-[#000000E6] absolute ${
                            responseTab === `response${idx + 1}` ? '-top-3' : '-top-2'
                          } -right-2.5 text-white font-bold rounded-full text-center`}
                        >
                          <Close className="fill-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  <div
                    className={`p-1.5 px-8 rounded-t-md z-10 cursor-pointer relative flex justify-center`}
                    style={{
                      borderRight: '1px solid #796b5f66',
                      borderLeft: '1px solid #796b5f66',
                      borderTop: `${responseTab === 'message' ? '5px solid #63D0C2' : '1px solid #796b5f66'}`,
                      borderBottom: `3px solid ${responseTab === 'message' ? 'white' : 'transparent'}`,
                      ...(responseTab === 'message' && { paddingTop: '2px' }),
                      height: '37px',
                    }}
                    onClick={handleResponseTabs('message')}
                  >
                    {receptionLabels.messageTabLabel[language]}
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    className={`text-sm text-white py-1.5 px-3 rounded-lg bg-primary-400 hover:font-medium`}
                    onClick={() => {
                      if (blockProps?.landingPage?.landingPageStatus) {
                        const url = `${blockProps?.landingPage?.landingPageURL}/?request=${requestInPopup.id}`
                        window.open(url, '_blank')
                      }
                    }}
                  >
                    {receptionLabels.landingPageRedirectButtonLabel[language]}
                  </button>
                </div>
              </div>
            )}

            <div
              className={`w-full flex flex-col ${
                blockProps?.landingPage?.landingPageStatus ? 'p-2' : ''
              } rounded-md grow shrink basis-auto`}
              style={
                blockProps?.landingPage?.landingPageStatus
                  ? {
                      borderWidth: '0.5px',
                      marginTop: '-2px',
                      border: '1px solid #796b5f66',
                    }
                  : {}
              }
            >
              {selectedData.map((_, idx) => {
                if (`response${idx + 1}` === responseTab) {
                  return (
                    <Fragment key={idx}>
                      {enquiryPopup && (
                        <ComposeRequest
                          requestInPopup={requestInPopup}
                          setRequestInPopup={setRequestInPopup}
                          language={language}
                          selectedData={selectedData[idx]}
                          isValid={isValid}
                          setIsValid={setIsValid}
                        />
                      )}

                      <ComposeResponse
                        language={language}
                        clientId={clientId}
                        selectedData={selectedData[idx]}
                        setSelectedData={setSelectedData}
                        requestInPopup={requestInPopup}
                        maxRoomsPerBooking={maxRoomsPerBooking}
                        handleQuickResponse={handleQuickResponse}
                        handleSmartResponseTemplate={handleSmartResponseTemplate}
                        rooms={rooms}
                        interests={interests}
                        offers={offers[`response${idx + 1}`]}
                        maxAdults={maxAdults}
                        maxChildAge={maxChildAge}
                        calendarInComposeRequest={enquiryPopup}
                        styletmp={styletmp}
                        responseIndex={idx}
                        fetchAvailableOffers={fetchAvailableOffers}
                        handleLanguageChange={handleLanguageChange}
                        blockProps={blockProps}
                      />
                    </Fragment>
                  )
                } else {
                  return <Fragment key={idx}></Fragment>
                }
              })}

              {responseTab === 'message' && (
                <MessageTab
                  show={responseTab === 'message'}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                  language={language}
                  languageRequested={requestInPopup?.language}
                />
              )}
            </div>
          </>
        )}

        {blockProps?.landingPage?.landingPageStatus && (
          <div className="flex justify-center my-3">
            {selectedData.length <= 1 && (
              <button
                type="button"
                className={`text-sm text-white py-1.5 px-3 rounded-lg ml-2 ${
                  selectedData?.some(
                    (d) => d?.rateCodes?.filter(Boolean)?.length || d?.offerCodes?.filter(Boolean)?.length,
                  ) || requestInPopup?.quick_response === false
                    ? 'bg-[#cccccc] font-medium cursor-not-allowed'
                    : 'bg-primary-400 hover:font-medium'
                }`}
                onClick={handleQuickResponse}
                disabled={
                  selectedData?.some(
                    (d) => d?.rateCodes?.filter(Boolean)?.length || d?.offerCodes?.filter(Boolean)?.length,
                  ) || requestInPopup?.quick_response === false
                }
              >
                {receptionLabels.quickResponseLabel[language]}
              </button>
            )}
            <button
              onClick={handleSmartResponseTemplate('preview')}
              type="button"
              disabled={
                !selectedData.every((d) => d.occupancy.every((_, idx) => d?.rateCodes?.[idx] || d?.offerCodes?.[idx]))
              }
              className={`text-sm text-white py-1.5 px-3 rounded-lg hover:font-medium ${
                selectedData.length <= 1 && 'ml-2'
              } ${
                selectedData.every((d) => d.occupancy.every((_, idx) => d?.rateCodes?.[idx] || d?.offerCodes?.[idx]))
                  ? 'bg-primary-400 hover:font-medium'
                  : 'bg-[#cccccc] font-medium cursor-not-allowed'
              }`}
            >
              {receptionLabels.previewLabel[language]}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default reception
