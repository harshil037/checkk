import React, { useState, useEffect } from 'react'

const OrderList = ({ values = [], titleKey = 'title', valueKey = 'value', onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [swapImage, setSwapImage] = useState(null)
  const [items, setItems] = useState(values)

  const handleSwapImage = (e, eventName, index) => {
    if (eventName === 'start') {
      setSwapImage(index)
    } else {
      if (swapImage > -1) {
        let imagesArr = [...items]
        let firstImage = imagesArr[swapImage]
        let secondImage = imagesArr[index]
        imagesArr[swapImage] = secondImage
        imagesArr[index] = firstImage
        setItems(imagesArr)
        setSwapImage(null)
      } else {
        setSwapImage(null)
      }
    }
  }

  useEffect(() => {
    onChange && onChange(items.map((x) => x[valueKey]))
  }, [items])

  return (
    <div className="text-center pb-4">
      <div className="border border-gray-400 flex items-center rounded-lg py-2 px-3 w-full text-gray-700 ">
        <div className="flex flex-auto flex-wrap">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded bg-gray-100 border"
            >
              <span className="text-xs font-normal ">{titleKey ? item[titleKey] : item}</span>
            </div>
          ))}
        </div>
        <div
          onClick={() => {
            setIsOpen(!isOpen)
          }}
          className="text-gray-300 w-8 py-1 pl-2 pr-1 border-l flex items-center border-gray-200"
        >
          <button type="button" className="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none">
            <svg version="1.1" className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <path
                d="M17.418,6.109c0.272-0.268,0.709-0.268,0.979,0s0.271,0.701,0,0.969l-7.908,7.83
              c-0.27,0.268-0.707,0.268-0.979,0l-7.908-7.83c-0.27-0.268-0.27-0.701,0-0.969c0.271-0.268,0.709-0.268,0.979,0L10,13.25
              L17.418,6.109z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div
        className={`flex flex-col w-full overflow-y-auto mt-2 rounded-lg shadow border-gray-400 border custom-scrollbar ${
          isOpen == true && `hidden`
        }`}
      >
        {items.map((item, index) => (
          <div key={index} className="flex w-full items-center p-2 pl-2 border-b border-gray-300 relative">
            <div
              draggable={true}
              onDragStart={(e) => handleSwapImage(e, 'start', index)}
              onDrop={(e) => handleSwapImage(e, 'drop', index)}
              onDragOver={(ev) => ev.preventDefault()}
              className="w-full items-center flex justify-between"
            >
              <div className="mx-2 leading-6 text-sm text-gray-700 ">{titleKey ? item[titleKey] : item}</div>
              <div className="flex items-center "></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderList
