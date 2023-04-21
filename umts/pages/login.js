import React, { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../lib/hooks'
import { AppContext } from '../context/appContext'

const Login = () => {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')
  const [user, { mutate }] = useUser()
  const [, , setLoading] = useContext(AppContext)
  const [values, setValues] = useState({
    password: '',
    showPassword: false,
  })

  useEffect(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user) {
      if (user.superadmin) {
        router.push('/admin/domains')
      } else {
        if (user.email === 'monika@pragserwildsee.com') {
          router.push('/admin/parking')
        } else if (user.email === 'info@arianes-guesthouse.com') {
          router.push('/admin/smartresponse/u1060')
        } else if (user.email === 'info@belvedere-hotel.it') {
          router.push('/admin/vouchers')
        } else {
          router.push('/admin/domains')
        }
      }
    }
  }, [user])

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const emailValue = e.currentTarget.email.value
    const passwordValue = e.currentTarget.password.value
    setLoading(true)
    if (emailValue) {
      if (passwordValue) {
        const body = {
          // email: e.currentTarget.email.value,
          email: emailValue,
          // password: e.currentTarget.password.value,
          password: passwordValue,
        }
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.status === 200) {
          const userObj = await res.json()
          mutate(userObj)
        } else {
          setLoading(false)
          setErrorMsg('Incorrect username or password.')
        }
      } else {
        setLoading(false)
        setErrorMsg('Please enter password.')
      }
    } else {
      setLoading(false)
      setErrorMsg('Please enter username.')
    }
  }

  return !user ? (
    <div className="flex items-center justify-center customBg">
      <form id="login" className="flex flex-col pt-10v w-logo" onSubmit={onSubmit}>
        <div>
          <div className="w-full max-w-lg px-6 pt-5 pb-2 mx-auto bg-white rounded-lg md:px-28 md:pt-20 md:pb-10 sm:px-12 sm:pt-10 sm:pb-5">
            <img
              src="/images/loginlogo.svg"
              className="mx-auto mb-4 md:mb-14 sm:mb-7"
              alt="mtsonline"
              width="212"
              height="35"
            />
            <div className="w-full mb-4 md:mb-8">
              <h2 className="pb-1">Email</h2>
              <input
                id="email"
                label="email"
                type="text"
                className="w-full py-3 pl-3 pr-10 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg email_input pr-35 focus:outline-none focus:shadow-outline"
                placeholder="e-mail"
              />
            </div>
            <div className="w-full">
              <h2 className="pb-1">Password</h2>
              <span className="relative block">
                <input
                  id="password"
                  value={values.password}
                  onChange={handleChange('password')}
                  type={values.showPassword ? 'text' : 'password'}
                  className="w-full py-3 pl-3 pr-10 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline"
                  placeholder="*********"
                />
                <button
                  type="button"
                  className="absolute block right-[10px] opacity-60 top-1/2 transform -translate-y-1/2"
                >
                  <img
                    width="20px"
                    onClick={() => {
                      setValues({ ...values, showPassword: !values.showPassword })
                    }}
                    src={values.showPassword ? './images/passwordvisible.svg' : './images/password.png'}
                    alt=""
                  />
                </button>
              </span>
            </div>
            <div className="w-full mt-4 text-center md:mt-8">
              <input
                form="login"
                type="submit"
                value="Sign In"
                className={`w-full px-12 py-2 md:px-24  text-white font-semibold bg-primary-400 cursor-pointer`}
              />
            </div>
            {errorMsg && <div className="flex w-full mt-2 text-center text-red-500 md:mt-6">{errorMsg}</div>}
            <div className="p-4 text-center footer sm:mt-14 mt-7">
              <span>
                ©{new Date().getFullYear()} mts<span className="text-green-300">o</span>nline Gmbh
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  ) : null
}

export default Login
