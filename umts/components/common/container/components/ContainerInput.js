import React, { useState } from 'react'
import { Button } from '../../../componentLibrary'
import EditFieldIcon from '../../../icons/editField'

const ContainerInput = ({ header, children, editable, onEditField, accordion, handleAccordion, accordionPath }) => {
  return (
    <div className="w-full p-2 my-2">
      <div className="block w-full px-3 pt-1 border border-gray-400 border-solid rounded-md">
        <div className="flex flex-wrap items-center py-1 border-b border-black border-dashed sm:flex-nowrap">
          <h3 className="text-lg font-semibold text-gray-800">{header}</h3>{' '}
          {editable && (
            <span className="ml-2 -mb-1">
              {' '}
              <Button type="button" onClick={onEditField}>
                <EditFieldIcon className="fill-[#68D0C2]"></EditFieldIcon>
              </Button>
            </span>
          )}
          <div
            className="ml-auto cursor-pointer"
            onClick={() => {
              handleAccordion()
            }}
          >
            <img
              className={`inline-block  px-2 ${accordion[accordionPath] && 'transform rotate-180'}`}
              src="/images/select-list.svg"
              alt="Status"
            />
          </div>
        </div>
        <div className="py-2">{accordion[accordionPath] && children}</div>
      </div>
    </div>
  )
}

export default ContainerInput
