import React, { useState, useEffect, useContext } from 'react'
import '@mts-online/library/dist/esm/index.css'
import { useRouter } from 'next/router'
import ErrorBoundary from '../../../../../components/shared/errorBoundary'
import { WidgetVmts2, ThemeProvider } from '../../../../../components/componentLibrary/'
import apiRequest from '../../../../../components/dialog/apiRequest'
import { useDomains, useIsMounted } from '../../../../../lib/hooks'
import { getApi } from '../../../../../lib/hooks'
import { AppContext } from '../../../../../context/appContext'
import translations from '../../../../../translations/voucher.json'
import Authenticate from '../../../../../lib/authenticate'

const NewVoucher = () => {
  const [language, setLanguage] = useState('de')
  const [labels, setLabels] = useState({})
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const [productPageData, setProductPageData] = useState({})
  const [clinetProduct, setClientProduct] = useState({})

  const router = useRouter()
  const { clientId, domainId, productId } = router.query

  useEffect(() => {
    fetchWidgetData(clientId, domainId, productId)
  }, [clientId, domainId, productId])

  const getTranslation = (translations, language) => {
    const translationObj = {}
    for (const translation in translations) {
      translationObj[translation] = translations[translation][language] || translation
    }
    return translationObj
  }
  useEffect(() => {
    const translation = getTranslation(translations, language)
    setLabels(translation)
  }, [language])

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'vouchers',
    }))

    if (window.localStorage.getItem('mts-language')) {
      setLanguage(window.localStorage.getItem('mts-language'))
    } else {
      window.localStorage.setItem('mts-language', language)
    }
  }, [])

  const fetchWidgetData = async (clientId, domainId, productId) => {
    setLoading(true)
    const domainRes = await getApi('/api/domains')
    if (domainRes.status === 200) {
      // if (domainRes.domains) {
      //   setDomains(domainRes.domains)
      // }
      if (domainRes.domains) {
        const selectedDomain = domainRes.domains.find((domain) => domain._id === domainId)
        // setClientDomain(selectedDomain)
        if (selectedDomain) {
          const product = selectedDomain.products.find((product) => product.name === productId)
          setClientProduct(product)
          if (product) {
            const domainRes = await getApi(
              `/api/clients/${clientId}/${selectedDomain?.url}/${productId}/${product.version}`,
            )
            setProductPageData(domainRes.data)
          }
        }
      }
    }
    setLoading(false)
  }

  return (
    <ErrorBoundary>
      <div className="flex w-40 px-1 py-2 mt-4 mb-2 ml-auto text-sm bg-white rounded-lg">
        <div className="mx-auto">
          <label className="mr-2" htmlFor="channel">
            {labels?.language} :
          </label>
          <select
            id="channel"
            className="p-1 bg-white border rounded-lg outline-none cursor-pointer border-primary-400"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value)
              window.localStorage.setItem('mts-language', e.target.value)
            }}
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
            <option value="it">IT</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4 bg-white rounded-lg">
        <div>
          {productPageData && Object.keys(productPageData).length > 0 && (
            <div
              id="__MTS"
              data-mts-view={productId}
              data-mts-language={language}
              data-mts-user={clientId}
              data-mts-id="0"
              data-mts-version={clinetProduct?.version || '2'}
            >
              <ThemeProvider styles={{ ...productPageData.content[0].blockProps.styles, maxWidth: 'auto' }}>
                <WidgetVmts2
                  pageData={{ ...productPageData, width: 'auto', height: 'auto' }}
                  blockProps={{ ...productPageData.content[0].blockProps, backend: true }}
                ></WidgetVmts2>
              </ThemeProvider>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default NewVoucher

export async function getServerSideProps(context) {
  return Authenticate(context)
}
