const ImageSelectionList = ({
  clientImages,
  handleClose,
  controlSelectedImages,
  onImageSelectionChange,
  isPopup = true,
  isMultiSelect = true,
}) => {
  const handleSelectedImages = (image) => {
    let images = [...controlSelectedImages]
    const isAlreadySelected = images.filter((x) => x.url == image.url).length > 0 ? true : false
    if (isAlreadySelected) {
      images = images.filter((img) => img.url !== image.url)
    } else {
      if (isMultiSelect) {
        images.push(image)
      } else if (controlSelectedImages.length < 1) {
        images.push(image)
      }
    }
    onImageSelectionChange(images)
  }

  return (
    <div className="main-wrapper m-8">
      <div
        className={`md:mt-6 mt-32 p-6 mx-auto bg-white rounded-lg ${
          isPopup ? 'lg:w-4/5' : 'lg:w-5/5'
        }  border border-gray-300`}
      >
        <div className="border-solid  pb-2 border-b border-black flex justify-between">
          <h2 className="text-lg text-left">{isPopup ? 'Uploaded Images' : 'Select Image'}</h2>
          {isPopup && (
            <svg
              onClick={() => {
                handleClose({ type: 'cancel', data: [] })
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
          )}
        </div>
        <div className="client-modal-scroll">
          <div>
            {clientImages?.length > 0 ? (
              <div className="my-4">
                <div className="my-4 grid grid-cols-5 gap-6 border-2 border-green-400 rounded-lg p-6 max-h-96 overflow-auto">
                  {clientImages.map((image, index) => {
                    return (
                      <div
                        key={index}
                        className={'border border-gray-400 rounded-lg p-2 cursor-pointer relative h-36'}
                        onClick={() => handleSelectedImages(image)}
                      >
                        <img src={image.url} className="object-cover object-center h-full w-full rounded-lg" />
                        {controlSelectedImages.filter((x) => x.url == image.url).length > 0 && (
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
                  <div className="col-span-5 p-1"></div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg text-center my-4 text-gray-500">No images are Uploaded</h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageSelectionList
export async function getServerSideProps(context) {
  return Authenticate(context)
}
