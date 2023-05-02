import React from 'react'
import { Field } from 'formik'
import { Input } from '../componentLibrary'
import HelpBar from '../tool/helpBar'

const LinkInput = ({
  languages = [],
  language = 'en',
  path = '',
  componentKey,
  label,
  languageBased = false,
  changeLanguage,
  handleChangeFormValue,
  description,
  placeholder,
}) => {
  const key = componentKey
  if (languageBased === true || languageBased === 'true') {
    return (
      <div className="p-4 rounded-lg m-4 border border-gray-300" key={`${path}${key}`}>
        <div className="flex">
          <h2 className="text-lg">{label?.[language] || key || ''}</h2>
          <div className="m-1">
            <HelpBar value={description?.[language]} />
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="w-1/3 py-2">
            <Field name={`${path}${key}.title.${language}`}>
              {({ field, form }) => {
                const value = field.value || ''
                return (
                  <Input
                    onChange={(e) => handleChangeFormValue(e.target.value, form, `${path}${key}.title.${language}`)}
                    value={value}
                    id={`${path}${key}.title.${language}`}
                    type="text"
                    variant="primary"
                    placeholder={placeholder?.title?.[language]}
                  />
                )
              }}
            </Field>
          </div>
          <div className="ml-4 w-1/3 py-2">
            <Field name={`${path}${key}.link.${language}`}>
              {({ field, form }) => {
                const value = field.value || ''
                return (
                  <Input
                    onChange={(e) => handleChangeFormValue(e.target.value, form, `${path}${key}.link.${language}`)}
                    value={value}
                    variant="primary"
                    id={`${path}${key}.link.${language}`}
                    type="text"
                    placeholder={placeholder?.link?.[language]}
                  />
                )
              }}
            </Field>
          </div>
          <div className="sm:ml-4 ml-0 sm:w-1/4 w-full flex flex-wrap sm:mt-0 mt-4">
            <Field name={`${path}${key}.targetBlank.${language}`}>
              {({ field, form }) => {
                return (
                  <div className="flex items-cente h-full">
                    <p>Target blank</p>
                    <Input
                      type="toggle"
                      id={`${path}${key}.targetBlank.${language}`}
                      variant="primary"
                      checked={field.value}
                      onChange={(e) => {
                        handleChangeFormValue(e.target.checked, form, `${path}${key}.targetBlank.${language}`)
                      }}
                    />
                  </div>
                )
              }}
            </Field>
            <div className="px-4 inline-block">
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
        </div>
      </div>
    )
  } else {
    return (
      <div className="p-4 w-full rounded-lg m-4 border border-gray-300" key={`${path}${key}`}>
        <div className="flex">
          <h2 className="text-lg">{label?.['en'] || key || ''}</h2>
          <div className="mt-1">
            <HelpBar value={description?.['en']} />
          </div>
        </div>

        <div className="flex items-center">
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
          <div className="ml-4 w-1/3 py-2">
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
          <div className="ml-4 w-1/4">
            <Field name={`${path}${key}.targetBlank`}>
              {({ field, form }) => {
                return (
                  <div className="flex items-center h-full">
                    <p>Target blank</p>
                    <Input
                      type="toggle"
                      id={`${path}${key}.targetBlank`}
                      variant="primary"
                      {...field}
                      checked={field.value}
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
}

export default LinkInput
