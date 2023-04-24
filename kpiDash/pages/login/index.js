import React, { useState } from 'react'
import { useUser } from '../../lib/hooks'

const Login = () => {
  const [user, {mutate}] = useUser()
  console.log("user : ", user)
  const [errorMsg, setErrorMsg] = useState('')
  const [values, setValues] = useState({
    password: '',
    showPassword: false,
  })

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const emailValue = e.currentTarget.email.value
    const passwordValue = e.currentTarget.password.value

    if (emailValue) {
      if (passwordValue) {
        const body = {
          email: emailValue,
          password: passwordValue,
        }

        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.status === 200) {
          console.log('LOGGED IN')
        } else {
          setErrorMsg('Incorrect email or password.')
        }
      } else {
        setErrorMsg('Please enter password.')
      }
    } else {
      setErrorMsg('Please enter Email.')
    }
  }

  return (
    <div className="flex items-center justify-center">
      <form id="login" className="flex flex-col w-1/5 mt-36" onSubmit={onSubmit}>
        <div>
          <div className="">
            <div className="w-full mb-4">
              <img
                className="mx-auto hoverSvg"
                src="https://edge.xero.com/images/1.0.0/logo/xero-logo.svg"
                alt="Xero"
                width="60"
                height=""
              />
            </div>
            <div className="w-full mb-6 text-center">
              <h2 className="font-medium text-2xl">Login in to Xero </h2>
            </div>
            <div className="w-full mb-4">
              {/* <h2 className="block text-grey-darker text-sm font-bold mb-2">Email</h2> */}
              <input
                id="email"
                label="email"
                type="text"
                className="shadow appearance-none border w-full py-2 px-3 text-grey-darker"
                placeholder="Email address"
              />
            </div>

            <div className="w-full mb-4">
              {/* <h2 className="block text-grey-darker text-sm font-bold mb-2">Password</h2> */}
              <span className="relative block">
                <input
                  id="password"
                  value={values.password}
                  onChange={handleChange('password')}
                  type={values.showPassword ? 'text' : 'password'}
                  className="shadow appearance-none border w-full py-2 px-3 text-grey-darker"
                  placeholder="Password"
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
            <div className="w-full my-4 text-center">
              <input
                form="login"
                type="submit"
                value="Log In"
                className={`w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium text-sm px-5 py-2.5 cursor-pointer`}
              />
            </div>
            <div className="w-full flex items-center justify-center gap-10 my-8">
                <div className='cursor-pointer text-xs text-blue-500 hover:text-blue-700 hover:underline'>Forgot password?</div>
                <div className='cursor-pointer text-xs text-blue-500 hover:text-blue-700 hover:underline'>Can't log in?</div>
            </div>
            {errorMsg && <div className="flex w-full mt-2 text-center text-red-500 md:mt-6">{errorMsg}</div>}
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
