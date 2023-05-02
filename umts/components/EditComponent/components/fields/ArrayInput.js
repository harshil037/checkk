import React from 'react'
import { FieldArray, Field } from 'formik'
import Button from '../../../common/Button'

const ArrayInput = ({ name, label, className = '', type = 'text', placeholder = '' }) => {
  return (
    <div className={className}>
      <label className="block mb-4">{label}</label>
      <FieldArray name={name}>
        {({ push, remove, form }) => {
          const { value } = form.getFieldProps(name)
          return (
            <div className="pl-2">
              <div>
                {value?.map((item, index) => (
                  <Field name={`${name}[${index}]`} key={index}>
                    {({ field, form, meta }) => {
                      return (
                        <div className="flex items-center mb-2">
                          <input
                            type={type}
                            placeholder={placeholder}
                            className="border border-gray-400 rounded-lg p-2 w-1/2 outline-gray-400 text-sm"
                            {...field}
                          />
                          <div className="w-1/2 flex pl-4">
                            <Button
                              variant="danger"
                              className="border border-gray-400 hover:border-gray-600 rounded-lg p-4 outline-gray-400"
                              type="button"
                              onClick={() => remove(index)}
                            >
                              <img src="/images/trash.svg" />
                            </Button>
                          </div>
                        </div>
                      )
                    }}
                  </Field>
                ))}
              </div>
              <Button
                type="button"
                variant="primary"
                className="border border-gray-400 px-2 py-1 text-sm rounded-lg outline-gray-400"
                onClick={() => push('')}
                title={`Add ${label}`}
              >
                add {label}
                <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
              </Button>
            </div>
          )
        }}
      </FieldArray>
    </div>
  )
}

export default React.memo(ArrayInput)
