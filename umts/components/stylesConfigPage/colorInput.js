import React, { useState, useEffect, useRef } from 'react'
import { Input } from '../componentLibrary'
import { SketchPicker } from 'react-color'

const rgbaToHex = (r, g, b, a) => {
  r = r.toString(16)
  g = g.toString(16)
  b = b.toString(16)
  a = Math.round(a * 255).toString(16)

  if (r.length == 1) r = '0' + r
  if (g.length == 1) g = '0' + g
  if (b.length == 1) b = '0' + b
  if (a.length == 1) a = '0' + a

  return '#' + r + g + b + a
}

function hexToRGBA(hex) {
  let r = 0,
    g = 0,
    b = 0,
    a = 1

  if (!hex) {
    // rgba value for white
    return {
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    }
  }
  // HEX TO RGB
  if (hex.length == 4) {
    r = '0x' + hex[1] + hex[1]
    g = '0x' + hex[2] + hex[2]
    b = '0x' + hex[3] + hex[3]
  } else if (hex.length == 7) {
    r = '0x' + hex[1] + hex[2]
    g = '0x' + hex[3] + hex[4]
    b = '0x' + hex[5] + hex[6]
  }
  // HEX TO RGBA
  else if (hex.length == 5) {
    r = '0x' + hex[1] + hex[1]
    g = '0x' + hex[2] + hex[2]
    b = '0x' + hex[3] + hex[3]
    a = '0x' + hex[4] + hex[4]
    a = +(a / 255).toFixed(2)
  } else if (hex.length == 9) {
    r = '0x' + hex[1] + hex[2]
    g = '0x' + hex[3] + hex[4]
    b = '0x' + hex[5] + hex[6]
    a = '0x' + hex[7] + hex[8]
    a = +(a / 255).toFixed(2)
  }

  return {
    r: +r,
    g: +g,
    b: +b,
    a: +a,
  }
}

const ColorInput = ({ value = '', onChange = (color = '') => {}, id, usedStyles }) => {
  const ref = useRef(null)
  const [showPicker, setShowPicker] = useState(false)
  const [color, setColor] = useState(value)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [usedColors, setUsedColors] = useState([])

  // const usedColors = usedStyles?.filter((style) => style.includes('#') && style !== value) || []

  const handleChange = (e) => {
    const value = e.target.value

    if (value.length < 10) {
      setColor(value)
    }
  }

  useEffect(() => {
    if (value !== color) {
      onChange(color)
    }
  }, [color])

  useEffect(() => {
    if (value !== color) {
      setColor(value)
    }
  }, [value])

  useEffect(() => {
    if (usedStyles?.length) {
      setUsedColors(() => usedStyles.filter((style) => style.includes('#') && style !== value))
    }
  }, [usedStyles])

  useEffect(() => {
    const element = ref.current
    const handleOutsideClick = (event) => {
      if (!element.contains(event.target)) {
        setShowPicker(false)
      }
    }
    window.addEventListener('mousedown', handleOutsideClick)

    //remove the event listener when component unmounts
    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className="flex w-full items-center">
      <div className="w-full relative">
        <Input
          variant="primary"
          value={color}
          id={id}
          onChange={handleChange}
          onFocus={() => setShowSuggestion(true)}
          onBlur={() => setShowSuggestion(false)}
          autoComplete="off"
          className="py-2"
        />
        {showSuggestion && usedColors.length > 0 && (
          <div className="border border-gray-400 w-full absolute bg-white z-50 shadow-lg max-h-44 overflow-auto custom-scrollbar scroll-md">
            {usedColors.map((style) => (
              <p key={style} className="px-2 cursor-pointer hover:bg-gray-100 py-1" onMouseDown={() => setColor(style)}>
                <span
                  className="mx-2 p-1.5 inline-block border border-gray-400 rounded-sm"
                  style={{ background: style }}
                ></span>
                {style}
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="p-1 ml-4 cursor-pointer relative">
        <div
          className="w-8 h-8 border-2 border-gray-400 rounded-md"
          style={{
            background: `${color}`,
          }}
          onClick={() => {
            setShowPicker((prevValue) => !prevValue)
          }}
        />
        <div ref={ref}>
          {showPicker && (
            <SketchPicker
              className="absolute right-0"
              onChange={({ rgb }) => setColor(rgbaToHex(rgb.r, rgb.g, rgb.b, rgb.a))}
              color={hexToRGBA(color)}
              styles={{
                picker: {
                  zIndex: 1,
                  width: '200px',
                  padding: ' 10px 10px 0px',
                  boxSizing: 'initial',
                  background: 'rgb(255, 255, 255)',
                  borderRadius: '4px',
                  boxShadow: 'rgb(0 0 0 / 15%) 0px 0px 0px 1px, rgb(0 0 0 / 15%) 0px 8px 16px',
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ColorInput
