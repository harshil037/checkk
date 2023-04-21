import React from 'react'
import { Field } from 'formik'
import { Input } from '../componentLibrary'
import HelpBar from '../tool/helpBar'

const TextInput = ({
  languages = [],
  language = 'en',
  type = 'string',
  path = '',
  componentKey,
  label,
  languageBased = false,
  changeLanguage,
  errObj,
  handleChangeFormValue,
  handleBlur,
  setFocusedField,
  description,
  validations,
  focusedField,
  parent,
  placeholder,
}) => {
  const key = componentKey

  if (languageBased === true || languageBased === 'true') {
    return (
      <div className="flex flex-wrap items-end w-full p-0" key={path + key}>
        <div className="w-full px-4 mb-4 lg:w-1/2">
          <div className="flex mb-2">
            <h2 className="ml-2">{label?.[language] || key || ''}</h2>
            <HelpBar value={description?.[language]} />
          </div>
          <Field name={`${path}${key}.${language}`}>
            {({ field, form }) => {
              return (
                <div className="relative">
                  <Input
                    id={`${path}${key}.${language}`}
                    {...field}
                    variant={errObj[`${path}${key}`] ? 'danger' : 'primary'}
                    onChange={(e) => {
                      handleChangeFormValue(e.target.value, form, `${path}${key}.${language}`)
                    }}
                    type={type === 'number' ? 'number' : 'text'}
                    placeholder={placeholder?.[language] || ''}
                    onBlur={(e) => {
                      e.preventDefault()
                      handleBlur(e, `${key + parent}`, `${path}${key}`)
                      setFocusedField((prev) => ({
                        ...prev,
                        [`${path}${key}`]: false,
                      }))
                    }}
                    required={validations[`${key + parent}`]?.['required']}
                    onFocus={(e) => {
                      e.preventDefault()
                      setFocusedField((prev) => ({
                        ...prev,
                        [`${path}${key}`]: true,
                      }))
                    }}
                    autoComplete="off"
                  />
                  {focusedField[`${path}${key}`] ? (
                    <div className="w-full autoComplete">
                      {languages.map((item, i) => {
                        if (item !== language) {
                          let lanValue = form.getFieldProps(`${path}${key}.${item}`).value
                          if (lanValue) {
                            return (
                              <p
                                key={i}
                                className="p-1 cursor-pointer autoComplete-p"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  handleChangeFormValue(lanValue, form, `${path}${key}.${language}`)
                                  setFocusedField((prev) => ({
                                    ...prev,
                                    [`${path}${key}`]: false,
                                  }))
                                }}
                              >
                                <strong>{item.toUpperCase()} :</strong> {lanValue}
                              </p>
                            )
                          } else {
                            return null
                          }
                        }
                      })}
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              )
            }}
          </Field>
        </div>
        <div className="w-full px-4 mb-4 lg:w-1/2">
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
        {/* for showing error if user enters invalid data */}
        {errObj[`${path}${key}`] && <p className="my-1 ml-6 text-red-700">{errObj[`${path}${key}`]}</p>}
      </div>
    )
  } else {
    return (
      <div key={`${path}${key}`} className="w-full px-4 lg:w-1/2">
        <div className="mb-4">
          <div className="flex mb-2">
            <h2 className="ml-2">{label?.['en'] || key || ''}</h2>
            <HelpBar value={description?.['en']} />
          </div>

          <Field name={`${path}${key}`}>
            {({ field, form }) => {
              return (
                <Input
                  id={`${path}${key}`}
                  {...field}
                  variant={errObj[`${path}${key}`] ? 'danger' : 'primary'}
                  onChange={(e) => {
                    handleChangeFormValue(e.target.value, form, `${path}${key}`)
                  }}
                  type={type === 'number' ? 'number' : 'text'}
                  placeholder={placeholder?.['en'] || ''}
                  onBlur={(e) => handleBlur(e, `${key + parent}`, `${path}${key}`)}
                  required={validations[`${key + parent}`]?.['required']}
                />
              )
            }}
          </Field>
          {/* for showing error if user enters invalid data */}
          <p className="my-1 text-red-700">{errObj[`${path}${key}`]}</p>
        </div>
      </div>
    )
  }
}

export default TextInput
