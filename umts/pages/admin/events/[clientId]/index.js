import React, { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import Authenticate from '../../../../lib/authenticate'
import { AppContext } from '../../../../context/appContext'
import { useUser, useIsMounted } from '../../../../lib/hooks'
import GridMaster from '../../../../components/layout/gridMaster'
import translations from '../../../../translations/events.json'
import PopUp from '../../../../components/dialog/popUp'
import EditEvent from '../../../../components/editEvent'
import Button from '../../../../components/common/Button'
import useConfirm from '../../../../components/dialog/useConfirm'

const Events = () => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState({})
  const router = useRouter()
  const { clientId } = router.query
  const isMounted = useIsMounted()
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
  const [labels, setLabels] = useState({})
  const [isSearching, setIsSearching] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [language, setLanguage] = useState('de')
  const { isConfirmed } = useConfirm()
  const getTranslation = (translations, language) => {
    const translationObj = {}
    for (const translation in translations) {
      translationObj[translation] = translations[translation][language] || translation
    }
    return translationObj
  }
  useEffect(() => {
    const translation = getTranslation({ ...translations }, language)
    setLabels(translation)
  }, [language])
  const getCheckoutData = async () => {
    setLoading(true)
    const sortQuery = JSON.stringify(sort)
    let res = fetch(
      `/api/events/${clientId}?req_offSet=${gridInfo.perPage * (gridInfo.currentPage - 1)}&req_limit=${
        gridInfo.perPage
      }&req_search=${gridInfo.searchText}&req_sort=${sortQuery}`,
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
        console.log('result', result)
        if (result?.events?.data) {
          setEvents(result?.events?.data)
          setGridInfo((state) => ({
            ...state,
            // currentPage: result?.checkouts?.data?.length > 0 ? state.currentPage : 1,
            ['length']: result?.events?.length?.total,
          }))
          setLoading(false)
        }
      })
  }
  const handleSort = (type) => () => {
    switch (type) {
      case 'eventName':
        if (sort.eventName === 1) {
          setSort({ eventName: -1 })
        } else {
          setSort({ eventName: 1 })
        }
        break
      case 'createdAt':
        if (sort.createdAt === 1) {
          setSort({ createdAt: -1 })
        } else {
          setSort({ createdAt: 1 })
        }
        break
      case 'eventType':
        if (sort.eventType === 1) {
          setSort({ eventType: -1 })
        } else {
          setSort({ eventType: 1 })
        }
        break

      default:
        setSort({})
        break
    }
  }
  const handleOpen = () => {
    setShowPopup(true)
  }

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'events',
    }))
  }, [])
  useEffect(() => {
    getCheckoutData()
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort, sort])
  return (
    <div className="my-6 mt-24">
      <GridMaster
        headerText={
          <div className="flex flex-wrap gap-4">
            <div>{labels?.events}</div>
          </div>
        }
        onSort={() => {
          setGridInfo((prevState) => ({
            ...prevState,
            sort: {
              ...prevState.sort,
              createdAt: !prevState.sort?.createdAt,
            },
          }))
        }}
        setGridInfo={setGridInfo}
        gridInfo={gridInfo}
        length={events?.length}
        setIsSearching={setIsSearching}
        passedData={events || []}
        showNewButton={true}
        showLanguageButton={true}
        rowsPerPage={labels.rowsPerPage}
        handleOpen={handleOpen}
        newButtonText={labels?.addNewEvent}
        language={language}
        languageHandler={(e)=>{setLanguage(e.target.value)}}
      >
        {events.length > 0 ? (
          <div className="w-full overflow-x-auto bg-white">
            <table className="relative rounded-lg" width="100%">
              <thead>
                <tr className="font-normal text-left">
                  {/* <td className="py-4 pl-4">
                    <span className="flex text-base">
                      {labels?.eventId}
                    </span>
                  </td> */}
                  <td className="py-4 pl-4">
                    <span className="flex text-base">
                      {labels?.eventName}
                      <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort?.eventName === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="Products"
                        onClick={handleSort('eventName')}
                      />
                    </span>
                  </td>
                  <td className="py-4 pl-4">
                    <span className="flex text-base">
                      {labels?.createdAt}
                      <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort?.createdAt === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="Products"
                        onClick={handleSort('createdAt')}
                      />
                    </span>
                  </td>
                  <td className="py-4 pl-4">
                    <span className="flex text-base">
                      {labels?.eventType}
                      <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort?.eventType === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="Products"
                        onClick={handleSort('eventType')}
                      />
                    </span>
                  </td>
                  <td className="py-4 pl-4">
                    <span className="text-base">{labels?.editEvent}</span>
                  </td>
                  <td className="py-4 pl-4">
                    <span className="flex text-base">
                      {labels?.details}
                      <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort?.viewDetails === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="Products"
                        onClick={handleSort('viewDetails')}
                      />
                    </span>
                  </td>
                </tr>
              </thead>
              <caption
                className="absolute mx-4 border-b border-black border-dashed border-bottom"
                style={{ width: 'calc(100% - 30px)' }}
              />
              <tbody>
                {events.map((event, i) => {
                  return (
                    <tr key={'event' + i} className={`rounded-lg  ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      {/* <td className="py-4 pl-4 text-sm text-left">{event?.eventId}</td> */}
                      <td className="py-4 pl-4 text-sm text-left">{event.eventName}</td>
                      <td className="py-4 pl-4 text-sm text-left">{new Date(event.createdAt).toLocaleString()}</td>
                      <td className="py-4 pl-4 text-sm text-left">{event?.eventType}</td>
                      <td className="py-4 pl-4 text-sm text-left">
                        <button
                          className="bg-white border border-primary-400 hover:text-primary-500 hover:border- px-4 py-1 rounded-lg flex items-center justify-between mr-5 w-32"
                          type="button"
                          id=""
                          title=""
                          onClick={()=>{
                            setSelectedEvent(event);
                            handleOpen();
                          }}
                        >
                          {labels?.editEvent}
                          <img class="inline-block ml-2" src="/images/edituser.svg" alt="Products" />
                        </button>
                      </td>

                      <td className="py-4 pl-4 text-sm text-left">
                        <Button
                          onClick={() => {
                            //   setOpenModal(true)
                            //   setSelectedCheckout({
                            //     ...checkout,
                            //     emailTemplate: Object.values(checkout?.htmlEmails || {})?.[0] || '',
                            //   })
                            router.push(
                              `/admin/events/${clientId}/${event?.eventType === 'concert' ? 'concert' : ''}/${
                                event?.eventName
                              }`,
                            )
                          }}
                          variant="primary"
                        >
                          {labels?.viewDetails}
                        </Button>
                      </td>
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
            {!contextData.isLoading && <div>{labels?.noRecordsFound}</div>}
          </div>
        )}
        {showPopup && (
          <PopUp openModal={showPopup}>
            <EditEvent
              setLoading={setLoading}
              event={selectedEvent}
              handleClose={() => {
                setShowPopup(false)
                setSelectedEvent({});
              }}
              isConfirmed={isConfirmed}
              labels={labels}
              clientId={clientId}
            />
          </PopUp>
        )}
      </GridMaster>
    </div>
  )
}
export default Events

export async function getServerSideProps(context) {
  return Authenticate(context)
}
