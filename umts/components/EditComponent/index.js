import React, { forwardRef, useMemo, useRef, useEffect, useImperativeHandle } from 'react'
import { buildDataObj } from './utils'
import { Formik } from 'formik'
import Form from './components/Form'
import { isEqual } from '../../lib/utils'

const EditComponent = (
  {
    fields = [],
    languages = [],
    value = {},
    currentLanguage = 'en',
    themes = [],
    currentTheme = 'default',
    isSticky = false,
    clientId = '',
    isDirty,
    onThemeChange,
    onReset,
    onLanguageChange,
    onSubmit,
  },
  ref,
) => {
  const formRef = useRef(null)

  const initialValues = useMemo(() => buildDataObj(fields, languages, value, themes), [value])

  useEffect(() => {
    if (formRef?.current && formRef?.current?.values) {
      const newValues = buildDataObj(fields, languages, formRef.current.values, themes)

      if (!isEqual(formRef.current.values, newValues)) {
        formRef.current.setValues(newValues)
      }
    }
  }, [fields, languages, themes])

  useImperativeHandle(
    ref,
    () => {
      if (formRef.current) {
        return formRef.current
      } else {
        return null
      }
    },
    [formRef, formRef.current],
  )

  if (Object.keys(initialValues).length === 0) {
    return <></>
  }
  return (
    <Formik initialValues={initialValues} innerRef={formRef} onSubmit={onSubmit} onReset={onReset} enableReinitialize>
      {(props) => (
        <Form
          fields={fields}
          formLanguages={languages}
          onLanguageChange={onLanguageChange}
          currentLanguage={currentLanguage}
          themes={themes}
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
          isSticky={isSticky}
          isDirty={isDirty ? isDirty : null}
          clientId={clientId}
          {...props}
        />
      )}
    </Formik>
  )
}

export default forwardRef(EditComponent)
