import React, { useState } from 'react'
import { Field, FieldArray } from 'formik'
import ClipBoardTool from './tool/clipBoardTool'
import { TextInput, RadioInput, DateTimePickerInput, ColorInput } from './form'
import { Input, Select } from './componentLibrary'
import Button from '../components/common/Button'
import HelpBar from './tool/helpBar'

const VmtsView = ({
  editProps,
  languages,
  errObj,
  lang,
  defaultLanguage,
  clipBoard,
  widgetList,
  validations,
  RTE,
  handleBlur,
  focusedField,
  widgetId,
  handleCopy,
  setFocusedField,
  changeLanguage,
  getWidgetStyle,
  setClipBoard,
  buildDataObj,
  handleCut,
  handlePaste,
  handleChangeFormValue,
  handleSwapImage,
  clientId,
  version,
  productName,
  setOpenImageSelectModal,
  formEl,
  setImageKey,
  setControlSelectedImages,
  compareComponentData,
  isConfirmed,
  setRefreshGrid,
  setIsImageUpload,
  setOpenPdfSelectionModal,
  setCurrentPdfKey,
  isImageUpload,
}) => {
  const groupSize = 2

  const [accordion, setAccordion] = useState({})
  const [visibleRootCategory, setVisibleRootCategory] = useState('')

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
    description,
    label,
    props,
    path = '',
    options,
    languages,
    parent = '',
    type,
    placeholder,
    tabView = false,
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
          <div key={`${path}${key}`} className="w-full px-4 lg:mt-5 lg:w-1/2">
            <div className="flex px-2 py-1">
              <h2 className="mx-2 my-4">{label?.['en'] || key || ''}</h2>
              <span className="mt-3">
                <HelpBar isToggle={true} value={description?.['en']} />
              </span>
              <Field name={`${path}${key}`}>
                {({ field, form }) => {
                  return (
                    <div className="flex items-center">
                      <Input
                        type="toggle"
                        id={`${path}${key}`}
                        variant="primary"
                        {...field}
                        checked={field.value}
                        required={validations[`${key + parent}`]?.['required']}
                        onChange={(e) => {
                          handleChangeFormValue(e.target.checked, form, `${path}${key}`)
                        }}
                      />
                    </div>
                  )
                }}
              </Field>
            </div>
            {/* for showing error if user enters invalid data */}
            <p className="my-1 text-red-700">{errObj[`${path}${key}`]}</p>
          </div>
        )
      case 'rte':
        if (languages === true || languages === 'true') {
          return (
            <div className="w-full px-4 my-4" key={`${path}${key}`}>
              <div className="">
                <ul className="inline-flex flex-wrap w-full gap-4 px-1 pt-2 ml-2">
                  {lang.map((langag, i) => {
                    return (
                      <li
                        className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border-r border-l border-t ${
                          langag === defaultLanguage ? 'after:bg-primary-400' : 'after:bg-transparent'
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
                                          placeholder: p.placeholder,
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
                  fieldProps={props}
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
                          placeholder: p.placeholder,
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
            <div key={`${path}${key}`} className="w-full px-4 mx-4 mt-4 border border-gray-300 rounded-lg lg:mt-5">
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
                                      placeholder={placeholder?.[defaultLanguage] || ''}
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
                              className="inline-block mx-3 cursor-pointer "
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
                        variant="primary"
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
            <div key={`${path}${key}`} className="w-full px-4 mx-4 mt-4 border border-gray-300 rounded-lg lg:mt-5">
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
                                      variant="primary"
                                      id={`${path + key}[${i}]`}
                                      {...field}
                                      onChange={(e) => {
                                        handleChangeFormValue(e.target.value, form, `${path + key}[${i}]`)
                                      }}
                                      type={type === 'number' ? 'number' : 'text'}
                                      placeholder={placeholder?.['en'] || ''}
                                      onBlur={(e) => handleBlur(e, `${key + parent}`, `${path + key}[${i}]`)}
                                      required={validations[`${key + parent}`]?.['required']}
                                    />
                                  )
                                }}
                              </Field>
                            </div>

                            <Button
                              className="inline-block mx-3 cursor-pointer "
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
                        variant="primary"
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
                              className="inline-block mx-3 cursor-pointer "
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
                      variant="primary"
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
                          // placeholder="Title"
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
                          // placeholder="Link"
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
            <ul className="inline-flex flex-wrap w-full gap-4 px-1 ml-2">
              {lang.map((langag, i) => {
                return (
                  <li
                    className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border-r border-l border-t ${
                      langag === defaultLanguage ? 'after:bg-primary-400' : 'after:bg-transparent'
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
                      className="absolute p-2 text-xl font-bold text-white rounded-full cursor-pointer bg-primary-400 -right-2 -top-2"
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
                variant="primary"
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

  return (
    <>
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
                    <ul className="inline-flex flex-wrap w-full gap-4 px-1 ml-2">
                      {tabViewProps.map((item, index) => (
                        <li
                          className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border-r border-l border-t ${
                            visibleRootCategory === item.key ? 'after:bg-primary-400' : 'after:bg-transparent'
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
    </>
  )
}

export default VmtsView
