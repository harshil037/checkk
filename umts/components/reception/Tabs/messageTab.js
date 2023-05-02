import React, { useEffect, useState } from 'react'
import receptionLabels from '../../../translations/reception.json'

const messageTab = ({ show, setSelectedData, selectedData, language, languageRequested }) => {
  const [opacity, setOpacity] = useState(0)
  const [localizedTextInput, setLocalizedTextInput] = useState({
    replyMessage: selectedData?.[0]?.replyMessage || '',
    landingPageMessage: selectedData?.[0]?.landingPageMessage || '',
  })

  const handleTextArea = (template) => (e) => {
    const text = e.target.value
    setLocalizedTextInput((st) => ({
      ...st,
      ...(template === 'email'
        ? {
            replyMessage: text,
          }
        : {}),
      ...(template === 'landingPage'
        ? {
            landingPageMessage: text,
          }
        : {}),
    }))
    setSelectedData((st) => {
      const tempSelectedData = [...st]
      tempSelectedData.forEach((d) => {
        if (template === 'email') {
          d.replyMessage = text
        }
        if (template === 'landingPage') {
          d.landingPageMessage = text
        }
      })
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

      <div className="flex flex-wrap xl:flex-nowrap gap-4">
        <div className="grow shrink">
          <h2 className="text-lg mb-3">
            <b>{receptionLabels.emailMessageSubHeadingLabel[language]}</b>
          </h2>
          <textarea
            onChange={handleTextArea('email')}
            rows="8"
            className="w-full border border-[#796b5f66] rounded-md p-5"
            value={localizedTextInput.replyMessage}
          />
        </div>

        <div className="grow shrink">
          <h2 className="text-lg mb-3">
            <b>{receptionLabels.landingPageMessageSubHeadingLabel[language]}</b>
          </h2>
          <textarea
            onChange={handleTextArea('landingPage')}
            rows="8"
            className="w-full border border-[#796b5f66] rounded-md p-5"
            value={localizedTextInput.landingPageMessage}
          />
        </div>
      </div>
    </div>
  )
}

export default messageTab
