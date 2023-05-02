import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Home() {

  const router = useRouter()
  const handleLogout = async () => {
    const res = await fetch('/api/logout', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    res.status === 200 ? router.push('/login') : console.log("Can't logout")
  }
  
  return (
    <>
      <Head>
        <title>Next Auth</title>
      </Head>
      <h1 className="text-3xl text-red-400">Hello world</h1>
      <button
        onClick={() => {
          handleLogout()
        }}
      >
        LOGOUT
      </button>
    </>
  )
}