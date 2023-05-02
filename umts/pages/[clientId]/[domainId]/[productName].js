import WidgetView from '../../../components/shared/widgetView/widgetView'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
// import '@mts-online/library/dist/esm/index.css'

const Product = () => {
  const [attributes, setAttributes] = useState([])
  const [defaultLanguage, setDefaultLanguage] = useState('en')
  const [widgetData, setWidgetData] = useState(null)
  const router = useRouter()
  const { clientId, domainId, productName } = router.query

  useEffect(async () => {
    if (clientId) {
      await fetch('/api/auth', {
        method: 'DELETE',
      })
    }
  }, [])

  useEffect(async () => {
    await fetchWidgetData(productName)
  }, [clientId, domainId, productName])

  const fetchWidgetData = async (passProduct) => {
    if (clientId && domainId) {
      let res = await fetch(`/api/client/${clientId}/${domainId}/${passProduct}`, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.status == 200) {
        const resJson = await res.json()
        const result = resJson.result
        setWidgetData(result)
        setAttributes((result.data?.attributes || []).reduce((obj, item) => Object.assign(obj, { [item]: '' }), {}))
      } else {
        setWidgetData(null)
      }
    }
  }

  return (
    <div className="bg-white p-8 h-screen">
      {widgetData && (
        <WidgetView
          module={widgetData?.module || widgetData?.data?.module}
          language={defaultLanguage}
          data={widgetData?.data?.blockProps}
          lang={widgetData?.data?.languages || ['en', 'de', 'it']}
          setDefaultLanguage={setDefaultLanguage}
          productName={productName}
          version={widgetData?.data?.version}
          domainId={widgetData?.id}
          clientId={clientId}
          attributes={attributes}
          setAttributes={setAttributes}
          products={widgetData.products}
          changeProduct={(passProduct) => {
            router.push(`/${clientId}/${domainId}/${passProduct}`, undefined, { shallow: true })
          }}
          widgetData={widgetData}
        />
      )}
    </div>
  )
}

export default Product
