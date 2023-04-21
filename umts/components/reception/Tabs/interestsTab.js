import React, { useState, useEffect } from 'react'
import TickSquare from '../../icons/tickSquare'

const InterestsTab = ({ show, loading, interests, selectedData, setSelectedData, responseIndex }) => {
  const [opacity, setOpacity] = useState(0)
  const [localizedInterestSelection, setLocalizedInterestsSelection] = useState(selectedData?.interestCodes || [])

  const handleInterest = (interestCode) => () => {
    const tempLocalizedInterestSelection = [...localizedInterestSelection]
    const idxOfRate = tempLocalizedInterestSelection?.indexOf(interestCode)
    if (idxOfRate > -1) {
      tempLocalizedInterestSelection?.splice(idxOfRate, 1)
    } else {
      tempLocalizedInterestSelection?.push(interestCode)
    }
    setLocalizedInterestsSelection(tempLocalizedInterestSelection)
    setSelectedData((st) => {
      const tempSelectedData = [...st]
      tempSelectedData[responseIndex] = {
        ...tempSelectedData[responseIndex],
        interestCodes: tempLocalizedInterestSelection,
      }
      return tempSelectedData
    })
  }

  useEffect(() => {
    let timer
    if (show) {
      setOpacity(0)
      timer = setTimeout(() => {
        setOpacity(100)
        clearTimeout(timer)
      }, 250)
    } else {
      setOpacity(0)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [show])

  if (loading.interestsLoading) {
    return (
      <div
        className={`flex items-center justify-center h-full ${
          !show && 'hidden'
        } transition-opacity duration-200 opacity-${opacity}`}
      >
        <div className="inline-block w-8 h-8 border-4 rounded-full spinner-border animate-spin" role="status">
          <span className="visually-hidden"></span>
        </div>
      </div>
    )
  }
  if (!interests.length && loading.interestsMessage) {
    return (
      <div
        className={`flex items-center justify-center h-full ${
          !show && 'hidden'
        } transition-opacity duration-200 opacity-${opacity}`}
      >
        <h1 className="text-lg font-bold">{loading.interestsMessage}</h1>
      </div>
    )
  }
  return (
    <div
      className={`custom-scrollbar px-5 py-2 overflow-x-hidden transition-opacity duration-200 ${
        !show && 'hidden'
      } opacity-${opacity}`}
      style={{ height: '100%' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {interests &&
          interests.map((interest, i) => {
            return (
              <div
                key={i}
                className={`py-4 px-4 ${i + 3 < interests.length && 'border-b border-dashed border-[#CACACA]'} `}
                style={{ flex: '1 0 33.333%' }}
              >
                <div className={`flex gap-4 ${(i + 1) % 3 !== 0 && 'lg:border-r border-dashed border-[#CACACA]'}`}>
                  <div onClick={handleInterest(interest.code)}>
                    {localizedInterestSelection.includes(interest.code) ? (
                      <span>
                        {' '}
                        <TickSquare className="fill-[#68D0C2] cursor-pointer w-6 h-6 select-none"></TickSquare>
                      </span>
                    ) : (
                      <div className="w-6 h-6 border-2 border-[#CACACA] rounded-sm cursor-pointer select-none" />
                    )}
                  </div>
                  {/* Image  */}
                  <div className="h-36 w-[50%]">
                    <img className="object-cover object-center w-full h-full" src={interest?.images?.[0]?.url}></img>
                  </div>
                  <div className="flex flex-col px-2">
                    <div className="mb-2">
                      <b>{interest?.title}</b>
                    </div>
                    <div className="flex flex-col">{interest?.interestCategoryTitle}</div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default InterestsTab
