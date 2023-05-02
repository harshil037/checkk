import React from 'react'
import ImageUploadList from '../../components/imageUploadList'
import ImageSelectionList from '../../components/imageSelectionList'
import { useState, useEffect } from 'react'
import SingleRow from '../../components/shared/singleRow'
import { Input, Select } from '../../components/componentLibrary'
import Button from '../common/Button'
import StaticListComposition from '../../components/shared/staticListComposition'
import { FieldArray } from 'formik'
import PopUp from '../../components/dialog/popUp'
import dynamic from 'next/dynamic'
const RTE = dynamic(() => import('../../components/shared/rteVoucher'), {
  ssr: false,
})

const VoucherItem = ({
  formikValues,
  prefix,
  formik,
  accordion,
  handleAccordion,
  setLoading,
  isConfirmed,
  clientImages,
  setClientImages,
  clientInfo,
  kognitiveImages,
  loadingKognitiveImages,
  language = 'de',
}) => {
  const [imageKey, setImageKey] = useState('')
  const [isImageUpload, setIsImageUpload] = useState(false)
  const [isLogoUpload, setIsLogoUpload] = useState(false)
  const workerPath = 'https://worker.mts-online.com'
  //const workerPath = 'http://10.10.10.119:3001'
  const [controlSelectedImages, setControlSelectedImages] = useState({ imageList: [], logoList: [] })

  //#region "handle selected image changed"
  // initialization code
  useEffect(() => {
    let tempArr = { ...controlSelectedImages }
    const imageVal = formik.getFieldProps(prefix + 'templateImage.fileName').value
    const logoVal = formik.getFieldProps(prefix + 'logo').value

    let needChange = false
    if (imageVal != '' && imageVal != undefined) {
      needChange = true
      tempArr['imageList'] = [{ url: imageVal }]
    }
    if (logoVal != '' && logoVal != undefined) {
      needChange = true
      tempArr['logoList'] = [{ url: logoVal }]
    }

    if (needChange) {
      setControlSelectedImages(tempArr)
    }
  }, [])

  useEffect(() => {
    if (imageKey) {
      const value = imageKey.includes('templateImage.fileName') ? 'imageList' : 'logoList'
      formik.setFieldValue(imageKey, controlSelectedImages[value][0]?.url)
    }
  }, [controlSelectedImages])
  //#endregion

  return (
    <>
      {/* <SingleRow>
        <div className="w-full px-4 sm:w-1/3">
          <h2 className="mb-2">Type</h2>
          <Input
            placeholder="Voucher type"
            variant="primary"
            type="text"
            name={`${prefix}type`}
            value={formikValues.type}
            onChange={formik.handleChange}
          />
        </div>
        <div className="w-full px-4 sm:w-1/3">
          <h2 className="mb-2">quantity</h2>
          <Input
            type="text"
            name={`${prefix}quantity`}
            variant="primary"
            value={formikValues.quantity}
            onChange={formik.handleChange}
            placeholder="quantity"
          />
        </div>
        <div className="w-full px-4 sm:w-1/3">
          <h2 className="mb-2">value</h2>
          <Input
            type="text"
            name={`${prefix}value`}
            variant="primary"
            value={formikValues.value}
            onChange={formik.handleChange}
            placeholder="Value"
          />
        </div>
      </SingleRow> */}
      {/* <SingleRow>
        <div className="w-full px-4 sm:w-1/3">
          <h2 className="mb-2">sendVia</h2>
          <Input
            type="text"
            name={`${prefix}sendVia`}
            variant="primary"
            value={formikValues.sendVia}
            onChange={formik.handleChange}
            placeholder="sendVia"
          />
        </div>
        <div className="w-full px-4 sm:w-1/3">
          <h2 className="mb-2">sendTo</h2>
          <Input
            type="text"
            name={`${prefix}sendTo`}
            variant="primary"
            value={formikValues.sendTo}
            onChange={formik.handleChange}
            placeholder="sendTo"
          />
        </div>
        <div className="w-full px-4 sm:w-1/3">
          <h2 className="mb-2">template</h2>
          <Input
            type="text"
            name={`${prefix}template`}
            variant="primary"
            value={formikValues.template}
            onChange={formik.handleChange}
            placeholder="template"
          />
        </div>
      </SingleRow> */}
      <SingleRow>
        <div className="w-full px-4 sm:w-1/3">
          <h2 className="mb-2">salutation</h2>
          <Input
            type="text"
            name={`${prefix}salutation`}
            variant="primary"
            value={formikValues.salutation}
            onChange={formik.handleChange}
            placeholder="salutation"
          />
        </div>
        <div className="w-full px-4 sm:w-1/3">
          <h2 className="mb-2">name</h2>
          <Input
            type="text"
            name={`${prefix}name`}
            variant="primary"
            value={formikValues.name}
            onChange={formik.handleChange}
            placeholder="name"
          />
        </div>
        {clientInfo?.addresses && (
          <div className="w-full px-4 sm:w-1/3">
            <h2 className="mb-2">address</h2>
            <Select
              name={`${prefix}addressId`}
              value={formikValues.addressId}
              variant="primary"
              onChange={(e) => {
                formik.setFieldValue(`${prefix}addressId`, e.target.value)
              }}
              id="type"
            >
              <>
                {/* this address array saved as object in db, in order show in select need convert */}
                <option value="">Select Client</option>
                {Object.entries(clientInfo.addresses)?.map((item) => (
                  <option key={item[1].id} value={item[1].id}>
                    {item[0]}
                  </option>
                ))}
              </>
            </Select>
          </div>
        )}
      </SingleRow>

      {/* <SingleRow>
        <div className="w-full px-4 sm:w-1/3">
          <h2 className="mb-2">templateImageIndex</h2>
          <Input
            type="text"
            name={`${prefix}templateImageIndex`}
            variant="primary"
            value={formikValues.templateImageIndex}
            onChange={formik.handleChange}
            placeholder="templateImageIndex"
          />
        </div>
        <div className="w-full px-4 sm:w-1/3">
          <h2 className="mb-2">serviceGroup</h2>
          <Input
            type="text"
            variant="primary"
            name={`${prefix}serviceGroup`}
            value={formikValues.serviceGroup}
            onChange={formik.handleChange}
            placeholder="serviceGroup"
          />
        </div>
      </SingleRow> */}

      <SingleRow>
        <div className="w-full px-4">
          {/* <div className="p-4 border border-gray-300 border-solid rounded-xl"> */}
          {/* <h3 className="mb-2 text-lg font-semibold text-gray-800">Services</h3> */}
          <StaticListComposition
            key="Services"
            header="Services"
            path={`${prefix}${`services`}`}
            accordion={accordion}
            handleAccordion={handleAccordion}
            isService={false}
            formikValues={formikValues}
          >
            {accordion[`${prefix}${'services'}`] && (
              <>
                {formik.values.basket.voucherType == 'serviceVoucher' &&
                  Object.entries(formikValues?.services).map(([key, item], index) => {
                    const itemCode = key
                    return (
                      <StaticListComposition
                        key={itemCode}
                        header={key}
                        path={`${prefix}${`services.`}${itemCode}`}
                        accordion={accordion}
                        handleAccordion={handleAccordion}
                        isService={true}
                        isSelected={item.isSelected}
                        formikValues={formikValues}
                      >
                        {accordion[`${prefix}${'services.'}${itemCode}`] && (
                          <>
                            <SingleRow>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">Title</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}services.${itemCode}.title`}
                                  value={item.title}
                                  onChange={formik.handleChange}
                                  placeholder="Title"
                                />
                              </div>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">Quantity</h2>
                                <Input
                                  type="number"
                                  variant="primary"
                                  name={`${prefix}services.${itemCode}.quantity`}
                                  value={item.quantity}
                                  onChange={formik.handleChange}
                                  placeholder="Quantity"
                                />
                              </div>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">Amount</h2>
                                <Input
                                  type="number"
                                  variant="primary"
                                  name={`${prefix}services.${itemCode}.price.amount`}
                                  value={item.price.amount}
                                  onChange={formik.handleChange}
                                  placeholder="Amount"
                                />
                              </div>
                            </SingleRow>
                          </>
                        )}
                      </StaticListComposition>
                    )
                  })}

                {formik.values.basket.voucherType == 'valueVoucher' &&
                  Object.entries(formikValues?.services).map(([key, item], index) => {
                    const itemCode = key
                    let name = item.name
                    let salutation = item.salutation
                    let message = item.message
                    return (
                      <StaticListComposition
                        key={itemCode}
                        header={itemCode}
                        path={`${prefix}${`services.`}${itemCode}`}
                        accordion={accordion}
                        handleAccordion={handleAccordion}
                        isService={false}
                        formikValues={formikValues}
                      >
                        {accordion[`${prefix}${'services.'}${itemCode}`] && (
                          <>
                            <SingleRow>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">Name</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}services.${itemCode}.name`}
                                  value={name}
                                  onChange={formik.handleChange}
                                  placeholder="Name"
                                />
                              </div>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">Salutation</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}services.${itemCode}.salutation`}
                                  value={salutation}
                                  onChange={formik.handleChange}
                                  placeholder="Salutation"
                                />
                              </div>
                              <div className="w-full px-4 sm:w-1/3">
                                <h2 className="mb-2">Value</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}services.${itemCode}.value`}
                                  value={item.value}
                                  onChange={formik.handleChange}
                                  placeholder="Value"
                                />
                              </div>
                            </SingleRow>
                            <SingleRow>
                              <div className="w-full px-4 sm:w-1/1">
                                <h2 className="mb-2">Message</h2>
                                <textarea
                                  className="block w-full px-3 py-3 mt-1 overflow-hidden text-gray-700 border border-gray-400 rounded-lg resize-none focus:outline-none focus:shadow-outline"
                                  rows="5"
                                  placeholder="Greetings"
                                  name={`${prefix}services.${itemCode}.message`}
                                  value={message}
                                  onChange={formik.handleChange}
                                ></textarea>
                              </div>
                            </SingleRow>
                          </>
                        )}
                      </StaticListComposition>
                    )
                  })}

                {/* {formik.values.basket.voucherType == 'valueVoucher' && (
                  <Button
                    onClick={() => {
                      formikValues
                      const arrServices = formikValues.services || {}
                      const length = Object.entries(arrServices).length
                      const obj = { [`valueVoucher${length + 1}`]: { name: '', salutation: '', message: '' } }
                      const mix = { ...arrServices, ...obj }
                      formik.setFieldValue(`${prefix}services`, mix)
                    }}
                    variant="primary"
                    className={`${Object.entries(formikValues.services || {}).length == 0 && `mt-5`}`}
                  >
                    add service
                    <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                  </Button>
                )} */}
              </>
            )}
          </StaticListComposition>
        </div>
      </SingleRow>

      <SingleRow>
        <div className="w-full px-4 mt-2 sm:w-2/2">
          <h2 className="mb-2">Greetings</h2>
          <textarea
            className="block w-full px-3 py-3 mt-1 overflow-hidden text-gray-700 border border-gray-400 rounded-lg resize-none focus:outline-none focus:shadow-outline"
            rows="5"
            placeholder="Greetings"
            name={`${prefix}greetings`}
            value={formikValues.greetings}
            onChange={formik.handleChange}
          ></textarea>
        </div>
      </SingleRow>

      <StaticListComposition
        header="Template Image"
        path={`${prefix}${`templateImage`}`}
        accordion={accordion}
        handleAccordion={(path, i) => {
          handleAccordion(path, i)
          setImageKey(`${prefix}${`templateImage.fileName`}`)
        }}
      >
        {accordion[`${prefix}${'templateImage'}`] && (
          <SingleRow>
            <PopUp openModal={isImageUpload}>
              {isImageUpload && (
                <div className="m-8 main-wrapper">
                  <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-7/12">
                    <div className="flex justify-between pb-2 border-b border-black border-solid">
                      <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">
                        Template Image Upload
                      </h1>
                      <svg
                        onClick={() => {
                          setIsImageUpload(false)
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
                      <ImageUploadList
                        kognitiveImages={kognitiveImages
                          .filter((item) => item.code != 15)
                          .map((item) => {
                            return item.url
                          })}
                        loadingKognitiveImages={loadingKognitiveImages}
                        handleChange={(imageList) => {
                          setClientImages((prevState) => ({
                            ...prevState,
                            imageList: imageList,
                          }))
                        }}
                        imageItems={clientImages.imageList}
                        setLoading={setLoading}
                        isConfirmed={isConfirmed}
                        clientId={formik.values.clientNo}
                        workerPath={workerPath}
                        apiPath="files"
                        uploadPath={`${formik.values.clientNo}/static/voucher-images`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </PopUp>
            <div className="w-full px-4 sm:w-2/2">
              <ImageSelectionList
                controlSelectedImages={controlSelectedImages.imageList}
                onImageSelectionChange={(images) => {
                  setControlSelectedImages((prevState) => ({
                    ...prevState,
                    imageList: images.length > 0 ? images : [],
                  }))
                }}
                clientImages={clientImages.imageList}
                isPopup={false}
                isMultiSelect={false}
              />
              <Button
                onClick={() => {
                  setIsImageUpload(true)
                }}
                variant="primary"
              >
                upload More
              </Button>
            </div>
          </SingleRow>
        )}
      </StaticListComposition>

      <StaticListComposition
        header="logo"
        path={`${prefix}${`logo`}`}
        accordion={accordion}
        handleAccordion={(path, i) => {
          handleAccordion(path, i)
          setImageKey(`${prefix}${`logo`}`)
        }}
      >
        {accordion[`${prefix}${'logo'}`] && (
          <SingleRow>
            <PopUp openModal={isLogoUpload}>
              {isLogoUpload && (
                <div className="m-8 main-wrapper">
                  <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-7/12">
                    <div className="flex justify-between pb-2 border-b border-black border-solid">
                      <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">
                        logo Upload123
                      </h1>
                      <svg
                        onClick={() => {
                          setIsLogoUpload(false)
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
                      <ImageUploadList
                        kognitiveImages={kognitiveImages
                          .filter((item) => item.code == 15)
                          .map((item) => {
                            return item.url
                          })}
                        loadingKognitiveImages={loadingKognitiveImages}
                        handleChange={(logoList) => {
                          setClientImages((prevState) => ({
                            ...prevState,
                            logoList: logoList,
                          }))
                        }}
                        imageItems={clientImages.logoList}
                        setLoading={setLoading}
                        isConfirmed={isConfirmed}
                        clientId={formik.values.clientNo}
                        workerPath={workerPath}
                        apiPath="files"
                        uploadPath={`${formik.values.clientNo}/static/logos`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </PopUp>
            <div className="w-full px-4 sm:w-2/2">
              <ImageSelectionList
                controlSelectedImages={controlSelectedImages.logoList}
                onImageSelectionChange={(images) => {
                  setControlSelectedImages((prevState) => ({
                    ...prevState,
                    logoList: images,
                  }))
                }}
                clientImages={clientImages.logoList}
                isPopup={false}
                isMultiSelect={false}
              />
              <Button
                onClick={() => {
                  setIsLogoUpload(true)
                }}
                variant="primary"
              >
                upload More
              </Button>
            </div>
          </SingleRow>
        )}
      </StaticListComposition>
      {/* emails */}
      <SingleRow>
        <div className="w-full px-4">
          <div className="p-4 border border-gray-300 border-solid rounded-xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">Emails</h3>
            <FieldArray
              name={`${prefix}emails`}
              render={(arrayHelpers) => (
                <div>
                  {formikValues.emails.map((item, i) => {
                    return (
                      <StaticListComposition
                        key={i}
                        header="Email Item"
                        path={`${`voucher`}${`emails`}[${i}]`}
                        accordion={accordion}
                        handleAccordion={handleAccordion}
                        onDelete={() => {
                          arrayHelpers.remove(i)
                        }}
                      >
                        {accordion[`${'voucher'}${'emails'}[${i}]`] && (
                          <>
                            <SingleRow>
                              <div className="w-full px-4 sm:w-1/2">
                                <h2 className="mb-2">To</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}emails[${i}].to`}
                                  value={formikValues.emails[i].to}
                                  onChange={formik.handleChange}
                                  placeholder="To"
                                />
                              </div>
                            </SingleRow>
                            <SingleRow>
                              <div className="w-full px-4 sm:w-1/2">
                                <h2 className="mb-2">Cc</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}emails[${i}].cc`}
                                  value={formikValues.emails[i].cc}
                                  onChange={formik.handleChange}
                                  placeholder="Cc"
                                />
                              </div>
                            </SingleRow>
                            <SingleRow>
                              <div className="w-full px-4 sm:w-1/2">
                                <h2 className="mb-2">Subject</h2>
                                <Input
                                  type="text"
                                  variant="primary"
                                  name={`${prefix}emails[${i}].subject`}
                                  value={formikValues.emails[i].subject}
                                  onChange={formik.handleChange}
                                  placeholder="Subject"
                                />
                              </div>
                            </SingleRow>
                            <div className="flex flex-wrap mt-6 -mx-4 text-left">
                              <div className="w-full px-4 mt-6 ">
                                <div className="flex">
                                  <h3>Body</h3>
                                </div>
                                <div className="m-3">
                                  <RTE
                                    formik={formik}
                                    path={`${prefix}emails[${i}].body`}
                                    value={formikValues.emails[i].body}
                                  />
                                </div>
                                <p className="mx-3 my-1 text-red-700"></p>
                              </div>
                            </div>
                          </>
                        )}
                      </StaticListComposition>
                    )
                  })}

                  <Button
                    onClick={() => {
                      arrayHelpers.push({ to: [], subject: '', body: '' })
                    }}
                    variant="primary"
                  >
                    add email
                    <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                  </Button>
                </div>
              )}
            />
          </div>
        </div>
      </SingleRow>
    </>
  )
}

export default VoucherItem
