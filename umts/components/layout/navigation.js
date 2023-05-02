import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DefaultAppContext } from '../../context/appContext'

const Navigation = ({
  user,
  links,
  mutate,
  domains,
  handleGotoProduct,
  contextData,
  setContextData,
  navigateTo,
  setLoading,
  isConfirmed,
}) => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [accordian, setAccordian] = useState({})
  const [domainToggle, setDomainToggle] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (user.superadmin) {
      if (contextData.navigationItem == '') {
        setContextData((prevState) => ({
          ...prevState,
          navigationItem: links?.length > 0 && links[0].label === 'Domains' ? links[0].label : '',
        }))
      }
    } else {
      if (contextData.navigationItem == '') {
        setContextData((prevState) => ({
          ...prevState,
          navigationItem: links?.length > 0 ? links[0].label : '',
        }))
      }
    }
  }, [links])

  useEffect(() => {
    if (domainToggle) {
      scrollProducts()
    }
  }, [domainToggle])

  useEffect(() => {
    scrollProducts()
  }, [contextData.search.default])

  const scrollProducts = () => {
    if (contextData.search.default && domains) {
      setAccordian(() => {
        return { [contextData.search.default.url]: true }
      })
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
      }
    }
  }

  const handleLogout = async () => {
    navigateTo('', isConfirmed, async () => {
      setContextData(DefaultAppContext)
      setLoading(true)
      await fetch('/api/auth', {
        method: 'DELETE',
      })
      mutate(null)
      router.replace('/')
    })
  }

  return (
    <>
      <div className="sticky top-0 z-50 pt-4 lg:z-10 lg:top-0 bg-[#e5e5e5] md:pt-0">
        <nav className="flex flex-wrap items-center justify-between p-6 bg-white rounded-lg md:hidden">
          <div className="flex items-center flex-shrink-0 mr-6 text-white">
            <img src="/images//Logo.jpg" alt="MTS-LOGO" width="130" height="21" />
          </div>

          <div className="flex flex-wrap items-center">
            <label
              onClick={() => {
                setIsMenuOpen(!isMenuOpen)
              }}
              className="flex items-center px-3 py-2 border rounded cursor-pointer lg:hidden"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <title>Menu</title>
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
              </svg>
            </label>
            <div className="ml-5">
              <img onClick={handleLogout} src="/images/logout.svg" width="20" height="20" />
            </div>
          </div>
          {isMenuOpen ? (
            <div className="flex-grow block w-full lg:flex lg:items-center lg:w-auto" id="mobile-menu">
              <div className="text-sm lg:flex-grow">
                <ul className="my-4">
                  {links.map(({ href, label, Icon, type, imageSrc, imageHoverSrc }, i) => {
                    return (
                      <li
                        onClick={() => {
                          setContextData((prevState) => ({
                            ...prevState,
                            navigationItem: label,
                          }))
                        }}
                        className="inline-block px-2 text-center "
                        key={`navigation-link-${href}-${label}-${i}`}
                      >
                        <Link rel="preload" href={href}>
                          <a href="">
                            <div
                              className={` px-2 py-3 rounded-lg  ${
                                label.toLowerCase() == contextData.navigationItem.toLowerCase() && 'bg-primary-400'
                              } `}
                            >
                              <img
                                className="mx-auto normalSvg"
                                src={
                                  label.toLowerCase() == contextData.navigationItem.toLowerCase()
                                    ? imageHoverSrc
                                    : imageSrc
                                }
                                alt="Clients"
                                width="24"
                                height="24"
                              />
                              <img
                                className="mx-auto hoverSvg"
                                src={imageHoverSrc}
                                alt="Clients"
                                width="24"
                                height="24"
                              />
                              {label}
                            </div>
                          </a>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          ) : null}
        </nav>
      </div>

      <div
        onMouseLeave={() => {
          setDomainToggle(false)
        }}
        className="flex"
      >
        <div className="sticky flex-col justify-between hidden p-4 mt-6 bg-white rounded-lg top-28 sideBar md:flex max-w-custom max-h-custom">
          <ul className="menuScroll">
            {links.map(({ href, label, Icon, type, imageSrc, imageHoverSrc }, i) => {
              return (
                <li
                  onClick={() => {
                    navigateTo(href, isConfirmed, () => {
                      if (label.toLowerCase() == 'domains') {
                        if (contextData.navigationItem.toLowerCase() != 'domains') {
                          setContextData((prevState) => ({
                            ...prevState,
                            search: {
                              ...prevState.search,
                              default: {
                                ...prevState.search.default,
                                clientId: '',
                                url: '',
                                productName: '',
                              },
                            },
                          }))
                          setContextData((prevState) => ({
                            ...prevState,
                            search: {
                              ...prevState.search,
                              reload: prevState.search.reload + 1,
                            },
                          }))
                        }
                      } else {
                        setDomainToggle(false)
                      }
                      if (contextData.navigationItem.toLowerCase() !== label.toLowerCase()) {
                        if (label.toLowerCase() != 'analytics') {
                          setLoading(true)
                        }
                        setLoading(false)
                      }
                      setContextData((prevState) => ({
                        ...prevState,
                        navigationItem: label,
                      }))
                    })
                  }}
                  key={`navigation-link-${href}-${label}-${i}`}
                  className="cursor-pointer"
                >
                  <a
                    onMouseEnter={() => {
                      if (label.toLowerCase() == 'domains') {
                        setDomainToggle(true)
                      }
                    }}
                  >
                    <div
                      className={`text-center border-gray-300 border rounded-lg px-2 py-3 mb-4  menu-icon ${
                        label.toLowerCase() == contextData.navigationItem.toLowerCase() && 'bg-primary-400'
                      } `}
                    >
                      <img
                        className="mx-auto normalSvg"
                        src={label.toLowerCase() == contextData.navigationItem.toLowerCase() ? imageHoverSrc : imageSrc}
                        alt="Clients"
                        width="24"
                        height="24"
                      />
                      <img className="mx-auto hoverSvg" src={imageHoverSrc} alt="Clients" width="24" height="24" />
                      <span className="inline-block mt-1 break-word">{label}</span>
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
          <div className="pt-4">
            <span className="block text-xs">Welcome</span>
            <span className="block pt-1 pb-2 text-lg font-bold leading-5 border-b border-black border-dashed text-heading">
              {user && user?.name}
            </span>
            <span onClick={handleLogout} className="block pt-2 cursor-pointer">
              Logout <img className="inline-block cursor-pointer" src="/images/logout.svg" alt="" />
            </span>
          </div>
        </div>

        {domains?.length > 0 && (
          <div
            className={`bg-white rounded-lg mt-6 border border-gray-300  sticky top-28 sideBar z-20 ${
              !domainToggle && `hidden`
            }`}
          >
            <div className="flex flex-wrap -mx-4 text-left">
              <div className="w-full px-4 rounded-lg sm:w-2/2">
                <div className="w-full px-4 pt-4 rounded-lg">
                  <div className="w-full lg:w-3/3 menuScroll">
                    {domains?.map((item, currentIndex) => (
                      <div key={currentIndex} className="p-1 m-1">
                        <div
                          ref={contextData.search.default.url == item.url ? ref : null}
                          onClick={(event) => {
                            setAccordian(() => {
                              return { [item.url]: !accordian[item.url] }
                            })
                            setTimeout(() => {
                              event.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
                            }, 100)
                          }}
                          className={`flex cursor-pointer ${
                            !accordian[item.url] && `border-dashed pb-2 border-b`
                          } items-center border-black`}
                        >
                          <h3
                            className={`${
                              accordian[item.url] && `text-primary-400 open`
                            } px-2 dproduct-dot dot-primary relative pl-5 break-words w-10/12`}
                          >
                            {item.url}
                          </h3>
                          <div className="flex items-center justify-center w-2/12 ml-2">
                            <img
                              className={`inline-block ${!accordian[item.url] && 'transform rotate-180'}`}
                              src="/images/up-primary-arrow.svg"
                              alt="Status"
                            />
                          </div>
                        </div>
                        <div>
                          {accordian[item.url] && (
                            <div className="flex flex-wrap -mx-4 text-left">
                              <div className="w-full px-4 sm:w-2/2">
                                {item?.products && item?.products?.length > 0 ? (
                                  item?.products?.map((productItem, i) => {
                                    return (
                                      <li
                                        key={`product${i}`}
                                        onClick={async () => {
                                          if (contextData.canOpenProduct) {
                                            handleGotoProduct({ _id: item._id }, productItem._id)
                                          } else {
                                            const confirmed = await isConfirmed(
                                              'your current widget is not saved, are you sure to leave changes ?',
                                            )
                                            if (confirmed) {
                                              handleGotoProduct({ _id: item._id }, productItem._id)
                                            }
                                          }
                                        }}
                                        className={`dot-line p-2 list-none relative pl-6 cursor-pointer ${
                                          contextData.search.default.productName == productItem.name &&
                                          contextData.search.default.url == item.url &&
                                          `active-primary`
                                        }`}
                                      >
                                        <span className="dproduct-dot">{productItem.name}</span>
                                      </li>
                                    )
                                  })
                                ) : (
                                  <li className="relative p-2 pl-6 list-none dot-line">
                                    <span className="dproduct-dot">No products available</span>
                                  </li>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Navigation
