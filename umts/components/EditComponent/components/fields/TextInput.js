import React from 'react'
import { Field } from 'formik'

const TextInput = ({ name, label, type = 'text', placeholder, className = '' }) => {
  return (
    <Field name={name}>
      {({ field, form, meta }) => {
        return (
          <div className={className}>
            <label className="block mb-2 ml-1 text-sm capitalize" htmlFor={name}>
              {label}
            </label>
            <input
              type={type}
              id={name}
              placeholder={placeholder}
              className="border border-gray-400 rounded-lg p-3 text-sm w-full outline-gray-400"
              name={field.name}
              value={field.value || ''}
              onChange={field.onChange}
            />
          </div>
        )
      }}
    </Field>
  )
}

export default React.memo(TextInput)
