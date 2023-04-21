import React, { useState, useEffect } from 'react'

const OrderListSelection = ({ values = [], titleKey = 'title', valueKey = 'value', onChange }) => {
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
    setItems(values)
  }, [values])

  useEffect(() => {
    onChange && onChange(items.filter((x) => x.isSelected).map((x) => x[valueKey]))
  }, [items])

  return (
    <div className="text-center pb-4">
      <div className="border border-gray-400 flex items-center rounded-lg py-2 px-3 w-full text-gray-700 ">
        <div className="flex flex-auto flex-wrap">Address</div>
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
              onClick={() => {
                setItems(
                  items.map((sitem, mapIndex) => {
                    if (mapIndex == index) {
                      item?.['isSelected'] = !item?.['isSelected']
                    }
                    return sitem
                  }),
                )
              }}
            >
              <div className="mx-2 leading-6 text-sm text-gray-700 ">{titleKey ? item[titleKey] : item}</div>
              {item?.isSelected && (
                <svg class="svg-icon w-4 h-4" viewBox="0 0 20 20">
                  <path
                    fill="#333"
                    d="M7.197,16.963H7.195c-0.204,0-0.399-0.083-0.544-0.227l-6.039-6.082c-0.3-0.302-0.297-0.788,0.003-1.087
                  C0.919,9.266,1.404,9.269,1.702,9.57l5.495,5.536L18.221,4.083c0.301-0.301,0.787-0.301,1.087,0c0.301,0.3,0.301,0.787,0,1.087
                  L7.741,16.738C7.596,16.882,7.401,16.963,7.197,16.963z"
                  ></path>
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderListSelection
