import React, { useState, useContext, useEffect } from 'react'

import Authenticate from '../../../../lib/authenticate'
import { useUser, useIsMounted } from '../../../../lib/hooks'
import PopUp from '../../../../components/dialog/popUp'
import { AppContext } from '../../../../context/appContext'
import { useRouter } from 'next/router'
import GridMaster from '../../../../components/layout/gridMaster'
import translations from '../../../../translations/parking.json'

const Feedback = () => {
  const [isComponentMounted, setIsComponentMounted] = useState(false)
  const [user, { mutate: userMutate }] = useUser()
  const [feedbackData, setFeedbackData] = useState([])
  const [notificationModal, setNotificationModal] = useState({ open: false, message: '', title: '', type: 'succes' })
  const [isSearching, setIsSearching] = useState(false)
  const isMounted = useIsMounted()
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const router = useRouter()
  const { domainUrl } = router.query

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

  useEffect(() => {
    if (window.localStorage.getItem('mts-language')) {
      setLanguage(window.localStorage.getItem('mts-language'))
    } else {
      window.localStorage.setItem('mts-language', language)
    }
  }, [])

  // multi language
  const [language, setLanguage] = useState('en')
  const [labels, setLabels] = useState({})

  const { feedbacks, general } = translations
  const getTranslation = (translations, language) => {
    const translationObj = {}
    for (const translation in translations) {
      translationObj[translation] = translations[translation][language] || translation
    }
    return translationObj
  }
  useEffect(() => {
    const translation = getTranslation({ ...feedbacks, ...general }, language)
    setLabels(translation)
  }, [language])

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'feedback',
    }))
  }, [])

  useEffect(async () => {
    if (!isSearching && user) {
      await getFeedbackData()
    }
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort, domainUrl, sort])

  useEffect(async () => {
    const delayDebounceFn = setTimeout(async () => {
      if (isSearching) {
        await getFeedbackData()
      }
      if (isMounted.current) {
        setIsSearching(false)
      }
    }, 1500)
    return () => clearTimeout(delayDebounceFn)
  }, [gridInfo.searchText])

  const getFeedbackData = async () => {
    setLoading(true)
    const sortQuery = JSON.stringify(sort)

    let res = fetch(
      `/api/parking/feedbacks?req_offSet=${gridInfo.perPage * (gridInfo.currentPage - 1)}&req_limit=${
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
        if (result?.feedbacks?.data) {
          setFeedbackData(result.feedbacks.data)

          setGridInfo((state) => ({
            ...state,
            ['length']: result?.feedbacks?.length?.total,
          }))
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
      default:
        setSort({})
        break
    }
  }

  return (
    <div>
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

      <div className="my-4">
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
      </div>

      <GridMaster
        newButtonText=""
        headerText={labels.parkingFeedbacks}
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
        length={feedbackData.length}
        setIsSearching={setIsSearching}
        passedData={feedbackData || []}
        showNewButton={false}
        rowsPerPage={labels.rowsPerPage}
      >
        {feedbackData.length > 0 ? (
          <div className="w-full mt-5 overflow-x-auto bg-white">
            <table className="relative rounded-lg" width="100%">
              <thead>
                <tr className="font-normal text-left">
                  <td className="py-4 pl-4">
                    {labels.createdAt}
                    <img
                      className={`inline-block px-2 cursor-pointer ${sort.createdAt === 1 && 'transform rotate-180'}`}
                      src="/images/sorting.svg"
                      alt="Products"
                      onClick={handleSort('createdAt')}
                    />
                  </td>
                  <td className="py-4 pl-4">
                    {labels.name}
                    <img
                      className={`inline-block px-2 cursor-pointer ${sort.name === 1 && 'transform rotate-180'}`}
                      src="/images/sorting.svg"
                      alt="Products"
                      onClick={handleSort('name')}
                    />
                  </td>
                  <td className="py-4 pl-4 cursor-pointer">
                    {labels.email}
                    <img
                      className={`inline-block px-2 cursor-pointer ${sort.email === 1 && 'transform rotate-180'}`}
                      src="/images/sorting.svg"
                      alt="Products"
                      onClick={handleSort('email')}
                    />
                  </td>
                  <td className="px-4 py-4 cursor-pointer">{labels.message}</td>
                </tr>
              </thead>
              <caption
                className="absolute mx-4 border-b border-black border-dashed border-bottom"
                style={{ width: 'calc(100% - 30px)' }}
              />
              <tbody className="w-full">
                {feedbackData.map((checkout, i) => {
                  return (
                    <tr key={'user' + i} className={`rounded-lg ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      <td className="py-4 pl-4 overflow-auto text-sm text-left break-words">
                        {new Date(checkout.createdAt).toLocaleString()}
                      </td>
                      <td
                        className="py-4 pl-4 overflow-auto text-sm text-left break-words"
                        style={{ maxHeight: '150px', overflow: 'auto' }}
                      >
                        {checkout.name || `-`}
                      </td>
                      <td className="py-4 pl-4 overflow-auto text-sm text-left break-words">{checkout.email || `-`}</td>
                      <td
                        className="px-4 py-4 overflow-auto text-sm text-left break-words"
                        style={{ maxHeight: '150px', overflow: 'auto', maxWidth: '200px' }}
                      >
                        {checkout.message}
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
      </GridMaster>
    </div>
  )
}
export default Feedback

export async function getServerSideProps(context) {
  return Authenticate(context)
}
