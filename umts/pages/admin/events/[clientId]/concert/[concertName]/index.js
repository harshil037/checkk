import React, { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import Authenticate from '../../../../../../lib/authenticate'
import { AppContext } from '../../../../../../context/appContext'
import { useUser, useIsMounted } from '../../../../../../lib/hooks'
import GridMaster from '../../../../../../components/layout/gridMaster'
import translations from '../../../../../../translations/ticket.json'
import PopUp from '../../../../../../components/dialog/popUp'

const ConcertTicket = () => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const [tickets, setTickets] = useState([])
  const router = useRouter()
  const { clientId, concertName } = router.query
  const [ selectedConcert, setSelectedConcert ] = useState('concert1')
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
  const [paymentStatus, setPaymentStatus] = useState('success')
  const [concertData, setConcertData] = useState({})
  const [selectedTicket, setSelectedTicket] = useState({})
  const getTranslation = (translations, language) => {
    const translationObj = {}
    for (const translation in translations) {
      translationObj[translation] = translations[translation][language] || translation
    }
    return translationObj
  }
  const getAvailableTickets = async () => {
    const data = await fetch(`/api/ticketbooking/getavailable/${clientId}/domain/${selectedConcert}`, {
      method: 'POST',
      body: JSON.stringify({paymentMode:"live"}),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const { available, error, total } = await data.json()
    if (concertData && !error) {
     setConcertData((prev)=>({...prev,total:total, ticketsBooked: total-available, available:available, loading:false, soldOut: available ===0}))
    } else if (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    const translation = getTranslation({ ...translations }, language)
    setLabels(translation)
  }, [language])
  const getCheckoutData = async () => {
    setLoading(true)
    const sortQuery = JSON.stringify(sort)
    let res = fetch(
      `/api/events/${clientId}/concert/${selectedConcert}?req_offSet=${
        gridInfo.perPage * (gridInfo.currentPage - 1)
      }&req_limit=${gridInfo.perPage}&req_search=${
        gridInfo.searchText
      }&req_sort=${sortQuery}&req_filter=${paymentStatus}`,
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
        if (result?.confirmedCheckouts?.data) {
          setTickets(result?.confirmedCheckouts?.data)
          setGridInfo((state) => ({
            ...state,
            // currentPage: result?.checkouts?.data?.length > 0 ? state.currentPage : 1,
            ['length']: result?.confirmedCheckouts?.length?.total,
          }))
          setLoading(false)
        }
      })
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
      case 'createdAt':
        if (sort.createdAt === 1) {
          setSort({ createdAt: -1 })
        } else {
          setSort({ createdAt: 1 })
        }
        break
      case 'firstName':
        if (sort.firstName === 1) {
          setSort({ firstName: -1 })
        } else {
          setSort({ firstName: 1 })
        }
        break
      case 'lastName':
        if (sort.lastName === 1) {
          setSort({ lastName: -1 })
        } else {
          setSort({ lastName: 1 })
        }
        break
      case 'paymentStatus':
        if (sort.paymentStatus === 1) {
          setSort({ paymentStatus: -1 })
        } else {
          setSort({ paymentStatus: 1 })
        }
        break
      case 'quantity':
        if (sort.quantity === 1) {
          setSort({ quantity: -1 })
        } else {
          setSort({ quantity: 1 })
        }
        break
      case 'codes':
        if (sort.createdAt === 1) {
          setSort({ createdAt: -1 })
        } else {
          setSort({ createdAt: 1 })
        }
        break
      default:
        setSort({})
        break
    }
  }

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'events',
    }))
  }, [])
  useEffect(()=>{
    getAvailableTickets()
  },[selectedConcert])
  useEffect(() => {
    getCheckoutData()
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort, gridInfo.searchText, sort, paymentStatus, selectedConcert])
  return (
    <>
      <div className="flex flex-wrap gap-2 text-sm text-left justify-end place-items-center mt-5">
        <div className="flex object-right w-full ml-auto bg-white border rounded-lg sm:w-auto">
          <span className="flex flex-wrap gap-2 mx-6 my-2 text-sm text-left place-items-center">
            <label htmlFor="status">{labels.concert} : </label>
            <select
              id="status"
              className="p-1 bg-white border border-green-500 rounded-lg outline-none"
              onChange={(e) => setSelectedConcert(e.target.value)}
              value={selectedConcert}
            >
              <option value="concert1">Concert1</option>
              <option value="concert2">Concert2</option>
              <option value="concert3">Concert3</option>
            </select>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span>{labels?.ticketsBooked} : </span> <span className="text-base border border-green-500 rounded-md px-3">{concertData?.ticketsBooked}/{concertData?.total}</span>
          </div>
          <span className="flex flex-wrap gap-2 mx-6 my-2 text-sm text-left place-items-center">
            <label htmlFor="status">{labels.paymentStatus} : </label>
            <select
              id="status"
              className="p-1 bg-white border border-green-500 rounded-lg outline-none"
              onChange={(e) => setPaymentStatus(e.target.value)}
              value={paymentStatus}
            >
              <option value="">{labels.all}</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </span>
          <div className="flex flex-wrap gap-2 mx-6 my-2 text-sm text-left place-items-center">
            <label htmlFor="language">Language:</label>
            <select
              id="language"
              className="p-1 bg-white border rounded-lg outline-none cursor-pointer border-primary-400"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {['de', 'en', 'it'].map((language) => (
                <option value={language}>{language?.toLocaleUpperCase() || language}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="my-6">
        <GridMaster
          newButtonText=""
          headerText={
            <div className="flex flex-wrap gap-4">
              <div>{labels?.concertTickets}</div>
            </div>
          }
          onSort={() => {
            setGridInfo((prevState) => ({
              ...prevState,
              sort: {
                ...prevState.sort,
                firstName: !prevState.sort?.firstName,
              },
            }))
          }}
          setGridInfo={setGridInfo}
          gridInfo={gridInfo}
          length={tickets?.length}
          setIsSearching={setIsSearching}
          passedData={tickets || []}
          showNewButton={false}
          rowsPerPage={labels.rowsPerPage}
        >
          {tickets.length > 0 ? (
            <div className="w-full overflow-x-auto bg-white">
              <table className="relative rounded-lg" width="100%">
                <thead>
                  <tr className="font-normal text-left">
                    {/* <td className="py-4 pl-4">
                      <span className="flex text-base">{labels?.checkoutId}</span>
                    </td> */}

                    <td className="py-4 pl-4">
                      <span className="flex text-base">
                        {labels?.codes}
                        <img
                          className={`inline-block px-2 cursor-pointer ${sort?.codes === 1 && 'transform rotate-180'}`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('codes')}
                        />
                      </span>
                    </td>
                    <td className="py-4 pl-4 cursor-pointer">
                      <span className="flex text-base">
                        {labels?.quantity}
                        <img
                          className={`inline-block px-2 cursor-pointer ${
                            sort?.quantity === 1 && 'transform rotate-180'
                          }`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('quantity')}
                        />
                      </span>
                    </td>
                    <td className="py-4 pl-4">
                      <span className="flex text-base">
                        {labels?.firstName}
                        <img
                          className={`inline-block px-2 cursor-pointer ${
                            sort?.firstName === 1 && 'transform rotate-180'
                          }`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('firstName')}
                        />
                      </span>
                    </td>
                    <td className="py-4 pl-4">
                      <span className="flex text-base">
                        {labels?.lastName}
                        <img
                          className={`inline-block px-2 cursor-pointer ${
                            sort?.lastName === 1 && 'transform rotate-180'
                          }`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('lastName')}
                        />
                      </span>
                    </td>
                    <td className="py-4 pl-4 cursor-pointer">
                      <span className="flex text-base">
                        {labels?.email}
                        <img
                          className={`inline-block px-2 cursor-pointer ${sort?.email === 1 && 'transform rotate-180'}`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('email')}
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
                    
                    
                    <td className="py-4 pl-4 cursor-pointer">
                      <span className="flex text-base">
                        {labels?.paymentStatus}
                        <img
                          className={`inline-block px-2 cursor-pointer ${
                            sort?.paymentStatus === 1 && 'transform rotate-180'
                          }`}
                          src="/images/sorting.svg"
                          alt="Products"
                          onClick={handleSort('paymentStatus')}
                        />
                      </span>
                    </td>
                    <td className="py-4 pl-4">{labels?.emailStatus}</td>
                    <td className="py-4 pl-4">{labels?.ticket}</td>
                  </tr>
                </thead>
                <caption
                  className="absolute mx-4 border-b border-black border-dashed border-bottom"
                  style={{ width: 'calc(100% - 30px)' }}
                />
                <tbody>
                  {tickets.map((ticket, i) => {
                    return (
                      <tr key={'ticket' + i} className={`rounded-lg  ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                        {/* <td className="py-4 pl-4 text-sm text-left">{ticket.checkoutId}</td> */}
                        <td className="py-4 pl-4 text-sm text-left">
                          {ticket.codes?.map((item, i) => {
                            return (
                              <span className="block" key={i}>
                                <span>{item}</span>
                                {i !== ticket?.codes?.length - 1 && <span>,</span>}
                              </span>
                            )
                          })}
                          {(!ticket.codes?.length || ticket.codes?.length < 1 )&& <span className="text-center mx-auto"> -</span>}
                        </td>
                        <td className="py-4 pl-4 text-sm text-left">{ticket?.quantity}</td>
                        <td className="py-4 pl-4 text-sm text-left">{ticket?.personalData?.firstName}</td>
                        <td className="py-4 pl-4 text-sm text-left">{ticket?.personalData?.lastName}</td>
                        <td className="py-4 pl-4 text-sm text-left">{ticket?.personalData?.email}</td>
                        <td className="py-4 pl-4 text-sm text-left">{new Date(ticket.createdAt).toLocaleString()}</td>
                        <td className="py-4 pl-4 text-sm text-left">{ticket?.paymentStatus || 'Pending'}</td>
                        <td className="py-4 pl-4 text-sm text-left">
                          {ticket?.mailSent ? labels?.sent : labels?.pending}
                        </td>
                        <td className="py-4 pl-4 text-sm text-center">
                          <button
                            className="bg-white border border-primary-400 hover:text-primary-500 hover:border- px-4 py-1 rounded-lg flex items-center justify-between"
                            type="button"
                            id=""
                            title=""
                            onClick={() => {
                              setSelectedTicket(ticket)
                              setShowPopup(true)
                            }}
                          >
                            {labels?.showTicket}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {showPopup && (
                  <PopUp openModal={showPopup}>
                    {/* <div dangerouslySetInnerHTML={{_html:selectedTicket?.pdfTemplate?.template}}></div> */}
                    <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-[800px]">
                      <div className="flex justify-between pb-2 border-b border-black border-solid">
                        <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">
                          {labels?.ticket}
                        </h1>
                        <svg
                          onClick={() => setShowPopup(false)}
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
                      <div className="m-8 main-wrapper">
                        <iframe
                          className="w-full max-w-[794px] h-[1100px] scale-75 origin-top mx-auto"
                          srcDoc={selectedTicket?.pdfTemplate?.template?.replace(/{{codes}}/, selectedTicket?.codes?.join(", "))}
                          frameBorder="0"
                        ></iframe>
                      </div>
                    </div>
                  </PopUp>
                )}
              </table>
            </div>
          ) : (
            <div className="mt-5 mb-5 text-center table-responsive">
              {!contextData.isLoading && <div>{labels?.noRecordsFound}</div>}
            </div>
          )}
        </GridMaster>
      </div>
    </>
  )
}
export default ConcertTicket

export async function getServerSideProps(context) {
  return Authenticate(context)
}
