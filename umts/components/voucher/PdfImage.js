import React, { useEffect, useState } from 'react'

const PdfImage = (props) => {
  const { imgDataUrl, onClick } = props

  return (
    <div
      // className={`h-full cursor-pointer transition duration-300 ease-in-out bg-surface shadow-[2px_4px_12px_rgba(0,0,0,8%)] ${
      //   onClick ? 'hover:rounded hover:shadow-[2px_4px_16px_rgba(0,0,0,16%)] hover:scale-[1.01]' : ''
      // }`}
      className={`h-full cursor-pointer transition duration-300 ease-in-out bg-surface ${
        onClick ? 'hover:rounded hover:shadow-[2px_4px_16px_rgba(0,0,0,16%)] hover:scale-[1.01]' : ''
      }`}
      onClick={onClick}
    >
      {/* <img src={imgDataUrl} alt="placeholder" className="object-cover object-center h-full w-fill" /> */}
      <img src={imgDataUrl} className="object-cover object-center h-full mx-auto w-fill" />
    </div>
  )
}

export default PdfImage
