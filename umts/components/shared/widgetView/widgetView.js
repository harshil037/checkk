import React, { useState, useEffect, useRef } from 'react'
import { Select } from '../../componentLibrary'
import Button from '../../common/Button'
import { ProductView, AttributesView, IFrame } from '../widgetView/index'
import ColorInput from '../../stylesConfigPage/colorInput'

const WidgetView = ({
  module,
  setIsDemoView,
  language,
  data,
  lang,
  setDefaultLanguage,
  productName,
  version,
  domainId,
  clientId,
  attributes,
  setAttributes,
  products,
  onChangeProduct,
  domainUrl,
  domainName,
  productProps,
}) => {
  const [hideAttribute, setHideAttribute] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isIpadView, setIsIpadView] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')

  useEffect(() => {
    if (productProps.demoView === false) {
      setIsDemoView(false)
    }
  })

  return (
    <div className="mt-8">
      <div className="flex flex-col items-center text-left">
        <div key="header" className="flex justify-between w-full">
          {setIsDemoView && (
            <div>
              <Button
                onClick={() => {
                  setIsDemoView(false)
                }}
                variant="primary"
                className="flex items-center px-4 text-sm bg-white"
              >
                Edit
                <img className="inline-block pl-4" src="/images/Edit.svg" alt="edit" width="32" />
              </Button>
            </div>
          )}
          <div className="flex flex-row justify-between flex-nowrap">
            <div className="flex items-center px-4">
              <ColorInput id={'backGround'} value={backgroundColor} onChange={setBackgroundColor} />
            </div>
            <div className="m-auto">
              <button
                className={`${
                  isMobileView ? 'bg-primary-400' : 'bg-white'
                } border border-primary-400 px-4 py-1 rounded-lg text-sm`}
                onClick={() => {
                  setIsMobileView(true)
                  setIsIpadView(false)
                }}
              >
                Mobile View
              </button>
              <button
                className={`${
                  isIpadView ? 'bg-primary-400' : 'bg-white'
                } border border-primary-400 px-4 py-1 rounded-lg text-sm ml-5`}
                onClick={() => {
                  setIsIpadView(true)
                  setIsMobileView(false)
                }}
              >
                Ipad View
              </button>
              <button
                className={`${
                  !isMobileView && !isIpadView ? 'bg-primary-400' : 'bg-white'
                } border border-primary-400 px-4 py-1 rounded-lg text-sm ml-5`}
                onClick={() => {
                  setIsMobileView(false)
                  setIsIpadView(false)
                }}
              >
                Desktop View
              </button>
            </div>
            <div className="flex items-center px-4">
              <h2 className="mr-4">Language</h2>
              <Select
                value={language}
                onChange={(e) => {
                  setDefaultLanguage(e.target.value)
                }}
                className="w-full py-1 pl-2 pr-8 pr-12 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-400 rounded-lg lang-select select__list focus:outline-none focus:shadow-outline"
              >
                {lang.map((item) => {
                  return (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  )
                })}
              </Select>
            </div>
          </div>
          {onChangeProduct && products && (
            <div className="flex items-center px-4">
              <h2 className="mr-4">Products</h2>
              <Select
                value={productName}
                onChange={(e) => {
                  onChangeProduct(e.target.value)
                }}
                className="w-full py-1 pl-2 pr-8 pr-12 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-400 rounded-lg lang-select select__list focus:outline-none focus:shadow-outline"
              >
                {products.map((item) => {
                  return (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  )
                })}
              </Select>
            </div>
          )}
        </div>
        <div
          key="details"
          className="w-full p-8 mt-2 overflow-hidden transform scale-100 bg-white border border-gray-300 rounded-lg shadow-lg"
        >
          <div className="flex flex-wrap">
            <div
              className={`flex justify-center xl:p-8 p-4 rounded-lg border border-gray-300 overflow-y-auto iframe-wrapper transition ease duration-300 w-full ${
                !hideAttribute && `2xl:w-9/12 xl:w-7/12 w-full`
              }`}
            >
              <IFrame key={productName+clientId+version} isIpadView={isIpadView} style={{ backgroundColor }} module={module} version={version} isMobileView={isMobileView}>
                <ProductView
                  productName={productName}
                  language={language}
                  clientId={clientId}
                  domainId={domainId}
                  version={version}
                  data={data}
                  module={module}
                  attributes={attributes}
                  isIpadView={isIpadView}
                  isMobileView={isMobileView}
                  domainUrl={domainUrl}
                  domainName={domainName}
                />
              </IFrame>
            </div>
            <div
              className={`pl-10 xl:mt-0 mt-4 2xl:w-3/12 xl:w-5/12 w-full xl:right-0 transition ease duration-300 self-start  ${
                hideAttribute ? `slide-menu fixed` : `relative`
              }`}
            >
              <span
                onClick={() => {
                  setHideAttribute(!hideAttribute)
                }}
                className={`cursor-pointer open-arrow absolute hidden xl:block top-1/2 transform -translate-x-1/2 ${
                  hideAttribute ? `-left-5` : `left-0`
                } border border-gray-300 border-solid p-2 px-1 pr-2 bg-white`}
              >
                {hideAttribute ? (
                  <span className="flex items-center">
                    <svg
                      className="block w-4 h-4 fill-current"
                      viewBox="0 0 256 512"
                      aria-hidden="true"
                      role="presentation"
                    >
                      <path d="M238.475 475.535l7.071-7.07c4.686-4.686 4.686-12.284 0-16.971L50.053 256 245.546 60.506c4.686-4.686 4.686-12.284 0-16.971l-7.071-7.07c-4.686-4.686-12.284-4.686-16.97 0L10.454 247.515c-4.686 4.686-4.686 12.284 0 16.971l211.051 211.05c4.686 4.686 12.284 4.686 16.97-.001z"></path>
                    </svg>
                    <span className="ml-4">Show More</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      className="block w-4 h-4 fill-current"
                      viewBox="0 0 256 512"
                      aria-hidden="true"
                      role="presentation"
                    >
                      <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z"></path>
                    </svg>
                    <span className="ml-4">Close</span>
                  </span>
                )}
              </span>
              <AttributesView
                productName={productName}
                language={language}
                clientId={clientId}
                attributes={attributes}
                setAttributes={setAttributes}
                version={version}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WidgetView
