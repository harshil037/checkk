import React, { useEffect, useState } from 'react'
import { Form as FormikForm } from 'formik'
import { getField } from './fields'
import Button from '../../common/Button'

const Form = ({
  currentLanguage,
  onLanguageChange,
  formLanguages,
  fields,
  dirty,
  themes,
  currentTheme,
  onThemeChange,
  isSticky,
  isDirty,
  clientId,
}) => {
  const [accordion, setAccordion] = useState({})
  const [openEditPanel, setOpenEditPanel] = useState(false)

  useEffect(() => {
    setOpenEditPanel(dirty)
    if (isDirty) {
      isDirty(dirty)
    }
  }, [dirty])

  const handleAccordion =
    (path, key, index = null) =>
    () => {
      const newAccordion = { ...accordion }
      const associatedAccordionItem = Object.keys(newAccordion).filter((accordionItem) => accordionItem.includes(path))
      const currentAccordionItem = index !== null ? `${path}${key}[${index}]` : `${path}${key}`

      for (let i = 0; i < associatedAccordionItem.length; i++) {
        if (associatedAccordionItem[i] !== currentAccordionItem) newAccordion[associatedAccordionItem[i]] = false
      }

      newAccordion[currentAccordionItem] = !newAccordion[currentAccordionItem]
      setAccordion(newAccordion)
    }

  /**
   * Stop enter submitting the form.
   * @param keyEvent Event triggered when the user presses a key.
   */
  const onKeyDown = (keyEvent) => {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault()
    }
  }

  return (
    <div>
      <FormikForm onKeyDown={onKeyDown}>
        <div className="flex flex-wrap">
          {fields.map((field) =>
            getField({
              ...field,
              currentLanguage,
              formLanguages,
              accordion,
              handleAccordion,
              onLanguageChange,
              themes,
              currentTheme,
              onThemeChange,
              clientId,
            }),
          )}
        </div>
        <div className={`${isSticky ? 'fixed whitespace-nowrap bottom-36 right-4' : 'sticky bottom-0 right-0'}`}>
          <div
            className={`absolute bg-white border mt-2 z-20 border-primary-400 px-4 py-3 bottom-0 transform transition duration-500 ease inline-block ${
              openEditPanel ? 'border-r-0' : 'translate-x-full'
            }  ${dirty ? '-right-4' : '-right-12'}`}
          >
            <span
              onClick={() => {
                setOpenEditPanel(!openEditPanel)
              }}
              className="absolute p-2 transform -translate-x-full -translate-y-1/2 bg-white border border-solid rounded-full open-arrow top-1/2 left-2 border-primary-400"
            >
              {openEditPanel ? (
                <svg
                  className="block w-4 h-4 fill-current"
                  viewBox="0 0 256 512"
                  aria-hidden="true"
                  role="presentation"
                >
                  <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z"></path>
                </svg>
              ) : (
                <svg
                  className="block w-4 h-4 fill-current"
                  viewBox="0 0 256 512"
                  aria-hidden="true"
                  role="presentation"
                >
                  <path d="M238.475 475.535l7.071-7.07c4.686-4.686 4.686-12.284 0-16.971L50.053 256 245.546 60.506c4.686-4.686 4.686-12.284 0-16.971l-7.071-7.07c-4.686-4.686-12.284-4.686-16.97 0L10.454 247.515c-4.686 4.686-4.686 12.284 0 16.971l211.051 211.05c4.686 4.686 12.284 4.686 16.97-.001z"></path>
                </svg>
              )}
            </span>
            <div className="flex flex-col">
              {/* tabIndex -1 so that buttons do not focus on the press of tab key */}
              <Button type="submit" tabIndex={-1}>
                Save Changes
              </Button>
              <Button type="reset" variant="danger" className="mt-2" tabIndex={-1}>
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      </FormikForm>
    </div>
  )
}

export default Form
