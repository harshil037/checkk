import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/appContext'

const UseConfirm = () => {
  const [data, setData] = useContext(AppContext)
  const [needsCleanup, setNeedsCleanup] = useState(false)

  const isConfirmed = (prompt, isAlert = false) => {
    const promise = new Promise((resolve, reject) => {
      setData((prevState) => ({
        ...prevState,
        confirm: {
          ...prevState.confirm,
          isOpen: true,
          prompt: prompt,
          proceed: isAlert ? null : resolve,
          cancel: reject,
        },
      }))
      setNeedsCleanup(true)
    })

    const reset = () => {
      setData((prevState) => ({
        ...prevState,
        confirm: {
          ...prevState.confirm,
          isOpen: false,
          prompt: '',
          proceed: null,
          cancel: null,
        },
      }))
    }

    return promise.then(
      () => {
        reset()
        return true
      },
      () => {
        reset()
        return false
      },
    )
  }

  // Call cancel in a cleanup func to avoid dangling confirm dialog
  useEffect(() => {
    return () => {
      if (data.confirm.cancel && needsCleanup) {
        data.confirm.cancel()
      }
    }
  }, [data.confirm, needsCleanup])

  return {
    ...data.confirm,
    isConfirmed,
  }
}

export default UseConfirm
