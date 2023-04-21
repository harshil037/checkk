import React from 'react'
import MultiSelection from '../../../common/MultiSelect'
import { Field } from 'formik'

const MultiSelect = ({ name, label, className = '', options }) => {
  const getValues = (values = []) => values.map((item) => options.find((option) => option.value === item))

  const handleChange = (field) => (values) => {
    field.onChange({
      target: {
        value: values.map((item) => item.value),
        name: field.name,
      },
    })
  }

  return (
    <Field name={name}>
      {({ field, form, meta }) => {
        return (
          <div className={className}>
            <label className="block mb-2 text-sm" htmlFor={name}>
              {label}
            </label>
            <MultiSelection
              options={options}
              value={getValues(field.value)}
              name={name}
              id={name}
              onChange={handleChange(field)}
            />
          </div>
        )
      }}
    </Field>
  )
}

export default React.memo(MultiSelect)
