import React from 'react'
import CheckBoxEmpty from './components/CheckBoxEmpty'
import CheckBoxFilled from './components/CheckBoxFilled'

const Checkbox = ({
  height = '18',
  width = '18',
  name = '',
  className = '',
  checked = false,
  onChange = () => {},
  id = Math.random(),
}) => {
  return (
    <>
      <label htmlFor={id} className={className}>
        {checked ? <CheckBoxFilled height={height} width={width} /> : <CheckBoxEmpty height={height} width={width} />}
      </label>
      <input id={id} name={name} onChange={onChange} checked={checked} type="checkbox" className="hidden" />
    </>
  )
}

export default Checkbox
