import React, { useState, useEffect, useRef, useContext, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'
import { updateItemInArr } from '../lib/utils'
import { constants } from '../lib/common'
import { Formik, Field, Form, FieldArray } from 'formik'
import { useRouter } from 'next/router'
import VmtsView from './vmtsView'
import ClipBoardTool from './tool/clipBoardTool'
import { isEqual } from '../lib/utils'
import { TextInput, RadioInput, DateTimePickerInput, ColorInput, ToggleInput } from './form'
import { Input, Button, Select } from './componentLibrary'
import { request, gql } from 'graphql-request'
import useConfirm from './dialog/useConfirm'
import { AppContext } from '../context/appContext'
import ImageUploadList from '../components/imageUploadList'
import ImageSelectionList from '../components/imageSelectionList'
import PdfController from '../components/pdfController'
import { WidgetView } from '../components/shared/widgetView/index'
import HelpBar from './tool/helpBar'

const RTE = dynamic(() => import('./shared/rte.js'), {
  ssr: false,
})

const EditComponent = ({
  component,
  availableComponents,
  handleClose,
  pages,
  setPages,
  selectedPage,
  setSelectedPage,
  componentType,
  contentId,
  isWidgetEdit,
  setSaveDirty,
  saveDirty,
  isHeaderSave,
  saveParent,
  updatedDate,
  ogComponent,
  setIsUndo,
  deleteProduct,
  isNew,
  setIsNew,
  childRef,
  setIsDemoView,
  isDemoView,
}) => {
  const [componentData, setComponentData] = useState(component)
  const [ogComponentData, setOgComponentData] = useState(ogComponent)
  const [language, setLanguage] = useState(0)
  const [languages, setLanguages] = useState(0)
  const layoutComponent = componentType === 'layout'
  const [widgetList, setWidgetList] = useState([])
  const [widgetId, setWidgetId] = useState('')
  const [lang, setLang] = useState(
    layoutComponent && layoutComponent.componentData && layoutComponent.componentData['languages']
      ? layoutComponent.componentData['languages']
      : componentData && componentData['languages']
      ? componentData['languages']
      : ['de', 'it', 'en'],
  )
  const [defaultLanguage, setDefaultLanguage] = useState(lang ? lang[0] : 'en')
  const [addLanguage, setAddLanguage] = useState()
  const [formValues, setFormValues] = useState({})
  const [focusedField, setFocusedField] = useState({})
  const [propList, setPropList] = useState({})
  const [isImageUpload, setIsImageUpload] = useState(false)
  const { isConfirmed } = useConfirm()

  // object to store validation conditions
  const [validations, setValidations] = useState({})
  //object for showiing errors
  const [errObj, setErrObj] = useState({})
  // clipboard for cut, copy and paste data of list and sattic list to another list and sattic.
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

  // image upload states start
  const [images, setImages] = useState({ status: '', images: [] })
  const [previews, setPreviews] = useState([])
  const [uploadFrom, setUploadFrom] = useState('local')
  const [kognitiveImages, setKognitiveImages] = useState([])
  const [selectedImages, setSelectedImages] = useState([])
  const [showKognitiveImages, setShowKognitiveImages] = useState([])
  const [loadingKognitiveImages, setLoadingKognitiveImages] = useState(false)
  const [swapImage, setSwapImage] = useState({})
  const [openImageSelectModal, setOpenImageSelectModal] = useState(false)
  const [clientImages, setClientImages] = useState([])
  const [imageKey, setImageKey] = useState('')
  const [controlSelectedImages, setControlSelectedImages] = useState([])
  const [refreshGrid, setRefreshGrid] = useState(0)
  const [openPdfSelectionModal, setOpenPdfSelectionModal] = useState(false)
  const [currentPdfKey, setCurrentPdfKey] = useState('')

  //const workerPath = 'https://worker.mts-online.com'
  const workerPath = 'http://10.10.10.119:3004'

  // image upload states ends

  const [accordion, setAccordion] = useState({})
  // for the current visiblec category in tab view
  const [visibleRootCategory, setVisibleRootCategory] = useState('')

  const [, , setLoading] = useContext(AppContext)

  /**
   * @param formEl reference of formik form element
   */
  const formEl = useRef(null)
  const router = useRouter()
  const { clientId, productName, domainId } = router.query
  const { version } = componentData

  const [attributes, setAttributes] = useState(
    (componentData?.attributes || []).reduce((obj, item) => Object.assign(obj, { [item]: '' }), {}),
  )

  useImperativeHandle(
    childRef,
    () => ({
      handleDelete() {
        if (component && componentData) {
          const str = 'Are you sure to delete component ' + componentData.name || ''
          isConfirmed(str).then((canDelete) => {
            if (canDelete) {
              deleteProduct()
            }
          })
        }
      },
    }),
    [],
  )

  useEffect(() => {
    setLanguage(languages[0])
  }, [languages])

  useEffect(() => {
    compareComponentData()
  }, [lang])

  useEffect(() => {
    if (updatedDate) {
      setOgComponentData(ogComponent)
      setComponentData(component)
      if (component?.languages) {
        setLang(component.languages)
      }
      if (formEl.current?.values && component?.blockProps) {
        formEl.current.setValues({ ...component.blockProps })
        compareComponentData(false)
      } else {
        compareComponentData()
      }
    }
  }, [updatedDate])

  useEffect(() => {
    if (imageKey) {
      formEl.current.setFieldValue(imageKey, controlSelectedImages)
      setTimeout(() => {
        compareComponentData()
      }, 1000)
    }
  }, [controlSelectedImages])

  useEffect(() => {
    if (refreshGrid != 0) {
      compareComponentData()
    }
  }, [refreshGrid])

  useEffect(async () => {
    try {
      const res = await fetch(`${workerPath}/api/images/get/${clientId}`, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await res.json()
      if (result.success) {
        setClientImages(result.images)
      }
    } catch (err) {
      console.log(err.message)
    }
  }, [clientId])

  useEffect(() => {
    if (isHeaderSave && isHeaderSave != 0) {
      formEl.current.submitForm()
    }
  }, [isHeaderSave])

  useEffect(async () => {
    if (!component.blockProps && constants.autoFillWidget == component.module) {
      setIsNew(true)
      const confirmData = await isConfirmed('Do you want to set default template')
      if (confirmData) {
        handleConfirmDialogConfirm()
      }
    }
  }, [])

  useEffect(async () => {
    if (contentId) {
      const res = await fetch('/api/products/components?componentId=' + componentData._id + '&contentId=' + contentId, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.status === 200) {
        const jsonRes = await res.json()
        if (jsonRes.components) {
          setWidgetList(jsonRes.components)
        }
      }
    }
  }, [contentId])

  /**
   * @function buildValidationsObj is a recursive function that stores validations conditions in "validations state object".
   *
   * @param data (object) input component data
   *
   * @param parent (string) parent of the current input component
   */
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
  //function for handling user input validation
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
    compareComponentData()
    setIsUndo ? setIsUndo(false) : ''
  }

  // this function checks if there is an user input errors in form. And returns "true"
  // if the entered data is valid whille submiting the form.
  const validateForm = (errors) => {
    let valid = true
    Object.values(errors).forEach((val) => val.length > 0 && (valid = false))
    return valid
  }

  /**
   * @function buildDataObj this recursive function creates empty values object for the given props array.
   *
   * @param props (array of objects) array of props
   *
   * @param isSetValue (boolean) optional parameter for aading default values purpose.
   *
   * @returns empty values object for the given props array
   */

  const buildDataObj = (props, isSetValue = false) => {
    let obj = {}
    for (let i = 0; i < props.length; i++) {
      switch (props[i].inputType) {
        case 'text':
          if (props[i].languages) {
            for (let j = 0; j < lang.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [lang[j]]: props[i]?.defaultValue?.[lang[j]] || '',
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
          if (isSetValue == true) {
            obj[props[i].key] = [buildDataObj(props[i].props, isSetValue)]
          } else {
            obj[props[i].key] = []
          }
          break
        case 'array':
          if (props[i].languages) {
            for (let j = 0; j < lang.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [lang[j]]: props[i]?.defaultValue?.map((x) => x.key[lang[j]]) || [],
              }
            }
          } else {
            obj[props[i].key] = props[i]?.defaultValue?.map((x) => x.key['en']) || []
          }
          break
        case 'select':
          if (props[i].languages) {
            for (let j = 0; j < lang.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [lang[j]]: props[i]?.defaultValue?.value?.[lang[j]] || '',
              }
            }
          } else {
            obj[props[i].key] = props[i]?.defaultValue?.value?.['en'] || ''
          }
          break
        case 'toggle':
          obj[props[i].key] = props[i]?.defaultValue?.['en'] || false
          break
        case 'rte':
          if (props[i].languages) {
            for (let j = 0; j < lang.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [lang[j]]: props[i]?.defaultValue?.[lang[j]] || '',
              }
            }
          } else {
            obj[props[i].key] = props[i]?.defaultValue?.['en'] || ''
          }
          break
        case 'radio':
          if (props[i].languages) {
            for (let j = 0; j < lang.length; j++) {
              obj[props[i].key] = {
                ...obj[props[i].key],
                [lang[j]]: props[i]?.defaultValue?.[lang[j]] || '',
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
              for (let i = 0; i < lang.length; i++) {
                langObj[lang[i]] = element?.value?.[lang[i]] || ''
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
            for (let j = 0; j < lang.length; j++) {
              obj[props[i].key] = {
                title: { ...obj[props[i].key]?.title, [lang[j]]: props[i]?.defaultValue?.title?.[lang[j]] || '' },
                link: { ...obj[props[i].key]?.link, [lang[j]]: props[i]?.defaultValue?.link?.[lang[j]] || '' },
                targetBlank: {
                  ...obj[props[i].key]?.targetBlank,
                  [lang[j]]: props[i]?.defaultValue?.targetBlank?.[lang[j]] || false,
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
        case 'flipBookPdf':
          for (let j = 0; j < lang.length; j++) {
            obj[props[i].key] = {
              ...obj[props[i].key],
              [lang[j]]: [],
            }
          }
          break
        case 'imageUpload':
          obj[props[i].key] = []
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
      }
    }
    return obj
  }

  /**
   * @function buildNestedProps this recursive fuction creates props for nested list level like (category inside category)
   *
   * @param props (array of objects) array of props
   *
   * @returns new props array with nested list props.
   */
  const buildNestedProps = (props) => {
    let arr = []
    for (let i = 0; i < props.length; i++) {
      var prop = props[i]
      switch (prop.inputType) {
        case 'text':
          arr.push(prop)
          break
        case 'staticList':
          arr.push(prop)
          break
        case 'list':
          if (prop.nested) {
            if (prop.maxNesting > 0) {
              var temp = JSON.parse(JSON.stringify(prop))
              var temp2 = JSON.parse(JSON.stringify(prop))
              temp.maxNesting -= 1
              temp2.maxNesting = temp.maxNesting
              if (temp2.maxNesting > 0) {
                temp.props.push(temp2)
                temp.props = buildNestedProps(temp.props)
              }
              temp.nested = false
              arr.push(temp)
              break
            } else {
              prop.nested = false
              arr.push(prop)
              break
            }
          } else {
            arr.push(prop)
            break
          }
        case 'array':
          arr.push(prop)
          break
        case 'select':
          arr.push(prop)
          break
        case 'toggle':
          arr.push(prop)
          break
        case 'rte':
          arr.push(prop)
          break
        case 'radio':
          arr.push(prop)
          break
        case 'keyedInput':
          arr.push(prop)
          break
        case 'link':
          arr.push(prop)
          break
        case 'color':
          arr.push(prop)
          break
        case 'flipBookPdf':
          arr.push(prop)
          break
        case 'imageUpload':
          arr.push(prop)
          break
      }
    }
    return arr
  }

  useEffect(() => {
    pages && setLanguages(pages.map((p) => p.name))
  }, [pages])

  useEffect(() => {
    const availableComponent = availableComponents.find(
      (ac) => ac.module === componentData.module && ac.module !== undefined,
    )
    const editProps = componentData.props || availableComponent?.props
    const udata = editProps
    for (let i = 0; i < udata.length; i++) {
      buildValidationsObj(udata[i])
    }
    if (Object.keys(propList).length == 0 && !component.blockProps) {
      setPropList(buildDataObj(udata, true))
    }
    const dataObj = buildDataObj(udata)

    if (componentData.blockProps) {
      let newBlockProps
      if (componentData.blockProps.home) {
        newBlockProps = { ...componentData.blockProps.home }
        newBlockProps = { ...dataObj, ...newBlockProps }
      } else {
        newBlockProps = { ...componentData.blockProps }
        newBlockProps = { ...dataObj, ...newBlockProps }
      }
      setFormValues(newBlockProps)
    } else {
      setFormValues(dataObj)
    }
  }, [componentData.props])

  const compareAndRemoveProperty = (propertyObj, valueObj) => {
    for (const property in valueObj) {
      if (propertyObj && !propertyObj.hasOwnProperty(`${property}`)) {
        delete valueObj[`${property}`]
      } else if (propertyObj && Array.isArray(valueObj[property])) {
        let propertyObjN = propertyObj[property][0]
        let valueObjN = valueObj[property][0]
        compareAndRemoveProperty(propertyObjN, valueObjN)
      } else if (propertyObj && typeof valueObj[property] == 'object') {
        let propertyObjN = propertyObj[property]
        let valueObjN = valueObj[property]
        compareAndRemoveProperty(propertyObjN, valueObjN)
      }
    }
  }

  const handleConfirmDialogConfirm = async () => {
    if (!component.blockProps) {
      const res = await fetch('/api/products/content', {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.status === 200) {
        const jsonRes = await res.json()
        if (jsonRes.defaultContent) {
          compareAndRemoveProperty(propList, jsonRes.defaultContent.blockProps)
          jsonRes.defaultContent.props = [...componentData.props]
          jsonRes.defaultContent.category = { ...componentData.category }
          jsonRes.defaultContent.module = componentData.module
          jsonRes.defaultContent.name = componentData.name
          jsonRes.defaultContent.slot = componentData.slot
          jsonRes.defaultContent.type = componentData.type
          jsonRes.defaultContent.version = componentData.version
          jsonRes.defaultContent._id = component._id
          jsonRes.defaultContent.isDefault = false
          setComponentData(jsonRes.defaultContent)
          if (jsonRes.defaultContent.languages) {
            setLang(jsonRes.defaultContent.languages)
          }
        } else {
          isConfirmed('There is no default template available', true)
        }
      }
    }
  }

  const getWidgetStyle = async (e, path, key) => {
    if (e.target.value) {
      const isComponent = widgetList.find((x) => x._id == e.target.value).isComponent
      const res = await fetch(
        '/api/products/styles?componentId=' +
          e.target.value +
          '&contentId=' +
          contentId +
          '&isComponent=' +
          isComponent,
        {
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
        },
      )
      if (res.status === 200) {
        const jsonRes = await res.json()
        const data = component.props.filter((x) => x.key === 'styles')

        data[0].props.forEach((element) => {
          if (jsonRes.dafaultStyle && jsonRes.dafaultStyle[element.key]) {
            formEl.current.setFieldValue(`${path}${key}.${element.key}`, jsonRes.dafaultStyle[element.key])
          }
        })
      }
      setWidgetId(e.target.value)
    }
  }

  const handleChange = (key) => (e) => {
    if (key === 'addLanguage') {
      setAddLanguage(e.target.value)
    } else {
      setComponentData((state) => ({ ...state, [key]: e.target.value }))
      setIsUndo ? setIsUndo(false) : ''
    }
  }
  const handleLanguages = (key) => (e) => {
    if (addLanguage && addLanguage !== '') {
      var tempLang = [...lang]
      const found = tempLang.findIndex((element) => element === addLanguage)
      if (found == -1) {
        tempLang.push(addLanguage.toLowerCase())
        setLang(tempLang)
      }
      setAddLanguage('')
    }
  }
  const toggleHandler = (key) => (e) => {
    setComponentData((state) => ({ ...state, [key]: e.target.checked }))
  }
  const handleDeleteLanguages = (key, e) => {
    e.preventDefault()
    var languageArry = [...lang]
    const langIndex = languageArry.findIndex((x) => x === key)
    if (langIndex > -1) {
      languageArry.splice(langIndex, 1)
    }
    setLang(languageArry)
  }

  // to swap the position of uploaded images.
  const handleSwapImage = (e, eventName, image, path) => {
    if (eventName === 'start') {
      setSwapImage(image)
    } else {
      if (swapImage.name) {
        let imagesArr = formEl.current.getFieldProps(path).value
        let firstIndex = imagesArr.indexOf(swapImage)
        let secondIndex = imagesArr.indexOf(image)
        let firstImage = imagesArr[firstIndex]
        let secondImage = image
        imagesArr[firstIndex] = secondImage
        imagesArr[secondIndex] = firstImage
        setSwapImage({})
      } else {
        setSwapImage({})
      }
    }
  }

  // query to get pictures from kogniiv.
  const query = gql`
    query($config: JSON!, $language: String!, $provider: String!) {
      # ****** For cm ******
      cm(config: $config, language: $language, provider: $provider) {
        # ****** For images ******
        pictures(topics: "") {
          width
          height
          size
          topic {
            title
            code
          }
          title
          url
        }
      }
    }
  `
  const variables = {
    language: 'it',
    provider: 'kognitiv',
  }

  useEffect(async () => {
    const url = `https://u.mts-online.com/api/graphql/cm/${clientId}/1`
    setLoadingKognitiveImages(true)
    try {
      const result = await request(url, query, variables)
      if (result.cm.pictures?.length > 0) {
        let imgs = result.cm.pictures
        let images = imgs.map((image) => image.url)
        let newUrls = []
        const showUrl =
          'https://res.cloudinary.com/seekda/image/upload/if_ar_gte_16:9,w_220,h_150,c_limit/if_ar_gte_9:16_and_ar_lt_16:9,w_220,h_150,c_limit/if_ar_lt_9:16,w_1080,h_3888,c_limit/f_auto,fl_lossy,q_auto/production'

        for (let i = 0; i < images.length; i++) {
          let str = images[i].replace('https://images.seekda.net', showUrl)
          newUrls.push(str)
        }

        setKognitiveImages(newUrls)
        setShowKognitiveImages(newUrls.slice(0, 10))
        setLoadingKognitiveImages(false)
      } else {
        setKognitiveImages([])
        setLoadingKognitiveImages(false)
      }
    } catch (err) {
      console.log(err.message)
      setLoadingKognitiveImages(false)
    }
  }, [clientId])

  // handle imageUplload ends

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

  const handleSubmit = async (values, { setSubmitting }) => {
    // checking if entered data is valid.
    if (validateForm(errObj)) {
      componentData.updatedDate = new Date()
      let newData = { ...componentData }

      newData['languages'] = lang
      newData['blockProps'] = { ...values }
      const updatedItem = layoutComponent
        ? {
            ...selectedPage,
            layout: {
              ...selectedPage?.layout,
              components: selectedPage?.layout?.components
                ? component?._id && component?._id !== '000'
                  ? [
                      ...selectedPage.layout.components.reduce((acc, c, i) => {
                        return c._id === component._id ? [...acc, newData] : [...acc, c]
                      }, []),
                    ]
                  : [...selectedPage.layout.components, newData]
                : [newData],
            },
          }
        : {
            ...selectedPage,
            components: selectedPage?.components
              ? component?._id && component?._id !== '000'
                ? selectedPage.components.reduce((acc, d, i) => {
                    return d._id === component._id ? [...acc, newData] : [...acc, d]
                  }, [])
                : [...selectedPage.components, newData]
              : [newData],
          }
      setPages((state) => {
        return updateItemInArr(state, updatedItem, '_id', 'pages')
      })
      setSelectedPage(updatedItem)
      if (isWidgetEdit) saveParent(updatedItem)
      if (handleClose) {
        handleClose()
      }
    }
    setSubmitting(false)
  }

  const changeLanguage = async (e, language) => {
    e.preventDefault()
    setDefaultLanguage(language)
  }

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

  const handleChangeFormValue = (value, form, key) => {
    form.setFieldValue(key, value)
    setTimeout(() => {
      compareComponentData()
    }, 1)
    setIsUndo ? setIsUndo(false) : ''
  }

  /**
   * @function inputByType : this recursive function generates different input components by input types like
   * text, select, list, staticList etc..
   *
   * @param inputType (string) to define what kind of input component should be generated.
   *
   * @param key (string) to store key of the inputComponent.
   *
   * @param description (string) description for the input comopnent, used to give placeholder for the input component
   *
   * @param label (string) label for the input component
   *
   * @param props (array) props for the component list or staticList.
   *
   * @param path (string) it generates unique path for each input component.
   *
   * @param options (array) options for select or radio component.
   *
   * @param languages (boolean) if component is language based or not.
   *
   * @param parent (string) parent of the current input component.
   *
   * @param type (string) type of the value like text, number, boolean.
   *
   * @param tabView (boolean) to show root list or staticList in tabView.
   *
   * @return array of inputComponents according to given props.
   */

  const inputByType = ({
    inputType,
    key,
    description,
    label,
    props,
    path = '',
    options,
    languages,
    parent = '',
    type,
    tabView = false,
    placeholder,
  }) => {
    switch (inputType) {
      case 'text':
        return (
          <TextInput
            type={type}
            languageBased={languages}
            languages={lang}
            componentKey={key}
            path={path}
            label={label}
            description={description}
            language={defaultLanguage}
            errObj={errObj}
            handleBlur={handleBlur}
            handleChangeFormValue={handleChangeFormValue}
            setFocusedField={setFocusedField}
            focusedField={focusedField}
            validations={validations}
            key={`text-${path}-${key}`}
            parent={parent}
            changeLanguage={changeLanguage}
            placeholder={placeholder}
          />
        )
      case 'toggle':
        return (
          <ToggleInput
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
            <div className="w-full px-4 my-4" key={`${path}${key}`}>
              <div>
                <ul className="inline-flex flex-wrap w-full px-1 pt-2">
                  {lang.map((langag, i) => {
                    return (
                      <li
                        className={`bg-white mx-4 cursor-pointer text-gray-800 font-semibold py-2 border-l border-r ${
                          langag === defaultLanguage ? 'selected__class' : 'border-t'
                        } rounded`}
                        key={`${path}${key}` + langag + i}
                        onClick={(e) => changeLanguage(e, langag)}
                      >
                        <span className="px-4 lg:px-16 md:px-8">{langag.toUpperCase()}</span>
                      </li>
                    )
                  })}
                </ul>

                <div className="p-4 border border-gray-400 rounded-xl">
                  <div className="flex">
                    <h3>{label?.[defaultLanguage] || key || ''}</h3>
                    <HelpBar value={description?.[defaultLanguage]} />
                  </div>
                  <Field name={`${path}${key}.${defaultLanguage}`}>
                    {({ field, form }) => {
                      const value = field.value
                      return (
                        <div className="m-3">
                          <RTE
                            {...field}
                            path={`${path}${key}.${defaultLanguage}`}
                            handlePropsChange={form.setFieldValue}
                            form={form}
                            value={value ? value : ''}
                            parent={parent}
                            keyValue={key}
                            handleBlur={handleBlur}
                            placeholder={placeholder?.[defaultLanguage]}
                          />
                        </div>
                      )
                    }}
                  </Field>
                  {/* for showing error if user enters invalid data */}
                  <p className="mx-3 my-1 text-red-700">{errObj[`${path}${key}.${defaultLanguage}`]}</p>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className="w-full px-4" key={`${path}${key}`}>
              <div className="p-4 border border-solid rounded-xl">
                <div className="flex">
                  <h3>{label?.['en'] || key || ''}</h3>
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
                      {myMap?.length > 0 &&
                        myMap.map((item, i) => {
                          return (
                            <div
                              className="p-4 mb-4 border border-gray-300 border-solid rounded-xl row-clear no-space"
                              key={i}
                            >
                              <div className="flex flex-wrap items-center pb-2 mb-2 border-b border-black border-dashed sm:flex-nowrap">
                                <h3 className="text-lg font-semibold text-gray-800">{label?.['en'] || key || ''}</h3>

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
                                <Button
                                  variant="danger"
                                  className="ml-4"
                                  onClick={(e) => {
                                    remove(i)
                                    e.stopPropagation()
                                  }}
                                >
                                  Delete {label?.['en'] || key || ''}
                                  <img
                                    className="inline-block px-2"
                                    src="/images/langaugedelete.svg"
                                    alt="Langauge Delete"
                                  />
                                </Button>
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
                                          description: p.description,
                                          props: p.props,
                                          options: p.options ? p.options : null,
                                          help: p.help ? p.help : null,
                                          path: `${path}${key}[${i}].`,
                                          languages: p.languages ? true : false,
                                          type: p.type,
                                          placeholder: p?.placeholder,
                                        })}
                                      </div>
                                    )
                                  })}
                              </div>
                            </div>
                          )
                        })}

                      <Button
                        variant="success"
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
            <div className="block w-full p-4 mb-4 border border-gray-300 border-solid rounded-xl row-clear no-space">
              <div className="flex flex-wrap items-center pb-2 mb-2 border-b border-black border-dashed sm:flex-nowrap">
                <h3 className="text-lg font-semibold text-gray-800">{label?.['en'] || key || ''}</h3>
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
                          description: p.description,
                        })}
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )
      case 'select':
        if (languages === true || languages === 'true') {
          return (
            <div className="flex flex-wrap items-end w-full p-0" key={`${path}${key}.${defaultLanguage}`}>
              <div className="w-full px-4 mb-3 lg:w-1/2 lg:mb-0">
                <div className="flex">
                  <h2 className="mt-4 mb-2">{label?.[defaultLanguage] || key || ''}</h2>
                  <span className="mt-4">
                    <HelpBar value={description?.[defaultLanguage]} />
                  </span>
                </div>
                <Field name={`${path}${key}.${defaultLanguage}`}>
                  {({ field, form }) => {
                    const value = field.value
                    return (
                      <Select
                        id={`${path}${key}.${defaultLanguage}`}
                        // className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg select__list focus:outline-none focus:shadow-outline"
                        variant="primary"
                        value={value ? value : ''}
                        {...field}
                        onChange={(e) => {
                          handleChangeFormValue(e.target.value, form, `${path}${key}.${defaultLanguage}`)
                        }}
                        onBlur={(e) => handleBlur(e, `${key + parent}`, `${path}${key}.${defaultLanguage}`)}
                        required={validations[`${key + parent}`]?.['required']}
                      >
                        <option value="">Please select {label?.[defaultLanguage] || key || ''}</option>
                        {options?.map((option, oi) => (
                          <option
                            key={oi}
                            value={option.value[defaultLanguage] ? option.value[defaultLanguage] : option.value}
                          >
                            {option.title[defaultLanguage] ? option.title[defaultLanguage] : option.title}
                          </option>
                        ))}
                      </Select>
                    )
                  }}
                </Field>
              </div>
              <div className="w-full px-4 lg:w-1/2">
                {lang.map((langag, i) => {
                  return (
                    <button
                      className={`border ${
                        langag === defaultLanguage ? 'border-gray-400' : 'border-gray-300'
                      } rounded-lg p-3 text-sm text-gray-700 mr-3`}
                      key={path + langag + i}
                      type="button"
                      onClick={(e) => changeLanguage(e, langag)}
                    >
                      {langag === defaultLanguage ? <b>{langag.toUpperCase()}</b> : langag.toUpperCase()}
                    </button>
                  )
                })}
              </div>
              {/* for showing error if user enters invalid data */}
              <p className="my-1 ml-6 text-red-700">{errObj[`${path}${key}`]}</p>
            </div>
          )
        } else {
          return (
            <div className="w-full px-4 lg:w-1/2" key={`${path}${key}`}>
              <div className="mb-4">
                <div className="flex">
                  <h2 className="mb-2">{label?.['en'] || key || ''}</h2>
                  <HelpBar value={description?.['en']} />
                </div>
                <Field name={`${path}${key}`}>
                  {({ field, form }) => {
                    return (
                      <Select
                        id={`${path}${key}`}
                        // className="w-full px-3 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-400 rounded-lg select__list focus:outline-none focus:shadow-outline"
                        {...field}
                        variant="primary"
                        onChange={(e) => {
                          handleChangeFormValue(e.target.value, form, `${path}${key}`)
                        }}
                        onBlur={(e) => handleBlur(e, `${key + parent}`, `${path}${key}`)}
                        required={validations[`${key + parent}`]?.['required']}
                      >
                        <option value="">Please select {label?.['en'] || key || ''}</option>
                        {options.map((item, index) => (
                          <option key={index} value={item.value}>
                            {item.title}
                          </option>
                        ))}
                      </Select>
                    )
                  }}
                </Field>
                <p className="my-1 text-red-700">{errObj[`${path}${key}`]}</p>
              </div>
            </div>
          )
        }
      case 'array':
        if (languages) {
          return (
            <div key={`${path}${key}`} className="w-full px-4 m-4 border border-gray-300 rounded-lg lg:mt-5">
              <div className="my-2">
                <h2 className="inline-block mx-2">{label?.[defaultLanguage] || key || ''}</h2>
                <HelpBar value={description?.[defaultLanguage]} />
                <div className="inline-block ml-5">
                  {lang.map((langag, i) => {
                    return (
                      <button
                        className={`border ${
                          langag === defaultLanguage ? 'border-gray-400' : 'border-gray-300'
                        } rounded-lg p-3 text-sm text-gray-700 mr-3`}
                        key={path + langag + i}
                        type="button"
                        onClick={(e) => changeLanguage(e, langag)}
                      >
                        {langag === defaultLanguage ? <b>{langag.toUpperCase()}</b> : langag.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </div>
              <FieldArray name={`${path}${key}.${defaultLanguage}`}>
                {(fieldArrayProps) => {
                  const { push, remove, form } = fieldArrayProps
                  const { value } = form.getFieldProps(`${path}${key}.${defaultLanguage}`)
                  let myMap = value || []
                  return (
                    <div>
                      <div>
                        {myMap?.map((item, i) => (
                          <div key={i}>
                            <div className="inline-block w-1/2 mb-2">
                              <Field name={`${path + key}.${defaultLanguage}[${i}]`}>
                                {({ field, form }) => {
                                  return (
                                    <Input
                                      type="text"
                                      variant="primary"
                                      id={`${path + key}[${i}]`}
                                      {...field}
                                      onChange={(e) => {
                                        handleChangeFormValue(
                                          e.target.value,
                                          form,
                                          `${path + key}.${defaultLanguage}[${i}]`,
                                        )
                                      }}
                                      type={type === 'number' ? 'number' : 'text'}
                                      placeholder={description?.[defaultLanguage] || ''}
                                      onBlur={(e) =>
                                        handleBlur(e, `${key + parent}`, `${path + key}.${defaultLanguage}[${i}]`)
                                      }
                                      required={validations[`${key + parent}`]?.['required']}
                                    />
                                  )
                                }}
                              </Field>
                            </div>

                            <Button
                              className="inline-block mx-3 cursor-pointer"
                              onClick={() => {
                                remove(i)
                              }}
                            >
                              <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Products" />
                            </Button>
                            {/* for showing error if user enters invalid data */}
                            <p className="my-1 text-red-700">{errObj[`${path + key}.${defaultLanguage}[${i}]`]}</p>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="success"
                        type="button"
                        onClick={() => {
                          push('')
                        }}
                        className="mb-4"
                      >
                        add {label?.['en'] || key || ''}
                        <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                      </Button>
                    </div>
                  )
                }}
              </FieldArray>
            </div>
          )
        } else {
          return (
            <div key={`${path}${key}`} className="w-full px-4 m-4 border border-gray-300 rounded-lg lg:mt-5">
              <div className="flex">
                <h2 className="mx-2 my-4">{label?.['en'] || key || ''}</h2>
                <span className="mt-4">
                  <HelpBar value={description?.['en']} />
                </span>
              </div>
              <FieldArray name={`${path}${key}`}>
                {(fieldArrayProps) => {
                  const { push, remove, form } = fieldArrayProps
                  const { value } = form.getFieldProps(`${path}${key}`)
                  let myMap = value || []

                  return (
                    <div className="w-full lg:w-2/3">
                      <div>
                        {myMap?.map((item, i) => (
                          <div key={i}>
                            <div className="inline-block w-4/5 mb-2">
                              <Field name={`${path + key}[${i}]`}>
                                {({ field, form }) => {
                                  return (
                                    <Input
                                      type="text"
                                      variant="primary"
                                      id={`${path + key}[${i}]`}
                                      {...field}
                                      onChange={(e) => {
                                        handleChangeFormValue(e.target.value, form, `${path + key}[${i}]`)
                                      }}
                                      type={type === 'number' ? 'number' : 'text'}
                                      placeholder={description?.['en'] || ''}
                                      onBlur={(e) => handleBlur(e, `${key + parent}`, `${path + key}[${i}]`)}
                                      required={validations[`${key + parent}`]?.['required']}
                                    />
                                  )
                                }}
                              </Field>
                            </div>

                            <Button
                              className="inline-block mx-3 cursor-pointer"
                              onClick={() => {
                                remove(i)
                              }}
                            >
                              <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Products" />
                            </Button>
                            {/* for showing error if user enters invalid data */}
                            <p className="my-1 text-red-700">{errObj[`${path + key}[${i}]`]}</p>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="success"
                        type="button"
                        onClick={() => {
                          push('')
                        }}
                        className="mb-4"
                      >
                        add {label?.['en'] || key || ''}
                        <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                      </Button>
                    </div>
                  )
                }}
              </FieldArray>
            </div>
          )
        }
      case 'radio':
        return (
          <RadioInput
            languages={lang}
            language={defaultLanguage}
            path={path}
            componentKey={key}
            label={label}
            languageBased={languages}
            changeLanguage={changeLanguage}
            options={options}
            key={`ri-${path}-${key}`}
            description={description}
          />
        )
      case 'keyedInput':
        return (
          <div key={`${path}${key}`} className="w-full p-4 m-4 border border-gray-300 rounded-lg">
            <FieldArray name={path + key}>
              {(fieldArrayProps) => {
                const { push, remove, form } = fieldArrayProps
                const { value } = form.getFieldProps(`${path}${key}`)
                let myMap = value || []
                return (
                  <div>
                    <div className="flex">
                      <h2 className="text-lg">{label?.['en'] || key || ''}</h2>
                      <span className="mt-2">
                        <HelpBar value={description?.['en']} />
                      </span>
                    </div>
                    <div>
                      {myMap?.map((item, i) => {
                        let obj = form.getFieldProps(`${path}${key}[${i}]`).value
                        let k = Object.keys(obj)
                        let v = obj[k[0]]
                        return (
                          <div key={i} className="my-2">
                            <div className="inline-block w-2/5">
                              <Input
                                onChange={(e) => {
                                  form.setFieldValue(`${path + key}[${i}]`, {
                                    [e.target.value]: v,
                                  })
                                  compareComponentData()
                                }}
                                value={k[0]}
                                placeholder="key"
                                variant="primary"
                              />
                            </div>
                            <div className="inline-block w-2/5 ml-2">
                              <Input
                                onChange={(e) => {
                                  form.setFieldValue(`${path + key}[${i}]`, {
                                    [k[0]]: e.target.value,
                                  })
                                  compareComponentData()
                                }}
                                variant="primary"
                                placeholder="value"
                                value={v}
                              />
                            </div>
                            <Button
                              className="inline-block mx-3 cursor-pointer"
                              onClick={() => {
                                remove(i)
                              }}
                            >
                              <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Products" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>

                    <Button
                      variant="success"
                      onClick={() => {
                        push({ '': '' })
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
        )
      case 'link':
        if (languages === true || languages === 'true') {
          return (
            <div className="w-full p-4 m-4 border border-gray-300 rounded-lg" key={`${path}${key}`}>
              <div className="flex">
                <h2 className="text-lg">{label?.[defaultLanguage] || key || ''}</h2>
                <span className="mt-1">
                  <HelpBar value={description?.[defaultLanguage]} />
                </span>
              </div>
              <div className="flex flex-wrap">
                <div className="w-1/3 py-2">
                  <Field name={`${path}${key}.title.${defaultLanguage}`}>
                    {({ field, form }) => {
                      const value = field.value || ''
                      return (
                        <Input
                          onChange={(e) =>
                            handleChangeFormValue(e.target.value, form, `${path}${key}.title.${defaultLanguage}`)
                          }
                          value={value}
                          id={`${path}${key}.title.${defaultLanguage}`}
                          {...field}
                          type="text"
                          variant="primary"
                          placeholder={placeholder?.title?.[defaultLanguage]}
                        />
                      )
                    }}
                  </Field>
                </div>
                <div className="w-1/3 py-2 ml-4">
                  <Field name={`${path}${key}.link.${defaultLanguage}`}>
                    {({ field, form }) => {
                      const value = field.value || ''
                      return (
                        <Input
                          onChange={(e) =>
                            handleChangeFormValue(e.target.value, form, `${path}${key}.link.${defaultLanguage}`)
                          }
                          value={value}
                          variant="primary"
                          id={`${path}${key}.link.${defaultLanguage}`}
                          {...field}
                          type="text"
                          placeholder={placeholder?.link?.[defaultLanguage]}
                        />
                      )
                    }}
                  </Field>
                </div>
                <div className="flex flex-wrap w-full mt-4 ml-0 sm:ml-4 sm:w-1/4 sm:mt-0">
                  <Field name={`${path}${key}.targetBlank.${defaultLanguage}`}>
                    {({ field, form }) => {
                      const value = field.value
                      return (
                        <div className="flex h-full items-cente">
                          <Input
                            type="toggle"
                            id={`${path}${key}.targetBlank.${defaultLanguage}`}
                            variant="primary"
                            {...field}
                            checked={value}
                            onChange={(e) => {
                              handleChangeFormValue(
                                e.target.checked,
                                form,
                                `${path}${key}.targetBlank.${defaultLanguage}`,
                              )
                            }}
                          />
                        </div>
                      )
                    }}
                  </Field>
                  <div className="inline-block px-4">
                    {lang.map((langag, i) => {
                      return (
                        <button
                          className={`border ${
                            langag === defaultLanguage ? 'border-gray-400' : 'border-gray-300'
                          } rounded-lg p-3 text-sm text-gray-700 mr-3`}
                          key={path + langag + i}
                          type="button"
                          onClick={(e) => changeLanguage(e, langag)}
                        >
                          {langag === defaultLanguage ? <b>{langag.toUpperCase()}</b> : langag.toUpperCase()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className="w-full p-4 m-4 border border-gray-300 rounded-lg" key={`${path}${key}`}>
              <div className="flex">
                <h2 className="text-lg">{label?.['en'] || key || ''}</h2>
                <span className="mt-1">
                  <HelpBar value={description?.['en']} />
                </span>
              </div>
              <div className="flex">
                <div className="w-1/3 py-2">
                  <Field name={`${path}${key}.title`}>
                    {({ field, form }) => {
                      return (
                        <Input
                          onChange={(e) => handleChangeFormValue(e.target.value, form, `${path}${key}.title`)}
                          id={`${path}${key}.title`}
                          {...field}
                          type="text"
                          variant="primary"
                          placeholder={placeholder?.title?.['en']}
                        />
                      )
                    }}
                  </Field>
                </div>
                <div className="w-1/3 py-2 ml-4">
                  <Field name={`${path}${key}.link`}>
                    {({ field, form }) => {
                      return (
                        <Input
                          onChange={(e) => handleChangeFormValue(e.target.value, form, `${path}${key}.link`)}
                          variant="primary"
                          id={`${path}${key}.link`}
                          {...field}
                          type="text"
                          placeholder={placeholder?.link?.['en']}
                        />
                      )
                    }}
                  </Field>
                </div>
                <div className="w-1/4 ml-4">
                  <Field name={`${path}${key}.targetBlank`}>
                    {({ field, form }) => {
                      const value = field.value
                      return (
                        <div className="flex h-full items-cente">
                          <Input
                            type="toggle"
                            id={`${path}${key}.targetBlank`}
                            variant="primary"
                            {...field}
                            checked={value}
                            onChange={(e) => {
                              handleChangeFormValue(e.target.checked, form, `${path}${key}.targetBlank`)
                            }}
                          />
                        </div>
                      )
                    }}
                  </Field>
                </div>
              </div>
            </div>
          )
        }
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
            placeholder="Select color"
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
            placeholder="Select date"
          />
        )
      case 'flipBookPdf':
        return (
          <div key={`${path}${key}`} className="w-full my-4">
            <ul className="inline-flex flex-wrap w-full px-1">
              {lang.map((langag, i) => {
                return (
                  <li
                    className={`bg-white mx-3 cursor-pointer text-gray-800 font-semibold py-2 border-l border-r ${
                      langag === defaultLanguage ? 'selected__class' : 'border-t'
                    } rounded`}
                    key={`${path}${key}` + langag + i}
                    onClick={(e) => {
                      changeLanguage(e, langag)
                    }}
                  >
                    <span className="px-4 lg:px-16 md:px-8">{langag.toUpperCase()}</span>
                  </li>
                )
              })}
            </ul>
            <div className="flex flex-wrap items-center w-full p-4 border border-gray-300 rounded-lg sm:flex-nowrap">
              {formEl?.current && formEl.current.getFieldProps(`${path}${key}.${defaultLanguage}`).value?.length > 0 ? (
                <div className="relative w-20 m-2 border border-gray-400 rounded-lg cursor-pointer md:h-36 md:w-28 h-28">
                  <img
                    src={`https://cdn.mts-online.com/${clientId}/static/${productName}/${version}/pdf/${defaultLanguage}/images/${
                      formEl.current.getFieldProps(`${path}${key}.${defaultLanguage}`).value[0]
                    }`}
                    alt={formEl.current.getFieldProps(`${path}${key}.${defaultLanguage}`).value[0]}
                    className="w-full h-full rounded-lg"
                    onClick={() => {
                      setCurrentPdfKey(`${path}${key}.${defaultLanguage}`)
                      setOpenPdfSelectionModal(true)
                    }}
                    draggable={false}
                  />
                  {/* <img
                    src={`http://10.10.10.119:3004/api/flipBook/cdn/${clientId}/${productName}/${version}/${defaultLanguage}/${
                      formEl.current.getFieldProps(`${path}${key}.${defaultLanguage}`).value[0]
                    }`}
                    alt={formEl.current.getFieldProps(`${path}${key}.${defaultLanguage}`).value[0]}
                    className="w-full h-full rounded-lg"
                    onClick={() => {
                      setCurrentPdfKey(`${path}${key}.${defaultLanguage}`)
                      setOpenPdfSelectionModal(true)
                    }}
                    draggable={false}
                  /> */}
                </div>
              ) : (
                <div
                  className="flex items-center justify-center w-20 m-2 border border-gray-400 rounded-lg cursor-pointer md:h-36 md:w-28 h-28"
                  onClick={() => {
                    setCurrentPdfKey(`${path}${key}.${defaultLanguage}`)
                    setOpenPdfSelectionModal(true)
                  }}
                >
                  <span className="text-lg">Select Pdf</span>
                </div>
              )}
            </div>
          </div>
        )
      case 'imageUpload':
        if (!isImageUpload) {
          setIsImageUpload(true)
        }
        return (
          <div className="w-full p-4 m-4 border border-gray-300 rounded-lg" key={`${path}${key}`}>
            <h2 className="text-lg">Images</h2>
            {formEl?.current && formEl.current.getFieldProps(`${path}${key}`).value?.length > 0 ? (
              <div className="grid grid-cols-5 gap-6 p-6 my-4 overflow-auto border-2 border-green-400 rounded-lg max-h-96">
                {formEl.current.getFieldProps(`${path}${key}`).value.map((image, index) => (
                  <div
                    style={{ cursor: 'grab' }}
                    className="relative p-2 border border-gray-400 rounded-lg h-36"
                    key={index}
                  >
                    <img
                      src={`${image.url}`}
                      draggable={true}
                      onDragStart={(e) => handleSwapImage(e, 'start', image, `${path}${key}`)}
                      onDrop={(e) => handleSwapImage(e, 'drop', image, `${path}${key}`)}
                      onDragOver={(ev) => ev.preventDefault()}
                      className="object-cover object-center w-full h-full cursor-move"
                      alt={image.name}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        isConfirmed('are you sure to remove this image').then((canDelete) => {
                          if (canDelete) {
                            const listData = formEl.current.getFieldProps(`${path}${key}`).value
                            const AllData = listData.filter((x) => x.name != image.name)
                            formEl.current.setFieldValue(`${path}${key}`, AllData)
                            setRefreshGrid((x) => x + 1)
                          }
                        })
                      }}
                      className="absolute p-2 text-xl font-bold text-white rounded-full cursor-pointer bg-primary -right-2 -top-2"
                    >
                      <img src="/images/close.svg" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h2 className="my-4 text-lg text-left text-gray-500">No images are added </h2>
              </div>
            )}
            <div>
              <Button
                variant="success"
                type="button"
                onClick={() => {
                  setControlSelectedImages(
                    formEl?.current && formEl.current.getFieldProps(`${path}${key}`).value
                      ? formEl?.current && formEl.current.getFieldProps(`${path}${key}`).value
                      : [],
                  )
                  setImageKey(`${path}${key}`)
                  setOpenImageSelectModal(true)
                }}
              >
                Select From Uploaded
              </Button>
            </div>
          </div>
        )
    }
  }

  const groupSize = 2
  const availableComponent = availableComponents.find(
    (ac) => ac.module === componentData.module && ac.module !== undefined,
  )
  const editProps = componentData.props || availableComponent?.props

  let mainProps = editProps.filter((item) => {
    if (item.tabView !== true) return item
  })

  let tabViewProps = editProps.filter((item) => {
    if (item.tabView === true) return item
  })

  const props = mainProps.reduce(
    (acc, { type, inputType, key, description, label, validation, props, placeholder, ...rest }, i) => {
      i % groupSize === 0 && acc.push([])
      const side = i % 2 !== 0 && 'right'
      const path = ''
      acc[acc.length - 1].push(
        inputByType({
          inputType,
          key,
          description,
          label,
          props,
          path,
          options: rest.options ? rest.options : null,
          languages: rest.languages ? true : false,
          type: rest.type,
          placeholder,
        }),
      )
      return acc
    },
    [],
  )

  const tabView = tabViewProps.reduce(
    (acc, { type, inputType, key, description, label, validation, props, placeholder, ...rest }, i) => {
      i % groupSize === 0 && acc.push([])
      const side = i % 2 !== 0 && 'right'
      const path = ''
      acc[acc.length - 1].push(
        inputByType({
          inputType,
          key,
          description,
          label,
          props,
          path,
          options: rest.options ? rest.options : null,
          languages: rest.languages ? true : false,
          type: rest.type,
          tabView: rest.tabView,
          placeholder,
        }),
      )
      return acc
    },
    [],
  )

  if (tabViewProps.length > 0 && !visibleRootCategory) setVisibleRootCategory(tabViewProps[0].key)

  useEffect(() => {
    compareComponentData()
  }, [componentData])

  const compareComponentData = (check = true) => {
    let tempOgComponent = { ...ogComponentData }
    if (componentData) {
      if (isWidgetEdit) {
        let tempComponent = { ...componentData }
        if (componentData?.blockProps && formEl.current?.values && check == true) {
          tempComponent.blockProps = { ...formEl.current?.values }
        }

        if (languages) {
          tempComponent.languages = lang
        }
        const isDirty = isEqual(tempComponent, tempOgComponent)
        setSaveDirty(isDirty)
      }
    }
  }

  return language ? (
    <div>
      {openImageSelectModal && (
        <div
          className="items-center justify-center"
          style={{ display: openImageSelectModal ? 'flex' : 'none' }}
          id="modal"
        >
          <div className="w-full modal-content">
            <div style={{ marginBottom: '100px' }} className="modal-body">
              <ImageSelectionList
                controlSelectedImages={controlSelectedImages}
                setControlSelectedImages={setControlSelectedImages}
                clientImages={clientImages}
                handleClose={() => {
                  setOpenImageSelectModal(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* pdf upload modal starts */}
      {openPdfSelectionModal && (
        <div
          className="items-center justify-center"
          style={{ display: openPdfSelectionModal ? 'flex' : 'none' }}
          id="modal"
        >
          <div className="w-full modal-content">
            <div className="modal-body">
              <PdfController
                handleOpen={setOpenPdfSelectionModal}
                product={{ productName, version }}
                language={defaultLanguage}
                clientId={clientId}
                pdfKey={currentPdfKey}
                isConfirmed={isConfirmed}
                formEl={formEl}
                compareComponentData={compareComponentData}
              />
            </div>
          </div>
        </div>
      )}
      {/* pdf upload modal ends */}
      <div>
        {isDemoView && (
          <WidgetView
            module={component.module}
            setIsDemoView={setIsDemoView}
            language={defaultLanguage}
            data={formEl.current?.values}
            lang={lang}
            setDefaultLanguage={setDefaultLanguage}
            productName={productName}
            version={version}
            domainId={domainId}
            clientId={clientId}
            attributes={attributes}
            setAttributes={setAttributes}
          />
        )}
      </div>

      <div className={`flex flex-col items-center ${isDemoView && `hidden`}`}>
        <Formik initialValues={formValues} onSubmit={handleSubmit} enableReinitialize innerRef={formEl}>
          <Form id={`component-${componentData ? componentData._id : ''}-form`} className="w-full">
            <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="justify-between pb-2 text-left border-b border-black border-dashed sm:flex">
                <h3>{componentData?.name || ''}</h3>
                <ul className="sm:flex">
                  <li className="sm:pl-4 sm:border-r">
                    <div className="flex px-4 py-1">
                      <Button
                        onClick={() => {
                          setIsDemoView(!isDemoView)
                        }}
                        variant="success"
                        className="bg-white text-sm px-4 flex items-center"
                      >
                        Demo
                        <img className="inline-block pl-4" src="/images/widget.svg" alt="Products" width="32" />
                      </Button>
                    </div>
                  </li>
                  <li className="sm:pl-4 sm:border-r flex items-center">
                    <div className="flex items-center px-2 py-1">
                      <p>Active</p>
                      <Input
                        variant="primary"
                        type="toggle"
                        id="isActive"
                        checked={(componentData && componentData.status) || false}
                        onChange={toggleHandler('status')}
                      />
                    </div>
                  </li>
                  <li className="sm:pl-4 flex items-center">
                    <div className="flex items-center px-2 py-1">
                      <p>Default</p>
                      <Input
                        variant="primary"
                        type="toggle"
                        id="isDefault"
                        checked={(componentData && componentData.isDefault) || false}
                        onChange={toggleHandler('isDefault')}
                      />
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex flex-wrap -mx-4 text-left">
                <div className="w-full px-4 mt-5 sm:w-1/2">
                  <h2 className="mt-4 mb-2">{componentData?.name ? 'Component name' : 'Name'}</h2>
                  <Input
                    type="text"
                    id="name"
                    variant="primary"
                    value={componentData?.name || ''}
                    onChange={handleChange('name')}
                    placeholder="Component name"
                  />
                  <div>
                    <h2 className="mt-4 mb-2">{addLanguage ? 'Add Language' : 'Language'}</h2>
                    <div className="flex flex-wrap md:flex-nowrap">
                      <div className="w-full sm:w-2/3">
                        <Input
                          type="text"
                          id="Language"
                          variant="primary"
                          value={addLanguage || ''}
                          onChange={handleChange('addLanguage')}
                          placeholder="Add a language"
                        />
                      </div>
                      <Button
                        onClick={handleLanguages('languages')}
                        className="mt-4 ml-0 md:ml-2 md:mt-0"
                        variant="success"
                        type="button"
                      >
                        Add Language
                        <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="w-full px-4 mt-5 sm:w-1/2">
                  <h2 className="mt-4 mb-2">{componentData?.description ? 'Short description' : 'Description'}</h2>
                  <textarea
                    className="block w-full px-3 py-3 mt-1 overflow-hidden text-gray-700 border border-gray-400 rounded-lg resize-none focus:outline-none focus:shadow-outline"
                    rows="5"
                    id="email"
                    value={componentData?.description || ''}
                    onChange={handleChange('description')}
                    placeholder="Component description"
                  ></textarea>
                </div>

                <div className="mt-5">
                  <div className="flex flex-wrap -mx-4">
                    {lang
                      ? lang.map((val, i) => {
                          return (
                            <div className="px-4 mb-4" key={i}>
                              <div className="px-2 py-1 capitalize border border-gray-400 rounded-lg hover:border-gray-600 ">
                                <span className="flex p-1">
                                  <span className="pr-7">{val.toUpperCase()}</span>
                                  <img
                                    onClick={(e) => handleDeleteLanguages(val, e)}
                                    className="inline-block ml-auto cursor-pointer"
                                    src="/images/langaugedelete.svg"
                                    alt="Langauge Delete"
                                  />
                                </span>
                              </div>
                            </div>
                          )
                        })
                      : null}
                  </div>
                </div>
              </div>
            </div>
            {/* Product details section end */}

            {isImageUpload == true ? (
              <ImageUploadList
                showKognitiveImages={showKognitiveImages}
                setShowKognitiveImages={setShowKognitiveImages}
                kognitiveImages={kognitiveImages}
                loadingKognitiveImages={loadingKognitiveImages}
                setClientImages={setClientImages}
                clientImages={clientImages}
                setLoading={setLoading}
                isConfirmed={isConfirmed}
                clientId={clientId}
                workerPath={workerPath}
              />
            ) : null}

            {component?.view === 'vmts' || component.module == 'WidgetVmts1' ? (
              <VmtsView
                editProps={editProps}
                languages={languages}
                errObj={errObj}
                lang={lang}
                defaultLanguage={defaultLanguage}
                clipBoard={clipBoard}
                widgetList={widgetList}
                validations={validations}
                RTE={RTE}
                handleBlur={handleBlur}
                focusedField={focusedField}
                widgetId={widgetId}
                handleCopy={handleCopy}
                setFocusedField={setFocusedField}
                changeLanguage={changeLanguage}
                getWidgetStyle={getWidgetStyle}
                setClipBoard={setClipBoard}
                buildDataObj={buildDataObj}
                uploadFrom={uploadFrom}
                previews={previews}
                images={images}
                setUploadFrom={setUploadFrom}
                showKognitiveImages={showKognitiveImages}
                loadingKognitiveImages={loadingKognitiveImages}
                selectedImages={selectedImages}
                kognitiveImages={kognitiveImages}
                handleSwapImage={handleSwapImage}
                setShowKognitiveImages={setShowKognitiveImages}
                handleCut={handleCut}
                handlePaste={handlePaste}
                handleChangeFormValue={handleChangeFormValue}
                clientId={clientId}
                version={version}
                productName={productName}
                setOpenImageSelectModal={setOpenImageSelectModal}
                formEl={formEl}
                setImageKey={setImageKey}
                setControlSelectedImages={setControlSelectedImages}
                compareComponentData={compareComponentData}
                isConfirmed={isConfirmed}
                setRefreshGrid={setRefreshGrid}
                setIsImageUpload={setIsImageUpload}
                setOpenPdfSelectionModal={setOpenPdfSelectionModal}
                setCurrentPdfKey={setCurrentPdfKey}
                isImageUpload={isImageUpload}
              />
            ) : (
              <div className="p-4 mt-10 bg-white border border-gray-300 rounded-lg shadow-lg">
                {languages &&
                  languages.map((l, i) => {
                    return (
                      <div key={l} index={i}>
                        {props.map((p, idx) => (
                          <div key={idx} className="flex flex-wrap -mx-4 text-left">
                            {p.map((pRow) => pRow)}
                          </div>
                        ))}
                        {tabView.length > 0 && (
                          <div className="w-full mt-4">
                            <ul className="inline-flex w-full px-1 pt-2">
                              {tabViewProps.map((item, index) => (
                                <li
                                  className={`bg-white mx-4 text-gray-800 font-semibold p-2  border-l border-r rounded cursor-pointer ${
                                    visibleRootCategory === item.key ? 'selected__class' : 'border-t'
                                  }`}
                                  key={index}
                                  onClick={() => setVisibleRootCategory(item.key)}
                                >
                                  <span className="px-4 md:px-8">{item.label['en']}</span>
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
                      </div>
                    )
                  })}
              </div>
            )}
          </Form>
        </Formik>
      </div>
    </div>
  ) : null
}

export default EditComponent
