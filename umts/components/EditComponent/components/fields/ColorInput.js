import { Field } from 'formik'
import React from 'react'
import ColorInput from '../../../stylesConfigPage/colorInput'

const ColorField = ({ name, label, className }) => {
  return (
    <div className={className}>
      <label className="block mb-2 text-sm">{label}</label>
      <Field name={name}>
        {({ field, form, meta }) => {
          return <ColorInput id={name} onChange={(color) => form.setFieldValue(name, color)} value={field.value} />
        }}
      </Field>
    </div>
  )
}

export default React.memo(ColorField)
