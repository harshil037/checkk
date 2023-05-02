import React, { useState, useEffect, useRef } from 'react'
import Button from '../common/Button'
import { Input } from '../componentLibrary'
import PopUp from '../dialog/popUp'
import ColorInput from './colorInput'
import TextInput from './textInput'

const EditStyles = ({ title, property, styles, setStyles, defaultOpen = false, currentTheme, usedStyles }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [height, setHeight] = useState(0)
  const [addStylePopUp, setAddStylePopUp] = useState({ open: false, name: '' })

  const accordianRef = useRef(null)

  useEffect(() => {
    if (accordianRef.current && height === 0) {
      setHeight(() => accordianRef.current.clientHeight)
      setIsOpen(defaultOpen)
    }
  }, [accordianRef])

  useEffect(() => {
    setHeight(() => 0)
    if (accordianRef.current && height === 0) {
      setHeight(() => accordianRef.current.clientHeight)
      // setIsOpen(defaultOpen)
    }
  }, [accordianRef?.current?.childNodes?.length])

  return (
    <>
      <div className="px-4 border border-gray-400 rounded-lg">
        <div
          className={`py-3 flex justify-between items-center ${isOpen ? 'border-b border-dashed border-black' : ''}`}
        >
          <div className="text-base font-medium">{title}</div>
          <div>
            {property.type === 'custom' && (
              <Button
                className="text-xs mr-3"
                onClick={() => {
                  setAddStylePopUp((prev) => ({ ...prev, open: true }))
                }}
              >
                Add Style
              </Button>
            )}
            <img
              className={`inline-block w-5 h-5 cursor-pointer transition-all ease-linear duration-400 ${
                isOpen && 'transform rotate-180'
              }`}
              src="/images/select-list.svg"
              alt="Status"
              onClick={() => setIsOpen(!isOpen)}
            />
          </div>
        </div>
        <div
          className={`${
            isOpen ? 'py-4' : 'h-0 overflow-hidden'
          } transition-all flex flex-wrap ease-in-out duration-400`}
          ref={accordianRef}
          style={isOpen ? (height > 0 ? { height: height - 20 + 'px' } : {}) : { height: 0, overflow: 'hidden' }}
        >
          {Object.keys(styles[currentTheme][property.key]).map((style) => (
            <div className="mb-4 w-1/3 px-4" key={style}>
              <label className="mb-1 inline-block capitalize">
                {style
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/-/, ' - ')
                  .replace(/(?=-[a-zA-Z0-9]+)(.)/g, ' ')}
              </label>

              {property.type === 'color' ? (
                <ColorInput
                  value={styles[currentTheme][property.key][style]}
                  onChange={(color) => {
                    const newStyles = { ...styles }
                    newStyles[currentTheme][property.key][style] = color
                    setStyles(newStyles)
                  }}
                  usedStyles={usedStyles}
                />
              ) : (
                <TextInput
                  variant="primary"
                  value={styles[currentTheme][property.key][style]}
                  onChange={(e) => {
                    const newStyles = { ...styles }
                    newStyles[currentTheme][property.key][style] = e.target.value
                    setStyles(newStyles)
                  }}
                  usedStyles={usedStyles}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <PopUp openModal={addStylePopUp.open}>
        <div className="bg-white md:w-2/5 2xl:w-2/6 mx-auto mt-48 px-4 pt-2 pb-4 rounded-lg">
          <div className="border-b border-b-black py-2">
            <h4>Add Style</h4>
          </div>
          <div className="p-2">
            <label htmlFor="style-name" className="block mb-2">
              Name :
            </label>
            <Input
              variant="primary"
              id="style-name"
              className="mb-4"
              value={addStylePopUp.name}
              onChange={(e) => setAddStylePopUp((prev) => ({ ...prev, name: e.target.value.trim() }))}
            />
            <div className="text-right">
              <Button
                filled={true}
                onClick={() => {
                  if (addStylePopUp.name) {
                    setStyles((prev) => ({
                      ...prev,
                      [currentTheme]: {
                        ...prev[currentTheme],
                        [property.key]: { ...prev[currentTheme][property.key], [addStylePopUp.name]: '' },
                      },
                    }))
                    setAddStylePopUp((prev) => ({ open: false, name: '' }))
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </PopUp>
    </>
  )
}

export default EditStyles
