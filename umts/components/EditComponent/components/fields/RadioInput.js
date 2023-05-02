import React from 'react'
import { Field } from 'formik'
import { Input } from '../../../componentLibrary'

const RadioInput = ({ name, options, label, className }) => {
  return (
    <div className={className}>
      <label className="block mb-2">{label}</label>
      <div className="flex">
        {options.map((option) => (
          <Field name={name} type="radio" value={option.value} key={option.value}>
            {({ field, form }) => {
              return (
                <Input title={option.title} type="radio" variant="primary" id={`${name}-${option.value}`} {...field} />
              )
            }}
          </Field>
        ))}
      </div>
    </div>
  )
}

export default React.memo(RadioInput)
