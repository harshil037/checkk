import React from 'react'
import { Field } from 'formik'
import { Select } from '../componentLibrary'
import HelpBar from '../tool/helpBar'

const SelectInput = ({
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
  validations,
  parent,
  options,
  description,
  placeholder,
}) => {
  const key = componentKey
  if (languageBased === true || languageBased === 'true') {
    return (
      <div className="flex flex-wrap items-end" key={`${path}${key}.${language}`}>
        <div className="w-full lg:w-1/2  px-4 lg:mb-0 mb-3">
          <h2 className="ml-2 my-4 inline-block">{label?.['en'] || key || ''}</h2>
          <div className="inline-block">
            <HelpBar value={description?.[language]} />
          </div>
          <Field name={`${path}${key}.${language}`}>
            {({ field, form }) => {
              const value = field.value
              return (
                <Select
                  id={`${path}${key}.${language}`}
                  // className="select__list border border-gray-400 rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-outline"
                  variant="primary"
                  value={value ? value : ''}
                  {...field}
                  onChange={(e) => {
                    handleChangeFormValue(e.target.value, form, `${path}${key}.${language}`)
                  }}
                  onBlur={(e) => handleBlur(e, `${key + parent}`, `${path}${key}.${language}`)}
                  required={validations[`${key + parent}`]?.['required']}
                >
                  <option value="">
                    {placeholder?.[language]
                      ? placeholder?.[language]
                      : 'Please select ' + (label?.[language] ? label?.[language] : key || '')}
                  </option>
                  {options?.map((option, oi) => (
                    <option key={oi} value={option.value[language] ? option.value[language] : option.value}>
                      {option.title[language] ? option.title[language] : option.title}
                    </option>
                  ))}
                </Select>
              )
            }}
          </Field>
        </div>
        <div className="w-full lg:w-1/2 px-4">
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
        <p className="my-1 ml-6 text-red-700">{errObj[`${path}${key}`]}</p>
      </div>
    )
  } else {
    return (
      <div className="lg:w-1/2 w-full px-4" key={`${path}${key}`}>
        <div className="mb-4">
          <div className="flex my-4 mx-2">
            <h2>{label?.['en'] || key || ''}</h2>
            <HelpBar value={description?.['en']} />
          </div>

          <Field name={`${path}${key}`}>
            {({ field, form }) => {
              return (
                <Select
                  id={`${path}${key}`}
                  // className="select__list border border-gray-400 rounded-lg py-3 px-3 w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:shadow-outline"
                  {...field}
                  variant="primary"
                  onChange={(e) => {
                    handleChangeFormValue(e.target.value, form, `${path}${key}`)
                  }}
                  onBlur={(e) => handleBlur(e, `${key + parent}`, `${path}${key}`)}
                  required={validations[`${key + parent}`]?.['required']}
                >
                  <option value="">
                    {placeholder?.['en'] ? placeholder?.['en'] : 'Please select ' + label?.['en'] || key || ''}
                  </option>

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
}

export default SelectInput
