import React, { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'

import Authenticate from '../../../../lib/authenticate'
import GridMaster from '../../../../components/layout/gridMaster'
import Button from '../../../../components/common/Button'
import { AppContext } from '../../../../context/appContext'
import useConfirm from '../../../../components/dialog/useConfirm'

const BASE_URL = process.env.SMART_RESPONSE_CHANNEL_CONNECTION

const Requests = () => {
  const [requests, setRequests] = useState([])
  const [channel, setChannel] = useState('')
  const [gridInfo, setGridInfo] = useState({
    currentPage: 1,
    perPage: 10,
    sort: { name: true },
    searchText: '',
    searchToggle: false,
    pageList: { start: 0, end: 5 },
  })
  const [sort, setSort] = useState({ timestamp: -1 })

  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const { isConfirmed } = useConfirm()

  const router = useRouter()
  const { clientId } = router.query

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'clients',
    }))
  }, [])

  async function getRequests() {
    setLoading(true)
    // const res = await fetch(`/api/requests/${clientId}`)
    const sortQuery = JSON.stringify(sort)
    const res = await fetch(
      `/api/requests/${clientId}?req_offSet=${gridInfo.perPage * (gridInfo.currentPage - 1)}&req_limit=${
        gridInfo.perPage
      }&req_search=${channel}&req_sort=${sortQuery}`,
    )

    const result = await res.json()

    if (result?.requests?.data) {
      setRequests(result?.requests?.data)
      setGridInfo((prev) => ({ ...prev, length: result?.requests?.length?.total }))
    }
    setLoading(false)
  }

  useEffect(() => {
    getRequests()
  }, [gridInfo.currentPage, gridInfo.perPage, channel, sort])

  const handleSort = (type) => () => {
    if (type === 'time') {
      if (sort.timestamp === 1) {
        setSort({ timestamp: -1 })
      } else {
        setSort({ timestamp: 1 })
      }
    }
  }

  const handleSend = (request) => async () => {
    let confirmed = await isConfirmed('Are you sure to send this request to SMTS')

    if (confirmed) {
      setLoading(true)
      const reqBody = { ...request }

      delete reqBody._id
      delete reqBody.timestamp
      delete reqBody.clientId

      const sendRes = await fetch(`${BASE_URL}/${clientId}/${reqBody.language}/enquiry/channelautoreply`, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      })

      const sendResult = await sendRes.json()

      if (sendResult.result === 'OK') {
        request.response = true

        const updateRequest = await fetch('/api/requests', {
          method: 'POST',
          body: JSON.stringify(request),
        })

        const updateRequestResult = await updateRequest.json()

        if (updateRequestResult.success) {
          setRequests((prev) =>
            prev.map((item) => {
              if (item._id === request._id) {
                item.response = true
              }
              return item
            }),
          )
        } else {
          console.log(false)
        }
      } else {
        // console.log('send result', sendResult.result)
      }
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="my-4">
        <span className="inline-block px-4 py-2 bg-white rounded-lg">
          <label htmlFor="channel">Channel : </label>
          <select
            id="channel"
            className="p-1 bg-white border border-green-500 rounded-lg outline-none"
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="">All</option>
            <option value="yesalps">Yesalps</option>
            <option value="suedtirol">Suedtirol</option>
            <option value="suedtirolerland">Suedtirolerland</option>
            <option value="dolomiti">Dolomiti</option>
          </select>
        </span>
      </div>

      <GridMaster
        headerText="Requests"
        passedData={requests}
        length={requests.length}
        gridInfo={gridInfo}
        setGridInfo={setGridInfo}
        showNewButton={false}
        showSearch={false}
      >
        <table className="text-gray-600 rounded-lg" width="100%">
          <thead>
            <tr className="font-semibold text-center">
              <td className="p-4">
                <img
                  className={`inline-block px-2 cursor-pointer ${sort.timestamp === 1 && 'transform rotate-180'}`}
                  src="/images/sorting.svg"
                  alt="Products"
                  onClick={handleSort('time')}
                />
                Time Stamp
              </td>
              <td className="p-4">Contact</td>
              <td className="p-4">Period</td>
              <td className="p-4">Occupancy</td>
              <td className="p-4">Channel</td>
              <td className="p-4">Sent To SMTS</td>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => {
                return (
                  <tr key={request._id} className="text-center">
                    <td className="p-4">{new Date(request.timestamp).toLocaleString()}</td>
                    <td className="p-4">
                      <p>
                        {request.firstname} {request.lastname}
                      </p>
                      <p className="text-gray-500">{request.email}</p>
                    </td>
                    <td className="p-4">
                      {/* {request.period[0].arrival + ' - ' + request.period[0].departure} */}
                      {request.period.map((period, index) => (
                        <p key={index}>
                          {period.arrival} - {period.departure}
                        </p>
                      ))}
                    </td>
                    <td className="p-4">
                      {request.room.map((item, index) => (
                        <p key={index}>
                          {item.adults} adults {item.children > 0 ? ` - ${item.children} children` : ''}
                        </p>
                      ))}
                    </td>
                    <td className="p-4">{request.channel}</td>
                    <td className="p-4">
                      {request.response ? (
                        'Sent'
                      ) : (
                        <Button variant="primary" type="button" onClick={handleSend(request)}>
                          Send to SMTS
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-xl text-center">
                  No Requests Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GridMaster>
    </div>
  )
}

export default Requests

export async function getServerSideProps(context) {
  return Authenticate(context)
}
