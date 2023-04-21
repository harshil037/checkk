import { useContext } from 'react'
import { AppContext } from '../../context/appContext'
import useConfirm from '../dialog/useConfirm'

const ApiRequest = () => {
  const [data, setContextData, setLoading] = useContext(AppContext)
  const { isConfirmed } = useConfirm()

  const apiProcess = (value, loading) => {
    // sets loading true only on first api calling
    // sets loading last only on last api calling

    if (data.apiCount == 0) {
      setLoading(loading)
    }
    setContextData((prevState) => ({
      ...prevState,
      apiCount: prevState.apiCount + value,
    }))
  }

  // this function handles all api request , get,post,patch,delete
  const Api = async (url, method, headers, body) => {
    const requestParams = { method: method }
    // pass headers if found
    if (headers) {
      requestParams = { ...requestParams, headers: headers }
    }

    // pass body if found
    if (body) {
      requestParams = { ...requestParams, body: body }
    }

    // start loading
    apiProcess(1, true)
    const res = await fetch(url, {
      ...requestParams,
    })
    if (res.status === 200 || res.status === 200) {
      const data = await res.json()

      // stop loading on success
      apiProcess(-1, false)
      return { status: res.status, data: data }
    } else {
      // stop loading on error
      const error = res.status == 401 ? 'Unauthorized Error Occurd' : 'Error Occured'
      isConfirmed(error, true)
      apiProcess(-1, false)
      return { status: res.status, data: null }
    }
  }
  return {
    Api,
  }
}

export default ApiRequest
