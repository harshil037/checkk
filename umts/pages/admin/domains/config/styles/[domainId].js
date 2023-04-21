import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Authenticate from '../../../../../lib/authenticate'
import { AppContext } from '../../../../../context/appContext'
import PopUp from '../../../../../components/dialog/popUp'
import { Input } from '../../../../../components/componentLibrary'
import Button from '../../../../../components/common/Button'
import { isEqual } from '../../../../../lib/utils'
import EditStyles from '../../../../../components/stylesConfigPage/editStyles'
import useConfirm from '../../../../../components/dialog/useConfirm'

const Config = () => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const router = useRouter()
  const { domainId } = router.query
  const { isConfirmed } = useConfirm()

  /***** component states start *****/

  const [domain, setDomain] = useState({})
  const [currentClient, setCurrentClient] = useState('')
  const [allClients, setAllClients] = useState([])
  const [styles, setStyles] = useState({})
  const [oldStyles, setOldStyles] = useState({})
  const [isEdited, setIsEdited] = useState(false)
  const [openEditPanel, setOpenEditPanel] = useState(false)
  const [languages, setLanguages] = useState(['en', 'de', 'it'])
  const [clientDomains, setClientDomains] = useState([])
  const [openImportThemeModal, setOpenImportThemeModal] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('default')
  const [themeToAdd, setThemeToAdd] = useState('')
  const [openAddThemeModal, setOpenAddThemeModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [stylesToImport, setStylesToImport] = useState(null)
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [usedStyles, setUsedStyles] = useState([])
  const [replaceStyles, setReplaceStyles] = useState(false)
  const [isNew, setIsNew] = useState(true)

  /***** component states ends *****/

  /**
   * Get domain details
   * @param {string} id domain id
   * @returns domain details
   */
  const getDomainData = async (id) => {
    const res = await fetch(`/api/domain/${id}`)

    if (res.status === 200) {
      const data = await res.json()
      return { data, error: null }
    } else {
      return { data: null, error: 'something went wrong' }
    }
  }

  /**
   * Get all clients
   * @returns all clients
   */
  const getClients = async () => {
    const data = await fetch('/api/clients', {
      method: 'GET',
    })
    return await data.json()
  }

  /**
   * Save changes
   */
  const handleSubmit = async () => {
    // adding styles in domain object
    const data = { ...domain, styles }
    setLoading(true)
    const res = await fetch('/api/domains', {
      method: domain ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setOldStyles(JSON.parse(JSON.stringify(styles)))
    setIsNew(false)
    setIsEdited(false)
    setOpenEditPanel(false)
    setLoading(false)
  }

  // available color variants
  const colors = [
    'primary',
    'secondary',
    'effect',
    'button',
    'button-hover',
    'surface',
    'error',
    'success',
    'danger',
    'label',
    'input',
    'border',
  ]

  // available font variants
  const fonts = [
    'body',
    'heading',
    'subHeading',
    'effect',
    'button',
    'button-secondary',
    'button-danger',
    'link',
    'label',
    'input',
  ]

  // available font weight variants
  const weights = [...fonts, 'thin', 'light', 'normal', 'semibold', 'bold', 'black', 'effect']

  /**
   * to make empty style object according to the variants
   * @param {string[]} variants
   * @param {string} property
   * @returns empty styles object
   */
  const makeEmptyStyles = (variants, property) =>
    variants.reduce((acc, variant) => {
      return { ...acc, [`${property}-${variant}`]: '' }
    }, {})

  // creating the empty styles object
  const emptyStylesObject = useMemo(
    () => ({
      fontFamily: {
        ...makeEmptyStyles(fonts, 'fontFamily'),
      },
      textColor: {
        ...makeEmptyStyles(colors, 'color'),
      },
      backgroundColor: {
        ...makeEmptyStyles(colors, 'backgroundColor'),
      },
      borderColor: {
        ...makeEmptyStyles(colors, 'borderColor'),
      },
      fontWeight: {
        ...makeEmptyStyles(weights, 'fontWeight'),
      },
    }),
    [],
  )

  /***** Side effects starts *****/
  // on component mount
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setContextData((prevState) => ({
        ...prevState,
        navigationItem: 'domains',
      }))

      const responses = await Promise.all([getDomainData(domainId), getClients()])

      if (!responses[0].error) {
        setDomain(responses[0].data.domain)
        if (responses[0].data.domain.languages) setLanguages(responses[0].data.domain.languages)
        if (responses[0].data.domain.styles) {
          setStyles(JSON.parse(JSON.stringify(responses[0].data.domain.styles)))
          setOldStyles(JSON.parse(JSON.stringify(responses[0].data.domain.styles)))
          setIsNew(false)
        } else {
          setStyles(JSON.parse(JSON.stringify({ default: emptyStylesObject })))
          setOldStyles(JSON.parse(JSON.stringify({ default: emptyStylesObject })))
          setIsNew(true)
        }
      }

      const { error, clients } = responses[1]

      if (clients) {
        setAllClients(clients)
        const clientData = clients.find((c) => c.domains?.includes(domainId))

        if (clientData) {
          setCurrentClient(clientData)
          setSelectedClient(clientData.clientNumber)
        }
      }

      setLoading(false)
    })()
  }, [])

  // side effects of changing styles
  useEffect(() => {
    setIsEdited(!isEqual(oldStyles, styles))

    // generating set of suggestion from the used styles in domain
    const usedStyles = new Set()
    for (let theme in styles) {
      for (let styleType in styles[theme]) {
        for (let style in styles[theme][styleType]) {
          if (styles[theme][styleType][style]) {
            usedStyles.add(styles[theme][styleType][style])
          }
        }
      }
    }
    setUsedStyles(Array.from(usedStyles))
  }, [styles])

  // side effects of changing selected client in import styles popup
  useEffect(() => {
    if (selectedClient) {
      if (selectedClient === currentClient.clientNumber) {
        // if the selectd client is current domain's client
        if (currentClient.domains && currentClient.domains.length > 1) {
          ;(async () => {
            try {
              setLoading(true)
              const domains = currentClient.domains.filter((item) => item !== domainId)
              const dataArray = domains.map((id) => getDomainData(id))

              const domainsData = await Promise.all(dataArray)

              setClientDomains(() => domainsData.map(({ data, error }) => ({ ...data.domain })))
              setLoading(false)
            } catch (e) {
              setLoading(false)
              console.log(e.message)
            }
          })()
        }
      } else {
        // if the selectd client is not current domain's client then finding client details from all clients
        const client = allClients.find((item) => item.clientNumber === selectedClient)
        if (client.domains && client.domains.length) {
          ;(async () => {
            try {
              setLoading(true)
              const dataArray = client.domains.map((id) => getDomainData(id))
              const domainsData = await Promise.all(dataArray)

              let cDomains = domainsData.filter(({ data, error }) => (data?.domain ? true : false))
              cDomains = cDomains.map(({ data, error }) => ({
                ...data.domain,
              }))

              setClientDomains(cDomains)
              setLoading(false)
            } catch (e) {
              setLoading(false)
              console.log(e.message)
            }
          })()
        }
      }
    }
  }, [selectedClient])

  // side effects of changing selected domain in import styles popup
  useEffect(() => {
    if (selectedDomain) {
      const domain = clientDomains.find((item) => item.url === selectedDomain)

      if (domain.styles) {
        setStylesToImport(domain.styles)
      } else {
        setStylesToImport(null)
      }
    } else {
      setStylesToImport(null)
    }
  }, [selectedDomain])

  // side effects of isEdited
  useEffect(() => {
    setOpenEditPanel(isEdited)
  }, [isEdited])

  /***** Side effects ends *****/

  /**
   * to add new theme
   */
  const addTheme = () => {
    const theme = themeToAdd.toLowerCase()

    if (themeToAdd && !styles[theme]) {
      setStyles((prev) => ({ ...prev, [theme]: styles.default }))
      setThemeToAdd('')
      setOpenAddThemeModal(false)
    }
  }

  /**
   * to import selected domains style
   */
  const handleImport = () => {
    if (replaceStyles) {
      // to replace all styles
      setStyles(stylesToImport)
    } else {
      // ony importing styles that is not filled yet.
      const newStyles = JSON.parse(JSON.stringify(styles))

      for (let theme in newStyles) {
        for (let styleType in newStyles[theme]) {
          for (let style in newStyles[theme][styleType]) {
            if (!newStyles[theme][styleType][style] && stylesToImport[theme]?.[styleType]?.[style]) {
              newStyles[theme][styleType][style] = stylesToImport[theme][styleType][style]
            }
          }
        }
      }

      setStyles({ ...stylesToImport, ...newStyles })
    }

    setStylesToImport(null)
    setSelectedDomain('')
    setOpenImportThemeModal(false)
    setReplaceStyles(false)
    setSelectedTheme('default')
  }

  /**
   * to delete theme
   * @param {string} theme
   */
  const deleteTheme = (theme) => async () => {
    const confirmed = await isConfirmed(`Are you sure to delete ${theme} theme ?`)
    if (confirmed) {
      const themes = JSON.parse(JSON.stringify(styles))
      delete themes[theme]

      setCurrentTheme('default')
      setStyles(themes)
    }
  }

  /**
   * To delete whole domain styles from Db.
   */
  const handleDelete = async () => {
    const confirmed = await isConfirmed(`Are you sure to delete all the styles ?`)
    if (confirmed) {
      setLoading(true)
      const res = await fetch('/api/domains', {
        method: domain ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...domain, styles: null }),
      })

      router.replace('/admin/domains')
    }
  }

  return (
    <div className="w-full p-4 mt-8 text-left bg-white rounded-lg">
      <div className="flex w-full justify-end items-center mb-2">
        <Button variant="primary" onClick={() => setOpenAddThemeModal(true)}>
          Add Theme
        </Button>

        {allClients.length ? (
          <Button variant="primary" className="ml-2" onClick={() => setOpenImportThemeModal(true)}>
            Import Styles
          </Button>
        ) : (
          ''
        )}
      </div>
      <div className="flex">
        <ul className="inline-flex w-full gap-4 px-1 pt-2">
          {Object.keys(styles).map((item, index) => (
            <li
              className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border-r border-l border-t ${
                item === currentTheme ? 'after:bg-primary-400' : 'after:bg-transparent'
              }`}
              key={index}
              onMouseDown={() => setCurrentTheme(item)}
            >
              <span className="px-4 md:px-8 capitalize">{item}</span>
              {item !== 'default' && (
                <img
                  className="inline-block"
                  width={'15px'}
                  src="/images/langaugedelete.svg"
                  alt="delete"
                  onClick={deleteTheme(item)}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 border border-gray-400 rounded-lg">
        {styles[currentTheme]?.backgroundColor && (
          <div className="mb-4">
            <EditStyles
              title="Background Color"
              property={{ key: 'backgroundColor', type: 'color' }}
              styles={styles}
              defaultOpen={true}
              setStyles={setStyles}
              currentTheme={currentTheme}
              usedStyles={usedStyles}
            />
          </div>
        )}
        {styles[currentTheme]?.borderColor && (
          <div className="mb-4">
            <EditStyles
              title="Border Color"
              property={{ key: 'borderColor', type: 'color' }}
              styles={styles}
              setStyles={setStyles}
              currentTheme={currentTheme}
              usedStyles={usedStyles}
            />
          </div>
        )}
        {styles[currentTheme]?.textColor && (
          <div className="mb-4">
            <EditStyles
              title="Text Color"
              property={{ key: 'textColor', type: 'color' }}
              styles={styles}
              setStyles={setStyles}
              currentTheme={currentTheme}
              usedStyles={usedStyles}
            />
          </div>
        )}
        {styles[currentTheme]?.fontFamily && (
          <div className="mb-4">
            <EditStyles
              title="Font Family"
              property={{ key: 'fontFamily', type: 'text' }}
              styles={styles}
              setStyles={setStyles}
              currentTheme={currentTheme}
              usedStyles={usedStyles}
            />
          </div>
        )}
        {styles[currentTheme]?.fontWeight && (
          <EditStyles
            title="Font Weight"
            property={{ key: 'fontWeight', type: 'text' }}
            styles={styles}
            setStyles={setStyles}
            currentTheme={currentTheme}
            usedStyles={usedStyles}
          />
        )}
      </div>

      <div
        className={`fixed bg-white border right-0 border-primary-400 pl-4 p-2 bottom-16 transform transition duration-500 ease ${
          openEditPanel ? '' : 'translate-x-full'
        }`}
      >
        <span
          onClick={() => {
            setOpenEditPanel(!openEditPanel)
          }}
          className="absolute p-2 transform -translate-x-full -translate-y-1/2 bg-white border border-solid rounded-full open-arrow top-1/2 left-2 border-primary-400"
        >
          {openEditPanel ? (
            <svg className="block w-4 h-4 fill-current" viewBox="0 0 256 512" aria-hidden="true" role="presentation">
              <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z"></path>
            </svg>
          ) : (
            <svg className="block w-4 h-4 fill-current" viewBox="0 0 256 512" aria-hidden="true" role="presentation">
              <path d="M238.475 475.535l7.071-7.07c4.686-4.686 4.686-12.284 0-16.971L50.053 256 245.546 60.506c4.686-4.686 4.686-12.284 0-16.971l-7.071-7.07c-4.686-4.686-12.284-4.686-16.97 0L10.454 247.515c-4.686 4.686-4.686 12.284 0 16.971l211.051 211.05c4.686 4.686 12.284 4.686 16.97-.001z"></path>
            </svg>
          )}
        </span>
        {isEdited ? (
          <>
            <Button className="!px-4 my-2 block" onClick={handleSubmit} type="button" variant="primary">
              Save Changes
            </Button>
            <Button
              className="my-2 block"
              onClick={() => setStyles(JSON.parse(JSON.stringify(oldStyles)))}
              type="button"
              variant="secondary"
            >
              Discard Changes
            </Button>
          </>
        ) : (
          ''
        )}
        {isNew ? (
          !isEdited && (
            <Button className="my-2 !px-4 block" onClick={handleSubmit} type="button" variant="primary">
              Save Changes
            </Button>
          )
        ) : (
          <Button className="my-2 !px-4 block" onClick={handleDelete} type="button" variant="danger">
            Delete Styles
          </Button>
        )}
      </div>

      {/* Add Theme PopUp */}
      <PopUp openModal={openAddThemeModal}>
        <div className="w-1/2 p-4 mt-12 mx-auto bg-white rounded-lg ">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Add Theme</h1>
            <svg
              onClick={() => {
                setOpenAddThemeModal(false)
                setThemeToAdd('')
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
          <div>
            <div className="w-1/2 mx-auto mt-2">
              <label className="mb-2">Theme : </label>
              <div className="mb-2">
                <Input
                  type="text"
                  variant="primary"
                  value={themeToAdd}
                  onChange={(e) => setThemeToAdd(e.target.value)}
                />
              </div>
              <div className="flex w-full justify-end">
                <Button variant="primary" onClick={addTheme}>
                  Add
                </Button>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </PopUp>

      {/* Import Theme PopUp */}
      <PopUp openModal={openImportThemeModal}>
        <div className="w-1/2 p-4 mt-12 mx-auto bg-white rounded-lg ">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Import Styles</h1>
            <svg
              onClick={() => {
                setOpenImportThemeModal(false)
                setReplaceStyles(false)
                setSelectedClient(currentClient.clientNumber)
                setSelectedDomain('')
                setStylesToImport(null)
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
          <div>
            <div className="flex w-full items-center my-2">
              <select
                className="border outline-none border-primary-400 rounded-md bg-white ml-2 p-1 text-sm"
                onChange={(e) => {
                  setSelectedClient(e.target.value)
                  setSelectedDomain('')
                  setStylesToImport(null)
                }}
                value={selectedClient}
              >
                <option value="">Select Client</option>
                {allClients.map((client) => (
                  <option value={client.clientNumber} key={client._id}>
                    {client.name} ({client.clientNumber})
                  </option>
                ))}
              </select>
              <select
                className="border outline-none border-primary-400 rounded-md bg-white ml-2 p-1 text-sm"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {selectedClient ? (
                  <>
                    <option value="">Select Domain</option>
                    {clientDomains.map((option) => (
                      <option value={option.url} key={option._id}>
                        {option.url}
                      </option>
                    ))}
                  </>
                ) : (
                  <option>Select Client First</option>
                )}
              </select>
            </div>
            {stylesToImport ? (
              <div className="flex pl-2">
                {Object.keys(stylesToImport).map((theme) => (
                  <div
                    className={`mr-2 bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border-r border-l border-t ${
                      selectedTheme === theme ? 'after:bg-primary-400' : 'after:bg-transparent'
                    }`}
                    onClick={() => setSelectedTheme(theme)}
                    key={theme}
                  >
                    {theme}
                  </div>
                ))}
              </div>
            ) : (
              ''
            )}
            <div className="border border-gray-400 rounded-lg p-4 max-h-[70vh] overflow-y-auto custom-scrollbar scroll-md">
              {stylesToImport ? (
                <div className="">
                  {Object.keys(stylesToImport[selectedTheme]).map((styleType) => (
                    <div key={styleType}>
                      <h4 className="font-bold">
                        {styleType.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
                          return str.toUpperCase()
                        })}
                      </h4>
                      <ul>
                        {Object.keys(stylesToImport[selectedTheme][styleType]).map((style) => {
                          if (stylesToImport[selectedTheme][styleType][style]) {
                            return (
                              <li className="ml-2 flex items-center" key={style}>
                                <span className="capitalize">
                                  {style
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/-/, ' - ')
                                    .replace(/(?=-[a-zA-Z0-9]+)(.)/g, ' ')}{' '}
                                </span>
                                :
                                {stylesToImport[selectedTheme][styleType][style].includes('#') && (
                                  <span
                                    className="mx-2 p-2 inline-block border border-gray-400 rounded-sm"
                                    style={{ background: stylesToImport[selectedTheme][styleType][style] }}
                                  ></span>
                                )}{' '}
                                {stylesToImport[selectedTheme][styleType][style]}
                              </li>
                            )
                          } else {
                            return null
                          }
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-200 text-xl text-center rounded-lg text-gray-600 border border-gray-400">
                  No Styles To Import
                </div>
              )}
            </div>
          </div>

          {stylesToImport && (
            <div className="mt-4 flex items-center justify-end">
              <label className="">Replace All Styles</label>
              <Input
                type="toggle"
                variant="primary"
                checked={replaceStyles}
                id="replace"
                onChange={(e) => setReplaceStyles(e.target.checked)}
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleImport} className="mt-4">
              Import
            </Button>
          </div>
        </div>
      </PopUp>
    </div>
  )
}

export default Config

export async function getServerSideProps(context) {
  return Authenticate(context)
}
