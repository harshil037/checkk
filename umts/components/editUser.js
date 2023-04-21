import React, { useState, useEffect, useRef } from 'react'
import { useDomains } from '../lib/hooks'
import isEmail from 'validator/lib/isEmail'
import { Input, Select } from './componentLibrary'
import Button from '../components/common/Button'
import { isValidValue, isEqual } from '../lib/utils'

const EditUser = ({ currentUser, user, handleClose, isDomainListPage, setLoading, isConfirmed }) => {
  const [userData, setUserData] = useState(
    user ? { ...user, roles: user.roles ? [...user.roles] : [] } : { status: false, roles: [] },
  )
  const [domains, { mutate: domainsMutate }] = useDomains()
  const [freeDomains, setFreeDomains] = useState(domains || [])
  const [errorMsg, setErrorMsg] = useState('')
  const [values, setValues] = useState({ showPassword: false })
  const [formErrors, setFormErrors] = useState({ isValid: false })
  const [validateKeyValue, setValidateKeyValue] = useState({ key: '', value: '' })
  const myRef = useRef(null)
  useEffect(() => {
    validate(validateKeyValue.key)
  }, [validateKeyValue])

  const validate = (key = 'all') => {
    let count = 0
    if (key == 'all' || key == 'name') {
      if (!isValidValue(userData.name)) {
        setFormErrors((state) => ({ ...state, ['name']: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['name']: '' }))
      }
    }

    if (key == 'all' || key == 'email') {
      const emailValue = userData.email
      if (!isValidValue(emailValue)) {
        setFormErrors((state) => ({ ...state, ['email']: 'This field is required' }))
        count = count + 1
      } else if (!isEmail(emailValue)) {
        setFormErrors((state) => ({ ...state, ['email']: 'Invalid email format' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['email']: '' }))
      }
    }

    if (!user && (key == 'all' || key == 'password')) {
      if (!isValidValue(userData?.password)) {
        count = count + 1
        setFormErrors((state) => ({ ...state, ['password']: 'This field is required' }))
      } else {
        setFormErrors((state) => ({ ...state, ['password']: '' }))
      }
    }

    if ((key == 'all' || key == 'password') && userData?.password?.length > 0) {
      const passReg = new RegExp('^(?=.{8,})(?=.*[0-9])(?=.*[@#$%^&+=]).*$')
      if (!passReg.test(userData.password)) {
        count = count + 1
        setFormErrors((state) => ({
          ...state,
          ['password']:
            'Password must be at least 8 characters and must contain at least one digit and one special character',
        }))
      } else {
        setFormErrors((state) => ({ ...state, ['password']: '' }))
      }
    } else {
      setFormErrors((state) => ({ ...state, ['password']: !user ? state.password : '' }))
    }
    setFormErrors((state) => ({ ...state, ['isValid']: count > 0 ? false : true }))
    return count > 0 ? false : true
  }

  const handleChange = (key) => (e) => {
    setUserData((state) => ({ ...state, [key]: e.target.value }))
  }

  const handleChangeDomain = (key, userRole) => (e) => {
    setUserData((state) => {
      return { ...state, roles: state.roles.map((r) => (r === userRole ? { ...userRole, [key]: e.target.value } : r)) }
    })
  }

  const toggleHandler = (key) => (e) => {
    setUserData((state) => ({ ...state, [key]: e.target.checked }))
  }

  useEffect(() => {
    const currentUserDomains =
      currentUser?.roles?.reduce((acc, r) => {
        return r.role === 'admin' ? [...acc, r.domain] : acc
      }, []) || []
    !currentUser.superadmin && setFreeDomains(domains?.filter((d) => !currentUserDomains.includes(d.url)))
  }, [currentUser, domains])

  useEffect(() => {
    const userDomains = userData?.roles?.map((r) => r.domain) || []
    setFreeDomains(domains?.filter((d) => !userDomains.includes(d.url)))
  }, [userData, domains])

  const handleDelete = async () => {
    setLoading(true)
    const { _id } = userData
    const res = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id }),
    })
    if (res.status === 202) {
      handleClose({ reason: 'update' })
    } else {
      const jsonRes = await res.json()
      setErrorMsg(jsonRes.error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate() == true) {
      if (!isEqual(user, userData)) {
        setLoading(true)
        const body = { ...userData, roles: userData.superadmin ? [] : userData.roles.filter((d) => d.domain !== '') }
        const res = await fetch('/api/users', {
          method: user ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.status === 201 || res.status === 200) {
          setUserData({})
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

  const handleRoleAdd = () => {
    setUserData((state) => ({ ...state, roles: [...state.roles, { domain: '', role: 'editor' }] }))
  }

  return (
    <form id={`user-${userData ? userData._id : ''}-form`} onSubmit={handleSubmit}>
      <div className="m-8 main-wrapper">
        <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-2/5">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">
              {!isDomainListPage ? 'User Detail' : 'Domains list of ' + userData.name}
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
            {errorMsg ? (
              <div ref={myRef} className="flex flex-wrap -mx-4 text-left">
                <div className="w-full px-4 mt-5 text-red-500 sm:w-1/2">{errorMsg}</div>
              </div>
            ) : null}

            {!isDomainListPage && (
              <div className="flex flex-wrap mb-2 -mx-4 text-left">
                <div className="w-full px-4 sm:w-1/2">
                  <h2 className="mt-4 mb-2">{userData?.name ? 'Change name' : 'Name'}</h2>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Name"
                    value={userData?.name || ''}
                    onChange={handleChange('name')}
                    onBlur={(e) => {
                      setValidateKeyValue({ key: 'name', value: e.target.value })
                    }}
                    variant={formErrors?.name ? 'danger' : 'primary'}
                  />
                  <span className="text-red-500">{formErrors?.name}</span>
                  <h2 className="mt-4 mb-2">{user ? 'Change password' : 'Create a password'}</h2>
                  <span className="relative block">
                    <Input
                      id="password"
                      type={values.showPassword ? 'text' : 'password'}
                      placeholder="*********"
                      autoComplete="off"
                      value={userData.password || ''}
                      onChange={handleChange('password')}
                      onBlur={(e) => {
                        setValidateKeyValue({ key: 'password', value: e.target.value })
                      }}
                      className="pr-46"
                      variant={formErrors?.password ? 'danger' : 'primary'}
                    />
                    <button
                      type="button"
                      className="absolute block right-[10px] opacity-60 top-1/2 transform -translate-y-1/2"
                    >
                      <img
                        onClick={() => {
                          setValues({ ...values, showPassword: !values.showPassword })
                        }}
                        src={values.showPassword ? '/images/passwordvisible.svg' : '/images/password.png'}
                        alt=""
                        width="20px"
                      />
                    </button>
                  </span>
                  <span className="text-red-500">{formErrors?.password}</span>
                </div>
                <div className="w-full px-4 sm:w-1/2">
                  <h2 className="mt-4 mb-2">{userData?.email ? 'Change email' : 'Email'}</h2>
                  <Input
                    value={userData?.email || ''}
                    onChange={handleChange('email')}
                    type="email"
                    id="email"
                    placeholder="Email address"
                    autoComplete="off"
                    variant={formErrors?.email ? 'danger' : 'primary'}
                    onBlur={(e) => {
                      setValidateKeyValue({ key: 'email', value: e.target.value })
                    }}
                  />
                  <span className="text-red-500">{formErrors?.email}</span>
                  <h2 className="mt-4 mb-2">{userData?.token ? 'Change token' : 'Token'}</h2>
                  <Input
                    value={userData?.token || ''}
                    onChange={handleChange('token')}
                    type="text"
                    id="token"
                    placeholder="Token"
                    autoComplete="off"
                    variant={formErrors?.token ? 'danger' : 'primary'}
                    onBlur={(e) => {
                      setValidateKeyValue({ key: 'token', value: e.target.value })
                    }}
                  />
                  <span className="text-red-500">{formErrors?.token}</span>
                </div>
              </div>
            )}
            {!isDomainListPage && currentUser?.superadmin && (
              <div className="justify-between w-full sm:flex sm:flex-wrap sm:w-1/2 toggle-popup">
                <div className="w-full lg:w-1/2">
                  <div className="flex px-2 py-1">
                    <div className="flex items-center">
                      <Input
                        type="toggle"
                        id="SuperAdmin"
                        variant="primary"
                        checked={(userData && userData.superadmin) || false}
                        onChange={toggleHandler('superadmin')}
                      />
                      <h2 className="mx-2 my-4">Admin</h2>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2">
                  <div className="flex px-2 py-1">
                    <div className="flex items-center">
                      <Input
                        type="toggle"
                        id="Status"
                        variant="primary"
                        checked={(userData && userData.status) || false}
                        onChange={toggleHandler('status')}
                      />
                      <h2 className="mx-2 my-4">Status</h2>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!userData?.superadmin && (
              <div className="flex flex-wrap -mx-4 text-left">
                <div className="w-full px-4 mt-5 lg:mt-0 sm:w-2/2">
                  <div className={`w-full p-4 ${!isDomainListPage && `rounded-lg px-4 border border-gray-300`}`}>
                    {!isDomainListPage && <h2 className="mb-2">Domains</h2>}
                    <div className="w-full lg:w-3/3">
                      {domains &&
                        !userData?.superadmin &&
                        userData?.roles?.map((userRole, i) => (
                          <div
                            className={`items-center py-4 bg-white border-b border-gray-300 ${
                              i == userData?.roles.length - 1 && 'border-b-0'
                            }`}
                            key={i}
                          >
                            <div className="flex flex-wrap w-full gap-2 -mx-4 text-left">
                              <div className="w-full px-4 sm:w-2/5">
                                <h2 className="mb-1">Domain</h2>
                                <Select onChange={handleChangeDomain('domain', userRole)} variant="primary">
                                  {userRole.domain ? (
                                    <option value={userRole.domain}>{userRole.domain}</option>
                                  ) : (
                                    <option value=""></option>
                                  )}
                                  {freeDomains?.map((domain) => (
                                    <option key={domain._id} value={domain.url}>
                                      {domain.url}
                                    </option>
                                  ))}
                                </Select>
                              </div>
                              <div className="w-full px-4 sm:w-2/5">
                                <h2 className="mb-1">Role</h2>
                                <Select onChange={handleChangeDomain('role', userRole)} variant="primary">
                                  <option value="editor">Editor</option>
                                  <option value="admin">Admin</option>
                                </Select>
                              </div>
                              <div className="flex self-end w-full p-4 cursor-pointer sm:w-auto">
                                <img
                                  onClick={() =>
                                    setUserData((state) => {
                                      const indexToRemove = state.roles.findIndex((r) => r === userRole)
                                      return { ...state, roles: state.roles.filter((_, i) => i !== indexToRemove) }
                                    })
                                  }
                                  className="inline-block ml-auto"
                                  src="/images/langaugedelete.svg"
                                  alt="Langauge Delete"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      {domains && !userData?.superadmin && freeDomains?.length > 0 && (
                        <div className="mt-2">
                          <Button onClick={handleRoleAdd} variant="primary">
                            Add New Domain
                            <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4">
            {user && !isDomainListPage && (
              <div className="-mx-4 ">
                <div className="w-full px-4 sm:w-2/2">
                  <Button
                    variant="danger"
                    type="button"
                    onClick={async () => {
                      let confirmed = await isConfirmed('Are you sure to delete this user')
                      if (confirmed) {
                        handleDelete()
                      }
                    }}
                  >
                    Delete user
                  </Button>
                </div>
              </div>
            )}

            <div className="-mx-4 ">
              <div className={`w-full px-4 sm:w-2/2`}>
                <Button
                  className="float-right"
                  variant="primary"
                  form={`user-${userData ? userData._id : ''}-form`}
                  type="submit"
                >
                  {user ? 'Update user' : 'Create user'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default EditUser
