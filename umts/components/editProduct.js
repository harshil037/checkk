import React, { useState, useEffect } from 'react'
import { useIsMounted } from '../lib/hooks'
import { v4 as uuidv4 } from 'uuid'
import { Input, Select } from './componentLibrary'
import Button from './common/Button'
import { isValidValue, isEqual } from '../lib/utils'

const EditProduct = ({ domainProduct, handleClose, setLoading, isConfirmed }) => {
  const domain = domainProduct?.domain
  const product = domainProduct?.product
  const [errorMsg, setErrorMsg] = useState('')
  const [productData, setProductData] = useState(product)
  const [dataSource, setDataSource] = useState([])
  const [availableComponents, setAvailableComponents] = useState(null)
  const [formErrors, setFormErrors] = useState({ isValid: false })
  const [validateKeyValue, setValidateKeyValue] = useState({ key: '', value: '' })
  const isMounted = useIsMounted()
  const [products, setProducts] = useState({})

  useEffect(async () => {
    getAvailableComponents()
    if (productData) {
      await getDataSource(productData?._id)
    }
  }, [])

  const getDataSource = async (id) => {
    if (id) {
      setLoading(true)
      const res = await fetch('/api/products/dataSouce?productId=' + id, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.status === 200) {
        setLoading(false)
        const { data } = await res.json()

        if (data) {
          const arr = []
          Object.keys(data).map((item) => {
            arr.push({ [item]: data[item] })
          })
          setDataSource(arr)
        }
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    validate(validateKeyValue.key)
  }, [validateKeyValue])

  const handleChange = (key) => (e) => {
    setProductData((state) => {
      if (state) {
        return { ...state, [key]: e.target.value }
      } else {
        return { _id: uuidv4(), [key]: e.target.value }
      }
    })
  }

  const validate = (key = 'all') => {
    let count = 0
    if (key == 'all' || key == 'name') {
      if (!isValidValue(productData?.name)) {
        setFormErrors((state) => ({ ...state, name: 'This field is required' }))
        count = count + 1
      } else {
        if (domain?.products?.find((product) => product.name === productData.name && product._id !== productData._id)) {
          setFormErrors((state) => ({ ...state, name: 'The product name should be unique for the domain.' }))
          count = count + 1
        } else {
          setFormErrors((state) => ({ ...state, name: '' }))
        }
      }
    }

    if (key == 'all' || key == 'version') {
      if (!isValidValue(productData?.version)) {
        setFormErrors((state) => ({ ...state, version: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, version: '' }))
      }
    }

    if (key == 'all' || key == 'type') {
      if (!isValidValue(productData?.type)) {
        setFormErrors((state) => ({ ...state, type: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, type: '' }))
      }
    }

    if (key == 'all' || key == 'dataSource') {
      let dataSourceFlag = false
      let duplicateFlag = false
      const uniqueValues = new Set(dataSource.map((v) => Object.keys(v)[0]))
      if (dataSource.length > 0) {
        for (let data of dataSource) {
          if (Object.keys(data).includes('') || Object.values(data).includes('')) {
            dataSourceFlag = true
          } else if (uniqueValues.size < dataSource.length) {
            duplicateFlag = true
          }
        }
        if (dataSourceFlag) {
          setFormErrors((state) => ({ ...state, dataSource: 'These fields are required' }))
          count = count + 1
        } else if (duplicateFlag) {
          setFormErrors((state) => ({ ...state, dataSource: 'Key should be unique' }))
          count = count + 1
        } else {
          setFormErrors((state) => ({ ...state, dataSource: '' }))
        }
      }
    }

    if ((key == 'all' || key == 'module') && productData?.type == 'widget') {
      if (!isValidValue(productData?.module)) {
        setFormErrors((state) => ({ ...state, module: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, module: '' }))
      }
    }

    setFormErrors((state) => ({ ...state, isValid: count > 0 ? false : true }))
    return count > 0 ? false : true
  }

  const getAvailableComponents = async () => {
    if (!availableComponents) {
      setLoading(true)
      const res = await fetch('/api/products/availableComponents', {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.status === 200) {
        const data = await res.json()
        if (isMounted.current) {
          const components = {}

          const componentData = [...data.component, ...data.widget]

          for (let i = 0; i < componentData.length; i++) {
            const prod = componentData[i]
            if (components[prod.module]) {
              components[prod.module].versions.push(prod.version)
            } else {
              components[prod.module] = {}
              components[prod.module].versions = [prod.version]
              components[prod.module].title = prod.name['en']
              components[prod.module].type = prod.type
            }
          }

          // setProductTypes(['website', ...Array.from(new Set(data.map((item) => item.type)))])
          setProducts(components)
          setAvailableComponents(componentData)
        }
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
  }

  const toggleHandler = (key) => (e) => {
    // setProductData((state) => ({ ...state, [key]: e.target.checked }))
    const toggleValue = e.target.checked
    isConfirmed('Are you sure you want to change status ?').then((confirm) => {
      if (confirm) {
        setProductData((state) => ({ ...state, [key]: toggleValue }))
      }
    })
  }

  const handleDelete = async (productType = '') => {
    if (productType === 'website' && productData.pageTree) {
      const pageTree = await fetch(`/api/products/website/pagetree/${productData.pageTree}`).then((response) =>
        response.json(),
      )
      const pageTreeData = pageTree.data

      const componentData = []

      if (pageTreeData?.draft?.pages && pageTreeData?.draft?.pages.length > 0)
        for (let i = 0; i < pageTreeData?.draft?.pages.length; i++) {
          if (pageTreeData?.draft?.pages[i]?.modules && pageTreeData?.draft?.pages[i]?.modules.length > 0)
            for (let j = 0; j < pageTreeData?.draft?.pages[i]?.modules.length; j++) {
              if (pageTreeData?.draft?.pages[i]?.modules[j].type === 'component') {
                componentData.push(pageTreeData?.draft?.pages[i]?.modules[j].contentId)
              }
            }
        }

      setLoading(true)
      const res = await fetch(`/api/products/website/pagetree/${pageTreeData._id}`, {
        method: 'DELETE',
        body: JSON.stringify({ domainId: pageTreeData.domainId, componentData }),
      })
      if (res.status === 200) {
        handleClose({ reason: 'update' })
      } else {
        const jsonRes = await res.json()
        setErrorMsg(jsonRes.error)
      }
    } else {
      setLoading(true)

      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          domainId: domain._id,
        }),
      })

      if (res.status === 200) {
        handleClose({ reason: 'update' })
      } else {
        const jsonRes = await res.json()
        setErrorMsg(jsonRes.error)
      }
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (validate() == true) {
      setLoading(true)

      const body = product
        ? JSON.stringify({
            dataSource: dataSource || [],
            productId: productData._id,
            _id: domain._id,
            products: domain.products.map((p) => {
              return p._id === productData._id ? productData : p
            }),
          })
        : domain.products && Array.isArray(domain.products)
        ? JSON.stringify({
            dataSource: dataSource || [],
            productId: productData._id,
            _id: domain._id,
            products: [...domain.products, productData],
          })
        : JSON.stringify({
            dataSource: dataSource || [],
            productId: productData._id,
            _id: domain._id,
            products: [productData],
          })

      const res = await fetch('/api/domains', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body,
      })

      if (res.status === 200) {
        handleClose && handleClose({ reason: 'update' })
      } else {
        const jsonRes = await res.json()
        setErrorMsg(jsonRes.error)
      }
      setLoading(false)
    }
  }

  const handleRestrictionSelect = (restriction) => (e) => {
    const tempRestrictions = productData.appliedRestrictions || []
    if (e?.target?.checked) {
      tempRestrictions = [...tempRestrictions, restriction]
    } else if (Array.isArray(productData.appliedRestrictions)) {
      const indexOfRestriction = tempRestrictions.findIndex((r) => r.name === restriction.name)
      tempRestrictions.splice(indexOfRestriction, 1)
    }

    setProductData({
      ...productData,
      appliedRestrictions: tempRestrictions,
    })
  }

  return (
    <>
      <form id={`product-${productData ? productData._id : ''}-form`} onSubmit={handleSubmit}>
        <div className="m-8 main-wrapper">
          <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-2/5">
            <div className="flex justify-between pb-2 border-b border-black border-solid">
              <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Product Detail</h1>
              <svg
                onClick={handleClose}
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
            <div className="client-modal-scroll">
              {errorMsg ? (
                <div className="flex flex-wrap -mx-4 text-left">
                  <div className="w-full px-4 mt-5 text-red-500 sm:w-1/2">{errorMsg}</div>
                </div>
              ) : null}

              <div className="flex flex-wrap mb-4 -mx-4 text-left">
                <div className="w-full px-4 sm:w-1/2">
                  <h2 className="mt-4 mb-2">{productData?.name ? 'Change name' : 'Name'}</h2>
                  <Input
                    type="text"
                    variant={formErrors?.name ? 'danger' : 'primary'}
                    id="name"
                    placeholder="Name"
                    value={productData?.name || ''}
                    onChange={handleChange('name')}
                    onBlur={(e) => {
                      setValidateKeyValue({ key: 'name', value: e.target.value })
                    }}
                  />
                  <span className="text-red-500">{formErrors?.name}</span>
                </div>
                <div className="w-full px-4 sm:w-1/2">
                  <label className="block mt-4 mb-2" htmlFor="type">
                    Type
                  </label>
                  <Select
                    value={productData?.type}
                    variant={formErrors?.type ? 'danger' : 'primary'}
                    onChange={handleChange('type')}
                    onBlur={(e) => {
                      setValidateKeyValue({ key: 'type', value: e.target.value })
                    }}
                    id="type"
                    disabled={product && productData?.type}
                    className="capitalize"
                  >
                    <option value="">Select product type</option>
                    <option value="widget">Widget</option>
                    <option value="website">Website</option>
                  </Select>
                  <span className="text-red-500">{formErrors?.type}</span>
                </div>
              </div>

              {Object.keys(products).length > 0 && productData && productData?.type == 'widget' && (
                <div className="flex flex-wrap mb-4 -mx-4 text-left">
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mb-2">{productData?.module ? 'Change widget' : 'Widget'}</h2>

                    <Select
                      value={productData?.module}
                      variant={formErrors?.module ? 'danger' : 'primary'}
                      id="module"
                      onChange={handleChange('module')}
                      onBlur={(e) => {
                        setValidateKeyValue({ key: 'module', value: e.target.value })
                      }}
                    >
                      {productData?.contentId ? (
                        <>
                          {Object.keys(products)
                            .filter((x) => x == productData.module)
                            ?.map((prod, i) => (
                              <option key={`${prod}-${i}`} value={prod}>
                                {products[prod].title}
                              </option>
                            ))}
                        </>
                      ) : (
                        <>
                          <option value=""></option>
                          {Object.keys(products)
                            ?.filter((item) => products[item].type === 'widget')
                            .map((prod, i) => (
                              <option key={`${prod}-${i}`} value={prod}>
                                {products[prod].title}
                              </option>
                            ))}
                        </>
                      )}
                    </Select>
                    <span className="text-red-500">{formErrors?.module}</span>
                  </div>

                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mb-2">{productData?.version ? 'Change version' : 'Version'}</h2>
                    <Select
                      value={productData?.version || ''}
                      variant={formErrors?.version ? 'danger' : 'primary'}
                      onChange={handleChange('version')}
                      onBlur={(e) => {
                        setValidateKeyValue({ key: 'version', value: e.target.value })
                      }}
                      id="version"
                    >
                      {productData?.contentId ? (
                        <option value={productData?.version || ''}>{productData?.version}</option>
                      ) : !productData.module ? (
                        <>
                          <option value="">Please Select Version</option>
                        </>
                      ) : (
                        <>
                          <option value="">Select Version</option>
                          {products[productData.module]?.versions?.map((ver) => (
                            <option key={ver} value={ver}>
                              {ver}
                            </option>
                          ))}
                        </>
                      )}
                    </Select>

                    <span className="text-red-500">{formErrors?.version}</span>
                  </div>
                </div>
              )}

              {productData?.type == 'website' && (
                <div className="flex flex-wrap mb-4 -mx-4 text-left">
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mt-4 mb-2">{productData?.version ? 'Change version' : 'Version'}</h2>
                    <Input
                      value={productData?.version || ''}
                      variant={formErrors?.version ? 'danger' : 'primary'}
                      onChange={handleChange('version')}
                      onBlur={(e) => {
                        setValidateKeyValue({ key: 'version', value: e.target.value })
                      }}
                      id="version"
                    />
                    <span className="text-red-500">{formErrors?.version}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center mb-5">
                <h2>Status</h2>
                <Input
                  variant="primary"
                  type="toggle"
                  id="status"
                  checked={(productData && productData.status) || false}
                  onChange={toggleHandler('status')}
                />
              </div>

              {domain?.restrictions && (
                <div className="mb-5 text-left">
                  <h2>Select applicable restrictions:</h2>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {domain?.restrictions?.map((restriction) => (
                      <span key={restriction.name} className="flex items-center gap-2">
                        <input
                          id={restriction.name}
                          value={restriction.name}
                          type="checkbox"
                          className="cursor-pointer"
                          onChange={handleRestrictionSelect(restriction)}
                          checked={productData?.appliedRestrictions?.find((r) => r.name === restriction.name)}
                        />
                        <label htmlFor={restriction.name} className="cursor-pointer select-none">
                          {restriction.name}
                        </label>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap -mx-4 text-left">
                <div className="w-full px-4 sm:w-2/2">
                  <div className={`w-full rounded-lg px-4 py-2 border border-gray-300`}>
                    <div className="flex justify-between">
                      <h2 className="">Data Source</h2>
                      {domain?.products &&
                        domain?.products.filter(
                          (x) =>
                            x._id != productData?._id &&
                            x.module == productData?.module &&
                            x.version == productData?.version,
                        ).length > 0 && (
                          <div className="flex w-full px-4 sm:w-3/4">
                            <h2 className="mt-4 mb-2 mr-2">Import</h2>
                            <Select
                              onChange={async (e) => {
                                if (e.target.value) {
                                  isConfirmed('Are you sure to import configuration from selected product').then(
                                    async (confirm) => {
                                      if (confirm) {
                                        await getDataSource(e.target.value)
                                      }
                                    },
                                  )
                                }
                              }}
                              className="mt-2"
                              variant="primary"
                            >
                              <option value=""></option>
                              {domain.products
                                .filter(
                                  (x) =>
                                    x._id != productData?._id &&
                                    x.module == productData?.module &&
                                    x.version == productData?.version,
                                )
                                .map((cProduct) => (
                                  <option key={cProduct._id} value={cProduct._id}>
                                    {cProduct.name}
                                  </option>
                                ))}
                            </Select>
                          </div>
                        )}
                    </div>

                    <div className="w-full lg:w-3/3">
                      {dataSource &&
                        dataSource.map((item, i) => {
                          const lkey = Object.keys(item)[0]
                          const lvalue = item[lkey]
                          return (
                            lkey != '_id' && (
                              <div className="items-center p-4 mt-4 bg-white border border-gray-300 rounded-lg" key={i}>
                                <div className="flex flex-wrap -mx-4 text-left">
                                  <div className="w-full px-4 sm:w-2/5">
                                    <h2 className="mb-2">Key</h2>

                                    <Input
                                      variant="primary"
                                      type="text"
                                      value={lkey || ''}
                                      onChange={(e) => {
                                        setDataSource([
                                          ...dataSource.map((item, itemI) => {
                                            return itemI === i ? { [e.target.value]: lvalue } : item
                                          }),
                                        ])
                                      }}
                                      label="Key"
                                      className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline"
                                      placeholder="Data source item key"
                                    />
                                  </div>
                                  <div className="w-full px-4 sm:w-2/5">
                                    <h2 className="mb-2">Value</h2>
                                    <Input
                                      variant="primary"
                                      type="text"
                                      value={lvalue || ''}
                                      label="Value"
                                      onChange={(e) => {
                                        setDataSource([
                                          ...dataSource.map((item, itemI) => {
                                            return itemI === i ? { [Object.keys(item)[0]]: e.target.value } : item
                                          }),
                                        ])
                                      }}
                                      className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline"
                                      placeholder="Data source item value"
                                    />
                                  </div>
                                  <div className="self-end w-full p-4 cursor-pointer sm:w-auto">
                                    <img
                                      onClick={() => {
                                        setDataSource([...dataSource.filter((item, itemI) => itemI != i)])
                                        if (Object.keys(item).includes('') || Object.values(item).includes('')) {
                                          setFormErrors((state) => ({ ...state, dataSource: '' }))
                                        }
                                      }}
                                      className="inline-block ml-auto pl-7"
                                      src="/images/langaugedelete.svg"
                                      alt="Langauge Delete"
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          )
                        })}
                      <span className="mt-1 text-red-500">{formErrors?.dataSource}</span>

                      <div className="py-2">
                        <Button
                          onClick={() => {
                            setDataSource([...dataSource, { '': '' }])
                          }}
                        >
                          Add New Key
                          <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              {product && (
                <div className="-mx-4 ">
                  <div className="w-full px-4 mt-5 sm:w-2/2">
                    <Button
                      type="button"
                      variant="danger"
                      onClick={async () => {
                        let confirmed = await isConfirmed('Are you sure to delete this product')
                        if (confirmed) {
                          handleDelete(productData.type)
                        }
                      }}
                    >
                      Delete product
                    </Button>
                  </div>
                </div>
              )}
              <div className="-mx-4 ">
                <div className="w-full px-4 mt-5 sm:w-2/2">
                  <Button form={`product-${productData ? productData._id : ''}-form`} type="submit">
                    {product ? 'Update product' : 'Create product'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}

export default EditProduct
