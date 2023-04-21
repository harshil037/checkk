import { useState, useEffect, useRef, useContext } from 'react'
import { useRouter } from 'next/router'
import Authenticate from '../../../lib/authenticate'
import EditDomain from '../../../components/editDomain'
import EditProduct from '../../../components/editProduct'
import DomainItem from '../../../components/domainItem'
import Pagination from '../../../components/shared/pagination'
import { slugify } from '../../../lib/utils'
import PopUp from '../../../components/dialog/popUp'
import Button from '../../../components/common/Button'
import { AppContext } from '../../../context/appContext'
import useConfirm from '../../../components/dialog/useConfirm'
import { useIsMounted } from '../../../lib/hooks'
import NoteItems from '../../../components/shared/noteItems'

const Domains = (props) => {
  const { user } = props
  const [isComponentMounted, setIsComponentMounted] = useState(false)
  const [domainData, setDomainData] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [openNotesModal, setOpenNotesModal] = useState(false)
  const [openModalProduct, setOpenModalProduct] = useState(false)
  const [editDomain, setEditDomain] = useState()
  const [editProduct, setEditProduct] = useState()
  const router = useRouter()
  const [canDelete, setCanDelete] = useState(false)
  const formEl = useRef(null)
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const isMounted = useIsMounted()
  const { isConfirmed } = useConfirm()

  const [gridInfo, setGridInfo] = useState({
    length: 0,
    currentPage: contextData.domain.currentPage,
    perPage: contextData.domain.perPage,
    sort: { url: true },
    pageList: { start: contextData.domain.pageList.start, end: contextData.domain.pageList.end },
  })

  useEffect(async () => {
    if (props.user) {
      let mutex = true
      if (mutex) {
        await fetchDomains()
      }
      return () => {
        mutex = false
      }
    }
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort])

  const fetchDomains = async () => {
    await getDomains()
    document.body.scrollTop = document.documentElement.scrollTop = 0
    setContextData((prevState) => ({
      ...prevState,
      domain: {
        ...prevState.domain,
        currentPage: gridInfo.currentPage,
        perPage: gridInfo.perPage,
        pageList: {
          ...prevState.domain.pageList,
          start: gridInfo.pageList.start,
          end: gridInfo.pageList.end,
        },
      },
    }))
  }

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'domains',
    }))

    return () => {
      setContextData((prevState) => ({
        ...prevState,
        search: {
          ...prevState.search,
          lastSearched: null,
        },
      }))
    }
  }, [])

  useEffect(async () => {
    if (contextData.search.lastSearched) {
      setGridInfo((state) => ({
        ...state,
        ['currentPage']: contextData.domain.currentPage,
      }))
      await fetchDomains()
    }

    return () => {
      setContextData((prevState) => ({
        ...prevState,
        search: {
          ...prevState.search,
          lastSearched: null,
        },
      }))
    }
  }, [contextData.search.lastSearched])

  const handleOpen = (_id, isNotes = false) => {
    if (_id) {
      const domain = domainData && domainData.find((d) => d._id === _id)
      setEditDomain(domain)
    } else {
      setEditDomain()
    }
    if (isNotes) {
      setOpenNotesModal(!openNotesModal)
    } else {
      setOpenModal(true)
    }
  }

  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpenModal(false)
      setEditDomain()
    }
    if (event.reason == 'update') {
      getDomains()
      setContextData((prevState) => ({
        ...prevState,
        search: {
          ...prevState.search,
          domainUpdate: prevState.search.domainUpdate + 1,
        },
      }))
    }
  }

  const getDomains = async () => {
    setLoading(true)
    const domainsStr = contextData.search.filterdDomains ? contextData.search.filterdDomains : ''

    let res = await fetch(
      '/api/domains?req_sort=' +
        (gridInfo.sort.url == true ? 1 : -1) +
        '&req_offset=' +
        gridInfo.perPage * (gridInfo.currentPage - 1) +
        '&req_limit=' +
        gridInfo.perPage +
        '&req_search=' +
        domainsStr +
        '&req_clientId=' +
        contextData.search.clientId,
      {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    if (isMounted.current) {
      setLoading(false)
      if (res.status === 200) {
        const jsonRes = await res.json()
        if (jsonRes.domains) {
          setDomainData(jsonRes.domains)
          setGridInfo((state) => ({
            ...state,
            ['length']: jsonRes.length,
          }))
        }
      }
    }
  }

  useEffect(async () => {
    if (canDelete) {
      let ids = []
      formEl.current.state.selectedRows.data.map((x) => {
        ids.push(domainData[x.dataIndex]._id)
      })
      setLoading(true)
      const res = await fetch('/api/domains', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ids, isMul: true }),
      })
      setLoading(false)
      setCanDelete(false)
      if (res.status === 202) {
        location.reload()
      }
    }
  }, [canDelete])

  const handleGotoProduct = async (_id, productId) => {
    if (_id && productId) {
      const domain = domainData && domainData.find((d) => d._id === _id)
      const product = domain?.products.find((p) => p._id === productId)

      setLoading(true)
      const res = await fetch('/api/clients', {
        method: 'GET',
      })

      if (res.status === 200) {
        const { clients } = await res.json()
        const findClient =
          clients &&
          clients.find((c) => {
            return c?.domains?.includes(domain._id)
          })

        if (findClient?.clientNumber && product?.name) {
          if (product.type === 'website') {
            router.push(
              `/admin/product/website/${findClient.clientNumber}/${domain._id}/${product._id}/${
                product.pageTree || '_new'
              }`,
            )
          } else {
            router.push(`/admin/product/module/${findClient.clientNumber}/${domain._id}/${product._id}`)
          }
        } else {
          setLoading(false)
          await isConfirmed('This domain is not associated with any client, please attach to a client', true)
        }
      } else {
        setLoading(false)
      }
    }
  }

  const handleOpenProduct = ({ _id }, productId) => {
    if (_id && productId) {
      const domain = domainData && domainData.find((d) => d._id === _id)
      const product = domain?.products.find((p) => p._id === productId)
      setEditProduct({ product, domain })
    } else if (_id) {
      const domain = domainData && domainData.find((d) => d._id === _id)
      setEditProduct({ product: null, domain })
    }
    setOpenModalProduct(true)
  }

  const handleCloseProduct = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpenModalProduct(false)
      setEditProduct()
    }
    if (event?.reason == 'update') {
      getDomains()
      setContextData((prevState) => ({
        ...prevState,
        search: {
          ...prevState.search,
          domainUpdate: prevState.search.domainUpdate + 1,
        },
      }))
    }
  }

  const handleGotoSmts = async (_id) => {
    setLoading(true)
    if (_id) {
      const domain = domainData && domainData.find((d) => d._id === _id)

      const res = await fetch('/api/clients', {
        method: 'GET',
      })
      if (res.status === 200) {
        const { clients } = await res.json()
        const findClient = clients && clients.find((c) => c.domains?.includes(domain._id))
        const result = await fetch('/api/smts', {
          method: 'GET',
        })
        const smts = await result.json()
        if (findClient?.clientNumber) {
          // let clientSmtsData = smts && smts.filter((s) => s.user_id === findClient.clientNumber)
          let clientSmtsData = smts && smts.filter((s) => s.user_id === findClient.clientNumber)
          if (clientSmtsData.length > 0) {
            router.push(`smts/${findClient.clientNumber}/${clientSmtsData[0]._id}`)
          } else {
            router.push(`smts/${findClient.clientNumber}/_new`)
          }
        } else {
          console.log('dont have client')
        }
      }
    }
  }

  const handleGotoSkyalpsInterface = async (domainId, productId) => {
    if (domainId && productId) {
      const domain = domainData && domainData.find((d) => d._id === domainId)
      const product = domain?.products.find((p) => p._id === productId)
      const contentId = product.contentId
      if (contentId) {
        setLoading(true)

        const res = await fetch('/api/clients', {
          method: 'GET',
        })

        if (res.status === 200) {
          const { clients } = await res.json()
          const findClient =
            clients &&
            clients.find((c) => {
              return c?.domains?.includes(domain._id)
            })

          if (findClient?.clientNumber && product?.name) {
            router.push(`/admin/skyalps/${findClient.clientNumber}/${contentId}`)
          } else {
            setLoading(false)
            await isConfirmed('This domain is not associated with any client, please attach to a client', true)
          }
        } else {
          setLoading(false)
        }
      } else {
        await isConfirmed('Please add data to open interface', true)
      }
    }
  }

  const updateDomain = async (body) => {
    setLoading(true)
    const response = await fetch('/api/domains', {
      body: JSON.stringify(body),
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    setLoading(false)
    return response.json()
  }

  const domainToggleHandler = async ({ _id, value, key }) => {
    const toggle = !value
    let confirmed = await isConfirmed('Are you sure to change this domains status')
    if (confirmed) {
      const { error, domain } = await updateDomain({ _id, [key]: toggle })
      if (domain) {
        getDomains()
      }
    }
  }

  const handleGotoReception = async (domainId, productId) => {
    setLoading(true)
    if (domainId) {
      const res = await fetch('/api/clients', {
        method: 'GET',
      })
      if (res.status === 200) {
        const { clients } = await res.json()
        const findClient = clients && clients.find((c) => c.domains?.includes(domainId))
        const result = await fetch('/api/smts', {
          method: 'GET',
        })
        const smts = await result.json()
        if (findClient?.clientNumber) {
          router.push(`/admin/smartresponse/${findClient.clientNumber}/${domainId}/${productId}`)
        } else {
          console.log('dont have client')
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => setIsComponentMounted(true), [])
  if (!isComponentMounted) {
    return null
  }

  return (
    <div>
      {openModalProduct && (
        <PopUp openModal={openModalProduct}>
          <EditProduct
            domainProduct={editProduct}
            handleClose={handleCloseProduct}
            setLoading={setLoading}
            isConfirmed={isConfirmed}
          />
        </PopUp>
      )}

      {openModal && (
        <PopUp openModal={openModal}>
          <EditDomain
            passedDomain={editDomain}
            setLoading={(value) => {
              setLoading(value)
            }}
            isConfirmed={isConfirmed}
            handleClose={handleClose}
          />
        </PopUp>
      )}

      {openNotesModal && (
        <PopUp openModal={openNotesModal}>
          <NoteItems
            isConfirmed={isConfirmed}
            passedItems={editDomain?.notes}
            onDbSave={async (objitem, isDelete = false) => {
              const objNote = { isDelete: isDelete, note: objitem }
              const { error, domain } = await updateDomain({ _id: editDomain?._id, ['objNote']: objNote })
              if (domain) {
                const tempDomains = [...domainData]
                const updateIndex = domainData.findIndex((x) => x._id == domain._id)
                tempDomains[updateIndex] = domain
                setDomainData(tempDomains)
                setEditDomain(domain)
              }
            }}
            handleOpen={handleOpen}
            header={editDomain?.url}
          />
        </PopUp>
      )}

      {user.superadmin && (
        <div className="fixed z-10 w-full text-right sorting lg:pr-8 pr-4 right-0 md:w-[calc(100%-150px)] md:left-[unset] left-0 pl-4 md:pl-0">
          <div className="inline-block object-right w-full mt-4 ml-auto bg-white border rounded-lg sm:w-auto lg:mt-0">
            <ul className="flex justify-between p-2">
              <li className="px-2 border-r sm:px-4">
                <div
                  onClick={() => {
                    setGridInfo((prevState) => ({
                      ...prevState,
                      sort: {
                        ...prevState.sort,
                        url: !prevState.sort.url,
                      },
                    }))
                  }}
                  className="flex px-2 py-1 cursor-pointer"
                >
                  Sort
                  <img
                    className={`inline-block px-2 ${gridInfo.sort.url && 'transform rotate-180'}`}
                    src="/images/sorting.svg"
                    alt="Products"
                  />
                </div>
              </li>
              <li className="px-2 sm:px-4 ">
                <Button onClick={handleOpen} variant="primary">
                  Add New Domain
                  <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                </Button>
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className={`w-full ${user.superadmin ? 'mt-24' : 'mt-12'} text-right layoutContent`}>
        {domainData.map((domainDetail, i) => {
          return (
            <DomainItem
              key={i}
              keyItem={i}
              domainDetail={domainDetail}
              handleOpenProduct={handleOpenProduct}
              handleGotoProduct={handleGotoProduct}
              domainToggleHandler={domainToggleHandler}
              handleGotoSmts={handleGotoSmts}
              router={router}
              handleOpen={handleOpen}
              setContextData={setContextData}
              user={user}
              handleGotoReception={handleGotoReception}
              handleGotoSkyalpsInterface={handleGotoSkyalpsInterface}
            />
          )
        })}
        {domainData.length == 0 && !contextData.isLoading && (
          <div className="common" style={{ marginBottom: '30px' }}>
            <div className="p-4 text-center bg-white border border-gray-300 rounded-lg">No records found</div>
          </div>
        )}
      </div>
      {domainData.length > 0 && (
        <Pagination paginationInfo={gridInfo} setPaginationInfo={setGridInfo} rowsPerPage={'Rows per page'} />
      )}
    </div>
  )
}

export default Domains

export async function getServerSideProps(context) {
  return Authenticate(context)
}
