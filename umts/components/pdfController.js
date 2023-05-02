import { useState, useRef, useContext, useEffect } from 'react'
import Button from './common/Button'
import { AppContext } from '../context/appContext'
import { Input } from './componentLibrary'
import HelpBar from './tool/helpBar'
import axios from 'axios'

const PdfController = ({
  handleOpen,
  product: { productName, version },
  language,
  clientId,
  pdfKey,
  isConfirmed,
  formEl,
  compareComponentData,
  workerPath,
}) => {
  // shows list of available pdf for the current client>produtc>version>language
  const [pdfList, setPdfList] = useState([])
  // to toggle between upload view and selection view
  const [uploadMode, setUploadMode] = useState(true)
  // to store selected file from file input
  const [file, setFile] = useState(null)
  // to manage selected pdf
  const [selectedPdf, setSelectedPdf] = useState([])
  // to manage pdf current state = uploading or converting
  const [pdfStatus, setPdfStatus] = useState('')
  // file input ref for pdf upload
  const fileInputRef = useRef(null)
  const [, , setLoading] = useContext(AppContext)

  const [swapImage, setSwapImage] = useState('')
  const [uploadError, setUploadError] = useState('')

  // split Image
  const [isSplit, setIsSplit] = useState(false)

  useEffect(async () => {
    if (!pdfStatus) {
      setLoading(true)
      // getting all the available pdfs for current client>produtc>version>language
      const res = await fetch(`${workerPath}/api/flipBook/getPdf/${clientId}/${productName}/${version}/${language}`)
      const result = await res.json()
      if (result.length) {
        setPdfList(result)
        setUploadMode(false)
      }
      setLoading(false)
    }
  }, [pdfStatus])

  useEffect(() => {
    const pdf = formEl.current.getFieldProps(pdfKey).value
    if (pdf?.length) {
      setSelectedPdf(pdf)
    }
  }, [])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    } else {
      fileInputRef.current.value = null
      setFile(null)
    }
  }

  const handleUpload = async () => {
    const pdf = file
    fileInputRef.current.value = ''
    setFile(null)
    setPdfStatus('uploading')
    setLoading(true)

    if (pdf) {
      // step - 1 Uploading pdf

      const pdfId = Date.now()
      const formData = new FormData()
      formData.append('clientId', clientId)
      formData.append('productName', productName)
      formData.append('version', version)
      formData.append('language', language)
      formData.append('pdfId', pdfId)
      formData.append('flipBookPdf', pdf)

      const res = await fetch(`${workerPath}/api/flipBook/pdf`, {
        method: 'POST',
        body: formData,
      })
      const uploadResult = await res.json()

      if (uploadResult.success) {
        // step - 2 converting pdf

        setPdfStatus('converting')

        const fnRevert = async () => {
          // deleting uploaded pdf if error occured in pdf convertion
          setPdfStatus('reverting upload process')
          const res = await fetch(
            `${workerPath}/api/flipBook/delete/${clientId}/${productName}/${version}/${language}/${pdfId}`,
            {
              method: 'DELETE',
            },
          )
          const result = await res.json()
          setUploadError('Upload reverted due to error in converting, please try again later')
          setTimeout(() => {
            setUploadError('')
            setPdfStatus('')
            setLoading(false)
          }, 5000)
        }
        const fnSplit = async () => {
          setLoading(true)
          setPdfStatus('Splitting Images')
          const res = await fetch(`${workerPath}/api/flipBook/split/${clientId}`, {
            method: 'POST',
            body: JSON.stringify({
              path: uploadResult.path,
              language: language,
              productName: productName,
              version: version,
            }),
          })
          const splitResult = await res.json()
          if (splitResult.success) {
            setPdfStatus('')
            return true
          } else {
            return false
          }
        }

        const fnCheckStatus = async () => {
          const res = await fetch(`${workerPath}/api/flipBook/checkStatus/${clientId}`, {
            method: 'POST',
            body: JSON.stringify({
              clientId: clientId,
              language: language,
              productName: productName,
              version: version,
            }),
          })
          const result = await res.json()
          if (result.success) {
            return true
          } else {
            return new Promise((resolve, reject) => {
              setTimeout(async () => {
                const res = await fnCheckStatus()
                resolve(res)
              }, 25000)
            })
          }
        }
        try {
          const response = await fetch(`${workerPath}/api/flipBook/convert/${clientId}`, {
            method: 'POST',
            body: JSON.stringify({
              path: uploadResult.path,
              language: language,
              productName: productName,
              version: version,
              isSplit,
            }),
          })

          const convertResult = await response.json()

          // console.log('convert result==>', convertResult)

          if (convertResult.success) {
            setPdfStatus('')

            if (isSplit) {
              const result = await fnSplit()
              if (result) {
                setLoading(false)
              } else {
                await fnRevert()
                console.log('error splitting')
              }
            }
          } else if (convertResult.pending) {
            const res = await fnCheckStatus()
            // console.log(res, 'res of checkStatus')
            if (res) {
              const result = await fnSplit()
              if (result) {
                setLoading(false)
              } else {
                await fnRevert()
                console.log('error splitting')
              }
            }
          } else {
            await fnRevert()
          }
        } catch (e) {
          console.log('errr', e.message)
          await fnRevert()
        }
      } else {
        setLoading(false)
      }
      setIsSplit(false)
    }
  }

  function sortAlphaNum(a, b) {
    const reA = /[^a-zA-Z]/g
    const reN = /[^0-9]/g

    var aA = a.replace(reA, '')
    var bA = b.replace(reA, '')
    if (aA === bA) {
      const aN = parseInt(a.replace(reN, ''), 10)
      const bN = parseInt(b.replace(reN, ''), 10)
      return aN === bN ? 0 : aN > bN ? 1 : -1
    } else {
      return aA > bA ? 1 : -1
    }
  }

  const handleSelect = (type, value) => {
    if (type === 'pdf') {
      const pages = pdfList[value].pages
      let selectedPages = [...selectedPdf]
      let matchedPages = selectedPages.filter((item) => pages.includes(item))

      if (selectedPages.length) {
        for (let i = 0; i < pages.length; i++) {
          let index = selectedPages.indexOf(pages[i])
          if (index !== -1 && pages.length === matchedPages.length) {
            selectedPages.splice(index, 1)
          } else if (index === -1) {
            selectedPages.push(pages[i])
          }
        }
        setSelectedPdf(selectedPages)
      } else {
        setSelectedPdf(pages.sort(sortAlphaNum))
      }
    } else {
      if (selectedPdf.includes(value)) {
        let pdf = [...selectedPdf]
        let newPdf = pdf.filter((page) => page !== value)
        setSelectedPdf(newPdf)
      } else {
        setSelectedPdf((prevState) => [...prevState, value])
      }
    }
  }

  const handleDelete = (pdfId) => {
    isConfirmed('Are you sure you want to delete this pdf ?').then(async (confirm) => {
      if (confirm) {
        setLoading(true)
        const res = await fetch(
          `${workerPath}/api/flipBook/delete/${clientId}/${productName}/${version}/${language}/${pdfId}`,
          {
            method: 'DELETE',
          },
        )
        const result = await res.json()
        if (result.length) {
          setPdfList(result)
        } else {
          setPdfList([])
          setUploadMode(true)
        }

        setLoading(false)
      }
    })
  }

  //to save selected pdf
  const handleSave = () => {
    isConfirmed('Are you sure you want to save selected pdf').then((confirm) => {
      if (confirm) {
        formEl.current.setFieldValue(pdfKey, selectedPdf)
        compareComponentData()
        handleOpen(false)
      }
    })
  }

  // to re-order selected pdf pages
  const handleSwapImage = (e, eventName, image) => {
    if (eventName === 'start') {
      setSwapImage(image)
    } else {
      if (swapImage) {
        let imagesArr = [...selectedPdf]
        let firstIndex = imagesArr.indexOf(swapImage)
        let secondIndex = imagesArr.indexOf(image)
        let firstImage = imagesArr[firstIndex]
        let secondImage = image
        imagesArr[firstIndex] = secondImage
        imagesArr[secondIndex] = firstImage
        setSelectedPdf(imagesArr)
        setSwapImage('')
      } else {
        setSwapImage('')
      }
    }
  }

  return (
    <div className={`p-4 ${uploadMode ? 'mx-auto w-1/2' : 'mx-12'} bg-white rounded-lg border border-gray-300`}>
      <div className={'flex justify-between pb-4'}>
        <p className="self-end text-xl">{!uploadMode ? 'Select PDF' : 'Upload PDf'}</p>
        <Button variant="danger" onClick={() => handleOpen(false)}>
          Close
        </Button>
      </div>
      {!uploadMode ? (
        <div className="text-left">
          <div className="px-4 border rounded-lg pdf-viewscroll border-primary-400">
            {pdfList.map((pdf, index) => (
              <div key={pdf.name} className="flex p-2 my-4 border rounded-lg border-primary-400">
                <div className="flex ">
                  <div className="relative w-20 m-2 border border-gray-400 rounded-lg cursor-pointer md:h-36 md:w-28 h-28">
                    <span
                      className="absolute z-10 flex items-center justify-center w-6 h-6 rounded-full cursor-pointer -right-2 -top-2 bg-primary-400"
                      onClick={() => handleDelete(pdf.name)}
                    >
                      <img src="/images/close.svg" width="12" height="12" />
                    </span>
                    <img
                      src={`https://cdn.mts-online.com/${clientId}/static/${productName}/${version}/pdf/${language}/images/${pdf.pages[0]}`}
                      alt={pdf.pages[0]}
                      className="w-full h-full rounded-lg"
                      onClick={() => handleSelect('pdf', index)}
                      draggable={false}
                    />
                    {/* <img
                      onClick={() => handleSelect('pdf', index)}
                      src={`http://10.10.10.119:3004/api/flipBook/cdn/${clientId}/${productName}/${version}/${language}/${pdf.pages[0]}`}
                      // alt={pdf.pages[0]}
                      className="w-full h-full rounded-lg"
                      draggable={false}
                    /> */}
                  </div>
                  <div className="mx-4 border-2 border-primary-400"></div>
                </div>
                <div className="flex flex-wrap pdf-pageview pdfpage-scrollbar">
                  {pdf.pages.sort(sortAlphaNum).map((page) => (
                    <div
                      className={`md:h-36 md:w-28 w-20 h-28 m-2 border border-gray-400 rounded-lg cursor-pointer ${
                        selectedPdf.includes(page) ? 'selected-page' : ''
                      }`}
                      key={page}
                      onClick={() => handleSelect('page', page)}
                    >
                      <img
                        src={`https://cdn.mts-online.com/${clientId}/static/${productName}/${version}/pdf/${language}/images/${page}`}
                        alt={page}
                        className="w-full h-full rounded-lg"
                        draggable={false}
                      />
                      {/* <img
                        src={`http://10.10.10.119:3004/api/flipBook/cdn/${clientId}/${productName}/${version}/${language}/${page}`}
                        alt={page}
                        className="w-full h-full rounded-lg"
                        draggable={false}
                      /> */}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {selectedPdf.length > 0 && (
            <div>
              <p className="py-4 text-xl">Selected items</p>
              <div className="flex flex-wrap p-2 border rounded-lg pdf-pageview pdfpage-scrollbar border-primary-400">
                {selectedPdf.map((page) => (
                  <div
                    className="relative w-20 m-2 border border-gray-400 rounded-lg cursor-pointer md:h-36 md:w-28 h-28"
                    key={page}
                  >
                    <span
                      className="absolute z-10 flex items-center justify-center w-6 h-6 rounded-full cursor-pointer -right-2 -top-2 bg-primary-400"
                      onClick={() => handleSelect('page', page)}
                    >
                      <img src="/images/close.svg" width="12" height="12" />
                    </span>
                    <img
                      src={`https://cdn.mts-online.com/${clientId}/static/${productName}/${version}/pdf/${language}/images/${page}`}
                      alt={page}
                      className="w-full h-full rounded-lg"
                      draggable={true}
                      onDragStart={(e) => handleSwapImage(e, 'start', page)}
                      onDrop={(e) => handleSwapImage(e, 'drop', page)}
                      onDragOver={(ev) => ev.preventDefault()}
                    />
                    {/* <img
                      src={`http://10.10.10.119:3004/api/flipBook/cdn/${clientId}/${productName}/${version}/${language}/${page}`}
                      alt={page}
                      className="w-full h-full rounded-lg"
                      draggable={true}
                      onDragStart={(e) => handleSwapImage(e, 'start', page)}
                      onDrop={(e) => handleSwapImage(e, 'drop', page)}
                      onDragOver={(ev) => ev.preventDefault()}
                    /> */}
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button variant="primary" type="button" className="mt-4" onClick={() => setUploadMode(true)}>
            Upload More
          </Button>
          <Button variant="primary" type="button" className="mt-4 ml-8" onClick={() => handleSave()}>
            Confirm selected
          </Button>
        </div>
      ) : (
        <div className="text-left">
          <div className="flex items-center p-4 border-2 rounded-lg border-primary-400">
            <label
              htmlFor="pdfUpload"
              className="flex items-center justify-center bg-gray-400 rounded-lg cursor-pointer h-36 w-28"
            >
              <span className="text-8xl">
                <img src="/images/plus-bar-white.svg" width="60" height="60" />
              </span>
            </label>
            <input type="file" id="pdfUpload" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <div>
              {file && <p className="inline-block mx-4 text-lg">{file.name}</p>}
              {file && (
                <div className="w-full px-4">
                  <div className="flex py-1">
                    <h2 className="mx-2 my-2">Split Page</h2>
                    <HelpBar isToggle={true} value={`Split all pages from pdf.`} />
                    <Input
                      type="toggle"
                      id="split"
                      variant="primary"
                      checked={isSplit}
                      onChange={() => setIsSplit((prev) => !prev)}
                    />
                  </div>
                </div>
              )}
              {file && (
                <Button className="ml-2" variant="primary" disabled={!file} type="button" onClick={handleUpload}>
                  Upload
                </Button>
              )}
              {pdfStatus && !uploadError ? <span className="ml-2 text-xl text-green-500">{pdfStatus}</span> : ''}
              {uploadError.length > 0 && <span className="ml-2 text-lg text-red-500">{uploadError}</span>}
            </div>
          </div>
          {pdfList.length > 0 && (
            <Button variant="primary" type="button" className="block mt-4" onClick={() => setUploadMode(false)}>
              View Uploaded
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default PdfController
