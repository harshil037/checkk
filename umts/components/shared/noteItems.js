import React, { useState, useEffect } from 'react'
import Button from '../common/Button'
import NoteItem from './noteItem'
import PopUp from '../../components/dialog/popUp'
import { v4 as uuidv4 } from 'uuid'

function NoteItems({ passedItems, handleOpen, header, onDbSave, isConfirmed }) {
  const [editNote, setEditNote] = useState({})
  const [openModal, setOpenModal] = useState(false)
  const [isNew, setIsNew] = useState(true)
  const [items, setItems] = useState(false)

  useEffect(() => {
    setItems(passedItems)
  }, [passedItems])

  return (
    <>
      <form id={`notes-form`}>
        <div className="m-8 main-wrapper">
          <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-2/5">
            <div className="flex justify-between w-full gap-4 pb-2 mb-10 border-b border-black border-solid">
              <h1 className="text-xl sm:text-[22px] text-gray-500 text-left w-10/12">
                <span className="text-xl sm:text-[22px] text-heading font-bold">Notes</span> :- {header}
              </h1>
              <svg
                onClick={() => {
                  handleOpen(null, true)
                }}
                className="w-4 h-4 cursor-pointer fill-current sm:w-6 sm:h-6"
                role="button"
                viewBox="0 0 20 20"
              >
                <path
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="client-modal-scroll menuScroll small-modal">
              <div className="flex flex-wrap -mx-4 text-left ">
                <div className="w-full px-4 lg:mt-0 sm:w-2/2">
                  {items &&
                    items.map((item, i) => (
                      <div key={i} className={`w-full rounded-lg px-4 border border-gray-300 mb-5`}>
                        <div className="flex justify-between w-full pb-2 mt-5 mb-2 border-b border-gray-400 border-solid">
                          <h2 className="mx-2 text-gray-500">{item.title}</h2>
                          <div>
                            <img
                              onClick={() => {
                                isConfirmed('Are you sure to remove this note').then((isDelete) => {
                                  if (isDelete) {
                                    onDbSave(item, true)
                                  }
                                })
                              }}
                              className="inline-block px-2 cursor-pointer"
                              src="/images/langaugedelete.svg"
                            />
                            <img
                              onClick={() => {
                                setEditNote(item)
                                setOpenModal(true)
                                setIsNew(false)
                              }}
                              className="inline-block w-4 h-4 cursor-pointer"
                              src="/images/domain-page-edit-icon.svg"
                            />
                          </div>
                        </div>
                        <div className="w-full mb-2 lg:w-3/3">
                          <div className="p-2 text-gray-500" dangerouslySetInnerHTML={{ __html: item.note }} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center w-full px-4 mt-5 sm:w-2/2">
              <Button
                onClick={() => {
                  setEditNote({ id: uuidv4() })
                  setOpenModal(true)
                  setIsNew(true)
                }}
                type="button"
                variant="primary"
                className="content-center"
              >
                Add Note
                <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
              </Button>
            </div>
          </div>
        </div>
      </form>
      {openModal && (
        <PopUp openModal={openModal}>
          <NoteItem
            item={editNote}
            onSaveNote={(objItem, isCancel = false) => {
              if (!isCancel) {
                onDbSave(objItem)
              }
              setOpenModal(false)
            }}
            isNew={isNew}
          />
        </PopUp>
      )}
    </>
  )
}

export default NoteItems
