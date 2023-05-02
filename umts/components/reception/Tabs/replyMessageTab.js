import React, { useEffect, useState } from 'react'
import receptionLabels from '../../../translations/reception.json'

const ReplyMessageTab = ({ show, setSelectedData, selectedData: { replyMessage }, language, languageRequested, responseIndex }) => {
  const [opacity, setOpacity] = useState(0)
  const [localizedTextInput, setLocalizedTextInput] = useState(replyMessage || '')

  const handleTextArea = (e) => {
    const text = e.target.value
    setLocalizedTextInput(text)
    setSelectedData((st) => {
      const tempSelectedData = [...st]
      tempSelectedData[responseIndex] = {
        ...tempSelectedData[responseIndex],
        replyMessage: text,
      }
      return tempSelectedData
    })
  }

  useEffect(() => {
    if (show) {
      setOpacity(0)
      setTimeout(() => {
        setOpacity(100)
      }, 250)
    } else {
      setOpacity(0)
    }
  }, [show])

  return (
    <div
      className={`px-5 py-2 custom-scrollbar overflow-x-hidden overflow-y-auto transition-opacity duration-200 ${
        !show && 'hidden'
      } opacity-${opacity}`}
      style={{ height: '100%' }}
    >
      <h1 className="text-lg mb-3">
        <b>{receptionLabels.enquiryLanguageLabel[language]}:</b> {languageRequested?.toUpperCase()}
      </h1>
      <textarea
        onChange={handleTextArea}
        rows="8"
        className="w-full border border-[#796b5f66] rounded-md p-5"
        value={localizedTextInput}
      />
    </div>
  )
}

export default ReplyMessageTab
