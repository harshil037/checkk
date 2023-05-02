import { useState, useEffect, useContext } from 'react'
import Authenticate from '../../../lib/authenticate'
import { useIsMounted } from '../../../lib/hooks'
import PopUp from '../../../components/dialog/popUp'
import { AppContext } from '../../../context/appContext'
import GridMaster from '../../../components/layout/gridMaster'
import { useRouter } from 'next/router'
import Transactions from '../../../components/transactions'
import OutsideAlerter from '../../../components/shared/outsideAlerter'

const Vouchers = (props) => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const [isSearching, setIsSearching] = useState(false)
  const [voucherData, setVoucherData] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [show, setShow] = useState({})
  const isMounted = useIsMounted()
  const router = useRouter()

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'vouchers',
    }))
  }, [])

  const [_id, setId] = useState(0)
  const [gridInfo, setGridInfo] = useState({
    length: 0,
    currentPage: 1,
    perPage: 10,
    sort: { name: true },
    searchText: '',
    searchToggle: false,
    pageList: { start: 0, end: 10 },
  })

  useEffect(async () => {
    if (!isSearching && props.user) {
      await getVouchers()
    }
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort])

  const getVouchers = async () => {
    setLoading(true)
    fetch(
      '/api/vouchers?req_sort=' +
        (gridInfo.sort.name == true ? 1 : -1) +
        '&req_offset=' +
        gridInfo.perPage * (gridInfo.currentPage - 1) +
        '&req_limit=' +
        gridInfo.perPage +
        '&req_search=' +
        gridInfo.searchText,
      {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      },
    )
      .then((response) => {
        if (!isMounted.current) {
          return
        }
        return response.json()
      })
      .then((data) => {
        if (data?.vouchers) {
          setVoucherData(data?.vouchers)
          setGridInfo((state) => ({
            ...state,
            ['length']: data.length,
          }))
          setLoading(false)
        }
      })
  }

  const handleOpen = (id) => {
    router.push(`/admin/vouchers/` + id)
  }

  return (
    <div className="mt-24">
      <GridMaster
        newButtonText="Add New Voucher"
        headerText="Vouchers"
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
        handleOpen={() => {
          handleOpen('_new')
        }}
        passedData={voucherData}
        deleteSelected={() => {}}
      >
        {voucherData.length > 0 ? (
          <div className="mt-5 table-responsive ">
            <table className="relative rounded-lg customTable" width="100%">
              <thead>
                <tr className="text-left">
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">First Name</div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">Last Name</div>
                  </td>
                  <td width="15%" className="py-4 pl-4">
                    <div className="relative flex text-sm">Email</div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">Initial Value</div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">Current Value</div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">Transaction</div>
                  </td>
                  <td width="15%" className="py-4 pl-4">
                    <div className="relative flex text-sm">Transaction Time</div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">Transaction Type</div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm"></div>
                  </td>
                </tr>
              </thead>
              <caption className="absolute mx-4 border-b border-black border-dashed border-bottom" />
              <tbody>
                {voucherData.map((voucherItem, i) => {
                  return (
                    <tr key={i + 'voucher'} className="rounded-lg">
                      <td className="py-4 pl-4 text-left rounded-lg">
                        <div className="relative flex text-sm">{voucherItem.buyer.firstName}</div>
                      </td>
                      <td className="py-4 pl-4 text-left rounded-lg">
                        <div className="relative flex text-sm">{voucherItem.buyer.lastName}</div>
                      </td>
                      <td className="py-4 pl-4 text-left rounded-lg">
                        <div className="relative flex text-sm">{voucherItem.email}</div>
                      </td>
                      <td className="py-4 pl-4 text-left rounded-lg">
                        <div className="relative flex text-sm">{voucherItem.initialValue}</div>
                      </td>
                      <td className="py-4 pl-4 text-left rounded-lg">
                        <div className="relative flex text-sm">{voucherItem.currentValue}</div>
                      </td>
                      <td className="py-4 pl-4 text-left rounded-lg">
                        <div className="relative flex text-sm ">
                          <img
                            onClick={() => {
                              setId(voucherItem._id)
                              setOpenModal(true)
                            }}
                            className="inline-block px-2"
                            src="/images/Edit.svg"
                          />
                        </div>
                      </td>
                      <td className="py-4 pl-4 text-left rounded-lg">
                        <div className="relative flex text-sm">
                          {new Date(voucherItem.transactions[0].createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 pl-4 text-left rounded-lg">
                        <div className="relative flex text-sm">{voucherItem.transactions[0].type}</div>
                      </td>
                      <td className="py-4 pl-4 text-left rounded-lg">
                        <OutsideAlerter
                          closeMe={(event) => {
                            if (event.target.parentElement.id != 'parent') {
                              setShow(() => {
                                return { [i]: false }
                              })
                            }
                          }}
                        >
                          <div className={`flex relative text-sm `}>
                            <img
                              onClick={() => {
                                setShow(() => {
                                  return { [i]: true }
                                })
                              }}
                              className="inline-block px-2 cursor-pointer"
                              src="/images/Group.svg"
                            />
                            <div
                              id="parent"
                              className={`p-6 rounded-lg absolute bg-white z-10 voucher-popup  ${!show[i] && `hidden`}`}
                            >
                              <p className="mb-2 text-sm cursor-pointer">Resend Email</p>
                              <p className="mb-2 text-sm cursor-pointer">Invalid Voucher</p>
                              <div
                                onClick={() => {
                                  handleOpen(voucherItem._id)
                                }}
                                className="text-sm cursor-pointer"
                              >
                                Edit
                              </div>
                              <div className="absolute mx-auto cursor-pointer caret top-2"></div>
                            </div>
                          </div>
                        </OutsideAlerter>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 mb-5 text-center table-responsive">{!contextData.isLoading && 'No records found'}</div>
        )}
        {openModal && (
          <PopUp openModal={openModal}>
            <Transactions
              _id={_id}
              handleClose={() => {
                setOpenModal(false)
              }}
            />
          </PopUp>
        )}
      </GridMaster>
    </div>
  )
}

export default Vouchers

export async function getServerSideProps(context) {
  return Authenticate(context)
}
