import { useState, useRef } from 'react'
import Button from './common/Button'
const ImageUploadList = ({
  kognitiveImages,
  loadingKognitiveImages,
  handleChange,
  imageItems,
  isConfirmed,
  setLoading,
  clientId,
  workerPath,
  apiPath = 'images',
  uploadPath,
}) => {
  const [uploadFrom, setUploadFrom] = useState('local')
  const [images, setImages] = useState({ status: '', images: [] })
  const [previews, setPreviews] = useState([])
  const imageInputRef = useRef(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [loadMore, setLoadMore] = useState(10)

  const handleImagesChange = (e) => {
    let files = e.target.files
    let imgs = images.images
    let prvs = previews
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.includes('image')) {
        imgs.push(files[i])
        prvs.push(URL.createObjectURL(files[i]))
      }
    }
    setImages({ status: 'selected', images: imgs })
    setPreviews(prvs)
  }

  const handleSelectedImages = (image) => {
    let images = [...selectedImages]
    const isAlreadySelected = images.includes(image)
    if (isAlreadySelected) {
      images = images.filter((img) => img !== image)
    } else {
      images.push(image)
    }
    setSelectedImages(images)
  }

  const handleImageUpload = async () => {
    if (images.images.length > 0 || selectedImages.length > 0) {
      setLoading(true)
      setImages({ ...images, status: 'uploading' })
      const formData = new FormData()
      const pathId = Date.now()
      formData.append('pathId', pathId)
      for (let i = 0; i < images.images.length; i++) {
        formData.append('myImages', images.images[i])
      }
      if (selectedImages.length > 0) {
        let imgs = []
        const showUrl =
          'https://res.cloudinary.com/seekda/image/upload/if_ar_gte_16:9,w_220,h_150,c_limit/if_ar_gte_9:16_and_ar_lt_16:9,w_220,h_150,c_limit/if_ar_lt_9:16,w_1080,h_3888,c_limit/f_auto,fl_lossy,q_auto/production'
        const prodUrl =
          'https://res.cloudinary.com/seekda/image/upload/if_ar_gte_16:9,w_3888,h_1080,c_limit/if_ar_gte_9:16_and_ar_lt_16:9,w_1920,h_1920,c_limit/if_ar_lt_9:16,w_1080,h_3888,c_limit/f_auto,fl_lossy,q_auto/production'
        for (let i = 0; i < selectedImages.length; i++) {
          let str = selectedImages[i].replace(showUrl, prodUrl)
          imgs.push(str)
        }
        formData.append('kognitiveImages', JSON.stringify(imgs))
      } else {
        formData.append('kognitiveImages', null)
      }

      const res = await fetch(`${workerPath}/api/${apiPath}/upload/${clientId}`, {
        method: 'POST',
        headers: { key1: uploadPath },
        body: formData,
      })

      const result = await res.json()
      setLoading(false)
      if (result.success) {
        handleChange(result.images)
        if (imageInputRef.current) {
          imageInputRef.current.value = null
        }
        setPreviews([])
        setImages({ images: [], status: 'uploaded' })
        setSelectedImages([])
      }
    } else {
      setImages({ ...images, status: 'image not selected' })
      setTimeout(() => setImages({ ...images, status: '' }), 2000)
    }
  }

  // to delete uploaded images.
  const deleteImage = async (imageName) => {
    const confirmDelete = await isConfirmed('Are you sure you want to delete uploaded image')
    if (confirmDelete) {
      setImages({ ...images, status: 'deleting' })
      setLoading(true)
      const res = await fetch(`${workerPath}/api/${apiPath}/delete/${clientId}/${imageName}`, {
        method: 'POST',
        headers: { key1: uploadPath },
      })
      const result = await res.json()
      setLoading(false)
      if (result.success) {
        setImages({ ...images, status: 'deleted' })
        let imgs = [...imageItems]
        handleChange(imgs.filter((x) => x.name != imageName))
      } else {
        if (result.message === 'image not found') {
          setImages({ ...images, status: 'image not found' })
          setTimeout(() => setImages({ ...images, status: '' }), 1000)
        }
      }
    }
  }

  return (
    <div className="md:mt-6 mt-32 p-6 mx-auto bg-white rounded-lg lg:w-4/5 border border-gray-300">
      <div className="w-full">
        <h2 className="text-lg text-left">Upload Images</h2>
        <div>
          <nav className="tabs flex flex-col sm:flex-row">
            <button
              onClick={() => setUploadFrom('local')}
              className={`py-4 px-6 block hover:text-green-500 focus:outline-none ${
                uploadFrom === 'local'
                  ? 'focus:text-green-500 border-b-2 font-medium text-green-500  border-green-500'
                  : 'text-gray-600'
              }`}
              type="button"
            >
              From Local
            </button>
            <button
              onClick={() => setUploadFrom('kognitiv')}
              className={`py-4 px-6 block hover:text-green-500 focus:outline-none ${
                uploadFrom === 'kognitiv'
                  ? 'focus:text-green-500 border-b-2 font-medium text-green-500  border-green-500'
                  : 'text-gray-600'
              }`}
              type="button"
            >
              From Kognitiv
            </button>
          </nav>
        </div>
        {uploadFrom === 'local' ? (
          <div className="my-4">
            <h2 className="text-lg mb-4 text-left">Upload From Local :</h2>
            <div className="border-2 border-green-400 rounded-lg my-4 p-4 grid md:grid-cols-5 grid-cols-1 gap-6">
              <label
                htmlFor="uploadImages"
                className="text-8xl h-36 flex justify-center items-center m-1 rounded-lg cursor-pointer text-white bg-gray-400"
              >
                <img className="inline-block" src="/images/plus-bar-white.svg" width="100" height="80" />
              </label>
              <input
                type="file"
                name="uploadImages"
                id="uploadImages"
                onChange={handleImagesChange}
                className="hidden"
                multiple
                ref={imageInputRef}
              />
              {previews.length > 0 &&
                previews.map((image, index) => (
                  <div className="border border-gray-400 p-2 m-1 rounded-lg relative h-36" key={index}>
                    <img src={image} className="object-cover object-center h-full w-full rounded-lg" />
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div>
            {kognitiveImages.length > 0 ? (
              <div className="my-4">
                <h2 className="text-lg text-left">Upload From Kognitive :</h2>
                <div className="my-4 grid grid-cols-5 gap-6 border-2 border-green-400 rounded-lg p-6 max-h-96 overflow-auto">
                  {kognitiveImages.slice(0, loadMore).map((image, index) => {
                    return (
                      <div
                        key={index}
                        className={'border border-gray-400 rounded-lg p-2 cursor-pointer relative h-36'}
                        onClick={() => handleSelectedImages(image)}
                      >
                        <img src={image} className="object-cover object-center h-full w-full rounded-lg" />
                        {selectedImages.includes(image) && (
                          <span
                            style={{
                              backgroundColor: '#00000071',
                            }}
                            className="cursor-pointer absolute inset-0 rounded-lg flex justify-center items-center font-bold text-3xl text-white"
                            onClick={() => handleSelectedImages(image)}
                          >
                            <img src="/images/box_check.svg" />
                          </span>
                        )}
                      </div>
                    )
                  })}
                  {kognitiveImages.length > loadMore && (
                    <Button
                      type="button"
                      variant="primary"
                      className="col-start-3"
                      onClick={() => {
                        setLoadMore(loadMore + 10)
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
                  {loadingKognitiveImages ? 'Loading...' : 'No Images Found In Kognitive For This Client'}
                </h2>
              </div>
            )}
          </div>
        )}
        <div className="text-left">
          {images.status === 'image not selected' && <p className="text-red-500 m-2 font-bold">No Image Selected</p>}
          {images.status !== 'uploading' ? (
            <Button variant="primary" className="text-left" type="button" onClick={handleImageUpload}>
              Upload Images
            </Button>
          ) : (
            <p className="text-green-400 m-2 font-bold">Uploading...</p>
          )}
        </div>
        {imageItems?.length > 0 ? (
          <div className="my-4">
            <h2 className="text-lg text-left">Uploaded Images</h2>
            <div className="my-4 grid grid-cols-5 gap-6 border border-gray-300 rounded-lg p-6 max-h-96 overflow-auto">
              {imageItems.map((image, index) => {
                return (
                  <div key={index} className={'border border-gray-400 rounded-lg p-2 relative h-36'}>
                    <img src={image.url} className="object-cover object-center h-full w-full rounded-lg" />
                    <span
                      className="text-xl p-2 rounded-full cursor-pointer font-bold text-white bg-primary-400 -right-2 -top-2 absolute"
                      onClick={async () => {
                        await deleteImage(image.name)
                      }}
                    >
                      <img src="/images/close.svg" />
                    </span>
                  </div>
                )
              })}
              <div className="col-span-5 p-1"></div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg text-center my-4 text-gray-500">No images are uploaded</h2>
          </div>
        )}
        <div className="text-left">
          {images.status === 'deleting' && <p className="text-red-500 m-2 font-bold">Deleting...</p>}
          {images.status === 'image not found' && <p className="text-red-500 m-2 font-bold">Image Not Found</p>}
        </div>
      </div>
    </div>
  )
}

export default ImageUploadList
export async function getServerSideProps(context) {
  return Authenticate(context)
}
