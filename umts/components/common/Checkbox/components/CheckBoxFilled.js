import React from 'react'

const CheckBoxFilled = ({ height = '18', width = '18' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="18" height="18" fill="#68D0C2" />
      <g clipPath="url(#clip0_1281_1631)">
        <path d="M15 6.078L7.72112 13L4 9.46764L5.11761 8.40256L7.72112 10.8701L13.8688 5L15 6.078Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_1281_1631">
          <rect width="11" height="8" fill="white" transform="translate(4 5)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CheckBoxFilled
