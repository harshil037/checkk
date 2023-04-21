import React, { useState, useContext, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Authenticate from '../../../../../../../lib/authenticate'
import { AppContext } from '../../../../../../../context/appContext'
import { Input, Select } from '../../../../../../../components/componentLibrary'
import PopUp from '../../../../../../../components/dialog/popUp'
import Button from '../../../../../../../components/common/Button'
import useConfirm from '../../../../../../../components/dialog/useConfirm'
import { deepClone } from '../../../../../../../lib/object'
import { isEqual } from '../../../../../../../lib/utils'
import EditComponent from '../../../../../../../components/EditComponent'
import { WidgetView } from '../../../../../../../components/shared/widgetView'

const Module = () => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const [domain, setDomain] = useState(null)
  const [content, setContent] = useState({})
  const [product, setProduct] = useState(null)
  const [productProps, setProductProps] = useState(null)
  const [formProps, setFormProps] = useState([])
  const [prevFormProps, setPrevFormProps] = useState([])
  const [languages, setLanguages] = useState(['en', 'de', 'it'])
  // for set the prev languages if clicked on the discard changes
  const [prevLanguages, setPrevLanguages] = useState(['en', 'de', 'it'])
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [languageToAdd, setLanguageToAdd] = useState('')
  const [themeData, setThemeData] = useState({ themeBased: false, themes: [] })
  const [currentTheme, setCurrentTheme] = useState('default')
  const [themeToAdd, setThemeToAdd] = useState('')
  const [prevThemeData, setPrevThemeData] = useState({
    themeBased: false,
    themes: [],
  })
  const [similarProductData, setSimilarProductData] = useState([])
  const [showImportButton, setShowImportButton] = useState(false)
  const [openModalProduct, setOpenModalProduct] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')
  const [isReset, setIsReset] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isDemoView, setIsDemoView] = useState(false)
  const [attributes, setAttributes] = useState({})
  const [availableComponents, setAvailableComponents] = useState([])
  const router = useRouter()
  const { clientId, domainId, productId } = router.query

  const { isConfirmed } = useConfirm('')

  const editComponentRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)

      // getting the current client(clientData), available components from the library(modules)
      const [domainResponse, clientData, modules] = await Promise.all([
        fetch(`/api/domain/${domainId}`).then((res) => res.json()),
        fetch(`/api/clients?id=${clientId}`).then((res) => res.json()),
        fetch('/api/products/availableComponents').then((res) => res.json()),
      ])

      const { domain: domainData } = domainResponse

      if (domainData) {
        // finding the current product
        const productData = domainData.products.find((item) => item._id === productId)

        if (productData) {
          setDomain(domainData)

          // set context data for changing navbar values as product
          setContextData((prevState) => ({
            ...prevState,
            search: {
              ...prevState.search,
              default: {
                clientId: clientData.data.name,
                url: domainData.url,
                productName: productData?.name,
              },
            },
          }))

          // set product data if same product is exists
          const oldProducts = []
          domainData.products.filter((product) => {
            if (
              product.module === productData.module &&
              product.version === productData.version &&
              product.name !== productData.name
            ) {
              if (product.contentId) {
                // setSimilarProductData((similarProductData) => [...similarProductData, product])
                oldProducts.push(product)
                setShowImportButton(true)
              }
              setSimilarProductData(oldProducts)
            }
          })

          // finding the latest props for the current product
          const allComponents = [...modules.component, ...modules.widget].filter(
            (item) => item.module && item.type !== 'website',
          )

          const props = allComponents.find(
            (item) =>
              item.type === productData.type &&
              item.module === productData.module &&
              item.version === productData.version,
          )

          setAvailableComponents(allComponents)

          if (props) {
            setProductProps(props)

            if (productData.contentId) {
              const { data, error } = await (await fetch(`/api/contents/${productData.contentId}`)).json()

              if (data) {
                if (data.languages) {
                  setLanguages(data.languages)
                  setPrevLanguages(data.languages)
                  setCurrentLanguage(data.languages[0])

                  if (data.themeBased) {
                    const newProps = deepClone(props.props)
                    const stylesIndex = newProps.findIndex(
                      (item) => item.inputType === 'staticList' && item.key === 'styles',
                    )
                    if (stylesIndex !== -1) {
                      newProps[stylesIndex].props = addThemesInProps(newProps[stylesIndex].props)
                      setFormProps(newProps)
                      setPrevFormProps(newProps)
                      setThemeData({
                        themeBased: data.themeBased,
                        themes: data.themes,
                      })
                      setPrevThemeData({
                        themeBased: data.themeBased,
                        themes: data.themes,
                      })
                    } else {
                      setFormProps(props.props)
                      setPrevFormProps(props.props)
                    }
                  } else {
                    setFormProps(props.props)
                    setPrevFormProps(props.props)
                  }
                } else {
                  if (domainData.languages) {
                    setLanguages(domainData.languages)
                    setPrevLanguages(domainData.languages)
                    setCurrentLanguage(domainData.languages[0])
                  }
                  setFormProps(props.props)
                  setPrevFormProps(props.props)
                }
                setContent(data)
              }
            } else {
              // if no data found
              if (domainData.languages) {
                setLanguages(domainData.languages)
                setPrevLanguages(domainData.languages)
                setCurrentLanguage(domainData.languages[0])
              }
              setFormProps(props.props)
              setPrevFormProps(props.props)
            }
            setProduct(productData)
          }
        } else {
          setLoading(false)
          await isConfirmed('Product not found!', true)
          router.replace('/admin/domains')
        }
      } else {
        setLoading(false)
        await isConfirmed('Domain not found!', true)
        router.replace('/admin/domains')
      }
      setLoading(false)
    })()
  }, [productId])

  useEffect(() => {
    if (productProps) {
      setAttributes((productProps?.attributes || []).reduce((obj, item) => Object.assign(obj, { [item]: '' }), {}))
    }
  }, [productProps])

  useEffect(() => {
    if (isReset) {
      if (!isEqual(languages, prevLanguages)) {
        setLanguages(prevLanguages)
        setCurrentLanguage(prevLanguages[0])
      }
      if (!isEqual(themeData, prevThemeData)) {
        setThemeData(prevThemeData)
        setFormProps(prevFormProps)
      }

      setIsReset(false)
    }
  }, [isReset])

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      saveDirty: !isDirty,
    }))
  }, [isDirty])

  const addLanguage = () => {
    if (languageToAdd && !languages.includes(languageToAdd)) {
      setLanguages((prev) => [...prev, languageToAdd])
      setLanguageToAdd('')
    }
  }

  const deleteLanguage = (language) => async () => {
    const res = await isConfirmed(`Are you sure you want to delete "${language}" language?`)
    if (res) {
      const newLanguages = languages.filter((lang) => lang !== language)
      if (currentLanguage === language) {
        setCurrentLanguage(newLanguages[0])
      }
      setLanguages(newLanguages)
    } else {
      return false
    }
  }

  const handleChangeProduct = (value) => {
    const currentProduct = domain?.products?.find((item) => item.name === value)
    if (!currentProduct) return null
    router.replace(`/admin/product/module/${clientId}/${domainId}/${currentProduct._id}`)
  }

  const addThemesInProps = (prop = []) => {
    const newProps = []
    for (let i = 0; i < prop.length; i++) {
      switch (prop[i].inputType) {
        case 'text':
          newProps.push({ ...prop[i], themeBased: true })
          break
        case 'color':
          newProps.push({ ...prop[i], themeBased: true })
          break
        case 'staticList':
          newProps.push({ ...prop[i], props: addThemesInProps(prop[i].props) })
          break
        case 'list':
          newProps.push({ ...prop[i], props: addThemesInProps(prop[i].props) })
          break
        default:
          newProps.push(prop[i])
      }
    }
    return newProps
  }

  const removeThemesFromProps = (prop) => {
    const newProps = []
    for (let i = 0; i < prop.length; i++) {
      switch (prop[i].inputType) {
        case 'text':
          delete prop[i].themeBased
          newProps.push(prop[i])
          break
        case 'color':
          delete prop[i].themeBased
          newProps.push(prop[i])
          break
        case 'staticList':
          newProps.push({
            ...prop[i],
            props: removeThemesFromProps(prop[i].props),
          })
          break
        case 'list':
          newProps.push({
            ...prop[i],
            props: removeThemesFromProps(prop[i].props),
          })
          break
        default:
          newProps.push(prop[i])
      }
    }

    return newProps
  }

  const handleThemeBased = async (e) => {
    const { checked } = e.target
    const response = await isConfirmed(`Confirm ${checked ? 'make theme based?' : 'remove all themes?'}`)

    if (response) {
      if (checked) {
        const newProps = deepClone(formProps)
        const stylesIndex = newProps.findIndex((item) => item.inputType === 'staticList' && item.key === 'styles')
        if (stylesIndex !== -1) {
          newProps[stylesIndex].props = addThemesInProps(newProps[stylesIndex].props)

          setThemeData({ themeBased: checked, themes: ['default'] })
          setFormProps(newProps)
        } else {
          await isConfirmed('This component doesnot have styles!', true)
        }
      } else {
        const newProps = deepClone(formProps)
        const stylesIndex = newProps.findIndex((item) => item.inputType === 'staticList' && item.key === 'styles')
        if (stylesIndex !== -1) {
          newProps[stylesIndex].props = removeThemesFromProps(newProps[stylesIndex].props)
          setFormProps(newProps)
          setThemeData({ themeBased: checked, themes: [] })
        } else {
          setThemeData({ themeBased: checked, themes: [] })
        }
      }
    }
  }

  const addTheme = () => {
    if (themeToAdd && !themeData.themes.includes(themeToAdd)) {
      setThemeData((prev) => ({
        ...prev,
        themes: [...prev.themes, themeToAdd],
      }))
      setThemeToAdd('')
    }
  }

  const deleteTheme = (theme) => () => {
    isConfirmed(`Delete ${theme} theme?`).then((confirm) => {
      if (confirm) {
        setThemeData((prev) => ({
          ...prev,
          themes: prev.themes.filter((iteam) => iteam !== theme),
        }))
        setCurrentTheme('default')
      }
    })
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true)
    try {
      const data = {
        name: content.name || product.name,
        module: content.module || product.module,
        type: content.type || product.type,
        version: content.version || product.version,
        status: content.status,
        props: productProps.props,
        languages: languages,
        themeBased: themeData.themeBased,
        themes: themeData.themes,
        blockProps: values,
      }

      if (product.contentId) {
        const response = await fetch(`/api/contents/${product.contentId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })

        const result = await response.json()
      } else {
        const response = await fetch('/api/contents', {
          method: 'POST',
          body: JSON.stringify({ domainId, ...data }),
        })

        const result = await response.json()

        setProduct((prev) => ({ ...prev, contentId: result.data._id }))
        // router.replace(`/admin/product/module/${clientId}/${domainId}/${productId}`)
      }
      setPrevLanguages(languages)
      setPrevThemeData(themeData)
      setPrevFormProps(formProps)
      setContent(data)
    } catch (e) {
      console.log('error while saving content data', e.message)
    }
    setSubmitting(false)
    setLoading(false)
  }

  const handleDeleteProduct = async () => {
    setLoading(true)
    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: product.name,
        domainId: domainId,
      }),
    })
    if (res.status === 200) {
      setContextData((prevState) => ({
        ...prevState,
        search: {
          ...prevState.search,
          filterdDomains: '',
          clientId: '',
          lastSearched: new Date(),
          default: {
            ...prevState.search.default,
            clientId: '',
            url: '',
            productName: '',
          },
        },
      }))
      router.push('/admin/domains')
    } else {
      const jsonRes = await res.json()
      console.log('error while deleting product =>', jsonRes.error)
    }
    setLoading(false)
  }

  const importProductData = async (contentId) => {
    setLoading(true)
    const { data, error } = await (await fetch(`/api/contents/${contentId}`)).json()
    if (data) {
      // setContent({ ...content, blockProps: data.blockProps })
      editComponentRef.current.setValues(data.blockProps)
      setOpenModalProduct(false)
      setLoading(false)
    }
  }

  const demoViewProducts = (products = [], availableProps = []) => {
    return products.filter((currProduct) => {
      const currentProps = availableProps.find(
        (item) => item.module === currProduct.module && item.version === currProduct.version,
      )

      if (currentProps) {
        if (currentProps.demoView === false) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    })
  }

  return (
    <>
      {product && (
        <>
          <div className="fixed top-[85px] pt-7 w-full bg-[#e5e5e5] -ml-2 z-10"></div>
          <div
            className={`text-left bg-white p-4 rounded-lg mt-7 border border-gray-300 shadow-lg ${
              isDemoView && 'hidden'
            }`}
          >
            <div className="flex justify-between border-dashed border-b border-b-black pl-4 pb-2">
              <p className="text-2xl" title="Component name">
                {product?.name}
              </p>
              <ul className="sm:flex">
                {showImportButton && (
                  <li className="sm:pl-4 sm:border-r">
                    <div className="flex px-4 py-1">
                      <Button
                        onClick={() => setOpenModalProduct(true)}
                        variant="primary"
                        className="flex items-center px-4 text-sm bg-white"
                      >
                        Import
                        <img className="inline-block pl-4" src="/images/widget.svg" alt="Products" width="32" />
                      </Button>
                    </div>
                  </li>
                )}
                {openModalProduct && (
                  <PopUp openModal={openModalProduct}>
                    <div className="m-32 main-wrapper">
                      <div className="p-4 items-center mx-auto  bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-2/5">
                        <div className="flex items-center justify-between mb-4 py-2 border-dashed border-b border-b-black">
                          Import data from old products.
                          <svg
                            onClick={() => setOpenModalProduct(false)}
                            className="w-4 h-4 cursor-pointer fill-current sm:w-6 sm:h-6"
                            role="button"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                        <div className="flex my-6 text-sm">
                          <Select
                            id="language"
                            className="p-1 bg-white border w-3/5 rounded-lg outline-none cursor-pointer border-primary-400 mr-4"
                            onChange={(e) => setSelectedValue(e.target.value)}
                            value={selectedValue}
                          >
                            <>
                              <option value="">Select product</option>
                              {similarProductData.map((data) => (
                                <option value={data.contentId} key={data._id}>
                                  {data.name}
                                </option>
                              ))}
                            </>
                          </Select>
                          <div>
                            <Button
                              onClick={() => {
                                if (selectedValue) importProductData(selectedValue)
                              }}
                              variant="primary"
                              className="flex items-center px-4 text-sm bg-white"
                            >
                              Import
                              <img className="inline-block pl-4" src="/images/widget.svg" alt="Products" width="32" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopUp>
                )}
                {productProps.demoView !== false && (
                  <li className="sm:pl-4 sm:border-r">
                    <div className="flex px-4 py-1">
                      <Button
                        onClick={() => {
                          setIsDemoView(!isDemoView)
                        }}
                        variant="primary"
                        className="flex items-center px-4 text-sm bg-white"
                      >
                        Demo
                        <img className="inline-block pl-4" src="/images/widget.svg" alt="Products" width="32" />
                      </Button>
                    </div>
                  </li>
                )}
                <li className="flex items-center sm:pl-4">
                  <div className="flex items-center px-2 py-1">
                    <Button
                      type="button"
                      variant="danger"
                      className="mr-4"
                      onClick={async () => {
                        let confirmed = await isConfirmed(`Are you sure to delete this ${product.type}`)
                        if (confirmed) {
                          handleDeleteProduct()
                        }
                      }}
                    >
                      Delete {product.type}
                    </Button>
                  </div>
                </li>
              </ul>
            </div>
            <div className={`flex flex-wrap pt-4 ${isDemoView && 'hidden'}`}>
              <div className="w-1/3 p-4">
                <label className="my-2 text-sm inline-block">Component Name</label>
                <input
                  type="text"
                  value={product.name}
                  className="border border-gray-400 rounded-lg p-3 w-full outline-gray-400 bg-gray-100 text-sm"
                  disabled
                />
              </div>
              <div className="w-1/3 p-4">
                <label className="my-2 text-sm inline-block">Component Type</label>
                <input
                  type="text"
                  value={product.type}
                  className="border capitalize border-gray-400 rounded-lg p-3 w-full outline-gray-400 bg-gray-100 text-sm"
                  disabled
                />
              </div>
              <div className="w-1/3 p-4">
                <label className="my-2 text-sm inline-block">Version</label>
                <input
                  type="text"
                  value={product.version}
                  className="border capitalize border-gray-400 rounded-lg p-3 w-full outline-gray-400 bg-gray-100 text-sm"
                  disabled
                />
              </div>
              <div className="w-1/2 p-4">
                <label className="mb-2 text-sm inline-block" title="For example: 'en' for 'English'">
                  Langauges Code
                </label>
                <div className="flex">
                  <Input
                    type="text"
                    value={languageToAdd}
                    variant="primary"
                    className="mr-4 w-3/4"
                    onChange={(e) => setLanguageToAdd(e.target.value.trim())}
                  />
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!languageToAdd}
                    title="Add language"
                    onClick={addLanguage}
                    className="w-1/5 flex 2xl:whitespace-nowrap items-center"
                  >
                    Add Language
                    <img className="inline-block px-1" src="/images/plus-bar.svg" alt="Products" />
                  </Button>
                </div>

                {languages.map((lang) => (
                  <Button
                    variant="secondary"
                    className="mt-4 mr-4 uppercase"
                    type="button"
                    onClick={deleteLanguage(lang)}
                    disabled={languages.length === 1}
                    key={lang}
                  >
                    {lang}
                    {languages.length > 1 && (
                      <img className="inline-block ml-4" src="/images/langaugedelete.svg" alt="Delete Langauge" />
                    )}
                  </Button>
                ))}
              </div>
              <div className="w-1/2 p-4 flex items-center">
                <div className="w-1/4 flex items-center">
                  <label className="block pl-4">Theme Based</label>
                  <Input
                    type="toggle"
                    id="themeBased"
                    name="themeBased"
                    checked={themeData.themeBased}
                    variant="primary"
                    onChange={handleThemeBased}
                  />
                </div>
                {themeData.themeBased && (
                  <div className="w-3/4">
                    <label className="mb-2 text-sm">Themes</label>
                    <div className="flex">
                      <Input
                        type="text"
                        value={themeToAdd}
                        variant="primary"
                        className="mr-4 w-4/5"
                        onChange={(e) => setThemeToAdd(e.target.value.trim())}
                      />
                      <Button
                        type="button"
                        variant="primary"
                        disabled={!themeToAdd}
                        title="Add language"
                        onClick={addTheme}
                        className="w-1/5 2xl:whitespace-nowrap"
                      >
                        Add Theme
                      </Button>
                    </div>

                    {themeData.themes.map((theme) => (
                      <Button
                        variant="secondary"
                        className="mt-4 mr-4 uppercase"
                        type="button"
                        onClick={deleteTheme(theme)}
                        key={theme}
                        disabled={theme === 'default'}
                      >
                        {theme}
                        {theme !== 'default' && (
                          <img className="inline-block ml-2" src="/images/langaugedelete.svg" alt="Delete Theme" />
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {isDemoView && (
        <WidgetView
          module={content?.module}
          language={currentLanguage}
          data={content?.blockProps}
          lang={languages}
          setDefaultLanguage={setCurrentLanguage}
          productName={product.name}
          version={content?.version}
          domainId={domainId}
          attributes={attributes}
          setAttributes={setAttributes}
          products={demoViewProducts(domain?.products, availableComponents)}
          setIsDemoView={setIsDemoView}
          domainUrl={domain.url}
          domainName={domain.name}
          contentId={product.contentId}
          onChangeProduct={handleChangeProduct}
          productProps={productProps}
          clientId={clientId}
        />
      )}
      {formProps.length > 0 && (
        <div
          className={`text-left bg-white p-4 mt-10 border border-gray-300 rounded-lg shadow-lg ${
            isDemoView && 'hidden'
          }`}
        >
          <EditComponent
            onLanguageChange={setCurrentLanguage}
            currentLanguage={currentLanguage}
            fields={formProps}
            value={content.blockProps}
            languages={languages}
            onSubmit={handleSubmit}
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            themes={themeData.themes}
            onReset={() => {
              setIsReset(true)
            }}
            isSticky={true}
            isDirty={setIsDirty}
            clientId={clientId}
            ref={editComponentRef}
          />
        </div>
      )}
    </>
  )
}

export default Module

export async function getServerSideProps(context) {
  return Authenticate(context)
}
