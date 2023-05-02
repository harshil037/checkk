import nextConnect from 'next-connect'
import { ObjectId } from 'mongodb'
import { request, gql } from 'graphql-request'
import cors from '../../../../../../middlewares/cors'
import middleware from '../../../../../../middlewares/middleware'

const handler = nextConnect()

handler.use(middleware).use(cors)

// to get the rooms data from the cm
const getRooms = async (client, languages = ['en']) => {
  if (client) {
    const url = `https://u.mts-online.com/api/graphql/cm/${client}/1`
    const variables = {
      ...languages.reduce((acc, cur, idx) => {
        acc[`language${idx + 1}`] = cur
        return acc
      }, {}),
      //   language: 'en',
      provider: 'kognitiv',
    }

    const languageDef = languages.reduce((acc, _, idx) => {
      return acc + `$language${idx + 1}: String!, `
    }, '')

    const query = languages.reduce((acc, cur, idx) => {
      return (
        acc +
        `${cur}: cm(config: $config, language: $language${idx + 1}, provider: $provider) {
              ...roomsQuery
          }`
      )
    }, '')

    const cmQuery = gql`
        query ($config: JSON!, ${languageDef} $provider: String!) {
          # ****** For cm ******
          ${query}
        }
        fragment roomsQuery on Cm {
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
      `
    const cm = await request(url, cmQuery, variables)
    return cm
  } else {
    return null
  }
}

// combining rooms data in all languages
const getAllRoomsData = (data, domainLanguages) => {
  const dummyData = { ...data }
  const languageData = domainLanguages.reduce((res, lang) => {
    res[lang] = dummyData?.[lang]?.rooms.reduce((acc, curr) => {
      acc[curr.code] = {
        ...curr,
        amenities: curr.amenities.reduce((acc1, curr1) => {
          acc1[curr1.code] = curr1
          return acc1
        }, {}),
      }
      return acc
    }, {})
    return res
  }, {})

  const roomsData = dummyData?.[domainLanguages[0]]?.rooms.map((room, index) => {
    return {
      ...room,
      title: domainLanguages.reduce((acc, curr) => {
        acc[curr] = languageData?.[curr]?.[room.code]?.title
        return acc
      }, {}),
      amenities: room.amenities.map((amen, i) => ({
        ...amen,
        title: domainLanguages.reduce((acc, curr) => {
          acc[curr] = languageData?.[curr]?.[room.code]?.amenities?.[amen.code]?.title
          return acc
        }, {}),
      })),
    }
  })
  return roomsData
}

handler.get(async (req, res) => {
  try {
    const { client, domain } = req.query

    const domainData = await req.db.collection('domains').findOne({ _id: ObjectId(domain) })

    if (domainData) {
      const languages = domainData.languages || ['en']

      const kognitivData = await getRooms(client, languages)

      if (kognitivData) {
        const roomsList = getAllRoomsData(kognitivData, languages)

        // if domain has rooms config
        if (domainData.roomsConfig) {
          // generating the rooms data according to the rooms config
          const newRoomsList = []

          for (let i = 0; i < roomsList.length; i++) {
            const currentRoom = roomsList[i]

            // checking if current room has any configurations
            const roomConfig = domainData.roomsConfig.find((room) => room.code === currentRoom.code)

            if (roomConfig) {
              if (roomConfig.disabled) {
                // skiping this room because room is disabled in the rooms config
                continue
              } else {
                const newRoom = { code: currentRoom.code, title: {} }

                // creating the title objet for room according to the config
                for (let j = 0; j < languages.length; j++) {
                  const currentLang = languages[j]

                  // checking if room has custom label. other wise storing the title that we are getting from the CM
                  newRoom.title[currentLang] = roomConfig?.title?.[currentLang] || currentRoom.title[currentLang]
                }

                const amenitiesConfig = roomConfig.amenities

                // checking for config for the aminities
                if (amenitiesConfig && amenitiesConfig.length > 0) {
                  const newAmenities = []

                  for (let j = 0; j < currentRoom.amenities.length; j++) {
                    const currentAminity = currentRoom.amenities[j]

                    // checking if current aminity has any configurations
                    const aminityConfig = amenitiesConfig.find((amenity) => amenity.code === currentAminity.code)

                    if (aminityConfig) {
                      if (aminityConfig.disabled) {
                        // skipping aminity if disabled
                        continue
                      } else {
                        const newAmenity = { code: currentAminity.code, title: {}, quantity: currentAminity.quantity }

                        // checking if aminity has custom label. other wise storing the title that we are getting from the CM
                        for (let k = 0; k < languages.length; k++) {
                          const currLang = languages[k]
                          newAmenity.title[currLang] =
                            aminityConfig?.title?.[currLang] || currentAminity.title[currLang]
                        }

                        newAmenities.push(newAmenity)
                      }
                    } else {
                      newAmenities.push(currentAminity)
                    }
                  }
                  newRoom.amenities = newAmenities
                } else {
                  newRoom.amenities = currentRoom.amenities
                }

                // adding the custome aminities
                if (roomConfig.customeAmenities && roomConfig.customeAmenities.length > 0)
                  newRoom.amenities.push(...roomConfig.customeAmenities)

                // adding the services
                if (roomConfig.services && roomConfig.services.length > 0) newRoom.services = roomConfig.services

                newRoomsList.push(newRoom)
              }
            } else {
              newRoomsList.push(currentRoom)
            }
          }
          res.status(200).json({ data: newRoomsList, error: null })
        } else {
          res.status(200).json({ data: roomsList, error: null })
        }
      } else {
        res.status(404).json({ data: null, error: 'data not found' })
      }
    } else {
      res.status(404).json({ data: null, error: 'data not found' })
    }
  } catch (e) {
    res.status(500).json({ data: null, error: e.message })
  }
})

export default handler
