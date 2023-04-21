import React from 'react'
import { Field } from 'formik'
import { Input } from '../componentLibrary'
import HelpBar from '../tool/helpBar'

const RadioInput = ({
  languages = [],
  language = 'en',
  path = '',
  componentKey,
  label,
  languageBased = false,
  changeLanguage,
  options,
  description,
}) => {
  const key = componentKey

  if (languageBased) {
    return (
      <div key={`${path}${key}`} className="px-4 w-full my-4 flex items-center flex-wrap">
        <div className="flex my-4">
          <h2 className="mx-2 sm:w-auto w-full mr-1">{label?.[language] || key || ''}</h2>
          <HelpBar value={description?.[language]} />
        </div>
        <div className="flex w-full lg:w-1/3" role="group" aria-labelledby={`${path}-${key}-group`}>
          {options.map((option, index) => {
            return (
              <Field
                type="radio"
                name={`${path}${key}.${language}`}
                value={option.value[language] ? option.value[language] : option.value['en'] || option.value}
                key={`${path}${key}${option.title[language]}-${index}`}
              >
                {({ field, form }) => {
                  return (
                    <Input
                      id={`${path}${key}${option.title[language] || option.title['en'] || option.title}-${index}`}
                      type="radio"
                      title={option.title[language] ? option.title[language] : option.title['en'] || option.title}
                      variant="primary"
                      {...field}
                    />
                  )
                }}
              </Field>
            )
          })}
        </div>
        <div className="w-full lg:w-1/3 px-4 lg:mt-0 mt-4">
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
    )
  } else {
    return (
      <div
        key={`${path}${key}`}
        className="lg:mt-5 lg:w-1/2 w-full px-4 flex flex-wrap"
        role="group"
        aria-labelledby={`${path}-${key}-group`}
      >
        <div className="flex my-4">
          <h2 className="mx-2 sm:w-auto w-full mr-1">{label?.['en'] || key || ''}</h2>
          <HelpBar value={description?.['en']} />
        </div>

        {options.map((option, index) => {
          return (
            <Field type="radio" name={`${path}${key}`} value={option.value} key={index}>
              {({ field, form }) => {
                return (
                  <Input
                    id={`${path}${key}${option.title}`}
                    type="radio"
                    title={option.title}
                    variant="primary"
                    {...field}
                  />
                )
              }}
            </Field>
          )
        })}
      </div>
    )
  }
}

export default RadioInput
