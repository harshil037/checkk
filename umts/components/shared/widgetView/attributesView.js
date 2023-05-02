import React, { useState, memo } from 'react'
import { Input } from '../../../components/componentLibrary'

const AttributesView = ({ productName, language, clientId, attributes, setAttributes, version }) => {
  const integration = 'integration'
  const attributesTab = 'attributes'
  const [tab, setTab] = useState(integration)

  return (
    <div className="w-full">
      <ul className="inline-flex justify-center w-full gap-4 px-1 overflow-x-auto">
        <li
          key={integration}
          onClick={() => {
            setTab(integration)
          }}
          className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border-r border-l border-t ${
            tab === integration ? 'after:bg-primary-400' : 'after:bg-transparent'
          }`}
        >
          <span className="px-4 md:px-8">Integration</span>
        </li>
        <li
          onClick={() => {
            setTab(attributesTab)
          }}
          className={`bg-white text-gray-800 p-2 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border-r border-l border-t ${
            tab !== integration ? 'after:bg-primary-400' : 'after:bg-transparent'
          }`}
          key={attributesTab}
        >
          <span className="px-4 md:px-8">Attributes</span>
        </li>
      </ul>
      {tab == integration ? (
        <div className="p-4 border border-gray-300 border-solid rounded-xl">
          <div className="flex flex-wrap text-left"></div>
          <p className="pb-2 text-xl font-bold text-gray-500 border-b border-gray-300">Integration Code</p>
          <div className="mt-4">
            <p className="text-capitalize">Add the Init script In the &#60;Head&#62; of Your Page</p>
            <div className="p-4 mt-2 mb-5 bg-gray-100 rounded-lg shadow">
              <p> &#60;script defer src=&#34;https://cdn.mts-online.com/mts.js&#34;&#62; &#60;/script&#62;</p>
            </div>
            <p className="text-capitalize">
              Add The Container &#60;Div&#62; Tag Where You Want To Integrate The Widget To:
            </p>
            <div className="p-4 mt-2 mb-5 bg-gray-100 rounded-lg shadow">
              <p>
                &#60;div id=&#34;__MTS&#34;
                <br />
                &nbsp;data-mts-language=&#34;{language}&#34; <br />
                &nbsp;data-mts-user=&#34;{clientId}
                &#34; <br />
                &nbsp;data-mts-view=&#34;{productName}&#34; <br />
                &nbsp;data-mts-version=&#34;{version}&#34; <br />
                {Object.keys(attributes)
                  .filter((item) => attributes[item] != '')
                  .map((item) => {
                    return (
                      <>
                        &nbsp;{item}=&#34;{attributes[item]}&#34; <br />
                      </>
                    )
                  })}
                &#62; &#60;/div&#62;
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border border-gray-300 border-solid rounded-xl">
          <div className="flex flex-wrap text-left"></div>
          <p className="pb-2 text-xl font-bold text-gray-500 border-b border-gray-300">Attributes</p>
          <div className="mt-4 widget-attrscroll">
            {Object.keys(attributes).map((item, index) => {
              return (
                <div key={index}>
                  <h2 className="mt-4 mb-2">{item}</h2>
                  <Input
                    onChange={(e) => {
                      setAttributes((state) => ({
                        ...state,
                        [item]: e.target.value,
                      }))
                    }}
                    type="text"
                    variant="primary"
                    id="name"
                    value={attributes[item]}
                    placeholder={item}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(AttributesView)
