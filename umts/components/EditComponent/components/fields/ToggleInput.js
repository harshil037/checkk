import { Field } from 'formik'
import React from 'react'
import { Input } from '../../../componentLibrary'

const ToggleInput = ({ name, label, className = '' }) => {
  return (
    <Field name={name} type="checkbox">
      {({ field, form, meta }) => {
        return (
          <div className="flex items-center">
            <label className='text-sm'>{label}</label>
            <Input id={name} className={className} {...field} type="toggle" variant="primary" />
          </div>
        )
      }}
    </Field>
  )
}

export default React.memo(ToggleInput)
