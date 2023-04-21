import React, { useState } from 'react'

const MultiSelect = ({
  label = '',
  options = [],
  values = [],
  onChange = (values) => {},
  reset = false,
  onReset = () => {},
  onBlur = (values) => {},
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (value) => () => {
    const newValues = [...values]
    const index = newValues.indexOf(value)
    if (index > -1) {
      newValues.splice(index, 1)
    } else {
      newValues.push(value)
    }
    onChange(newValues)
  }

  const handleBlur = () => {
    setIsOpen(false)
    onBlur(values)
  }

  return (
    <div className="text-center relative" tabIndex={0} onBlur={handleBlur}>
      <div
        className="border border-green-500 flex items-center rounded-lg pr-1 pl-3 w-full text-gray-700"
        onClick={(e) => {
          setIsOpen(!isOpen)
        }}
      >
        <div className="w-full flex items-center">
          {reset && (
            <span
              className="text-xl cursor-pointer select-none"
              title="Reset Selection"
              onClick={(e) => {
                e.stopPropagation()
                onReset()
              }}
            >
              ⟳
            </span>
          )}
          <span className="mx-auto">{label}</span>
        </div>
        <div className="w-8 py-1 pl-2 border-l flex items-center border-gray-200 text-gray-600">
          <button type="button" className="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none">
            <svg version="1.1" className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <path
                d="M17.418,6.109c0.272-0.268,0.709-0.268,0.979,0s0.271,0.701,0,0.969l-7.908,7.83
                c-0.27,0.268-0.707,0.268-0.979,0l-7.908-7.83c-0.27-0.268-0.27-0.701,0-0.969c0.271-0.268,0.709-0.268,0.979,0L10,13.25
                L17.418,6.109z"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`absolute flex flex-col w-full bg-gray-50 z-10 overflow-y-auto max-h-40 rounded-lg shadow-md border-gray-400 border custom-scrollbar ${
          !isOpen && `hidden`
        }`}
      >
        {options.map((item, index) => (
          <div
            className="flex w-full items-center p-1 border-b hover:bg-gray-100 cursor-pointer border-gray-300 relative"
            key={item.value}
            onClick={handleChange(item.value)}
          >
            <div className="w-full items-center flex justify-between">
              <div className="mx-2 leading-6 text-sm text-gray-700">{item.title}</div>
              <div>
                {values.includes(item.value) && (
                  <svg className="svg-icon w-4 h-4" viewBox="0 0 20 20">
                    <path
                      fill="#333"
                      d="M7.197,16.963H7.195c-0.204,0-0.399-0.083-0.544-0.227l-6.039-6.082c-0.3-0.302-0.297-0.788,0.003-1.087
                  C0.919,9.266,1.404,9.269,1.702,9.57l5.495,5.536L18.221,4.083c0.301-0.301,0.787-0.301,1.087,0c0.301,0.3,0.301,0.787,0,1.087
                  L7.741,16.738C7.596,16.882,7.401,16.963,7.197,16.963z"
                    ></path>
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MultiSelect
