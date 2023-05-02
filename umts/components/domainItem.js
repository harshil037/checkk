import React, { useState } from 'react'
import { Input } from '../components/componentLibrary'
import { getWidgetImage } from '../lib/utils'

const DomainItem = ({
  keyItem,
  domainDetail,
  handleOpenProduct,
  handleGotoProduct,
  domainToggleHandler,
  handleGotoSmts,
  handleGotoReception,
  router,
  handleOpen,
  setContextData,
  user,
  handleGotoSkyalpsInterface,
}) => {
  const [isComponent, setIsComponent] = useState({ id: null, status: false })

  return (
    <div key={keyItem} className="common" style={{ marginBottom: '30px' }}>
      <div className="p-4 bg-white border border-gray-300 rounded-lg">
        <div className="flex flex-wrap justify-between pb-2 border-b border-black border-dashed ">
          <div className="flex items-center py-1 ">
            <h3 className="pr-2 text-xl font-bold text-left text-gray-600">{domainDetail?.url}</h3>
            {(user.superadmin || user.email.includes('@mts-online.com')) && (
              <img
                onClick={() => {
                  handleOpen(domainDetail?._id, false)
                }}
                className="inline-block px-2 cursor-pointer"
                src="/images/domain-page-edit-icon.svg"
                alt="Client"
              />
            )}
          </div>

          {(user.superadmin || user.email.includes('@mts-online.com')) && (
            <ul className="flex flex-wrap text-left domain-headerlist">
              <li key={'domain-notes'} className="w-1/2 mt-2 sm:px-4 sm:border-r lg:w-auto lg:mt-0">
                <div
                  onClick={() => {
                    handleOpen(domainDetail?._id, true)
                  }}
                  className="flex items-center px-2 py-1 cursor-pointer"
                >
                  Notes
                  <img className="inline-block px-2" src="/images/sticky-note.svg" alt="Users" />
                </div>
              </li>
              <li key={'users-domain'} className="w-1/2 mt-2 sm:px-4 sm:border-r lg:w-auto lg:mt-0">
                <div
                  onClick={() => {
                    router.push(`/admin/users?domainUrl=` + domainDetail?.url)
                  }}
                  className="flex items-center px-2 py-1 cursor-pointer"
                >
                  View Users
                  <img className="inline-block px-2" src="/images/frame.svg" alt="Users" />
                </div>
              </li>
              <li key={'Analytics-domain'} className="w-1/2 mt-2 sm:px-4 md:border-r lg:w-auto lg:mt-0">
                <div
                  className="flex items-center px-2 py-1 cursor-pointer"
                  onClick={() => {
                    setContextData((prevState) => ({
                      ...prevState,
                      navigationItem: 'analytics',
                    }))
                    router.push(`/admin/analytics`)
                  }}
                >
                  Analytics
                  <img className="inline-block px-2" src="/images/client-analytics.svg" alt="Analytics" />
                </div>
              </li>

              <li key={'Client-domain'} className="w-1/2 mt-2 sm:px-4 sm:border-r lg:w-auto lg:mt-0">
                <div
                  onClick={() => {
                    router.push(`/admin/clients?domainId=` + domainDetail?._id)
                  }}
                  className="flex items-center px-2 py-1 cursor-pointer"
                >
                  View Client
                  <img className="inline-block px-2" src="/images/veiw-client.svg" alt="Client" />
                </div>
              </li>
              <li key={'Status-domain'} className="w-1/2 mt-2 sm:px-4 sm:border-r lg:w-auto lg:mt-0">
                <div className="flex items-center px-2 py-1">
                  <div className="tooltip">
                    <label htmlFor={domainDetail?._id} className="cursor-pointer">
                      Status
                    </label>
                    <span className="tooltiptext">Change Domain Status</span>
                  </div>

                  <div id="app" className="inline-block">
                    <div className="">
                      <div className="flex items-center">
                        <Input
                          variant="primary"
                          onChange={() =>
                            domainToggleHandler({
                              _id: domainDetail?._id,
                              value: domainDetail?.status,
                              key: 'status',
                            })
                          }
                          type="toggle"
                          id={domainDetail?._id}
                          checked={domainDetail?.status | false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/*  */}
              <li key={'component-domain'} className="w-1/2 mt-2 sm:px-4 sm:border-r lg:w-auto lg:mt-0">
                <div className="flex items-center px-2 py-1">
                  <div className="tooltip">
                    <label htmlFor={domainDetail.name} className="cursor-pointer">
                      Component
                    </label>
                    <span className="tooltiptext">Show domains components</span>
                  </div>

                  <div className="inline-block">
                    <div className="flex items-center">
                      <Input
                        variant="primary"
                        onChange={() => setIsComponent({ id: domainDetail._id, status: !isComponent.status })}
                        type="toggle"
                        id={domainDetail.name}
                        checked={isComponent.status | false}
                      />
                    </div>
                  </div>
                </div>
              </li>
              {/*  */}

              <li key={'Settings-domain'} className="w-1/2 mt-2 sm:px-4 md:border-r lg:w-auto lg:mt-0">
                <div
                  onClick={(e) => {
                    e.preventDefault()
                    handleGotoSmts(domainDetail?._id)
                  }}
                  className="flex items-center px-2 py-1 cursor-pointer"
                >
                  <div className="tooltip">
                    SMTS Settings
                    <span className="tooltiptext">Edit SMTS Settings</span>
                  </div>
                  <img className="inline-block px-2" src="/images/settings-bar.svg" alt="Settings" />
                </div>
              </li>
              <li className="w-1/2 mt-2 sm:pl-4 lg:w-auto lg:mt-0">
                <div
                  onClick={() => handleOpenProduct({ _id: domainDetail?._id })}
                  className="flex items-center px-2 py-1 cursor-pointer"
                >
                  <div className="tooltip">
                    Add Products
                    <span className="tooltiptext">Add New Product</span>
                  </div>
                  <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                </div>
              </li>
            </ul>
          )}
        </div>
        <div className="mt-5">
          <div className="flex flex-wrap -mx-4">
            <>
              {domainDetail?.products && domainDetail?.products.length > 0 ? (
                domainDetail?.products?.map((productItem, i) => {
                  if (
                    (isComponent.status === true && productItem.type === 'component') ||
                    productItem.type === 'widget' ||
                    productItem.type === 'website' ||
                    (isComponent.status === false && productItem.type !== 'component')
                  )
                    return (
                      <div key={'productItem' + i} className="w-full px-4 mb-4 md:w-1/2 lg:w-1/3 xl:w-1/5">
                        <div className="inline-block w-full px-4 text-left transition-all duration-300 ease-in-out transform border border-gray-300 rounded-lg hover:shadow hover:scale-105">
                          <span className="flex items-center">
                            <span
                              className="flex items-center w-11/12 cursor-pointer"
                              onClick={() => {
                                if (user.superadmin || user.email.includes('@mts-online.com')) {
                                  handleGotoProduct(domainDetail?._id, productItem._id)
                                }
                              }}
                            >
                              <img
                                className="inline-block py-4 pr-2 cursor-pointer"
                                src={getWidgetImage(productItem?.module)}
                                alt="Users"
                                width="32"
                                height="32"
                              />
                              <span className="py-4 mx-auto break-all cursor-pointer">{productItem.name}</span>
                            </span>
                            {productItem?.module === 'smart-response-reception' && (
                              <>
                                <span className="py-3 border-l "></span>
                                <img
                                  onClick={() => handleGotoReception(domainDetail?._id, productItem._id)}
                                  className="inline-block py-4 px-2 ml-auto cursor-pointer"
                                  src="/images/reply-mail.svg"
                                  alt="Users"
                                />
                              </>
                            )}

                            {(user.superadmin || user.email.includes('@mts-online.com')) &&
                              productItem.type != 'component' && (
                                <>
                                  <span className="py-3 border-l "></span>
                                  <img
                                    onClick={() => handleOpenProduct({ _id: domainDetail?._id }, productItem._id)}
                                    className="inline-block py-4 pl-2 ml-auto cursor-pointer"
                                    src="/images/setting.svg"
                                    alt="Users"
                                  />
                                </>
                              )}

                            {productItem?.module?.includes('SkyalpsInterface') && (
                              <span
                                className="ml-2 cursor-pointer"
                                onClick={() => handleGotoSkyalpsInterface(domainDetail._id, productItem._id)}
                              >
                                <img src="/images/skyapls-map-room.svg" />
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    )
                })
              ) : (
                <h2 className="w-full text-lg text-center">No products available</h2>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DomainItem
