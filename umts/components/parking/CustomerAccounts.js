import React, { useState, useContext, useEffect } from 'react'
import { useUser, useIsMounted } from '../../lib/hooks'
import PopUp from '../dialog/popUp'
import { AppContext } from '../../context/appContext'
import { useRouter } from 'next/router'
import GridMaster from '..//layout/gridMaster'
import translations from '../../translations/parking.json'
import countries from '../../translations/countries.json'

const CustomerAccounts = ({ language, setExportData }) => {
  const [isComponentMounted, setIsComponentMounted] = useState(false)
  const [user, { mutate: userMutate }] = useUser()
  const [isSearching, setIsSearching] = useState(false)
  const isMounted = useIsMounted()
  const router = useRouter()
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
  const [customerData, setCustomerData] = useState([])

  // export
  const getExportData = async (limit) => {
    setLoading(true)
    const key = Object.keys(sort)[0]
    const value = sort[key]
    const res = await fetch(
      `/api/parking/analytics/customer?reqOffset=0&reqLimit=${limit}&sortField=createdAt&sortValue=-1`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    const result = await res.json()
    // console.log(result)
    const { data } = result.data
    // const { email, name, surname, purpose, inspiration, nationality, phone, commercial } = data.checkouts.data
    const arr = data.map((item) => {
      const { email, name, surname, purpose, inspiration, nationality, phone, commercial, voucherCode } = item
      const country = countries.find((country) => country.isoCode == nationality)
      return {
        email,
        name,
        surname,
        purpose,
        inspiration,
        // nationality,
        nationality: country?.['en'] || nationality,
        phone,
        ['type']: voucherCode == '00' ? 'Daily' : 'Voucher',
        commercial,
      }
    })
    setLoading(false)
    setExportData(arr)
  }

  // useEffect(() => {
  //   if (window.localStorage.getItem('mts-language')) {
  //     setLanguage(window.localStorage.getItem('mts-language'))
  //   } else {
  //     window.localStorage.setItem('mts-language', language)
  //   }
  // }, [])

  // multi language
  // const [language, setLanguage] = useState('en')

  const { customers, general } = translations
  const [labels, setLabels] = useState({})
  const getTranslation = (translations, language) => {
    const translationObj = {}
    for (const translation in translations) {
      translationObj[translation] = translations[translation][language] || translation
    }
    return translationObj
  }
  useEffect(() => {
    const translation = getTranslation({ ...customers, ...general }, language)
    setLabels(translation)
  }, [language])

  const getCustomerData = async () => {
    setLoading(true)
    const key = Object.keys(sort)[0]
    const value = sort[key]

    let res = fetch(
      `/api/parking/analytics/customer?reqOffset=${gridInfo.perPage * (gridInfo.currentPage - 1)}&reqLimit=${
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
          // console.log(`result?.data?.data`, result?.data?.data)
          setCustomerData(result?.data?.data)
          setGridInfo((state) => ({
            ...state,
            ['length']: result?.data?.total,
          }))
          getExportData(result?.data?.total)
          setLoading(false)
        }
      })
  }

  useEffect(async () => {
    if (!isSearching && user) {
      await getCustomerData()
    }
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort, domainUrl, sort])

  // export
  // useEffect(() => {
  //   console.log(`gridInfo.length`, gridInfo.length)
  //   getExportData(gridInfo.length)
  // }, [gridInfo.length])

  useEffect(async () => {
    const delayDebounceFn = setTimeout(async () => {
      if (isSearching) {
        await getCustomerData()
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
        headerText={labels.parkingCustomers}
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
        length={customerData.length}
        setIsSearching={setIsSearching}
        passedData={customerData || []}
        showNewButton={false}
        rowsPerPage={labels.rowsPerPage}
      >
        {customerData.length > 0 ? (
          <div className="w-full mt-5 overflow-x-auto bg-white">
            <table className="relative rounded-lg" width="100%">
              <thead>
                <tr className="font-normal text-left">
                  <td className="py-4 pl-4">
                    {labels.firstName}
                    <img
                      className={`inline-block px-2 cursor-pointer ${sort.name === 1 && 'transform rotate-180'}`}
                      src="/images/sorting.svg"
                      alt="Products"
                      onClick={handleSort('name')}
                    />
                  </td>
                  <td className="py-4 pl-4">
                    {labels.lastName}
                    <img
                      className={`inline-block px-2 cursor-pointer ${sort.surname === 1 && 'transform rotate-180'}`}
                      src="/images/sorting.svg"
                      alt="Products"
                      onClick={handleSort('surname')}
                    />
                  </td>
                  <td className="py-4 pl-4 cursor-pointer">
                    {labels.nationality}
                    <img
                      className={`inline-block px-2 cursor-pointer ${sort.nationality === 1 && 'transform rotate-180'}`}
                      src="/images/sorting.svg"
                      alt="Products"
                      onClick={handleSort('nationality')}
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
                  <td className="py-4 pl-4"> {labels.phoneNumber}</td>
                  <td className="py-4 pl-4">
                    {labels.purpose}
                    <img
                      className={`inline-block px-2 cursor-pointer ${sort.purpose === 1 && 'transform rotate-180'}`}
                      src="/images/sorting.svg"
                      alt="Products"
                      onClick={handleSort('purpose')}
                    />
                  </td>
                  <td className="py-4 pl-4">
                    {labels.inspiration}
                    <img
                      className={`inline-block px-2 cursor-pointer ${sort.inspiration === 1 && 'transform rotate-180'}`}
                      src="/images/sorting.svg"
                      alt="Products"
                      onClick={handleSort('inspiration')}
                    />
                  </td>
                  <td className="py-4 pl-4">
                    {labels.commercial}
                    <img
                      className={`inline-block px-2 cursor-pointer ${sort.commercial === 1 && 'transform rotate-180'}`}
                      src="/images/sorting.svg"
                      alt="Products"
                      onClick={handleSort('commercial')}
                    />
                  </td>
                </tr>
              </thead>
              <caption
                className="absolute mx-4 border-b border-black border-dashed border-bottom"
                style={{ width: 'calc(100% - 30px)' }}
              />
              <tbody>
                {customerData.map((customer, i) => {
                  const country = countries.find((country) => country.isoCode == customer.nationality)
                  return (
                    <tr key={'user' + i} className={`rounded-lg  ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      <td className="py-4 pl-4 text-sm text-left">{customer.name}</td>
                      <td className="py-4 pl-4 text-sm text-left">{customer.surname}</td>
                      <td
                        className="py-4 pl-4 text-sm text-left"
                        style={{
                          maxWidth: '200px',
                          overflow: 'auto',
                        }}
                      >
                        {country?.[language] || customer.nationality}
                      </td>
                      <td className="py-4 pl-4 text-sm text-left">{customer.email}</td>
                      <td className="py-4 pl-4 text-sm text-left">{customer.phone}</td>
                      <td className="py-4 pl-4 text-sm text-left">{customer?.purpose || '-'}</td>
                      <td className="py-4 pl-4 text-sm text-left">{customer?.inspiration || '-'}</td>
                      <td className="py-4 pl-4 text-sm text-left">{customer?.commercial == true ? 'true' : 'false'}</td>
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
    </>
  )
}

export default CustomerAccounts
