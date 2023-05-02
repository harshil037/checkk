import { useState, useEffect, useContext, useRef } from 'react'
import Authenticate from '../../../lib/authenticate'
import EditUser from '../../../components/editUser'
import { useIsMounted } from '../../../lib/hooks'
import PopUp from '../../../components/dialog/popUp'
import { Input } from '../../../components/componentLibrary'
import Button from '../../../components/common/Button'
import useConfirm from '../../../components/dialog/useConfirm'
import { AppContext } from '../../../context/appContext'
import { useRouter } from 'next/router'
import Link from 'next/link'
import GridMaster from '../../../components/layout/gridMaster'

const Users = (props) => {
  const [isComponentMounted, setIsComponentMounted] = useState(false)
  const [userData, setUserData] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [editUser, setEditUser] = useState()
  const [isSearching, setIsSearching] = useState(false)
  const [isDomainListPage, setIsDomainListPage] = useState(false)
  const [checkAll, setCheckAll] = useState(false)
  const isMounted = useIsMounted()
  const { isConfirmed } = useConfirm()
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const router = useRouter()
  const { domainUrl } = router.query
  const delayDebounceFn = useRef(null)

  const [gridInfo, setGridInfo] = useState({
    currentPage: 1,
    perPage: 10,
    sort: { name: true },
    searchText: '',
    searchToggle: false,
    pageList: { start: 0, end: 5 },
  })

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'users',
    }))
  }, [])

  useEffect(async () => {
    if (!isSearching && props.user) {
      await getUsers()
    }
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort, domainUrl])

  useEffect(async () => {
    if (delayDebounceFn) {
      clearTimeout(delayDebounceFn.current)
    }
    delayDebounceFn.current = setTimeout(async () => {
      if (isSearching) {
        await getUsers()
      }
      if (isMounted.current) {
        setIsSearching(false)
      }
    }, 1500)
    return () => clearTimeout(delayDebounceFn.current)
  }, [gridInfo.searchText])

  const handleOpen = (_id) => {
    if (_id) {
      const userEdit = userData && userData.find((u) => u._id === _id)
      setEditUser(userEdit)
    } else {
      setEditUser()
    }
    setOpenModal(true)
  }

  const handleClose = async (event, reason) => {
    setIsDomainListPage(false)
    if (reason !== 'backdropClick') {
      setOpenModal(false)
      setEditUser()
    }
    if (event.reason == 'update') {
      await getUsers()
    }
  }

  const updateUser = async (body) => {
    setLoading(true)
    const response = await fetch('/api/users', {
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
    const str = 'Are you sure to change this users ' + (key == 'superadmin' ? ' super admin status' : ' status')
    let confirmed = await isConfirmed(str)
    if (confirmed) {
      const { error, user: userEdit } = await updateUser({
        _id,
        [key]: toggle,
        roles: key == 'superadmin' ? userData.roles : [],
      })
      if (userEdit) {
        getUsers()
      }
    }
  }

  const getUsers = async () => {
    setLoading(true)
    setCheckAll(false)
    let res = fetch(
      '/api/users?req_sort=' +
        (gridInfo.sort.name == true ? 1 : -1) +
        '&req_offset=' +
        gridInfo.perPage * (gridInfo.currentPage - 1) +
        '&req_limit=' +
        gridInfo.perPage +
        '&req_search=' +
        gridInfo.searchText +
        '&req_domain_url=' +
        domainUrl,
      {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    res
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
        if (data?.users) {
          setUserData(
            data.users.map((u) => {
              const { name, email, superadmin, status, _id, roles, token } = u
              return {
                _id,
                name,
                email,
                superadmin: superadmin ? superadmin : false,
                status: status ? status : false,
                roles,
                token,
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
  const deleteSelected = async () => {
    let confirmed = await isConfirmed('Are you sure to delete selected users')
    if (confirmed) {
      let ids = []
      userData
        .filter((x) => x.isSelected)
        ?.map((x) => {
          ids.push(x._id)
        })
      setLoading(true)
      const res = await fetch('/api/users', {
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

  useEffect(() => setIsComponentMounted(true), [])
  if (!isComponentMounted) {
    return null
  }

  return (
    <div className="mt-24">
      <GridMaster
        newButtonText="Add New User"
        headerText="Users List"
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
        length={userData.length}
        setIsSearching={setIsSearching}
        passedData={userData}
        deleteSelected={deleteSelected}
        selectedTitle="User"
      >
        {userData.length > 0 ? (
          <div className="mt-5 table-responsive custom-scrollbar">
            <table className="relative overflow-hidden rounded-lg customTable" width="100%">
              <thead>
                <tr className="text-left">
                  <td width="20%" className="py-4 pl-4">
                    <div className="relative flex items-center">
                      <Input
                        checked={checkAll}
                        id="checkAll"
                        className="tick-checked"
                        onChange={(e) => {
                          let arr = [...userData]
                          arr.map((d) => {
                            d.isSelected = e.target.checked
                          })
                          setUserData(arr)
                          setCheckAll(!checkAll)
                        }}
                        type="checkbox"
                        variant="primary"
                      />
                      <span className="mr-4 border border-gray-300 checkmark" />
                      <p>Name</p>
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
                  <td width="20%">Email</td>
                  <td>Super Admin</td>
                  <td colSpan="3">Status</td>
                </tr>
              </thead>
              <caption className="absolute mx-4 border-b border-black border-dashed border-bottom" />
              <tbody>
                {userData.map((userItem, i) => {
                  return (
                    <tr key={'user' + i} className="">
                      <td className="py-4 pl-4 text-left ">
                        <div className="relative flex">
                          <Input
                            id={'ch' + i}
                            checked={userItem.isSelected | false}
                            className="tick-checked"
                            onChange={() => {
                              let arr = [...userData]
                              const uIndex = arr.findIndex((x) => x._id == userItem._id)
                              arr[uIndex].isSelected = !arr[uIndex].isSelected
                              setUserData(arr)
                              setCheckAll(arr.filter((x) => !x.isSelected).length > 0 ? false : true)
                            }}
                            type="checkbox"
                            variant="primary"
                          />
                          <span className="mr-4 border border-gray-300 checkmark"></span>

                          {userItem.name}
                        </div>
                      </td>
                      <td className="py-4 text-left">{userItem.email}</td>
                      <td className="py-4 text-left">
                        <div className="flex items-center">
                          <Input
                            onChange={() =>
                              userToggleHandler({
                                _id: userItem._id,
                                value: JSON.parse(userItem.superadmin),
                                key: 'superadmin',
                              })
                            }
                            type="toggle"
                            id={userItem._id + '1'}
                            checked={userItem.superadmin}
                            variant="primary"
                          />
                        </div>
                      </td>
                      <td className="py-4 text-left">
                        <div className="flex items-center">
                          <Input
                            variant="primary"
                            onChange={() =>
                              userToggleHandler({
                                _id: userItem._id,
                                value: JSON.parse(userItem.status),
                                key: 'status',
                              })
                            }
                            type="toggle"
                            id={userItem._id}
                            checked={userItem.status}
                          />
                        </div>
                      </td>
                      <td className="flex items-end justify-end p-4 text-right">
                        {!userItem.superadmin && (
                          <Button
                            onClick={() => {
                              setIsDomainListPage(true)
                              handleOpen(userItem._id)
                            }}
                            variant="primary"
                          >
                            Accessible Domains
                            <img className="inline-block px-2" src="/images/userdomains.svg" alt="Products" />
                          </Button>
                        )}
                      </td>
                      <td className="p-4 text-right" style={{ width: '10%' }}>
                        <Button
                          className="flex items-center justify-between mr-5 w-28"
                          onClick={() => {
                            setIsDomainListPage(false)
                            handleOpen(userItem._id)
                          }}
                          variant="primary"
                        >
                          Edit User
                          <img className="inline-block ml-2" src="/images/edituser.svg" alt="Products" />
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
                {domainUrl ? (
                  <>
                    {' '}
                    No records found for the domain {domainUrl + ' '}
                    <Link href={'/admin/users'}>
                      <a className="text-blue-600 underline hover:text-blue-800">(Other Users)</a>
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
            <EditUser
              currentUser={props.user}
              isDomainListPage={isDomainListPage}
              user={editUser}
              handleClose={handleClose}
              setLoading={setLoading}
              isConfirmed={isConfirmed}
            />
          </PopUp>
        )}
      </GridMaster>
    </div>
  )
}

export default Users

export async function getServerSideProps(context) {
  return Authenticate(context)
}
