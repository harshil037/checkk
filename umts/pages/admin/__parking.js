import React, { useState, useContext, useEffect } from 'react'
import Authenticate from '../../lib/authenticate'
import { useUser, useIsMounted } from '../../lib/hooks'
import PopUp from '../../components/dialog/popUp'
import { Input, Button } from '../../components/componentLibrary'
import useConfirm from '../../components/dialog/useConfirm'
import { AppContext } from '../../context/appContext'
import { useRouter } from 'next/router'
import GridMaster from '../../components/layout/gridMaster'

const Parking = () => {
  const [isComponentMounted, setIsComponentMounted] = useState(false)
  const [user, { mutate: userMutate }] = useUser()
  const [checkoutData, setCheckoutData] = useState([])
  const [selectedCheckout, setSelectedCheckout] = useState({})
  const [openModal, setOpenModal] = useState(false)
  // const [editUser, setEditUser] = useState()
  const [isSearching, setIsSearching] = useState(false)
  const [resend, setResend] = useState(false)
  // const [isDomainListPage, setIsDomainListPage] = useState(false)
  const isMounted = useIsMounted()
  // const { isConfirmed } = useConfirm()
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const router = useRouter()
  const { domainUrl } = router.query
  const [mailStatus, setMailStatus] = useState('')

  const [gridInfo, setGridInfo] = useState({
    length: 0,
    currentPage: 1,
    perPage: 10,
    sort: { name: true },
    searchText: '',
    searchToggle: false,
    pageList: { start: 0, end: 5 },
  })

  const sendEmail = async () => {
    setLoading(true)
    if (selectedCheckout.emailTemplate) {
      const result = await fetch('/api/parking/mail', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Pragser parking ticket',
          from: 'info@lagodibraies.com',
          to: selectedCheckout.email,
          output: selectedCheckout.emailTemplate,
        }),
      })
      const res = await result.json()
      // console.log(res,'result')
      if (res.success) {
        setMailStatus('sent')
      } else {
        setMailStatus('Failed')
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'parking',
    }))
  }, [])

  useEffect(async () => {
    if (!isSearching && user) {
      await getCheckoutData()
    }
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort, domainUrl])

  useEffect(async () => {
    const delayDebounceFn = setTimeout(async () => {
      if (isSearching) {
        await getCheckoutData()
      }
      if (isMounted.current) {
        setIsSearching(false)
      }
    }, 1500)
    return () => clearTimeout(delayDebounceFn)
  }, [gridInfo.searchText])

  const handleClose = async (event, reason) => {
    setOpenModal(false)
  }

  const getCheckoutData = async () => {
    setLoading(true)
    let res = fetch(
      `/api/parking/checkouts?req_offSet=${gridInfo.perPage * (gridInfo.currentPage - 1)}&req_limit=${
        gridInfo.perPage
      }&req_search=${gridInfo.searchText}`,
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
      .then((data) => {
        if (data?.checkouts) {
          setCheckoutData(data.checkouts)

          setGridInfo((state) => ({
            ...state,
            ['length']: data.length,
          }))
          setLoading(false)
        }
      })
  }

  useEffect(() => setIsComponentMounted(true), [])
  if (!isComponentMounted) {
    return null
  }

  // const formattedDate = (d = new Date()) => {
  //   return [d.getDate(), d.getMonth() + 1, d.getFullYear()].map((n) => (n < 10 ? `0${n}` : `${n}`)).join('.')
  // }
  return (
    <>
      <GridMaster
        newButtonText=""
        headerText="Parking Checkout"
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
        //  handleOpen={handleOpen}
        length={checkoutData.length}
        setIsSearching={setIsSearching}
        passedData={checkoutData || []}
        //  deleteSelected={deleteSelected}
        showNewButton={false}
      >
        {checkoutData.length > 0 ? (
          <div className="mt-5 table-responsive custom-scrollbar">
            <table className="relative rounded-lg" width="100%">
              <thead>
                <tr className="font-normal text-left">
                  <td className="py-4 pl-4">First Name</td>
                  <td className="py-4 pl-4">Last Name</td>
                  <td className="py-4 pl-4">Email</td>
                  <td className="py-4 pl-4">Phone Number</td>
                  <td className="py-4 pl-4">Period</td>
                  <td className="py-4 pl-4">Number Plates</td>
                  <td className="py-4 pl-4">Payment Status</td>
                  <td className="py-4 pl-4">Email</td>
                </tr>
              </thead>
              <caption
                className="absolute mx-4 border-b border-black border-dashed border-bottom"
                style={{ width: 'calc(100% - 30px)' }}
              />
              <tbody>
                {checkoutData.map((checkout, i) => {
                  return (
                    <tr key={'user' + i} className={`rounded-lg  ${i % 2 === 0 ? 'bg-[#F5F5F5]' : 'bg-[#CFCFCF]'}`}>
                      <td className="py-4 pl-4 text-left">{checkout.name}</td>
                      <td className="py-4 pl-4 text-left">{checkout.surname}</td>
                      <td className="py-4 pl-4 text-left">{checkout.email}</td>
                      <td className="py-4 pl-4 text-left">{checkout.phone}</td>
                      {/* <td className="py-4 text-left">
                        <span>{formattedDate(new Date(checkout.fromDate))} </span> - <span>{formattedDate(new Date(checkout.toDate))}</span> 
                      </td> */}
                      <td className="py-4 pl-4 text-left">
                        <span className="mx-2">
                          {new Date(checkoutData?.[0]?.fromDate)
                            .toLocaleString([], {
                              hour12: false,
                            })
                            .replace(/\//g, '.')}{' '}
                        </span>
                        -{' '}
                        <span className="mx-2">
                          {' '}
                          {new Date(checkoutData?.[0]?.toDate)
                            .toLocaleString([], {
                              hour12: false,
                            })
                            .replace(/\//g, '.')}{' '}
                        </span>
                      </td>
                      <td className="flex flex-wrap gap-2 py-4 pl-4 text-left">
                        {checkout.plate?.map((item, i) => {
                          return (
                            <span key={i}>
                              <span>{item}</span>
                              {i !== checkout.plate.length - 1 && <span>,</span>}
                            </span>
                          )
                        })}
                      </td>
                      <td className="py-4 pl-4 text-left">{checkout.paymentStatus}</td>
                      <td className="py-4 pl-4 text-left">
                        <Button
                          onClick={() => {
                            setOpenModal(true)
                            setSelectedCheckout({
                              ...checkout,
                              emailTemplate: Object.values(checkout.htmlEmails || {})?.[0] || '',
                            })
                          }}
                          variant="success"
                        >
                          Send Email
                        </Button>
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
                <h1 className="text-lg">Email</h1>
                <div className="flex items-center gap-2">
                  {selectedCheckout.emailTemplate ? (
                    <Button
                      onClick={() => {
                        setResend(true)
                      }}
                      className="w-auto mr-2"
                      variant="success"
                    >
                      Resend Email
                    </Button>
                  ) : null}
                  <svg
                    onClick={() => {
                      setOpenModal(false)
                      setSelectedCheckout({})
                      setResend(false)
                      setMailStatus('')
                    }}
                    className="w-4 h-4 cursor-pointer fill-current"
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
              {selectedCheckout.emailTemplate ? (
                <>
                  {resend ? (
                    <div className="flex items-center justify-between p-2">
                      <Input
                        id="email"
                        className="mr-4"
                        style={{ width: '80%' }}
                        value={selectedCheckout.email}
                        onChange={(e) => {
                          setSelectedCheckout({ ...selectedCheckout, email: e.target.value })
                        }}
                        type="text"
                        variant="primary"
                      />
                      <Button
                        onClick={sendEmail}
                        className="w-auto"
                        variant="success"
                        disabled={mailStatus ? true : false}
                      >
                        {mailStatus ? mailStatus : 'Send Email'}
                      </Button>
                    </div>
                  ) : null}
                  <div
                    className="overflow-scroll h-5/6"
                    style={{ maxHeight: '85vh' }}
                    dangerouslySetInnerHTML={{
                      __html: selectedCheckout.emailTemplate,
                    }}
                  ></div>
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
export default Parking

export async function getServerSideProps(context) {
  return Authenticate(context)
}
