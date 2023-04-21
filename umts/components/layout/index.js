import React, { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { useUser, getApi } from '../../lib/hooks'
import TopMenu from './topmenu'
import Navigation from './navigation'
import { AppContext } from '../../context/appContext'
import NavigationHOC from '../navigationHOC'

const Layout = (props) => {
  const router = useRouter()
  const { children } = props
  const [user, { mutate }] = useUser()
  const [userProducts, setUserProducts] = useState([])
  const [clients, setClients] = useState([])
  const [domains, setDomains] = useState([])
  const [autoOpenDomainList, setAutoOpenDomainList] = useState(false)
  const [contextData, setContextData] = useContext(AppContext)

  const [navigationItems, setNavigationItems] = useState([
    { href: '/admin/domains', label: 'Domains', type: 'menuItem' },
    { href: '/admin/users', label: 'Users', type: 'menuItem' },
  ])

  useEffect(async () => {
    await setClientData()
    await setDomainData()
  }, [])

  useEffect(async () => {
    if (contextData.search.clientUpdate != 0) {
      await setClientData()
    }
  }, [contextData.search.clientUpdate])

  useEffect(async () => {
    if (contextData.search.domainUpdate != 0) {
      await setDomainData()
    }
  }, [contextData.search.domainUpdate])

  const setDomainData = async () => {
    const domainRes = await getApi('/api/domains')
    if (domainRes.status === 200) {
      if (domainRes.domains) {
        setDomains(domainRes.domains)
      }
    }
  }

  const setClientData = async () => {
    const clientRes = await getApi('/api/clients')
    if (clientRes.status === 200) {
      if (clientRes.clients) {
        setClients(clientRes.clients)
      }
    }
  }

  useEffect(async () => {
    const body = document.body
    body.style.backgroundColor = '#e5e5e5'
    const abortController = new AbortController()

    const items = user?.superadmin
      ? [
          {
            href: '/admin/domains',
            label: 'Domains',
            type: 'menuItem',
            imageSrc: '/images/list.svg',
            imageHoverSrc: '/images/listhover.svg',
          },
          {
            href: '/admin/users',
            label: 'Users',
            type: 'menuItem',
            imageSrc: '/images/users.svg',
            imageHoverSrc: '/images/usershover.svg',
          },
          {
            href: '/admin/clients',
            label: 'Clients',
            type: 'menuItem',
            imageSrc: '/images/clients.svg',
            imageHoverSrc: '/images/hoverclients.svg',
          },
          {
            href: '/admin/analytics',
            label: 'Analytics',
            type: 'menuItem',
            imageSrc: '/images/analytics.svg',
            imageHoverSrc: '/images/analyticshover.svg',
          },
          {
            href: '/admin/config/global',
            label: 'Config',
            // Icon: TimelineIcon,
            type: 'menuItem',
            imageSrc: '/images/config-teal.svg',
            imageHoverSrc: '/images/config.svg',
          },
          {
            href: '/admin/vouchers',
            label: 'Vouchers',
            // Icon: TimelineIcon,
            type: 'menuItem',
            imageSrc: '/images/vouchers.svg',
            imageHoverSrc: '/images/hovervouchers.svg',
          },
          {
            href: '/admin/events/u0785/concert/tickets',
            label: 'Concert',
            // Icon: TimelineIcon,
            type: 'menuItem',
            imageSrc: '/images/concert-teal.svg',
            imageHoverSrc: '/images/concert-white.svg',
          },
        ]
      : user?.email === 'monika@pragserwildsee.com'
      ? []
      : user?.email === 'info@arianes-guesthouse.com'
      ? []
      : user?.email === 'info@belvedere-hotel.it'
      ? [
          {
            href: '/admin/vouchers',
            label: 'Vouchers',
            // Icon: TimelineIcon,
            type: 'menuItem',
            imageSrc: '/images/vouchers.svg',
            imageHoverSrc: '/images/hovervouchers.svg',
          },
        ]
      : [
          {
            href: '/admin/domains',
            label: 'Domains',
            // Icon: AssignmentIcon,
            type: 'menuItem',
            imageSrc: '/images/list.svg',
            imageHoverSrc: '/images/listhover.svg',
          },
        ]

    const parking =
      user?.email === 'monika@pragserwildsee.com'
        ? [
            {
              href: '/admin/parking',
              label: 'Parking',
              // Icon: TimelineIcon,
              type: 'menuItem',
              imageSrc: '/images/parking.svg',
              imageHoverSrc: '/images/hoverparking.svg',
            },
            {
              href: '/admin/parking/feedback',
              label: 'Feedback',
              // Icon: TimelineIcon,
              type: 'menuItem',
              imageSrc: '/images/parking.svg',
              imageHoverSrc: '/images/hoverparking.svg',
            },
            {
              href: '/admin/vouchers',
              label: 'Vouchers',
              // Icon: TimelineIcon,
              type: 'menuItem',
              imageSrc: '/images/vouchers.svg',
              imageHoverSrc: '/images/hovervouchers.svg',
            },
            {
              href: '/admin/events/u0785/concert/tickets',
              label: 'Concert',
              // Icon: TimelineIcon,
              type: 'menuItem',
              imageSrc: '/images/concert-teal.svg',
              imageHoverSrc: '/images/concert-white.svg',
            },
          ]
        : []
    // products && setUserProducts(products)
    // setNavigationItems([...items, ...superadminItems, ...parking])
    setNavigationItems([...items, ...parking])
    // }

    return () => {
      abortController.abort()
    }
  }, [user, domains, clients])

  useEffect(() => {
    userProducts &&
      setNavigationItems((state) => [
        ...state.filter((s) => !userProducts.find((u) => u.href === s.href)),
        ...userProducts.map(({ href, label, Icon, type, imageSrc, imageHoverSrc }) => ({
          href,
          label,
          Icon,
          type,
          imageSrc,
          imageHoverSrc,
        })),
      ])
  }, [userProducts])

  return (
    <>
      {user && (
        <div className="m-4 main-wrapper lg:m-8 lg:my-0">
          <TopMenu
            autoOpenDomainList={autoOpenDomainList}
            passedClients={clients}
            passedDomains={domains}
            user={user}
            mutate={mutate}
            links={[]}
          />

          <div className="justify-between md:flex">
            <LeftMenu
              user={user}
              navigationItems={navigationItems}
              mutate={mutate}
              clients={clients}
              domains={domains}
            />
            <div className="w-full mx-auto overflow-hidden text-right layoutContent sm:w-5/6 lg:w-full sm:pl-5">
              {/* <div className="common">
                {children}
                {user && (
                  <div className="flex justify-end p-4 bg-white rounded-lg footer my-7">
                    <span>©{new Date().getFullYear()} mtsonline Gmbh</span>
                  </div>
                )}
              </div> */}
              <div className="flex flex-col min-h-full common">
                {children}

                {user && (
                  <div className="flex items-end mt-auto">
                    <div className="flex justify-end w-full p-4 mt-4 bg-white rounded-lg footer">
                      <span>©{new Date().getFullYear()} mtsonline Gmbh</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Layout

const LeftMenu = ({ user, navigationItems, mutate, clients, domains }) => {
  return NavigationHOC(Navigation, {
    user,
    links: navigationItems,
    mutate,
    passedClients: clients,
    passedDomains: domains,
  })
}
