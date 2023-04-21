import React, { useState, useEffect } from 'react'
import receptionLabels from '../../../translations/reception.json'
import countriesLabels from '../../../translations/countries.json'

const ComposeRequest = ({
  requestInPopup,
  setRequestInPopup,
  language,
  selectedData,
  isValid,
  setIsValid,
}) => {
  const [showAddress, setShowAddress] = useState(false)
  const [toggle, setToggle] = useState(true)
  const [slide, setSlide] = useState(false)

  const days = receptionLabels.days[language]
  const adultsOccupancyCount = selectedData?.occupancy?.reduce((acc, cur) => {
    acc += cur.adults * 1
    return acc
  }, 0)
  const childrenOccupancyCount = selectedData?.occupancy?.reduce((acc, cur) => {
    if (cur.childage) {
      acc.push(...cur.childage)
    }
    return acc
  }, [])

  const handleChange = (e) => {
    const name = e.target.name
    const value =
      name !== 'country'
        ? e.target.value
        : countriesLabels?.reduce((acc, cur) => {
            if (cur.isoCode === e.target.value) {
              acc['name'] = cur[requestInPopup?.language]
              acc['code'] = e.target.value
            }
            return acc
          }, {})

    setRequestInPopup((st) => ({
      ...st,
      [name]: value
    }))

    setIsValid((st) => ({
      ...st,
      [name]: true
    }))
  }

  useEffect(() => {
    setTimeout(() => {
      setSlide((st) => !st)
    }, 100)
  }, [toggle])

  return (
    <>
      <div className="mb-3 px-4 py-3 border border-[#796b5f66] rounded-md">
        <div className="flex items-end">
          <div
            className={`max-w-6/12 w-full pr-6 xl:opacity-100 xl:translate-x-0 transition-all duration-700 ${
              !toggle && 'hidden xl:block'
            } ${slide ? 'translate-x-0' : '-translate-x-full opacity-0'} `}
          >
            <div>
              <label htmlFor="language">{receptionLabels.templateLanguageLabel[language]} </label>
              <select
                id="language"
                name="language"
                value={requestInPopup?.language || ''}
                className="ml-4 px-1 py-1.5 w-56 bg-white rounded-md outline-none cursor-pointer border border-[#796b5f66]"
                onChange={handleChange}
              >
                <option value="de">DE</option>
                <option value="en">EN</option>
                <option value="it">IT</option>
              </select>
            </div>

            <div className="flex gap-3 mt-5">
              <div className="flex flex-col">
                <label htmlFor="salutation" className={`font-medium ${!isValid['salutation'] && 'text-red-500'}`}>
                  {receptionLabels.salutationTitleLabel[language]}
                  <sup className="text-red-500">*</sup>
                </label>
                <select
                  id="salutation"
                  name="salutation"
                  value={requestInPopup?.salutation || ''}
                  className={`px-1 py-1.5 mt-2 w-28 bg-white rounded-md outline-none cursor-pointer border ${
                    isValid['salutation'] ? 'border-[#796b5f66]' : 'border-red-500'
                  }`}
                  onChange={handleChange}
                >
                  <option value=""></option>
                  {receptionLabels.salutationsLabel[language].map((salutation) => (
                    <option key={salutation} value={salutation.toLowerCase()}>
                      {salutation}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-grow flex-col">
                <label htmlFor="firstname" className={`font-medium ${!isValid['firstname'] && 'text-red-500'}`}>
                  {receptionLabels.firstnameTitleLabel[language]}
                  <sup className="text-red-500">*</sup>
                </label>
                <input
                  id="firstname"
                  name="firstname"
                  value={requestInPopup?.firstname || ''}
                  className={`p-1 mt-2 bg-white rounded-md outline-none cursor-pointer border ${
                    isValid['firstname'] ? 'border-[#796b5f66]' : 'border-red-500'
                  }`}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-grow flex-col">
                <label htmlFor="lastname" className={`font-medium ${!isValid['lastname'] && 'text-red-500'}`}>
                  {receptionLabels.lastnameTitleLabel[language]}
                  <sup className="text-red-500">*</sup>
                </label>
                <input
                  id="lastname"
                  name="lastname"
                  value={requestInPopup?.lastname || ''}
                  className={`p-1 mt-2  bg-white rounded-md outline-none cursor-pointer border ${
                    isValid['lastname'] ? 'border-[#796b5f66]' : 'border-red-500'
                  }`}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setToggle((st) => !st)
                  }}
                  className={`whitespace-nowrap relative translate-x-[52%] bg-primary-400  text-white border border-r-0 border-primary-400  items-center px-2 py-1 gap-0.5 flex xl:hidden font-bold`}
                >
                  {receptionLabels.showFormButtonLabel[language]}
                  <svg version="1.1" className="fill-white h-4 w-4 -rotate-90" viewBox="0 0 20 20">
                    <path
                      d="M17.418,6.109c0.272-0.268,0.709-0.268,0.979,0s0.271,0.701,0,0.969l-7.908,7.83
                  c-0.27,0.268-0.707,0.268-0.979,0l-7.908-7.83c-0.27-0.268-0.27-0.701,0-0.969c0.271-0.268,0.709-0.268,0.979,0L10,13.25
                  L17.418,6.109z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <div className="flex flex-col flex-grow">
                <label htmlFor="email" className={`font-medium ${!isValid['email'] && 'text-red-500'}`}>
                  E-mail<sup className="text-red-500">*</sup>
                </label>
                <input
                  id="email"
                  name="email"
                  value={requestInPopup?.email || ''}
                  className={`p-1 mt-2 bg-white rounded-md outline-none cursor-pointer border ${
                    isValid['email'] ? 'border-[#796b5f66]' : 'border-red-500'
                  }`}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col flex-grow">
                <label htmlFor="phone" className="font-medium">
                  {receptionLabels.phoneLabel[language]}
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={requestInPopup?.phone || ''}
                  className="p-1 mt-2  bg-white rounded-md outline-none cursor-pointer border border-[#796b5f66]"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex">
              <p
                className="mr-auto underline mt-2 cursor-pointer select-none xl:hidden"
                onClick={() => {
                  setShowAddress((st) => !st)
                }}
              >
                {showAddress
                  ? receptionLabels.addressToggleTitle.hide[language]
                  : receptionLabels.addressToggleTitle.show[language]}
              </p>
            </div>
          </div>
          <div
            className={`max-w-6/12 w-full flex flex-col transition-all duration-700 xl:opacity-100 xl:translate-x-0 ${
              toggle && 'hidden xl:flex'
            } ${!slide ? 'translate-x-0' : 'translate-x-full opacity-0'} `}
          >
            <div className="flex items-center">
              <div>
                <button
                  onClick={() => {
                    setToggle((st) => !st)
                  }}
                  className={`whitespace-nowrap relative -translate-x-[35%] bg-primary-400  text-white border border-l-0 border-primary-400  items-center px-2 py-1 gap-0.5 flex xl:hidden font-bold`}
                >
                  <svg version="1.1" className="fill-white h-4 w-4 rotate-90" viewBox="0 0 20 20">
                    <path
                      d="M17.418,6.109c0.272-0.268,0.709-0.268,0.979,0s0.271,0.701,0,0.969l-7.908,7.83
                  c-0.27,0.268-0.707,0.268-0.979,0l-7.908-7.83c-0.27-0.268-0.27-0.701,0-0.969c0.271-0.268,0.709-0.268,0.979,0L10,13.25
                  L17.418,6.109z"
                    ></path>
                  </svg>
                  {receptionLabels.showSummaryButtonLabel[language]}
                </button>
              </div>
              <div className="mb-3 px-4 py-3 border border-[#796b5f66] rounded-md flex-grow">
                <p className="mb-1">{receptionLabels.enquirySummaryLabel[language]}:</p>
                <div className="border-0 border-t-2 border-[#796b5f66] mb-1 w-60"></div>
                <div className="flex mt-5 divide divide-x-2 divide-[#796b5f66]">
                  <span className="flex-grow">
                    <p>
                      {receptionLabels.periodLabel[language]}:{' '}
                      {!isNaN(new Date(selectedData?.period?.departure).getTime()) &&
                        `${selectedData?.period?.arrival
                          ?.split('-')
                          ?.reverse()
                          .join('.')} - ${selectedData?.period?.departure?.split('-')?.reverse().join('.')} (
                    ${days.split(',')[new Date(selectedData?.period?.arrival).getDay()]?.toUpperCase()} - ${days
                          .split(',')
                          [new Date(selectedData?.period?.departure).getDay()]?.toUpperCase()})`}
                    </p>
                  </span>
                  <span className="flex-grow pl-9">
                    <p>
                      {receptionLabels.stayLabel[language]}:{' '}
                      {!isNaN(new Date(selectedData?.period?.departure).getTime()) &&
                        `${
                          (new Date(selectedData?.period?.departure).getTime() -
                            new Date(selectedData?.period?.arrival).getTime()) /
                          86400000
                        } ${receptionLabels.nightsLabel[language]}`}
                    </p>
                  </span>
                  <span className="flex-grow pl-9">
                    <p>
                      {receptionLabels.guestsLabel[language]}:{' '}
                      {!!adultsOccupancyCount && `${receptionLabels.adultsLabel[language]} (${adultsOccupancyCount})`}
                      {!!childrenOccupancyCount?.length &&
                        `, ${receptionLabels.childrenLabel[language]} (${childrenOccupancyCount.length}), ${
                          receptionLabels.ageLabel[language]
                        } (${childrenOccupancyCount
                          ?.map((e) => e + ` ${receptionLabels.yearsLabel[language]}`)
                          ?.join(', ')})`}
                    </p>
                  </span>
                </div>
                <div className="flex divide divide-x-2 divide-[#796b5f66] mt-5">
                  <span className="flex-grow">
                    <p>
                      {selectedData?.roomTitles && (Object.keys(selectedData?.roomTitles)?.length || '')}{' '}
                      {receptionLabels.roomLabel[language]}:{' '}
                      {selectedData?.roomTitles &&
                        Object.values(selectedData?.roomTitles)
                          .map((t) => `${t.title} x ${t.count}`)
                          .join(', ')}
                    </p>
                  </span>
                  <span className="flex-grow pl-9">
                    <p>
                      {selectedData?.offerTitles && (Object.keys(selectedData?.offerTitles)?.length || '')}{' '}
                      {receptionLabels.offerLabel[language]}:{' '}
                      {selectedData?.offerTitles &&
                        Object.values(selectedData?.offerTitles)
                          .map((t) => `${t.title} x ${t.count}`)
                          .join(', ')}
                    </p>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex">
              <p
                className="ml-auto underline mt-2 cursor-pointer select-none hidden xl:block"
                onClick={() => {
                  setShowAddress((st) => !st)
                }}
              >
                {showAddress
                  ? receptionLabels.addressToggleTitle.hide[language]
                  : receptionLabels.addressToggleTitle.show[language]}
              </p>
            </div>
          </div>
        </div>

        {showAddress && (
          <div className={`flex flex-wrap xl:flex-nowrap gap-4 mt-5 ${!toggle && 'hidden xl:flex'}`}>
            <div className="flex flex-grow flex-col">
              <label htmlFor="address" className="font-medium">
                {receptionLabels.addressTitleLabel[language]}
              </label>
              <input
                id="address"
                name="address"
                value={requestInPopup?.address || ''}
                className="p-1 mt-2 bg-white rounded-md outline-none cursor-pointer border border-[#796b5f66]"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-grow flex-col">
              <label htmlFor="zip" className="font-medium">
                {receptionLabels.zipTitleLabel[language]}
              </label>
              <input
                id="zip"
                name="zip"
                value={requestInPopup?.zip || ''}
                className="p-1 mt-2 bg-white rounded-md outline-none cursor-pointer border border-[#796b5f66]"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-grow flex-col">
              <label htmlFor="place" className="font-medium">
                {receptionLabels.placeTitleLabel[language]}
              </label>
              <input
                id="place"
                name="place"
                value={requestInPopup?.place || ''}
                className="p-1 mt-2 bg-white rounded-md outline-none cursor-pointer border border-[#796b5f66]"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="country" className="font-medium">
                {receptionLabels.countryLabel[language]}
              </label>
              <select
                id="country"
                name="country"
                value={requestInPopup?.country?.code || ''}
                className="p-1 mt-2 flex-grow bg-white rounded-md outline-none cursor-pointer border border-[#796b5f66]"
                onChange={handleChange}
              >
                <option value=""></option>
                {countriesLabels?.map((c) => (
                  <option key={c?.isoCode} value={c?.isoCode}>
                    {c?.[requestInPopup?.language]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ComposeRequest
