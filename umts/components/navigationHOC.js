import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { slugify } from '../lib/utils'
import { AppContext } from '../context/appContext'
import useConfirm from '../components/dialog/useConfirm'

const NavigationHOC = (WrappedComponent, props) => {
  const [clients, setClients] = useState()
  const [domains, setDomains] = useState()
  const router = useRouter()
  const [contextData, setContextData, setLoading, navigateTo] = useContext(AppContext)
  const { isConfirmed } = useConfirm()

  useEffect(() => {
    setClients(props.passedClients)
  }, [props.passedClients])

  useEffect(() => {
    setDomains(props.passedDomains)
  }, [props.passedDomains])

  const handleGotoProduct = async ({ _id }, productId) => {
    if (_id && productId) {
      const domain = domains && domains.find((d) => d._id === _id)
      const product = domain?.products.find((p) => p._id === productId)
      const findClient =
        clients &&
        clients.find((c) => {
          return c?.domains?.includes(domain._id)
        })

      if (findClient?.clientNumber && product?.name) {
        if (product.type === 'website') {
          router.push(
            `/admin/product/website/${findClient.clientNumber}/${domain._id}/${product._id}/${
              product.pageTree || '_new'
            }`,
          )
        } else {
          router.push(`/admin/product/module/${findClient.clientNumber}/${domain._id}/${product._id}`)
        }
      } else {
        setLoading(false)
        await isConfirmed('This domain is not associated with any client, please attach to a client', true)
      }
    }
  }

  return (
    <WrappedComponent
      {...{
        ...props,
        clients,
        domains,
        handleGotoProduct,
        router,
        contextData,
        setContextData,
        setLoading,
        isConfirmed,
        navigateTo,
      }}
    />
  )
}

export default NavigationHOC
