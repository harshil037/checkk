import React, { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { v4 as uuid } from 'uuid'
import Authenticate from '../../../../../../../../lib/authenticate'
import { AppContext } from '../../../../../../../../context/appContext'
import { Input, Select } from '../../../../../../../../components/componentLibrary'
import PopUp from '../../../../../../../../components/dialog/popUp'
import PageTree from '../../../../../../../../components/pageTree'
import Button from '../../../../../../../../components/common/Button'
import useConfirm from '../../../../../../../../components/dialog/useConfirm'
import { deepClone } from '../../../../../../../../lib/object'
import EditPage from '../../../../../../../../components/product/website/editPage'

const Website = () => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const router = useRouter()
  const { domainId, productId, contentId } = router.query
  const [languages, setLanguages] = useState(['en', 'de', 'it'])
  const [defaultLanguage, setDefaultLanguage] = useState('de')
  const [languageToAdd, setLanguageToAdd] = useState('')
  const [openCreatePageModal, setOpenCreatePageModal] = useState(false)
  const [pages, setPages] = useState([])
  const [page, setPage] = useState({
    rootPage: false,
    id: '_new',
    name: '',
    language: '',
    path: '',
    slug: '',
    layout: '',
    refPath: '',
    isChild: false,
    meta: {
      title: '',
      description: '',
    },
    scripts: [],
    hrefLang: {},
    modules: [],
  })
  const [currentPage, setCurrentPage] = useState('')
  const [errors, setErrors] = useState({ name: '', layout: '', slug: '', language: '', scripts: '' })
  const [openLanguageModal, setOpenLanguageModal] = useState(false)
  const { isConfirmed } = useConfirm()

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'domains',
    }))
  }, [])

  // change handler for create page inputs
  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value

    if (name === 'slug') {
      setPage((prev) => ({ ...prev, [name]: value.toLowerCase().trim() }))
    } else if (name === 'title') {
      setPage((prev) => ({ ...prev, meta: { ...prev.meta, title: value } }))
    } else if (name === 'description') {
      setPage((prev) => ({ ...prev, meta: { ...prev.meta, description: value } }))
    } else if (name === 'scripts') {
      setPage((prev) => ({
        ...prev,
        scripts: value.split('\n').map((src) => ({
          src: src.trim(),
        })),
      }))
      if (!errors.scripts && page.scripts[0]?.src.length > 0) {
        setErrors((prev) => ({ ...prev, scripts: 'Press ↵ to add another script source' }))
      }
    } else {
      setPage((prev) => ({ ...prev, [name]: value }))
    }
  }

  const addPage = () => {
    if (!page.name || !page.layout) {
      const error = { name: '', layout: '', slug: '', language: '', scripts: '' }
      if (!page.name) {
        error.name = '* name can not be empty!'
      }
      if (!page.layout) {
        error.layout = '* please select layout!'
      }
      if (!page.rootPage && !page.slug) {
        error.slug = '* slug can not be empty!'
      }
      setErrors(error)
      return null
    }

    const pageData = { ...page }

    // if creating new page
    if (pageData.id === '_new') {
      // if adding nested page
      if (pageData.refPath) {
        if (pageData.isChild) {
          pageData.path = `${pageData.refPath}/${pageData.slug}`
        } else {
          const slug = pageData.refPath.split('/')
          slug.pop()
          slug.push(pageData.slug)
          pageData.path = slug.join('/')
        }
      } else {
        // if adding root page
        pageData.path = `${page.language === defaultLanguage ? '/~' : `/${page.language}`}${
          page.slug && `/${page.slug}`
        }`
      }

      // if added slug already exists at the same level
      if (pages.find((item) => item.path === pageData.path)) {
        setErrors((prev) => ({ ...prev, slug: '* Please provide a unique url slug!' }))
        return null
      }

      // removing unnecessary object fields
      delete pageData.refPath
      delete pageData.isChild
      delete pageData.rootPage

      pageData.id = uuid()

      setPages((prev) => [...prev, pageData])
    } else {
      // for editing existing page
      const newPath = pageData.path.split('/')

      // because path can be only changed for the child pages
      if (!pageData.rootPage) {
        newPath.pop()
        newPath.push(pageData.slug)
        pageData.path = newPath.join('/')

        if (pages.find((item) => item.path === pageData.path)) {
          setErrors((prev) => ({ ...prev, slug: '* Please provide a unique url slug!' }))
          return null
        }
      }

      const newPages = [...pages]
      let oldPath = ''

      // to check if slug changed
      for (let i = 0; i < newPages.length; i++) {
        if (newPages[i].id === pageData.id) {
          if (newPages[i].slug !== pageData.slug) oldPath = newPages[i].path
          newPages[i] = pageData
        }
      }

      // creating new path if slud is changed and also updating children page's path
      if (oldPath) {
        for (let i = 0; i < newPages.length; i++) {
          if (
            newPages[i].path !== pageData.path &&
            (newPages[i].path === oldPath || newPages[i].path.includes(`${oldPath}/`))
          ) {
            newPages[i].path = newPages[i].path.replace(oldPath, pageData.path)
          }
        }
      }

      setPages(newPages)
    }

    setPage({
      rootPage: false,
      id: '_new',
      name: '',
      language: '',
      path: '',
      slug: '',
      layout: '',
      refPath: '',
      isChild: false,
      meta: {
        title: '',
        description: '',
      },
      scripts: [],
      hrefLang: {},
      modules: [],
    })
    setErrors({ name: '', layout: '', slug: '', language: '', scripts: '' })
    setOpenCreatePageModal(false)
  }

  const beautifyPath = (path = '') => {
    if (path === '/~') {
      return '/'
    } else if (path.includes('/~')) {
      return path.replace('/~', '')
    }
    return path
  }

  const handlePageTreeChange = (value) => {
    setPages(value)
  }

  const handleLanguageAdd = () => {
    if (!languageToAdd) {
      setErrors({ name: '', layout: '', slug: '', language: 'langugage can not be empty!', scripts: '' })
      return false
    }
    const language = languageToAdd.toLocaleLowerCase()
    if (languages.includes(language)) {
      setErrors({ name: '', layout: '', slug: '', language: 'language already exists!', scripts: '' })
      return false
    }
    setLanguages((prev) => [...prev, language])
    setErrors({ name: '', layout: '', slug: '', language: '', scripts: '' })
    setLanguageToAdd('')
  }

  const removeLanguage = (language) => async () => {
    if (language === defaultLanguage) {
      await isConfirmed('Can not remove default language!', true)
    } else {
      const confirm = await isConfirmed(
        `Do you want to delete "${language.toUpperCase()}" language? It will also remove all the pages for the "${language.toUpperCase()}" language`,
      )
      if (confirm) {
        setPages((prev) => prev.filter((item) => item.language !== language))
        setLanguages((prev) => prev.filter((item) => item !== language))
      }
    }
  }

  const makeDefaultLanguage = (language) => async () => {
    if (language === defaultLanguage) return false

    const confirm = await isConfirmed(
      `Do you want to make ${language} as a default language? It will also reflect the page tree!`,
    )

    if (confirm) {
      const newPages = deepClone(pages)

      for (let i = 0; i < newPages.length; i++) {
        if (newPages[i].path.includes('/~')) {
          newPages[i].path = newPages[i].path.replace('/~', `/${newPages[i].language}`)
        }
        if (newPages[i].language === language) {
          newPages[i].path = newPages[i].path.replace(`/${newPages[i].language}`, '/~')
        }
      }

      setPages(newPages)
      setDefaultLanguage(language)
    }
  }

  console.log('Pages => ', pages)

  return (
    <div className="text-left mt-4 md:p-4 flex-1">
      <div className="flex gap-8">
        <div className="text-2xl font-bold text-gray-600">Pages</div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8">
          {!!languages.length && (
            <Button
              variant="success"
              onClick={() => {
                setOpenCreatePageModal(true)
                setPage((prev) => ({ ...prev, language: defaultLanguage, rootPage: true }))
              }}
              type="button"
              className="!bg-white"
              title="To add new a root page"
            >
              New Root Page
              <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Pages" />
            </Button>
          )}
          <Button
            variant="success"
            onClick={() => {
              setOpenLanguageModal(true)
            }}
            type="button"
            className="!bg-white"
            title="To add new a language"
          >
            Language
            <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Pages" />
          </Button>
        </div>
      </div>

      {pages.length === 0 && !!languages.length && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Button
            filled={true}
            onClick={() => {
              setOpenCreatePageModal(true)
              setPage((prev) => ({ ...prev, language: defaultLanguage, rootPage: true }))
            }}
            title="Create first root page"
          >
            Create Page
          </Button>
        </div>
      )}

      {pages.length > 0 && (
        <div className={`flex items-start mt-4 ${!!currentPage && 'gap-x-8'}`}>
          <div
            className={`${
              !!currentPage ? 'w-1/2 scale-x-100' : 'w-0 scale-x-0 invisible'
            } transform origin-left transition-all ease-in-out duration-300`}
          >
            {!!currentPage && (
              <EditPage
                pages={pages}
                setPages={setPages}
                languages={languages}
                defaultLanguage={defaultLanguage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )}
          </div>

          <div
            className={`bg-white p-4 rounded-lg shadow-md transition-all ease-in-out duration-300 ${
              currentPage ? 'w-1/2' : 'w-full'
            }`}
          >
            <p className="border-b pb-4 pt-2 text-lg border-b-gray-400">Page Tree</p>
            <PageTree value={pages} onChange={handlePageTreeChange}>
              {({ data, deleteNode, hasChild, toggleFn, expand, copyNode, cancleCopy, pasteNode }) => {
                return (
                  <div className="py-2 px-4 items-center border border-gray-400 my-2 rounded-lg flex">
                    {hasChild && (
                      <button type="button" className="absolute -left-1 bg-white" onClick={toggleFn}>
                        {expand ? <img src="/images/minus.svg" /> : <img src="/images/plus.svg" />}
                      </button>
                    )}
                    <div>
                      {data.name} - {beautifyPath(data.path)}
                    </div>
                    <div className="ml-auto items-center flex">
                      <Button
                        onClick={() => {
                          setOpenCreatePageModal(true)
                          const isRoot = data.path.split('/').length === 2
                          setPage((prev) => ({ ...prev, language: data.language, refPath: data.path, isChild: isRoot }))
                        }}
                        className="text-sm !px-2 !py-[2px]"
                        title="Add page to this level"
                      >
                        Page <img className="inline-block" src="/images/plus-bar.svg" alt="Pages" />
                      </Button>
                      <button
                        className="mx-2"
                        onClick={() => {
                          setCurrentPage(data.id)
                          // setPage({
                          //   ...data,
                          //   refPath: '',
                          //   rootPage: data.path.split('/').length === 2,
                          //   isChild: false,
                          // })
                          // setOpenCreatePageModal(true)
                        }}
                        type="button"
                        title="Edit page"
                      >
                        <img src="/images/Edit.svg" />
                      </button>

                      <button onClick={deleteNode} type="button" title="Delete page">
                        <img src="/images/trash.svg" />
                      </button>

                      {copyNode && (
                        <button className="ml-2" onClick={copyNode} type="button" title="Copy page">
                          <img src="/images/copy.svg" />
                        </button>
                      )}

                      {cancleCopy && (
                        <button className="ml-2" onClick={cancleCopy} type="button" title="Cancle copy">
                          <img src="/images/cancel.svg" />
                        </button>
                      )}

                      {pasteNode && (
                        <button className="ml-2" onClick={pasteNode} type="button" title="Paste here">
                          <img src="/images/paste.svg" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              }}
            </PageTree>
          </div>
        </div>
      )}

      <PopUp openModal={openCreatePageModal}>
        <div className="bg-white md:w-4/5 2xl:w-3/5 mx-auto mt-24 p-6 rounded-lg">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Add Page</h1>
            <svg
              onClick={() => {
                setPage({
                  rootPage: false,
                  id: '_new',
                  name: '',
                  language: '',
                  path: '',
                  slug: '',
                  layout: '',
                  refPath: '',
                  isChild: false,
                  meta: {
                    title: '',
                    description: '',
                  },
                  scripts: [],
                  hrefLang: {},
                  modules: [],
                })
                setErrors({ name: '', layout: '', slug: '', language: '', scripts: '' })
                setOpenCreatePageModal(false)
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
          <div>
            <div className="my-4">
              <label className="block mb-2">Page Name</label>
              <Input variant="primary" placeholder="Home Page" value={page.name} name="name" onChange={handleChange} />
              {errors.name && <p className="text-red-500">{errors.name}</p>}
            </div>
            {/* only for none root pages */}
            <div className="flex flex-col sm:flex-row sm:gap-6">
              {!page.rootPage && (
                <div className="my-3 md:w-1/2">
                  <label className="block mb-2">URL Slug</label>
                  <Input
                    variant="primary"
                    placeholder="Home Page"
                    value={page.slug}
                    name="slug"
                    onChange={handleChange}
                    className="py-2"
                  />
                  {errors.slug ? <p className="text-red-500">{errors.slug}</p> : ''}
                </div>
              )}
              <div className={`my-3 ${!page.rootPage ? 'md:w-1/2' : 'md:w-full'}`}>
                <label className="block mb-2">Language</label>
                <Select
                  variant="primary"
                  disabled={page.id !== '_new' || page.refPath}
                  value={page.language}
                  name="language"
                  onChange={handleChange}
                  className="py-2"
                >
                  <>
                    {languages.map((lang) => (
                      <option value={lang} key={lang}>
                        {lang}
                      </option>
                    ))}
                  </>
                </Select>
              </div>
            </div>

            <div className="my-3">
              <label className="block mb-2">Meta Title</label>
              <Input variant="primary" value={page.meta.title} onChange={handleChange} name="title" className="py-2" />
            </div>

            <div className="flex flex-col sm:flex-row sm:gap-6">
              <div className="my-3 md:w-1/2">
                <label className="block mb-2">Meta Description</label>
                <textarea
                  value={page.meta.description}
                  className="border border-gray-400 rounded-lg w-full outline-none p-1 text-sm"
                  onChange={handleChange}
                  name="description"
                  rows={3}
                />
              </div>

              <div className="my-3 md:w-1/2">
                <label className="block mb-2">Scripts</label>
                {errors.scripts ? <p className="-mt-2 mb-1">* {errors.scripts}</p> : null}
                <textarea
                  value={page.scripts.map((item) => item.src).join('\n')}
                  className="border border-gray-400 rounded-lg w-full outline-none p-1 text-sm"
                  onChange={handleChange}
                  name="scripts"
                  rows={3}
                  onBlur={() => {
                    setPage((prev) => ({
                      ...prev,
                      scripts: prev.scripts.filter(({ src }) => src !== ''),
                    }))
                    setErrors((prev) => ({ ...prev, scripts: '' }))
                  }}
                />
              </div>
            </div>

            <div className="my-3">
              <label className="block mb-2">Select Layout</label>
              <div className="flex flex-wrap md:gap-10 lg:gap-16">
                <Input
                  type="radio"
                  onChange={handleChange}
                  variant="success"
                  title="Layout 1"
                  id="crt-lauout1"
                  name="layout"
                  value="layout1"
                  checked={page.layout === 'layout1'}
                />
                <Input
                  type="radio"
                  onChange={handleChange}
                  variant="success"
                  title="Layout 2"
                  id="crt-lauout2"
                  name="layout"
                  value="layout2"
                  checked={page.layout === 'layout2'}
                />
                <Input
                  type="radio"
                  onChange={handleChange}
                  variant="success"
                  title="Layout 3"
                  id="crt-lauout3"
                  name="layout"
                  value="layout3"
                  checked={page.layout === 'layout3'}
                />
              </div>
              {errors.layout && <p className="text-red-500">{errors.layout}</p>}
            </div>

            {page.refPath ? (
              <div className="my-6 flex items-center">
                <label htmlFor="childPage">Child Page : </label>
                <Input
                  type="toggle"
                  variant="primary"
                  id="childPage"
                  checked={page.isChild}
                  onChange={(e) => {
                    if (page.refPath.split('/').length === 2) return false
                    setPage((prev) => ({ ...prev, isChild: e.target.checked }))
                  }}
                />
              </div>
            ) : (
              ''
            )}
          </div>
          <div className="text-center mb-6">
            <button
              className="bg-primary-400 text-white px-4 py-2 font-bold rounded-lg"
              type="button"
              onClick={addPage}
            >
              {page.id === '_new' ? 'Create Page' : 'Save Changes'}
            </button>
          </div>
        </div>
      </PopUp>

      <PopUp openModal={openLanguageModal}>
        <div className="bg-white md:w-3/4 xl:w-2/4 mx-auto mt-72 p-6 rounded-lg">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl text-heading font-bold w-10/12 text-left">Languages</h1>
            <svg
              onClick={() => {
                setOpenLanguageModal(false)
                setLanguageToAdd('')
                setErrors({ name: '', layout: '', slug: '', language: '', scripts: '' })
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
          <div className="py-4">
            <div className="my-4">
              <label className="block mb-2">Language</label>
              <div className="flex items-center">
                <Input
                  variant="primary"
                  className="!w-full py-2"
                  value={languageToAdd}
                  onChange={(e) => setLanguageToAdd(e.target.value.trim())}
                  placeholder="DE"
                  name="language"
                />
              </div>
              {errors.language && <p className="text-red-500 pl-2 -mb-2">{errors.language}</p>}
            </div>
            <div className="flex flex-wrap mb-4">
              {languages.map((language) => (
                <div key={language} className="flex items-center mr-8 my-1">
                  <div
                    className={`flex items-stretch border ${
                      defaultLanguage === language ? 'border-primary-400 bg-primary-400 text-white' : 'border-gray-400'
                    } rounded-lg overflow-hidden`}
                  >
                    <p
                      className="pl-4 py-2 pr-12 cursor-pointer"
                      onClick={makeDefaultLanguage(language)}
                      title={`Click to make "${language.toUpperCase()}" a default language`}
                    >
                      {language.toLocaleUpperCase()}
                    </p>
                    <button type="button" className="bg-white px-2" onClick={removeLanguage(language)}>
                      <img src="/images/trash.svg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center md:mt-10 lg:mt-14">
              <Button filled={true} className="ml-2" onClick={handleLanguageAdd}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </PopUp>
    </div>
  )
}

export default Website

export async function getServerSideProps(context) {
  return Authenticate(context)
}
