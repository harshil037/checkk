import React from 'react'
import { useState } from 'react'
import SingleRow from '../shared/singleRow'
import { Input } from '../componentLibrary'
import Button from '../common/Button'

const StaticListComposition = ({
  header,
  path,
  onDelete,
  onTemplate,
  children,
  accordion,
  handleAccordion,
  isService = false,
  isSelected = false,
  formikValues,
}) => {
  const [toggleVal, setToggleVal] = useState(isSelected || false)
  return (
    <SingleRow>
      <div className="w-full px-4">
        <div className="block w-full p-4 border border-gray-300 border-solid rounded-xl">
          <div className="flex flex-wrap items-center pb-2 border-b border-black border-dashed sm:flex-nowrap">
            <h3 className="text-lg font-semibold text-gray-800">{header}</h3>
            <div className={`flex items-center ${!isService && 'hidden'}`}>
              <Input
                id={`${path}`}
                type="toggle"
                variant="primary"
                value={toggleVal}
                checked={toggleVal}
                onChange={(e) => {
                  if (e.target.id === path) {
                    setToggleVal(e.target.checked)
                  }
                  // add isSelected true for selected services
                  const pathArr = path.split('.')
                  const code = pathArr.pop()
                  let p
                  for (let i = 0; i < pathArr.length; i++) {
                    p = formikValues[pathArr[i]]
                  }
                  p[code].isSelected = e.target.checked
                }}
              />
            </div>

            {onDelete && (
              <Button variant="danger" className="ml-4" onClick={onDelete}>
                Delete
                <img className="inline-block px-2" src="/images/langaugedelete.svg" alt="Langauge Delete" />
              </Button>
            )}
            {onTemplate && (
              <Button variant="Primary" className="ml-4" onClick={onTemplate}>
                Template
              </Button>
            )}
            <div className="ml-auto cursor-pointer" onClick={() => handleAccordion(path)}>
              <img
                className={`inline-block  px-2 ${accordion[path] && 'transform rotate-180'}`}
                src="/images/select-list.svg"
                alt="Status"
              />
            </div>
          </div>
          <div className="prop-list">{children}</div>
        </div>
      </div>
    </SingleRow>
  )
}

export default StaticListComposition
