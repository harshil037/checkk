import React, { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { request, gql } from 'graphql-request'
import Authenticate from '../../../../../lib/authenticate'
import { AppContext } from '../../../../../context/appContext'
import PopUp from '../../../../../components/dialog/popUp'
import { Input } from '../../../../../components/componentLibrary'
import Button from '../../../../../components/common/Button'
import { isEqual } from '../../../../../lib/utils'
import { deepClone } from '../../../../../lib/object'

const Config = () => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const router = useRouter()
  const [domain, setDomain] = useState({})
  const [clientId, setClientId] = useState('')
  const [rooms, setRooms] = useState([])
  const [selectedRooms, setSelectedRooms] = useState([])
  const [roomDetails, setRoomDetails] = useState('')
  const [modal, setModal] = useState({
    open: false,
    title: '',
    roomCode: '',
    defaultRoomLabel: '',
    type: '',
    amenityCode: '',
    defaultAmenityLabel: '',
  })
  const [currentValue, setCurrentValue] = useState({})
  const [languages, setLanguages] = useState(['en', 'de', 'it'])
  const [currentLang, setCurrentLang] = useState('en')
  const [customAmenities, setCustomAmenities] = useState([
    { label: { en: 'Demo1', de: 'Demo1', it: 'Demo1' }, key: 'DM1' },
    { label: { en: 'Demo2', de: 'Demo2', it: 'Demo2' }, key: 'DM2' },
    { label: { en: 'Demo3', de: 'Demo3', it: 'Demo3' }, key: 'DM3' },
  ])
  const [lang, setLang] = useState('')

  const [roomsList, setRoomsList] = useState([])
  const [oldRoomsList, setOldRoomsList] = useState([])
  const [isEdited, setIsEdited] = useState(false)
  const [serviceModal, setServiceModal] = useState({
    isOpen: false,
    isNew: false,
    roomCode: '',
    roomLabel: '',
    serviceCode: '',
  })
  const [service, setService] = useState({
    code: '',
    label: { en: '', de: '', it: '' },
    icon: '',
    description: { en: '', de: '', it: '' },
  })
  const [serviceErrors, setServiceErrors] = useState({
    code: '',
  })

  const { domainId } = router.query

  const getDomainData = async () => {
    const res = await fetch(`/api/domain/${domainId}`)

    if (res.status === 200) {
      const data = await res.json()
      return { data, error: null }
    } else {
      return { data: null, error: 'something went wrong' }
    }
  }

  const getClients = async () => {
    const data = await fetch('/api/clients', {
      method: 'GET',
    })
    return await data.json()
  }

  const getRooms = async (client = 'u0758') => {
    const url = `https://u.mts-online.com/api/graphql/cm/${client}/1`
    const variables = {
      language: 'en',
      provider: 'kognitiv',
    }

    const cmQuery = gql`
      query ($config: JSON!, $language: String!, $provider: String!) {
        # ****** For cm ******
        cm(config: $config, language: $language, provider: $provider) {
          rooms {
            code
            title
            amenities {
              code
              title
              quantity
            }
          }
        }
      }
    `

    const { cm } = await request(url, cmQuery, variables)

    return cm
  }

  const getGlobalConfig = async () => {
    const response = await fetch('/api/config')
    return await response.json()
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setContextData((prevState) => ({
        ...prevState,
        navigationItem: 'domains',
      }))

      const responses = await Promise.all([getDomainData(), getClients(), getGlobalConfig()])
      if (!responses[0].error) {
        setDomain(responses[0].data.domain)
        if (responses[0].data.domain.roomsConfig) setRoomsList(responses[0].data.domain.roomsConfig)
        if (responses[0].data.domain.roomsConfig) setOldRoomsList(responses[0].data.domain.roomsConfig)
        if (responses[0].data.domain.languages) setLanguages(responses[0].data.domain.languages)
      }

      const { error, clients } = responses[1]

      if (responses[2].data) {
        const configData = responses[2].data
        if (configData.values?.amenities) {
          const amenitiesArr = []

          for (let amenity in configData.values.amenities) {
            amenitiesArr.push({ key: amenity, label: configData.values.amenities[amenity] })
          }

          setCustomAmenities(amenitiesArr)
        }
      }

      if (clients) {
        const client = clients.find((c) => c.domains?.includes(domainId))
        if (client) {
          setClientId(client.clientNumber)

          const { rooms } = await getRooms(client.clientNumber === 'u9999' ? 'u1038' : client.clientNumber)
          // setSelectedRooms(rooms.map((room) => room.code))
          setRooms(rooms)
        }
      }

      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    setIsEdited(!isEqual(oldRoomsList, roomsList))
  }, [roomsList, oldRoomsList])

  const enableRoom = (roomCode) => (e) => {
    e.preventDefault()
    const newRoomsList = deepClone(roomsList)
    const roomIndex = newRoomsList.findIndex((element) => element.code === roomCode)
    if (roomIndex !== -1) {
      newRoomsList[roomIndex].disabled = false
      setRoomsList(newRoomsList)
    }
  }

  const enableAmenity = (roomCode, amenityCode) => (e) => {
    e.preventDefault()
    const newRoomsList = deepClone(roomsList)
    const roomIndex = newRoomsList.findIndex((element) => element.code === roomCode)
    if (roomIndex !== -1) {
      const amenityIndex = newRoomsList[roomIndex].amenities.findIndex((element) => element.code === amenityCode)
      if (roomIndex !== -1) {
        newRoomsList[roomIndex].amenities[amenityIndex].disabled = false
        setRoomsList(newRoomsList)
      }
    }
  }

  const enableCustomAmenity = (roomData) => (e) => {
    e.preventDefault()
    const newRoomsList = deepClone(roomsList)
    const roomIndex = newRoomsList.findIndex((element) => element.code === roomData.roomCode)
    if (roomIndex === -1) {
      newRoomsList.push({
        code: roomData.roomCode,
        title: {},
        defaultLabel: roomData.defaultLabel,
        disabled: false,
        amenities: [],
        customeAmenities: [roomData.customAmenity],
        services: [],
      })
    } else {
      newRoomsList[roomIndex].customeAmenities.push(roomData.customAmenity)
    }
    setRoomsList(newRoomsList)
  }

  const disableRoom = (roomData) => (e) => {
    e.preventDefault()
    const newRoomsList = deepClone(roomsList)

    const roomIndex = newRoomsList.findIndex((element) => element.code === roomData.code)

    if (roomIndex !== -1) {
      newRoomsList[roomIndex].disabled = true
      setRoomsList(newRoomsList)
    } else {
      newRoomsList.push({
        code: roomData.code,
        title: {},
        defaultLabel: roomData.defaultLabel,
        disabled: true,
        amenities: [],
        customeAmenities: [],
        services: [],
      })
      setRoomsList(newRoomsList)
    }
  }

  const disableAmenity = (amenityData) => (e) => {
    e.preventDefault()
    const newRoomsList = deepClone(roomsList)

    const roomIndex = newRoomsList.findIndex((element) => element.code === amenityData.roomCode)

    if (roomIndex !== -1) {
      const amenityIndex = newRoomsList[roomIndex].amenities.findIndex(
        (element) => element.code === amenityData.amenityCode,
      )

      if (amenityIndex !== -1) {
        newRoomsList[roomIndex].amenities[amenityIndex].disabled = true
      } else {
        newRoomsList[roomIndex].amenities.push({
          code: amenityData.amenityCode,
          disabled: true,
          defaultLabel: amenityData.amenityLabel,
          title: {},
        })
      }
      setRoomsList(newRoomsList)
    } else {
      newRoomsList.push({
        code: amenityData.roomCode,
        title: {},
        defaultLabel: amenityData.roomLabel,
        disabled: false,
        amenities: [
          { code: amenityData.amenityCode, disabled: true, defaultLabel: amenityData.amenityLabel, title: {} },
        ],
        customeAmenities: [],
        services: [],
      })
      setRoomsList(newRoomsList)
    }
  }

  const disableCustomAmenity = (roomData) => (e) => {
    e.preventDefault()
    const newRoomsList = deepClone(roomsList)
    const roomIndex = newRoomsList.findIndex((element) => element.code === roomData.roomCode)
    if (roomIndex !== -1) {
      newRoomsList[roomIndex].customeAmenities = newRoomsList[roomIndex].customeAmenities.filter(
        (item) => item.code !== roomData.amenityCode,
      )
    }
    setRoomsList(newRoomsList)
  }

  const handleViewDetails = (room) => () => {
    if (!(roomDetails === room)) {
      setRoomDetails(room)
    } else {
      setRoomDetails('')
    }
  }

  const isRoomDisabled = (roomCode) => {
    if (!roomsList.length) return false
    const room = roomsList.find((room) => room.code === roomCode)
    if (!room) return false
    return room.disabled
  }

  const isAmenityDisabled = (roomCode, amenityCode) => {
    if (!roomsList.length) return false
    const room = roomsList.find((room) => room.code === roomCode)
    if (!room) return false
    const amenity = room.amenities.find((amenity) => amenity.code === amenityCode)
    if (!amenity) return false
    return amenity.disabled
  }

  const isCustomeAmenitiesAdded = (roomCode, amenityCode) => {
    if (!roomsList.length) return false
    const room = roomsList.find((room) => room.code === roomCode)
    if (!room) return false
    const amenity = room.customeAmenities.find((amenity) => amenity.code === amenityCode)
    if (!amenity) return false
    return true
  }

  const isRoomModified = (roomCode, msg) => {
    if (!roomsList.length) return false
    const room = roomsList.find((room) => room.code === roomCode)
    if (!room) return false
    return true
  }

  const getRoomsCustomLabels = (roomCode) => {
    if (!roomsList.length) return false
    const room = roomsList.find((room) => room.code === roomCode)
    if (!room) return false
    let result = false
    for (let keys in room.title) {
      if (room.title[keys]) {
        result = true
        break
      }
    }
    if (result) return room.title
    return false
  }

  const getAmenityCustomLabels = (roomCode, amenityCode) => {
    if (!roomsList.length) return false
    const room = roomsList.find((room) => room.code === roomCode)
    if (!room) return false

    const amenity = room.amenities.find((amenity) => amenity.code === amenityCode)
    if (!amenity) return false

    let result = false
    for (let keys in amenity.title) {
      if (amenity.title[keys]) {
        result = true
        break
      }
    }

    if (result) return amenity.title
    return false
  }

  const getEmptyValue = () => {
    const value = {}
    for (let i = 0; i < languages.length; i++) {
      value[languages[i]] = ''
    }
    return value
  }

  const onpenServiceModal =
    (
      isNew = true,
      roomCode = '',
      roomLabel = '',
      serviceCode = '',
      service = {
        code: '',
        label: languages.reduce((acc, language) => ({ ...acc, [language]: '' }), {}),
        icon: '',
        description: languages.reduce((acc, language) => ({ ...acc, [language]: '' }), {}),
      },
    ) =>
    () => {
      setServiceModal({ isOpen: true, isNew, roomCode, roomLabel, serviceCode })
      setService(service)
      setServiceErrors({ code: '' })
    }

  const getServices = (room) => {
    const newRoomsList = deepClone(roomsList)

    const roomData = newRoomsList.find((element) => element.code === room)

    if (roomData && roomData.services) {
      return roomData.services
    }

    return []
  }

  const onEdit =
    (roomCode, defaultRoomLabel, type, modalTitle = '', amenityCode = '', defaultAmenityLabel = '') =>
    () => {
      if (type === 'room') {
        const roomIndex = roomsList.findIndex((element) => element.code === roomCode)
        if (roomIndex === -1) {
          setCurrentValue(getEmptyValue())
        } else {
          setCurrentValue({ ...getEmptyValue(), ...roomsList[roomIndex].title })
        }
      } else {
        const roomIndex = roomsList.findIndex((element) => element.code === roomCode)
        if (roomIndex === -1) {
          setCurrentValue(getEmptyValue())
        } else {
          const amenityIndex = roomsList[roomIndex].amenities.findIndex((element) => element.code === amenityCode)
          if (amenityIndex === -1) {
            setCurrentValue(getEmptyValue())
          } else {
            setCurrentValue({ ...getEmptyValue(), ...roomsList[roomIndex].amenities[amenityIndex].title })
          }
        }
      }
      setModal({
        open: true,
        title: modalTitle,
        roomCode,
        defaultRoomLabel,
        type,
        amenityCode,
        defaultAmenityLabel,
      })
    }

  const handleEdit = () => {
    const newRoomsList = deepClone(roomsList)

    const roomIndex = newRoomsList.findIndex((element) => element.code === modal.roomCode)

    if (roomIndex !== -1) {
      if (modal.type === 'room') {
        newRoomsList[roomIndex].title = currentValue
      } else {
        const amenityIndex = newRoomsList[roomIndex].amenities.findIndex(
          (element) => element.code === modal.amenityCode,
        )
        if (amenityIndex === -1) {
          newRoomsList[roomIndex].amenities.push({
            code: modal.amenityCode,
            disabled: false,
            defaultLabel: modal.defaultAmenityLabel,
            title: currentValue,
          })
        } else {
          newRoomsList[roomIndex].amenities[amenityIndex].title = currentValue
        }
      }
    } else {
      if (modal.type === 'room') {
        newRoomsList.push({
          code: modal.roomCode,
          title: currentValue,
          defaultLabel: modal.defaultRoomLabel,
          disabled: false,
          amenities: [],
          customeAmenities: [],
          services: [],
        })
      } else {
        newRoomsList.push({
          code: modal.roomCode,
          title: {},
          defaultLabel: modal.defaultRoomLabel,
          disabled: false,
          amenities: [
            { code: modal.amenityCode, disabled: false, defaultLabel: modal.defaultAmenityLabel, title: currentValue },
          ],
          customeAmenities: [],
          services: [],
        })
      }
    }
    setRoomsList(newRoomsList)
    setCurrentValue({})
    setModal({
      open: false,
      title: '',
      code: '',
      defaultLabel: '',
      type: '',
      amenityCode: '',
      defaultAmenityLabel: '',
    })
  }

  const handleSubmit = async () => {
    const data = { ...domain, roomsConfig: roomsList, languages }
    setLoading(true)
    const res = await fetch('/api/domains', {
      method: domain ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    setOldRoomsList(roomsList)

    setLoading(false)
  }

  const handleRemoveModification = (roomCode) => () => {
    const newRoomsList = deepClone(roomsList)
    const roomIndex = newRoomsList.findIndex((room) => room.code === roomCode)
    newRoomsList.splice(roomIndex, 1)
    setRoomsList(newRoomsList)
    setCurrentValue({})
    setModal({
      open: false,
      title: '',
      code: '',
      defaultLabel: '',
      type: '',
      amenityCode: '',
      defaultAmenityLabel: '',
    })
  }

  const showLabels = (customLabels) => {
    const labels = [
      <p className="mx-2 text-2xl text-gray-500" key={1}>
        |
      </p>,
    ]
    for (let label in customLabels) {
      if (customLabels[label])
        labels.push(
          <p className="mr-2 text-gray-500" key={label}>
            <span className="font-bold">{label}</span> : {customLabels[label]}
          </p>,
        )
    }
    return labels
  }

  const handleSubmitService = (e) => {
    e.preventDefault()

    const newRoomsList = deepClone(roomsList)

    const roomIndex = newRoomsList.findIndex((element) => element.code === serviceModal.roomCode)

    if (roomIndex !== -1) {
      const serviceIndex = newRoomsList[roomIndex].services.findIndex(
        (element) => element.code === serviceModal.serviceCode,
      )

      if (serviceModal.isNew) {
        if (newRoomsList[roomIndex].services.find((element) => element.code === service.code)) {
          setServiceErrors({ ...serviceErrors, code: 'Service code should be unique' })
          return
        } else {
          setServiceErrors({ ...serviceErrors, code: '' })
        }
      }

      if (serviceIndex !== -1) {
        newRoomsList[roomIndex].services[serviceIndex] = service
      } else {
        newRoomsList[roomIndex].services.push(service)
      }
      setRoomsList(newRoomsList)
    } else {
      newRoomsList.push({
        code: serviceModal.roomCode,
        title: {},
        defaultLabel: serviceModal.roomLabel,
        disabled: false,
        amenities: [],
        customeAmenities: [],
        services: [service],
      })
      setRoomsList(newRoomsList)
    }
    setService({
      code: '',
      label: languages.reduce((acc, language) => ({ ...acc, [language]: '' }), {}),
      icon: '',
      description: languages.reduce((acc, language) => ({ ...acc, [language]: '' }), {}),
    })
    setServiceModal({ isOpen: false, isNew: false, roomCode: '', roomLabel: '', serviceCode: '' })
    setServiceErrors({ code: '' })
  }

  const handleDeleteService = () => {
    const newRoomsList = deepClone(roomsList)
    const roomIndex = newRoomsList.findIndex((element) => element.code === serviceModal.roomCode)

    if (roomIndex !== -1) {
      const serviceIndex = newRoomsList[roomIndex].services.findIndex(
        (element) => element.code === serviceModal.serviceCode,
      )
      if (serviceIndex !== -1) {
        newRoomsList[roomIndex].services.splice(serviceIndex, 1)
      }
      setRoomsList(newRoomsList)
    }

    setService({
      code: '',
      label: languages.reduce((acc, language) => ({ ...acc, [language]: '' }), {}),
      icon: '',
      description: languages.reduce((acc, language) => ({ ...acc, [language]: '' }), {}),
    })
    setServiceModal({ isOpen: false, isNew: false, roomCode: '', roomLabel: '', serviceCode: '' })
    setServiceErrors({ code: '' })
  }

  return (
    <div className="w-full p-4 mt-8 text-left bg-white rounded-lg">
      <div className="mb-4">
        <label>Add Language : </label>
        <div className="flex flex-wrap">
          <div className="flex w-1/2">
            <Input type="text" variant="primary" value={lang} onChange={(e) => setLang(e.target.value.trim())} />
            <Button
              variant="primary"
              className="mx-2"
              onClick={() => {
                if (lang && !languages.includes(lang)) {
                  setLanguages((prev) => [...prev, lang.toLocaleLowerCase()])
                  setLang('')
                }
              }}
            >
              Add
            </Button>
          </div>
          {languages.map((lang, index) => (
            <div className={`p-2 border  flex items-center rounded-lg mx-2 cursor-pointer border-gray-400`} key={lang}>
              {lang}
              {index > 2 && (
                <img
                  className="inline-block pl-1"
                  onClick={() => {
                    const newLangs = languages.filter((language) => lang !== language)
                    setLanguages(newLangs)
                  }}
                  width={'20px'}
                  src="/images/langaugedelete.svg"
                  alt="delete"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {rooms.map((room, index) => {
        const customLabels = getRoomsCustomLabels(room.code)
        const services = getServices(room.code)

        return (
          <div key={room.code} className="relative p-4 my-2 border border-gray-300 rounded-lg">
            <div className={`flex items-center justify-between ${roomDetails === room.code ? 'border-b pb-4' : ''}`}>
              <div className="flex items-center">
                {room.title}
                {customLabels ? showLabels(customLabels) : ''}
              </div>
              <div className="flex items-center">
                {isRoomModified(room.code) ? (
                  <img
                    src="/images/information.svg"
                    className="w-5 mr-2 cursor-pointer"
                    alt="custom-label"
                    title="This room is Modified"
                  />
                ) : (
                  ''
                )}
                <img
                  src="/images/Edit.svg"
                  onClick={onEdit(room.code, room.title, 'room', 'Edit Room')}
                  className="w-4 mr-2 cursor-pointer"
                  alt="edit"
                />
                {isRoomDisabled(room.code) ? (
                  <div
                    className="w-4 h-4 border-2 rounded-sm border-[#68d0c2] select-none cursor-pointer mr-2"
                    onClick={enableRoom(room.code)}
                  ></div>
                ) : (
                  <img
                    src="/images/box_check.svg"
                    onClick={disableRoom({ code: room.code, defaultLabel: room.title })}
                    className="w-4 mr-2 cursor-pointer select-none"
                    alt="check"
                  />
                )}

                <img
                  className={`inline-block w-5 h-5 cursor-pointer transition-all ease-linear duration-400 ${
                    roomDetails === room.code && 'transform rotate-180'
                  }`}
                  src="/images/select-list.svg"
                  alt="Status"
                  onClick={handleViewDetails(room.code)}
                />
              </div>
            </div>
            <div
              className={`${
                roomDetails === room.code
                  ? 'h-52 mt-2 p-2 overflow-y-auto custom-scrollbar custom-scrollbar-bg'
                  : 'h-0 overflow-hidden'
              } flex flex-wrap transition-all duration-400 select-none`}
            >
              <div className="w-1/3 pr-2">
                <p>Kognitiv Amenities</p>
                {room.amenities.map((amenity) => {
                  const amenityCustomLabels = getAmenityCustomLabels(room.code, amenity.code)

                  return (
                    <div
                      key={amenity.code}
                      className="flex items-center justify-between p-2 px-4 my-1 text-sm border border-gray-300 rounded-md"
                    >
                      <div className="flex items-center">
                        {amenity.title}
                        {amenityCustomLabels ? showLabels(amenityCustomLabels) : ''}
                      </div>
                      <div className="flex items-center">
                        <img
                          src="/images/Edit.svg"
                          onClick={onEdit(
                            room.code,
                            room.title,
                            'aminity',
                            'Edit Amenity',
                            amenity.code,
                            amenity.title,
                          )}
                          className="w-3 mr-2 cursor-pointer"
                          alt="edit"
                        />
                        {isAmenityDisabled(room.code, amenity.code) ? (
                          <div
                            className="w-3 h-3 border-2 rounded-sm border-[#68d0c2] select-none cursor-pointer"
                            onClick={enableAmenity(room.code, amenity.code)}
                          ></div>
                        ) : (
                          <img
                            src="/images/box_check.svg"
                            onClick={disableAmenity({
                              roomCode: room.code,
                              roomLabel: room.title,
                              amenityCode: amenity.code,
                              amenityLabel: amenity.title,
                            })}
                            className="w-3 cursor-pointer select-none"
                            alt="check"
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="w-1/3 pr-2">
                <p>Custom Amenities</p>
                {customAmenities.map((amenity) => (
                  <div
                    key={amenity.key}
                    className="flex items-center justify-between p-2 px-4 my-1 text-sm border border-gray-300 rounded-md"
                  >
                    <div>{amenity.label.en}</div>
                    <div className="flex items-center">
                      {isCustomeAmenitiesAdded(room.code, amenity.key) ? (
                        <img
                          src="/images/box_check.svg"
                          onClick={disableCustomAmenity({ roomCode: room.code, amenityCode: amenity.key })}
                          className="w-3 cursor-pointer select-none"
                          alt="check"
                        />
                      ) : (
                        <div
                          className="w-3 h-3 border-2 rounded-sm border-[#68d0c2] select-none cursor-pointer"
                          onClick={enableCustomAmenity({
                            roomCode: room.code,
                            defaultLabel: room.title,
                            customAmenity: { code: amenity.key, title: amenity.label },
                          })}
                        ></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-1/3 pl-2">
                <div className="flex justify-between items-center">
                  <p>Services</p>{' '}
                  <Button
                    variant="primary"
                    className="!text-xs"
                    onClick={onpenServiceModal(true, room.code, room.title)}
                  >
                    Add Services
                  </Button>
                </div>
                {services.map((service) => {
                  return (
                    <div
                      key={service.code}
                      className="flex items-center justify-between p-2 px-4 my-1 text-sm border border-gray-300 rounded-md"
                    >
                      <div className="flex items-center">{service.label.en || service.code}</div>
                      <div className="flex items-center">
                        <img
                          src="/images/Edit.svg"
                          onClick={onpenServiceModal(false, room.code, room.title, service.code, service)}
                          className="w-3 mr-2 cursor-pointer"
                          alt="edit"
                        />
                      </div>
                    </div>
                  )
                })}
                {services.length === 0 && <p>No Services Added</p>}
              </div>
            </div>
          </div>
        )
      })}
      <div
        className={`fixed bg-white border right-0 border-green-400 pl-4 p-2 bottom-16 transform transition duration-500 ease ${
          isEdited ? '' : 'translate-x-full'
        }`}
      >
        <span
          onClick={() => {
            setIsEdited(!isEdited)
          }}
          className="absolute p-2 transform -translate-x-full -translate-y-1/2 bg-white border border-solid rounded-full open-arrow top-1/2 left-2 border-primary-400"
        >
          {isEdited ? (
            <svg className="block w-4 h-4 fill-current" viewBox="0 0 256 512" aria-hidden="true" role="presentation">
              <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z"></path>
            </svg>
          ) : (
            <svg className="block w-4 h-4 fill-current" viewBox="0 0 256 512" aria-hidden="true" role="presentation">
              <path d="M238.475 475.535l7.071-7.07c4.686-4.686 4.686-12.284 0-16.971L50.053 256 245.546 60.506c4.686-4.686 4.686-12.284 0-16.971l-7.071-7.07c-4.686-4.686-12.284-4.686-16.97 0L10.454 247.515c-4.686 4.686-4.686 12.284 0 16.971l211.051 211.05c4.686 4.686 12.284 4.686 16.97-.001z"></path>
            </svg>
          )}
        </span>
        <Button onClick={handleSubmit} type="button" variant="primary">
          Submit
        </Button>
      </div>
      <PopUp openModal={modal.open}>
        <div className="w-1/2 p-4 m-8 mx-auto bg-white rounded-lg main-wrapper">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">{modal.title}</h1>
            <svg
              onClick={() => {
                setModal({
                  open: false,
                  title: '',
                  code: '',
                  defaultLabel: '',
                  type: '',
                  amenityCode: '',
                  defaultAmenityLabel: '',
                })
                setCurrentValue({})
              }}
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
          <div className="py-4">
            <p>
              <span className="font-bold">Default Label : </span>
              <span>{modal.type === 'room' ? modal.defaultRoomLabel : modal.defaultAmenityLabel}</span>
            </p>
            <div className="flex items-center mt-2">
              <label className="mr-2 whitespace-nowrap">New Label : </label>
              <div className="w-2/5">
                <Input
                  type="text"
                  onChange={(e) => setCurrentValue((prev) => ({ ...prev, [currentLang]: e.target.value }))}
                  value={currentValue[currentLang] || ''}
                  variant="primary"
                />
              </div>
              {languages.map((lang) => (
                <div
                  className={`p-2 border  flex items-center rounded-lg mx-2 cursor-pointer ${
                    lang === currentLang ? 'font-bold border-gray-600' : 'border-gray-400'
                  }`}
                  onClick={() => setCurrentLang(lang)}
                  key={lang}
                >
                  {lang}
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            {isRoomModified(modal.roomCode, 'from modal') && modal.type === 'room' ? (
              <Button
                onClick={handleRemoveModification(modal.roomCode)}
                type="button"
                className="mr-4"
                variant="danger"
              >
                Remove All Modification
              </Button>
            ) : (
              ''
            )}
            <Button variant="primary" type="button" onClick={handleEdit}>
              Submit
            </Button>
          </div>
        </div>
      </PopUp>

      {/* sevices modal */}
      <PopUp openModal={serviceModal.isOpen}>
        <div className="w-1/2 p-4 m-8 mx-auto bg-white rounded-lg main-wrapper">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Service</h1>
            <svg
              onClick={() => {
                setServiceModal({ isOpen: false, isNew: false, roomCode: '', roomLabel: '', serviceCode: '' })
                setService({
                  code: '',
                  label: languages.reduce((acc, language) => ({ ...acc, [language]: '' }), {}),
                  icon: '',
                  description: languages.reduce((acc, language) => ({ ...acc, [language]: '' }), {}),
                })
                setServiceErrors({ code: '' })
              }}
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
          <form onSubmit={handleSubmitService}>
            <div className="py-4">
              <div className="mb-2">
                <label>Service Code :</label>
                <Input
                  variant="primary"
                  onChange={(e) => setService((prev) => ({ ...prev, code: e.target.value }))}
                  value={service.code}
                  name="serviceCode"
                  required={true}
                  disabled={!serviceModal.isNew}
                  type="text"
                />
                {serviceErrors.code.length > 0 ? <p className="text-red-500 pl-2">{serviceErrors.code}</p> : ''}
              </div>
              <div className="mb-2 flex flex-wrap">
                <label className="w-full">Label :</label>
                <Input
                  variant="primary"
                  className="!w-1/2"
                  onChange={(e) =>
                    setService((prev) => ({ ...prev, label: { ...prev.label, [currentLang]: e.target.value } }))
                  }
                  value={service.label[currentLang]}
                  name="label"
                  required={true}
                />
                <div className="w-1/2 flex pl-2">
                  {languages.map((lang) => (
                    <div
                      className={`p-2 border  flex items-center rounded-lg mx-1 cursor-pointer ${
                        lang === currentLang ? 'font-bold border-gray-600' : 'border-gray-400'
                      }`}
                      onClick={() => setCurrentLang(lang)}
                      key={lang}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <label>Icon :</label>
                <Input
                  variant="primary"
                  onChange={(e) => setService((prev) => ({ ...prev, icon: e.target.value }))}
                  value={service.icon}
                  name="icon"
                />
              </div>
              <div>
                <div className="mb-2">
                  <label className="mr-2">Description :</label>
                  <div className="w-1/2 inline-flex">
                    {languages.map((lang) => (
                      <div
                        className={`p-2 border  flex items-center rounded-lg mx-1 cursor-pointer ${
                          lang === currentLang ? 'font-bold border-gray-600' : 'border-gray-400'
                        }`}
                        onClick={() => setCurrentLang(lang)}
                        key={lang}
                      >
                        {lang}
                      </div>
                    ))}
                  </div>
                </div>
                <textarea
                  className="p-2 border border-gray-400 rounded outline-none block w-full"
                  placeholder="Description"
                  rows="3"
                  onChange={(e) =>
                    setService((prev) => ({
                      ...prev,
                      description: { ...prev.description, [currentLang]: e.target.value },
                    }))
                  }
                  value={service.description[currentLang]}
                  name="description"
                />
              </div>
            </div>
            <div className="text-right">
              {!serviceModal.isNew && (
                <Button variant="danger" className="mr-4" type="button" onClick={handleDeleteService}>
                  Delete
                </Button>
              )}
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </PopUp>
    </div>
  )
}

export default Config

export async function getServerSideProps(context) {
  return Authenticate(context)
}
