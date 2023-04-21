import '../styles/global.css'
import 'tailwindcss/tailwind.css'
import React, { useState } from 'react'
import Layout from '../components/layout'
import { DefaultAppContext, AppProvider } from '../context/appContext'
import ConfirmModal from '../components/dialog/confirmModal'
import Loader from '../components/shared/loader'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const [contextData, setContextData] = useState(DefaultAppContext)
  const router = useRouter()

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  return (
    <AppProvider
      value={[
        contextData,
        setContextData,
        (value) => {
          setContextData((prevState) => ({
            ...prevState,
            isLoading: value,
          }))
        },
        (path, isConfirmed, callBack) => {
          if (!contextData.saveDirty) {
            isConfirmed('are you sure to leave current changes..').then((confirm) => {
              if (confirm) {
                if (path != '') {
                  router.push(path)
                }
                callBack && callBack()
              }
            })
          } else {
            callBack && callBack()
            if (path != '') {
              router.push(path)
            }
          }
        },
      ]}
    >
      <Head>
        <title>MTS-Online</title>
        <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="U-MTS | MTS-Online" />
      </Head>
      <>
        {pageProps.user ? (
          <Layout user={pageProps.user}>
            <Component {...pageProps} />
          </Layout>
        ) : (
          <Component {...pageProps.children} />
        )}
        {contextData.isLoading == true ? <Loader /> : null}
        <ConfirmModal />
      </>
    </AppProvider>
  )
}
