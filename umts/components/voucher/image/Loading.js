import React from 'react'

const Loading = (props) => {
  const { className } = props
  return (
    <div
      className={`MTS__h-full MTS__flex MTS__flex-col MTS__gap-3 MTS__justify-center MTS__items-center MTS__bg-[#f1f1f1] ${className}`}
    >
      <svg
        className="MTS__animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        width="36px"
        height="36px"
        viewBox="0 0 16 16"
        fill="#00000080"
      >
        <path d="M13.917 7A6.002 6.002 0 0 0 2.083 7H1.071a7.002 7.002 0 0 1 13.858 0h-1.012z" />
      </svg>
      <div>
        Loading <span className="MTS__animate-ping">.</span>
        <span className="MTS__animate-ping" style={{ animationDelay: '100ms' }}>
          .
        </span>
        <span className="MTS__animate-ping" style={{ animationDelay: '200ms' }}>
          .
        </span>
      </div>
    </div>
  )
}

export default Loading
