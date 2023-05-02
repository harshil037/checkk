import { Field } from 'formik'
import React from 'react'

const Select = ({ name, label, options, className }) => {
  return (
    <Field name={name}>
      {({ field, form, meta }) => (
        <div className={className}>
          <label className="block mb-2 text-sm" htmlFor={name}>
            {label}
          </label>

          <select
            name={name}
            id={name}
            className="bg-white border outline-gray-400 border-gray-400 rounded-lg p-3 text-sm w-full select__list"
            {...field}
          >
            <option value={''}>Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </Field>
  )
}

export default React.memo(Select)
