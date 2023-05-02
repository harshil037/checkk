import { useState, useEffect, useContext, useRef } from 'react'
import Authenticate from '../../../lib/authenticate'
import { useDomains, useIsMounted } from '../../../lib/hooks'
import PopUp from '../../../components/dialog/popUp'
import EditClient from '../../../components/editClient'
import { Input } from '../../../components/componentLibrary'
import Button from '../../../components/common/Button'
import Link from 'next/link'
import useConfirm from '../../../components/dialog/useConfirm'
import { AppContext } from '../../../context/appContext'
import EditDomain from '../../../components/editDomain'
import { useRouter } from 'next/router'
import GridMaster from '../../../components/layout/gridMaster'
import ImageGallery from '../../../components/common/ImageGallery'

const Clients = (props) => {
  const [isComponentMounted, setIsComponentMounted] = useState(false)
  const [clientData, setClientData] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [openDomainModal, setOpenDomainModal] = useState(false)
  const [editClient, setEditClient] = useState()
  const [isSearching, setIsSearching] = useState(false)
  const [domains, { mutate: domainsMutate }] = useDomains()
  const [checkAll, setCheckAll] = useState(false)
  const [editDomain, setEditDomain] = useState(false)
  const [uploadModal, setUploadModal] = useState({ visible: false, clientId: '' })
  const { isConfirmed } = useConfirm()
  const isMounted = useIsMounted()
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const router = useRouter()
  const { domainId } = router.query
  const delayDebounceFn = useRef(null)

  const [gridInfo, setGridInfo] = useState({
    length: 0,
    currentPage: 1,
    perPage: 10,
    sort: { name: true },
    searchText: '',
    searchToggle: false,
    pageList: { start: 0, end: 5 },
  })

  useEffect(async () => {
    if (!isSearching && props.user) {
      await getClients()
    }
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort, domainId])

  useEffect(async () => {
    if (delayDebounceFn) {
      clearTimeout(delayDebounceFn.current)
    }
    delayDebounceFn.current = setTimeout(async () => {
      if (isSearching) {
        await getClients()
      }
      if (isMounted.current) {
        setIsSearching(false)
      }
    }, 1500)

    return () => clearTimeout(delayDebounceFn.current)
  }, [gridInfo.searchText])

  const handleOpen = (_id) => {
    if (_id) {
      const userEdit = clientData && clientData.find((u) => u._id === _id)
      setEditClient(userEdit)
    } else {
      setEditClient()
    }
    setOpenModal(true)
  }

  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpenModal(false)
      setEditClient()
    }
    if (event.reason == 'update') {
      getClients()
      setContextData((prevState) => ({
        ...prevState,
        search: {
          ...prevState.search,
          clientUpdate: prevState.search.clientUpdate + 1,
          domainUpdate: prevState.search.domainUpdate + 1,
        },
      }))
    }
  }

  const updateUser = async (body) => {
    setLoading(true)
    const response = await fetch('/api/clients', {
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

  const userToggleHandler = async ({ _id, value, key }) => {
    const toggle = !value
    let confirmed = await isConfirmed('Are you sure to change this clients status')
    if (confirmed) {
      const { error, client: userEdit } = await updateUser({
        _id,
        [key]: toggle,
      })
      if (userEdit) {
        getClients()
      }
    }
  }
  const getClients = async () => {
    setLoading(true)
    fetch(
      '/api/clients?req_sort=' +
        (gridInfo.sort.name == true ? 1 : -1) +
        '&req_offset=' +
        gridInfo.perPage * (gridInfo.currentPage - 1) +
        '&req_limit=' +
        gridInfo.perPage +
        '&req_search=' +
        gridInfo.searchText +
        '&req_domainId=' +
        domainId,
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
        if (isMounted.current) {
          setCheckAll(false)
        }
        if (data?.clients) {
          setClientData(
            data.clients.map((u) => {
              const { name, clientNumber, status, _id, domains, contact, dataSources, languages, addresses } = u
              return {
                _id,
                name,
                clientNumber,
                status: status ? status : false,
                domains,
                contact,
                dataSources,
                languages,
                addresses,
              }
            }),
          )
          setGridInfo((state) => ({
            ...state,
            ['length']: data.length,
          }))
          setLoading(false)
        }
      })
  }

  const getDomains = (ids) => {
    const returnDomains = ids ? (
      <span className="seprator">
        {domains
          ?.filter((x) => ids.includes(x._id))
          .map((tempDomain, i) => (
            <span
              key={i}
              onClick={() => {
                setEditDomain(tempDomain)
                setOpenDomainModal(true)
              }}
              className="cursor-pointer"
            >
              {' '}
              {tempDomain.url}
            </span>
          ))}
      </span>
    ) : (
      []
    )
    return returnDomains
  }

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'clients',
    }))
  }, [])

  useEffect(() => setIsComponentMounted(true), [])
  if (!isComponentMounted) {
    return null
  }

  const deleteSelected = async () => {
    const str = 'Are you sure to delete selected clients'
    const confirmed = await isConfirmed(str)
    if (confirmed) {
      setLoading(true)
      let ids = []
      clientData
        .filter((x) => x.isSelected)
        ?.map((x) => {
          ids.push(x._id)
        })
      const res = await fetch('/api/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ids, isMul: true }),
      })
      setLoading(false)
      if (res.status === 202) {
        setGridInfo((state) => ({
          ...state,
          ['currentPage']: 1,
          ['perPage']: 10,
          ['searchText']: '',
          ['sort']: {
            ...state.sort,
            name: true,
          },
        }))
      }
    }
  }

  const handleGotoRequests = (clientId) => {
    router.push(`/admin/requests/${clientId}`)
  }

  return (
    <div className="mt-24">
      <GridMaster
        newButtonText="Add New Client"
        headerText="Clients List"
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
        handleOpen={handleOpen}
        setIsSearching={setIsSearching}
        passedData={clientData}
        deleteSelected={deleteSelected}
        selectedTitle="Client"
      >
        {clientData.length > 0 ? (
          <div className="mt-5 table-responsive ">
            <table className="relative overflow-hidden rounded-lg customTable" width="100%">
              <thead>
                <tr className="text-left">
                  <td width="20%" className="py-4 pl-4">
                    <div className="relative flex">
                      <Input
                        id="checkAll"
                        className="tick-checked"
                        checked={checkAll}
                        onChange={(e) => {
                          let arr = [...clientData]
                          arr.map((d) => {
                            d.isSelected = e.target.checked
                          })
                          setClientData(arr)
                          setCheckAll(!checkAll)
                        }}
                        type="checkbox"
                        variant="primary"
                      />
                      <span className="mr-4 border border-gray-300 checkmark" />
                      Name
                      <img
                        onClick={() => {
                          setGridInfo((prevState) => ({
                            ...prevState,
                            sort: {
                              ...prevState.sort,
                              name: !prevState.sort.name,
                            },
                          }))
                        }}
                        src="/images/uparrow.svg"
                        className={`inline-block ml-4 cursor-pointer ${gridInfo.sort.name && 'transform rotate-180'}`}
                        alt="sortList"
                      />
                    </div>
                  </td>
                  <td width="15%">User ID</td>
                  <td width="15%">Status</td>
                  <td width="25%">Domain Name</td>
                  <td width="10%">Images</td>
                  <td width="5%"></td>
                  <td width="10%"></td>
                </tr>
              </thead>
              <caption className="absolute mx-4 border-b border-black border-dashed border-bottom" />
              <tbody>
                {clientData.map((userItem, i) => {
                  return (
                    <tr key={i + 'client'} className="">
                      <td className="py-4 pl-4 text-left">
                        <div className="relative flex">
                          <Input
                            id={'client' + i}
                            className="tick-checked"
                            checked={userItem.isSelected | false}
                            onChange={() => {
                              let arr = [...clientData]
                              const uIndex = arr.findIndex((x) => x._id == userItem._id)
                              arr[uIndex].isSelected = !arr[uIndex].isSelected
                              setClientData(arr)
                              setCheckAll(arr.filter((x) => !x.isSelected).length > 0 ? false : true)
                            }}
                            type="checkbox"
                            variant="primary"
                          />
                          <span className="mr-4 border border-gray-300 checkmark" />
                          {userItem.name}
                        </div>
                      </td>
                      <td className="py-4 text-left">{userItem.clientNumber}</td>
                      <td className="py-4 text-left">
                        <div className="flex items-center">
                          <Input
                            onChange={() =>
                              userToggleHandler({
                                _id: userItem._id,
                                value: JSON.parse(userItem.status),
                                key: 'status',
                              })
                            }
                            type="toggle"
                            id={'clientStatus' + i}
                            checked={userItem.status | false}
                            variant="primary"
                          />
                        </div>
                      </td>
                      <td className="py-4 text-left">
                        <p className="w-full max-w-sm text-base text-left whitespace-normal">
                          {getDomains(userItem.domains)}
                        </p>
                      </td>
                      <td className="text-left">
                        <Button onClick={() => setUploadModal({ visible: true, clientId: userItem.clientNumber })}>
                          Images
                        </Button>
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          className="mr-8"
                          onClick={() => {
                            handleGotoRequests(userItem.clientNumber)
                          }}
                          variant="primary"
                        >
                          Requests
                        </Button>
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          className="flex items-center justify-between mr-5 w-28"
                          onClick={() => {
                            handleOpen(userItem._id)
                          }}
                          variant="primary"
                        >
                          Edit client
                          <img
                            className="inline-block ml-2"
                            src="/images/edituser.svg"
                            alt="Products"
                            width="18"
                            height="18"
                          />
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
            {!contextData.isLoading && (
              <div>
                {domainId && domains ? (
                  <>
                    {' '}
                    No records found for the domain {domains.find((x) => x._id == domainId).name + ' '}
                    <Link href={'/admin/clients'}>
                      <a className="text-blue-600 underline hover:text-blue-800">(Other Clients)</a>
                    </Link>{' '}
                  </>
                ) : (
                  'No records found'
                )}
              </div>
            )}
          </div>
        )}

        {openModal && (
          <PopUp openModal={openModal}>
            <EditClient
              setLoading={setLoading}
              client={editClient}
              handleClose={handleClose}
              isConfirmed={isConfirmed}
            />
          </PopUp>
        )}

        {openDomainModal && (
          <PopUp openModal={openDomainModal}>
            <EditDomain
              setLoading={(value) => {
                setLoading(value)
              }}
              isConfirmed={isConfirmed}
              passedDomain={editDomain}
              handleClose={async (event, reason) => {
                if (event.reason == 'update') {
                  domainsMutate
                }
                setOpenDomainModal(false)
              }}
            />
          </PopUp>
        )}

        {uploadModal.visible && (
          <PopUp openModal={uploadModal.visible}>
            <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-14 lg:w-4/5">
              <div className="flex justify-between pb-2 border-b border-black border-solid mb-4">
                <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Images</h1>
                <svg
                  onClick={() => setUploadModal({ visible: false, clientId: '' })}
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
              <ImageGallery
                clientId={uploadModal.clientId}
                // onSelect={(images) => {
                //   console.log({ images })
                // }}
                // mode="gallery"
                // multiSelect={false}
                selectable={false}
              />
            </div>
          </PopUp>
        )}
      </GridMaster>
    </div>
  )
}

export default Clients

export async function getServerSideProps(context) {
  return Authenticate(context)
}
