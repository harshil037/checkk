import { useRouter } from 'next/router'
import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../../../../context/appContext'
import { useUser } from '../../../../../lib/hooks'
import Authenticate from '../../../../../lib/authenticate'
import useConfirm from '../../../../../components/dialog/useConfirm'
import { Input } from '../../../../../components/componentLibrary'
import Button from '../../../../../components/common/Button'

const Mapings = () => {
  const [kognitivRooms, setKognitivRooms] = useState([])
  const [selectedSkyalpsRooms, setSelectedSkyalpsRooms] = useState([])
  const [skyalpsRooms, setSkyaplsRooms] = useState([])
  const [swapItem, setSwapItem] = useState({ item: null, index: null })
  const [currentSelection, setCrrentSelection] = useState({})
  const [kognitivHotelCode, setKognitivHotelCode] = useState('')
  const [skyalpsHostId, setSkyalpsHostId] = useState('')
  const [skyalpsHotelCode, setSkyalpsHotelCode] = useState('')
  const [xtoken, setXtoken] = useState('')
  const [newUser, setNewUser] = useState(true)
  const [hotelName, setHotelName] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [oldState, setOldState] = useState({
    skyalpsRooms: [],
    kognitivRooms: [],
    selectedSkyalpsRooms: [],
    isActive: false,
  })
  const [kognitivMealPlans, setKognitivMealPlans] = useState({})
  const [kognitivRateAccessCode, setKognitivRateAccessCode] = useState('')
  const [isActive, setIsActive] = useState(false)

  const [page, , setLoading] = useContext(AppContext)
  const [user, { mutate }] = useUser()
  const { isConfirmed } = useConfirm()

  const router = useRouter()
  const { clientId, contentId } = router.query

  // const clientId = '1007'

  /**
   * To compare two objects.
   * Works when you have simple JSON-style objects without methods and DOM nodes inside
   * And also the ORDER of the properties is same
   * @param {object} object1 first object
   * @param {object} object2 second object
   * @returns {boolean} true | false
   */
  const compareObject = (object1 = {}, object2 = {}) => {
    return JSON.stringify(object1) === JSON.stringify(object2)
  }

  /**
   * To get the array of objects that are not in firstArray but exists in second array
   * @param {object[]} firstArray
   * @param {object[]} secondArray
   * @returns {object[]} array of objects that are not in firstArray
   */
  const objArrayDiff = (firstArray = [], secondArray = []) => {
    const arr1 = firstArray.map((obj) => JSON.stringify(obj))
    const arr2 = secondArray.map((obj) => JSON.stringify(obj))
    const newArr = arr2.filter((item) => !arr1.includes(item))
    const diff = newArr.map((item) => JSON.parse(item))
    return diff
  }

  /**
   * This function will return kognitiv rooms and skyalps rooms
   * @param {string} kognitivHotelCode
   * @param {object} kognitivMealPlans
   * @param {string} hostId skyalps hostId
   * @param {string} xtoken skyalps xtoken
   * @param {string} skyalpsHotelCode
   * @returns {object} { kognitivRoomsData, skyalpsRoomsData }
   */
  const getData = async (kognitivHotelCode, kognitivMealPlans, hostId, xtoken, skyalpsHotelCode) => {
    // getting kognitiv rooms
    let kognitivRoomsData = []
    let skyalpsRoomsData = []

    try {
      const res = await fetch(`/api/channel/kognitiv/get/hotelinfo/${kognitivHotelCode}`)
      const response = await res.json()

      if (response.success) {
        for (let i = 0; i < response.data.facility.rooms.length; i++) {
          const room = response.data.facility.rooms[i]
          const mealPlans = kognitivMealPlans[room.code]

          if (mealPlans) {
            for (let j = 0; j < mealPlans.length; j++) {
              kognitivRoomsData.push({
                roomCode: room.code,
                roomName: room.type_name,
                rateCode: mealPlans[j],
              })
            }
          }
        }
        setHotelName(response.data.info.name.short_name)
      } else {
        console.log('error', response)
      }
    } catch (error) {
      console.log('get kognitiv rooms error =>', error)
    }

    //getting skyalps rooms
    try {
      const res = await fetch('/api/channel/skyalps/get/rooms', {
        method: 'post',
        body: JSON.stringify({
          hostId: hostId,
          xtoken: xtoken,
          hotelCode: skyalpsHotelCode,
        }),
      })

      const result = await res.json()

      for (let i = 0; i < result.length; i++) {
        let room = result[i]
        const rateInfo = room.RateList.RateInfo
        if (Array.isArray(rateInfo)) {
          for (let j = 0; j < rateInfo.length; j++) {
            skyalpsRoomsData.push({
              roomCode: room.Code,
              name: room.Name,
              rateCode: rateInfo[j].Code,
              rateName: rateInfo[j].Name,
            })
          }
        } else {
          skyalpsRoomsData.push({
            roomCode: room.Code,
            name: room.Name,
            rateCode: rateInfo.Code,
            rateName: rateInfo.Name,
          })
        }
      }
    } catch (error) {
      console.log('get skyalps rooms error =>', error)
    }

    return { kognitivRoomsData, skyalpsRoomsData }
  }

  const getProps = async (id) => {
    const res = await fetch(`/api/contents/${id}`)
    const result = res.json()
    return result
  }

  useEffect(async () => {
    if (user) {
      setLoading(true)

      // getting data from db.
      const res = await fetch(`/api/channel/${clientId}/mappings`)
      const response = await res.json()

      const { error, data: content } = await getProps(contentId)

      if (!error) {
        const contentData = content.blockProps
        setKognitivHotelCode(contentData.kognitiv.kognitivHotelCode)
        setSkyalpsHostId(contentData.skyalps.skyalpsHostId)
        setSkyalpsHotelCode(contentData.skyalps.skyalpsHotelCode)
        setXtoken(contentData.skyalps.xtoken)
        setKognitivRateAccessCode(contentData.kognitiv.kognitivRateAccessCode)
        // getting meal plans
        const result = await fetch(
          `/api/channel/kognitiv/get/rate-codes/${contentData.kognitiv.kognitivHotelCode}?accessCode=${contentData.kognitiv.kognitivRateAccessCode}`,
        )
        const data = await result.json()

        if (data.success) {
          setKognitivMealPlans(data.data)
        }

        if (response.success && data.success) {
          // if data exists in db
          const kRooms = response.data.mappings.map((room) => ({
            roomCode: room.roomCode,
            roomName: room.roomName,
            rateCode: room.rateCode,
          }))
          const sRooms = response.data.mappings.map((room) => room.skyalpsRoom)

          const { kognitivRoomsData, skyalpsRoomsData } = await getData(
            contentData.kognitiv.kognitivHotelCode,
            data.data,
            contentData.skyalps.skyalpsHostId,
            contentData.skyalps.xtoken,
            contentData.skyalps.skyalpsHotelCode,
          )

          const newKRooms = objArrayDiff(kRooms, kognitivRoomsData)
          const newSRooms = objArrayDiff(sRooms, skyalpsRoomsData)

          const newKognitivRoomsArray = [...kRooms, ...newKRooms]
          const newSelectedSkyalpsRoomsArray = sRooms

          if (newSelectedSkyalpsRoomsArray.length < newKognitivRoomsArray.length) {
            const diff = newKognitivRoomsArray.length - newSelectedSkyalpsRoomsArray.lengtnullh
            for (let i = 0; i < diff; i++) {
              newSelectedSkyalpsRoomsArray.push(null)
            }
          }

          setNewUser(false)
          setSkyaplsRooms(newSRooms)
          setKognitivRooms(newKognitivRoomsArray)
          setSelectedSkyalpsRooms(newSelectedSkyalpsRoomsArray)
          setIsActive(response.data.isActive)
          setOldState({
            kognitivRooms: newKognitivRoomsArray,
            skyalpsRooms: newSRooms,
            selectedSkyalpsRooms: newSelectedSkyalpsRoomsArray,
            isActive: response.data.isActive,
          })
        } else {
          // if data does not exists in db
          if (data.success) {
            const { kognitivRoomsData, skyalpsRoomsData } = await getData(
              contentData.kognitiv.kognitivHotelCode,
              data.data,
              contentData.skyalps.skyalpsHostId,
              contentData.skyalps.xtoken,
              contentData.skyalps.skyalpsHotelCode,
            )

            const emptyArray = new Array(kognitivRoomsData.length).fill(null)

            setSkyaplsRooms(skyalpsRoomsData)
            setKognitivRooms(kognitivRoomsData)
            setSelectedSkyalpsRooms(emptyArray)
            setOldState({
              kognitivRooms: kognitivRoomsData,
              skyalpsRooms: skyalpsRoomsData,
              selectedSkyalpsRooms: emptyArray,
              isActive: false,
            })
          } else {
            console.log('can not get mealplans')
          }
        }
      }

      setLoading(false)
    }
  }, [])

  /**
   * This function is use to drag and drop iteams to re-order in array
   * @param {Event} e
   * @param {string} eventName dragevent name : start | stop
   * @param {any} item item that you want to drag
   * @param {number} index index of the item in array
   */
  const handleSwapItem = (e, eventName, item, index) => {
    setCrrentSelection({})
    if (eventName === 'start') {
      setSwapItem({ item: item, index: index })
    } else {
      if (swapItem) {
        let itemsArr = [...selectedSkyalpsRooms]
        let firstIndex = swapItem.index
        let secondIndex = index
        let firstItem = itemsArr[firstIndex]
        let secondItem = item
        itemsArr[firstIndex] = secondItem
        itemsArr[secondIndex] = firstItem
        setSelectedSkyalpsRooms(itemsArr)
        setSwapItem({ item: null, index: null })
      } else {
        setSwapItem({ item: null, index: null })
      }
    }
  }

  /**
   * To select and un-select skyalps room
   * @param {object} item skyalps room
   */
  const handleSelect = (item) => {
    if (currentSelection && compareObject(currentSelection, item)) {
      let arr = [...selectedSkyalpsRooms]
      const alreadyExists = arr.includes(item)
      if (alreadyExists) {
        let newArray = selectedSkyalpsRooms.map((room) => (compareObject(room, item) ? null : room))
        setSelectedSkyalpsRooms(newArray)
        setSkyaplsRooms((prevValue) => [...prevValue, item])
      } else {
        const newIndex = arr.indexOf(null)
        if (newIndex !== -1) {
          let newArray = skyalpsRooms.filter((room) => !compareObject(room, item))
          arr[newIndex] = item
          setSelectedSkyalpsRooms(arr)
          setSkyaplsRooms(newArray)
        }
      }
      setCrrentSelection({})
    } else {
      setCrrentSelection(item)
    }
  }

  const goToSyncAvailability = (index) => {
    const kognitivRoom = kognitivRooms[index]
    const skyalpsRoom = selectedSkyalpsRooms[index]
    const kognitivRateCode = kognitivRoom.rateCode
    if (skyalpsRoom) {
      router.push(
        `/admin/skyalps/${clientId}/${contentId}/manage?propertyCode=${kognitivHotelCode}&kognitivRoomCode=${kognitivRoom.roomCode}&kognitivRateCode=${kognitivRateCode}&skyalpsRoomCode=${skyalpsRoom.roomCode}&skyalpsRateCode=${skyalpsRoom.rateCode}`,
      )
    } else {
      alert('No Skyalps room mapped')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    let mappings = []
    for (let i = 0; i < kognitivRooms.length; i++) {
      mappings.push({
        roomName: kognitivRooms[i].roomName,
        roomCode: kognitivRooms[i].roomCode,
        rateCode: kognitivRooms[i].rateCode,
        skyalpsRoom: selectedSkyalpsRooms[i],
      })
    }
    const method = newUser ? 'POST' : 'PUT'
    const data = newUser
      ? {
          kognitivHotelCode,
          skyalpsHostId,
          xtoken,
          skyalpsHotelCode,
          isActive,
          lastFetched: new Date().getTime(),
          mappings,
        }
      : {
          kognitivHotelCode,
          skyalpsHostId,
          xtoken,
          skyalpsHotelCode,
          isActive,
          mappings,
        }

    try {
      const res = await fetch(`/api/channel/${clientId}/mappings`, {
        method: method,
        body: JSON.stringify(data),
      })

      const result = await res.json()
      setOldState((prevState) => ({
        ...prevState,
        selectedSkyalpsRooms: selectedSkyalpsRooms,
        skyalpsRooms: skyalpsRooms,
        isActive,
      }))
      if (result.success) setNewUser(false)
    } catch (error) {
      console.log('mapping data entry in db error =>', error)
    }
    setLoading(false)
    setEditMode(false)
    // console.log(data)
  }

  const handleDelete = async () => {
    const confirm = await isConfirmed('Are you sure you want to delete mappings?')
    if (confirm) {
      setLoading(true)
      try {
        const res = await fetch(`/api/channel/${clientId}/mappings`, {
          method: 'DELETE',
        })

        const result = await res.json()
        if (result.success) {
          const { kognitivRoomsData, skyalpsRoomsData } = await getData(
            kognitivHotelCode,
            kognitivMealPlans,
            skyalpsHostId,
            xtoken,
            skyalpsHotelCode,
          )

          const emptyArray = new Array(kognitivRoomsData.length).fill(null)

          setSkyaplsRooms(skyalpsRoomsData)
          setKognitivRooms(kognitivRoomsData)
          setSelectedSkyalpsRooms(emptyArray)
          setOldState({
            kognitivRooms: kognitivRoomsData,
            skyalpsRooms: skyalpsRoomsData,
            selectedSkyalpsRooms: emptyArray,
            isActive: false,
          })
          setNewUser(true)
        }
      } catch (error) {
        console.log('delete mapping in db error =>', error)
      }
      setLoading(false)
      setEditMode(false)
    }
  }

  const cancelEditing = () => {
    setSkyaplsRooms(oldState.skyalpsRooms)
    setKognitivRooms(oldState.kognitivRooms)
    setSelectedSkyalpsRooms(oldState.selectedSkyalpsRooms)
    setIsActive(oldState.isActive)
    setEditMode(false)
  }

  return (
    <div className="text-left font-ptsans">
      <div className="p-4 bg-white mt-8 rounded-lg text-gray-600 flex">
        <div className="w-1/4 mx-2">
          <p className="text-sm mb-2">Hotel Name</p>
          <div className="bg-gray-light-10 border border-gray-300 p-2 rounded-lg">{hotelName}</div>
        </div>
        <div className="w-1/4 mx-2">
          <p className="text-sm mb-2">Kognitiv Hote ID</p>
          <div className="bg-gray-light-10 border border-gray-300 p-2 rounded-lg">{kognitivHotelCode}</div>
        </div>
        <div className="w-1/4 mx-2">
          <p className="text-sm mb-2">Skyalps Hotel ID</p>
          <div className="bg-gray-light-10 border border-gray-300 p-2 rounded-lg">{skyalpsHotelCode}</div>
        </div>
        <div className="w-1/4 mx-2">
          <p className="text-sm mb-2">ClientId</p>
          <div className="bg-gray-light-10 border border-gray-300 p-2 rounded-lg">{clientId}</div>
        </div>
      </div>
      <div className="p-4 bg-white mt-8 rounded-lg text-gray-600">
        <div className="flex justify-between my-4">
          <p className="text-2xl font-bold">Rooms Mapping</p>
          {editMode ? (
            <div className="flex items-center">
              <span>Avtive :</span>
              <Input
                type="toggle"
                id="active"
                variant="primary"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <Button type="button" variant="danger" onClick={cancelEditing} className="px-4">
                Cancel
              </Button>
              <Button
                disabled={!selectedSkyalpsRooms.filter((room) => room !== null).length > 0}
                type="button"
                onClick={handleSave}
                className="ml-4 px-4"
              >
                Save
              </Button>
              {!newUser && (
                <Button variant="danger" type="button" className="ml-4 px-4" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>
          ) : (
            <Button type="button" className="px-4" onClick={() => setEditMode(true)}>
              Edit
            </Button>
          )}
        </div>

        <div className={editMode ? 'flex' : ''}>
          <div className={editMode ? 'w-2/3' : ''}>
            <div className="grid grid-cols-2 gap-4 my-4  text-lg font-bold">
              <div className="border border-gray-400 p-2 pl-6 rounded-lg">Kognitiv Room Name</div>
              <div className="border border-gray-400 p-2 pl-6 rounded-lg">Skyalps Room</div>
            </div>
            {kognitivRooms.map((room, index) => {
              return (
                <div className="grid grid-cols-2 gap-4 my-1 select-none" key={room.roomCode + room.rateCode}>
                  <div
                    className={
                      index % 2 == 0
                        ? 'border border-transparent bg-gray-light-10 rounded-lg p-2 text-base'
                        : 'border border-transparent rounded-lg p-2 bg-gray-light-20 text-base'
                    }
                  >
                    {room.roomName} ({room.roomCode}) - {room.rateCode}
                  </div>

                  <div
                    className={
                      selectedSkyalpsRooms[index]
                        ? index % 2 == 0
                          ? ` bg-gray-light-10 rounded-lg p-2 ${editMode && 'cursor-pointer'} ${
                              compareObject(currentSelection, selectedSkyalpsRooms[index])
                                ? 'border border-primary bg-primary-20'
                                : 'border border-transparent'
                            }`
                          : `rounded-lg p-2 bg-gray-light-20 ${editMode && 'cursor-pointer'} ${
                              compareObject(currentSelection, selectedSkyalpsRooms[index])
                                ? 'border border-primary bg-primary-20'
                                : 'border border-transparent'
                            }`
                        : 'bg-transparent rounded-lg border border-gray-100'
                    }
                    draggable={selectedSkyalpsRooms[index] && editMode ? true : false}
                    onDragStart={(e) => handleSwapItem(e, 'start', selectedSkyalpsRooms[index], index)}
                    onDrop={(e) => handleSwapItem(e, 'drop', selectedSkyalpsRooms[index], index)}
                    onDragOver={(ev) => ev.preventDefault()}
                    onClick={(e) => {
                      if (editMode) {
                        if (selectedSkyalpsRooms[index]) {
                          handleSelect(selectedSkyalpsRooms[index])
                        } else {
                          setCrrentSelection({})
                        }
                      }
                    }}
                  >
                    {selectedSkyalpsRooms[index] ? (
                      <div className="flex justify-between items-center">
                        <p className="text-base">
                          {selectedSkyalpsRooms[index].name} ({selectedSkyalpsRooms[index].roomCode}) -{' '}
                          {selectedSkyalpsRooms[index].rateCode}
                        </p>
                        {editMode ? (
                          <p>☰</p>
                        ) : (
                          <div>
                            <Button type="button" onClick={() => goToSyncAvailability(index)} className="text-xs">
                              View Availability And Rates
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {editMode && (
            <div className="ml-4 p-4 border border-gray-300 rounded-lg w-1/3 bg-gray-light">
              <p className="border select-none border-gray-400 p-2 pl-6 text-lg font-bold mb-4 rounded-lg">
                Select Skyalps Rooms
              </p>
              <div>
                {skyalpsRooms.map((room, index) => (
                  <div
                    className={
                      index % 2 == 0
                        ? `text-base select-none bg-gray-light-10 rounded-lg p-2 my-2 cursor-pointer ${
                            compareObject(currentSelection, room)
                              ? 'border border-primary bg-primary-20'
                              : 'border border-transparent'
                          }`
                        : `text-base select-none rounded-lg p-2 bg-gray-light-20 my-2 cursor-pointer ${
                            compareObject(currentSelection, room)
                              ? 'border border-primary bg-primary-20'
                              : 'border border-transparent'
                          }`
                    }
                    key={room.roomCode + room.rateCode}
                    onClick={() => handleSelect(room)}
                  >
                    {room.name} ({room.roomCode}) - {room.rateCode}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Mapings

export async function getServerSideProps(context) {
  return Authenticate(context)
}
