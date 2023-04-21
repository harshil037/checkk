import React, { useState, useEffect } from 'react'
import { useIsMounted } from '../lib/hooks'
import { v4 as uuidv4 } from 'uuid'
import { Input, Button, Select } from './componentLibrary'
import { isValidValue, isEqual } from '../lib/utils'

const EditProduct = ({ domainProduct, handleClose, setLoading, isConfirmed }) => {
  const domain = domainProduct?.domain
  const product = domainProduct?.product
  const [errorMsg, setErrorMsg] = useState('')
  const [productData, setProductData] = useState(product)
  const [dataSource, setDataSource] = useState([])
  const [availableComponents, setAvailableComponents] = useState()
  const [formErrors, setFormErrors] = useState({ isValid: false })
  const [validateKeyValue, setValidateKeyValue] = useState({ key: '', value: '' })
  const isMounted = useIsMounted()
  const [productList, setProductList] = useState([])

  // console.log('pd ==>', productData, domain)

  useEffect(async () => {
    if (product && product.contents.length > 0 && !isValidValue(product?.componentModule)) {
      setLoading(true)
      await getAvailableComponents()
      const res = await fetch('/api/content?id=' + product.contents[0], {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.status === 200) {
        setLoading(false)
        const data = await res.json()
        setProductData((state) => ({ ...state, ['componentModule']: data.content?.components[0]?.module }))
      } else {
        setLoading(false)
      }
    }
  }, [])

  useEffect(async () => {
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
        const data = await res.json()
        const tempData = data.data
        if (tempData) {
          const arr = []
          Object.keys(tempData).map((item) => {
            arr.push({ [item]: tempData[item] })
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
      } else return { ...state, _id: uuidv4(), [key]: e.target.value }
    })

    if (key == 'type') {
      if (e.target.value == 'widget') {
        getAvailableComponents()
      } else {
        setAvailableComponents(null)
        setProductData((state) => {
          if (state) {
            return { ...state, ['componentModule']: null }
          } else return { ...state, _id: uuidv4(), ['componentModule']: null }
        })
      }
    }
  }

  const validate = (key = 'all') => {
    let count = 0
    if (key == 'all' || key == 'name') {
      if (!isValidValue(productData?.name)) {
        setFormErrors((state) => ({ ...state, ['name']: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['name']: '' }))
      }
    }

    if (key == 'all' || key == 'version') {
      if (!isValidValue(productData?.version)) {
        setFormErrors((state) => ({ ...state, ['version']: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['version']: '' }))
      }
    }

    if (key == 'all' || key == 'type') {
      if (!isValidValue(productData?.type)) {
        setFormErrors((state) => ({ ...state, ['type']: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['type']: '' }))
      }
    }

    if ((key == 'all' || key == 'componentModule') && productData?.type == 'widget') {
      if (!isValidValue(productData?.componentModule)) {
        setFormErrors((state) => ({ ...state, ['componentModule']: 'This field is required' }))
        count = count + 1
      } else {
        setFormErrors((state) => ({ ...state, ['componentModule']: '' }))
      }
    }

    setFormErrors((state) => ({ ...state, ['isValid']: count > 0 ? false : true }))
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
          setAvailableComponents(data)
        }
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
  }
  const toggleHandler = (key) => (e) => {
    setProductData((state) => ({ ...state, [key]: e.target.checked }))
  }

  const handleDelete = async () => {
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
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (validate() == true) {
      setLoading(true)
      const newProductData = productData.contents ? productData : { ...productData, contents: [] }
      const body = product
        ? JSON.stringify({
            dataSource: dataSource || [],
            productId: productData._id,
            _id: domain._id,
            products: domain.products.map((p) => {
              return p._id === newProductData._id ? newProductData : p
            }),
          })
        : domain.products && Array.isArray(domain.products)
        ? JSON.stringify({
            dataSource: dataSource || [],
            productId: productData._id,
            _id: domain._id,
            products: [...domain.products, newProductData],
          })
        : JSON.stringify({
            dataSource: dataSource || [],
            productId: productData._id,
            _id: domain._id,
            products: [newProductData],
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

  useEffect(() => {
    productData?.name !== '' &&
    productData?.type !== '' &&
    productData?.version !== '' &&
    productData?._id !== '' &&
    productData?._id !== '' &&
    productData?.type == 'widget'
      ? getAvailableComponents()
      : null
  }, [productData])

  useEffect(() => {
    console.log(availableComponents)
    if (availableComponents) {
      const components = {}
      for (let i = 0; i < availableComponents.length; i++) {
        const prod = availableComponents[i]
        console.log(prod.module, prod.version)
        // if (components[prod.module]) {
        //   components[prod.module].push(prod.version)
        // }
        components[prod.module]
          ? components[prod.module].push(prod.version)
          : (components[prod.module] = [prod.version])
      }
      console.log(components)
    }
  }, [availableComponents])

  return (
    <>
      <form id={`product-${productData ? productData._id : ''}-form`} onSubmit={handleSubmit}>
        <div className="main-wrapper m-8">
          <div className="md:mt-6 mt-32 p-6 mx-auto bg-white rounded-lg lg:w-2/5 border border-gray-300">
            <div className="border-solid  pb-2 border-b border-black flex justify-between">
              <h1>Product Detail</h1>
              <svg
                onClick={handleClose}
                className="w-4 h-4 fill-current cursor-pointer"
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
                  <div className="mt-5 w-full sm:w-1/2 px-4 text-red-500">{errorMsg}</div>
                </div>
              ) : null}

              <div className="flex flex-wrap -mx-4 text-left">
                <div className="w-full sm:w-1/2 px-4">
                  <h2 className="mb-2 mt-4">{productData?.name ? 'Change name' : 'Name'}</h2>
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
                <div className="w-full sm:w-1/2 px-4">
                  <h2 className="mb-2 mt-4">{productData?.type ? 'Change type' : 'Type'}</h2>

                  <Select
                    value={productData?.type}
                    variant={formErrors?.type ? 'danger' : 'primary'}
                    onChange={handleChange('type')}
                    onBlur={(e) => {
                      setValidateKeyValue({ key: 'type', value: e.target.value })
                    }}
                    id="type"
                  >
                    {productData?.contents?.length > 0 ? (
                      <>
                        <option value="widget">Widget</option>
                      </>
                    ) : (
                      <>
                        <option value=""></option>
                        <option value="website">Website</option>
                        <option value="widget">Widget</option>
                      </>
                    )}
                  </Select>
                  <span className="text-red-500">{formErrors?.type}</span>
                </div>
              </div>

              <div className="flex flex-wrap -mx-4 text-left">
                <div className="w-full sm:w-1/2 px-4">
                  <h2 className="mb-2 mt-4">{productData?.version ? 'Change version' : 'Version'}</h2>
                  <Input
                    id="version"
                    variant={formErrors?.version ? 'danger' : 'primary'}
                    value={productData?.version || ''}
                    onChange={handleChange('version')}
                    onBlur={(e) => {
                      setValidateKeyValue({ key: 'version', value: e.target.value })
                    }}
                    type="text"
                    placeholder="Version"
                  />
                  <span className="text-red-500">{formErrors?.version}</span>
                </div>
                {availableComponents && productData && productData?.type == 'widget' && (
                  <div className="w-full sm:w-1/2 px-4">
                    <h2 className="mb-2 mt-4">{productData?.componentModule ? 'Change widget' : 'Widget'}</h2>

                    <Select
                      value={productData?.componentModule}
                      variant={formErrors?.componentModule ? 'danger' : 'primary'}
                      id="componentModule"
                      onChange={handleChange('componentModule')}
                      onBlur={(e) => {
                        setValidateKeyValue({ key: 'componentModule', value: e.target.value })
                      }}
                    >
                      {productData?.contents?.length > 0 ? (
                        <>
                          {availableComponents
                            .filter((x) => x.module == productData.componentModule && x.version === productData.version)
                            ?.map((l, i) => (
                              <option key={`${l.module}-${i}`} value={l.module}>
                                {l.name['en']}
                              </option>
                            ))}
                        </>
                      ) : (
                        <>
                          <option value=""></option>
                          {availableComponents?.map((l, i) => (
                            <option key={`${l.module}-${i}`} value={l.module}>
                              {l.name['en']}
                            </option>
                          ))}
                        </>
                      )}
                    </Select>
                    <span className="text-red-500">{formErrors?.componentModule}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap -mx-4 text-left toggle-popup">
                <div className=" lg:w-1/2 w-full px-4">
                  <div className="px-2 py-1 flex">
                    <div className="flex items-center">
                      <Input
                        variant="primary"
                        type="toggle"
                        id="status"
                        checked={(productData && productData.status) || false}
                        onChange={toggleHandler('status')}
                      />
                      <h2 className="my-4">Status</h2>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap -mx-4 text-left">
                <div className="mt-5 lg:mt-0 w-full sm:w-2/2 px-4">
                  <div className={`w-full rounded-lg px-4 border border-gray-300`}>
                    <div className="flex justify-between">
                      <h2 className="mt-4 mx-2">Data Source</h2>
                      {domain?.products &&
                        domain?.products.filter(
                          (x) =>
                            x._id != productData?._id &&
                            x.componentModule == productData?.componentModule &&
                            x.version == productData?.version,
                        ).length > 0 && (
                          <div className="w-full sm:w-3/4 px-4 flex">
                            <h2 className="mb-2 mr-2 mt-4">Import</h2>
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
                                    x.componentModule == productData?.componentModule &&
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
                              <div className="p-4 bg-white border border-gray-300 rounded-lg mt-4 items-center" key={i}>
                                <div className="flex flex-wrap -mx-4 text-left">
                                  <div className="w-full sm:w-2/5 px-4">
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
                                      className="border border-gray-400 rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-outline"
                                      placeholder="Data source item key"
                                    />
                                  </div>
                                  <div className=" w-full sm:w-2/5 px-4">
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
                                      className="border border-gray-400 rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-outline"
                                      placeholder="Data source item value"
                                    />
                                  </div>
                                  <div className="w-full sm:w-auto cursor-pointer p-4 self-end">
                                    <img
                                      onClick={() => {
                                        setDataSource([...dataSource.filter((item, itemI) => itemI != i)])
                                      }}
                                      className="inline-block pl-7 ml-auto"
                                      src="/images/langaugedelete.svg"
                                      alt="Langauge Delete"
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          )
                        })}

                      <div className="p-2">
                        <Button
                          onClick={() => {
                            setDataSource([...dataSource, { '': '' }])
                          }}
                          variant="success"
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
                <div className=" -mx-4 ">
                  <div className="mt-5 w-full sm:w-2/2 px-4">
                    <Button
                      type="button"
                      variant="danger"
                      onClick={async () => {
                        let confirmed = await isConfirmed('Are you sure to delete this product')
                        if (confirmed) {
                          handleDelete()
                        }
                      }}
                    >
                      Delete product
                    </Button>
                  </div>
                </div>
              )}
              <div className=" -mx-4 ">
                <div className="mt-5 w-full sm:w-2/2 px-4">
                  <Button variant="success" form={`product-${productData ? productData._id : ''}-form`} type="submit">
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
