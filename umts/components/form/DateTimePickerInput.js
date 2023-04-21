import React from 'react'
import { Field } from 'formik'
import HelpBar from '../tool/helpBar'
import 'react-datetime/css/react-datetime.css'
import Datetime from 'react-datetime'

const DateTimePickerInput = ({
  languages = [],
  language = 'en',
  path = '',
  componentKey,
  label,
  languageBased = false,
  changeLanguage,
  errObj,
  handleChangeFormValue,
  handleBlur,
  description,
  validations,
  parent,
  placeholder,
}) => {
  const key = componentKey

  if (languageBased === true || languageBased === 'true') {
    return (
      <div className="w-full flex flex-wrap items-end p-0" key={path + key}>
        <div className="w-full lg:w-1/2  px-4 mb-4">
          <div className="flex">
            <h2 className="mb-2 mx-2">{label?.[language] || key || ''}</h2>
            <HelpBar value={description?.[language]} />
          </div>
          <Field name={`${path}${key}.${language}`}>
            {({ field, form }) => {
              const otherProp = { placeholder: placeholder?.[language] || '', id: `${path}${key}.${language}` }
              return (
                <div className="relative">
                  <Datetime
                    {...field}
                    inputProps={otherProp}
                    className={`border border-${
                      errObj[`${path}${key}`] ? 'red' : 'gray'
                    }-400 rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-out`}
                    onChange={(e) => {
                      handleChangeFormValue(e._d?.getTime() || '', form, `${path}${key}.${language}`)
                    }}
                    onClose={() => {
                      handleBlur(field.value || '', `${key + parent}`, `${path}${key}`, true)
                    }}
                  />
                </div>
              )
            }}
          </Field>
        </div>
        <div className="w-full lg:w-1/2 px-4 mb-4">
          {languages.map((langag, i) => {
            return (
              <Field name={`${path}${key}.${language}`}>
                {({ field, form }) => {
                  return (
                    <button
                      className={`border ${
                        langag === language ? 'border-gray-400' : 'border-gray-300'
                      } rounded-lg p-3 text-sm text-gray-700 mr-3`}
                      key={path + langag + i}
                      type="button"
                      onClick={(e) => {
                        changeLanguage(e, langag)
                        const xd = form.getFieldProps(`${path}${key}.${langag}`)?.value
                        handleBlur(xd || '', `${key + parent}`, `${path}${key}`, true)
                      }}
                    >
                      {langag === language ? <b>{langag.toUpperCase()}</b> : langag.toUpperCase()}
                    </button>
                  )
                }}
              </Field>
            )
          })}
        </div>
        {errObj[`${path}${key}`] && <p className="my-1 ml-6 text-red-700">{errObj[`${path}${key}`]}</p>}
      </div>
    )
  } else {
    return (
      <div key={`${path}${key}`} className="lg:w-1/2 w-full px-4">
        <div className="mb-4">
          <div className="flex">
            <h2 className="mb-2 mx-2">{label?.['en'] || key || ''}</h2>
            <HelpBar value={description?.['en']} />
          </div>
          <Field name={`${path}${key}`}>
            {({ field, form }) => {
              const otherProp = { placeholder: placeholder?.['en'] || '', id: `${path}${key}` }
              return (
                <Datetime
                  {...field}
                  inputProps={otherProp}
                  className={`border border-${
                    errObj[`${path}${key}`] ? 'red' : 'gray'
                  }-400 rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-out`}
                  id={`${path}${key}`}
                  onChange={(e) => {
                    handleChangeFormValue(e._d?.getTime() || '', form, `${path}${key}`)
                  }}
                  onClose={() => handleBlur(field.value || '', `${key + parent}`, `${path}${key}`, true)}
                  required={validations[`${key + parent}`]?.['required']}
                />
              )
            }}
          </Field>
          <p className="my-1 text-red-700">{errObj[`${path}${key}`]}</p>
        </div>
      </div>
    )
  }
}

export default DateTimePickerInput
