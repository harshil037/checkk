import React, { useState, useEffect, useRef } from 'react'
import { Input, Select } from './componentLibrary'
import Button from './common/Button'

const EditEvent = ({ event, handleClose, setLoading, isConfirmed, labels, clientId }) => {
  const [errorMsg, setErrorMsg] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [eventData, setEventData] = useState( event || {eventType:"", eventName:""})
  const [showHobexFields, setShowHobexFields] = useState(event?.entityId ? true : false)

  const handleChange = (key) => (e) => {
    setEventData((state) => ({ ...state, [key]: e.target.value }))
  }
  const toggleHandler = (key) => (e) => {
    // setProductData((state) => ({ ...state, [key]: e.target.checked }))
    const toggleValue = e.target.checked
   setShowHobexFields(toggleValue)
  }

//   const handleDelete = async () => {
//     setLoading(true)
//     const { _id } = eventData
//     const res = await fetch('/api/events', {
//       method: 'DELETE',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ _id }),
//     })
//     if (res.status === 202) {
//       handleClose({ reason: 'update' })
//     } else {
//       setLoading(false)
//       const jsonRes = await res.json()
//       setErrorMsg(jsonRes.error)
//     }
//   }


//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (validate() == true) {
//       setLoading(true)
//       const { dataSources, ...rest } = eventData
//       //const passData = { languages, rest }
//       rest.languages = languages
//       rest.addresses = addresses.reduce((abc, xyz) => ({ ...abc, [xyz.name]: xyz.value }), {})

//       const res = await fetch('/api/events', {
//         method: event ? 'PATCH' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(rest),
//       })
//       if (res.status === 201 || res.status === 200) {
//         await updateDataSources()
//         handleClose({ reason: 'update' })
//       } else {
//         setLoading(false)
//         const jsonRes = await res.json()
//         setErrorMsg(jsonRes.error)
//         myRef.current.scrollIntoView({ behavior: 'smooth' })
//       }
//     } else {
//       // handleClose({ reason: 'justClose' })
//     }
//   }
const validate = ()=>{
    return true
}
const handleSubmit = async(e) =>{
    e.preventDefault();
    if(validate()){
      
        const res = await fetch(`/api/events/${clientId}`, {
            method: event ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          })
          if (res.status === 201 || res.status === 200) {
            handleClose()
          } else {
            setLoading(false)
            const jsonRes = await res.json()
            setErrorMsg(jsonRes.error)
            myRef.current.scrollIntoView({ behavior: 'smooth' })
          }
    }
}



  return (
    <form id={`event-${eventData ? eventData._id : ''}-form`} onSubmit={handleSubmit}>
      <div className="m-8 main-wrapper">
        <div className="p-6 mx-auto mt-32 bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-4/5">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">{labels?.eventDetails}</h1>
            <svg
              onClick={handleClose}
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

          <div className="event-modal-scroll">
            {' '}
            {errorMsg ? (
              <div ref={myRef} className="flex flex-wrap -mx-4 text-left">
                <div className="w-full px-4 text-red-500 sm:w-1/2">{errorMsg}</div>
              </div>
            ) : null}
            <div className="flex flex-wrap -mx-4 text-left">
            <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{labels?.eventId}</h2>
                <Input
                  id="eventId"
                  type="eventId"
                  variant={formErrors?.eventId ? 'danger' : 'primary'}
                  placeholder="Event Id"
                  value={eventData?.eventId || ''}
                  onChange={handleChange('eventId')}
                  onBlur={(e) => {
                    // setValidateKeyValue({ key: 'clientId', value: e.target.value })
                  }}
                />
                <span className="text-red-500">{formErrors?.eventId}</span>
              </div>
              <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{labels?.eventName}</h2>
                <Input
                  type="text"
                  id="eventName"
                  variant={formErrors?.eventName ? 'danger' : 'primary'}
                  placeholder="Event Name"
                  value={eventData?.eventName || ''}
                  onChange={handleChange('eventName')}
                  onBlur={(e) => {
                    // setEventData((t)=>({...t, eventName : e.target.value}) )
                  }}
                />
                <span className="text-red-500">{formErrors?.eventName}</span>
              </div>
{/*               
            </div>
            <div className="flex flex-wrap -mx-4 text-left">   */}
            <div className="w-full sm:w-1/2">
                  <h2 className="mt-4 mb-2">{labels?.eventType}</h2>

                  <Select
                    value={eventData?.eventType}
                    variant={formErrors?.eventType ? 'danger' : 'primary'}
                    onChange={handleChange('eventType')}
                    onBlur={(e) => {
                    //   setValidateKeyValue({ key: 'type', value: e.target.value })
                    }}
                    id="eventType"
                  >
                      <>
                        <option value=""></option>
                        <option value="concert">Concert</option>
                      </>
                  </Select>
                  <span className="text-red-500">{formErrors?.eventType}</span>
                </div>
            </div>
           {eventData?.eventType === "concert"  && <><div className="flex flex-wrap my-4 -mx-4 text-left">  
            <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{labels?.price}</h2>
                <Input
                  type="number"
                  id="price"
                  variant={formErrors?.price ? 'danger' : 'primary'}
                  placeholder="Price"
                  value={eventData?.price || ''}
                  onChange={handleChange('price')}
                  onBlur={(e) => {
                    // setEventData((t)=>({...t, price : e.target.value}) )
                  }}
                />
                <span className="text-red-500">{formErrors?.price}</span>
              </div>
            <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{labels?.total}</h2>
                <Input
                  type="number"
                  id="total"
                  variant={formErrors?.total ? 'danger' : 'primary'}
                  placeholder="Total Ticket Counts"
                  value={eventData?.total || ''}
                  onChange={handleChange('total')}
                  onBlur={(e) => {
                    // setEventData((t)=>({...t, price : e.target.value}) )
                  }}
                />
                <span className="text-red-500">{formErrors?.total}</span>
              </div>
              </div>
              
              <div className="flex flex-wrap -mx-4 text-left">
              <div className="flex items-center my-5 mb-5">
                <h2>{labels?.overrideHobexCreds}</h2>
                <Input
                  variant="primary"
                  type="toggle"
                  id="hobex"
                  checked={(eventData?.entityId) || false}
                  onChange={toggleHandler('hobex')}
                />
                </div>
              </div>
              {showHobexFields ? <div className="flex flex-wrap -mx-4 text-left"> 
                <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{labels?.entityId}</h2>
                <Input
                  type="text"
                  id="entityId"
                  variant={formErrors?.entityId ? 'danger' : 'primary'}
                  placeholder="Entity Id"
                  value={eventData?.entityId || ''}
                  onChange={handleChange('entityId')}
                  onBlur={(e) => {
                    // setEventData((t)=>({...t, price : e.target.value}) )
                  }}
                />
                <span className="text-red-500">{formErrors?.entityId}</span>
              </div>
              <div className="w-full px-4 sm:w-1/2">
                <h2 className="mt-4 mb-2">{labels?.password}</h2>
                <Input
                  type="text"
                  id="password"
                  variant={formErrors?.password ? 'danger' : 'primary'}
                  placeholder="Password"
                  value={eventData?.password || ''}
                  onChange={handleChange('password')}
                  onBlur={(e) => {
                    // setEventData((t)=>({...t, price : e.target.value}) )
                  }}
                />
                <span className="text-red-500">{formErrors?.password}</span>
              </div>
              </div> : <></>}
            </>
            }
          </div>
          <div className="flex flex-wrap justify-between -mx-4">
            {event && (
              <Button
                variant="danger"
                type="button"
                className="mt-4 ml-4"
                onClick={async () => {
                  let confirmed = await isConfirmed('Are you sure to delete this event')
                  if (confirmed) {
                    handleDelete()
                  }
                }}
              >
                Delete event
              </Button>
            )}
            <Button
              variant="primary"
              className="mt-4 ml-4 mr-4"
              form={`event-${eventData ? eventData._id : ''}-form`}
              type="submit"
            >
              {event ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default EditEvent
