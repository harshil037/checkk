import React from 'react'
import { Field } from 'formik'
import { Input } from '../componentLibrary'
import HelpBar from '../tool/helpBar'

const ToggleInput = ({
  language = 'en',
  path = '',
  componentKey,
  label,
  errObj,
  handleChangeFormValue,
  description,
  validations,
  parent,
}) => {
  const key = componentKey
  return (
    <div key={`${path}${key}`} className="w-full px-4 lg:mt-5 lg:w-1/2">
      <div className="flex py-1">
        <h2 className="mx-2 my-2">{label?.['en'] || key || ''}</h2>
        <HelpBar isToggle={true} value={description?.[language]} />
        <Field name={`${path}${key}`}>
          {({ field, form }) => {
            return (
              <div className="flex items-center">
                <Input
                  type="toggle"
                  id={`${path}${key}`}
                  variant="primary"
                  {...field}
                  checked={field.value}
                  required={validations[`${key + parent}`]?.['required']}
                  onChange={(e) => {
                    form.setTouched({ ...form.touched, [`${path}${key}`]: true })
                    handleChangeFormValue(e.target.checked, form, `${path}${key}`)
                  }}
                />
              </div>
            )
          }}
        </Field>
      </div>
      {/* for showing error if user enters invalid data */}
      <p className="my-1 text-red-700">{errObj[`${path}${key}`]}</p>
    </div>
  )
}
export default ToggleInput
