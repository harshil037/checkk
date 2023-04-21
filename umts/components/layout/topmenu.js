import Link from 'next/link'
import { useContext } from 'react'
import SearchBar from '../SearchBar'
import { AppContext } from '../../context/appContext'
import NavigationHOC from '../navigationHOC'

const TopMenu = ({ links, user, passedClients, passedDomains, autoOpenDomainList }) => {
  const [, setContextData] = useContext(AppContext)

  if (user)
    return (
      <div className="bg-[#e5e5e5] pt-8  top-0  z-20 sticky md:block hidden">
        <div className="justify-between p-4 bg-white rounded-lg header md:flex">
          <div
            onClick={() => {
              setContextData((prevState) => ({
                ...prevState,
                search: {
                  ...prevState.search,
                  reload: prevState.search.reload + 1,
                },
              }))
            }}
            className="pl-5 cursor-pointer"
          >
            <img src="/images/Logo.jpg" alt="MTS-LOGO" width="130" height="21" />
          </div>
          {NavigationHOC(SearchBar, { passedClients, passedDomains, autoOpenDomainList })}
        </div>
      </div>
    )
  else if (links)
    return (
      <>
        <ul>
          {links.map(({ href, label }, i) => (
            <li key={`topMenu-link-${href}-${label}`}>
              <Link href={href}>
                <a className="uppercase transition-colors duration-200 ease-in-out text-primary-dark hover:text-secondary-dark">
                  {label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </>
    )
  else return null
}

export default TopMenu
