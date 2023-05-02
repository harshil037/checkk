import { Field } from 'formik'
import React from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'

const DateTime = ({ name, label }) => {
  return (
    <Field name={name}>
      {({ field, form }) => {
        return (
          <>
            <label className="block mb-2">{label}</label>
            <Datetime
              className="border border-gray-400 rounded-lg p-2"
              value={field.value ? new Date(field.value) : ''}
              onChange={(date) => form.setFieldValue(name, date?.toDate ? date.toDate().getTime() : '')}
            />
          </>
        )
      }}
    </Field>
  )
}

export default React.memo(DateTime)
