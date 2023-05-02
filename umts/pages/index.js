import { useEffect, useState } from 'react'
import Login from './login'
import { useUser } from '../lib/hooks'

const Home = ({ authenticated }) => {
  const [user] = useUser()

  useEffect(() => {
    // user && Router.push('/admin')
  }, [user])

  return <Login />
}
export default Home
