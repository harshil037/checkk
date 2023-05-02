import React, { useState, useEffect, useRef } from 'react'
import { slugify } from '../../lib/utils'
import Domain from './domain'
import { useDomains } from '../../lib/hooks'
import { Input } from '../componentLibrary'
import Button from '../common/Button'
import StaticListComposition from '../../components/shared/staticListComposition'
import SingleRow from '../../components/shared/singleRow'
import { v4 as uuidv4 } from 'uuid'

import { isValidValue } from '../../lib/utils'
import isURL from 'validator/lib/isURL'

const EditClient = ({ client, handleClose, setLoading, isConfirmed }) => {
  const [errorMsg, setErrorMsg] = useState('')
  const [clientData, setClientData] = useState(
    client ? { ...client, domains: client.domains ? [...client.domains] : [] } : { domains: [] },
  )
  const [clientDataSourcesArr, setClientDataSourcesArr] = useState({})
  const [lockDataSources, setLockDataSources] = useState({})
  const [domains, { mutate: domainsMutate }] = useDomains()
  const [freeDomains, setFreeDomains] = useState(domains || [])
  const [formErrors, setFormErrors] = useState({ isValid: false })
  const [validateKeyValue, setValidateKeyValue] = useState({ key: '', value: '' })
  const myRef = useRef(null)
  const [accordion, setAccordion] = useState({ address: false })
  const [languages, setLanguages] = useState(client?.languages || ['de', 'it', 'en'])
  const [defaultLanguage, setDefaultLanguage] = useState('de')
  const [addLanguage, setAddLanguage] = useState()
  const [addresses, setAddress] = useState([])

  const domainObject = (_id) => {
    const domain = domains.find((d) => d._id === _id)
    return domain || { url: '' }
  }

  useEffect(() => {
    if (client?.addresses) {
      const propertyNames = Object.keys(client?.addresses)
      const propertyValues = Object.values(client?.addresses)
      const addArr = []
      for (let index = 0; index < propertyNames.length; index++) {
        addArr.push({ name: propertyNames[index], value: propertyValues[index] })
      }
      setAddress(addArr)
    }
    setAccordion((prevState) => {
      return { ...prevState, ['address']: true }
    })
  }, [])

  const handleAccordion = (path, index = null) => {
    let accObj = { ...accordion }
    let result = Object.keys(accObj).filter((k) => k.includes(path))
    let accKey = index !== null ? `${path}[${index}]` : `${path}`

    setAccordion((prevState) => {
      return { ...prevState, [accKey]: !prevState[accKey] }
    })
  }

  useEffect(() => {
    validate(validateKeyValue.key)
  }, [validateKeyValue])

  const handleChange = (key) => (e) => {
    setClientData((state) => ({ ...state, [key]: e.target.value }))
  }

  const handleContactChange = (key) => (e) => {
    setClientData((state) => ({ ...state, contact: { ...state.contact, [key]: e.target.value } }))
  }

  const handleDomainAdd = () => {
    setClientData((state) => ({ ...state, domains: [...state.domains, ''] }))
  }

  const toggleHandler = (key) => (e) => {
    setClientData((state) => ({ ...state, [key]: e.target.checked }))
  }

  const handleDelete = async () => {
    setLoading(true)
    const { _id } = clientData
    const res = await fetch('/api/clients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id }),
    })
    if (res.status === 202) {
      handleClose({ reason: 'update' })
    } else {
      setLoading(false)
      const jsonRes = await res.json()
      setErrorMsg(jsonRes.error)
    }
  }

  const updateDataSources = async () => {
    const clientNumber = clientData?.clientNumber

    for (let domainIndex = 0; domainIndex < domains.length; domainIndex++) {
      const domain = domains[domainIndex]
      const ignoreProtocol = /[a-z]+:\/\//
      const url = domain.url.replace(ignoreProtocol, '')
      const slug = slugify(url)
      const clientDataSources =
        clientData?.dataSources?.[slug] && Object.entries(clientData.dataSources[slug]).map(([key]) => key)

      if (clientDataSources) {
        for (let clientDataSourceIndex = 0; clientDataSourceIndex < clientDataSources.length; clientDataSourceIndex++) {
          const ds = clientDataSources[clientDataSourceIndex]
          const findSource = clientDataSourcesArr?.[slug]?.find((c) => {
            const [entry] = Object.entries(c)
            return entry[0] === ds
          })
          if (!findSource) {
            const url = `/api/datasource/${ds}/${clientNumber}`
            await fetch(url, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json', DataSource: domain.url },
            })
          }
        }
      }
      if (clientDataSourcesArr[slug]) {
        for (let dataSourceIndex = 0; dataSourceIndex < clientDataSourcesArr[slug].length; dataSourceIndex++) {
          const [entry] = Object.entries(clientDataSourcesArr[slug][dataSourceIndex])
          if (entry) {
            const url = `/api/datasource/${entry[0]}/${clientNumber}`
            const body = entry[1].reduce((acc, item) => {
              const [itemEntry] = Object.entries(item)
              return itemEntry[0] ? { ...acc, [itemEntry[0]]: itemEntry[1] } : { ...acc }
            }, {})

            await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', DataSource: domain.url },
              body: JSON.stringify(body),
            })
          }
        }
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate() == true) {
      setLoading(true)
      const { dataSources, ...rest } = clientData
      //const passData = { languages, rest }
      rest.languages = languages
      rest.addresses = addresses.reduce((abc, xyz) => ({ ...abc, [xyz.name]: xyz.value }), {})

      const res = await fetch('/api/clients', {
        method: client ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest),
      })
      if (res.status === 201 || res.status === 200) {
        await updateDataSources()
        handleClose({ reason: 'update' })
      } else {
        setLoading(false)
        const jsonRes = await res.json()
        setErrorMsg(jsonRes.error)
        myRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // handleClose({ reason: 'justClose' })
    }
  }

  const fetchDataSources = async (domain, key, clientNumber, abortController) => {
    const res = await fetch(`/api/datasource/${key}/${clientNumber}`, {
      method: 'GET',
      signal: abortController.signal,
      headers: { 'Content-Type': 'application/json', DataSource: domain },
    })
    return res.json()
  }

  useEffect(() => {
    const abortController = new AbortController()
    const clientDomains = clientData.domains
    domains && setFreeDomains(domains.filter((d) => !clientDomains.includes(d._id)))
    clientData.dataSources &&
      domains &&
      Object.entries(clientData.dataSources).forEach(([key, value]) => {
        Object.entries(value).forEach(([k, v]) => {
          const d = domains.find((domain) => {
            const ignoreProtocol = /[a-z]+:\/\//
            const url = domain.url.replace(ignoreProtocol, '')
            const slug = slugify(url)
            return slug === key
          })
          d &&
            fetchDataSources(d.url, k, clientData.clientNumber, abortController).then((data) => {
              !lockDataSources[key] &&
                setClientDataSourcesArr((state) => {
                  const newState = {
                    ...state,
                    [key]: state[key]
                      ? [
                          ...state[key],
                          {
                            [k]: Object.entries(data).reduce((acc, [dk, dv]) => {
                              return dk !== '_id' ? [...acc, { [dk]: dv }] : [...acc]
                            }, []),
                          },
                        ].sort((a, b) => {
                          const [entryA] = Object.entries(a)
                          const [entryB] = Object.entries(b)
                          return entryA[0].localeCompare(entryB[0])
                        })
                      : [
                          {
                            [k]: Object.entries(data).reduce((acc, [dk, dv]) => {
                              return dk !== '_id' ? [...acc, { [dk]: dv }] : [...acc]
                            }, []),
                          },
                        ].sort((a, b) => {
                          const [entryA] = Object.entries(a)
                          const [entryB] = Object.entries(b)
                          return entryA[0].localeCompare(entryB[0])
                        }),
                  }
                  return newState
                })

              return setLockDataSources((state) => ({ ...state, [key]: true }))
            })
        })
      })
    return () => {
      abortController.abort()
    }
  }, [clientData, domains])

  const validate = (key = 'all') => {
    let count = 0
    if (key == 'all' || key == 'name') {
      if (!isValidValue(clientData.name)) {
        setFormErrors((state) => ({ ...state, ['name']: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['name']: '' }))
      }
    }
    if (key == 'all' || key == 'clientNumber') {
      const urlValue = clientData.clientNumber
      if (!isValidValue(urlValue)) {
        setFormErrors((state) => ({ ...state, ['clientNumber']: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['clientNumber']: '' }))
      }
    }

    if (key == 'all' || key == 'email') {
      const regex = /^(.+)@(.+)$/
      const emailValue = clientData?.contact?.email
      if (!!isValidValue(emailValue) && !regex.test(emailValue)) {
        setFormErrors((state) => ({ ...state, ['email']: 'Invalid email format' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['email']: '' }))
      }
    }

    if (key == 'all' || key == 'url') {
      const urlValue = clientData?.contact?.url
      if (isValidValue(urlValue) && !isURL(urlValue)) {
        setFormErrors((state) => ({ ...state, ['url']: 'No valid website provided' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['url']: '' }))
      }
    }

    if (key.includes('address')) {
      const arr = key.split(',')
      if (addresses.filter((item, filterIndex) => filterIndex == arr[1] && item.name == '').length) {
        count = count + 1
        setFormErrors((state) => ({ ...state, [`address.name[${parseInt(arr[1])}]`]: 'this field is required' }))
      } else {
        setFormErrors((state) => ({ ...state, [`address.name[${parseInt(arr[1])}]`]: '' }))
      }
    } else if (key == 'all') {
      addresses.map((item, filterIndex) => {
        if (item.name == '') {
          count = count + 1
          setFormErrors((state) => ({ ...state, [`address.name[${filterIndex}]`]: 'this field is required' }))
        }
        return item
      })
    }

    setFormErrors((state) => ({ ...state, ['isValid']: count > 0 ? false : true }))
    return count > 0 ? false : true
  }

  const setAddressState = (index, key, value) => {
    setAddress(
      addresses.map((item, mapIndex) => {
        if (mapIndex == index) {
          item['value'][key]?.[defaultLanguage] = value
        }
        return item
      }),
    )
  }

  return (
    <form id={`client-${clientData ? clientData._id : ''}-form`} onSubmit={handleSubmit}>
      <div className="m-8 main-wrapper">
        <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-4/5">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Client Detail</h1>
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
            {' '}
            {errorMsg ? (
              <div ref={myRef} className="flex flex-wrap -mx-4 text-left">
                <div className="w-full px-4 text-red-500 sm:w-1/2">{errorMsg}</div>
              </div>
            ) : null}
            <div className="flex flex-wrap -mx-4 text-left">
              <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{clientData?.name ? 'Change name' : 'Name'}</h2>
                <Input
                  type="text"
                  id="name"
                  variant={formErrors?.name ? 'danger' : 'primary'}
                  placeholder="Name"
                  value={clientData?.name || ''}
                  onChange={handleChange('name')}
                  onBlur={(e) => {
                    setValidateKeyValue({ key: 'name', value: e.target.value })
                  }}
                />
                <span className="text-red-500">{formErrors?.name}</span>
              </div>
              <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{clientData?.clientNumber ? 'Change client ID' : 'Client ID'}</h2>
                <Input
                  id="clientNumber"
                  value={clientData?.clientNumber || ''}
                  onChange={handleChange('clientNumber')}
                  onBlur={(e) => {
                    setValidateKeyValue({ key: 'clientNumber', value: e.target.value })
                  }}
                  type="text"
                  variant={formErrors?.clientNumber ? 'danger' : 'primary'}
                  placeholder="Client ID"
                  autoComplete="off"
                />
                <span className="text-red-500">{formErrors?.clientNumber}</span>
              </div>
            </div>
            <div className="flex flex-wrap -mx-4 text-left">
              <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{clientData?.contact?.email ? 'Change email' : 'Email'}</h2>
                <Input
                  id="email"
                  type="email"
                  variant={formErrors?.email ? 'danger' : 'primary'}
                  placeholder="Email"
                  value={clientData?.contact?.email || ''}
                  onChange={handleContactChange('email')}
                  onBlur={(e) => {
                    setValidateKeyValue({ key: 'email', value: e.target.value })
                  }}
                />
                <span className="text-red-500">{formErrors?.email}</span>
              </div>
              <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{clientData?.contact?.phone ? 'Change phone number' : 'Phone number'}</h2>
                <Input
                  value={clientData?.contact?.phone || ''}
                  onChange={handleContactChange('phone')}
                  type="text"
                  variant="primary"
                  placeholder="Phone number"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-4 text-left">
              <div className="w-full px-4 sm:w-2/2">
                <h2 className="mt-4 mb-2">{clientData?.contact?.url ? 'Change website' : 'Website'}</h2>
                <Input
                  type="text"
                  variant={formErrors?.url ? 'danger' : 'primary'}
                  placeholder="website"
                  value={clientData?.contact?.url || ''}
                  onChange={handleContactChange('url')}
                  onBlur={(e) => {
                    setValidateKeyValue({ key: 'url', value: e.target.value })
                  }}
                />
                <span className="text-red-500">{formErrors?.url}</span>
              </div>
            </div>
            <div className="flex flex-wrap -mx-4 text-left toggle-popup">
              <div className="w-full px-4 sm:w-1/2">
                <div className="flex px-2 py-1">
                  <div className="flex items-center">
                    <Input
                      type="toggle"
                      variant="primary"
                      id="status"
                      checked={(clientData && clientData.status) || false}
                      onChange={toggleHandler('status')}
                    />
                    <h2 className="my-4">Status</h2>
                  </div>
                </div>
              </div>
            </div>
            <SingleRow>
              <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{addLanguage ? 'Add Language' : 'Language'}</h2>
                <div className="flex flex-wrap md:flex-nowrap">
                  <div className="w-full sm:w-2/3">
                    <Input
                      type="text"
                      id="Language"
                      variant="primary"
                      value={addLanguage || ''}
                      onChange={(e) => {
                        setAddLanguage(e.target.value)
                      }}
                      placeholder="Add a language"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (addLanguage && addLanguage !== '') {
                        var tempLang = [...languages]
                        const found = tempLang.findIndex((element) => element === addLanguage)
                        if (found == -1) {
                          tempLang.push(addLanguage.toLowerCase())
                          setLanguages(tempLang)
                        }
                        setAddLanguage('')
                      }
                    }}
                    className="mt-4 ml-0 md:ml-2 md:mt-0"
                    variant="primary"
                    type="button"
                  >
                    Add Language
                    <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                  </Button>
                </div>
              </div>
            </SingleRow>
            <div className="flex flex-wrap -mx-4">
              {languages
                ? languages.map((val, i) => {
                    return (
                      <div className="px-4 mb-4" key={i}>
                        <div className="px-2 py-1 capitalize border border-gray-400 rounded-lg hover:border-gray-600 ">
                          <span className="flex p-1">
                            <span className="pr-7">{val.toUpperCase()}</span>
                            <img
                              onClick={(e) => {
                                if (val != 'de') {
                                  isConfirmed('are you sure, language based  address will get removed ').then(
                                    (confirm) => {
                                      if (confirm) {
                                        e.preventDefault()
                                        var languageArry = [...languages]
                                        const langIndex = languageArry.findIndex((x) => x === val)
                                        if (langIndex > -1) {
                                          languageArry.splice(langIndex, 1)
                                        }
                                        setLanguages(languageArry)
                                        setAddress(
                                          addresses.map((item, mapIndex) => {
                                            item['value'] = Object.entries(item.value).reduce((accum1, [k1, v1]) => {
                                              delete v1?.[val]
                                              accum1[k1] = v1
                                              return accum1
                                            }, {})
                                            return item
                                          }),
                                        )
                                        if (val == defaultLanguage) {
                                          setDefaultLanguage('de')
                                        }
                                      }
                                    },
                                  )
                                }
                              }}
                              className="inline-block ml-auto cursor-pointer"
                              src="/images/langaugedelete.svg"
                              alt="Langauge Delete"
                            />
                          </span>
                        </div>
                      </div>
                    )
                  })
                : null}
            </div>
            <SingleRow>
              <div className="w-full px-4">
                <div className="p-4 border border-gray-300 border-solid rounded-xl">
                  <div className="flex flex-wrap items-center pb-2 mb-2 border-b border-black border-dashed sm:flex-nowrap">
                    <h3 className="text-lg font-semibold text-gray-800">Addresses</h3>
                    <div className="ml-auto cursor-pointer" onClick={() => handleAccordion('address')}>
                      <img
                        className={`inline-block  px-2 ${accordion['address'] && 'transform rotate-180'}`}
                        src="/images/select-list.svg"
                        alt="Status"
                      />
                    </div>
                  </div>
                  {accordion[`address`] &&
                    addresses.map((item, index) => {
                      return (
                        <StaticListComposition
                          key={index}
                          header={item.name != '' ? item.name : 'Address'}
                          path={`${`address`}[${index}]`}
                          accordion={accordion}
                          handleAccordion={() => {
                            handleAccordion('address', index)
                          }}
                          onDelete={(e) => {
                            let tempAdd = [...addresses]
                            tempAdd.splice(index, 1)
                            setAddress(tempAdd)
                            e.preventDefault()
                          }}
                        >
                          {accordion[`address[${index}]`] && (
                            <div>
                              <SingleRow>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">Name</h2>
                                  <Input
                                    value={item.name}
                                    type="text"
                                    variant={item.name ? 'primary' : 'danger'}
                                    placeholder="Name"
                                    onBlur={(e) => {
                                      setValidateKeyValue({ key: `address,${index}`, value: e.target.value })
                                    }}
                                    onChange={(e) => {
                                      setAddress(
                                        addresses.map((item, mapIndex) => {
                                          if (mapIndex == index) {
                                            item['name'] = e.target.value
                                          }
                                          return item
                                        }),
                                      )
                                    }}
                                  />
                                  <span className="text-red-500">{formErrors[`address.name[${index}]`]}</span>
                                </div>
                                <div className="w-full px-4 sm:w-1/2">
                                  <ul className="inline-flex flex-wrap w-full gap-4 pt-2 mt-5">
                                    {languages.map((item) => {
                                      return (
                                        <li
                                          onClick={() => {
                                            setDefaultLanguage(item)
                                          }}
                                          className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border ${
                                            item === defaultLanguage ? 'after:bg-primary-400' : 'after:bg-transparent'
                                          } rounded`}
                                          type="button"
                                        >
                                          <span className="px-4 lg:px-8 md:px-8">{item.toUpperCase()}</span>
                                        </li>
                                      )
                                    })}
                                  </ul>
                                </div>
                              </SingleRow>
                              <SingleRow>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">Title</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'title', e.target.value)
                                    }}
                                    value={item.value['title']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="Title"
                                  />
                                </div>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">Email</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'email', e.target.value)
                                    }}
                                    value={item.value['email']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="Email"
                                  />
                                </div>
                              </SingleRow>
                              <SingleRow>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">Street1</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'street1', e.target.value)
                                    }}
                                    value={item.value['street1']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="Street1"
                                  />
                                </div>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">Street2</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'street2', e.target.value)
                                    }}
                                    value={item.value['street2']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="Street2"
                                  />
                                </div>
                              </SingleRow>
                              <SingleRow>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">PostalCode</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'postalCode', e.target.value)
                                    }}
                                    value={item.value['postalCode']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="PostalCode"
                                  />
                                </div>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">Province</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'province', e.target.value)
                                    }}
                                    value={item.value['province']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="Province"
                                  />
                                </div>
                              </SingleRow>
                              <SingleRow>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">Region</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'region', e.target.value)
                                    }}
                                    value={item.value['region']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="Region"
                                  />
                                </div>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">Country</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'country', e.target.value)
                                    }}
                                    value={item.value['country']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="Country"
                                  />
                                </div>
                              </SingleRow>
                              <SingleRow>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">Telephone</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'telephone', e.target.value)
                                    }}
                                    value={item.value['telephone']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="Telephone"
                                  />
                                </div>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">FaxNo</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'faxNo', e.target.value)
                                    }}
                                    value={item.value['faxNo']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="FaxNo"
                                  />
                                </div>
                              </SingleRow>
                              <SingleRow>
                                <div className="w-full px-4 sm:w-2/2">
                                  <h2 className="mb-2">Link</h2>
                                  <Input
                                    onChange={(e) => {
                                      setAddressState(index, 'link', e.target.value)
                                    }}
                                    value={item.value['link']?.[defaultLanguage] || ''}
                                    type="text"
                                    variant="primary"
                                    placeholder="Link"
                                  />
                                </div>
                              </SingleRow>
                            </div>
                          )}
                        </StaticListComposition>
                      )
                    })}
                  <Button
                  className="mt-2"
                    onClick={() => {
                      setAccordion((prevState) => {
                        return { ...prevState, ['address']: true }
                      })

                      setAddress((oldArray) => [
                        ...oldArray,
                        {
                          name: '',
                          value: {
                            id: uuidv4(),
                            title: {},
                            street1: {},
                            street2: {},
                            postalCode: {},
                            province: {},
                            region: {},
                            country: {},
                            email: {},
                            telephone: {},
                            faxNo: {},
                            link: {},
                          },
                        },
                      ])
                    }}
                    variant="primary"
                  >
                    add address
                    <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                  </Button>
                </div>
              </div>
            </SingleRow>
            <div className="flex flex-wrap -mx-4 text-left">
              <div className="w-full sm:w-2/2">
                <div className="w-full p-4 border border-gray-300 rounded-lg">
                  <h2 className="mb-2">Domains</h2>
                  <div className="w-full lg:w-3/3">
                    <div>
                      {clientData.domains.map((domain, i) => {
                        const fetchedDomain = domainObject(domain)
                        const ignoreProtocol = /[a-z]+:\/\//
                        const url = fetchedDomain.url.replace(ignoreProtocol, '')
                        const slug = slugify(url)
                        const dsArr = clientDataSourcesArr[slug]
                        return (
                          <Domain
                            setFreeDomains={setFreeDomains}
                            slug={slug}
                            domain={domainObject(domain)}
                            setClientData={setClientData}
                            freeDomains={freeDomains}
                            clientDataSourceArr={dsArr}
                            setClientDataSourcesArr={setClientDataSourcesArr}
                            key={i}
                            currentIndex={i}
                            isConfirmed={isConfirmed}
                          />
                        )
                      })}
                      <div>
                        <Button onClick={handleDomainAdd} variant="primary">
                          {clientData.domains.length > 0 ? 'add another domain' : 'add domain'}
                          <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between -mx-4">
            {client && (
              <Button
                variant="danger"
                type="button"
                className="mt-4 ml-4"
                onClick={async () => {
                  let confirmed = await isConfirmed('Are you sure to delete this client')
                  if (confirmed) {
                    handleDelete()
                  }
                }}
              >
                Delete client
              </Button>
            )}
            <Button
              variant="primary"
              className="mt-4 ml-4 mr-4"
              form={`client-${clientData ? clientData._id : ''}-form`}
              type="submit"
            >
              {client ? 'Update client' : 'Create client'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default EditClient
