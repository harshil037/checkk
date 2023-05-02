import React, { useState, useEffect } from 'react'
import { Field } from 'formik'
import { Input } from '../componentLibrary'
import HelpBar from '../tool/helpBar'
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

const ColorInput = ({
  type,
  path,
  componentKey,
  label,
  errObj,
  handleChangeFormValue,
  description,
  validations,
  parent,
  handleBlur,
  placeholder,
}) => {
  const key = componentKey

  const [displayColorPicker, setDisplayColorPicker] = useState(false)

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker)
  }

  const handleClose = () => {
    setDisplayColorPicker(false)
  }

  const handleChange = (color, form, path, parent) => {
    const { rgb } = color
    const hex = rgbaToHex(rgb.r, rgb.g, rgb.b, rgb.a)
    handleBlur({ target: { value: hex } }, parent, path)
    handleChangeFormValue(hex, form, path)
  }

  return (
    <div className="w-full px-4 mb-4 lg:w-1/2 lg:mb-0" key={`${path}${key}`}>
      <div className="flex">
        <h2 className="mx-2 my-2">{label?.['en'] || key || ''}</h2>
        <div className="mt-2">
          <HelpBar value={description?.['en']} />
        </div>
      </div>

      <Field name={`${path}${key}`}>
        {({ field, form }) => {
          const value = field?.value
          return (
            <>
              <div className="flex gap-3">
                <div className="w-1/2">
                  <Input
                    type="text"
                    id={`${path}${key}`}
                    value={value}
                    onChange={(e) => {
                      if (e.target.value.length < 10) {
                        handleChangeFormValue(e.target.value, form, `${path}${key}`)
                      }
                    }}
                    placeholder={placeholder?.['en'] || ''}
                    variant={errObj[`${path}${key}`] ? 'danger' : 'primary'}
                    onBlur={(e) => handleBlur(e, `${key + parent}`, `${path}${key}`)}
                    required={validations[`${key + parent}`]?.['required']}
                  />
                </div>
                <div className="self-center">
                  <div className="p-1 cursor-pointer" onClick={handleClick}>
                    <div
                      className="w-10 h-10 border-4 border-gray-500 rounded-sm"
                      style={{
                        background: `${value}`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative block mt-2 mb-2 w-52">
                {displayColorPicker ? (
                  <>
                    <div className="fixed inset-0" onClick={handleClose} />
                    <SketchPicker
                      color={hexToRGBA(value)}
                      width="inherit"
                      // onChange={(e) => {
                      //   handleChange(e, form, `${path}${key}`, `${key + parent}`)
                      // }}
                      onChangeComplete={(e) => {
                        handleChange(e, form, `${path}${key}`, `${key + parent}`)
                      }}
                    />
                  </>
                ) : null}
              </div>
            </>
          )
        }}
      </Field>
      <p className="my-1 ml-2 text-red-700">{errObj[`${path}${key}`]}</p>
    </div>
  )
}
export default ColorInput
