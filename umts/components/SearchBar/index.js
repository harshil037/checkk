import { useState, useEffect, useContext } from 'react'
import EditDomain from '../editDomain'
import OutsideAlerter from '../shared/outsideAlerter'
import PopUp from '../dialog/popUp'
import { AppContext } from '../../context/appContext'
import { useUser, getApi } from '../../lib/hooks'
import ShowClientList from './components/ShowClientList'
import ShowDomainList from './components/ShowDomainList'

const SearchBar = ({
  passedClients,
  passedDomains,
  clients,
  domains,
  autoOpenDomainList,
  handleGotoProduct,
  router,
  isConfirmed,
}) => {
  const [isComponentMounted, setIsComponentMounted] = useState(false)
  const [clientsList, setClientsList] = useState()
  const [domainsList, setDomainsList] = useState()
  const [clientsDomains, setClientsDomains] = useState([])
  const [productsList, setProductsList] = useState([])
  const [domainsProduct, setDomainsProduct] = useState([])
  const [user] = useUser()
  const [openModal, setOpenModal] = useState(false)

  const [contextData, setContextData, setLoading, navigateTo] = useContext(AppContext)
  const [searchObject, setSearchObject] = useState({
    clientId: undefined,
    domainId: undefined,
    url: '',
    productName: '',
    searchDomain: null,
    showClientList: false,
    showDomainList: false,
    showProducts: false,
    editDomain: {},
    currentValue: '',
    clientSearchText: '',
    oldValue: '',
  })

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchObject.searchDomain != null) {
        setContextData((prevState) => ({
          ...prevState,
          search: {
            ...prevState.search,
            filterdDomains: searchObject.searchDomain,
            lastSearched: new Date(),
          },
        }))
      }
    }, 1500)

    return () => {
      clearTimeout(delayDebounceFn)
    }
  }, [searchObject.searchDomain])

  useEffect(() => {
    if (contextData.search.reload != 0) {
      navigateTo(
        user?.superadmin
          ? '/admin/domains'
          : user.email === 'monika@pragserwildsee.com'
          ? '/admin/parking'
          : user?.email === 'info@arianes-guesthouse.com'
          ? '/admin/smartresponse/u1060'
          : user?.email === 'info@belvedere-hotel.it'
          ? '/admin/vouchers'
          : '/admin/domains',
        isConfirmed,
        () => {
          clearSearchBar && clearSearchBar()
          const navItem = user?.email === 'info@belvedere-hotel.it' ? 'vouchers' : 'domains'

          setContextData((prevState) => ({
            ...prevState,
            navigationItem: navItem,
            search: {
              ...prevState.search,
              filterdDomains: '',
              clientId: '',
              lastSearched: new Date(),
              default: {
                ...prevState.search.default,
                clientId: '',
                url: '',
                productName: '',
              },
            },
          }))
        },
      )
    }
  }, [contextData.search.reload])

  const setDomainData = async () => {
    const domainRes = await getApi('/api/domains')
    if (domainRes.status === 200) {
      if (domainRes.domains) {
        setDomains(domainRes.domains)
      }
    }
  }

  useEffect(() => {
    if (searchObject.clientId) {
      const tempcllient = clients?.filter((x) => x.name == searchObject.clientId)
      if (tempcllient) {
        setDomainsList(
          domains?.filter((x) => tempcllient[0]?.domains?.toString().includes(x._id) && x.hasOwnProperty('products')),
        )
      }
    } else {
      setDomainsList(domains)
    }
  }, [domains])

  useEffect(() => {
    if (domainsList?.length > 1 && searchObject.clientId) {
      handleSaveValue('showDomainList', autoOpenDomainList)
    } else if (domainsList?.length == 0) {
      handleSaveValue('url', '')
    }
  }, [domainsList])

  useEffect(() => {
    if (!searchObject.showClientList) {
      setSearchObject((state) => ({
        ...state,
        ['clientSearchText']: '',
      }))
    }
  }, [searchObject.showClientList])

  useEffect(() => {
    handleSearch('clients', searchObject.clientSearchText)
  }, [searchObject.clientSearchText, clients])

  useEffect(() => setIsComponentMounted(true), [])
  //#endregion

  const handleSearch = (key, value) => {
    let data
    if (key == 'clients') {
      if (value == '') {
        data = clients
      } else {
        data = clients.filter((x) => x.name.toLowerCase().includes(value.toLowerCase()))
      }
      setClientsList(data)
    } else if (key == 'domains') {
      const filterDomain = searchObject.clientId ? clientsDomains : domains
      if (value == '') {
        let tempDomain = [...domains]

        const tempcllient = clientsList.filter((x) => x.name == searchObject.clientId)
        data = tempDomain.filter(
          (x) => tempcllient[0]?.domains?.toString().includes(x._id) && x.hasOwnProperty('products'),
        )
      } else {
        data = filterDomain.filter((x) => x.name.toLowerCase().includes(value.toLowerCase()))
      }
      setDomainsList(data)
    } else if (key == 'products') {
      data = domainsProduct.filter((x) => (value == '' && 1 == 1) || x.name.toLowerCase().includes(value.toLowerCase()))
      setProductsList(data)
    }
  }

  useEffect(() => {
    if (searchObject.clientId) {
      setContextData((prevState) => ({
        ...prevState,
        search: {
          ...prevState.search,
          filterdDomains: searchObject.searchDomain,
          clientId: searchObject.clientId,
          lastSearched: new Date(),
        },
      }))
    }
  }, [searchObject.clientId])

  useEffect(() => {
    if (contextData.search.default) {
      setSearchObject((state) => ({
        ...state,
        ['clientId']: contextData.search.default.clientId,
        ['url']: contextData.search.default.url,
        ['productName']: contextData.search.default.productName,
        ['domainId']: passedDomains
          ? passedDomains.find((x) => x.url === contextData.search.default.url)?._id
          : undefined,
      }))
      setDomainsList(passedDomains)
      const tempClients = passedClients.filter((x) => x.name == contextData.search.default.clientId)
      let tempDomain = domains ? [...domains] : []
      let newDomains = tempDomain.filter(
        (x) => tempClients[0]?.domains?.toString().includes(x._id) && x.hasOwnProperty('products'),
      )
      setDomainsList(newDomains ? newDomains : [])
      setClientsDomains(newDomains ? newDomains : [])
      const domainProducts = newDomains.find((x) => x.url == contextData.search.default.url)?.products
      setProductsList(domainProducts)
      setDomainsProduct(domainProducts)

      setTimeout(() => {
        setSearchObject((state) => ({
          ...state,
          ['showDomainList']: false,
        }))
      }, 500)
    }
  }, [contextData.search.default])

  const handleRenderList = async (key, value) => {
    if (key == 'clients') {
      handleSaveValue('showClientList', true)
      if (value == '') {
        setDomainsList(domains)
        await setDomainData()
      } else {
        let tempDomain = [...domains]
        const data = clientsList.filter((x) => x.name == value)
        let newDomains = tempDomain.filter(
          (x) => data[0]?.domains?.toString().includes(x._id) && x.hasOwnProperty('products'),
        )
        setDomainsList(newDomains ? newDomains : [])
        setClientsDomains(newDomains ? newDomains : [])
        setProductsList([])

        handleSaveValue('showProducts', false)
        handleSaveValue('url', '')
        handleSaveValue('productName', '')
        if (newDomains.length === 1 && newDomains[0]?.products?.length > 0) {
          handleRenderList('domains', newDomains[0]._id)
          handleSaveValue('url', newDomains[0].url)
        }
      }
    } else if (key == 'domains') {
      if (value == '') {
        handleSaveValue('domainId', undefined)
        await setDomainData()
      } else {
        handleSaveValue('domainId', value)
        let tempDomain = [...domains]
        let newDomains = tempDomain.filter((x) => x._id == value && x.hasOwnProperty('products'))
        setProductsList(newDomains[0]?.products)
        setDomainsProduct(newDomains[0]?.products)
      }
    } else if (key == 'products') {
      handleSaveValue('currentValue', value)
      if (value != '') {
        if (value !== searchObject.oldValue) {
          if (contextData.canOpenProduct) {
            setProductName(value)
            handleSaveValue('oldValue', value)
            handleGotoProduct({ _id: searchObject.domainId }, value)
          } else {
            navigateTo('', isConfirmed, () => {
              handleSaveValue('oldValue', value)
              setProductName(value)
              handleGotoProduct({ _id: searchObject.domainId }, value)
            })
          }
        } else {
          if (contextData.canOpenProduct) {
            setProductName(value)
            handleSaveValue('oldValue', value)
            handleGotoProduct({ _id: searchObject.domainId }, value)
          } else {
            await isConfirmed('you are at same product', true)
          }
        }
      }
    }
  }

  const setProductName = (id) => {
    handleSaveValue('productName', productsList.find((x) => x._id == id)?.name)
  }

  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpenModal(false)
    }
  }

  const handleSaveValue = (key, value) => {
    setSearchObject((state) => ({ ...state, [key]: value }))
  }

  if (!isComponentMounted) {
    return null
  }
  const clearSearchBar = () => {
    setSearchObject((state) => ({
      ...state,
      ['clientId']: '',
      ['productName']: '',
      ['url']: '',
      ['searchDomain']: '',
    }))
    setClientsList(passedClients)
    setDomainsList(passedDomains)
    setProductsList([])
  }

  return (
    <>
      {user?.superadmin || user?.email.includes('@mts-online.com') ? (
        <div className="relative breadCrumbs">
          <ul className="flex">
            <div>
              <li className="px-4">
                <img
                  className="cursor-pointer"
                  onClick={() => {
                    navigateTo('/admin/domains', isConfirmed, () => {
                      clearSearchBar()
                      setContextData((prevState) => ({
                        ...prevState,
                        search: {
                          ...prevState.search,
                          filterdDomains: '',
                          clientId: '',
                          lastSearched: new Date(),
                          default: {
                            ...prevState.search.default,
                            clientId: '',
                            url: '',
                            productName: '',
                          },
                        },
                      }))
                      setContextData((prevState) => ({
                        ...prevState,
                        navigationItem: 'domains',
                      }))
                    })
                  }}
                  src="/images/home.svg"
                  alt="home"
                />
              </li>
            </div>
            <OutsideAlerter
              closeMe={() => {
                handleSaveValue('showClientList', false)
              }}
            >
              <li className="relative">
                <div
                  className="inline-block px-4 cursor-pointer"
                  onClick={() => {
                    setSearchObject((state) => ({
                      ...state,
                      ['showClientList']: !searchObject.showClientList,
                      ['showDomainList']: false,
                    }))
                  }}
                >
                  {searchObject.clientId ? searchObject.clientId : 'Select client'}
                  <img className="inline-block px-2" src="/images/search.svg" alt="search" />
                </div>

                {searchObject.showClientList && (
                  <ShowClientList
                    clientsList={clientsList}
                    searchObject={searchObject}
                    setSearchObject={setSearchObject}
                    handleRenderList={handleRenderList}
                    handleSaveValue={handleSaveValue}
                    setContextData={setContextData}
                  />
                )}
              </li>
            </OutsideAlerter>
            <OutsideAlerter
              closeMe={() => {
                handleSaveValue('showDomainList', false)
              }}
            >
              <li className="relative">
                <div
                  className="inline-block px-4 cursor-pointer"
                  onClick={() => {
                    setSearchObject((state) => ({
                      ...state,
                      ['showDomainList']: !searchObject.showDomainList,
                      ['showClientList']: false,
                      ['showProducts']: false,
                    }))
                  }}
                >
                  {searchObject.url ? searchObject.url : 'Select domain'}
                  <img className="inline-block px-2" src="/images/search.svg" alt="search" />
                </div>

                {searchObject.showDomainList && (
                  <ShowDomainList
                    domainsList={domainsList}
                    domains={domains}
                    searchObject={searchObject}
                    handleRenderList={handleRenderList}
                    handleSaveValue={handleSaveValue}
                    clients={clients}
                    setOpenModal={setOpenModal}
                  />
                )}
              </li>
            </OutsideAlerter>
            <OutsideAlerter
              closeMe={() => {
                handleSaveValue('showProducts', false)
              }}
            >
              <li className="relative">
                <div
                  className="inline-block px-4 cursor-pointer"
                  onClick={() => {
                    setSearchObject((state) => ({
                      ...state,
                      ['showProducts']: !searchObject.showProducts,
                      ['showDomainList']: false,
                      ['showClientList']: false,
                    }))
                  }}
                >
                  {searchObject.productName ? searchObject.productName : 'Select product'}
                </div>
                <div
                  style={{
                    display: searchObject.showProducts && productsList && productsList.length > 0 ? 'block' : 'none',
                  }}
                  className="absolute z-10 w-64 mt-5 bg-white rounded-lg header-popup top-100 -right-4 arrow-right"
                >
                  <ul className="h-auto mx-4 my-2 max-h-48">
                    {productsList?.map((l, i) => (
                      <li
                        onClick={() => {
                          handleRenderList('products', l._id)
                          handleSaveValue('showProducts', false)
                        }}
                        className="flex justify-between py-2 cursor-pointer"
                        key={`c${l.name}-${i}`}
                      >
                        <span>
                          {l.name} <span className="text-[color:#796B5F] text-[12px]">V {l.version}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </OutsideAlerter>
          </ul>

          <div>
            {openModal && (
              <PopUp openModal={openModal}>
                <EditDomain
                  setLoading={setLoading}
                  isConfirmed={isConfirmed}
                  passedDomain={searchObject.editDomain}
                  handleClose={handleClose}
                />
              </PopUp>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  )
}

export default SearchBar
export async function getServerSideProps(context) {
  return Authenticate(context)
}
