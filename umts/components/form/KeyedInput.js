import React from 'react'
import { Field, FieldArray } from 'formik'
import { Input } from '../componentLibrary'
import Button from '../common/Button'
import HelpBar from '../tool/helpBar'

const KeyedInput = ({
  languages = [],
  language = 'en',
  type = 'array',
  path = '',
  componentKey,
  label,
  languageBased = false,
  changeLanguage,
  description,
  placeholder,
}) => {
  const Header = ({ title, helpTitle }) => {
    return (
      <div className="flex">
        <h2 className="mb-2 text-lg">{title}</h2>
        <div className="mt-1">
          <HelpBar value={helpTitle} />
        </div>
      </div>
    )
  }

  const key = componentKey
  if (languageBased) {
    if (type === 'object') {
      return (
        <div key={`${path}${key}`} className="p-4 rounded-lg m-4 border border-gray-300">
          <Field name={`${path}${key}`}>
            {({ field, form }) => {
              let valueObj = field.value || {}
              let myMap = Object.keys(valueObj)
              return (
                <div>
                  <Header title={label?.[language] || key || ''} helpTitle={description?.[language]} />
                  <div>
                    {myMap?.map((item, i) => {
                      let k = item
                      let v = valueObj[item]
                      return (
                        <div key={i} className="mb-2">
                          <div className="w-1/6 inline-block">
                            <Input
                              onChange={(e) => {
                                let obj = { [e.target.value]: v }
                                let newObj = { ...valueObj, ...obj }
                                delete newObj[item]
                                form.setFieldValue(`${path + key}`, newObj)
                              }}
                              value={k}
                              placeholder={placeholder?.key?.[language]}
                              variant="primary"
                            />
                          </div>
                          <div className="w-2/6 inline-block ml-2">
                            <Input
                              onChange={(e) => {
                                form.setFieldValue(`${path + key}.${item}`, {
                                  ...v,
                                  [language]: e.target.value,
                                })
                              }}
                              variant="primary"
                              placeholder={placeholder?.value?.[language]}
                              value={v[language]}
                            />
                          </div>
                          <div className="w-1/6 inline-block ml-2">
                            {languages.map((langag, i) => {
                              return (
                                <button
                                  className={`border ${
                                    langag === language ? 'border-gray-400' : 'border-gray-300'
                                  } rounded-lg p-3 text-sm text-gray-700 mr-3`}
                                  key={path + langag + i}
                                  type="button"
                                  onClick={(e) => changeLanguage(e, langag)}
                                >
                                  {langag === language ? <b>{langag.toUpperCase()}</b> : langag.toUpperCase()}
                                </button>
                              )
                            })}
                          </div>
                          <div className="w-1/6 inline-block">
                            <Button
                              className="cursor-pointer"
                              onClick={() => {
                                let demoObj = { ...valueObj }
                                delete demoObj[item]
                                form.setFieldValue(`${path}${key}`, demoObj)
                              }}
                            >
                              <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Products" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => {
                      let langObj = {}
                      for (let i = 0; i < languages.length; i++) {
                        langObj[languages[i]] = ''
                      }
                      let demoObj = { ...valueObj, ...{ '': langObj } }
                      form.setFieldValue(`${path}${key}`, demoObj)
                    }}
                  >
                    add {label?.['en'] || key || ''}
                    <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                  </Button>
                </div>
              )
            }}
          </Field>
        </div>
      )
    } else {
      return (
        <div key={`${path}${key}`} className="p-4 rounded-lg m-4 border border-gray-300">
          <FieldArray name={path + key}>
            {(fieldArrayProps) => {
              const { push, remove, form } = fieldArrayProps
              const { value } = form.getFieldProps(`${path}${key}`)
              let myMap = value || []

              return (
                <div>
                  <Header title={label?.[language] || key || ''} helpTitle={description?.[language]} />
                  <div>
                    {myMap?.map((item, i) => {
                      let obj = form.getFieldProps(`${path}${key}[${i}]`).value
                      let k = Object.keys(obj)
                      let v = obj[k[0]]
                      return (
                        <div key={i} className="mb-2">
                          <div className="w-1/6 inline-block">
                            <Input
                              onChange={(e) => {
                                form.setFieldValue(`${path + key}[${i}]`, {
                                  [e.target.value]: v,
                                })
                              }}
                              value={k[0]}
                              placeholder={placeholder?.key?.[language]}
                              variant="primary"
                            />
                          </div>
                          <div className="w-2/6 inline-block ml-2">
                            <Input
                              onChange={(e) => {
                                form.setFieldValue(`${path + key}[${i}]`, {
                                  [k[0]]: { ...v, [language]: e.target.value },
                                })
                              }}
                              variant="primary"
                              placeholder={placeholder?.value?.[language]}
                              value={v[language]}
                            />
                          </div>
                          <div className="w-1/6 inline-block ml-2">
                            {languages.map((langag, i) => {
                              return (
                                <button
                                  className={`border ${
                                    langag === language ? 'border-gray-400' : 'border-gray-300'
                                  } rounded-lg p-3 text-sm text-gray-700 mr-3`}
                                  key={path + langag + i}
                                  type="button"
                                  onClick={(e) => changeLanguage(e, langag)}
                                >
                                  {langag === language ? <b>{langag.toUpperCase()}</b> : langag.toUpperCase()}
                                </button>
                              )
                            })}
                          </div>
                          <div className="w-1/6 inline-block">
                            <Button
                              className="cursor-pointer"
                              onClick={() => {
                                remove(i)
                              }}
                            >
                              <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Products" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => {
                      let langObj = {}
                      for (let i = 0; i < languages.length; i++) {
                        langObj[languages[i]] = ''
                      }
                      push({ '': langObj })
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
    }
  } else {
    if (type === 'object') {
      return (
        <div key={`${path}${key}`} className="p-4 rounded-lg m-4 border border-gray-300">
          <Field name={`${path}${key}`}>
            {({ field, form }) => {
              let valueObj = field.value || {}
              let myMap = Object.keys(valueObj)
              return (
                <div>
                  <Header title={label?.['en'] || key || ''} helpTitle={description?.['en']} />
                  <div>
                    {myMap?.map((item, i) => {
                      let k = item
                      let v = valueObj[item]
                      return (
                        <div key={i} className="mb-2">
                          <div className="w-2/5 inline-block">
                            <Input
                              onChange={(e) => {
                                let obj = { [e.target.value]: v }
                                let newObj = { ...valueObj, ...obj }
                                delete newObj[item]
                                form.setFieldValue(`${path + key}`, newObj)
                              }}
                              value={k}
                              placeholder={placeholder?.key?.[language]}
                              variant="primary"
                            />
                          </div>
                          <div className="w-2/5 inline-block ml-2">
                            <Input
                              onChange={(e) => {
                                form.setFieldValue(`${path + key}.${item}`, e.target.value)
                              }}
                              variant="primary"
                              placeholder={placeholder?.value?.[language]}
                              value={v}
                            />
                          </div>
                          <div className="ml-2 inline-block">
                            <Button
                              className="cursor-pointer"
                              onClick={() => {
                                let demoObj = { ...valueObj }
                                delete demoObj[item]
                                form.setFieldValue(`${path}${key}`, demoObj)
                              }}
                            >
                              <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Products" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => {
                      form.setFieldValue(`${path}${key}`, { ...valueObj, ...{ '': '' } })
                    }}
                  >
                    add {label?.['en'] || key || ''}
                    <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                  </Button>
                </div>
              )
            }}
          </Field>
        </div>
      )
    } else {
      return (
        <div key={`${path}${key}`} className="p-4 rounded-lg m-4 border border-gray-300">
          <FieldArray name={path + key}>
            {(fieldArrayProps) => {
              const { push, remove, form } = fieldArrayProps
              const { value } = form.getFieldProps(`${path}${key}`)
              let myMap = value || []
              return (
                <div>
                  <Header title={label?.['en'] || key || ''} helpTitle={description?.['en']} />
                  <div>
                    {myMap?.map((item, i) => {
                      let obj = form.getFieldProps(`${path}${key}[${i}]`).value
                      let k = Object.keys(obj)
                      let v = obj[k[0]]
                      return (
                        <div key={i} className="mb-2">
                          <div className="w-2/5 inline-block">
                            <Input
                              onChange={(e) => {
                                form.setFieldValue(`${path + key}[${i}]`, {
                                  [e.target.value]: v,
                                })
                              }}
                              value={k[0]}
                              placeholder={placeholder?.key?.[language]}
                              variant="primary"
                            />
                          </div>
                          <div className="w-2/5 inline-block ml-2">
                            <Input
                              onChange={(e) => {
                                form.setFieldValue(`${path + key}[${i}]`, {
                                  [k[0]]: e.target.value,
                                })
                              }}
                              variant="primary"
                              placeholder={placeholder?.value?.[language]}
                              value={v}
                            />
                          </div>
                          <Button
                            className="
                          inline-block
                          cursor-pointer
                          mx-3
                          "
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
    }
  }
}

export default KeyedInput
