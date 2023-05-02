import React from 'react'
import { getField } from '.'

const StaticList = ({
  name,
  label,
  props,
  currentLanguage,
  formLanguages,
  accordion,
  handleAccordion,
  onLanguageChange,
  path,
  fieldKey,
  currentTheme,
  themes,
  onThemeChange,
  clientId,
}) => {
  return (
    <div className="border border-gray-400 rounded-lg p-2 mt-2">
      <div
        className={`flex items-center justify-between cursor-pointer ${
          accordion[`${name}`] ? 'border-b border-b-black border-dashed pb-2 mb-2 py-1' : 'py-1'
        }`}
        onClick={handleAccordion(path, fieldKey)}
      >
        <label className="pl-2 text-lg text-gray-800 font-semibold capitalize">{label}</label>
        <div className="flex items-center">
          <button type="button">
            <img
              className={`${accordion[`${name}`] ? 'transform rotate-180' : ''}`}
              src="/images/select-list.svg"
              alt="Status"
            />
          </button>
        </div>
      </div>
      {!!accordion[`${name}`] && (
        <div className="flex flex-wrap">
          {props.map((item) =>
            getField({
              ...item,
              path: `${name}.`,
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
  )
}

export default StaticList
