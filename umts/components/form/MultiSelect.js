import React from 'react'
import { Field } from 'formik'
import HelpBar from '../tool/helpBar'
import { useState } from 'react'

const MultiSelect = ({
  languages = [],
  language = 'en',
  path = '',
  componentKey,
  label,
  languageBased = false,
  changeLanguage,
  errObj,
  options,
  description,
  placeholder,
  formEl,
}) => {
  const key = componentKey
  const [isOpen, setIsOpen] = useState(false)

  if (languageBased === true || languageBased === 'true') {
    return (
      <div className="flex flex-wrap" key={`${path}${key}.${language}`}>
        <div className="w-full lg:w-2/2  px-4 lg:mb-0 mb-3">
          <h2 className="ml-2 my-4 inline-block">{label?.[language] || key || ''}</h2>
          <div className="inline-block">
            <HelpBar value={description?.[language]} />
          </div>

          <Field name={`${path}${key}.${language}`}>
            {({ field, form }) => {
              return (
                <div className="text-center pb-4">
                  <div className="border border-gray-400 flex items-center rounded-lg py-2 px-3 w-full text-gray-700 ">
                    {/* <span>Please Select</span> */}
                    <div className="flex flex-auto flex-wrap">
                      {options
                        .filter((x) =>
                          (formEl.current?.getFieldProps(`${path}${key}.${language}`)?.value || [])?.includes(
                            x.value?.[language],
                          ),
                        )
                        .map((item, index) => (
                          <div className="flex justify-center items-center m-1 font-medium py-1 px-1 bg-white rounded bg-gray-100 border">
                            <span className="text-xs font-normal ">{item.title?.[language]}</span>
                            <div class="flex flex-auto flex-row-reverse">
                              <div>
                                <svg
                                  onClick={() => {
                                    let currentVal =
                                      formEl.current?.getFieldProps(`${path}${key}.${language}`)?.value || []
                                    formEl.current?.setFieldValue(
                                      `${path}${key}.${language}`,
                                      currentVal.filter((x) => x != item.value?.[language]),
                                    )
                                  }}
                                  class="fill-current h-4 w-4 "
                                  role="button"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    d="M14.348,14.849c-0.469,0.469-1.229,0.469-1.697,0L10,11.819l-2.651,3.029c-0.469,0.469-1.229,0.469-1.697,0
                                                  c-0.469-0.469-0.469-1.229,0-1.697l2.758-3.15L5.651,6.849c-0.469-0.469-0.469-1.228,0-1.697s1.228-0.469,1.697,0L10,8.183
                                                  l2.651-3.031c0.469-0.469,1.228-0.469,1.697,0s0.469,1.229,0,1.697l-2.758,3.152l2.758,3.15
                                                  C14.817,13.62,14.817,14.38,14.348,14.849z"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div
                      onClick={() => {
                        setIsOpen(!isOpen)
                      }}
                      class="text-gray-300 w-8 py-1 pl-2 pr-1 border-l flex items-center border-gray-200"
                    >
                      <button
                        type="button"
                        class="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none"
                      >
                        <svg version="1.1" class="fill-current h-4 w-4" viewBox="0 0 20 20">
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
                    className={`flex flex-col w-full overflow-y-auto max-h-40 mt-2 rounded-lg shadow border-gray-400 border custom-scrollbar ${
                      isOpen && `hidden`
                    }`}
                  >
                    {options.map((item, index) => (
                      <div class="flex w-full items-center p-2 pl-2 border-b border-gray-300 relative">
                        <div
                          onClick={() => {
                            let currentVal = formEl.current?.getFieldProps(`${path}${key}.${language}`)?.value || []
                            if (currentVal.filter((x) => x == item.value?.[language]).length == 0) {
                              currentVal.push(item.value?.[language])
                            } else {
                              currentVal = currentVal.filter((x) => x != item.value?.[language])
                            }
                            formEl.current?.setFieldValue(`${path}${key}.${language}`, currentVal)
                          }}
                          class="w-full items-center flex justify-between"
                        >
                          <div class="mx-2 leading-6 text-sm text-gray-700">{item.title?.[language]}</div>
                          <div>
                            {formEl.current
                              ?.getFieldProps(`${path}${key}.${language}`)
                              ?.value?.filter((x) => x == item.value?.[language]).length > 0 && (
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
                      </div>
                    ))}
                  </div>
                </div>
              )
            }}
          </Field>
        </div>
        <div className="w-full lg:w-2/2 px-4 mt-14">
          {languages.map((langag, i) => {
            return (
              <button
                className={`border ${
                  langag === language ? 'border-gray-400' : 'border-gray-300'
                } rounded-lg p-3 text-sm text-gray-700 mr-3`}
                key={path + langag + i}
                type="button"
                onClick={(e) => changeLanguage(e, langag)}
              >
                {langag === language ? <b>{langag.toUpperCase()}</b> : langag.toUpperCase()}
              </button>
            )
          })}
        </div>
        <p className="my-1 text-red-700">{errObj[`${path}${key}.${language}`]}</p>
      </div>
    )
  } else {
    return (
      <div className="flex flex-wrap" key={`${path}${key}`}>
        <div className="w-full lg:w-2/2  px-4 lg:mb-0 mb-3">
          <h2 className="ml-2 my-4 inline-block">{label?.['en'] || key || ''}</h2>
          <div className="inline-block">
            <HelpBar value={description?.['en']} />
          </div>

          <Field name={`${path}${key}`}>
            {({ field, form }) => {
              return (
                <div className="text-center pb-4">
                  <div className="border border-gray-400 flex items-center rounded-lg py-2 px-3 w-full text-gray-700 ">
                    {/* <span>Please Select</span> */}
                    <div className="flex flex-auto flex-wrap">
                      {options
                        .filter((x) => (formEl.current?.getFieldProps(`${path}${key}`)?.value || [])?.includes(x.value))
                        .map((item, index) => (
                          <div className="flex justify-center items-center m-1 font-medium py-1 px-1 bg-white rounded bg-gray-100 border">
                            <span className="text-xs font-normal ">{item.title}</span>
                            <div class="flex flex-auto flex-row-reverse">
                              <div>
                                <svg
                                  onClick={() => {
                                    let currentVal = formEl.current?.getFieldProps(`${path}${key}`)?.value || []
                                    formEl.current?.setFieldValue(
                                      `${path}${key}`,
                                      currentVal.filter((x) => x != item.value),
                                    )
                                  }}
                                  class="fill-current h-4 w-4 "
                                  role="button"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    d="M14.348,14.849c-0.469,0.469-1.229,0.469-1.697,0L10,11.819l-2.651,3.029c-0.469,0.469-1.229,0.469-1.697,0
                                                  c-0.469-0.469-0.469-1.229,0-1.697l2.758-3.15L5.651,6.849c-0.469-0.469-0.469-1.228,0-1.697s1.228-0.469,1.697,0L10,8.183
                                                  l2.651-3.031c0.469-0.469,1.228-0.469,1.697,0s0.469,1.229,0,1.697l-2.758,3.152l2.758,3.15
                                                  C14.817,13.62,14.817,14.38,14.348,14.849z"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div
                      onClick={() => {
                        setIsOpen(!isOpen)
                      }}
                      class="text-gray-300 w-8 py-1 pl-2 pr-1 border-l flex items-center border-gray-200"
                    >
                      <button
                        type="button"
                        class="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none"
                      >
                        <svg version="1.1" class="fill-current h-4 w-4" viewBox="0 0 20 20">
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
                    className={`flex flex-col w-full overflow-y-auto max-h-40 mt-2 rounded-lg shadow border-gray-400 border custom-scrollbar ${
                      isOpen && `hidden`
                    }`}
                  >
                    {options.map((item, index) => (
                      <div class="flex w-full items-center p-2 pl-2 border-b border-gray-300 relative">
                        <div
                          onClick={() => {
                            let currentVal = formEl.current?.getFieldProps(`${path}${key}`)?.value || []
                            if (currentVal.filter((x) => x == item.value).length == 0) {
                              currentVal.push(item.value)
                            } else {
                              currentVal = currentVal.filter((x) => x != item.value)
                            }
                            formEl.current?.setFieldValue(`${path}${key}`, currentVal)
                          }}
                          class="w-full items-center flex justify-between"
                        >
                          <div class="mx-2 leading-6 text-sm text-gray-700">{item.title}</div>
                          <div>
                            {formEl.current?.getFieldProps(`${path}${key}`)?.value?.filter((x) => x == item.value)
                              .length > 0 && (
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
                      </div>
                    ))}
                  </div>
                </div>
              )
            }}
          </Field>
        </div>
        <p className="my-1 text-red-700">{errObj[`${path}${key}.${language}`]}</p>
      </div>
    )
  }
}

export default MultiSelect
