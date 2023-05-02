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
import EditPagetreeStyles from '../../../../../../../../components/product/website/editPageTreeStyles'
import { isEqual } from '../../../../../../../../lib/utils'
import { buildDataObj } from '../../../../../../../../components/EditComponent/utils'

const Website = () => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const router = useRouter()
  const { clientId, domainId, productId, pageTreeId } = router.query
  const [domain, setDomain] = useState(null)
  const [languageToAdd, setLanguageToAdd] = useState('')
  const [languageCodeToAdd, setLanguageCodeToAdd] = useState('')
  const [openCreatePageModal, setOpenCreatePageModal] = useState(false)
  const [openStylesModal, setOpenStylesModal] = useState(false)
  const [isEdited, setIsEdited] = useState(false)
  const [isEditPage, setIsEditPage] = useState(false)
  const [openEditPanel, setOpenEditPanel] = useState(false)
  const [page, setPage] = useState({
    rootPage: false,
    name: '',
    language: '',
    path: '',
    slug: '',
    layout: { module: '', library: '', blockProps: {} },
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
  const [draft, setDraft] = useState({
    languages: [
      {
        code: 'de',
        title: 'german',
      },
      {
        code: 'en',
        title: 'english',
      },
      {
        code: 'it',
        title: 'italian',
      },
    ],
    defaultLanguage: 'de',
    gtmParams: { id: '' },
    pages: [],
    styles: {},
    themes: [],
  })
  const [prevDraft, setPrevDraft] = useState({
    languages: [
      {
        code: 'de',
        title: 'de',
      },
      {
        code: 'en',
        title: 'en',
      },
      {
        code: 'it',
        title: 'it',
      },
    ],
    defaultLanguage: 'de',
    gtmParams: { id: '' },
    pages: [],
    styles: {},
    themes: [],
  })
  const [updatePageTree, setUpdatePageTree] = useState(false)
  const [publishPageTree, setPublishPageTree] = useState(false)
  const [published, setPublished] = useState({})
  const [currentPage, setCurrentPage] = useState('')
  const [errors, setErrors] = useState({
    name: '',
    layout: '',
    slug: '',
    language: '',
    scripts: '',
  })
  const [openLanguageModal, setOpenLanguageModal] = useState(false)
  const [settingsModal, setSettingsModal] = useState(false)
  const { isConfirmed } = useConfirm()
  const [layouts, setLayouts] = useState([])
  const [modulesList, setModulesList] = useState([])
  const [globalStylesProps, setGlobalStylesProps] = useState({})

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'domains',
    }))

    getData()
  }, [])

  useEffect(() => {
    setUpdatePageTree(!isEqual(prevDraft, draft))
    setIsEdited(!isEqual(prevDraft, draft))

    setContextData((prevState) => ({
      ...prevState,
      saveDirty: isEqual(prevDraft, draft),
    }))

    if (!isEqual(prevDraft, draft)) {
      setOpenEditPanel(true)
    } else {
      setOpenEditPanel(false)
    }
  }, [draft, prevDraft])

  useEffect(() => {
    setPublishPageTree(!isEqual(published, draft))
  }, [draft, published])

  const getData = async () => {
    try {
      setLoading(true)
      if (pageTreeId !== '_new') {
        const [domainData, layoutData, pageTreeData, modules] = await Promise.all([
          fetch(`/api/domains/${domainId}`).then((response) => response.json()),
          fetch(`/api/products/website/pages/layouts/${clientId}`).then((response) => response.json()),
          fetch(`/api/products/website/pagetree/${pageTreeId}`).then((response) => response.json()),
          fetch('/api/products/availableComponents').then((response) => response.json()),
        ])

        // setLoading(false)
        if (domainData.error) {
          console.log('Error while fetching domain => ', domainData.error)
          await isConfirmed('Opps something went wrong!', true)
          router.replace('/admin/domains')
        }
        if (layoutData.error) {
          console.log('Error while fetching layouts => ', layoutData.error)
          await isConfirmed('Opps something went wrong!', true)
          router.replace('/admin/domains')
        }
        if (pageTreeData.error) {
          console.log('Error while getting page tree => ', pageTreeData.error)
          await isConfirmed('Opps something went wrong!', true)
          router.replace('/admin/domains')
        }
        if (modules.error) {
          console.log('Error while getting modules list => ', modules.error)
          await isConfirmed('Opps something went wrong!', true)
          router.replace('/admin/domains')
        }
        const clientData = await fetch(`/api/clients?id=${clientId}`).then((res) => res.json())
        const productData = domainData.data && domainData.data.products.find((p) => p._id === productId)

        setContextData((prevState) => ({
          ...prevState,
          search: {
            ...prevState.search,
            default: { clientId: clientData.data.name, url: domainData.data.url, productName: productData?.name },
          },
        }))

        setDomain(domainData.data)
        setLayouts(layoutData.data)
        setModulesList([...modules.component, ...modules.widget])
        setGlobalStylesProps(modules.styles[0])
        setDraft(pageTreeData.data.draft)
        setPrevDraft(deepClone(pageTreeData.data.draft))
        setPublished(pageTreeData.data.published)
        setLoading(false)
      } else {
        const [domainData, layoutData, modules] = await Promise.all([
          fetch(`/api/domains/${domainId}`).then((response) => response.json()),
          fetch(`/api/products/website/pages/layouts/${clientId}`).then((response) => response.json()),
          fetch('/api/products/availableComponents').then((response) => response.json()),
        ])
        // setLoading(false)
        if (domainData.error) {
          console.log('Error while fetching domain => ', domainData.error)
          await isConfirmed('Opps something went wrong!', true)
          router.replace('/admin/domains')
        }
        if (layoutData.error) {
          console.log('Error while fetching layouts => ', layoutData.error)
          await isConfirmed('Opps something went wrong!', true)
          router.replace('/admin/domains')
        }
        if (modules.error) {
          console.log('Error while getting modules list => ', modules.error)
          await isConfirmed('Opps something went wrong!', true)
          router.replace('/admin/domains')
        }

        const clientData = await fetch(`/api/clients?id=${clientId}`).then((res) => res.json())
        const productData = domainData.data && domainData.data.products.find((p) => p._id === productId)

        setContextData((prevState) => ({
          ...prevState,
          search: {
            ...prevState.search,
            default: { clientId: clientData.data.name, url: domainData.data.url, productName: productData?.name },
          },
        }))

        setDomain(domainData.data)
        setLayouts(layoutData.data)
        setModulesList([...modules.component, ...modules.widget])
        setGlobalStylesProps(modules.styles[0])
        setLoading(false)
      }
    } catch (e) {
      setLoading(false)
      console.log('Error while fetching data => ', e.message)
      await isConfirmed('Opps something went wrong!', true)
      router.replace('/admin/domains')
    }
  }

  // change handler for create page inputs
  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value

    if (name === 'slug') {
      setPage((prev) => ({ ...prev, [name]: value.toLowerCase().trim() }))
    } else if (name === 'title') {
      setPage((prev) => ({ ...prev, meta: { ...prev.meta, title: value } }))
    } else if (name === 'description') {
      setPage((prev) => ({
        ...prev,
        meta: { ...prev.meta, description: value },
      }))
    } else if (name === 'scripts') {
      setPage((prev) => ({
        ...prev,
        scripts: value.split('\n').map((src) => ({
          src: src.trim(),
        })),
      }))
      if (!errors.scripts && page.scripts[0]?.src.length > 0) {
        setErrors((prev) => ({
          ...prev,
          scripts: 'Press ↵ to add another script source',
        }))
      }
    } else if (name === 'layout') {
      const layout = layouts.find((item) => item.module === value)

      setPage((prev) => ({
        ...prev,
        layout: {
          ...prev.layout,
          module: layout.module,
          library: layout.library,
        },
      }))
    } else {
      setPage((prev) => ({ ...prev, [name]: value }))
    }
    setErrors({ language: '' })
  }

  const addPage = () => {
    if (!page.name || !page.layout.module) {
      const error = {
        name: '',
        layout: '',
        slug: '',
        language: '',
        scripts: '',
      }
      if (!page.name) {
        error.name = '* name can not be empty!'
      }
      if (!page.layout.module) {
        error.layout = '* please select layout!'
      }
      if (!page.rootPage && !page.slug) {
        error.slug = '* slug can not be empty!'
      }
      setErrors(error)
      return null
    }

    const pageData = { ...page }

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
      draft.pages.filter((page) => {
        if (page.path === '/~') {
          setErrors({ language: 'language already exists!' })
        }
      })
      pageData.path = `${page.language === draft.defaultLanguage ? '/~' : `/${page.language}`}${
        page.slug && `/${page.slug}`
      }`
    }

    // if added slug already exists at the same level
    if (draft.pages.find((item) => item.path === pageData.path)) {
      setErrors((prev) => ({
        ...prev,
        slug: '* Please provide a unique url slug!',
      }))
      return null
    }

    // removing unnecessary object fields
    delete pageData.refPath
    delete pageData.isChild
    delete pageData.rootPage

    pageData.id = uuid()

    const layout = layouts.find((item) => item.module === pageData.layout.module)

    if (layout) {
      pageData.layout.blockProps = buildDataObj(layout.props, draft.languages)
      pageData.layout.blockProps.slots = {}
      for (let i = 0; i < layout.slots.length; i++) {
        const slot = layout.slots[i].key
        pageData.layout.blockProps.slots[slot] = { active: true }
      }
    }

    setDraft((prev) => ({ ...prev, pages: [...prev.pages, pageData] }))

    setPage({
      rootPage: false,
      name: '',
      language: '',
      path: '',
      slug: '',
      layout: { module: '', library: '', blockProps: {} },
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
    setOpenEditPanel(false)
  }

  // side effects of isEdited
  useEffect(() => {
    setOpenEditPanel(isEdited)
  }, [isEdited])

  const beautifyPath = (path = '') => {
    if (path === '/~') {
      return '/'
    } else if (path.includes('/~')) {
      return path.replace('/~', '')
    }
    return path
  }

  const handlePageTreeChange = (value) => {
    setDraft((prev) => ({ ...prev, pages: value }))
  }

  const handleLanguageAdd = () => {
    if (!languageCodeToAdd) {
      setErrors({
        name: '',
        layout: '',
        slug: '',
        language: 'langugage can not be empty!',
        scripts: '',
      })
      return false
    }
    const language = languageCodeToAdd?.toLocaleLowerCase()
    const languageTitle = languageToAdd?.toLocaleLowerCase()
    if ((draft?.languages?.filter((item) => item.code === language)).length) {
      setErrors({
        name: '',
        layout: '',
        slug: '',
        language: 'language already exists!',
        scripts: '',
      })
      return false
    }
    setDraft((prev) => ({
      ...prev,
      languages: [...prev.languages, { code: `${language}`, title: `${languageTitle}` }],
    }))
    setErrors({ name: '', layout: '', slug: '', language: '', scripts: '' })
    setLanguageToAdd('')
    setLanguageCodeToAdd('')
  }

  const removeLanguage = (language) => async () => {
    if (language === draft.defaultLanguage) {
      await isConfirmed('Can not remove default language!', true)
    } else {
      const confirm = await isConfirmed(
        `Do you want to delete "${language.toUpperCase()}" language? It will also remove all the pages for the "${language.toUpperCase()}" language`,
      )
      if (confirm) {
        setDraft((prev) => ({
          ...prev,
          pages: prev.pages.filter((item) => item.language !== language),
          languages: prev.languages.filter((item) => item.code !== language),
        }))
      }
    }
  }

  const makeDefaultLanguage = (language) => async () => {
    if (language === draft.defaultLanguage) return false

    const confirm = await isConfirmed(
      `Do you want to make ${language} as a default language? It will also reflect the page tree!`,
    )

    if (confirm) {
      const newPages = deepClone(draft.pages)

      for (let i = 0; i < newPages.length; i++) {
        if (newPages[i].path.includes('/~')) {
          newPages[i].path = newPages[i].path.replace('/~', `/${newPages[i].language}`)
        }
        if (newPages[i].language === language) {
          newPages[i].path = newPages[i].path.replace(`/${newPages[i].language}`, '/~')
        }
      }

      setDraft((prev) => ({
        ...prev,
        pages: newPages,
        defaultLanguage: language,
      }))
    }
  }

  // to save whole page tree
  const handleSave = async (draftData = null) => {
    const newdrafData = draftData || draft

    try {
      setLoading(true)
      const pageTree = {
        clientId,
        domainId,
        productId,
        domain: domain.url,
        draft: newdrafData,
        published,
      }
      const res = await fetch('/api/products/website/pagetree', {
        method: 'POST',
        body: JSON.stringify(pageTree),
      })

      const { data, error } = await res.json()

      setLoading(false)
      if (res.status === 200) {
        router.replace(`/admin/product/website/${clientId}/${domainId}/${productId}/${data._id}`)
      } else {
        console.log('Error while saving the data => ', error)
        await isConfirmed('Opps something went wrong!', true)
        router.replace('/admin/domains')
      }
      setIsEdited(false)
    } catch (e) {
      setLoading(false)
      console.log('Error while saving the data => ', e.message)
      await isConfirmed('Opps something went wrong!', true)
      router.replace('/admin/domains')
    }
  }

  const hardSave = (draftData) => {
    if (pageTreeId === '_new') handleSave(draftData)
    else handleUpdate(draftData)
  }

  // update whole pageTree
  const handleUpdate = async (draftData = null) => {
    const newData = draftData && Object?.keys(draftData).length > 0 ? draftData : draft

    try {
      setLoading(true)
      const pageTree = {
        draft: newData,
      }

      const res = await fetch(`/api/products/website/pagetree/${pageTreeId}`, {
        method: 'PUT',
        body: JSON.stringify(pageTree),
      })

      const { data, error } = await res.json()

      if (res.status === 200) {
        setPrevDraft(newData)
        setLoading(false)
      } else {
        setLoading(false)
        console.log('Error while updating the page tree => ', error)
        await isConfirmed('Opps something went wrong!', true)
        router.replace('/admin/domains')
      }
    } catch (e) {
      setLoading(false)
      console.log('Error while updating the page tree => ', e.message)
      await isConfirmed('Opps something went wrong!', true)
      router.replace('/admin/domains')
    }
  }

  // delete whole pageTree
  const handleDelete = async () => {
    const componentData = []

    if (draft?.pages && draft?.pages.length > 0) {
      for (let i = 0; i < draft?.pages.length; i++) {
        if (draft?.pages[i]?.modules && draft?.pages[i]?.modules.length > 0) {
          for (let j = 0; j < draft?.pages[i].modules.length; j++) {
            if (draft?.pages[i].modules[j].type === 'component') {
              componentData.push(draft?.pages[i].modules[j].contentId)
            }
          }
        }
      }
    }

    setLoading(true)
    const res = await fetch(`/api/products/website/pagetree/${pageTreeId}`, {
      method: 'DELETE',
      body: JSON.stringify({ domainId, componentData }),
    })
    if (res.status === 200) {
      // setLoading(false)
      setContextData((prevState) => ({
        ...prevState,
        search: {
          ...prevState.search,
          filterdDomains: '',
          clientId: '',
          lastSearched: new Date(),
          default: {
            ...prevState.search.default,
            clientId: '',
            url: '',
            productName: '',
          },
        },
      }))
      router.push('/admin/domains')
    } else {
      const jsonRes = await res.json()
      setErrors(jsonRes.error)
      setLoading(false)
    }
  }

  const discardChanges = () => {
    setDraft(prevDraft)
    setIsEditPage(false)
    setCurrentPage(false)
  }

  // publish whole pageTree
  const handlePublish = async () => {
    try {
      setLoading(true)
      const pageTree = {
        published: draft,
      }

      const res = await fetch(`/api/products/website/pagetree/${pageTreeId}`, {
        method: 'PUT',
        body: JSON.stringify(pageTree),
      })

      const { data, error } = await res.json()

      if (res.status === 200) {
        setPublished(draft)
        setLoading(false)
        setOpenEditPanel(!openEditPanel)
      } else {
        setLoading(false)
        console.log('Error while publishing the page tree => ', error)
        await isConfirmed('Opps something went wrong!', true)
        router.replace('/admin/domains')
      }
    } catch (e) {
      setLoading(false)
      console.log('Error while publishing the page tree => ', e.message)
      await isConfirmed('Opps something went wrong!', true)
      router.replace('/admin/domains')
    }
  }

  return (
    <div className="text-left mt-4 md:px-4 md:pt-4 flex-1">
      <div className="flex gap-8">
        <div className="text-2xl font-bold text-gray-600">Pages</div>
        <div className="flex flex-col sm:flex-row  w-full">
          <div className="flex flex-col sm:flex-row w-4/5 gap-2 sm:gap-8">
            {!!draft.languages.length && (
              <Button
                variant="primary"
                onClick={() => {
                  setOpenCreatePageModal(true)
                  setPage((prev) => ({
                    ...prev,
                    language: draft.defaultLanguage,
                    rootPage: true,
                  }))
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
          <div className="w-1/5 flex justify-end">
            <Button
              variant="success"
              onClick={() => {
                setOpenStylesModal(true)
              }}
              type="button"
              className="!bg-white"
              title="To add new a styles"
            >
              Styles
              <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Pages" />
            </Button>
          </div>
        </div>
      </div>

      {draft.pages.length === 0 && !!draft.languages.length && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Button
            filled={true}
            onClick={() => {
              setOpenCreatePageModal(true)
              setPage((prev) => ({
                ...prev,
                language: draft.defaultLanguage,
                rootPage: true,
              }))
            }}
            title="Create first root page"
          >
            Create Page
          </Button>
        </div>
      )}
      {draft.pages.length > 0 && (
        <div className={`flex items-start mt-4 ${!!currentPage && 'gap-x-8'}`}>
          <div
            className={`${
              !!currentPage ? 'w-1/2 scale-x-100' : 'w-0 scale-x-0 invisible'
            } transform origin-left transition-all ease-in-out duration-700`}
          >
            {!!currentPage && (
              <EditPage
                pages={draft.pages}
                draft={draft}
                setDraft={setDraft}
                languages={draft.languages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                domain={domain}
                layouts={layouts}
                setIsEditPage={setIsEditPage}
                modulesList={modulesList}
                handleUpdate={hardSave}
                pageTreeId={pageTreeId}
                clientId={clientId}
              />
            )}
          </div>

          <div
            className={`bg-white p-4 rounded-lg shadow-md transition-all ease-in-out duration-700 ${
              currentPage ? 'w-1/2' : 'w-full'
            }`}
          >
            <div className="flex justify-between items-center border-b-gray-400 border-b pb-4">
              <p className="text-lg ">Page Tree</p>
              <img
                className="inline-block ml-auto mr-2 cursor-pointer"
                src="/images/setting.svg"
                onClick={() => setSettingsModal(true)}
                alt="Site settings"
              />
            </div>

            <PageTree value={draft.pages} onChange={handlePageTreeChange}>
              {({ data, deleteNode, hasChild, toggleFn, expand, copyNode, cancleCopy, pasteNode }) => {
                // Delete tree page
                const handleDeletePage = async () => {
                  const confirmed = await isConfirmed(
                    hasChild
                      ? `Are you sure you want to delete this page? All sub pages will be deleted.`
                      : `Are you sure you want to delete this page ?`,
                  )
                  if (confirmed) {
                    return deleteNode()
                  } else {
                    return null
                  }
                }
                return (
                  <div
                    className={
                      data.id === currentPage
                        ? 'py-2 px-4 items-center border border-primary-400 bg-teal-50 my-2 rounded-lg flex'
                        : 'py-2 px-4 items-center border border-gray-400 my-2 rounded-lg flex'
                    }
                  >
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
                          setPage((prev) => ({
                            ...prev,
                            language: data.language,
                            refPath: data.path,
                            isChild: isRoot,
                          }))
                        }}
                        className="text-sm !px-2 !py-[2px]"
                        title="Add page to this level"
                      >
                        Page <img className="inline-block" src="/images/plus-bar.svg" alt="Pages" />
                      </Button>
                      <button
                        className="mx-2"
                        onClick={
                          isEditPage && currentPage !== data.id
                            ? async () => {
                                const confirm = await isConfirmed(
                                  `All changes will be discarded , Are you sure you want to change the page? `,
                                )
                                confirm && setCurrentPage(data.id)
                              }
                            : () => setCurrentPage(data.id)
                        }
                        type="button"
                        title="Edit page"
                      >
                        <img src="/images/Edit.svg" />
                      </button>

                      <button onClick={handleDeletePage} type="button" title="Delete page">
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

      {/* Confirm Box */}
      <div
        className={`fixed bg-white border right-0 z-20 border-primary-400 pl-4 p-4 bottom-36 transform transition duration-500 ease ${
          openEditPanel ? '' : 'translate-x-full'
        } `}
      >
        <span
          onClick={() => {
            setOpenEditPanel(!openEditPanel)
          }}
          className="absolute p-2 transform -translate-x-full -translate-y-1/2 bg-white border border-solid rounded-full open-arrow top-1/2 left-2 border-primary-400"
        >
          {openEditPanel ? (
            <svg className="block w-4 h-4 fill-current" viewBox="0 0 256 512" aria-hidden="true" role="presentation">
              <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z"></path>
            </svg>
          ) : (
            <svg className="block w-4 h-4 fill-current" viewBox="0 0 256 512" aria-hidden="true" role="presentation">
              <path d="M238.475 475.535l7.071-7.07c4.686-4.686 4.686-12.284 0-16.971L50.053 256 245.546 60.506c4.686-4.686 4.686-12.284 0-16.971l-7.071-7.07c-4.686-4.686-12.284-4.686-16.97 0L10.454 247.515c-4.686 4.686-4.686 12.284 0 16.971l211.051 211.05c4.686 4.686 12.284 4.686 16.97-.001z"></path>
            </svg>
          )}
        </span>
        <div>
          {pageTreeId === '_new' && (
            <Button onClick={() => handleSave()} type="button" className="mr-2" filled={true} title="Save pagetree">
              Save Page Tree
            </Button>
          )}
          <div className="flex flex-col">
            {pageTreeId !== '_new' && isEdited && (
              <Button title="Update whole pagetree" variant="danger" onClick={discardChanges}>
                Discard Changes
              </Button>
            )}
            {pageTreeId !== '_new' && isEdited && (
              <Button title="Update whole pagetree" className="mt-4" onClick={() => handleUpdate()}>
                Save Changes
              </Button>
            )}
          </div>
          {pageTreeId !== '_new' && !isEdited && publishPageTree && (
            <Button onClick={handlePublish} type="button" filled={true} title="Publish pagetree">
              Publish Page Tree
            </Button>
          )}

          {pageTreeId !== '_new' && (
            <div className={`flex ${isEdited || publishPageTree ? 'mt-4' : ''} justify-center`}>
              <Button
                variant="danger"
                onClick={async () => {
                  let confirmed = await isConfirmed(`Are you sure to delete this page tree`)
                  if (confirmed) {
                    handleDelete()
                  }
                }}
                type="button"
                title="Delete pagetree"
              >
                Delete Page Tree
              </Button>
            </div>
          )}
        </div>
      </div>

      <PopUp openModal={openStylesModal}>
        <div className="bg-white md:w-4/5 2xl:w-5/6 mx-auto mt-20 px-4 pt-2 pb-4 rounded-lg">
          <div>
            <EditPagetreeStyles
              draft={draft}
              setDraft={setDraft}
              prevDraft={prevDraft}
              setPrevDraft={setPrevDraft}
              setOpenStylesModal={setOpenStylesModal}
              globalStylesProps={globalStylesProps}
            />
          </div>
        </div>
      </PopUp>

      <PopUp openModal={openCreatePageModal}>
        <div className="bg-white md:w-4/5 2xl:w-3/5 mx-auto mt-24 p-6 rounded-lg">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Add Page</h1>
            <svg
              onClick={() => {
                setPage({
                  rootPage: false,
                  name: '',
                  language: '',
                  path: '',
                  slug: '',
                  layout: { module: '', library: '', blockProps: {} },
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
                setErrors({
                  name: '',
                  layout: '',
                  slug: '',
                  language: '',
                  scripts: '',
                })
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
                  value={page.language}
                  disabled={page.refPath !== ''}
                  name="language"
                  onChange={handleChange}
                  className="py-2"
                >
                  {draft.languages.map((lang) => (
                    <option value={lang.code} key={lang.code}>
                      {lang.title}
                    </option>
                  ))}
                </Select>
                {errors.language && <p className="text-red-500">{errors.language}</p>}
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
                {layouts.map((layout) => (
                  <Input
                    type="radio"
                    onChange={handleChange}
                    variant="success"
                    title={layout.name['en']}
                    id={`crt-${layout.module}`}
                    name="layout"
                    value={layout.module}
                    checked={page.layout.module === layout.module}
                    key={layout.module}
                  />
                ))}
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
              Create Page
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
                setLanguageCodeToAdd('')
                setErrors({
                  name: '',
                  layout: '',
                  slug: '',
                  language: '',
                  scripts: '',
                })
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
              <label className="block mb-2">Label</label>
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
            <div className="my-4">
              <label className="block mb-2">Code</label>
              <div className="flex items-center">
                <Input
                  variant="primary"
                  className="!w-full py-2"
                  value={languageCodeToAdd}
                  onChange={(e) => setLanguageCodeToAdd(e.target.value.trim())}
                  placeholder="DE"
                  name="language"
                />
              </div>
              {errors.language && <p className="text-red-500 pl-2 -mb-2">{errors.language}</p>}
            </div>
            <div className="flex flex-wrap mb-4">
              {draft.languages.map((language) => (
                <div key={language.code} className="flex items-center mr-8 my-1">
                  <div
                    className={`flex items-stretch border ${
                      draft.defaultLanguage === language.code
                        ? 'border-primary-400 bg-primary-400 text-white'
                        : 'border-gray-400'
                    } rounded-lg overflow-hidden`}
                  >
                    <p
                      className="pl-4 py-2 pr-6 cursor-pointer"
                      onClick={makeDefaultLanguage(language.code)}
                      title={`Click to make "${language.code?.toUpperCase()}" a default language`}
                    >
                      {language.title?.charAt(0).toUpperCase() + language.title?.slice(1)}
                    </p>
                    <button type="button" className="bg-white px-2" onClick={removeLanguage(language.code)}>
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

      <PopUp openModal={settingsModal}>
        <div className="bg-white md:w-3/4 xl:w-2/4 mx-auto mt-72 p-6 rounded-lg">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl text-heading font-bold w-10/12 text-left">Settings</h1>
            <svg
              onClick={() => {
                setSettingsModal(false)
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
            <label className="block mb-2 font-bold">GTM Params</label>
            <div>
              <label>ID :</label>

              <Input
                variant="primary"
                className="!w-2/5 ml-2"
                value={draft.gtmParams.id || ''}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, gtmParams: { ...prev.gtmParams, id: e.target.value } }))
                }
                placeholder="Id"
                name="language"
              />
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
