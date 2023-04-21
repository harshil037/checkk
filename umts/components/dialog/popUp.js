import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const PopUp = ({ openModal, children, classContent = '', styleModalBody = {} }) => {
  const [mounted, setMounted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const body = document.body
    openModal && body.setAttribute('style', 'overflow:hidden')
    ref.current = document.querySelector('#portal')
    setMounted(true)
    return () => {
      body.setAttribute('style', 'overflow:auto')
    }
  }, [openModal])

  if (!openModal) return <></>

  return mounted && ref.current
    ? createPortal(
        <div style={{ display: openModal ? 'block' : 'none' }} id="modal">
          <div className={`modal-content ${classContent}`}>
            <div style={{ marginBottom: '100px', ...styleModalBody }} className={`modal-body`}>
              {children}
            </div>
          </div>
        </div>,
        ref.current,
      )
    : null
}

export default PopUp
