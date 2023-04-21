import { useState, useEffect, useRef, useContext } from 'react'
import { useRouter } from 'next/router'
import { Formik, Field, Form, FieldArray } from 'formik'
import dynamic from 'next/dynamic'
import Authenticate from '../../../../lib/authenticate'
import {
  KeyedInput,
  TextInput,
  ArrayInput,
  LinkInput,
  SelectInput,
  RadioInput,
  DateTimePickerInput,
  ColorInput,
  OrderList,
  MultiSelect,
  ToggleInput,
} from '../../../../components/form'
import { AppContext } from '../../../../context/appContext'
import ClipBoardTool from '../../../../components/tool/clipBoardTool'
import HelpBar from '../../../../components/tool/helpBar'
import { Input, Select } from '../../../../components/componentLibrary'
import Button from '../../../../components/common/Button'
import useConfirm from '../../../../components/dialog/useConfirm'
const RTE = dynamic(() => import('../../../../components/shared/rte.js'), {
  ssr: false,
})

const EditSmts = () => {
  const [smtsProps, setSmtsProps] = useState([])
  const [blockProps, setBlockProps] = useState({})
  const router = useRouter()
  const { smtsId, clientId } = router.query
  const [errObj, setErrObj] = useState({})
  const [validations, setValidations] = useState({})
  const formEl = useRef(null)
  const [accordion, setAccordion] = useState({})
  const [visibleRootCategory, setVisibleRootCategory] = useState('')
  const [focusedField, setFocusedField] = useState({})
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const { isConfirmed } = useConfirm()

  const [language, setLanguage] = useState('en')
  const languagesArr = ['de', 'it', 'en']

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'domains',
    }))
  }, [])

  const [clipBoard, setClipBoard] = useState({
    method: '',
    key: '',
    value: null,
    path: '',
    message: '',
    type: '',
    remove: '',
    index: '',
    fieldProps: '',
  })
  const handleCopy = (key, path, type) => {
    const { value } = formEl.current.getFieldProps(path)
    setClipBoard({
      method: 'copy',
      key: key,
      value: value,
      path: path,
      message: 'CONTENT COPIED',
      type: type,
      remove: '',
      index: '',
    })
  }

  const handleCut = (key, path, type, remove, index, fieldProps) => {
    const { value } = formEl.current.getFieldProps(path)
    setClipBoard({
      method: 'cut',
      key: key,
      value: value,
      path: path,
      message: 'CONTENT CUTTED',
      type: type,
      remove: remove,
      index: index,
      fieldProps: fieldProps,
    })
  }

  const handlePaste = (path) => {
    formEl.current.setFieldValue(path, clipBoard.value)
    if (clipBoard.type === 'list' && clipBoard.method === 'cut') {
      clipBoard.remove(clipBoard.index)
    } else if (clipBoard.type === 'staticList' && clipBoard.method === 'cut') {
      const emptyValues = buildDataObj(clipBoard.fieldProps)
      formEl.current.setFieldValue(clipBoard.path, emptyValues)
    }
    setClipBoard({
      method: '',
      key: '',
      value: null,
      path: '',
      message: '',
      type: '',
      remove: '',
      index: '',
    })
  }

  const ChangeLanguage = async (e, language) => {
    e.preventDefault()
    setLanguage(language)
  }

  // function that stores validations conditions in "validations state object".
  const buildValidationsObj = (data, parent = '') => {
    switch (data.inputType) {
      case 'text':
        if (data.validation) {
          setValidations((state) => ({
            ...state,
            [`${data.key + parent}`]: data.validation,
          }))
        }
        break
      case 'list':
        for (var i = 0; i < data.props.length; i++) {
          buildValidationsObj(data.props[i], data.key)
        }
        break
      case 'rte':
        if (data.validation) {
          setValidations((state) => ({
            ...state,
            [`${data.key + parent}`]: data.validation,
          }))
        }
        break
      case 'select':
        if (data.validation) {
          setValidations((state) => ({
            ...state,
            [`${data.key + parent}`]: data.validation,
          }))
        }
        break
      case 'link':
        for (var i = 0; i < data.props?.length; i++) {
          buildValidationsObj(data.props[i], data.key)
        }
        break
      case 'staticList':
        for (var i = 0; i < data.props.length; i++) {
          buildValidationsObj(data.props[i], data.key)
        }
        break
      case 'color':
        if (data.validation) {
          setValidations((state) => ({
            ...state,
            [`${data.key + parent}`]: data.validation,
          }))
        }
        break
      case 'dateTimePicker':
        if (data.validation) {
          setValidations((state) => ({
            ...state,
            [`${data.key + parent}`]: data.validation,
          }))
        }
        break
      default:
        // console.log(`default value!!!`);
        break
    }
  }

  const getData = async () => {
    try {
      let res = await fetch(`/api/smts/${smtsId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      let result = await res.json()
      return result
    } catch (err) {
      console.log(err)
    }
  }

  const getProps = async () => {
    setLoading(true)
    try {
      let res = await fetch(`/api/smts/props`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      let result = await res.json()
      return result
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const buildDataObj = (props) => {
    let obj = {}
    for (let i = 0; i < props.length; i++) {
      switch (props[i].inputType) {
        case 'text':
          if (props[i].languages) {
            for (let j = 0; j < languagesArr.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [languagesArr[j]]: props[i]?.defaultValue?.[languagesArr[j]] || '',
              }
            }
          } else {
            obj[props[i].key] = props[i]?.defaultValue?.['en'] || ''
          }
          break
        case 'staticList':
          obj[props[i].key] = buildDataObj(props[i].props)
          break
        case 'list':
          obj[props[i].key] = []
          break
        case 'array':
          if (props[i].languages) {
            for (let j = 0; j < languagesArr.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [languagesArr[j]]: props[i]?.defaultValue?.map((x) => x.key[languagesArr[j]]) || [],
              }
            }
          } else {
            obj[props[i].key] = props[i]?.defaultValue?.map((x) => x.key['en']) || []
          }

          break
        case 'select':
          if (props[i].languages) {
            for (let j = 0; j < languagesArr.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [languagesArr[j]]: props[i]?.defaultValue?.value?.[languagesArr[j]] || '',
              }
            }
          } else {
            obj[props[i].key] = props[i]?.defaultValue?.value?.['en'] || ''
          }
          break
        case 'multiSelect':
          if (props[i].languages) {
            for (let j = 0; j < languagesArr.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [languagesArr[j]]: props[i]?.defaultValue?.value?.[languagesArr[j]] || [],
              }
            }
          } else {
            obj[props[i].key] = props[i]?.defaultValue?.value?.['en'] || []
          }
          break
        case 'toggle':
          obj[props[i].key] = props[i]?.defaultValue?.['en'] || false
          break
        case 'rte':
          if (props[i].languages) {
            for (let j = 0; j < languagesArr.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [languagesArr[j]]: props[i]?.defaultValue?.[languagesArr[j]] || '',
              }
            }
          } else {
            obj[props[i].key] = props[i]?.defaultValue?.['en'] || ''
          }
          break
        case 'radio':
          if (props[i].languages) {
            for (let j = 0; j < languagesArr.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [languagesArr[j]]: props[i]?.defaultValue?.[languagesArr[j]] || '',
              }
            }
          } else {
            obj[props[i].key] = props[i]?.defaultValue?.['en'] || ''
          }
          break
        case 'keyedInput':
          let demoObj = props[i].type === 'object' ? {} : []
          props[i]?.defaultValue?.forEach((element) => {
            let valueToSet
            if (props[i].languages) {
              let langObj = {}
              for (let i = 0; i < languagesArr.length; i++) {
                langObj[languagesArr[i]] = element?.value?.[languagesArr[i]] || ''
              }
              valueToSet = { [element.key]: langObj }
            } else {
              valueToSet = { [element.key]: element.value['en'] }
            }
            if (props[i].type === 'object') {
              demoObj = { ...demoObj, ...valueToSet }
            } else {
              demoObj.push(valueToSet)
            }
          })

          if (props[i].type === 'object') {
            obj[props[i].key] = demoObj || {}
          } else {
            obj[props[i].key] = demoObj || []
          }
          break
        case 'link':
          if (props[i].languages) {
            for (let j = 0; j < languagesArr.length; j++) {
              obj[props[i].key] = {
                title: {
                  ...obj[props[i].key]?.title,
                  [languagesArr[j]]: props[i]?.defaultValue?.title?.[languagesArr[j]] || '',
                },
                link: {
                  ...obj[props[i].key]?.link,
                  [languagesArr[j]]: props[i]?.defaultValue?.link?.[languagesArr[j]] || '',
                },
                targetBlank: {
                  ...obj[props[i].key]?.targetBlank,
                  [languagesArr[j]]: props[i]?.defaultValue?.targetBlank?.[languagesArr[j]] || false,
                },
              }
            }
          } else {
            obj[props[i].key] = {
              title: props[i]?.defaultValue?.title?.['en'] || '',
              link: props[i]?.defaultValue?.link?.['en'] || '',
              targetBlank: props[i]?.defaultValue?.targetBlank?.['en'] || false,
            }
          }
          break
        case 'color':
          obj[props[i].key] = props[i]?.defaultValue?.['en'] || '#b7b6ab'
          break
        case 'dateTimePicker':
          if (props[i].languages) {
            for (let j = 0; j < languagesArr.length; j++) {
              const dDate = new Date(props[i]?.defaultValue?.[languagesArr[j]])
              obj[props[i].key] = {
                ...obj[props[i].key],
                [languagesArr[j]]: dDate.getTime() != 'NaN' ? dDate.getTime() : '',
              }
            }
          } else {
            const dDate = new Date(props[i]?.defaultValue?.['en'])
            obj[props[i].key] = dDate.getTime() != 'NaN' ? dDate.getTime() : ''
          }
          break
        case 'orderList':
          obj[props[i].key] = []
          break
      }
    }
    return obj
  }

  useEffect(() => {
    let mutex = true
    if (smtsId) {
      if (smtsId === '_new') {
        getProps().then((res) => {
          if (res) {
            if (mutex) {
              setSmtsProps(res)
              setBlockProps(buildDataObj(res))
              const props = [...res]
              for (let i = 0; i < props.length; i++) {
                buildValidationsObj(props[i])
              }
            }
          }
          setLoading(false)
        })
      } else {
        if (smtsId) {
          Promise.all([getProps(), getData()]).then((res) => {
            if (mutex) {
              setSmtsProps(res[0])
              setBlockProps({ ...buildDataObj(res[0]), ...res[1] })
              const props = [...res[0]]
              for (let i = 0; i < props.length; i++) {
                buildValidationsObj(props[i])
              }
            }
            setLoading(false)
          })
        }
      }
    }
    return () => {
      mutex = false
    }
  }, [smtsId])

  const validateForm = (errors) => {
    let valid = true
    Object.values(errors).forEach((val) => val.length > 0 && (valid = false))
    return valid
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true)
    values['user_id'] = clientId
    const today = new Date()
    values['modified'] = today.getTime()

    if (validateForm(errObj)) {
      if (smtsId === '_new') {
        try {
          let res = await fetch(`/api/smts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          })
          let result = await res.json()
          if (result) {
            setLoading(false)
            router.replace('/admin/domains')
          } else {
            console.log('error', result)
          }
          setSubmitting(false)
        } catch (err) {
          console.log('error', err)
          setSubmitting(false)
          setLoading(false)
        }
      } else {
        delete values['_id']
        try {
          setLoading(true)
          let res = await fetch(`/api/smts/${smtsId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          })
          let result = await res.json()
          if (result) {
            router.replace('/admin/domains')
          } else {
            console.log('error', result)
          }
          setLoading(false)
          setSubmitting(false)
        } catch (err) {
          setLoading(false)
          console.log('error', err)
          setSubmitting(false)
        }
      }
    }
  }

  const handleChangeFormValue = (value, form, key) => {
    form.setFieldValue(key, value)
  }

  const handleBlur = (e, key, id, isDatePicker = false) => {
    var value
    if (isDatePicker) {
      value = e
    } else {
      // checking if input component is "RTE"
      if (e.target === undefined) {
        // value if the input component is "RTE"
        value = e.getData()
      } else {
        value = e.target.value
      }
    }
    const condition = validations[key]
    if (condition != undefined) {
      if (condition.hasOwnProperty('required')) {
        if (value.length < 1) {
          setErrObj({ ...errObj, [id]: 'This field is required' })
        } else {
          setErrObj({ ...errObj, [id]: '' })
        }
      } else if (condition.hasOwnProperty('max-length') && condition.hasOwnProperty('min-length')) {
        if (value.length < condition['min-length'] || value.length > condition['max-length']) {
          setErrObj({
            ...errObj,
            [id]: `lenght of the input should be between ${condition['min-length']} to ${condition['max-length']}`,
          })
        } else {
          setErrObj({ ...errObj, [id]: '' })
        }
      } else if (condition.hasOwnProperty('reg-ex')) {
        let regEx = condition['reg-ex']
        if (regEx.test(value)) {
          setErrObj({ ...errObj, [id]: '' })
        } else {
          setErrObj({ ...errObj, [id]: 'Enter valid data' })
        }
      }
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    if (await isConfirmed('Are you to delete')) {
      try {
        setLoading(true)
        let res = await fetch(`/api/smts/${smtsId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })
        let result = await res.json()
        setLoading(false)
        if (result) {
          router.replace('/admin/domains')
        } else {
          console.log('error', result)
        }
      } catch (err) {
        console.log('error', err)
      }
    }
  }

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

  const inputByType = ({
    inputType,
    key,
    label,
    props,
    path = '',
    options,
    help,
    languages,
    type,
    description,
    tabView = false,
    parent = '',
    placeholder,
    defaultValue,
  }) => {
    switch (inputType) {
      case 'text':
        return (
          <TextInput
            type={type}
            languageBased={languages}
            languages={languagesArr}
            componentKey={key}
            path={path}
            label={label}
            description={description}
            language={language}
            errObj={errObj}
            handleBlur={handleBlur}
            handleChangeFormValue={handleChangeFormValue}
            setFocusedField={setFocusedField}
            focusedField={focusedField}
            validations={validations}
            key={`text-${path}-${key}`}
            parent={parent}
            changeLanguage={ChangeLanguage}
            placeholder={placeholder}
            defaultValue={defaultValue}
          />
        )
      case 'dateTimePicker':
        return (
          <DateTimePickerInput
            type={type}
            languageBased={languages}
            languages={languagesArr}
            componentKey={key}
            path={path}
            label={label}
            description={description}
            language={language}
            errObj={errObj}
            handleBlur={handleBlur}
            handleChangeFormValue={handleChangeFormValue}
            validations={validations}
            key={`text-${path}-${key}`}
            parent={parent}
            changeLanguage={ChangeLanguage}
            placeholder={placeholder}
          />
        )
      case 'list':
        return (
          <div
            key={`${path}${key}`}
            className={`px-4 w-full ${tabView ? (visibleRootCategory !== key ? 'hidden' : '') : ''}`}
          >
            <div className="p-4 mb-4 border border-gray-300 border-solid rounded-xl">
              <FieldArray name={`${path}${key}`}>
                {(fieldArrayProps) => {
                  const { push, remove, form } = fieldArrayProps
                  const { value } = form.getFieldProps(`${path}${key}`)
                  let myMap = value || []
                  return (
                    <div>
                      {myMap.map((item, i) => {
                        return (
                          <div
                            className="p-4 mb-4 border border-gray-300 border-solid rounded-xl row-clear no-space"
                            key={i}
                          >
                            <div className="flex flex-wrap items-center pb-2 mb-2 border-b border-black border-dashed sm:flex-nowrap">
                              <h3 className="text-lg font-semibold text-gray-800">{label?.['en'] || key || ''}</h3>
                              <HelpBar value={description?.[language]} />
                              <ClipBoardTool
                                clipBoard={clipBoard}
                                setClipBoard={setClipBoard}
                                handleCopy={handleCopy}
                                handleCut={handleCut}
                                handlePaste={handlePaste}
                                inputType={inputType}
                                objectKey={key}
                                objectPath={`${path}${key}[${i}]`}
                                remove={remove}
                              />
                              <div className="sm:pl-4">
                                <Button
                                  variant="danger"
                                  onClick={(e) => {
                                    remove(i)
                                    e.stopPropagation()
                                  }}
                                >
                                  Delete
                                  {label?.['en'] || key || ''}
                                  <img
                                    className="inline-block px-2"
                                    src="/images/langaugedelete.svg"
                                    alt="Langauge Delete"
                                  />
                                </Button>
                              </div>
                              <div className="ml-auto cursor-pointer" onClick={() => handleAccordion(path, key, i)}>
                                <img
                                  className={`inline-block  px-2 ${
                                    accordion[`${path}${key}[${i}]`] && 'transform rotate-180'
                                  }`}
                                  src="/images/select-list.svg"
                                  alt="Status"
                                />
                              </div>
                            </div>
                            <div className="prop-list">
                              {accordion[`${path}${key}[${i}]`] &&
                                props.map((p, ii) => {
                                  return (
                                    <div key={ii}>
                                      {inputByType({
                                        inputType: p.inputType,
                                        key: p.key,
                                        parent: `${key}`,
                                        label: p.label,
                                        description: p?.description,
                                        props: p.props,
                                        options: p.options ? p.options : null,
                                        help: p.help ? p.help : null,
                                        path: `${path}${key}[${i}].`,
                                        languages: p.languages ? true : false,
                                        type: p.type,
                                        placeholder: p?.placeholder,
                                        defaultValue: p?.defaultValue,
                                      })}
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        )
                      })}

                      <Button
                        variant="primary"
                        onClick={() => {
                          let val = buildDataObj(props)
                          push(val)
                        }}
                      >
                        add {label?.['en'] || key || ''}
                        <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                      </Button>
                    </div>
                  )
                }}
              </FieldArray>
            </div>
          </div>
        )
      case 'staticList':
        return (
          <div
            key={`${path}${key}`}
            className={`px-4 w-full ${tabView ? (visibleRootCategory !== key ? 'hidden' : '') : ''}`}
          >
            <div className="w-full p-4 my-4 border border-gray-300 border-solid rounded-xl row-clear ">
              <div className="flex items-center pb-2 mb-2 border-b border-black border-dashed">
                <h3 className="text-lg font-semibold text-gray-800">{label?.['en'] || key || ''}</h3>
                <HelpBar value={description?.['en']} />
                <ClipBoardTool
                  clipBoard={clipBoard}
                  setClipBoard={setClipBoard}
                  handleCopy={handleCopy}
                  handleCut={handleCut}
                  handlePaste={handlePaste}
                  inputType={inputType}
                  objectKey={key}
                  objectPath={`${path}${key}`}
                  remove={null}
                />
                <div className="ml-auto cursor-pointer" onClick={() => handleAccordion(path, key)}>
                  <img
                    className={`inline-block  px-2 ${accordion[`${path}${key}`] && 'transform rotate-180'}`}
                    src="/images/select-list.svg"
                    alt="Status"
                  />
                </div>
              </div>
              {key === 'styles' && widgetList.length > 0 && (
                <div style={{ marginLeft: '15px' }}>
                  <span className="w-56 mb-4 mr-10">
                    <h2>import style</h2>
                    <Select
                      onChange={(e) => {
                        getWidgetStyle(e, path, key)
                      }}
                      value={widgetId}
                    >
                      <option value=""></option>
                      {widgetList.map((item, index) => (
                        <option key={index} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  </span>
                </div>
              )}

              <div className="prop-list">
                {accordion[`${path}${key}`] &&
                  props.map((p, ii) => {
                    return (
                      <div key={ii}>
                        {inputByType({
                          inputType: p.inputType,
                          key: p.key,
                          parent: `${key}`,
                          label: p.label,
                          props: p.props,
                          options: p.options ? p.options : [],
                          help: p.help ? p.help : null,
                          path: `${path}${key}.`,
                          languages: p.languages ? true : false,
                          type: p.type,
                          placeholder: p?.placeholder,
                          defaultValue: p?.defaultValue,
                          description: p?.description,
                        })}
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )
      case 'array':
        return (
          <ArrayInput
            languages={languagesArr}
            language={language}
            type={type}
            path={path}
            componentKey={key}
            label={label}
            languageBased={languages}
            changeLanguage={ChangeLanguage}
            handleChangeFormValue={handleChangeFormValue}
            handleBlur={handleBlur}
            validations={validations}
            errObj={errObj}
            description={description}
            parent={parent}
            key={`Ai-${path}-${key}`}
            placeholder={placeholder}
          />
        )
      case 'select':
        return (
          <SelectInput
            languages={languagesArr}
            language={language}
            path={path}
            componentKey={key}
            label={label}
            languageBased={languages}
            changeLanguage={ChangeLanguage}
            errObj={errObj}
            handleChangeFormValue={handleChangeFormValue}
            handleBlur={handleBlur}
            validations={validations}
            parent={parent}
            key={`si-${path}-${key}`}
            options={options}
            description={description}
            placeholder={placeholder}
          />
        )
      case 'multiSelect':
        return (
          <MultiSelect
            languages={languagesArr}
            language={language}
            path={path}
            componentKey={key}
            label={label}
            languageBased={languages}
            changeLanguage={ChangeLanguage}
            errObj={errObj}
            handleChangeFormValue={handleChangeFormValue}
            handleBlur={handleBlur}
            validations={validations}
            parent={parent}
            key={`si-${path}-${key}`}
            options={options}
            description={description}
            defaultValue={defaultValue}
            placeholder={placeholder}
            formEl={formEl}
          />
        )
      case 'orderList':
        return (
          <div className="flex flex-wrap" key={`${path}${key}`}>
            <div className="w-full px-4 mb-3 lg:w-1/2 lg:mb-0">
              <div className="inline-block">
                <div className="flex mb-2">
                  <h2 className="inline-block ml-2">{label?.['en'] || key || ''}</h2>
                  <HelpBar value={description?.['en']} />
                </div>
                <Field name={`${path}${key}`}>
                  {({ field, form }) => {
                    const val = form.getFieldProps(`${path}${key}`)?.value || []
                    let result = []
                    val &&
                      val.forEach(function (key) {
                        var found = false
                        options.filter(function (item) {
                          if (!found && item.value == key) {
                            result.push(item)
                            found = true
                            return false
                          } else return true
                        })
                      })
                    return (
                      <OrderList
                        values={result.length > 0 ? result : options}
                        onChange={(data) => {
                          form.setFieldValue(`${path}${key}`, data)
                        }}
                      />
                    )
                  }}
                </Field>
              </div>
            </div>
          </div>
        )
      case 'toggle':
        return (
          <ToggleInput
            language={language}
            path={path}
            componentKey={key}
            label={label}
            errObj={errObj}
            handleChangeFormValue={handleChangeFormValue}
            description={description}
            validations={validations}
            parent={parent}
          />
        )
      case 'rte':
        if (languages === true || languages === 'true') {
          return (
            <div className="w-full px-4" key={`${path}${key}`}>
              <div className="">
                <ul className="flex-wrap hidden w-full gap-4 px-1 pt-2 ml-2 lg:inline-flex">
                  {languagesArr.map((langag, i) => {
                    return (
                      <li
                        className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border-r border-l border-t ${
                          langag === language ? 'after:bg-primary-400' : 'after:bg-transparent'
                        } rounded`}
                        key={`${path}${key}` + langag + i}
                        onClick={(e) => ChangeLanguage(e, langag)}
                      >
                        <span className="px-16">{langag.toUpperCase()}</span>
                      </li>
                    )
                  })}
                </ul>

                <div className="p-4 border border-gray-400 rounded-xl">
                  <div>
                    <h3 className="inline-block">{label?.[language] || key || ''}</h3>
                    <HelpBar value={description?.[language]} />
                  </div>

                  <Field name={`${path}${key}.${language}`}>
                    {({ field, form }) => {
                      const value = field.value
                      return (
                        <div className="m-3">
                          <RTE
                            {...field}
                            path={`${path}${key}.${language}`}
                            handlePropsChange={form.setFieldValue}
                            form={form}
                            value={value ? value : ''}
                            parent={parent}
                            keyValue={key}
                            handleBlur={handleBlur}
                            placeholder={placeholder?.[language]}
                          />
                        </div>
                      )
                    }}
                  </Field>
                  {/* for showing error if user enters invalid data */}
                  <p className="mx-3 my-1 text-red-700">{errObj[`${path}${key}.${language}`]}</p>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className="w-full px-4" key={`${path}${key}`}>
              <div className="p-4 border border-solid rounded-xl">
                <div className="flex">
                  <h3>{label?.[language] || key || ''}</h3>
                  <HelpBar value={description?.['en']} />
                </div>

                <Field name={`${path}${key}`}>
                  {({ field, form }) => {
                    const value = field.value
                    return (
                      <div className="m-3">
                        <RTE
                          {...field}
                          path={`${path}${key}`}
                          handlePropsChange={form.setFieldValue}
                          value={value ? value : ''}
                          parent={parent}
                          keyValue={key}
                          handleBlur={handleBlur}
                          placeholder={placeholder?.['en']}
                          form={form}
                        />
                      </div>
                    )
                  }}
                </Field>
                {/* for showing error if user enters invalid data */}
                <p className="mx-3 my-1 text-red-700">{errObj[`${path}${key}`]}</p>
              </div>
            </div>
          )
        }
      case 'radio':
        return (
          <RadioInput
            languages={languagesArr}
            language={language}
            path={path}
            componentKey={key}
            label={label}
            languageBased={languages}
            changeLanguage={ChangeLanguage}
            options={options}
            key={`ri-${path}-${key}`}
            description={description}
            defaultValue={defaultValue}
          />
        )
      case 'keyedInput':
        return (
          <KeyedInput
            language={language}
            type={type}
            path={path}
            languageBased={languages}
            componentKey={key}
            label={label}
            languages={languagesArr}
            changeLanguage={ChangeLanguage}
            key={`ki-${path}-${key}`}
            description={description}
            placeholder={placeholder}
          />
        )
      case 'link':
        return (
          <LinkInput
            languages={languagesArr}
            language={language}
            path={path}
            componentKey={key}
            label={label}
            languageBased={languages}
            changeLanguage={ChangeLanguage}
            handleChangeFormValue={handleChangeFormValue}
            key={`LI-${path}-${key}`}
            description={description}
            placeholder={placeholder}
          />
        )
      case 'color':
        return (
          <ColorInput
            path={path}
            componentKey={key}
            label={label}
            errObj={errObj}
            handleChangeFormValue={handleChangeFormValue}
            description={description}
            validations={validations}
            parent={parent}
            type={type}
            handleBlur={handleBlur}
            placeholder={placeholder}
          />
        )
    }
  }

  let mainProps = [...smtsProps]

  let tabViewProps = mainProps.filter((item) => {
    if (item.tabView === true) return item
  })

  mainProps = mainProps.filter((item) => {
    if (item.tabView !== true) return item
  })

  const props = mainProps.reduce(
    (acc, { type, inputType, key, description, label, placeholder, defaultValue, validation, props, ...rest }) => {
      acc.push([])
      const path = ''
      acc[acc.length - 1].push(
        inputByType({
          inputType,
          key,
          label,
          props,
          path: path,
          options: rest.options ? rest.options : null,
          help: rest.help ? rest.help : null,
          languages: rest.languages ? true : false,
          type: type,
          description: description,
          placeholder: placeholder,
          defaultValue: defaultValue,
        }),
      )
      return acc
    },
    [],
  )

  const tabView = tabViewProps.reduce(
    (
      acc,
      { type, inputType, key, description, placeholder, defaultValue, label, validation, props, tabView, ...rest },
    ) => {
      acc.push([])
      const path = ''
      acc[acc.length - 1].push(
        inputByType({
          inputType,
          key,
          label,
          props,
          path: path,
          options: rest.options ? rest.options : null,
          help: rest.help ? rest.help : null,
          languages: rest.languages ? true : false,
          type: type,
          description: description,
          placeholder: placeholder,
          defaultValue: defaultValue,
          tabView,
        }),
      )
      return acc
    },
    [],
  )

  if (tabViewProps.length > 0 && !visibleRootCategory) setVisibleRootCategory(tabViewProps[0].key)

  function handleKeyDown(e) {
    if ((e.charCode || e.keyCode) === 13) {
      e.preventDefault()
    }
  }

  return (
    <>
      {Object.entries(blockProps).length !== 0 && blockProps.constructor === Object ? (
        <div className="mt-8">
          <div className="top-space sorting"></div>
          <div className="flex flex-col items-center">
            <Formik initialValues={blockProps} onSubmit={handleSubmit} enableReinitialize innerRef={formEl}>
              <Form onKeyDown={handleKeyDown} className="w-full">
                <div className="pt-2 text-left bg-white border border-gray-300 rounded-lg shadow-lg">
                  {props}
                  {/* tabview starts*/}
                  {tabView.length > 0 && (
                    <div className="m-4">
                      <ul className="hidden w-full gap-4 px-1 pt-2 ml-2 lg:inline-flex">
                        {tabViewProps.map((item, index) => (
                          <li
                            className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border-r border-l border-t ${
                              visibleRootCategory === item.key ? 'after:bg-primary-400' : 'after:bg-transparent'
                            }`}
                            key={index}
                            onClick={() => setVisibleRootCategory(item.key)}
                          >
                            <span className="px-8">{item.label['en']}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-4 border border-gray-300 border-solid rounded-xl">
                        {tabView.map((p, idx) => (
                          <div key={idx} className="flex flex-wrap text-left">
                            {p.map((pRow) => pRow)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* tabView ends */}
                </div>
              </Form>
            </Formik>
          </div>
          <div className="fixed flex flex-col w-40 right-4 bottom-36">
            <Button
              onClick={() => {
                formEl.current.submitForm()
              }}
              type="submit"
              className="px-10 m-2 bg-white"
              variant="primary"
              color="secondary"
            >
              {smtsId === '_new' ? 'Submit' : 'Update'}
            </Button>
            {smtsId !== '_new' && (
              <Button type="button" className="px-10 m-2 bg-white" variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}

export default EditSmts

export async function getServerSideProps(context) {
  return Authenticate(context)
}
