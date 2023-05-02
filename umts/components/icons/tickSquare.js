import React from 'react'

const TickSquare = ({className}) => {
  return (
    <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.44444 7.88889L3.88889 9.44444L8.88889 14.4444L20 3.33333L18.4444 1.77778L8.88889 11.3333L5.44444 7.88889ZM17.7778 17.7778H2.22222V2.22222H13.3333V0H2.22222C1 0 0 1 0 2.22222V17.7778C0 19 1 20 2.22222 20H17.7778C19 20 20 19 20 17.7778V8.88889H17.7778V17.7778Z"
      fill="inherit"
    />
  </svg>
  )
}

export default TickSquare