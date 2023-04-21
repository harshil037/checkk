import React from 'react'
import { Field, FieldArray } from 'formik'
import { Input } from '../componentLibrary'
import Button from '../common/Button'
import HelpBar from '../tool/helpBar'

const ArrayInput = ({
  languages = [],
  language = 'en',
  type = 'array',
  path = '',
  componentKey,
  label,
  languageBased = false,
  changeLanguage,
  handleChangeFormValue,
  handleBlur,
  validations,
  errObj,
  description,
  parent,
  placeholder,
}) => {
  const key = componentKey
  if (languageBased) {
    return (
      <div key={`${path}${key}`} className="px-4 mx-4 mt-4 border border-gray-300 rounded-lg lg:mt-5">
        <div className="my-2">
          <h2 className="inline-block mt-4 mb-2">{label?.[language] || key || ''}</h2>
          <div className="inline-block">
            <HelpBar value={description?.[language]} />
          </div>
          <div className="inline-block ml-5">
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
        </div>
        <FieldArray name={`${path}${key}.${language}`}>
          {(fieldArrayProps) => {
            const { push, remove, form } = fieldArrayProps
            const { value } = form.getFieldProps(`${path}${key}.${language}`)
            let myMap = value || []
            return (
              <div>
                <div>
                  {myMap?.map((item, i) => (
                    <div key={i}>
                      <div className="inline-block w-1/2 mb-2">
                        <Field name={`${path + key}.${language}[${i}]`}>
                          {({ field, form }) => {
                            return (
                              <Input
                                variant="primary"
                                id={`${path + key}[${i}]`}
                                {...field}
                                onChange={(e) => {
                                  handleChangeFormValue(e.target.value, form, `${path + key}.${language}[${i}]`)
                                }}
                                type={type === 'number' ? 'number' : 'text'}
                                placeholder={placeholder?.[language] || ''}
                                onBlur={(e) => handleBlur(e, `${key + parent}`, `${path + key}.${language}[${i}]`)}
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
                      <p className="my-1 text-red-700">{errObj[`${path + key}.${language}[${i}]`]}</p>
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
      <div key={`${path}${key}`} className="px-4 mx-4 mt-4 border border-gray-300 rounded-lg lg:mt-5">
        <h2 className="inline-block mt-4 mb-2">{label?.['en'] || key || ''}</h2>
        <div className="inline-block ml-2">
          <HelpBar value={description?.['en']} />
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
}

export default ArrayInput
