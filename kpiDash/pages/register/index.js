import { useRouter } from 'next/router'
import React, { useState } from 'react'

const Register = () => {
  const router = useRouter()
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
    const firstName = e.currentTarget.firstName.value
    const lastName = e.currentTarget.lastName.value
    const emailValue = e.currentTarget.email.value
    const passwordValue = e.currentTarget.password.value

    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    if (emailValue.match(mailformat)) {
      if (passwordValue) {
        const body = {
          firstname: firstName,
          lastname: lastName,
          email: emailValue,
          password: passwordValue,
        }
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.status === 201) {
          router.push("/login")
        } else {
          console.log('Not Register')
        //   setErrorMsg('Incorrect email or password.')
        }
      } else {
        setErrorMsg('Please enter password.')
      }
    } else {
      setErrorMsg('Please enter valid email address.')
    }
  }

  return (
    <div className="flex items-center justify-center">
      <form id="register" className="flex flex-col w-1/5 mt-36" onSubmit={onSubmit}>
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
              <h2 className="font-medium text-2xl">Register to Xero </h2>
            </div>
            <div className="w-full mb-4">
              {/* <h2 className="block text-grey-darker text-sm font-bold mb-2">Email</h2> */}
              <input
                id="firstName"
                label="FirstName"
                type="text"
                className="shadow appearance-none border w-full py-2 px-3 text-grey-darker"
                placeholder="First Name"
              />
            </div>
            <div className="w-full mb-4">
              {/* <h2 className="block text-grey-darker text-sm font-bold mb-2">Email</h2> */}
              <input
                id="lastName"
                label="LastName"
                type="text"
                className="shadow appearance-none border w-full py-2 px-3 text-grey-darker"
                placeholder="Last Name"
              />
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
                form="register"
                type="submit"
                value="Register"
                className={`w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium text-sm px-5 py-2.5 cursor-pointer`}
              />
            </div>
            {errorMsg && <div className="flex w-full mt-2 text-center text-red-500 md:mt-6">{errorMsg}</div>}
          </div>
        </div>
      </form>
    </div>
  )
}

export default Register
