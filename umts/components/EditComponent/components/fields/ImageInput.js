import React, { useState } from 'react'
import { Field } from 'formik'
import Button from '../../../common/Button'
import ImageGallery from '../../../common/ImageGallery'
import PopUp from '../../../dialog/popUp'

const ImageInput = ({ label, name, multiSelect = true, clientId }) => {
  const [popUp, setPopUp] = useState(false)

  const handleChange = (field) => (values) => {
    field.onChange({
      target: {
        value: multiSelect ? values.map((item) => item.url) : values.length > 0 ? values[0].url : '',
        name: field.name,
      },
    })
    setPopUp(false)
  }

  return (
    <div className="flex h-full items-center">
      <label className="mr-4">{label} :</label>
      <Button onClick={() => setPopUp(true)} filled={true}>
        Select Image
      </Button>
      <Field name={name}>
        {({ field, form, meta }) => {
          console.log(field)
          return (
            <>
              {popUp && (
                <PopUp openModal={popUp}>
                  <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-14 lg:w-4/5">
                    <div className="flex justify-between pb-2 border-b border-black border-solid mb-4">
                      <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Images</h1>
                      <svg
                        onClick={() => setPopUp(false)}
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
                    <ImageGallery
                      clientId={clientId}
                      multiSelect={multiSelect}
                      value={multiSelect ? field.value.map((item) => ({ url: item })) : [{ url: field.value }]}
                      onSelect={handleChange(field)}
                      mode=""
                    />
                  </div>
                </PopUp>
              )}
            </>
          )
        }}
      </Field>
    </div>
  )
}

export default ImageInput
