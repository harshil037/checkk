import React, { useState, useContext, useEffect } from 'react'
import Authenticate from '../../../lib/authenticate'
import { FieldArray, useFormik, FormikProvider } from 'formik'
import { Input, Select } from '../../../components/componentLibrary'
import Button from '../../../components/common/Button'
import VoucherItem from '../../../components/voucher/voucherItem'
import useConfirm from '../../../components/dialog/useConfirm'
import { AppContext } from '../../../context/appContext'
import { useRouter } from 'next/router'
import { request, gql } from 'graphql-request'
import PopUp from '../../../components/dialog/popUp'
import VoucherTemplate from '../../../components/voucher/voucherTemplate'
import SingleRow from '../../../components/shared/singleRow'
import StaticListComposition from '../../../components/shared/staticListComposition'
import { getApi } from '../../../lib/hooks'
import { renderToString } from 'react-dom/server'

const VoucherAddEdit = () => {
  const router = useRouter()
  const { isConfirmed } = useConfirm()
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const { id } = router.query
  const prefix = ''
  const language = 'de'
  const variables = {
    language: 'it',
    provider: 'kognitiv',
  }
  const voucherTypes = {
    serviceVoucher: 'serviceVoucher',
    valueVoucher: 'valueVoucher',
  }
  const [hideAttribute, setHideAttribute] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [accordion, setAccordion] = useState({})
  const [services, setServices] = useState([])
  const [clientImages, setClientImages] = useState({ imageList: [], logoList: [] })
  const [clientInfo, setClientInfo] = useState()
  const [clients, setClients] = useState([])
  const [templateItem, setTemplateItem] = useState()
  const [loadingKognitiveImages, setLoadingKognitiveImages] = useState(false)
  const [kognitiveImages, setKognitiveImages] = useState([])
  const [clientNo, setClientNo] = useState()

  let formik = useFormik({
    initialValues: {},
  })

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'vouchers',
    }))
  }, [])

  const query = gql`
    query ($config: JSON!, $language: String!, $provider: String!) {
      cm(config: $config, language: $language, provider: $provider) {
        services {
          code
          title
          description
          categories
          images {
            fileName
            url
            description
            title
            width
            height
            alternativeSizes {
              url
              description
              title
              width
              height
              category
              size
            }
          }
          packageConditionsCode
          teaser
          unit_price
          priceBase
          limitType
          priceBaseDescription
          limitTypeDescription
          price {
            amount
            currency
          }
        }
        pictures(topics: "") {
          width
          height
          size
          topic {
            title
            code
          }
          title
          url
        }
      }
    }
  `

  useEffect(async () => {
    setLoading(true)
    if (clientNo) {
      await getClientImages()
      getServiceData().then((newServices) => {
        addVoucherItem(newServices)
      })
    } else {
      setClientImages({ imageList: [], logoList: [] })
      setServices([])
      setLoading(false)
    }
    setLoading(false)
  }, [clientNo])

  const getClientImages = async (clientNo) => {
    const imageList = await setImages('voucher-images')
    const logos = await setImages('logos')
    setClientImages({ imageList: imageList, logoList: logos })

    async function setImages(path) {
      let images = []
      const res = await fetch(`${contextData.workerPath}/api/files/get/${clientNo || formik.values.clientNo}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          key1: `${clientNo || formik.values.clientNo}/static/${path}`,
        },
      })
      const result = await res.json()
      if (result.success) {
        images = result.images
      }
      return images
    }
  }

  const getClientInfo = async (clientNo, clientList) => {
    try {
      const client = clientList.find((x) => x.clientNumber == clientNo)
      const res = await fetch(`/api/clients?id=${client._id}`, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await res.json()
      setClientInfo(result.data ? result.data : {})
    } catch (err) {
      // setClientImages([])
    }
  }

  const getServiceData = async (clientNo) => {
    try {
      setLoading(true)
      const url = `https://u.mts-online.com/api/graphql/cm/${clientNo || formik.values.clientNo}/1`
      const resultService = await request(url, query, variables)
      const newServices = resultService.cm.services.map((item, index) => {
        return { ...item, quantity: 2, isSelected: false }
      })
      setLoading(false)
      setServices(newServices)
      let newUrls = []
      //let tempImgs = resultService?.cm?.pictures.filter((item) => item.topic != null && item.topic.code == 15)
      let imgs = resultService?.cm?.pictures
      const showUrl =
        'https://res.cloudinary.com/seekda/image/upload/if_ar_gte_16:9,w_220,h_150,c_limit/if_ar_gte_9:16_and_ar_lt_16:9,w_220,h_150,c_limit/if_ar_lt_9:16,w_1080,h_3888,c_limit/f_auto,fl_lossy,q_auto/production'
      let images = imgs.map((image) => {
        return {
          url: image.url.replace('https://images.seekda.net', showUrl),
          code: image.topic != null ? image.topic.code : 0,
        }
      })
      setKognitiveImages(images)
      setLoadingKognitiveImages(false)
      return newServices
    } catch (err) {
      setServices([])
    }
  }

  const initialize = async () => {
    setLoading(true)
    let list = []
    if (clients.length == 0) {
      await getApi('/api/clients').then((res) => {
        list = res.clients
        setClients(res.clients)
      })
    }

    fetch('/api/vouchers?id=' + id, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        if (data.voucher?._id) {
          let voucherData = data.voucher
          Promise.all([getClientImages(data.voucher.clientNo), getClientInfo(data.voucher.clientNo, list)])
          const isServiceType = voucherData.basket.voucherType == voucherTypes.serviceVoucher
          if (isServiceType) {
            getServiceData(data.voucher.clientNo)
              .then((res) => {
                return res
              })
              .then((newServices) => {
                voucherData.basket.voucher.items.map((item, index) => {
                  let selectedServices = {}
                  for (let k in item.services) {
                    selectedServices[k] = true
                  }
                  newServices?.map((service, i) => {
                    let serviceCode = service.code
                    if (selectedServices[serviceCode] === true) {
                      item.services[serviceCode] = { ...item.services[serviceCode], isSelected: true }
                    } else {
                      item.services[serviceCode] = { ...service, isSelected: false }
                    }
                  })
                  return item
                })
              })
            // add isSelected true for selected services and add isSelected false for not selected services
          }
          formik.setValues(voucherData)
        } else {
          formik.setValues(data.voucher)
          router.push(`/admin/vouchers/_new`, undefined, { shallow: true })
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }
  useEffect(() => {
    initialize()
  }, [id])

  const addVoucherItem = (passedServices, voucherType) => {
    const newItems = typeof passedServices != 'undefined' ? passedServices : []
    const voucherTypeField = voucherType || formik.values.basket.voucherType
    if (formik.values?.basket) {
      const arrayHelpers = formik.values.basket.voucher.items
      const issueDate = new Date()
      const expiryDate = new Date(issueDate.getTime())
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)

      const item = {
        type: 'voucher',
        quantity: 1,
        value: 1000,
        sendVia: 'email',
        sendTo: 'me',
        template: 0,
        salutation: 'Lieber',
        name: 'Daniel',
        route: '/valuevoucher',
        greetings:
          'Zu deinem 50-igsten Geburtstag gratuliere ich Dir von ganzem Herzen und wünsche Dir alles Gute und viel Gesundheit. Ich danke Dir ebenfalls aus tiefsten Herzen für ALLES was du für mich getan hast. Gruss Mami',
        templateImageIndex: 0,
        serviceGroup: 0,
        services: {},
        templateImage: {
          fileName: '',
        },
        logo: '',
        templateString: '',
        emails: [
          {
            to: 'Caroline Hübscher-Wirth',
            cc: [],
            subject: 'Gutschein vom Hotel Leitlhof',
            body: '<p>Caroline Hübscher-Wirth,</p>            <p>vielen Dank, dass Sie sich für einen Gutschein bei uns im Haus entschieden haben.</p>            <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>            Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>            <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>            <p><em>Ihr Hotel Leitlhof Team</em></p>',
          },
        ],
        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        addressId: '',
      }
      setLoading(true)

      const newServices = newItems.reduce((prev, next) => {
        let key = next.code
        let obj = {}
        obj[key] = { ...next }
        prev = { ...prev, ...obj }
        return prev
      }, {})

      if (arrayHelpers) {
        arrayHelpers.splice(0, 1, {
          ...item,
          services:
            voucherTypeField == 'serviceVoucher'
              ? { ...newServices }
              : { valueVoucher1: { name: '', salutation: '', message: '' } },
        })
      } else {
        formik.values.basket.voucher.items.splice(0, 1, {
          ...item,
          services:
            voucherTypeField == 'serviceVoucher'
              ? { ...newServices }
              : { valueVoucher1: { name: '', salutation: '', message: '' } },
        })
        formik.setValues(formik.values)
      }
      setLoading(false)
    }
  }

  const handleAccordion = (path, index = null) => {
    let accObj = { ...accordion }
    let result = Object.keys(accObj).filter((k) => k.includes(path))
    let accKey = index !== null ? `${path}[${index}]` : `${path}`
    for (let i = 0; i < result.length; i++) {
      if (result[i] !== accKey) accObj[result[i]] = false
    }
    //    setAccordion(() => accObj)
    setAccordion((prevState) => {
      return { ...prevState, [accKey]: !prevState[accKey] }
    })
  }

  const handleDelete = async () => {
    setLoading(true)
    const { _id } = formik.values
    const res = await fetch('/api/vouchers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id }),
    })
    if (res.status === 202) {
      const { data } = await res.json()
      router.push(`/admin/vouchers`)
    } else {
      const result = await res.json()
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // remove isSelected field and not selected services from services on submit
    const formikValues = formik.values
    const isServiceType = formikValues.basket.voucherType == voucherTypes.serviceVoucher
    formikValues.basket.voucher.items.filter((item, index) => {
      const {
        type,
        value,
        salutation,
        name,
        greetings,
        services,
        templateImage,
        logo,
        issueDate,
        expiryDate,
        addressId,
        language,
      } = item
      let address = Object.entries(clientInfo?.addresses || {}).find((x) => x[1].id == addressId)

      item.templateString = renderToString(
        <VoucherTemplate
          data={{
            type,
            value,
            salutation,
            name,
            greetings,
            services,
            code: formik.values.code,
            templateImage,
            logo,
            issueDate,
            expiryDate,
            address,
            language,
          }}
        ></VoucherTemplate>,
      )
      if (isServiceType) {
        for (let i in item.services) {
          if (!item.services[i].isSelected) {
            delete item.services[i]
          }
          delete item.services[i]?.isSelected
        }
      }
      return item
    })

    if (id === '_new') {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formikValues),
      })
      if (res.status === 201 || res.status === 200) {
        router.push(`/admin/vouchers`)
      } else {
        const { error } = await res.json()
      }
    } else {
      const res = await fetch('/api/vouchers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formikValues),
      })
      if (res.status === 201 || res.status === 200) {
        router.push(`/admin/vouchers`)
      } else {
        const { error } = await res.json()
      }
    }

    if (isServiceType) {
      // add isSelected field and add not selected services in services on submit
      formik.values.basket.voucher.items.map((item, index) => {
        let selectedServices = {}
        for (let k in item.services) {
          selectedServices[k] = true
        }
        services?.map((service, i) => {
          let serviceCode = service.code
          if (selectedServices[serviceCode] === true) {
            item.services[serviceCode] = { ...item.services[serviceCode], isSelected: true }
          } else {
            item.services[serviceCode] = { ...service, isSelected: false }
          }
        })
        return item
      })
    }
    formik.setValues(formik.values)
    setLoading(false)
  }

  return (
    <div className="flex flex-col">
      <div className="top-space sorting"></div>
      <div className={`flex flex-col items-center`}>
        <FormikProvider value={formik}>
          <form className="w-full">
            <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="justify-between pb-2 mb-4 text-left border-b border-black border-dashed sm:flex">
                <h3>Add Voucher</h3>
                {openModal && (
                  <PopUp openModal={openModal}>
                    <TemplatePopup
                      templateItem={templateItem}
                      code={formik.values?.code}
                      setOpenModal={setOpenModal}
                      language={language}
                      clientInfo={clientInfo}
                    ></TemplatePopup>
                  </PopUp>
                )}
              </div>
              <div>
                <SingleRow>
                  <div className="w-full px-4 sm:w-2/2">
                    <h2 className="mb-2">Ps</h2>
                    <Input
                      type="text"
                      name={`${prefix}ps`}
                      variant="primary"
                      value={formik.values.ps}
                      onChange={formik.handleChange}
                      placeholder="Current Value"
                    />
                  </div>
                </SingleRow>
                <StaticListComposition
                  header="buyer"
                  path={`${`voucher`}${`buyer`}`}
                  accordion={accordion}
                  handleAccordion={handleAccordion}
                >
                  {accordion[`${'voucher'}${'buyer'}`] && (
                    <SingleRow>
                      <div className="w-full px-4 sm:w-1/3">
                        <h2 className="mb-2">First Name</h2>
                        <Input
                          type="text"
                          variant="primary"
                          name={`${prefix}buyer.firstName`}
                          value={formik.values.buyer.firstName}
                          onChange={formik.handleChange}
                          placeholder="firstName"
                        />
                      </div>
                      <div className="w-full px-4 sm:w-1/3">
                        <h2 className="mb-2">Last Name</h2>
                        <Input
                          type="text"
                          variant="primary"
                          name={`${prefix}buyer.lastName`}
                          value={formik.values.buyer.lastName}
                          onChange={formik.handleChange}
                          placeholder="lastName"
                        />
                      </div>
                      <div className="w-full px-4 sm:w-1/3">
                        <h2 className="mb-2">Email</h2>
                        <Input
                          type="text"
                          variant="primary"
                          name={`${prefix}buyer.email`}
                          value={formik.values.buyer.email}
                          onChange={formik.handleChange}
                          placeholder="email"
                        />
                      </div>
                    </SingleRow>
                  )}
                </StaticListComposition>

                <StaticListComposition
                  header="customer"
                  path={`${`voucher`}${`customer`}`}
                  accordion={accordion}
                  handleAccordion={handleAccordion}
                >
                  {accordion[`${'voucher'}${'customer'}`] && (
                    <>
                      <SingleRow>
                        <div className="w-full px-4 sm:w-1/3">
                          <h2 className="mb-2">Salutation</h2>
                          <Input
                            type="text"
                            variant="primary"
                            name={`${prefix}customer.salutation`}
                            value={formik.values.customer.salutation}
                            onChange={formik.handleChange}
                            placeholder="salutation"
                          />
                        </div>
                        <div className="w-full px-4 sm:w-1/3">
                          <h2 className="mb-2">Name</h2>
                          <Input
                            type="text"
                            variant="primary"
                            name={`${prefix}customer.name`}
                            value={formik.values.customer.name}
                            onChange={formik.handleChange}
                            placeholder="name"
                          />
                        </div>
                        <div className="w-full px-4 sm:w-1/3">
                          <h2 className="mb-2">Email</h2>
                          <Input
                            type="text"
                            variant="primary"
                            name={`${prefix}customer.email`}
                            value={formik.values.customer.email}
                            onChange={formik.handleChange}
                            placeholder="email"
                          />
                        </div>
                      </SingleRow>
                      <SingleRow>
                        <div className="w-full px-4 sm:w-2/2">
                          <h2 className="mb-2">Message</h2>

                          <textarea
                            className="block w-full px-3 py-3 mt-1 overflow-hidden text-gray-700 border border-gray-400 rounded-lg resize-none focus:outline-none focus:shadow-outline"
                            rows="5"
                            placeholder="Message"
                            name={`${prefix}customer.message`}
                            value={formik.values.customer.message}
                            onChange={formik.handleChange}
                          ></textarea>
                        </div>
                      </SingleRow>
                    </>
                  )}
                </StaticListComposition>

                <div className="flex flex-wrap mb-5 -mx-4 text-left">
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mb-2">code</h2>
                    <Input
                      type="text"
                      variant="primary"
                      name={`${prefix}code`}
                      value={formik.values.code}
                      onChange={formik.handleChange}
                      placeholder="code"
                    />
                  </div>
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mb-2">clientNo </h2>
                    <Select
                      name={`${prefix}clientNo`}
                      value={formik.values.clientNo}
                      variant="primary"
                      onChange={async (e) => {
                        let strCode = formik.values.code.split('-')
                        strCode.reverse().splice(4)
                        strCode.push(e.target.value)
                        strCode.push('VMTS')
                        formik.setFieldValue(
                          `${prefix}code`,
                          strCode
                            .reverse()
                            .map((element) => element)
                            .join('-'),
                        )
                        formik.setFieldValue(`${prefix}clientNo`, e.target.value)
                        setClientNo(e.target.value)
                        await getClientInfo(e.target.value, clients)
                      }}
                      id="type"
                    >
                      {clients?.length > 0 ? (
                        <>
                          <option value="">Select Client</option>
                          {clients?.map((item) => (
                            <option className="bg-[red]" key={item.clientNumber} value={item.clientNumber}>
                              {`${item.clientNumber}  ---  ${item.name}`}
                            </option>
                          ))}
                        </>
                      ) : (
                        <>
                          <option value="">Please Select Widget</option>
                        </>
                      )}
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap mb-5 -mx-4 text-left">
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mb-2">status</h2>
                    <Input
                      type="text"
                      variant="primary"
                      name={`${prefix}status`}
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      placeholder="status"
                    />
                  </div>
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mb-2">language</h2>
                    <Input
                      type="text"
                      variant="primary"
                      name={`${prefix}language`}
                      value={formik.values.language}
                      onChange={formik.handleChange}
                      placeholder="language"
                    />
                  </div>
                </div>

                <StaticListComposition
                  header="basket"
                  path={`${'voucher'}${'basket'}`}
                  accordion={accordion}
                  handleAccordion={handleAccordion}
                >
                  {accordion[`${'voucher'}${'basket'}`] && (
                    <>
                      <SingleRow>
                        <div className="w-full px-4 sm:w-1/2">
                          <h2 className="mb-2">Total Amount</h2>
                          <Input
                            type="text"
                            name={`${prefix}basket.totalAmount`}
                            variant="primary"
                            onChange={formik.handleChange}
                            value={formik.values.basket.totalAmount}
                            placeholder="totalAmount"
                          />
                        </div>

                        <div className="w-full px-4 sm:w-1/2">
                          <h2 className="mb-2">Voucher Type</h2>
                          <Select
                            name={`${prefix}basket.voucherType`}
                            value={formik.values.basket.voucherType}
                            onChange={(e) => {
                              let actualValue = e.target.value
                              if (actualValue == voucherTypes.serviceVoucher && services.length == 0) {
                                getServiceData().then((newServices) => {
                                  addVoucherItem(newServices, actualValue)
                                  formik.setFieldValue(`${prefix}basket.voucherType`, actualValue)
                                })
                              } else {
                                addVoucherItem(services, actualValue)
                                formik.setFieldValue(`${prefix}basket.voucherType`, actualValue)
                              }
                            }}
                            variant="primary"
                            id="voucherType"
                          >
                            <>
                              <option value="valueVoucher">Value voucher</option>
                              <option value="serviceVoucher">Service voucher</option>
                            </>
                          </Select>
                        </div>
                      </SingleRow>
                      <p className="mb-4" />
                      <div className={`${(formik.values.clientNo == '' || formik.values.language == '') && `hidden`}`}>
                        <StaticListComposition
                          header="voucher"
                          path={`${'voucher'}${'basket'}${'voucher'}`}
                          accordion={accordion}
                          handleAccordion={handleAccordion}
                        >
                          {accordion[`${'voucher'}${'basket'}${'voucher'}`] && (
                            <>
                              <SingleRow>
                                <div className="w-full">
                                  {formik.values.basket.voucher.items.map((item, i) => {
                                    return (
                                      <StaticListComposition
                                        key={i}
                                        header="Item"
                                        path={`${'voucher'}${'basket'}${'voucher'}${'items'}[${i}]`}
                                        accordion={accordion}
                                        handleAccordion={handleAccordion}
                                        onTemplate={() => {
                                          setTemplateItem(formik.values.basket.voucher.items[i])
                                          setOpenModal(true)
                                        }}
                                      >
                                        {accordion[`${'voucher'}${'basket'}${'voucher'}${'items'}[${i}]`] && (
                                          <VoucherItem
                                            kognitiveImages={kognitiveImages}
                                            loadingKognitiveImages={loadingKognitiveImages}
                                            prefix={`${'basket.'}${'voucher.'}${'items'}[${i}].`}
                                            formikValues={formik.values.basket.voucher.items[i]}
                                            formik={formik}
                                            accordion={accordion}
                                            handleAccordion={handleAccordion}
                                            services={services}
                                            setLoading={setLoading}
                                            isConfirmed={isConfirmed}
                                            clientImages={clientImages}
                                            setClientImages={setClientImages}
                                            clientInfo={clientInfo}
                                          />
                                        )}
                                      </StaticListComposition>
                                    )
                                  })}
                                </div>
                              </SingleRow>
                              <SingleRow>
                                <div className="w-full px-4 sm:w-1/2">
                                  <h2 className="mb-2">Total Amount</h2>
                                  <Input
                                    type="text"
                                    name={`${prefix}basket.voucher.totalAmount`}
                                    variant="primary"
                                    onChange={formik.handleChange}
                                    value={formik.values.basket.voucher.totalAmount}
                                    placeholder="totalAmount"
                                  />
                                </div>
                              </SingleRow>
                            </>
                          )}
                        </StaticListComposition>
                      </div>
                      <StaticListComposition
                        header="Appointment"
                        path={`${'voucher'}${'basket'}${'appointment'}`}
                        accordion={accordion}
                        handleAccordion={handleAccordion}
                      >
                        {accordion[`${'voucher'}${'basket'}${'appointment'}`] && (
                          <>
                            <SingleRow>
                              <div className="w-full px-4 sm:w-1/2">
                                <h2 className="mb-2">Total Amount</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}basket.appointment.totalAmount`}
                                  value={formik.values.basket.appointment.totalAmount}
                                  onChange={formik.handleChange}
                                  placeholder="totalAmount"
                                />
                              </div>
                            </SingleRow>
                          </>
                        )}
                      </StaticListComposition>

                      <StaticListComposition
                        header="Personal Data"
                        path={`${'voucher'}${'basket'}${'personalData'}`}
                        accordion={accordion}
                        handleAccordion={handleAccordion}
                      >
                        {accordion[`${'voucher'}${'basket'}${'personalData'}`] && (
                          <>
                            <SingleRow>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">First Name</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}basket.personalData.firstName`}
                                  value={formik.values.basket.personalData.firstName}
                                  onChange={formik.handleChange}
                                  placeholder="firstName"
                                />
                              </div>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">Last Name</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}basket.personalData.lastName`}
                                  value={formik.values.basket.personalData.lastName}
                                  onChange={formik.handleChange}
                                  placeholder="lastName"
                                />
                              </div>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">Email</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}basket.personalData.email`}
                                  value={formik.values.basket.personalData.email}
                                  onChange={formik.handleChange}
                                  placeholder="email"
                                />
                              </div>
                            </SingleRow>
                            <SingleRow>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">Send Invoice</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}basket.personalData.sendInvoice`}
                                  value={formik.values.basket.personalData.sendInvoice}
                                  onChange={formik.handleChange}
                                  placeholder="Send Invoice"
                                />
                              </div>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">Accept Privacy</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}basket.personalData.acceptPrivacy`}
                                  value={formik.values.basket.personalData.acceptPrivacy}
                                  onChange={formik.handleChange}
                                  placeholder="Accept Privacy"
                                />
                              </div>
                            </SingleRow>
                          </>
                        )}
                      </StaticListComposition>
                    </>
                  )}
                </StaticListComposition>

                <div className="flex flex-wrap mb-5 -mx-4 text-left">
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mb-2">Id</h2>
                    <Input
                      type="text"
                      name={`${prefix}id`}
                      variant="primary"
                      value={formik.values.id}
                      onChange={formik.handleChange}
                      placeholder="id"
                    />
                  </div>
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mb-2">Initial Value</h2>
                    <Input
                      type="text"
                      name={`${prefix}initialValue`}
                      variant="primary"
                      value={formik.values.initialValue}
                      onChange={formik.handleChange}
                      placeholder="Initial Value"
                    />
                  </div>
                </div>
                <SingleRow>
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mb-2">Current Value</h2>
                    <Input
                      type="text"
                      name={`${prefix}currentValue`}
                      variant="primary"
                      value={formik.values.currentValue}
                      onChange={formik.handleChange}
                      placeholder="Current Value"
                    />
                  </div>
                  <div className="w-full px-4 sm:w-1/2">
                    <h2 className="mb-2">Email</h2>
                    <Input
                      type="text"
                      name={`${prefix}email`}
                      variant="primary"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      placeholder="Email"
                    />
                  </div>
                </SingleRow>
                <SingleRow>
                  <div className="w-full px-4 sm:w-2/2">
                    <h2 className="mb-2">Comments</h2>

                    <textarea
                      className="block w-full px-3 py-3 mt-1 overflow-hidden text-gray-700 border border-gray-400 rounded-lg resize-none focus:outline-none focus:shadow-outline"
                      rows="5"
                      placeholder="Comments"
                      name={`${prefix}comments`}
                      value={formik.values.comments}
                      onChange={formik.handleChange}
                    ></textarea>
                  </div>
                </SingleRow>
              </div>
            </div>
          </form>
        </FormikProvider>
      </div>
      <div
        className={`fixed transform transition duration-500 ease right-0 bottom-36 w-50 rounded-l flex flex-col p-2 border border-solid border-primary-400 bg-white  ${
          hideAttribute && `translate-x-full`
        }`}
      >
        <span
          onClick={() => {
            setHideAttribute(!hideAttribute)
          }}
          className="absolute p-2 transform -translate-x-full -translate-y-1/2 bg-white border border-solid rounded-full open-arrow top-1/2 left-2 border-primary-400"
        >
          {hideAttribute ? (
            <svg className="block w-4 h-4 fill-current" viewBox="0 0 256 512" aria-hidden="true" role="presentation">
              <path d="M238.475 475.535l7.071-7.07c4.686-4.686 4.686-12.284 0-16.971L50.053 256 245.546 60.506c4.686-4.686 4.686-12.284 0-16.971l-7.071-7.07c-4.686-4.686-12.284-4.686-16.97 0L10.454 247.515c-4.686 4.686-4.686 12.284 0 16.971l211.051 211.05c4.686 4.686 12.284 4.686 16.97-.001z"></path>
            </svg>
          ) : (
            <svg className="block w-4 h-4 fill-current" viewBox="0 0 256 512" aria-hidden="true" role="presentation">
              <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z"></path>
            </svg>
          )}
        </span>

        <Button
          variant="primary"
          className="m-2 bg-white"
          aria-label="save"
          type="button"
          onClick={async (e) => {
            await handleSubmit(e)
          }}
        >
          Save changes
        </Button>

        {formik.values?._id && (
          <Button
            variant="danger"
            className="m-2 text-sm bg-white"
            onClick={() => {
              const str = 'Are you sure you want to delete the voucher?'
              isConfirmed(str).then((canDelete) => {
                if (canDelete) {
                  handleDelete()
                }
              })
            }}
          >
            Delete Voucher
          </Button>
        )}
      </div>
    </div>
  )
}

const TemplatePopup = ({ templateItem, code, setOpenModal, language, clientInfo }) => {
  const { type, value, salutation, name, greetings, services, templateImage, logo, issueDate, expiryDate } =
    templateItem
  let address = Object.entries(clientInfo?.addresses || {}).find((x) => x[1].id == templateItem.addressId)?.[1] || {}
  const data = {
    type,
    value,
    salutation,
    name,
    greetings,
    services,
    code,
    templateImage,
    logo,
    issueDate,
    expiryDate,
    language,
    address,
  }
  return (
    <div className="m-8 main-wrapper">
      <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-7/12">
        <div className="flex justify-between pb-2 border-b border-black border-solid">
          <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Template :-</h1>
          <svg
            onClick={() => {
              setOpenModal(false)
            }}
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
        <div className="relative flex justify-center p-4 mt-2 client-modal-scroll">
          <VoucherTemplate data={data}></VoucherTemplate>
        </div>
      </div>
    </div>
  )
}

export default VoucherAddEdit

export async function getServerSideProps(context) {
  return Authenticate(context)
}
