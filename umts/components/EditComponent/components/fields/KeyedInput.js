import { Field, FieldArray } from 'formik'
import React from 'react'
import Button from '../../../common/Button'

const KeyedInput = ({ name, label, type, languageBased, languages, currentLanguage, onLanguageChange }) => {
  if (languageBased) {
    if (type === 'object') {
      return (
        <Field name={name}>
          {({ field, form }) => {
            const values = field.value
            const fields = Object.keys(values)

            return (
              <div>
                <label className="block mb-2">{label}</label>
                {fields.map((item, index) => {
                  const value = values[item]

                  return (
                    <div className="flex mb-2" key={`${name}-${index}`}>
                      <div className="w-1/6 pr-1">
                        <input
                          type="text"
                          placeholder="key"
                          className="border border-gray-400 rounded-lg p-2 w-full outline-gray-400 "
                          onChange={(e) => {
                            const newValues = { ...values, [e.target.value]: value }
                            delete newValues[item]
                            form.setFieldValue(name, newValues)
                          }}
                          value={item}
                        />
                      </div>
                      <div className="w-2/6 pl-1">
                        <input
                          type="text"
                          placeholder="value"
                          className="border border-gray-400 rounded-lg p-2 w-full outline-gray-400 "
                          onChange={(e) => {
                            form.setFieldValue(`${name}.${item}.${currentLanguage}`, e.target.value)
                          }}
                          value={value[currentLanguage]}
                        />
                      </div>
                      <div className="w-2/6 pl-1">
                        {languages.map((language) => (
                          <button
                            type="button"
                            className={`rounded-lg p-2 mx-2 ${
                              language === currentLanguage ? 'border-2 font-bold' : 'border'
                            } border-gray-400`}
                            key={language}
                            onClick={() => onLanguageChange(language)}
                          >
                            {language}
                          </button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="danger"
                        className="ml-2"
                        onClick={() => {
                          const newValues = { ...values }
                          delete newValues[item]
                          form.setFieldValue(name, newValues)
                        }}
                      >
                        <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="delete" />
                      </Button>
                    </div>
                  )
                })}
                <Button
                  type="button"
                  onClick={() => {
                    form.setFieldValue(name, {
                      ...values,
                      ...{ '': languages.reduce((acc, curr) => ({ ...acc, [curr]: '' }), {}) },
                    })
                  }}
                >
                  + Add {label}
                </Button>
              </div>
            )
          }}
        </Field>
      )
    } else {
      return (
        <FieldArray name={name}>
          {({ push, remove, form }) => {
            const values = form.getFieldProps(name).value

            return (
              <div>
                <label className="block mb-2">{label}</label>
                {values.map((_, index) => {
                  const object = form.getFieldProps(`${name}[${index}]`).value
                  const [key] = Object.keys(object)
                  const value = object[key]

                  return (
                    <div key={index} className="mb-2 flex flex-wrap">
                      <div className="w-1/6 pr-1">
                        <input
                          type="text"
                          placeholder="key"
                          className="border border-gray-400 rounded-lg p-2 w-full outline-gray-400 "
                          onChange={(e) => {
                            form.setFieldValue(`${name}[${index}]`, { [e.target.value]: value })
                          }}
                          value={key}
                        />
                      </div>
                      <div className="w-2/5 pl-1">
                        <input
                          type="text"
                          placeholder="value"
                          className="border border-gray-400 rounded-lg p-2 w-full outline-gray-400 "
                          onChange={(e) => {
                            form.setFieldValue(`${name}[${index}].${key}.${currentLanguage}`, e.target.value)
                          }}
                          value={value[currentLanguage]}
                        />
                      </div>
                      <div className="w-2/6 pl-1">
                        {languages.map((language) => (
                          <button
                            type="button"
                            className={`rounded-lg p-2 mx-2 ${
                              language === currentLanguage ? 'border-2 font-bold' : 'border'
                            } border-gray-400`}
                            key={language}
                            onClick={() => onLanguageChange(language)}
                          >
                            {language}
                          </button>
                        ))}
                      </div>
                      <Button type="button" variant="danger" className="ml-2" onClick={() => remove(index)}>
                        <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="delete" />
                      </Button>
                    </div>
                  )
                })}
                <Button
                  type="button"
                  onClick={() => {
                    push({ '': languages.reduce((acc, curr) => ({ ...acc, [curr]: '' }), {}) })
                  }}
                >
                  Add {label} <img className="inline-block px-2" src="/images/plus-bar.svg" alt="add" />
                </Button>
              </div>
            )
          }}
        </FieldArray>
      )
    }
  } else {
    if (type === 'object') {
      return (
        <Field name={name}>
          {({ field, form }) => {
            const values = field.value
            const fields = Object.keys(values)

            return (
              <div>
                <label className="block mb-2">{label}</label>
                {fields.map((item, index) => {
                  const value = values[item]
                  return (
                    <div className="flex mb-2" key={`${name}-${index}`}>
                      <div className="w-2/5 pr-1">
                        <input
                          type="text"
                          placeholder="key"
                          className="border border-gray-400 rounded-lg p-2 w-full outline-gray-400 "
                          onChange={(e) => {
                            const newValues = { ...values, [e.target.value]: value }
                            delete newValues[item]
                            form.setFieldValue(name, newValues)
                          }}
                          value={item}
                        />
                      </div>
                      <div className="w-2/5 pl-1">
                        <input
                          type="text"
                          placeholder="value"
                          className="border border-gray-400 rounded-lg p-2 w-full outline-gray-400 "
                          onChange={(e) => {
                            form.setFieldValue(`${name}.${item}`, e.target.value)
                          }}
                          value={value}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="danger"
                        className="ml-2"
                        onClick={() => {
                          const newValues = { ...values }
                          delete newValues[item]
                          form.setFieldValue(name, newValues)
                        }}
                      >
                        <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="delete" />
                      </Button>
                    </div>
                  )
                })}
                <Button
                  type="button"
                  onClick={() => {
                    form.setFieldValue(name, { ...values, ...{ '': '' } })
                  }}
                >
                  + Add {label}
                </Button>
              </div>
            )
          }}
        </Field>
      )
    } else {
      return (
        <FieldArray name={name}>
          {({ push, remove, form }) => {
            const values = form.getFieldProps(name).value

            return (
              <div>
                <label className="block mb-2">{label}</label>
                {values.map((_, index) => {
                  const object = form.getFieldProps(`${name}[${index}]`).value
                  const key = Object.keys(object)
                  const value = object[key[0]]
                  return (
                    <div key={index} className="mb-2 flex flex-wrap">
                      <div className="w-2/5 pr-1">
                        <input
                          type="text"
                          placeholder="key"
                          className="border border-gray-400 rounded-lg p-2 w-full outline-gray-400 "
                          onChange={(e) => {
                            form.setFieldValue(`${name}[${index}]`, { [e.target.value]: value })
                          }}
                          value={key[0]}
                        />
                      </div>
                      <div className="w-2/5 pl-1">
                        <input
                          type="text"
                          placeholder="value"
                          className="border border-gray-400 rounded-lg p-2 w-full outline-gray-400 "
                          onChange={(e) => {
                            form.setFieldValue(`${name}[${index}]`, { [key[0]]: e.target.value })
                          }}
                          value={value}
                        />
                      </div>
                      <Button type="button" variant="danger" className="ml-2" onClick={() => remove(index)}>
                        <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="delete" />
                      </Button>
                    </div>
                  )
                })}
                <Button
                  type="button"
                  onClick={() => {
                    push({ '': '' })
                  }}
                >
                  Add {label} <img className="inline-block px-2" src="/images/plus-bar.svg" alt="add" />
                </Button>
              </div>
            )
          }}
        </FieldArray>
      )
    }
  }
}

export default React.memo(KeyedInput)
