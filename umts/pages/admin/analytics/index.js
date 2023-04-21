import React, { useContext, useEffect } from 'react'
import Authenticate from '../../../lib/authenticate'
import { AppContext } from '../../../context/appContext'

const Analytics = () => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'analytics',
    }))
  }, [])

  return (
    <div className="flex items-center justify-center w-full bg-white rounded-lg h-96 mt-9">
      <p className="text-2xl font-bold text-gray-500">Coming Soon</p>
    </div>
  )
}

export default Analytics

export async function getServerSideProps(context) {
  return Authenticate(context)
}
