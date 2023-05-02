import React, { useState, useEffect } from 'react'
import { Input } from '../../../componentLibrary'
import Button from '../../Button'
import EditFieldIcon from '../../../icons/editField'

const ListInput = ({
  // path,
  languageBased = false,
  languages,
  label,
  placeholder,
  value,
  currentLanguage,
  variant = 'primary',
  componentKey,
  editable = false,
  onChange = () => {},
  onLanguageChange = () => {},
  onEditField = () => {},
}) => {
  const [values, setValues] = useState(value)

  const handleChange = (index) => (e) => {
    if (languageBased) {
      const val = { ...values }
      val[currentLanguage][index] = e.target.value
      setValues(val)
    } else {
      const val = [...values]
      val[index] = e.target.value
      setValues(val)
    }
  }

  const addListItem = () => {
    if (languageBased) {
      setValues((prev) => ({ ...prev, [currentLanguage]: [...prev[currentLanguage], ''] }))
    } else {
      setValues((prev) => [...prev, ''])
    }
  }

  const removeListItem = (index) => () => {
    if (languageBased) {
      const list = { ...values }
      list[currentLanguage].splice(index, 1)
      setValues(list)
    } else {
      const list = [...values]
      list.splice(index, 1)
      setValues(list)
    }
  }

  useEffect(() => {
    onChange(values)
  }, [values])

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

        {value &&
          value[currentLanguage].map((value, index) => (
            <div className="flex my-1" key={componentKey + '-' + index}>
              <Input
                className="px-4 py-2 w-1/2"
                variant={variant}
                placeholder={placeholder}
                value={value}
                onChange={handleChange(index)}
              />
              <Button className="inline-block mx-3" onClick={removeListItem(index)}>
                <img className="inline" src="/images/langaugedelete.svg" alt="Products" />
              </Button>
            </div>
          ))}
        <div className="flex items-center w-full">
          <Button variant="primary" className="block mt-1" type="button" onClick={addListItem}>
            Add {label}
            <img className="inline-block px-2" src="/images/plus-bar.svg" alt="plus" />
          </Button>
          {languages?.map((lang) => {
            return (
              <button
                className={`border ${
                  lang === currentLanguage ? 'border-gray-400' : 'border-gray-300'
                } rounded-lg px-3 py-2 text-sm text-gray-700 ml-3 mt-1`}
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
        {value &&
          value.map((value, index) => (
            <div className="flex my-1" key={componentKey + '-' + index}>
              <Input
                className="px-4 py-2"
                variant={variant}
                placeholder={placeholder}
                value={value}
                onChange={handleChange(index)}
              />
              <Button className="inline-block mx-3" onClick={removeListItem(index)}>
                <img className="inline" src="/images/langaugedelete.svg" alt="Products" />
              </Button>
            </div>
          ))}
        <Button variant="primary" className="block mt-1" type="button" onClick={addListItem}>
          Add {label}
          <img className="inline-block px-2" src="/images/plus-bar.svg" alt="plus" />
        </Button>
      </div>
    )
  }
}

export default ListInput
