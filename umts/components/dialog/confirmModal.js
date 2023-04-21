import Button from '../common/Button'
import React from 'react'
import useConfirm from './useConfirm'
const ConfirmModal = () => {
  const { prompt, isOpen, proceed, cancel } = useConfirm()

  return (
    <>
      <div style={{ display: isOpen ? 'flex' : 'none' }} id="modal" className="main-wrapper modal-center">
        <div className="p-6 mx-auto bg-white rounded-lg 2xl:w-1/5 lg:w-2/5 w-4/5 border border-gray-300">
          <div className="border-solid  pb-2 border-b border-black flex justify-between">
            <h1 className="text-lg font-bold">{proceed ? 'Confirm' : 'Alert'}</h1>
            <svg onClick={cancel} className="w-4 h-4 fill-current cursor-pointer" role="button" viewBox="0 0 20 20">
              <path
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <div className="flex flex-wrap -mx-4 text-left">
            <div className="mt-5 w-full sm:w-2/2 px-4">{prompt}</div>
          </div>
          <div className="flex flex-wrap -mx-4 text-left">
            <div className="mt-5 w-full px-4">
              <Button className="sm:w-1/3" variant={proceed ? 'danger' : 'primary'} onClick={cancel} type="button">
                {proceed ? 'Cancel' : 'Ok'}
              </Button>

              {proceed ? (
                <Button className={`${proceed && 'ml-5 sm:w-1/3'}`} onClick={proceed} variant="primary" type="button">
                  Confirm
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ConfirmModal
