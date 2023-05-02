import React, { useState, useEffect, useRef } from 'react'
import { Formik, Field, Form, FieldArray } from 'formik'
import { useRouter } from 'next/router'
import isURL from 'validator/lib/isURL'
import { Input } from './componentLibrary'
import Button from '../components/common/Button'
import { isValidValue, isEqual } from '../lib/utils'
import { OrderListSelection } from '../components/form'
import StaticListComposition from './shared/staticListComposition'

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DATE_TODAY = new Date().toISOString().slice(0, 10)
const initDateTimeInput = {
  startDate: [],
  startTime: [],
  endDate: [],
  endTime: [],
  dateError: [],
  timeError: [],
}

const EditDomain = ({ passedDomain, handleClose, setLoading, isConfirmed }) => {
  const [errorMsg, setErrorMsg] = useState('')
  const [domain, setDomain] = useState()
  const [domainData, setDomainData] = useState()
  const [formErrors, setFormErrors] = useState({ isValid: false })
  const [validateKeyValue, setValidateKeyValue] = useState({ key: '', value: '' })
  const [restrictionsToggler, setRestrictionsToggler] = useState({})
  const [dateTimeInput, setDateTimeInput] = useState(initDateTimeInput)
  const myRef = useRef(null)
  const formEl = useRef(null)
  const initialValue = { domainaddress: [] }
  const router = useRouter()

  const getDomainData = async () => {
    const res = await fetch('/api/domain/' + passedDomain._id, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.status === 200) {
      const data = await res.json()
      return { data, error: null }
    } else {
      return { data: null, error: 'something went wrong' }
    }
  }

  // const getClients = async () => {
  //   const data = await fetch('/api/clients', {
  //     method: 'GET',
  //   })
  //   return await data.json()
  // }

  useEffect(async () => {
    if (passedDomain) {
      setLoading && setLoading(true)

      // can add another call here like get client
      const responses = await Promise.all([getDomainData()])

      const res = responses[0]

      if (!res.error) {
        setDomain(res.data.domain)
        setDomainData(res.data.domain)
        if (res.data.domain?.restrictions) {
          const blankArr = Array(res.data.domain?.restrictions?.length).fill('')
          setDateTimeInput({
            startDate: [...blankArr],
            startTime: [...blankArr],
            endDate: [...blankArr],
            endTime: [...blankArr],
            dateError: [...blankArr],
            timeError: [...blankArr],
          })
        }
      }

      setLoading && setLoading(false)
    } else {
      setDomainData((state) => ({ ...state, aliases: [] }))
    }
  }, [])

  useEffect(() => {
    validate(validateKeyValue.key)
  }, [validateKeyValue])

  useEffect(() => {
    validate('aliases')
  }, [domainData?.aliases])

  const handleChange = (key) => (e) => {
    if (key === 'url') {
      const ignoreProtocol = /[a-z]+:\/\//
      setDomainData((state) => ({ ...state, [key]: e.target.value.replace(ignoreProtocol, '') }))
    } else {
      setDomainData((state) => ({ ...state, [key]: e.target.value }))
    }
  }

  const handleEmailChange = (e) => {
    setDomainData((state) => ({
      ...state,
      emails: [{ name: 'main', address: e.target.value, from: e.target.value, to: e.target.value }],
    }))
  }

  const toggleHandler = (key) => (e) => {
    setDomainData((state) => ({ ...state, [key]: e.target.checked }))
  }

  const handleDelete = async () => {
    setLoading(true)
    const { _id } = domainData
    const res = await fetch('/api/domains', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id }),
    })
    if (res.status === 202) {
      handleClose({ reason: 'update' })
    } else {
      const jsonRes = await res.json()
      setErrorMsg(jsonRes.error)
      setLoading(false)
    }
  }

  const updatedProductRestrictions = (domainData) => {
    const restrictions = [...domainData.restrictions]
    const productRestrictions = domainData?.products?.map((product) => {
      if (product.appliedRestrictions) {
        const tempProductRestrictions = product.appliedRestrictions
          .map((restriction) => {
            return restrictions.find((r) => r.name === restriction.name) || null
          })
          .filter(Boolean)
        product.appliedRestrictions = tempProductRestrictions
      }
      return product
    })

    return productRestrictions
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = { ...domainData }

    if (data && data.restrictions) {
      data.products = updatedProductRestrictions(data)
    }

    if (validate() == true) {
      if (!isEqual(domain, data)) {
        // console.log('inside ===>', data)
        setLoading(true)
        const res = await fetch('/api/domains', {
          method: domain ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        // const hi = await res.json()
        // console.log('result ===>', hi)

        if (res.status === 201 || res.status === 200) {
          handleClose({ reason: 'update' })
        } else {
          const jsonRes = await res.json()
          setErrorMsg(jsonRes.error)
          myRef.current.scrollIntoView({ behavior: 'smooth' })
        }
        setLoading(false)
      } else {
        handleClose({ reason: 'justClose' })
      }
    }
  }

  const handleDomainAliasAdd = () => {
    setDomainData((state) => ({ ...state, aliases: [...state.aliases, ''] }))
  }

  function hasEmptyValInArray(passedArray) {
    for (let i = 0; i < passedArray.length; i++) {
      if (!passedArray[i]) {
        return true
      }
    }
    return false
  }

  function hasDuplicates(passedArray) {
    const array = [...passedArray.filter((x) => x != '')]
    var valuesSoFar = Object.create(null)
    for (var i = 0; i < array.length; ++i) {
      var value = array[i]
      if (value in valuesSoFar) {
        return true
      }
      valuesSoFar[value] = true
    }
    return false
  }

  const validate = (key = 'all') => {
    let count = 0
    const regex = /^(.+)@(.+)$/
    if (key == 'all' || key == 'name') {
      if (!isValidValue(domainData.name)) {
        setFormErrors((state) => ({ ...state, ['name']: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['name']: '' }))
      }
    }
    if (key == 'all' || key == 'url') {
      const urlValue = domainData.url
      if (!isValidValue(urlValue)) {
        setFormErrors((state) => ({ ...state, ['url']: 'This field is required' }))
        count = count + 1
      } else if (!isURL(urlValue)) {
        setFormErrors((state) => ({ ...state, ['url']: 'No valid URL provided' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['url']: '' }))
      }
    }

    if (key == 'all' || key == 'email') {
      const emailValue = domainData?.emails?.[0]?.address
      if (!isValidValue(emailValue)) {
        setFormErrors((state) => ({ ...state, ['email']: 'This field is required' }))
        count = count + 1
      } else if (!regex.test(emailValue)) {
        setFormErrors((state) => ({ ...state, ['email']: 'Invalid email format' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['email']: '' }))
      }
    }

    if (key == 'all' || key == 'aliases') {
      if (domainData?.aliases?.length > 0 && hasDuplicates(domainData.aliases)) {
        setFormErrors((state) => ({ ...state, ['aliases']: ' Duplicate domain aliases not allowed' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['aliases']: '' }))
      }
    }

    if (key == 'all' || key == 'restrictions') {
      const restrictionNames = domainData?.restrictions?.map((r) => r.name) || []
      if (domainData?.restrictions?.length > 0 && hasDuplicates(restrictionNames)) {
        setFormErrors((state) => ({ ...state, ['restrictions']: 'Duplicate domain restrictions not allowed' }))
        count = count + 1
      } else if (domainData?.restrictions?.length > 0 && hasEmptyValInArray(restrictionNames)) {
        setFormErrors((state) => ({ ...state, ['restrictions']: 'Domain restriction without name not allowed' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['restrictions']: '' }))
      }
    }
    setFormErrors((state) => ({ ...state, ['isValid']: count > 0 ? false : true }))
    return count > 0 ? false : true
  }

  //For toggling every restriction accordion
  const handleRestrictionsAccordion = (key) => {
    setRestrictionsToggler({
      ...restrictionsToggler,
      [key]: !restrictionsToggler[key],
    })
  }

  const deleteRestriction = (index, key) => async () => {
    let confirmed = await isConfirmed('Are you sure you want to delete this restriction?')
    if (confirmed) {
      const tempRestrictions = [...domainData.restrictions]
      const tempDateTimeInput = { ...dateTimeInput }
      tempRestrictions.splice(index, 1)
      for (let key in tempDateTimeInput) {
        tempDateTimeInput[key].splice(index, 1)
      }
      setDomainData({
        ...domainData,
        restrictions: tempRestrictions,
      })
      setRestrictionsToggler({
        ...restrictionsToggler,
        [key]: false,
      })
      setDateTimeInput(tempDateTimeInput)
    }
  }

  const addRestriction = () => {
    const tempRestrictions = domainData?.restrictions || []
    setDomainData({
      ...domainData,
      restrictions: [
        ...tempRestrictions,
        {
          name: '',
          dates: [],
          timings: [],
          weekDays: [],
        },
      ],
    })
    setDateTimeInput({
      startDate: [...dateTimeInput.startDate, ''],
      startTime: [...dateTimeInput.startTime, ''],
      endDate: [...dateTimeInput.endDate, ''],
      endTime: [...dateTimeInput.endTime, ''],
      dateError: [...dateTimeInput.dateError, ''],
      timeError: [...dateTimeInput.timeError, ''],
    })
  }

  const addDateRange = (index) => () => {
    const { startDate, endDate } = dateTimeInput
    if (startDate[index] && endDate[index]) {
      const dateIsValid = domainData.restrictions[index].dates.reduce((acc, cur) => {
        if (!acc) {
          return false
        }
        cur = cur.split('to')
        if (startDate[index] === cur[0].trim() || endDate[index] === cur[1].trim()) {
          return false
        } else if (
          new Date(startDate[index]).getTime() >= new Date(cur[0]).getTime() &&
          new Date(startDate[index]).getTime() <= new Date(cur[1]).getTime()
        ) {
          return false
        } else if (
          new Date(endDate[index]).getTime() >= new Date(cur[0]).getTime() &&
          new Date(endDate[index]).getTime() <= new Date(cur[1]).getTime()
        ) {
          return false
        }
        return true
      }, true)
      const tempDateTimeInput = { ...dateTimeInput }
      if (dateIsValid) {
        tempDateTimeInput.dateError.splice(index, 1, '')
        const modRestriction = {
          ...domainData.restrictions[index],
          dates: [...new Set([...domainData.restrictions[index].dates, `${startDate[index]} to ${endDate[index]}`])],
        }
        const tempRestrictions = [...domainData.restrictions]
        tempRestrictions.splice(index, 1, modRestriction)
        setDomainData({
          ...domainData,
          restrictions: tempRestrictions,
        })
      } else {
        tempDateTimeInput.dateError.splice(index, 1, 'Date range conflicts! Try different combination.')
      }
      tempDateTimeInput.startDate.splice(index, 1, '')
      tempDateTimeInput.endDate.splice(index, 1, '')
      setDateTimeInput(tempDateTimeInput)
    }
  }

  const addTimeRange = (index) => () => {
    const { startTime, endTime } = dateTimeInput
    if (startTime[index] && endTime[index]) {
      const timeIsValid = domainData.restrictions[index].timings.reduce((acc, cur) => {
        if (!acc) {
          return false
        }
        cur = cur.split('to')
        if (startTime[index] === cur[0].trim() || endTime[index] === cur[1].trim()) {
          return false
        } else if (startTime[index] >= cur[0].trim() && startTime[index] <= cur[1].trim()) {
          return false
        } else if (endTime[index] >= cur[0].trim() && endTime[index] <= cur[1].trim()) {
          return false
        }
        return true
      }, true)
      const tempDateTimeInput = { ...dateTimeInput }
      if (timeIsValid) {
        tempDateTimeInput.timeError.splice(index, 1, '')
        const modRestriction = {
          ...domainData.restrictions[index],
          timings: [
            ...new Set([...domainData.restrictions[index].timings, `${startTime[index]} to ${endTime[index]}`]),
          ],
        }
        const tempRestrictions = [...domainData.restrictions]
        tempRestrictions.splice(index, 1, modRestriction)
        setDomainData({
          ...domainData,
          restrictions: tempRestrictions,
        })
      } else {
        tempDateTimeInput.timeError.splice(index, 1, 'Time range conflicts! Try different combination.')
      }
      tempDateTimeInput.startTime.splice(index, 1, '')
      tempDateTimeInput.endTime.splice(index, 1, '')
      setDateTimeInput(tempDateTimeInput)
    }
  }

  return (
    <>
      <Formik innerRef={formEl} initialValues={initialValue}>
        <form id={`domain-${domainData ? domainData._id : ''}-form`} onSubmit={handleSubmit}>
          <div className="m-8 main-wrapper">
            <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-1/2">
              <div className="flex justify-between pb-2 border-b border-black border-solid">
                <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Domain Detail</h1>
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
                {errorMsg ? (
                  <div ref={myRef} className="flex flex-wrap -mx-4 text-left">
                    <div className="w-full px-4 text-red-500 sm:w-2/2">{errorMsg}</div>
                  </div>
                ) : null}

                <div className="flex flex-wrap -mx-4 text-left">
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mt-4 mb-2">{domainData?.name ? 'Change name' : 'Name'}</h2>
                    <Input
                      type="text"
                      id="name"
                      variant={formErrors?.name ? 'danger' : 'primary'}
                      placeholder="Name"
                      value={domainData?.name || ''}
                      onChange={handleChange('name')}
                      onBlur={(e) => {
                        setValidateKeyValue({ key: 'name', value: e.target.value })
                      }}
                    />
                    <span className="text-red-500">{formErrors?.name}</span>
                  </div>
                </div>

                <div className="flex flex-wrap -mx-4 text-left">
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mt-4 mb-2">{domainData?.url ? 'Change url' : 'Url'}</h2>
                    <Input
                      id="url"
                      value={domainData?.url || ''}
                      variant={formErrors?.url ? 'danger' : 'primary'}
                      onChange={handleChange('url')}
                      onBlur={(e) => {
                        setValidateKeyValue({ key: 'url', value: e.target.value })
                      }}
                      type="text"
                      placeholder="Url"
                    />
                    <span className="text-red-500">{formErrors?.url}</span>
                  </div>

                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mt-4 mb-2">{domainData?.email ? 'Change email' : 'Email'}</h2>
                    <Input
                      variant={formErrors?.email ? 'danger' : 'primary'}
                      id="email"
                      value={domainData?.emails?.[0]?.address || ''}
                      onChange={handleEmailChange}
                      onBlur={(e) => {
                        setValidateKeyValue({ key: 'email', value: e.target.value })
                      }}
                      type="text"
                      placeholder="Email"
                    />
                    <span className="text-red-500">{formErrors?.email}</span>
                  </div>
                </div>

                {domainData?.addresses?.length > 0 && (
                  <div className="mt-5">
                    <OrderListSelection
                      values={domainData?.addresses || []}
                      onChange={(data) => {
                        setDomainData((state) => ({ ...state, addressItems: data }))
                      }}
                    />
                  </div>
                )}

                <div className="flex flex-wrap -mx-4 text-left toggle-popup">
                  <div className="w-full px-4 lg:w-1/2">
                    <div className="flex">
                      <div className="flex items-center">
                        <Input
                          type="toggle"
                          id="status"
                          variant="primary"
                          checked={(domainData && domainData.status) || false}
                          onChange={toggleHandler('status')}
                        />
                        <h2 className="mx-2 my-4">Status</h2>
                      </div>
                    </div>
                  </div>
                </div>

                {domain && domainData && (
                  <div className="p-4 mb-4 text-left border border-gray-300 rounded-lg">
                    <h2 className="text-xl text-center">Configuration</h2>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mr-4"
                      onClick={() => router.push(`/admin/domains/config/rooms/${domainData._id}`)}
                    >
                      Rooms
                      <img className="inline-block ml-2 cursor-pointer" src="/images/setting.svg" alt="Amenities" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mr-4"
                      onClick={() => router.push(`/admin/domains/config/styles/${domainData._id}`)}
                    >
                      Styles
                      <img className="inline-block ml-2 cursor-pointer" src="/images/setting.svg" alt="Amenities" />
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap -mx-4 text-left">
                  <div className="w-full px-4 lg:w-2/2">
                    <div className="w-full p-4 border border-gray-300 rounded-lg">
                      <h2 className="mb-2">Domain Aliases</h2>
                      <div className="w-full lg:w-3/3">
                        <div className="mb-2">
                          {domainData?.aliases &&
                            domainData?.aliases.map((item, i) => (
                              <div key={i} className="mb-2">
                                <div className="inline-block w-4/5">
                                  <Input
                                    type="text"
                                    variant="primary"
                                    placeholder="Alias"
                                    onBlur={() => {
                                      validate('aliases')
                                    }}
                                    value={item || ''}
                                    onChange={(e) => {
                                      let newArr = [...domainData.aliases]
                                      newArr[i] = e.target.value
                                      setDomainData((state) => ({ ...state, aliases: newArr }))
                                    }}
                                  />
                                </div>

                                <Button
                                  className="inline-block mx-3 cursor-pointer "
                                  onClick={() => {
                                    setDomainData((state) => ({
                                      ...state,
                                      aliases: [...state.aliases.filter((x, xIndex) => xIndex !== i)],
                                    }))
                                  }}
                                >
                                  <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Products" />
                                </Button>
                              </div>
                            ))}
                        </div>
                        {formErrors?.aliases && (
                          <span className="inline-block w-4/5 mb-2 text-red-500">{formErrors?.aliases} </span>
                        )}

                        <Button variant="primary" type="button" onClick={handleDomainAliasAdd}>
                          {domainData?.aliases?.length > 0 ? 'Add another domain alias' : 'Add domain alias'}
                          <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap mt-4 -mx-4 text-left">
                  <div className="w-full px-4 lg:w-2/2">
                    <div className="w-full p-4 border border-gray-300 rounded-lg">
                      <h2 className="mb-2">Access Restrictions</h2>
                      <div className="w-full lg:w-3/3">
                        {(domainData?.restrictions || []).map((restriction, index) => (
                          <StaticListComposition
                            key={`Restriction-${index + 1}`}
                            header={`Restriction-${index + 1}`}
                            path={`restriction[${index}]`}
                            accordion={restrictionsToggler}
                            handleAccordion={handleRestrictionsAccordion}
                            onDelete={deleteRestriction(index, `restriction[${index}]`)}
                          >
                            <div className={`${!restrictionsToggler[`restriction[${index}]`] && 'hidden'}`}>
                              <div>
                                <h4 className="mb-3 font-medium">Name of restriction:</h4>
                                <input
                                  type="text"
                                  value={restriction?.name || ''}
                                  className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline"
                                  onChange={(e) => {
                                    const tempRestrictions = [...domainData.restrictions]
                                    tempRestrictions[index]['name'] = e.target.value
                                    setDomainData({
                                      ...domainData,
                                      restrictions: tempRestrictions,
                                    })
                                  }}
                                />
                              </div>
                              <div>
                                <h4 className="mt-6 mb-3 font-medium">Restricted Date Ranges:</h4>
                                <div className="flex">
                                  <span>
                                    <label htmlFor={`startDate-${index}`}>From date</label>
                                    <input
                                      id={`startDate-${index}`}
                                      type="date"
                                      min={DATE_TODAY}
                                      value={dateTimeInput.startDate[index] || ''}
                                      className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline"
                                      onChange={(e) => {
                                        const tempDateTimeInput = { ...dateTimeInput }
                                        tempDateTimeInput.startDate.splice(index, 1, e.target.value)
                                        tempDateTimeInput.endDate.splice(index, 1, '')
                                        setDateTimeInput(tempDateTimeInput)
                                      }}
                                      onBlur={() => {
                                        const tempDateTimeInput = { ...dateTimeInput }
                                        tempDateTimeInput.dateError.splice(index, 1, '')
                                        setDateTimeInput(tempDateTimeInput)
                                      }}
                                    />
                                  </span>
                                  <span className="mx-3">
                                    <label htmlFor={`endDate-${index}`}>To date</label>
                                    <input
                                      id={`endDate-${index}`}
                                      type="date"
                                      disabled={!dateTimeInput.startDate[index]}
                                      min={dateTimeInput.startDate[index]}
                                      value={dateTimeInput.endDate[index] || ''}
                                      className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline"
                                      onChange={(e) => {
                                        const tempDateTimeInput = { ...dateTimeInput }
                                        tempDateTimeInput.endDate.splice(index, 1, e.target.value)
                                        setDateTimeInput(tempDateTimeInput)
                                      }}
                                      onBlur={() => {
                                        const tempDateTimeInput = { ...dateTimeInput }
                                        tempDateTimeInput.dateError.splice(index, 1, '')
                                        setDateTimeInput(tempDateTimeInput)
                                      }}
                                    />
                                  </span>
                                  <span>
                                    <Button
                                      disabled={!dateTimeInput.startDate[index] || !dateTimeInput.endDate[index]}
                                      onClick={addDateRange(index)}
                                      variant="primary"
                                      type="button"
                                      className="mt-7"
                                    >
                                      Add
                                      <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                                    </Button>
                                  </span>
                                </div>
                                {dateTimeInput.dateError[index] && (
                                  <p className="text-red-700">{dateTimeInput.dateError[index]}</p>
                                )}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {restriction.dates.map((date, i) => (
                                    <span
                                      key={`${date}-${i}`}
                                      className="px-2 py-1 text-sm text-center text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg"
                                    >
                                      {date}
                                      <img
                                        className="inline-block ml-2 cursor-pointer text-[#000000]"
                                        src="/images/clear.png"
                                        width="18px"
                                        alt="Products"
                                        onClick={() => {
                                          const tempRestrictions = [...domainData.restrictions]
                                          const tempDates = [...restriction.dates]
                                          tempDates.splice(i, 1)
                                          tempRestrictions[index] = {
                                            ...tempRestrictions[index],
                                            dates: tempDates,
                                          }
                                          setDomainData({
                                            ...domainData,
                                            restrictions: tempRestrictions,
                                          })
                                        }}
                                      />
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="mt-6 mb-3 font-medium">Restricted Time Ranges:</h4>
                                <div className="flex">
                                  <span>
                                    <label htmlFor={`startTime-${index}`}>From time</label>
                                    <input
                                      id={`startTime-${index}`}
                                      type="time"
                                      value={dateTimeInput.startTime[index] || ''}
                                      className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline"
                                      onChange={(e) => {
                                        const tempDateTimeInput = { ...dateTimeInput }
                                        tempDateTimeInput.startTime.splice(index, 1, e.target.value)
                                        tempDateTimeInput.endTime.splice(index, 1, '')
                                        setDateTimeInput(tempDateTimeInput)
                                      }}
                                      onBlur={() => {
                                        const tempDateTimeInput = { ...dateTimeInput }
                                        tempDateTimeInput.timeError.splice(index, 1, '')
                                        setDateTimeInput(tempDateTimeInput)
                                      }}
                                    />
                                  </span>
                                  <span className="mx-3">
                                    <label htmlFor={`endTime-${index}`}>To time</label>
                                    <input
                                      id={`endTime-${index}`}
                                      type="time"
                                      disabled={!dateTimeInput.startTime[index]}
                                      value={dateTimeInput.endTime[index] || ''}
                                      className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline"
                                      onChange={(e) => {
                                        const [endTimeHH, endTimeMM] = e.target.value.split(':')
                                        const [startTimeHH, startTimeMM] = dateTimeInput.startTime[index].split(':')
                                        if (
                                          parseInt(endTimeHH) === parseInt(startTimeHH) &&
                                          parseInt(endTimeMM) <= parseInt(startTimeMM)
                                        ) {
                                          return
                                        } else if (parseInt(endTimeHH) < parseInt(startTimeHH)) {
                                          return
                                        }
                                        const tempDateTimeInput = { ...dateTimeInput }
                                        tempDateTimeInput.endTime.splice(index, 1, e.target.value)
                                        setDateTimeInput(tempDateTimeInput)
                                      }}
                                      onBlur={() => {
                                        const tempDateTimeInput = { ...dateTimeInput }
                                        tempDateTimeInput.timeError.splice(index, 1, '')
                                        setDateTimeInput(tempDateTimeInput)
                                      }}
                                    />
                                  </span>
                                  <span>
                                    <Button
                                      disabled={!dateTimeInput.startTime[index] || !dateTimeInput.endTime[index]}
                                      onClick={addTimeRange(index)}
                                      variant="primary"
                                      type="button"
                                      className="mt-7"
                                    >
                                      Add
                                      <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                                    </Button>
                                  </span>
                                </div>
                                {dateTimeInput.timeError[index] && (
                                  <p className="text-red-700">{dateTimeInput.timeError[index]}</p>
                                )}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {restriction.timings.map((time, i) => (
                                    <span
                                      key={`${time}-${i}`}
                                      className="px-2 py-1 text-sm text-center text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg"
                                    >
                                      {time}
                                      <img
                                        className="inline-block ml-2 cursor-pointer text-[#000000]"
                                        src="/images/clear.png"
                                        width="18px"
                                        alt="Products"
                                        onClick={() => {
                                          const tempRestrictions = [...domainData.restrictions]
                                          const tempTimings = [...restriction.timings]
                                          tempTimings.splice(i, 1)
                                          tempRestrictions[index] = {
                                            ...tempRestrictions[index],
                                            timings: tempTimings,
                                          }
                                          setDomainData({
                                            ...domainData,
                                            restrictions: tempRestrictions,
                                          })
                                        }}
                                      />
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="mt-6 mb-3 font-medium">Restricted Days Of Week:</h4>
                                <div className="flex justify-between">
                                  {WEEK_DAYS.map((day) => (
                                    <span key={`${day}-${index}`} className="flex items-center gap-2">
                                      <input
                                        id={`${day}-${index}`}
                                        value={day}
                                        type="checkbox"
                                        className="cursor-pointer"
                                        checked={restriction.weekDays.includes(day)}
                                        onChange={(e) => {
                                          const { checked } = e.target
                                          const tempRestrictions = [...domainData.restrictions]
                                          if (checked) {
                                            const weekDays = [...tempRestrictions[index].weekDays]
                                            weekDays.push(day)
                                            tempRestrictions[index] = {
                                              ...tempRestrictions[index],
                                              weekDays,
                                            }
                                            setDomainData({
                                              ...domainData,
                                              restrictions: tempRestrictions,
                                            })
                                          } else {
                                            const weekDays = [...tempRestrictions[index].weekDays]
                                            weekDays.splice(weekDays.indexOf(day), 1)
                                            tempRestrictions[index] = {
                                              ...tempRestrictions[index],
                                              weekDays,
                                            }
                                            setDomainData({
                                              ...domainData,
                                              restrictions: tempRestrictions,
                                            })
                                          }
                                        }}
                                      />
                                      <label htmlFor={`${day}-${index}`} className="cursor-pointer select-none">
                                        {day}
                                      </label>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </StaticListComposition>
                        ))}
                        {formErrors?.restrictions && (
                          <span className="inline-block w-4/5 mb-2 text-red-500">{formErrors?.restrictions} </span>
                        )}
                        <Button onClick={addRestriction} variant="primary" type="button">
                          Add Restriction
                          <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                {domain && (
                  <div className="-mx-4 ">
                    <div className="w-full px-4 mt-5 sm:w-2/2">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={async () => {
                          let confirmed = await isConfirmed('Are you sure to delete this domain')
                          if (confirmed) {
                            handleDelete()
                          }
                        }}
                      >
                        Delete domain
                      </Button>
                    </div>
                  </div>
                )}
                <div className="-mx-4 ">
                  <div className="w-full px-4 mt-5 sm:w-2/2">
                    {/* {domain && domainData && (
                      <Button
                        type="button"
                        variant="primary"
                        className="mr-4"
                        onClick={() => router.push(`/admin/domains/config/${domainData._id}`)}
                      >
                        Config
                      </Button>
                    )} */}
                    <Button form={`domain-${domainData ? domainData._id : ''}-form`} type="submit" variant="primary">
                      {domain ? 'Update domain' : 'Create domain'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Formik>
    </>
  )
}

export default EditDomain