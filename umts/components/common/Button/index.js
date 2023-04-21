import React from 'react'

const Button = ({
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  children,
  onClick = () => {},
  filled = false,
  id = '',
  title = '',
  tabIndex = 0,
}) => {
  let cls = ''

  switch (variant) {
    case 'primary':
      cls = `${
        filled
          ? disabled
            ? 'bg-primary-200 font-bold text-white px-4 py-2'
            : 'bg-primary-400 font-bold hover:bg-primary-500 text-white px-4 py-2'
          : disabled
          ? 'bg-gray-100 border border-gray-400 text-gray-400 px-4 py-1'
          : 'bg-white border border-primary-400 hover:text-primary-500 hover:border- px-4 py-1'
      } rounded-lg ${className}`
      break
    case 'secondary':
      cls = `${
        filled
          ? disabled
            ? 'bg-gray-300 font-bold text-white px-4 py-2'
            : 'bg-gray-400 font-bold hover:bg-gray-500 text-white px-4 py-2'
          : disabled
          ? 'bg-gray-100 border border-gray-400 text-gray-400 px-4 py-1'
          : 'bg-white border border-gray-400 hover:border-gray-500 px-4 py-1'
      } rounded-lg ${className}`
      break
    case 'danger':
      cls = `${
        filled
          ? disabled
            ? 'bg-red-300 font-bold text-white px-4 py-2'
            : 'bg-red-400 font-bold hover:bg-red-500 text-white px-4 py-2'
          : disabled
          ? 'bg-gray-100 border border-gray-400 text-gray-400 px-4 py-1'
          : 'bg-white border border-red-400 hover:text-red-500 hover:border-red-500 px-4 py-1'
      } rounded-lg ${className}`
      break
    default:
      cls = `${
        filled
          ? disabled
            ? 'bg-primary-200 font-bold text-white px-4 py-2'
            : 'bg-primary-400 font-bold hover:bg-primary-500 text-white px-4 py-2'
          : disabled
          ? 'bg-gray-100 border border-gray-400 text-gray-400 px-4 py-1'
          : 'bg-white border border-primary-400 hover:text-primary-500 hover:border- px-4 py-1'
      } rounded-lg ${className}`
  }

  return (
    <button
      className={cls.trim()}
      type={type}
      disabled={disabled}
      onClick={onClick}
      id={id}
      title={title}
      tabIndex={tabIndex}
    >
      {children}
    </button>
  )
}

export default Button
