import React, { useState } from 'react'
import { Input, Button } from '../../../componentLibrary'
import EditFieldIcon from '../../../icons/editField'

const TextInput = ({
  path = '',
  languageBased = false,
  languages,
  label,
  placeholder,
  value,
  onChange = () => {},
  onLanguageChange = () => {},
  currentLanguage = 'en',
  variant = 'primary',
  editable = false,
  onEditField = () => {},
  values,
  focusedField,
  handleFocusField = () => {},
  setFocusValue = () => {},
  handleBlur = () => {},
  errorMsg = '',
}) => {
  if (languageBased) {
    return (
      <div className="w-full p-2 my-2">
        <div className="flex items-center mb-2">
          <label className="text-gray-600">{label} :</label>{' '}
          {editable && (
            <span className="ml-2 -mb-1">
              {' '}
              <Button type="button" onClick={onEditField}>
                <EditFieldIcon className="fill-[#68D0C2]"></EditFieldIcon>
              </Button>
            </span>
          )}
        </div>
        <div className="flex">
          <div className="relative w-1/2">
            <Input
              className="px-4 py-2"
              variant={variant}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onFocus={() => handleFocusField(path)}
              onBlur={(e) => {
                handleFocusField('')
                handleBlur(e)
              }}
            />
            {errorMsg.length > 0 && <p className="text-red-400">{errorMsg}</p>}
            <div>
              {focusedField == path ? (
                <div className="w-full autoComplete">
                  {languages.map((item, i) => {
                    if (item !== currentLanguage) {
                      const lanValue = values[item]
                      if (lanValue) {
                        return (
                          <p
                            key={i}
                            className="p-1 cursor-pointer autoComplete-p"
                            onMouseDown={() => {
                              setFocusValue(`${path}`, currentLanguage, lanValue)
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
          </div>
          <div className="w-full px-4 lg:w-1/2">
            {languages?.map((lang) => {
              return (
                <button
                  className={`border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 mr-3 mt-1`}
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                >
                  {lang === currentLanguage ? <b>{lang.toUpperCase()}</b> : lang.toUpperCase()}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="w-1/2 p-2 my-2">
        <div className="flex items-center mb-2">
          <label className="text-gray-600">{label} :</label>{' '}
          {editable && (
            <span className="ml-2 -mb-1">
              {' '}
              <Button type="button" onClick={onEditField}>
                <EditFieldIcon className="fill-[#68D0C2]"></EditFieldIcon>
              </Button>
            </span>
          )}
        </div>
        <Input className="px-4 py-2" variant={variant} placeholder={placeholder} value={value} onChange={onChange} />
        {errorMsg.length > 0 && <p className="text-red-400">{errorMsg}</p>}
      </div>
    )
  }
}

export default TextInput
