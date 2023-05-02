import React, { useState } from 'react'
import { Input } from '../componentLibrary'
import Button from '../common/Button'
import dynamic from 'next/dynamic'
import { isEqual } from '/lib/utils'
const RTE = dynamic(() => import('/components/shared/rte.js'), {
  ssr: false,
})

function NoteItem({ item, onSaveNote, isNew }) {
  const [currentItem, setCurrentItem] = useState(item)
  return (
    <>
      <form id={`notes-form`}>
        <div className="main-wrapper m-8">
          <div className="md:mt-6 mt-32 p-6 mx-auto bg-white rounded-lg lg:w-2/5 border border-gray-300">
            <div className="flex justify-between">
              <h1></h1>
              <svg
                onClick={() => {
                  onSaveNote(currentItem, true)
                }}
                className="w-4 h-4 fill-current cursor-pointer"
                role="button"
                viewBox="0 0 20 20"
              >
                <path
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="client-modal-scroll small-modal">
              <div className="flex flex-wrap -mx-4 text-left mt-5">
                <div className="mt-5 lg:mt-0 w-full sm:w-2/2 px-4">
                  <Input
                    variant="primary"
                    type="text"
                    placeholder="Title"
                    className="mb-2"
                    value={currentItem?.title || ''}
                    onChange={(e) => {
                      setCurrentItem((state) => ({ ...state, ['title']: e.target.value }))
                    }}
                  />
                  <RTE
                    path="abc"
                    placeholder="notes"
                    value={item?.note}
                    handlePropsChange={(value, note) => {
                      if (note != undefined) {
                        setCurrentItem((state) => ({ ...state, ['note']: note }))
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 w-full sm:w-2/2 px-4 flex justify-center">
              <Button
                onClick={() => {
                  if (!isEqual(item, currentItem)) {
                    onSaveNote(currentItem)
                  }
                }}
                type="button"
                variant="primary"
                className="content-center"
              >
                {isNew ? 'Add Note' : 'Update Note'}
                <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Save Note" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}

export default NoteItem
