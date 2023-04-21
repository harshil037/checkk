import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../../context/appContext'
import PopUp from '../dialog/popUp'
import GridMaster from '../layout/gridMaster'
import { useUser, useIsMounted } from '../../lib/hooks'
import { useRouter } from 'next/router'
import translations from '../../translations/parking.json'
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye'

const ParkingTransactions = ({ language }) => {
  const [isComponentMounted, setIsComponentMounted] = useState(false)
  const [user, { mutate: userMutate }] = useUser()
  const [isSearching, setIsSearching] = useState(false)
  const isMounted = useIsMounted()
  const router = useRouter()
  const [openModal, setOpenModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState({})
  const { domainUrl } = router.query
  const [sort, setSort] = useState({ createdAt: -1 })

  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const [notificationModal, setNotificationModal] = useState({ open: false, message: '', title: '', type: 'succes' })
  const [gridInfo, setGridInfo] = useState({
    length: 0,
    currentPage: 1,
    perPage: 10,
    sort: { name: true },
    searchText: '',
    searchToggle: false,
    pageList: { start: 0, end: 5 },
  })
  const [transactionData, setTransactionData] = useState([])

  // useEffect(() => {
  //   if (window.localStorage.getItem('mts-language')) {
  //     setLanguage(window.localStorage.getItem('mts-language'))
  //   } else {
  //     window.localStorage.setItem('mts-language', language)
  //   }
  // }, [])

  // multi language
  // const [language, setLanguage] = useState('en')
  const [labels, setLabels] = useState({})

  const { transactions, general } = translations
  const getTranslation = (translations, language) => {
    const translationObj = {}
    for (const translation in translations) {
      translationObj[translation] = translations[translation][language] || translation
    }
    return translationObj
  }
  useEffect(() => {
    const translation = getTranslation({ ...transactions, ...general }, language)
    setLabels(translation)
  }, [language])

  const getTransactionData = async () => {
    setLoading(true)
    const key = Object.keys(sort)[0]
    const value = sort[key]

    let res = fetch(
      `/api/parking/analytics/transaction?reqOffset=${gridInfo.perPage * (gridInfo.currentPage - 1)}&reqLimit=${
        gridInfo.perPage
      }&reqSearch=${gridInfo.searchText}&sortField=${key}&sortValue=${value}`,
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
        if (result?.data) {
          setTransactionData(result?.data?.data)
          setGridInfo((state) => ({
            ...state,
            ['length']: result?.data?.total,
          }))
          setLoading(false)
        }
      })
  }

  useEffect(async () => {
    if (!isSearching && user) {
      await getTransactionData()
    }
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort, domainUrl, sort])

  useEffect(async () => {
    const delayDebounceFn = setTimeout(async () => {
      if (isSearching) {
        await getTransactionData()
      }
      if (isMounted.current) {
        setIsSearching(false)
      }
    }, 1500)
    return () => clearTimeout(delayDebounceFn)
  }, [gridInfo.searchText])

  useEffect(() => setIsComponentMounted(true), [])
  if (!isComponentMounted) {
    return null
  }

  const handleSort = (type) => () => {
    switch (type) {
      case 'name':
        if (sort.name === 1) {
          setSort({ name: -1 })
        } else {
          setSort({ name: 1 })
        }
        break
      case 'surname':
        if (sort.name === 1) {
          setSort({ surname: -1 })
        } else {
          setSort({ surname: 1 })
        }
        break
      case 'nationality':
        if (sort.name === 1) {
          setSort({ nationaliy: -1 })
        } else {
          setSort({ nationaliy: 1 })
        }
        break
      case 'email':
        if (sort.email === 1) {
          setSort({ email: -1 })
        } else {
          setSort({ email: 1 })
        }
        break
      case 'purpose':
        if (sort.purpose === 1) {
          setSort({ purpose: -1 })
        } else {
          setSort({ purpose: 1 })
        }
        break
      case 'inspiration':
        if (sort.inspiration === 1) {
          setSort({ inspiration: -1 })
        } else {
          setSort({ inspiration: 1 })
        }
        break
      case 'commercial':
        if (sort.name === 1) {
          setSort({ commercial: -1 })
        } else {
          setSort({ commercial: 1 })
        }
        break
      default:
        setSort({})
        break
    }
  }

  return (
    <>
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
              className={`text-center ${notificationModal.type === 'danger' ? 'text-red-500' : 'text-green-500'} mt-6`}
            >
              {notificationModal.message}
            </div>
          </div>
        </PopUp>
      )}
      {/* <div className="mb-4">
        <span className="inline-block px-4 py-2 bg-white rounded-lg">
          <label htmlFor="channel">Langauge : </label>
          <select
            id="channel"
            className="p-1 bg-white border border-green-500 rounded-lg outline-none"
            onChange={(e) => setLanguage(e.target.value)}
            value={language}
          >
            <option value="en">EN</option>
            <option value="de">DE</option>
            <option value="it">IT</option>
          </select>
        </span>
      </div> */}
      <GridMaster
        newButtonText=""
        headerText={labels.parkingTransactions}
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
        length={transactionData.length}
        setIsSearching={setIsSearching}
        passedData={transactionData || []}
        showNewButton={false}
        rowsPerPage={labels.rowsPerPage}
      >
        {transactionData.length > 0 ? (
          <div className="w-full mt-5 overflow-x-auto bg-white">
            <table className="relative rounded-lg" width="100%">
              <thead>
                <tr className="font-normal text-left">
                  <td className="py-4 pl-4">{labels.transactionId}</td>
                  <td className="py-4 pl-4 cursor-pointer">{labels.paymentStatus}</td>
                  <td className="py-4 pl-4">{labels.refundTransactionId}</td>
                  <td className="py-4 pl-4">{labels.price}</td>
                  <td className="py-4 pl-4">{labels.details}</td>
                </tr>
              </thead>
              <caption
                className="absolute mx-4 border-b border-black border-dashed border-bottom"
                style={{ width: 'calc(100% - 30px)' }}
              />
              <tbody>
                {transactionData.map((transaction, i) => {
                  return (
                    <tr key={'user' + i} className={`rounded-lg  ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      <td className="py-4 pl-4 text-sm text-left">{transaction.transactionId}</td>
                      <td className="py-4 pl-4 text-sm text-left">{transaction.paymentStatus}</td>
                      <td className="py-4 pl-4 text-sm text-left">
                        {transaction.refundTransactionId ? transaction.refundTransactionId : '-'}
                      </td>
                      <td className="py-4 pl-4 text-sm text-left">
                        {transaction.price
                          ? new Intl.NumberFormat(`${language}-${language?.toUpperCase()}`, {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(transaction.price)
                          : '-'}
                      </td>
                      <td className="py-4 pl-4 text-sm text-left">
                        {transaction.paymentStatus === 'success' && (
                          <img
                          src={
                            Object.keys(selectedTicket).length > 0 &&
                            selectedTicket.transactionId == transaction.transactionId
                              ? '/images/eye-icon-hover.svg'
                              : '/images/eye-icon.svg'
                          }
                          onClick={() => {
                            setOpenModal(true)
                            setSelectedTicket({
                              ...transaction,
                              emailTemplate: Object.values(transaction?.htmlEmails || {})?.[0] || '',
                            })
                          }}
                          alt="view"
                        />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 mb-5 text-center table-responsive">
            {!contextData.isLoading && <div>No records found</div>}
          </div>
        )}
        {openModal && (
          <PopUp openModal={openModal}>
            <div className="h-full p-6 mx-auto my-auto mt-32 overflow-hidden bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-2/5">
              <div className="flex items-center justify-between pb-2 border-b border-black border-solid">
                <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Ticket</h1>
                <div className="flex items-center gap-2">
                  <svg
                    onClick={() => {
                      setOpenModal(false)
                      setSelectedTicket({})
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
              {selectedTicket.emailTemplate ? (
                <>
                  {/* <div
                    className="overflow-scroll h-5/6"
                    style={{ maxHeight: '85vh' }}
                    dangerouslySetInnerHTML={{
                      __html: selectedTicket.emailTemplate,
                    }}
                  ></div> */}
                  <div className="w-full h-full" style={{ height: '85vh' }}>
                    <iframe
                      className="w-full h-full"
                      // style={{ maxHeight: '85vh' }}
                      srcDoc={selectedTicket.emailTemplate}
                      frameBorder="0"
                    ></iframe>
                  </div>
                </>
              ) : (
                <div className="text-center">No Template found</div>
              )}
            </div>
          </PopUp>
        )}
      </GridMaster>
    </>
  )
}

export default ParkingTransactions
