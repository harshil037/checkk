import React, { useState, useEffect } from 'react'
import { Input } from '../componentLibrary'
import Button from '../common/Button'

const Domain = ({
  setFreeDomains,
  slug,
  domain: clientDomain,
  setClientData,
  freeDomains,
  clientDataSourceArr,
  setClientDataSourcesArr,
  currentIndex,
  isConfirmed,
}) => {
  const [accordian, setAccordian] = useState({ 0: true })

  const handleChange = (e) => {
    setClientData((state) => {
      const emptyIndex = state.domains.findIndex((d) => d === '')
      return emptyIndex !== -1
        ? { ...state, domains: [...state.domains.filter((_, i) => i !== emptyIndex), e.target.value] }
        : { ...state, domains: [...state.domains, e.target.value] }
    })
  }

  const handleDataSourceAdd = () => {
    return setClientDataSourcesArr((state) => {
      const newState = {
        ...state,
        [slug]: state[slug] ? [...state[slug], {}] : [{}],
      }
      return newState
    })
  }
  return (
    <div className="p-4 m-4 border border-gray-300 border-solid rounded-xl">
      <div
        className="flex flex-wrap items-center gap-2 pb-2 border-b border-black border-dashed"
        onClick={() => {
          setAccordian((prevState) => {
            return { ...prevState, [currentIndex]: !prevState[currentIndex] }
          })
        }}
      >
        <h3 className="text-lg font-semibold text-gray-800">{clientDomain.url}</h3>
        <div>
          <Button
            onClick={() => {
              isConfirmed('Are you sure to delete domain from this client').then((confirmed) => {
                if (confirmed) {
                  setFreeDomains((state) => {
                    return [...state, clientDomain]
                  })
                  return setClientData((state) => {
                    setClientDataSourcesArr((detailState) => {
                      const newState = {
                        ...detailState,
                        [slug]: [],
                      }
                      return newState
                    })
                    return { ...state, domains: state.domains.filter((_, i) => i !== currentIndex) }
                  })
                }
              })
            }}
            variant="danger"
          >
            Delete domain
            <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Langauge Delete" />
          </Button>
        </div>
        <div className="ml-auto cursor-pointer">
          <img
            className={`inline-block  px-2 ${accordian[currentIndex] && 'transform rotate-180'}`}
            src="/images/select-list.svg"
            alt="Status"
          />
        </div>
      </div>

      {accordian[currentIndex] && (
        <div>
          <div className="flex flex-wrap -mx-4 text-left">
            <div className="w-full px-4 sm:w-2/2">
              <h2 className="mx-2 my-4">Domain</h2>

              <select
                onChange={handleChange}
                className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg select__list focus:outline-none focus:shadow-outline"
              >
                {clientDomain && <option value={clientDomain._id}>{clientDomain.url}</option>}
                {freeDomains?.map((domain) => {
                  return (
                    <option key={domain._id} value={domain._id}>
                      {domain.url}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* data source starts is here */}
          <div>
            {clientDataSourceArr &&
              clientDataSourceArr.map((ds, dataSourceIndex) => {
                const key = Object.keys(ds)[0]
                const value = ds[key]
                return (
                  <div
                    key={`${slug}-${dataSourceIndex}`}
                    className="p-4 m-4 border border-gray-300 border-solid rounded-xl"
                  >
                    <div
                      className="flex flex-wrap items-center gap-2 pb-2 border-b border-black border-dashed"
                      onClick={() => {
                        setAccordian((prevState) => {
                          return {
                            ...prevState,
                            [slug]: {
                              ...prevState[slug],
                              [dataSourceIndex]: prevState[slug] ? !prevState[slug][dataSourceIndex] : true,
                            },
                          }
                        })
                      }}
                    >
                      <h3 className="text-lg font-semibold text-gray-800">{key}</h3>
                      <div>
                        <Button
                          onClick={() => {
                            return setClientDataSourcesArr((state) => {
                              const dsIndex = state[slug].findIndex((s) => Object.keys(s)[0] === key)
                              const newState = {
                                ...state,
                                [slug]: [
                                  ...state[slug].filter((s, i) => {
                                    return i !== dsIndex
                                  }),
                                ],
                              }
                              return newState
                            })
                          }}
                          variant="danger"
                        >
                          Delete Data Source
                          <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Langauge Delete" />
                        </Button>
                      </div>

                      <div className="ml-auto cursor-pointer">
                        <img
                          className={`inline-block  px-2 ${
                            accordian[slug]?.[dataSourceIndex] && 'transform rotate-180'
                          }`}
                          src="/images/select-list.svg"
                          alt="Status"
                        />
                      </div>
                    </div>
                    {accordian[slug] && accordian[slug][dataSourceIndex] && (
                      <div>
                        <div className="flex flex-wrap -mx-4 text-left">
                          <div className="w-full px-4 sm:w-2/2">
                            <h2 className="mt-4 mb-2">Data Source</h2>
                            <Input
                              variant="primary"
                              value={key || ''}
                              onChange={(e) => {
                                return setClientDataSourcesArr((state) => {
                                  const dsIndex = state[slug].findIndex((s) => Object.keys(s)[0] === key)
                                  const newState = {
                                    ...state,
                                    [slug]: [
                                      ...state[slug].map((s, i) => {
                                        const [entry] = Object.entries(s)
                                        return i === dsIndex ? { [e.target.value]: entry?.[1] || [] } : s
                                      }),
                                    ],
                                  }
                                  return newState
                                })
                              }}
                              type="text"
                              placeholder="Name"
                            />
                          </div>
                        </div>
                        {value?.length > 0 ? (
                          <div className="p-4 m-4 border border-gray-300 border-solid rounded-xl">
                            {accordian[slug] && accordian[slug][dataSourceIndex] && (
                              <div>
                                {value &&
                                  value.map((lv, li) => {
                                    const lkey = Object.keys(lv)[0]
                                    const lvalue = lv[lkey]
                                    return (
                                      <div
                                        className="flex flex-wrap items-center mb-5 -mx-4 text-left"
                                        key={`${slug}-${dataSourceIndex}-${li}`}
                                      >
                                        <div className="w-5/12 px-4">
                                          <label htmlFor="key" className="inline-block mb-2">
                                            Key
                                          </label>
                                          <Input
                                            variant="primary"
                                            type="text"
                                            value={lkey || ''}
                                            id={`${slug}-${dataSourceIndex}-${li}`}
                                            onChange={(e) => {
                                              return setClientDataSourcesArr((state) => {
                                                const domainIndex = state[slug].findIndex(
                                                  (s) => Object.keys(s)[0] === key,
                                                )
                                                const itemIndex = state[slug][domainIndex][key].findIndex(
                                                  (s) => Object.keys(s)[0] === lkey,
                                                )
                                                const newState = {
                                                  ...state,
                                                  [slug]: [
                                                    ...state[slug].map((s, i) => {
                                                      const [entry] = Object.entries(s)
                                                      return i === domainIndex
                                                        ? {
                                                            [key]: [
                                                              ...state[slug][domainIndex][key].map((item, itemI) => {
                                                                return itemI === itemIndex
                                                                  ? { [e.target.value]: lvalue }
                                                                  : item
                                                              }),
                                                            ],
                                                          }
                                                        : s
                                                    }),
                                                  ],
                                                }
                                                return newState
                                              })
                                            }}
                                            label="Key"
                                            className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline"
                                            placeholder="Data source item key"
                                          />
                                        </div>
                                        <div className="w-5/12 px-4">
                                          <label htmlFor="key" className="inline-block mb-2">
                                            Value
                                          </label>
                                          <Input
                                            variant="primary"
                                            type="text"
                                            value={lvalue || ''}
                                            key={`${slug}-${dataSourceIndex}-${li}-value`}
                                            id={`${slug}-${dataSourceIndex}-${li}-value`}
                                            onChange={(e) => {
                                              return setClientDataSourcesArr((state) => {
                                                const domainIndex = state[slug].findIndex(
                                                  (s) => Object.keys(s)[0] === key,
                                                )
                                                const itemIndex = state[slug][domainIndex][key].findIndex(
                                                  (s) => Object.keys(s)[0] === lkey,
                                                )
                                                const newState = {
                                                  ...state,
                                                  [slug]: [
                                                    ...state[slug].map((s, i) => {
                                                      const [entry] = Object.entries(s)
                                                      return i === domainIndex
                                                        ? {
                                                            [key]: [
                                                              ...state[slug][domainIndex][key].map((item, itemI) => {
                                                                return itemI === itemIndex
                                                                  ? { [lkey]: e.target.value }
                                                                  : item
                                                              }),
                                                            ],
                                                          }
                                                        : s
                                                    }),
                                                  ],
                                                }
                                                return newState
                                              })
                                            }}
                                            label="Value"
                                            className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline"
                                            placeholder="Data source item value"
                                          />
                                        </div>
                                        <div className="items-end w-2/12 px-4 pt-5">
                                          <div className="px-4">
                                            <div className="inline-block text-center">
                                              <img
                                                onClick={() => {
                                                  return setClientDataSourcesArr((state) => {
                                                    const domainIndex = state[slug].findIndex(
                                                      (s) => Object.keys(s)[0] === key,
                                                    )
                                                    const itemIndex = state[slug][domainIndex][key].findIndex(
                                                      (s) => Object.keys(s)[0] === lkey,
                                                    )
                                                    const newState = {
                                                      ...state,
                                                      [slug]: [
                                                        ...state[slug].map((domainS, domainI) => {
                                                          if (domainI === domainIndex) {
                                                            return {
                                                              [key]: [
                                                                ...state[slug][domainIndex][key].filter(
                                                                  (item, itemI) => {
                                                                    return itemI !== itemIndex
                                                                  },
                                                                ),
                                                              ],
                                                            }
                                                          }
                                                          return domainS
                                                        }),
                                                      ],
                                                    }
                                                    return newState
                                                  })
                                                }}
                                                className="inline-block"
                                                src="/images/langaugedelete.svg"
                                                alt="Langauge Delete"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                              </div>
                            )}
                          </div>
                        ) : null}
                        <div className="p-2">
                          <Button
                            onClick={() => {
                              return setClientDataSourcesArr((state) => {
                                const newState = {
                                  ...state,
                                  [slug]: [
                                    ...state[slug].map((s) => {
                                      const [entry] = Object.entries(s)
                                      if (!entry) return { '': [{ '': '' }] }
                                      return key === entry[0] ? { [key]: [...entry[1], { '': '' }] } : s
                                    }),
                                  ],
                                }
                                return newState
                              })
                            }}
                            variant="primary"
                          >
                            {value?.length ? 'Add Another Item' : 'Add Item'}
                            <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

            {clientDomain.url != '' && (
              <div className="p-2">
                <Button onClick={handleDataSourceAdd} variant="primary">
                  {clientDataSourceArr?.length > 0 ? 'Add Another Data Source' : 'Add Data Source'}
                  <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Domain
