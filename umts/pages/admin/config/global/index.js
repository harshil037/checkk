import React, { useState, useEffect, useContext, useMemo } from 'react'
import Authenticate from '../../../../lib/authenticate'
import { AppContext } from '../../../../context/appContext'
// import { useRouter } from 'next/router'
import { Input, Select } from '../../../../components/componentLibrary'
import Button from '../../../../components/common/Button'
import { TextInput } from '../../../../components/common/container/components'
import PopUp from '../../../../components/dialog/popUp'
import { get, set } from '../../../../lib/object.js'
import Container from '../../../../components/common/container'
import EditIcon from '../../../../components/icons/edit'
import PlusIcon from '../../../../components/icons/plus'
import EditFieldIcon from '../../../../components/icons/editField'
import CloseIcon from '../../../../components/icons/close'
import DeleteIcon from '../../../../components/icons/delete'

const GlobalConfig = () => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  // const router = useRouter()
  const [openModal, setOpenModal] = useState(false)
  const initialProps = { name: 'config', props: [], languages: ['de', 'it', 'en'], values: {} }
  const [form, setForm] = useState(initialProps)
  const [currentLang, setCurrentLang] = useState('en')
  const [editField, setEditField] = useState({ index: null, isEditing: false })
  const [language, setLanguage] = useState('')
  const [focusedField, setFocusedField] = useState('')
  // path for render form
  const [path, setPath] = useState('') // for form values
  const [propsPath, setPropsPath] = useState('') // for form props
  // path to add or edit form
  const [editPath, setEditPath] = useState('') // for form values
  const [editPropsPath, setEditPropsPath] = useState('') // for form props
  const [editView, setEditView] = useState(false)

  const initialSelectedField = {
    type: '',
    label: form?.languages?.reduce((acc, curr) => ((acc[curr] = ''), acc), {}),
    key: '',
    languages: false,
  }
  const [selectedField, setSelectedField] = useState({
    type: '',
    label: form?.languages?.reduce((acc, curr) => ((acc[curr] = ''), acc), {}),
    key: '',
    languages: false,
  })

  const [editFormErrors, setEditFormErrors] = useState({ label: '', key: '' })

  // console.log({ form })

  // tabs
  const [tabs, setTabs] = useState(['general'])
  const [activeTab, setActiveTab] = useState('general')
  const [containerProp, setContainerProp] = useState(false)

  const [accordion, setAccordion] = useState({})
  const handleAccordion = (path, key, index = null) => {
    let accObj = { ...accordion }
    let result = Object.keys(accObj).filter((k) => k.includes(path))
    let accKey = index !== null ? `${path}${key}[${index}]` : `${path}${key}`
    for (let i = 0; i < result.length; i++) {
      if (result[i] !== accKey) accObj[result[i]] = false
    }
    setAccordion(() => accObj)
    setAccordion((prevState) => {
      return { ...prevState, [accKey]: !prevState[accKey] }
    })
  }

  const handleFocusField = (key) => {
    setFocusedField(key)
  }
  const setFocusValue = (path, language, value) => {
    const valuesObj = { ...form.values }
    set(valuesObj, `${path}.${language}`, value)
    setForm((prev) => ({ ...prev, values: valuesObj }))
  }

  const setFocusLabel = (path, language, value) => {
    setSelectedField((prev) => ({
      ...prev,
      label: { ...prev.label, [language]: value },
    }))
  }

  const getConfigData = async () => {
    try {
      setLoading(true)
      let res = await fetch(`/api/config`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      let result = await res.json()
      if (result.data) {
        setLoading(false)
        const { _id, ...newResult } = result.data
        setForm(newResult)
        setSelectedField((prev) => ({
          ...prev,
          label: newResult?.languages?.reduce((acc, curr) => ((acc[curr] = ''), acc), {}),
        }))
      } else {
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
    }
  }

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'config',
    }))
    // setInitialModal(true)
    getConfigData()
    // setSelectedField((prev) => ({
    //   ...prev,
    //   label: form?.languages?.reduce((acc, curr) => ((acc[curr] = ''), acc), {}),
    // }))
  }, [])

  useEffect(() => {
    const newTabs = form?.props
      .map((prop) => {
        if (prop.type === 'container') {
          return prop.key
        }
      })
      .filter((val) => val !== undefined)
    setTabs(['general', ...newTabs])
  }, [form])

  const handleChange = (path, value) => {
    const valuesObj = { ...form.values }
    set(valuesObj, path, value)
    setForm((prev) => ({ ...prev, values: valuesObj }))
  }

  const addField = (propsPath, path) => {
    const field = selectedField
    if (validateForm(field)) {
      let values
      const props = [...form.props]
      const valuesObj = { ...form.values }
      field.key = field.key.trim()
      for (let i in field.label) {
        field.label[i] = field.label[i].trim()
      }
      if (field.type === 'text') {
        if (field.languages) {
          values = {}
          for (let i = 0; i < form.languages.length; i++) {
            values[form.languages[i]] = ''
          }
        } else {
          values = ''
        }
      } else if (field.type === 'list') {
        if (field.languages) {
          values = {}
          for (let i = 0; i < form.languages.length; i++) {
            values[form.languages[i]] = []
          }
        } else {
          values = []
        }
      } else if (field.type === 'container') {
        values = {}
        field.props = []
      }
      const key = field.key
      const val = propsPath !== '' ? get(props, propsPath) : props
      val.push({ ...field })
      set(valuesObj, `${path}.${key}`, values)
      setForm((prev) => ({ ...prev, props: props, values: valuesObj }))
      setSelectedField(initialSelectedField)
      if (activeTab !== 'general') {
        form.props.map((prop, index) => {
          if (prop.key === activeTab) {
            setPath(`${prop.key}`)
            setPropsPath(`${index}.props`)
            setEditPath(`${prop.key}`)
            setEditPropsPath(`${index}.props`)
          }
        })
      } else {
        setPath('')
        setPropsPath('')
        setEditPath('')
        setEditPropsPath('')
      }
      // setEditPath('')
      // setEditPropsPath('')
      setOpenModal(false)
    }
  }

  const onEdit = (index, fieldPath, fieldPropsPath) => {
    setEditField({ isEditing: true, index })
    const props = [...form.props]
    const val = get(props, `${fieldPropsPath}`)
    setSelectedField(val)
    // setPath(fieldPath)
    // setPropsPath(fieldPropsPath)
    setEditPath(fieldPath)
    setEditPropsPath(fieldPropsPath)
    setOpenModal(true)
  }

  const handleEdit = () => {
    if (validateForm(selectedField)) {
      const newProps = [...form.props]
      if (containerProp) {
        // const newPropsPathArr = propsPath.split('.')
        const newPropsPathArr = editPropsPath.split('.')
        const newPropsPath = newPropsPathArr[0]
        set(newProps, `${newPropsPath}`, selectedField)
      } else {
        // set(newProps, `${propsPath}`, selectedField)
        set(newProps, `${editPropsPath}`, selectedField)
      }
      setForm({ ...form, props: newProps })
      setEditField({ isEditing: false, index: null })
      setSelectedField(initialSelectedField)
      setEditFormErrors({ label: '', key: '' })
      setOpenModal(false)
      updateConfigData({ ...form, props: newProps })
      setContainerProp(false)
      if (activeTab !== 'general') {
        form.props.map((prop, index) => {
          if (prop.key === activeTab) {
            setPath(`${prop.key}`)
            setPropsPath(`${index}.props`)
            setEditPath(`${prop.key}`)
            setEditPropsPath(`${index}.props`)
          }
        })
      } else {
        setPath('')
        setPropsPath('')
        setEditPath('')
        setEditPropsPath('')
      }
    }
  }

  const handleDelete = () => {
    const formValues = { ...form.values }
    const formProps = [...form.props]
    // const arrPath = path.split('.')
    const arrPath = editPath.split('.')
    const pathIndex = arrPath.pop()
    const newArrPath = arrPath.join('.')

    if (activeTab !== 'general') {
      if (newArrPath === '' || newArrPath === 'undefined') {
        delete formValues[pathIndex]
      } else {
        const newValues = get(formValues, newArrPath)
        delete newValues[pathIndex]
        set(formValues, newArrPath, newValues)
      }
    } else {
      delete formValues[pathIndex]
    }

    const arrPropsPath = editPropsPath.split('.')
    // const arrPropsPath = propsPath.split('.')
    if (containerProp) {
      const removedProp = arrPropsPath.pop()
    }
    const propsPathIndex = arrPropsPath.pop()
    const newArrPropsPath = arrPropsPath.join('.')

    if (activeTab !== 'general') {
      if (newArrPropsPath === '' || newArrPropsPath === 'undefined') {
        formProps.splice(propsPathIndex, 1)
      } else {
        const newProps = get(formProps, newArrPropsPath)
        newProps.splice(propsPathIndex, 1)
        set(formProps, newArrPropsPath, newProps)
      }
    } else {
      formProps.splice(propsPathIndex, 1)
    }
    setForm({ ...form, props: formProps, values: formValues })
    setEditField({ isEditing: false, index: null })
    setSelectedField(initialSelectedField)
    setEditFormErrors({ label: '', key: '' })
    setOpenModal(false)
    updateConfigData({
      ...form,
      props: formProps,
      values: formValues,
    })
    setContainerProp(false)
    // setEditPath('')
    // setEditPropsPath('')

    if (activeTab !== 'general') {
      form.props.map((prop, index) => {
        if (prop.key === activeTab) {
          setPath(`${prop.key}`)
          setPropsPath(`${index}.props`)
          setEditPath(`${prop.key}`)
          setEditPropsPath(`${index}.props`)
        }
      })
    } else {
      setPath('')
      setPropsPath('')
      setEditPath('')
      setEditPropsPath('')
    }
    if (pathIndex === activeTab) {
      const newTabs = tabs.filter((tab) => tab !== activeTab)
      setTabs(newTabs)
      setActiveTab('general')
      setPath('')
      setPropsPath('')
    }
    if (form.props.length <= 1) {
      setEditView(false)
    }
  }

  const renderForm = () => {
    if (activeTab !== 'general') {
      const props = get(form.props, propsPath)
      const values = get(form.values, path)
      return (
        <Container
          props={props}
          values={values}
          setCurrentLang={setCurrentLang}
          currentLang={currentLang}
          languages={form.languages}
          path={path}
          setPath={setPath}
          propsPath={propsPath}
          setPropsPath={setPropsPath}
          handleChange={handleChange}
          editable={editView}
          onEdit={onEdit}
          setOpenModal={setOpenModal}
          focusedField={focusedField}
          handleFocusField={handleFocusField}
          setFocusValue={setFocusValue}
          activeTab={activeTab}
          accordion={accordion}
          handleAccordion={handleAccordion}
          setEditPath={setEditPath}
          setEditPropsPath={setEditPropsPath}
        ></Container>
      )
    } else {
      return (
        <Container
          props={form.props}
          values={form.values}
          setCurrentLang={setCurrentLang}
          currentLang={currentLang}
          languages={form.languages}
          path={path}
          setPath={setPath}
          propsPath={propsPath}
          setPropsPath={setPropsPath}
          handleChange={handleChange}
          editable={editView}
          onEdit={onEdit}
          setOpenModal={setOpenModal}
          focusedField={focusedField}
          handleFocusField={handleFocusField}
          setFocusValue={setFocusValue}
          activeTab={activeTab}
          accordion={accordion}
          handleAccordion={handleAccordion}
          setEditPath={setEditPath}
          setEditPropsPath={setEditPropsPath}
        ></Container>
      )
    }
  }

  const validateForm = (field = {}) => {
    const rgxNoSpace = /^\S*$/
    let arrKeys
    let lblFlag = true
    for (let i in field.label) {
      if (field.label[i].trim()) {
        lblFlag = false
        break
      }
    }
    if (!editField.isEditing) {
      // const arrPropsPath = propsPath.split('.')
      const arrPropsPath = editPropsPath.split('.')
      const newArrPropsPath = arrPropsPath.join('.')
      const newProps = get(form.props, newArrPropsPath)
      if (newArrPropsPath === '' || newArrPropsPath === 'undefined') {
        arrKeys = form.props.map((prop) => {
          return prop.key
        })
      } else {
        arrKeys = newProps.map((prop) => {
          return prop.key
        })
      }
      if (arrKeys.includes(field.key.trim()) && !editField.isEditing) {
        setEditFormErrors((prev) => ({ ...prev, key: 'Please enter an unique key.' }))
      } else if (!rgxNoSpace.test(field.key)) {
        setEditFormErrors((prev) => ({ ...prev, key: 'White space is not allowed.' }))
      } else if (!lblFlag && field.key) {
        return true
      }
    } else {
      // check for label only
      if (!lblFlag) {
        return true
      }
    }

    if (lblFlag) setEditFormErrors((prev) => ({ ...prev, label: 'A label cannot be empty.' }))

    if (!field.key.trim()) setEditFormErrors((prev) => ({ ...prev, key: 'The Key cannot be empty.' }))

    return false
  }

  const handleBlur = (type) => (e) => {
    if (type === 'label') {
      if (!e.target.value) {
        setEditFormErrors({ ...editFormErrors, label: 'A label cannot be empty.' })
      } else {
        setEditFormErrors({ ...editFormErrors, label: '' })
      }
    } else if (type === 'key') {
      if (!e.target.value) {
        setEditFormErrors({ ...editFormErrors, key: 'The Key cannot be empty.' })
      } else {
        setEditFormErrors({ ...editFormErrors, key: '' })
      }
    }
  }

  const updateConfigData = async (form) => {
    try {
      setLoading(true)
      let res = await fetch(`/api/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      let result = await res.json()
      if (result.success) {
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateConfigData(form)
  }

  return (
    <div className="mt-8">
      {/* render tabs */}
      {form.props.length > 0 && (
        <ul className="flex w-full gap-4 overflow-x-auto">
          {tabs.map((tab, index) => {
            let tabProp = form.props.find((prop) => prop.key == tab)
            return (
              <li
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  if (tab !== 'general') {
                    form.props.map((prop, index) => {
                      if (prop.key === tab) {
                        setPath(`${prop.key}`)
                        setPropsPath(`${index}.props`)
                        setEditPath(`${prop.key}`)
                        setEditPropsPath(`${index}.props`)
                      }
                    })
                  } else {
                    setPath('')
                    setPropsPath('')
                    setEditPath('')
                    setEditPropsPath('')
                  }
                }}
                className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg ${
                  activeTab == tab ? 'after:bg-primary-400' : 'after:bg-transparent'
                } ${index === 0 && `ml-px`}`}
              >
                <span className="px-4 md:px-8">
                  {tabProp ? tabProp?.label[currentLang] || tabProp?.key : 'General'}
                </span>
                {editView && tab !== 'general' && (
                  <span className="ml-2 -mb-1">
                    {' '}
                    <Button
                      type="button"
                      onClick={() => {
                        form.props.map((prop, index) => {
                          if (prop.key === tab) {
                            const newPath = `${prop.key}`
                            const newPropsPath = `${index}`
                            onEdit(index, newPath, newPropsPath)
                            setContainerProp(true)
                          }
                        })
                      }}
                    >
                      <EditFieldIcon className="fill-[#68D0C2]"></EditFieldIcon>
                    </Button>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <div className="p-4 bg-white border">
        {form.props.length > 0 && (
          <div className="flex justify-end gap-4 text-sm">
            {editView && (
              <Button
                variant="primary"
                className="flex items-center"
                onClick={() => {
                  setOpenModal(true)
                }}
              >
                <span>Add field</span>
                <span>
                  <PlusIcon className={`${openModal ? 'fill-[#ffffff]' : 'fill-[#68D0C2]'}`}></PlusIcon>
                </span>
              </Button>
            )}
            <Button
              variant="primary"
              filled={true}
              className="flex items-center"
              onClick={() => {
                setEditView((prev) => !prev)
              }}
            >
              <span>Edit form</span>
              <span>
                <EditIcon className={`${editView ? 'fill-[#ffffff]' : 'fill-[#68D0C2]'}`}></EditIcon>
              </span>
            </Button>
          </div>
        )}

        <div>
          {form.props.length < 1 ? (
            <div className="flex w-full p-4 mt-4 text-left border border-gray-400 rounded-md">
              <div className="flex flex-col w-11/12 gap-8 p-8 mx-auto text-sm text-center place-items-center place-content-center">
                <div className="relative flex justify-center px-8 py-4">
                  <span className="text-2xl text-gray-600">Add field here</span>
                  <span className="absolute bottom-0 left-0 w-full h-px bg-gray-400"></span>
                </div>
                <Button
                  filled
                  onClick={() => {
                    setOpenModal(true)
                  }}
                >
                  Add field
                </Button>
              </div>
            </div>
          ) : (
            <form className="flex flex-wrap w-full text-left" onSubmit={handleSubmit}>
              {editView && (
                <div className="flex w-full p-4 mt-4 text-left border border-gray-400 rounded-md">
                  <div className="w-full">
                    <div className="flex flex-col w-full gap-1 text-sm">
                      <label htmlFor="language" className="text-gray-600">
                        Language
                      </label>
                      <div className="flex w-1/2 gap-4">
                        <Input
                          id="language"
                          variant="primary"
                          className="w-full px-4 py-2"
                          placeholder="Add a language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value.toLowerCase())}
                        />
                        <Button
                          className="px-3 py-1 border rounded-md border-primary-400"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!form.languages.includes(language) && language.trim()) {
                              const props = [...form.props]
                              const values = { ...form.values }
                              const addLanguage = (prop, path, language) => {
                                set(prop, `label.${language}`, '')
                                if (prop.type === 'container') {
                                  if (path === '') {
                                    path = `${prop.key}`
                                  } else {
                                    path += `.${prop.key}`
                                  }
                                  prop.props.map((prop, index) => {
                                    addLanguage(prop, path, language)
                                  })
                                } else {
                                  if (prop.languages) {
                                    let newPath =
                                      path === '' ? `${prop.key}.${language}` : `${path}.${prop.key}.${language}`
                                    if (prop.type === 'list') {
                                      set(values, newPath, [])
                                    } else {
                                      set(values, newPath, '')
                                    }
                                  }
                                }
                              }
                              for (let i = 0; i < props.length; i++) {
                                set(props[i], `label.${language}`, '')
                                addLanguage(props[i], '', language)
                              }
                              setForm((prev) => ({
                                ...prev,
                                languages: [...prev.languages, language.toLowerCase().trim()],
                                values,
                                props,
                              }))
                              setSelectedField((prev) => ({
                                ...prev,
                                label: { ...prev.label, [language]: '' },
                              }))
                              updateConfigData({
                                ...form,
                                languages: [...form.languages, language.toLowerCase().trim()],
                                values,
                                props,
                              })
                              setLanguage('')
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap mt-2">
                        {form?.languages?.map((lang) => {
                          const arrLanguage = ['en', 'it', 'de']
                          return (
                            <button
                              className={`flex gap-8 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 mr-3 mt-1`}
                              key={lang}
                              type="button"
                            >
                              <span>{lang.toUpperCase()} </span>
                              {!arrLanguage.includes(lang) && (
                                <span
                                  onClick={() => {
                                    const languages = form?.languages?.filter((item) => item != lang)
                                    const props = [...form.props]
                                    const values = { ...form.values }
                                    const deleteLanguage = (prop, path, lang) => {
                                      const newProp = get(prop, `label`)
                                      delete newProp[lang]
                                      set(prop, `label`, newProp)
                                      if (prop.type === 'container') {
                                        if (path === '') {
                                          path = `${prop.key}`
                                        } else {
                                          path += `.${prop.key}`
                                        }
                                        prop.props.map((prop, index) => {
                                          deleteLanguage(prop, path, lang)
                                        })
                                      } else {
                                        if (prop.languages) {
                                          let newPath = path === '' ? `${prop.key}` : `${path}.${prop.key}`
                                          const newValue = get(values, newPath)
                                          delete newValue[lang]
                                          set(values, newPath, newValue)
                                        }
                                      }
                                    }
                                    for (let i = 0; i < props.length; i++) {
                                      const newProp = get(props[i], `label`)
                                      delete newProp[lang]
                                      set(props[i], `label`, newProp)
                                      deleteLanguage(props[i], '', lang)
                                    }
                                    setForm((prev) => ({
                                      ...prev,
                                      languages,
                                      values,
                                      props,
                                    }))
                                    if (lang == currentLang) setCurrentLang('en')
                                    updateConfigData({ ...form, languages, values, props })
                                  }}
                                >
                                  <DeleteIcon className="fill-[#796B5F]"></DeleteIcon>
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {renderForm()}
              {!editView && (
                <div className="w-full">
                  <Button variant="primary" filled={true} type="submit">
                    Submit
                  </Button>
                </div>
              )}
            </form>
          )}
        </div>

        <PopUp
          openModal={openModal}
          classContent={`fixed inset-0 z-50 bg-black bg-opacity-50`}
          styleModalBody={{
            position: 'relative',
            top: '50%',
            right: '50%',
            transform: 'translate(50%,-50%)',
          }}
        >
          <div className="w-11/12 p-4 mx-auto my-auto overflow-hidden bg-white border border-gray-300 rounded-lg lg:w-2/5">
            <div
              onClick={() => {
                if (editField.isEditing) setEditField({ isEditing: false, index: null })
                setSelectedField(initialSelectedField)
                setEditFormErrors({ label: '', key: '' })
                setOpenModal(false)
                if (activeTab !== 'general') {
                  form.props.map((prop, index) => {
                    if (prop.key === activeTab) {
                      setPath(`${prop.key}`)
                      setPropsPath(`${index}.props`)
                      setEditPath(`${prop.key}`)
                      setEditPropsPath(`${index}.props`)
                    }
                  })
                } else {
                  setPath('')
                  setPropsPath('')
                  setEditPath('')
                  setEditPropsPath('')
                }
              }}
            >
              <CloseIcon className="w-6 h-6 ml-auto cursor-pointer fill-current"></CloseIcon>
            </div>
            <div className="flex flex-col w-11/12 gap-4 p-8 mx-auto text-sm text-center place-items-center place-content-center">
              <Select
                className="px-4 py-2"
                variant="success"
                value={selectedField.type}
                onChange={(e) => setSelectedField((prev) => ({ ...prev, type: e.target.value }))}
                disabled={editField.isEditing ? true : false}
              >
                <option value="">Please Select Field Type</option>
                <option value="text">Text</option>
                <option value="list">List</option>
                <option value="container">Container</option>
              </Select>
              {selectedField.type && (
                <div className="flex flex-wrap w-full text-left">
                  <div className={`w-full`}>
                    <TextInput
                      path={`${propsPath}.label.${currentLang}`}
                      languageBased={true}
                      languages={form.languages}
                      label="Label"
                      placeholder="Label text here"
                      value={selectedField['label'][currentLang]}
                      values={selectedField['label']}
                      onChange={(e) =>
                        setSelectedField((prev) => ({
                          ...prev,
                          label: { ...prev.label, [currentLang]: e.target.value },
                        }))
                      }
                      onLanguageChange={(lang) => setCurrentLang(lang)}
                      currentLanguage={currentLang}
                      variant="primary"
                      editable={false}
                      handleBlur={handleBlur('label')}
                      errorMsg={editFormErrors.label.length > 0 && editFormErrors.label}
                      focusedField={focusedField}
                      handleFocusField={handleFocusField}
                      setFocusValue={setFocusLabel}
                    ></TextInput>
                  </div>
                  {!editField.isEditing && (
                    <div className="w-full px-2 my-2">
                      <label className="text-gray-500">Key :</label>
                      <Input
                        variant="primary"
                        className="px-4 py-2"
                        placeholder="Key text here"
                        value={selectedField.key || ''}
                        onChange={(e) => setSelectedField((prev) => ({ ...prev, key: e.target.value }))}
                        onBlur={handleBlur('key')}
                      />
                      {editFormErrors.key.length > 0 && <p className="text-red-400">{editFormErrors.key}</p>}
                    </div>
                  )}
                  {!editField.isEditing && selectedField.type != 'container' && (
                    <div className="flex items-center w-1/2 px-2 mt-4">
                      <label className="text-gray-500">Language Based :</label>
                      <Input
                        type="toggle"
                        className="px-4 py-2"
                        id="languageBased"
                        variant="primary"
                        checked={selectedField.languages}
                        required={false}
                        onChange={(e) => {
                          setSelectedField((prev) => ({ ...prev, languages: e.target.checked }))
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              {editField.isEditing ? (
                <div className="flex gap-4">
                  <Button variant="primary" filled={true} onClick={handleEdit}>
                    Edit
                  </Button>
                  <Button variant="danger" filled={true} onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  filled={true}
                  onClick={() => {
                    // if (editPath !== '' && editPropsPath !== '') {
                    addField(editPropsPath, editPath)
                    // } else {
                    //   addField(propsPath, path)
                    // }
                  }}
                >
                  {selectedField.type == '' ? 'Add' : 'Add Field'}
                </Button>
              )}
            </div>
          </div>
        </PopUp>
      </div>
    </div>
  )
}

export default GlobalConfig

export async function getServerSideProps(context) {
  return Authenticate(context)
}
