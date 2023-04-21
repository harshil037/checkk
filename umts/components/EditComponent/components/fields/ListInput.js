import { FieldArray } from 'formik'
import React from 'react'
import { getField } from './index'
import Button from '../../../common/Button'
import { buildDataObj } from '../../utils'

const ListInput = ({
  name,
  label,
  props,
  currentLanguage,
  formLanguages,
  accordion,
  handleAccordion,
  path,
  fieldKey,
  onLanguageChange,
  currentTheme,
  themes,
  onThemeChange,
  clientId,
}) => {
  return (
    <FieldArray name={name}>
      {({ push, remove, form }) => {
        const { value } = form.getFieldProps(name)

        return (
          <div className="w-full border border-gray-400 rounded-lg p-4">
            <label className="font-bold capitalize">{label}</label>

            {!!value?.length &&
              value?.map((item, index) => (
                <div key={`${name}[${index}]`} className="border border-gray-400 rounded-lg p-2 my-2 mb-3">
                  <div
                    className={`flex items-center justify-between cursor-pointer ${
                      accordion[`${name}[${index}]`] ? 'border-b border-b-black border-dashed pb-2' : ''
                    } `}
                    onClick={handleAccordion(path, fieldKey, index)}
                  >
                    <label className="font-medium text-sm pl-2">{label}</label>
                    <div className="flex items-center pr-4">
                      <Button
                        className="border border-red-500 mr-4 px-2 rounded-lg text-xs"
                        type="button"
                        onClick={() => remove(index)}
                        variant="danger"
                      >
                        Delete {label}
                        <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Langauge Delete"></img>
                      </Button>
                      <button type="button">
                        <img
                          className={`${accordion[`${name}[${index}]`] ? 'transform rotate-180' : ''}`}
                          src="/images/select-list.svg"
                          alt="Status"
                        />
                      </button>
                    </div>
                  </div>
                  {!!accordion[`${name}[${index}]`] && (
                    <div className="flex flex-wrap pt-1">
                      {props.map((listItem, i) =>
                        getField({
                          ...listItem,
                          path: `${name}[${index}].`,
                          currentLanguage,
                          formLanguages,
                          accordion,
                          handleAccordion,
                          onLanguageChange,
                          currentTheme,
                          themes,
                          onThemeChange,
                          clientId,
                        }),
                      )}
                    </div>
                  )}
                </div>
              ))}
            <Button
              className="border border-gray-400 rounded-lg px-4 py-1 block mt-4 text-sm"
              type="button"
              onClick={() => {
                push(buildDataObj(props, formLanguages))
              }}
              title={`Add ${label}`}
            >
              add {label}
              <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
            </Button>
          </div>
        )
      }}
    </FieldArray>
  )
}

export default ListInput
