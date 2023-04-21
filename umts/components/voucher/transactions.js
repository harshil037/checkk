import React, { useState, useEffect, useContext } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Input, Select } from '../componentLibrary'
import Button from '../common/Button'
import { AppContext } from '../../context/appContext'
import { getApi } from '../../lib/hooks'

const Transactions = ({ handleClose, _id, code, labels, client, domain, language }) => {
  const [newTransaction, setNewTransaction] = useState({
    id: null,
    type: '',
    createdAt: new Date(),
    amount: 0,
    comment: 'Redeemed from backend',
  })
  const [error, setError] = useState('')
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const [transactionData, setTransactionData] = useState([])
  const [voucher, setVoucher] = useState({})
  const [voucherItem, setVoucherItem] = useState({})
  const [res, setRes] = useState({})
  const [clientData, setClientData] = useState({})
  const [token, setToken] = useState('')
  const transactionTypes = [
    {
      title: labels?.['redemption'] || "redemption",
      value: 'redemption',
    },
    {
      title: labels?.['charge'] || "charge",
      value: 'charge',
    },
  ]

  useEffect(async () => {
    setLoading(true)
    const res = await fetch('/api/vouchers?id=' + _id, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.status === 200) {
      setLoading(false)
      const data = await res.json()
      if (data?.voucher?._id) {
        setVoucher(data?.voucher)
        const transactions = data?.voucher?.voucherItems.find((item) => {
          setVoucherItem(item)
          if (item?.code === code) {
            setTransactionData(item?.transactions)
          }
        })
      }
    } else {
      setLoading(false)
    }
  }, [_id, code, res])

  useEffect(async () => {
    setLoading(true)

    const res = await fetch(`/api/vouchers/datasource`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: domain?.url,
        client: client?.clientNumber,
      }),
    })
    if (res.status === 200) {
      const dataSource = await res.json()
      setToken(dataSource?.voucher?.token)
    }
  }, [client, domain])

  function addZeroes(num) {
    // const dec = num.split('.')[1]
    // const len = dec && dec.length > 2 ? dec.length : 2
    return Number(num).toFixed(2)
  }

  return (
    <form>
      <div className="m-8 main-wrapper">handleClose
        <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-2/5">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">
              {labels?.transactions} :-
            </h1>
            <svg
              onClick={handleClose}
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
          <div className="client-modal-scroll">
            <>
              <div className="mt-5 bg-white">
                {transactionData.length > 0 ? (
                  <div className="mt-5 table-responsive ">
                    <table className="relative rounded-lg customTable" width="100%">
                      <thead>
                        <tr className="text-left">
                          <td width="10%" className="py-4 pl-4">
                            <div className="relative flex text-sm">{labels?.transactionAmount}</div>
                          </td>
                          <td width="10%" className="py-4 pl-4">
                            <div className="relative flex text-sm">{labels?.transactionDate}</div>
                          </td>
                          <td width="15%" className="py-4 pl-4">
                            <div className="relative flex text-sm">{labels?.transactionType}</div>
                          </td>
                          <td width="10%" className="py-4 pl-4">
                            <div className="relative flex text-sm">{labels?.id}</div>
                          </td>
                        </tr>
                      </thead>
                      <caption className="absolute mx-4 border-b border-black border-dashed border-bottom" />
                      <tbody>
                        {transactionData.map((transactionItem, i) => {
                          return (
                            <tr key={i + 'client'} className="rounded-lg">
                              <td className="p-4 text-left rounded-lg">
                                <div className="relative flex text-sm">{transactionItem.amount}</div>
                              </td>
                              <td className="p-4 text-left rounded-lg">
                                <div className="relative flex text-sm">
                                  {new Date(transactionItem.createdAt).toLocaleString()}
                                </div>
                              </td>
                              <td className="p-4 text-left rounded-lg">
                                <div className="relative flex text-sm">{transactionItem.type}</div>
                              </td>
                              <td className="p-4 text-left rounded-lg">
                                <div className="relative flex text-sm">
                                  <span>{transactionItem.id?.slice(0, 4)}....</span>
                                  <img
                                    onClick={() => {
                                      if (window.isSecureContext && navigator.clipboard) {
                                        navigator.clipboard.writeText(transactionItem?.id)
                                      }
                                    }}
                                    className="cursor-pointer"
                                    src="/images/copy-transaction.svg"
                                  />
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-5 mb-5 text-center table-responsive">
                    {!contextData.isLoading && 'No transactions found'}
                  </div>
                )}
              </div>
            </>
          </div>

          <div className={`flex flex-wrap -mx-4 text-left mt-6 ${newTransaction.id == null && 'hidden'}`}>
            <div className="w-full px-4 sm:w-1/3">
              <h2 className="mt-4 mb-2">{labels?.transactionAmount}</h2>
              <Input
                type="number"
                onChange={(e) => {
                  setNewTransaction((prevState) => ({
                    ...prevState,
                    amount: e.target.value,
                  }))
                }}
                value={newTransaction.amount}
                variant="primary"
                id="amount"
                placeholder={labels?.transactionAmount}
              />
            </div>
            <div className="w-full px-4 sm:w-1/3">
              <h2 className="mt-4 mb-2">{labels?.transactionDate}</h2>

              <div className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline ">
                {new Date(newTransaction.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="w-full px-4 sm:w-1/3">
              <h2 className="mt-4 mb-2">{labels?.transactionType}</h2>
              <Select
                name={'transactionType'}
                value={newTransaction.type}
                variant="primary"
                onChange={(e) => {
                  setNewTransaction((prevState) => ({
                    ...prevState,
                    type: e.target.value,
                  }))
                }}
                id="transactionType"
              >
                {transactionTypes?.length > 0 && (
                  <>
                    <option className="bg-gray-50" value={''}>
                      {labels?.defaultTransactionType}
                    </option>
                    {transactionTypes?.map((item, index) => (
                      <option className="bg-gray-50" key={index} value={item.value}>
                        {item.title}
                      </option>
                    ))}
                  </>
                )}
              </Select>
            </div>
          </div>
          <div className="w-full mt-5 text-left text-red-700">{error}</div>
          <div className="flex justify-between">
            <div className="w-full">
              {newTransaction.id == null ? (
                <div className="w-full mt-5 text-right sm:w-2/2">
                  <Button
                    onClick={() => {
                      setNewTransaction((prevState) => ({
                        ...prevState,
                        id: uuidv4(),
                        type: '',
                        createdAt: new Date().toISOString(),
                        amount: 0,
                        comment: 'Redeemed from backend',
                      }))
                    }}
                    variant="primary"
                  >
                    {labels?.addTransaction}
                    <img src="/images/plus-bar.svg" className={`inline-block ml-4 cursor-pointer`} alt="sortList" />
                  </Button>
                </div>
              ) : (
                <div className="w-full mt-5 text-right sm:w-2/2 ">
                  <Button
                    onClick={async () => {
                      if (
                        voucher &&
                        voucherItem &&
                        Object.keys(voucher).length > 0 &&
                        Object.keys(voucherItem).length > 0
                      ) {
                        if (newTransaction.amount <= 0) {
                          setError(labels?.validAmount || 'Please enter valid amount.')
                        } else if (!newTransaction.createdAt instanceof Date) {
                          setError(labels?.validDate || 'Please enter valid date.')
                        } else if (newTransaction.type.length <= 0) {
                          setError(labels?.validType || 'Please select type.')
                        } else if (voucher?.paymentMode != 'live') {
                          setError(labels?.notRedeemable || 'Sorry, This voucher is not redeemable.')
                        } else if (newTransaction?.amount > parseInt(voucherItem?.currentValue)) {
                          setError(labels?.greaterAmount || 'Amount is greater then the redeemable amount.')
                        } else {
                          setLoading(true)
                          if (voucherItem?.clientno.length > 0 && code && token) {
                            setError('')
                            const res = await fetch(
                              `/api/vmts/webhooks/asa/${voucherItem?.clientno}/vouchers/${code}/transactions/`,
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': ' application/json',
                                  authorization: token,
                                },
                                body: JSON.stringify({
                                  ...newTransaction,
                                  amount:
                                    addZeroes(
                                      newTransaction?.type === 'charge'
                                        ? newTransaction?.amount * -1
                                        : newTransaction?.amount,
                                    ) ||
                                    (newTransaction?.type === 'charge'
                                      ? newTransaction?.amount * -1
                                      : newTransaction?.amount),
                                }),
                              },
                            )
                            const data = await res.json()
                            if (data) {
                              setNewTransaction({
                                id: null,
                                type: '',
                                createdAt: new Date(),
                                amount: 0,
                              })
                              setRes(data)
                            }
                          } else {
                            setError('Something went wrong! Please try again later.')
                          }
                          setLoading(false)
                        }
                      }
                    }}
                    variant="primary"
                    // className="!text-white !bg-primary-400"
                  >
                    {labels?.saveTransaction}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default Transactions
