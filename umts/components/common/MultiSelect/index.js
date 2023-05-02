import React from 'react'
import Select from 'react-select'

const MultiSelect = ({
  options,
  name = '',
  value,
  className = '',
  height = '',
  searchable = false,
  disabled = false,
  onChange = (values = []) => {},
  isMulti = true,
  id = '',
}) => {
  const colourStyles = {
    control: (styles) => ({
      ...styles,
      borderColor: 'rgba(156, 163, 175)',
      padding: "4px",
    }),
    theme: (theme) => ({
      ...theme,
      borderRadius: '0.5rem',
      colors: {
        ...theme.colors,
        primary: '#9ca3af',
      },
    }),
  }
  return (
    <Select
      value={value}
      isMulti={isMulti}
      name={name}
      options={options}
      id={id}
      onChange={onChange}
      styles={colourStyles}
      theme={colourStyles.theme}
      Searchable={searchable}
      Disabled={disabled}
    />
  )
}

export default MultiSelect
