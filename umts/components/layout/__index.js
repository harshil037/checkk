import React, { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { useUser, getApi } from '../../lib/hooks'
import TopMenu from './topmenu'
import Navigation from './navigation'
import ContactsIcon from '@material-ui/icons/Contacts'
import PeopleIcon from '@material-ui/icons/People'
import TimelineIcon from '@material-ui/icons/Timeline'
import AssignmentIcon from '@material-ui/icons/Assignment'
import WebIcon from '@material-ui/icons/Web'
import ExtensionIcon from '@material-ui/icons/Extension'
import { AppContext } from '../../context/appContext'
import { getWidgetImage } from '../../lib/utils'
import NavigationHOC from '../navigationHOC'

const Layout = (props) => {
  const router = useRouter()
  const { children } = props
  const [user, { mutate }] = useUser()
  const [userProducts, setUserProducts] = useState([])
  const [clients, setClients] = useState([])
  const [domains, setDomains] = useState([])
  const [autoOpenDomainList, setAutoOpenDomainList] = useState(true)
  const [contextData, setContextData] = useContext(AppContext)

  const [navigationItems, setNavigationItems] = useState([
    { href: '/admin/domains', label: 'Domains', Icon: AssignmentIcon, type: 'menuItem' },
    { href: '/admin/users', label: 'Users', Icon: PeopleIcon, type: 'menuItem' },
  ])

  const itemIcon = (type) => {
    switch (type) {
      case 'widget':
        return ExtensionIcon
      default:
        return WebIcon
    }
  }

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
    if (user && !user.superadmin) {
      const products =
        domains.length == 1 &&
        domains?.reduce((acc, domain) => {
          const client = clients?.find((c) => c?.domains.includes(domain._id))
          return client && domain.products
            ? [
                ...acc,
                ...domain.products
                  .filter((p) => p.status)
                  .map((p) => {
                    const Icon = itemIcon(p.type)
                    return {
                      href:
                        `/admin/clients/${client.clientNumber}/${domain._id}/${p.name.toLowerCase()}?module=` +
                        p.componentModule,
                      label: p.name,
                      type: 'productItem',
                      imageSrc: getWidgetImage(p.componentModule),
                      imageHoverSrc: getWidgetImage(p.componentModule, true),
                    }
                  }),
              ]
            : acc
        }, [])
      products && setUserProducts(products)
      if (products?.length === 1) {
        setContextData((prevState) => ({
          ...prevState,
          navigationItem: products[0].label,
        }))
        router.push(products[0].href)
      }
    }

    const items = [
      {
        href: '/admin/domains',
        label: 'Domains',
        Icon: AssignmentIcon,
        type: 'menuItem',
        imageSrc: '/images/list.svg',
        imageHoverSrc: '/images/listhover.svg',
      },
    ]
    const superadminItems = user?.superadmin
      ? [
          {
            href: '/admin/users',
            label: 'Users',
            Icon: PeopleIcon,
            type: 'menuItem',
            imageSrc: '/images/users.svg',
            imageHoverSrc: '/images/usershover.svg',
          },
          {
            href: '/admin/clients',
            label: 'Clients',
            Icon: ContactsIcon,
            type: 'menuItem',
            imageSrc: '/images/clients.svg',
            imageHoverSrc: '/images/hoverclients.svg',
          },
          {
            href: '/admin/analytics',
            label: 'Analytics',
            Icon: TimelineIcon,
            type: 'menuItem',
            imageSrc: '/images/analytics.svg',
            imageHoverSrc: '/images/analyticshover.svg',
          },
          // { href: '/admin/settings', label: 'Settings', Icon: SettingsIcon, type: 'menuItem' },
        ]
      : []

    // products && setUserProducts(products)
    setNavigationItems([...items, ...superadminItems])
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
        <div className="main-wrapper m-4 lg:m-8 lg:my-0">
          <TopMenu
            autoOpenDomainList={autoOpenDomainList}
            passedClients={clients}
            passedDomains={domains}
            user={user}
            mutate={mutate}
            links={[]}
          />

          <div className="md:flex justify-between">
            <LeftMenu
              user={user}
              navigationItems={navigationItems}
              mutate={mutate}
              clients={clients}
              domains={domains}
            />
            <div className="layoutContent text-right w-full sm:w-5/6 lg:w-full sm:pl-5 mx-auto">
              <div className="common">
                {children}
                {user && (
                  <div className="footer p-4 my-7 flex justify-end bg-white rounded-lg">
                    <span>©{new Date().getFullYear()} mtsonline Gmbh</span>
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
