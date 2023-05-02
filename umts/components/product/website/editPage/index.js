import React, { useEffect, useState, useContext } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { deepClone } from '../../../../lib/object'
import { isEqual } from '../../../../lib/utils'
import Button from '../../../common/Button'
import { Input, Select } from '../../../componentLibrary'
import PopUp from '../../../dialog/popUp'
import useConfirm from '../../../dialog/useConfirm'
import { buildDataObj } from '../../../EditComponent/utils'
import EditComponent from '../../../EditComponent'
import Slot from './components/Slot'
import EditProduct from './components/EditProduct'
import { AppContext } from '../../../../context/appContext'

const EditPage = ({
  pages,
  draft,
  setDraft,
  languages,
  currentPage,
  layouts,
  setCurrentPage,
  domain,
  setIsEditPage,
  modulesList,
  pageTreeId,
  handleUpdate,
  clientId,
}) => {
  const [page, setPage] = useState({
    id: '_new',
    rootPage: '',
    name: '',
    language: '',
    path: '',
    slug: '',
    layout: { module: '', library: '', blockProps: {} },
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
  const [, setContextData, setLoading] = useContext(AppContext)
  const [isDataUpdated, setIsDataUpdated] = useState(false)
  const [errors, setErrors] = useState({ name: '', slug: '', layout: '' })
  const [slots, setSlots] = useState({})
  const [editLayoutModal, setEditLayoutModal] = useState({
    open: false,
    props: [],
    languages: ['en'],
    language: 'en',
    value: {},
  })
  const [editProductPopup, setEditProductPopup] = useState({
    openPopup: false,
    props: [],
    languages: ['en'],
    product: null,
  })

  const { isConfirmed } = useConfirm()

  useEffect(() => {
    const pageData = pages.find((page) => page.id === currentPage)
    if (pageData) {
      const layout = layouts.find((item) => item.module === pageData.layout.module)
      const currentSlots = {}

      for (let i = 0; i < layout.slots.length; i++) {
        const slot = layout.slots[i]
        currentSlots[slot.key] = {
          ...slot,
          modules: pageData.modules.filter((module) => module.slot === slot.key),
        }
      }

      setSlots(currentSlots)
      setPage(deepClone(pageData))
      setOldPageData(deepClone(pageData))
    }
  }, [currentPage])

  useEffect(() => {
    setIsDataUpdated(!isEqual(oldPageData, page))
    setIsEditPage(!isEqual(oldPageData, page))
    setContextData((prevState) => ({
      ...prevState,
      saveDirty: isEqual(oldPageData, page),
    }))
  }, [page])

  useEffect(() => {
    const layout = layouts.find((item) => item.module === page.layout.module)
    if (layout) {
      const currentSlots = {}

      for (let i = 0; i < layout.slots.length; i++) {
        const slot = layout.slots[i]
        currentSlots[slot.key] = {
          ...slot,
          modules: page.modules.filter((module) => module.slot === slot.key),
        }
      }

      setSlots(currentSlots)
    }
  }, [page.layout.module])

  const handleAccordian = (section) => () => {
    if (section === openedSection) {
      setOpenedSection('')
    } else {
      setOpenedSection(section)
    }
  }

  const blurHandler = () => {
    if (!page.name || !page.layout.module || !page.slug) {
      const error = { name: '', slug: '', layout: '' }
      if (!page.name) {
        error.name = '* name can not be empty!'
      }
      if (!page.layout.module) {
        error.layout = '* please select layout!'
      }
      if (page.path.split('/').length > 2 && !page.slug) {
        error.slug = '* slug can not be empty!'
      }
      setErrors(error)
    }
  }

  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value

    if (name === 'slug') {
      setPage((prev) => ({ ...prev, [name]: value.toLowerCase().trim() }))
    } else if (name === 'metaTitle') {
      setPage((prev) => ({ ...prev, meta: { ...prev.meta, title: value } }))
    } else if (name === 'metaDescription') {
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
    } else if (name === 'pageLayout') {
      const layout = layouts.find((item) => item.module === value)

      if (layout) {
        const blockProps = buildDataObj(layout.props, languages)
        blockProps.slots = {}

        for (let i = 0; i < layout.slots.length; i++) {
          const slot = layout.slots[i].key
          blockProps.slots[slot] = { active: true }
        }
      }

      setPage((prev) => ({
        ...prev,
        layout: { ...page.layout, module: value, library: layout.library, blockProps },
      }))
    } else {
      setPage((prev) => ({ ...prev, [name]: value }))
    }
    if (page.name || page.layout.module || page.slug) {
      setErrors({ name: '', slug: '', layout: '' })
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
    setIsEditPage(false)
  }

  const createURL = (domain) => {
    const path = beautifyPath(page.path)
    if (domain.includes('www.')) {
      if (domain.includes('https://')) {
        return `${domain}${path}`
      } else {
        return `https://${domain}${path}`
      }
    } else {
      return `https://www.${domain}${path}`
    }
  }

  const handleEditLayout =
    (layoutModule = '') =>
    () => {
      const currModule = layouts.find((layout) => layout.module === layoutModule)

      setEditLayoutModal({
        open: true,
        language: 'en',
        props: currModule.props,
        languages: languages.map((language) => language.code),
        value: page.layout.blockProps,
      })
    }

  const handleSubmitEditLayout = (values, actions) => {
    setPage((prev) => ({ ...prev, layout: { ...prev.layout, blockProps: { ...prev.layout.blockProps, ...values } } }))
    setEditLayoutModal((prev) => ({ ...prev, value: values }))
  }

  const handleSave = (pageData = null, hardSave = false) => {
    const currPage = deepClone(pageData || page)

    if (!currPage.name || !currPage.layout.module || (currPage.path.split('/').length > 2 && !currPage.slug)) {
      return null
    }

    const newPages = deepClone(pages)

    if (oldPageData.slug !== currPage.slug) {
      const pageIndex = newPages.findIndex((item) => item.id === currPage.id)
      const newPath = newPages[pageIndex].path.split('/')
      const oldPath = newPages[pageIndex].path

      newPages[pageIndex] = currPage
      // path can be only changed for the child pages

      newPath.pop()
      newPath.push(currPage.slug)

      newPages[pageIndex].path = newPath.join('/')

      if (newPages.find((item) => item.path === newPages[pageIndex].path && item.id !== newPages[pageIndex].id)) {
        setErrors((prev) => ({
          ...prev,
          slug: 'Please provide a unique url slug!',
        }))
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
    } else {
      for (let i = 0; i < newPages.length; i < i++) {
        if (newPages[i].id === currPage.id) {
          newPages[i] = currPage
        }
      }
    }

    setDraft((prev) => ({ ...prev, pages: newPages }))

    if (hardSave) {
      ;(async () => {
        const newPageTreeData = await handleUpdate({ ...draft, pages: newPages })
        setLoading(false)
      })()
    }

    setCurrentPage('')
    setIsEditPage(false)
  }

  const handleSlotActivation = (slot) => (e) => {
    setPage((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        blockProps: {
          ...prev.layout.blockProps,
          slots: {
            ...prev.layout.blockProps.slots,
            [slot]: { active: e.target.checked },
          },
        },
      },
    }))
  }

  const addExistingModule = (slot) => async (value) => {
    if (value) {
      const module = domain.products.find((product) => product._id === value)
      const newSlots = deepClone(slots)
      const slotModule = {
        id: `${slot}-${module.name}`,
        name: module.name,
        module: module.module,
        library: page.layout.library,
        slot,
        contentId: module.contentId || null,
        version: module.version,
        type: module.type,
      }

      if (newSlots[slot].modules.find((item) => item.id === slotModule.id)) {
        // alert('Already exists!')
        await isConfirmed('Module already exists!', true)
      } else {
        newSlots[slot].modules.push(slotModule)

        const modules = []
        for (let slot in newSlots) {
          modules.push(...newSlots[slot].modules)
        }

        setPage((prev) => ({ ...prev, modules }))
        setSlots(newSlots)
      }
    }
  }

  const addNewModule = async (component) => {
    const newSlots = deepClone(slots)
    if (newSlots[component.slot].modules.find((item) => item.id === component.id)) {
      await isConfirmed('Module already exists!', true)
    } else {
      const newPage = deepClone(page)
      component.library = page.layout.library
      newPage.modules.push(component)

      newSlots[component.slot].modules.push(component)

      setPage(newPage)
      setSlots(newSlots)
    }
  }

  const deleteModule = (slot) => (moduleId, domainId, moduleType) => async () => {
    const pageId = page.id

    const result = await isConfirmed('Doy want to delete this module?')
    if (result) {
      setLoading(true)
      const newSlots = deepClone(slots)
      const contentId = newSlots[slot].modules.find((m) => m.id === moduleId).contentId
      newSlots[slot].modules = newSlots[slot].modules.filter((module) => module.id !== moduleId)

      const modules = []
      for (let slot in newSlots) {
        modules.push(...newSlots[slot].modules)
      }

      setPage((prev) => ({ ...prev, modules }))
      setSlots(newSlots)

      // delete
      if (contentId && moduleType === 'component') {
        const response = await fetch(`/api/contents/${contentId}`, {
          method: 'DELETE',
          body: JSON.stringify({ domainId, pageTreeId, pageId, moduleId }),
        })

        const result = await response.json()
        if (result.data.success) {
          handleSave({ ...page, modules }, true)
        }
      } else {
        setLoading(false)
      }
    }
  }

  const addContentId = (product, contentId) => {
    const newSlots = deepClone(slots)
    const newPage = deepClone(page)

    const currSlot = newSlots[product.slot].modules.find((item) => item.id === product.id)
    const currModuleInPage = newPage.modules.find((item) => item.id === product.id)

    currSlot.contentId = contentId
    currModuleInPage.contentId = contentId

    setSlots(newSlots)
    setPage(newPage)

    handleSave({ ...newPage }, true)
  }

  const editModule = (moduleId) => () => {
    const product = page.modules.find((item) => item.id === moduleId)

    const props = modulesList.find((item) => item.module === product.module && item.version === product.version)

    setEditProductPopup({
      openPopup: true,
      props: props,
      languages: languages.map((language) => language.code),
      product,
    })
  }

  const moveModuleToSlot = async (moduleId, fromSlot, toSlot) => {
    const newSlots = deepClone(slots)
    const currModule = newSlots[fromSlot].modules.find((module) => module.id === moduleId)

    newSlots[fromSlot].modules = newSlots[fromSlot].modules.filter((module) => module.id !== moduleId)
    currModule.slot = toSlot
    const newId = currModule.id.split('-')
    newId[0] = toSlot
    currModule.id = newId.join('-')

    if (newSlots[toSlot].modules.find((module) => module.id === currModule.id)) {
      await isConfirmed('Module already exists!', true)
    } else {
      newSlots[toSlot].modules.push(currModule)

      const modules = []
      for (let slot in newSlots) {
        modules.push(...newSlots[slot].modules)
      }

      setPage((prev) => ({ ...prev, modules }))
      setSlots(newSlots)
    }
  }

  const swapModuleInSlot = (dragItem, dropItem, slot) => {
    const newSlots = deepClone(slots)
    const dragItemIndex = newSlots[slot].modules.findIndex((item) => item.id === dragItem)
    const dropItemIndex = newSlots[slot].modules.findIndex((item) => item.id === dropItem)

    const dragModule = newSlots[slot].modules[dragItemIndex]
    const dropModule = newSlots[slot].modules[dropItemIndex]

    newSlots[slot].modules[dragItemIndex] = dropModule
    newSlots[slot].modules[dropItemIndex] = dragModule

    const modules = []
    for (let slot in newSlots) {
      modules.push(...newSlots[slot].modules)
    }

    setPage((prev) => ({ ...prev, modules }))
    setSlots(newSlots)
  }

  return (
    <>
      <div className="bg-white flex items-center justify-between rounded-lg shadow-md p-4 mb-2 overflow-hidden">
        <p className="text-lg font-semibold flex">
          {page.name} <span className="border-l-2 mx-4 pl-4 font-light">{createURL(domain.url).slice(8)}</span>
          {/* {page.name} <span className="text-gray-500">( {beautifyPath(page.path)} )</span> */}
        </p>

        <div>
          <Button variant="danger" onClick={handleClose}>
            Cancel
          </Button>

          {isDataUpdated && (
            <Button className="ml-2" onClick={() => handleSave()}>
              Done
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto relative h-[calc(70vh-60px)] scrollbarEditPage">
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
                <label className="block mb-2">Page Name</label>
                <Input
                  type="text"
                  variant="primary"
                  name="name"
                  value={page.name}
                  onBlur={blurHandler}
                  onChange={handleChange}
                  className="py-2"
                />
                {errors.name && <p className="text-red-500">{errors.name}</p>}
              </div>
              <div className="w-2/5">
                <label className="block mb-2">URL Slug</label>
                <Input
                  type="text"
                  disabled={!oldPageData.slug && !page.slug}
                  variant="primary"
                  name="slug"
                  value={page.slug}
                  onChange={handleChange}
                  onBlur={blurHandler}
                  className="py-2"
                />
                {errors.slug && <p className="text-red-500 -mb-2">{errors.slug}</p>}
              </div>
              <div className="w-1/5">
                <label className="block mb-2">Language</label>
                <Select
                  variant="primary"
                  disabled={true}
                  name="language"
                  value={page.language}
                  onChange={handleChange}
                  className="py-2"
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.title}
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
                <label className="block mb-2">Meta Title</label>
                <Input
                  type="text"
                  variant="primary"
                  name="metaTitle"
                  value={page.meta.title}
                  onChange={handleChange}
                  className="py-2"
                />
              </div>
              <div className="flex gap-x-4 mt-2">
                <div className="w-1/2">
                  <label className="block mb-2">Meta Description</label>
                  <textarea
                    value={page.meta.description}
                    className="border border-gray-400 rounded-lg w-full outline-none p-2 text-sm"
                    name="metaDescription"
                    rows={3}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-2">Scripts</label>
                  <textarea
                    value={page.scripts.map((item) => item.src).join('\n')}
                    className="border border-gray-400 rounded-lg w-full outline-none p-2 text-sm"
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
              {/* preview */}
              <div className="my-3 border border-gray-400 rounded-lg w-full outline-none p-4 flex flex-col">
                <div className="border-1 border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="text-sm w-2/12 text-gray-400">Google Preview</div>
                    <hr className="w-10/12 border-t-2 text-gray-600" />
                  </div>
                  {/* meta title */}
                  <div className="text-[#1a0dab]">
                    {page.meta.title ? page.meta.title : 'Meta Tags — Preview, Edit and Generate'}
                  </div>
                  {/* url */}
                  <div className="text-[#006621] mb-1 text-xs">{createURL(domain.url)} </div>
                  {/* meta desc */}
                  <div className="text-[#545454] text-xs w-4/5">
                    {page.meta.description
                      ? page.meta.description
                      : 'With Meta Tags you can edit and experiment with your content then preview how your webpage will look on Google, Facebook, Twitter and more!'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mt-2">
          <div
            className={`flex justify-between ${openedSection === 'layout' ? 'border-b border-b-gray-400 pb-1' : ''}`}
          >
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
              <Select variant="primary" name="pageLayout" value={page.layout.module} onChange={handleChange}>
                {layouts.map((layout) => (
                  <option key={layout.module} value={layout.module}>
                    {layout.name['en']}
                  </option>
                ))}
              </Select>
              {!!page.layout.module && (
                <Button className="mt-2" type="button" onClick={handleEditLayout(page.layout.module)}>
                  Edit Layout Props
                </Button>
              )}
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
                if (language.code !== page.language) {
                  const languagePages = pages.filter((item) => item.language === language.code)
                  if (languagePages.length) {
                    return (
                      <div className="w-1/2 px-2" key={language.code}>
                        <label>{language.title}</label>
                        <Select
                          variant="primary"
                          value={page.hrefLang[language.code] || ''}
                          onChange={(e) =>
                            setPage((prev) => ({
                              ...prev,
                              hrefLang: {
                                ...prev.hrefLang,
                                [language.code]: e.target.value,
                              },
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
        <div className="bg-white rounded-lg shadow-md p-4 mt-2">
          <div
            className={`flex justify-between ${openedSection === 'contents' ? 'border-b border-b-gray-400 pb-1' : ''}`}
          >
            <p className="text-lg">Contents</p>
            <img
              src="/images/select-list.svg"
              className={`w-6 ${openedSection === 'contents' ? 'rotate-180' : ''}`}
              onClick={handleAccordian('contents')}
            />
          </div>
          {!!(openedSection === 'contents') && (
            <div className="mt-2">
              {!!Object.keys(slots).length && (
                <DndProvider backend={HTML5Backend}>
                  {Object.keys(slots).map((slot) => (
                    <Slot
                      slot={slots[slot]}
                      key={slots[slot].key}
                      modules={domain.products.filter((product) => product.type !== 'website')}
                      active={page.layout.blockProps?.slots?.[slot]?.active}
                      handleSlotActivation={handleSlotActivation}
                      addExistingModule={addExistingModule}
                      deleteModule={deleteModule}
                      moveModuleToSlot={moveModuleToSlot}
                      swapModuleInSlot={swapModuleInSlot}
                      slots={slots}
                      editModule={editModule}
                      modulesList={modulesList}
                      addNewModule={addNewModule}
                      domainId={domain._id}
                    />
                  ))}
                </DndProvider>
              )}
            </div>
          )}
        </div>
      </div>
      <PopUp openModal={editLayoutModal.open}>
        <div className="p-8">
          <div className="bg-white p-4 rounded-lg">
            <div className="mb-2 flex justify-end">
              <Button
                variant="danger"
                onClick={() =>
                  setEditLayoutModal({ open: false, props: [], languages: ['en'], language: 'en', value: {} })
                }
              >
                Close
              </Button>
            </div>
            <div className="border border-gray-400 rounded-lg p-4 max-h-[calc(100vh_-_170px)] overflow-x-hidden overflow-y-auto">
              <EditComponent
                languages={editLayoutModal.languages}
                onLanguageChange={(language) => setEditLayoutModal((prev) => ({ ...prev, language }))}
                fields={editLayoutModal.props}
                onSubmit={handleSubmitEditLayout}
                value={editLayoutModal.value}
                currentLanguage={editLayoutModal.language}
              />
            </div>
          </div>
        </div>
      </PopUp>
      <PopUp openModal={editProductPopup.openPopup}>
        <div className="p-8">
          <div className="bg-white p-4 rounded-lg">
            <div className="mb-2 flex justify-between px-2 items-center border-b border-b-black pb-2">
              <div className="flex text-sm">
                <div className="text-2xl font-bold text-gray-600">{editProductPopup.product?.name}</div>
              </div>
              <Button
                variant="danger"
                onClick={() =>
                  setEditProductPopup({
                    openPopup: false,
                    props: [],
                    languages: ['en'],
                    product: null,
                  })
                }
              >
                Close
              </Button>
            </div>
            <div className="flex border border-gray-400 rounded-lg p-4 my-6">
              <div className="w-1/3 mr-4">
                <label className="my-2 text-sm inline-block">Module Name</label>
                <input
                  type="text"
                  value={editProductPopup.product?.module}
                  className="border border-gray-400 rounded-lg p-3 w-full outline-gray-400 bg-gray-100 text-sm"
                  disabled
                />
              </div>
              <div className="w-1/3 mr-4">
                <label className="my-2 text-sm inline-block">Component Type</label>
                <input
                  type="text"
                  value={editProductPopup.product?.type}
                  className="border border-gray-400 rounded-lg p-3 w-full outline-gray-400 bg-gray-100 text-sm"
                  disabled
                />
              </div>
              <div className="w-1/3">
                <label className="my-2 text-sm inline-block">Version</label>
                <input
                  type="text"
                  value={editProductPopup.product?.version}
                  className="border border-gray-400 rounded-lg p-3 w-full outline-gray-400 bg-gray-100 text-sm"
                  disabled
                />
              </div>
            </div>
            <div className="relative border border-gray-400 rounded-lg p-4 max-h-[calc(100vh_-_300px)] overflow-x-hidden overflow-y-auto">
              <EditProduct
                props={editProductPopup.props}
                languages={editProductPopup.languages}
                product={editProductPopup.product}
                addContentId={addContentId}
                setEditProductPopup={setEditProductPopup}
                domainId={domain._id}
                isConfirmed={isConfirmed}
                clientId={clientId}
              />
            </div>
          </div>
        </div>
      </PopUp>
    </>
  )
}

export default EditPage
