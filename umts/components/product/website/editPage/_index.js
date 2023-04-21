import React, { useEffect, useState } from 'react'
import { deepClone } from '../../../../lib/object'
import { isEqual } from '../../../../lib/utils'
import Button from '../../../common/Button'
import { Input, Select } from '../../../componentLibrary'

const EditPage = ({ pages, setPages, languages, defaultLanguage, currentPage, setCurrentPage }) => {
  const [page, setPage] = useState({
    id: '_new',
    name: '',
    language: '',
    path: '',
    slug: '',
    layout: '',
    meta: {
      title: '',
      description: '',
    },
    scripts: [],
    hrefLang: {},
    modules: [],
  })
  const [oldPageData, setOldPageData] = useState(pages.find((page) => page.id === currentPage))
  const [openedSection, setOpenedSection] = useState('')
  const [isDataUpdated, setIsDataUpdated] = useState(false)
  const [errors, setErrors] = useState({ name: '', slug: '', layout: '' })

  useEffect(() => {
    const pageData = pages.find((page) => page.id === currentPage)
    if (pageData) {
      setPage(pageData)
      setOldPageData(pageData)
    }
  }, [currentPage])

  useEffect(() => {
    setIsDataUpdated(!isEqual(oldPageData, page))
  }, [page])

  const handleAccordian = (section) => () => {
    if (section === openedSection) {
      setOpenedSection('')
    } else {
      setOpenedSection(section)
    }
  }

  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value

    if (name === 'metaTitle') {
      setPage((prev) => ({ ...prev, meta: { ...prev.meta, title: value } }))
    } else if (name === 'metaDescription') {
      setPage((prev) => ({ ...prev, meta: { ...prev.meta, description: value } }))
    } else if (name === 'scripts') {
      setPage((prev) => ({
        ...prev,
        scripts: value.split('\n').map((src) => ({
          src: src.trim(),
        })),
      }))
    } else if (name === 'pageLayout') {
      setPage((prev) => ({ ...prev, layout: value }))
    } else {
      setPage((prev) => ({ ...prev, [name]: value }))
    }
  }

  const beautifyPath = (path = '') => {
    if (path === '/~') {
      return '/'
    } else if (path.includes('/~')) {
      return path.replace('/~', '')
    }
    return path
  }

  const handleClose = () => {
    setCurrentPage('')
  }

  const handleSave = () => {
    const newPages = deepClone(pages)
    if (oldPageData.slug !== page.slug) {
      const pageIndex = newPages.findIndex((item) => item.id === page.id)
      const newPath = newPages[pageIndex].path.split('/')
      const oldPath = newPages[pageIndex].path

      newPages[pageIndex] = page
      // path can be only changed for the child pages

      newPath.pop()
      newPath.push(page.slug)

      newPages[pageIndex].path = newPath.join('/')

      if (newPages.find((item) => item.path === newPages[pageIndex].path && item.id !== newPages[pageIndex].id)) {
        setErrors((prev) => ({ ...prev, slug: 'Please provide a unique url slug!' }))
        return null
      }

      for (let i = 0; i < newPages.length; i++) {
        if (
          newPages[i].path !== newPages[pageIndex].path &&
          (newPages[i].path === oldPath || newPages[i].path.includes(`${oldPath}/`))
        ) {
          newPages[i].path = newPages[i].path.replace(oldPath, newPages[pageIndex].path)
        }
      }
      console.log({ newPages, pageIndex })
    } else {
      for (let i = 0; i < newPages.length; i < i++) {
        if (newPages[i].id === page.id) {
          newPages[i] = page
        }
      }
    }
    setPages(newPages)
    setCurrentPage('')
  }

  console.log({ oldPageData, page })

  return (
    <div>
      <div className="bg-white flex items-center justify-between rounded-lg shadow-md p-4">
        <p className="text-lg font-bold">
          {page.name} <span className="text-gray-500">( {beautifyPath(page.path)} )</span>
        </p>

        <div>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>

          {isDataUpdated && (
            <Button className="ml-2" onClick={handleSave}>
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mt-2">
        <div
          className={`flex justify-between ${openedSection === 'pageTitle' ? 'border-b border-b-gray-400 pb-1' : ''}`}
        >
          <p className="text-lg">Page Title</p>
          <img
            src="/images/select-list.svg"
            className={`w-6 ${openedSection === 'pageTitle' ? 'rotate-180' : ''}`}
            onClick={handleAccordian('pageTitle')}
          />
        </div>
        {!!(openedSection === 'pageTitle') && (
          <div className="flex gap-x-4 mt-2">
            <div className="w-2/4">
              <label>Page Name</label>
              <Input type="text" variant="primary" name="name" value={page.name} onChange={handleChange} />
            </div>
            <div className="w-2/5">
              <label>URL Slug</label>
              <Input
                type="text"
                disabled={!page.slug}
                variant="primary"
                name="slug"
                value={page.slug}
                onChange={handleChange}
              />
              {errors.slug && <p className="text-red-500 -mb-2">{errors.slug}</p>}
            </div>
            <div className="w-1/5">
              <label>Language</label>
              <Select variant="primary" disabled={true} name="language" value={page.language} onChange={handleChange}>
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mt-2">
        <div
          className={`flex justify-between ${openedSection === 'metaTags' ? 'border-b border-b-gray-400 pb-1' : ''}`}
        >
          <p className="text-lg">Meta Informationen</p>
          <img
            src="/images/select-list.svg"
            className={`w-6 ${openedSection === 'metaTags' ? 'rotate-180' : ''}`}
            onClick={handleAccordian('metaTags')}
          />
        </div>
        {!!(openedSection === 'metaTags') && (
          <div className="mt-2">
            <div>
              <label>Meta Title</label>
              <Input type="text" variant="primary" name="metaTitle" value={page.meta.title} onChange={handleChange} />
            </div>
            <div className="flex gap-x-4">
              <div className="w-1/2">
                <label className="block">Meta Description</label>
                <textarea
                  value={page.meta.description}
                  className="border border-gray-400 rounded-lg w-full outline-none p-1"
                  name="metaDescription"
                  rows={3}
                  onChange={handleChange}
                />
              </div>
              <div className="w-1/2">
                <label className="block">Scripts</label>
                <textarea
                  value={page.scripts.map((item) => item.src).join('\n')}
                  className="border border-gray-400 rounded-lg w-full outline-none p-1"
                  name="scripts"
                  rows={3}
                  onChange={handleChange}
                  onBlur={() => {
                    setPage((prev) => ({
                      ...prev,
                      scripts: prev.scripts.filter(({ src }) => src !== ''),
                    }))
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mt-2">
        <div className={`flex justify-between ${openedSection === 'layout' ? 'border-b border-b-gray-400 pb-1' : ''}`}>
          <p className="text-lg">Layout</p>
          <img
            src="/images/select-list.svg"
            className={`w-6 ${openedSection === 'layout' ? 'rotate-180' : ''}`}
            onClick={handleAccordian('layout')}
          />
        </div>
        {!!(openedSection === 'layout') && (
          <div className="mt-2">
            <label className="block mb-2">Select Layout :</label>
            <div className="flex flex-wrap md:gap-10 lg:gap-16">
              <Input
                type="radio"
                onChange={handleChange}
                variant="success"
                title="Layout 1"
                id="lauout1"
                name="pageLayout"
                value="layout1"
                checked={page.layout === 'layout1'}
              />
              <Input
                type="radio"
                onChange={handleChange}
                variant="success"
                title="Layout 2"
                id="lauout2"
                name="pageLayout"
                value="layout2"
                checked={page.layout === 'layout2'}
              />
              <Input
                type="radio"
                onChange={handleChange}
                variant="success"
                title="Layout 3"
                id="lauout3"
                name="pageLayout"
                value="layout3"
                checked={page.layout === 'layout3'}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mt-2">
        <div
          className={`flex justify-between ${
            openedSection === 'languagePages' ? 'border-b border-b-gray-400 pb-1' : ''
          }`}
        >
          <p className="text-lg">Language Pages</p>
          <img
            src="/images/select-list.svg"
            className={`w-6 ${openedSection === 'languagePages' ? 'rotate-180' : ''}`}
            onClick={handleAccordian('languagePages')}
          />
        </div>
        {!!(openedSection === 'languagePages') && (
          <div className="mt-2 flex flex-wrap -mx-2">
            {languages.map((language) => {
              if (language !== page.language) {
                const languagePages = pages.filter((item) => item.language === language)
                if (languagePages.length) {
                  return (
                    <div className="w-1/2 px-2" key={language}>
                      <label>{language}</label>
                      <Select
                        variant="primary"
                        value={page.hrefLang[language] || ''}
                        onChange={(e) =>
                          setPage((prev) => ({
                            ...prev,
                            hrefLang: { ...prev.hrefLang, [language]: e.target.value },
                          }))
                        }
                      >
                        <option value="">Select Page</option>
                        {languagePages.map((item) => (
                          <option key={item.id} value={item.path}>
                            {item.name} - {beautifyPath(item.path)}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )
                }
              }
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EditPage
