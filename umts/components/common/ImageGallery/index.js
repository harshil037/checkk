import React, { useContext, useEffect, useRef, useState } from 'react'
import { request, gql } from 'graphql-request'
import Button from '../Button'
import { AppContext } from '../../../context/appContext'
import useConfirm from '../../dialog/useConfirm'

const WORKER_URL = 'http://10.10.10.119:3003'

/**
 * @typedef {Object} ImageGallery
 * @prop {string} clientId - client id
 * @prop {string=} mode - value can be gallery (for only image select) | upload (for only image upload).
 * if left empty then its combined.
 * @prop {boolean} [selectable=true] - user able to select image. default value is true.
 * @prop {boolean} [multiSelect=true] - user able to select multiple images. default value is true.
 * @prop {Array} [value=[]] - array of preselected images.
 * @prop {Function} onSelect - returns selected images.
 */

/**
 * Image Controller
 * @param {ImageGallery} props
 * @returns
 */
const ImageGallery = ({
  clientId,
  mode,
  selectable = true,
  multiSelect = true,
  value = [],
  onSelect = (images = []) => {},
}) => {
  const [kognitiveImages, setKognitiveImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [images, setImages] = useState({ status: '', images: [] })
  const [currentView, setCurrentView] = useState(mode === 'upload' ? 'upload' : 'gallery')
  const [uploadFrom, setUploadFrom] = useState('local')
  const [selectedKognitivImages, setSelectedKognitivImages] = useState([])
  const [imageWindow, setImageWindow] = useState(10)
  const [previews, setPreviews] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])

  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const { isConfirmed } = useConfirm()

  const imageInputRef = useRef(null)

  const inputId = useRef(Date.now())

  const cmQuery = gql`
    query ($config: JSON!, $language: String!, $provider: String!) {
      # ****** For cm ******
      cm(config: $config, language: $language, provider: $provider) {
        # ****** For images ******
        pictures(topics: "") {
          width
          height
          size
          topic {
            title
            code
          }
          title
          url
        }
      }
    }
  `
  const variables = {
    language: 'it',
    provider: 'kognitiv',
  }

  useEffect(async () => {
    const url = `https://u.mts-online.com/api/graphql/cm/${clientId}/1`

    try {
      setLoadingImages(true)

      if (mode !== 'upload') {
        const result = await (await fetch(`${WORKER_URL}/api/images/get/${clientId}`)).json()

        if (result.data) {
          const newArr = []

          for (let i = 0; i < value.length; i++) {
            const currImage = value[i]
            const imageIndex = result.data.findIndex((img) => img.url === currImage.url)
            if (imageIndex !== -1) {
              newArr.push(currImage)
            }
          }

          if (newArr.length) setSelectedImages(newArr)
          setUploadedImages(result.data)
        }
      }

      if (mode !== 'gallery') {
        const result = await request(url, cmQuery, variables)

        if (result.cm.pictures?.length > 0) {
          // to show image in thumbnil in low quality
          const showUrl =
            'https://res.cloudinary.com/seekda/image/upload/if_ar_gte_16:9,w_220,h_150,c_limit/if_ar_gte_9:16_and_ar_lt_16:9,w_220,h_150,c_limit/if_ar_lt_9:16,w_1080,h_3888,c_limit/f_auto,fl_lossy,q_auto/production'

          const imagesArr = result.cm.pictures.map((image) => {
            const imgUrlArr = decodeURI(image.url).split('/')
            return {
              name: imgUrlArr[imgUrlArr.length - 1],
              url: image.url.replace('https://images.seekda.net', showUrl),
            }
          })

          setKognitiveImages(imagesArr)
        } else {
          setKognitiveImages([])
        }
      }

      setLoadingImages(false)
    } catch (err) {
      console.log(err.message)
      setLoadingImages(false)
    }
  }, [clientId])

  const handleSelectKognitivImages = (image) => () => {
    const newImages = [...selectedKognitivImages]
    const isAlreadySelected = newImages.findIndex((item) => item.url === image.url) !== -1

    if (isAlreadySelected) {
      newImages = newImages.filter((img) => img.url !== image.url)
    } else {
      newImages.push(image)
    }
    setSelectedKognitivImages(newImages)
  }

  const clearFileInput = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = null
      setPreviews([])
      setImages({ images: [], status: '' })
    }
  }

  const handleImagesChange = (e) => {
    const files = e.target.files
    const newImages = [...images.images]
    const newPreviews = [...previews]

    for (let i = 0; i < files.length; i++) {
      if (files[i].type.includes('image')) {
        // to upload inages
        newImages.push(files[i])
        // to show the preview of the selected images
        newPreviews.push({ name: files[i].name, url: URL.createObjectURL(files[i]) })
      }
    }

    setImages({ status: 'selected', images: newImages })
    setPreviews(newPreviews)
  }

  const handleImageUpload = async () => {
    if (images.images.length > 0 || selectedKognitivImages.length > 0) {
      setLoading(true)
      setImages({ ...images, status: 'uploading' })
      const formData = new FormData()

      // adding local images
      for (let i = 0; i < images.images.length; i++) {
        formData.append('myImages', images.images[i])
      }

      // adding kognitiv images
      if (selectedKognitivImages.length > 0) {
        const imgs = []

        // thumbnil url - low quality
        const showUrl =
          'https://res.cloudinary.com/seekda/image/upload/if_ar_gte_16:9,w_220,h_150,c_limit/if_ar_gte_9:16_and_ar_lt_16:9,w_220,h_150,c_limit/if_ar_lt_9:16,w_1080,h_3888,c_limit/f_auto,fl_lossy,q_auto/production'

        // to download image in high quality
        const downloadUrl =
          'https://res.cloudinary.com/seekda/image/upload/if_ar_gte_16:9,w_3888,h_1080,c_limit/if_ar_gte_9:16_and_ar_lt_16:9,w_1920,h_1920,c_limit/if_ar_lt_9:16,w_1080,h_3888,c_limit/f_auto,fl_lossy,q_auto/production'

        for (let i = 0; i < selectedKognitivImages.length; i++) {
          imgs.push({
            name: selectedKognitivImages[i].name,
            url: selectedKognitivImages[i].url.replace(showUrl, downloadUrl),
          })
        }

        formData.append('kognitiveImages', JSON.stringify(imgs))
      } else {
        formData.append('kognitiveImages', null)
      }

      try {
        const res = await fetch(`${WORKER_URL}/api/images/upload/${clientId}`, {
          method: 'POST',
          body: formData,
        })

        const result = await res.json()

        setLoading(false)

        if (result.data) {
          if (imageInputRef.current) {
            imageInputRef.current.value = null
          }
          setPreviews([])
          setImages({ images: [], status: 'uploaded' })
          setSelectedKognitivImages([])
          if (mode !== 'upload') {
            setUploadedImages(result.data)
            setCurrentView('gallery')
          } else {
            isConfirmed('Images Uploaded Successfully', true)
          }
        }
      } catch (e) {
        setLoading(false)
        console.log('error=>', e.message)
      }
    } else {
      setImages({ ...images, status: 'image not selected' })
      setTimeout(() => setImages({ ...images, status: '' }), 2000)
    }
  }

  const handleSelectedImages = (image) => () => {
    if (!selectable) return

    const newImages = [...selectedImages]
    const isAlreadySelected = newImages.findIndex((item) => item.url === image.url) !== -1

    if (!multiSelect && selectedImages.length > 0 && !isAlreadySelected) {
      isConfirmed('You can select only one image!', true)
      return
    }

    if (isAlreadySelected) {
      newImages = newImages.filter((img) => img.url !== image.url)
    } else {
      newImages.push(image)
    }

    const url =  [...newImages]
    setSelectedImages(newImages)
  }

  // to delete uploaded images.
  const deleteImage = async (imageName) => {
    const confirmDelete = await isConfirmed(`Are you sure you want to delete ${imageName}?`)
    if (confirmDelete) {
      setImages({ ...images, status: 'deleting' })
      setLoading(true)
      const res = await fetch(`${WORKER_URL}/api/images/delete/${clientId}/${imageName}`, {
        method: 'POST',
      })
      const result = await res.json()
      setLoading(false)
      if (result.data) {
        setImages({ ...images, status: 'deleted' })
        setUploadedImages(result.data)
      } else {
        if (result.error === 'image not found') {
          setImages({ ...images, status: 'image not found' })
          setTimeout(() => setImages({ ...images, status: '' }), 1000)
        }
      }
    }
  }

  return (
    <div className="border-2 border-primary-400 rounded-lg p-4">
      {currentView === 'gallery' && (
        <div>
          {loadingImages ? (
            <h2 className="text-center text-lg my-4 text-gray-500">Loading images...</h2>
          ) : uploadedImages?.length > 0 ? (
            <>
              <div className="flex justify-between">
                <h2 className="text-lg text-left">Uploaded Images</h2>
                {mode !== 'gallery' && (
                  <div>
                    <Button
                      variant="danger"
                      className="mr-2"
                      onClick={() => {
                        if (!deleteMode) setSelectedImages([])
                        setDeleteMode(!deleteMode)
                      }}
                    >
                      {deleteMode ? 'Cancel' : 'Delete Image'}
                    </Button>

                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => {
                        if (deleteMode) setDeleteMode(false)
                        setCurrentView('upload')
                      }}
                    >
                      Upload More
                    </Button>
                  </div>
                )}
              </div>
              <div className="my-4 grid grid-cols-5 gap-6 p-2 max-h-96 overflow-auto">
                {uploadedImages.map((image, index) => {
                  const isSelected = selectedImages.findIndex((item) => item.url === image.url) !== -1
                  return (
                    <div
                      key={index}
                      className={`border border-gray-400 rounded-lg p-2 relative h-36 select-none ${
                        selectable ? 'cursor-pointer' : ''
                      }`}
                      onClick={!isSelected && !deleteMode ? handleSelectedImages(image) : () => {}}
                    >
                      <img src={image.url} className="object-cover object-center h-[91%] w-full rounded-lg" />
                      <p className="text-xs text-center">{image.name}</p>
                      {deleteMode && (
                        <span
                          className="text-xl p-2 rounded-full cursor-pointer font-bold text-white bg-red-400 -right-2 -top-2 absolute"
                          onClick={async () => {
                            await deleteImage(image.name)
                          }}
                          title={`Delete ${image.name}`}
                        >
                          <img src="/images/close.svg" />
                        </span>
                      )}
                      {isSelected && (
                        <span
                          style={{
                            backgroundColor: '#00000071',
                          }}
                          className={`${
                            selectable ? 'cursor-pointer' : ''
                          } absolute inset-0 rounded-lg flex justify-center items-center font-bold text-3xl text-white`}
                          onClick={handleSelectedImages(image)}
                        >
                          <img src="/images/box_check.svg" />
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              {selectable && (
                <div className="text-right">
                  <Button variant="primary" filled={true} type="button" onClick={() => onSelect(selectedImages)}>
                    Select {selectedImages.length} Image{selectedImages.length > 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl my-4 text-gray-500">No images are uploaded</h2>
              {mode !== 'gallery' && (
                <Button
                  variant="primary"
                  filled={true}
                  type="button"
                  onClick={() => {
                    if (deleteMode) setDeleteMode(false)
                    setCurrentView('upload')
                  }}
                >
                  Upload Images
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      {currentView === 'upload' && (
        <div>
          <div className="flex mb-2">
            <button
              onClick={() => setUploadFrom('local')}
              className={`py-4 px-6 block hover:text-primary-500 font-medium focus:outline-none border-b-2 ${
                uploadFrom === 'local'
                  ? 'focus:text-primary-400 text-primary-400  border-primary-400'
                  : 'text-gray-600 border-transparent'
              }`}
              type="button"
            >
              From Local
              {previews.length > 0 && (
                <span className="px-2 inline-block bg-primary-400 text-white top-0 right-0 ml-2 rounded-lg font-medium">
                  {previews.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setUploadFrom('kognitiv')}
              className={`py-4 px-6 block hover:text-primary-500 font-medium focus:outline-none border-b-2  ${
                uploadFrom === 'kognitiv'
                  ? 'focus:text-primary-400 text-primary-400  border-primary-400'
                  : 'text-gray-600 border-transparent'
              }`}
              type="button"
            >
              From Kognitiv
              {selectedKognitivImages.length > 0 && (
                <span className="px-2 inline-block bg-primary-400 text-white top-0 right-0 ml-2 rounded-lg font-medium">
                  {selectedKognitivImages.length}
                </span>
              )}
            </button>
            {previews.length > 0 && uploadFrom === 'local' && (
              <div className="text-right py-2">
                <Button variant="danger" onClick={clearFileInput}>
                  Clear selection
                </Button>
              </div>
            )}
          </div>
          <div>
            {uploadFrom === 'local' ? (
              <div>
                <div className="my-4 grid md:grid-cols-5 grid-cols-1 gap-6 max-h-96 overflow-auto">
                  <label
                    htmlFor={`imageInput-${inputId.current}`}
                    className="text-8xl h-36 flex justify-center items-center m-1 rounded-lg cursor-pointer text-white bg-gray-400"
                  >
                    <img className="inline-block" src="/images/plus-bar-white.svg" width="100" height="80" />
                  </label>
                  <input
                    type="file"
                    name={`imageInput-${inputId.current}`}
                    id={`imageInput-${inputId.current}`}
                    onChange={handleImagesChange}
                    className="hidden"
                    multiple
                    ref={imageInputRef}
                    accept="image/*"
                  />
                  {previews.length > 0 &&
                    previews.map((image, index) => (
                      <div className="border border-gray-400 p-2 m-1 rounded-lg relative h-36" key={index}>
                        <img
                          src={image.url}
                          className="object-cover object-center h-[91%] w-full rounded-lg"
                          title={image.name}
                        />
                        <p className="text-xs text-center">{image.name}</p>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <>
                {kognitiveImages.length > 0 ? (
                  <div>
                    {/* <h2 className="text-lg text-left">Upload From Kognitive :</h2> */}
                    <div className="my-4 grid grid-cols-5 gap-6 max-h-96 overflow-auto">
                      {kognitiveImages.slice(0, imageWindow).map((image, index) => {
                        const isSelected = selectedKognitivImages.findIndex((item) => item.url === image.url) !== -1
                        return (
                          <div
                            key={index}
                            className={'border border-gray-400 rounded-lg p-2 cursor-pointer relative select-none h-36'}
                            onClick={!isSelected ? handleSelectKognitivImages(image) : () => {}}
                          >
                            <img
                              src={image.url}
                              className="object-cover object-center h-[91%] w-full rounded-lg"
                              title={image.name}
                            />
                            <p className="text-xs text-center">{image.name}</p>
                            {isSelected && (
                              <span
                                style={{
                                  backgroundColor: '#00000071',
                                }}
                                className="cursor-pointer absolute inset-0 rounded-lg flex justify-center items-center font-bold text-3xl text-white"
                                onClick={handleSelectKognitivImages(image)}
                              >
                                <img src="/images/box_check.svg" />
                              </span>
                            )}
                          </div>
                        )
                      })}
                      {kognitiveImages.length > imageWindow && (
                        <Button
                          type="button"
                          variant="primary"
                          className="col-start-3"
                          onClick={() => {
                            setImageWindow((prev) => prev + 10)
                          }}
                        >
                          Load More
                        </Button>
                      )}
                      <div className="col-span-5 p-1"></div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg text-center my-4 text-gray-500">
                      {loadingImages ? 'Loading...' : 'No Images Found In Kognitive For This Client'}
                    </h2>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="text-right mt-4">
            {images.status === 'image not selected' && <p className="text-red-500 m-2 font-bold">No Image Selected</p>}
            {images.status !== 'uploading' ? (
              <div className={`flex ${mode !== 'upload' ? 'justify-between' : 'justify-end'}`}>
                {mode !== 'upload' && (
                  <Button variant="primary" className="mr-2" onClick={() => setCurrentView('gallery')}>
                    Show Uploaded
                  </Button>
                )}
                <Button variant="primary" type="button" filled onClick={handleImageUpload}>
                  Upload {previews.length + selectedKognitivImages.length} Image
                  {previews.length + selectedKognitivImages.length > 1 ? 's' : ''}
                </Button>
              </div>
            ) : (
              <p className="text-primary-400 m-2 font-bold">Uploading...</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageGallery
