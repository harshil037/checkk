import React from 'react'
import { useAutoFocus } from '../../../lib/hooks'
import { Button } from '../../componentLibrary'
const ShowDomainList = ({
  domains,
  domainsList,
  searchObject,
  handleRenderList,
  handleSaveValue,
  clients,
  setOpenModal,
}) => {
  const focused = useAutoFocus()
  return (
    <div
      style={{
        display: searchObject.showDomainList ? 'block' : 'none',
      }}
      className="absolute z-10 w-64 mt-5 bg-white rounded-lg header-popup top-100 right-4"
    >
      <ul className="h-auto mx-4 my-2 max-h-48">
        {domainsList
          ?.filter(
            (p) =>
              (searchObject.searchDomain == null && 1 == 1) ||
              p.url.toLowerCase().toString().includes(searchObject.searchDomain?.toLowerCase()),
          )
          ?.map((l, i) => (
            <li key={i} className="flex justify-between py-2 cursor-pointer">
              <span
                onClick={() => {
                  handleRenderList('domains', l._id)
                  handleSaveValue('url', l.url)
                  handleSaveValue('searchDomain', l.url)
                  const findClient =
                    clients &&
                    clients.find((c) => {
                      return c?.domains?.includes(l._id)
                    })
                  if (findClient) {
                    handleSaveValue('clientId', findClient.name)
                  }
                  handleSaveValue('showProducts', true)
                  handleSaveValue('showDomainList', false)
                }}
                value={l._id}
              >
                {l.url}
              </span>
              <img
                onClick={() => {
                  const d = domains.find((x) => x._id == l._id)
                  handleSaveValue('editDomain', d)
                  setOpenModal(true)
                }}
                className="inline-block"
                src="/images/editheader.svg"
                alt="edit"
              />
            </li>
          ))}

        <>
          {domains &&
            domains
              .filter(
                (p) =>
                  searchObject.searchDomain != '' &&
                  domainsList?.find((t) => t._id == p._id) == null &&
                  p.url.toLowerCase().toString().includes(searchObject.searchDomain?.toLowerCase()),
              )
              .map((l, i) => {
                return (
                  <li className="flex justify-between py-2 cursor-pointer" key={`c${l.name}-${i}`}>
                    <span
                      onClick={() => {
                        handleRenderList('domains', l._id)
                        handleSaveValue('url', l.url)
                        handleSaveValue('searchDomain', l.url)
                        const findClient =
                          clients &&
                          clients.find((c) => {
                            return c?.domains?.includes(l._id)
                          })
                        if (findClient) {
                          handleSaveValue('clientId', findClient.name)
                        }
                        handleSaveValue('showProducts', true)
                        handleSaveValue('showDomainList', false)
                      }}
                      value={l._id}
                    >
                      {l.url}
                    </span>

                    <img
                      onClick={() => {
                        const d = domains.find((x) => x._id == l._id)
                        handleSaveValue('editDomain', d)
                        setOpenModal(true)
                      }}
                      className="inline-block"
                      src="/images/editheader.svg"
                      alt="edit"
                    />
                  </li>
                )
              })}
        </>
        <>
          {domainsList?.filter(
            (p) =>
              ((searchObject.searchDomain == '' || searchObject.searchDomain == null) && 1 == 1) ||
              p.url.toLowerCase().toString().includes(searchObject.searchDomain?.toLowerCase()),
          ).length == 0 &&
            domains &&
            domains.filter(
              (p) =>
                searchObject.searchDomain != '' &&
                searchObject.searchDomain != null &&
                domainsList?.find((t) => t._id == p._id) == null &&
                p.url.toLowerCase().toString().includes(searchObject.searchDomain?.toLowerCase()),
            ).length == 0 && <li className="flex justify-between py-2 before:hidden">No domain available</li>}
        </>
      </ul>
      <div className="flex m-4 rounded-lg bg-primary-400">
        <input
          id="searchDomain"
          className="w-full p-3 text-sm border border-gray-400 rounded-lg outline-none"
          value={searchObject.searchDomain || ''}
          onChange={(e) => {
            handleSaveValue('searchDomain', e.target.value)
          }}
          type="text"
          placeholder="Search Domain"
          ref={focused}
        />
        <Button className="flex items-center justify-center px-4">
          <svg className="w-4 h-4 text-grey-dark" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

export default ShowDomainList
