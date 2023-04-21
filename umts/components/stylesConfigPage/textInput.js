import React, { useState, useEffect } from 'react'
import { Input } from '../componentLibrary'

const TextInput = ({ value = '', onChange = (event) => {}, id, usedStyles }) => {
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (usedStyles?.length) {
      setSuggestions(() => usedStyles.filter((style) => !style.includes('#') && style !== value))
    }
  }, [usedStyles])

  return (
    <div className="flex w-full items-center">
      <div className="w-full relative">
        <Input
          variant="primary"
          value={value}
          id={id}
          onChange={onChange}
          onFocus={() => setShowSuggestion(true)}
          onBlur={() => setShowSuggestion(false)}
          autoComplete="off"
        />
        {showSuggestion && suggestions.length > 0 && (
          <div className="border border-gray-400 w-full absolute bg-white z-50 shadow-lg max-h-44 overflow-auto custom-scrollbar scroll-md">
            {suggestions.map((style) => (
              <p
                key={style}
                className="px-2 cursor-pointer hover:bg-gray-100 py-1"
                onMouseDown={() => onChange({ target: { value: style } })}
              >
                {style}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TextInput
