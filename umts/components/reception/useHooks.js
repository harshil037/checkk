import receptionLabels from '../../translations/reception.json'
import { request } from 'graphql-request'

const fetcher = async (query, userId, vars) => {
  return request(`https://worker.mts-online.com/api/graphql/cm/${userId}/1`, query, vars)
}

const PROVIDER = 'kognitiv'

const AVAIL_OFFERS_HASH_OBJ = {}

export const SMTS_URL_HOST = 's.mts-online.com'

export const getRequests = async ({ setLoading, setRequests, gridInfo, clientId, formData }) => {
  setLoading(true)
  fetch(`https://${SMTS_URL_HOST}/${clientId}/enquiry/list.json`, {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((result) => {
      setRequests(result?.data)
      gridInfo.length = result?.recordsFiltered
      setLoading(false)
    })
}

export const getDomainInfoAndProps = async ({ domainId, productId, setBlockProps, setDomain }) => {
  fetch(`/api/domain/${domainId}`)
    .then((res) => res.json())
    .then(({ domain: currentDomain }) => {
      setDomain(currentDomain)
      const { contentId } = currentDomain.products.find((product) => product._id === productId)
      fetch(`/api/contents/${contentId}`)
        .then((res) => res.json())
        .then(({ data: contentData, error }) => {
          if (error) {
            return
          }
          setBlockProps(contentData?.blockProps)
        })
    })
}

export const getRooms = async ({
  language,
  clientId,
  maxAdults,
  maxChildAge,
  setMaxAdults,
  setMaxChildAge,
  setRooms,
}) => {
  const variables = {
    language,
    provider: PROVIDER,
  }
  fetcher(
    `
    query ($config: JSON!, $language: String!, $provider: String!) {
        cm(config: $config, language: $language, provider: $provider) {
          rooms {
            maxChildAge
            code
            title
            occupancy {
              std
              min
              max
            }
            images {
              url
            }
            description
            size
            amenities{
              title
            }
          }
        }
      }
  `,
    clientId,
    variables,
  )
    .then(({ cm }) => {
      if (cm?.rooms) {
        if (!maxAdults?.length || !maxChildAge?.length) {
          setMaxAdults(Math.max(...cm.rooms.map((room) => parseInt(room.occupancy.max))))
          setMaxChildAge(Math.max(...cm.rooms.map((room) => parseInt(room.maxChildAge))))
        }
        setRooms(cm.rooms)
      }
    })
    .catch((error) => {
      console.log(receptionLabels.roomErrorLabel[language] + error.message)
    })
}

export const getRateplans = async ({ occupancy, language, clientId, setRateplans, setDataLoading }) => {
  const variables = {
    language,
    provider: PROVIDER,
    startDate: new Date().toISOString().slice(0, 10),
  }
  const rateplanQuery = occupancy?.reduce((acc, cur, idx) => {
    acc =
      acc +
      `rateplansForRoom${idx + 1}: rateplans(start: $startDate, adults: ${Number(cur.adults)}, children: [${
        cur.childage
      }], length: 365) {
            ...rateplanFields
          }
        `
    return acc
  }, '')
  const mergedQuery = `query ($config: JSON!, $language: String!, $provider: String!, $startDate: String!) {
        cm(config: $config, language: $language, provider: $provider) {
          ${rateplanQuery}
        }
      }
      fragment rateplanFields on RateplansRaw {
        rates{
          roomCode
          rateplans{
            room_code
            rate_code
            title
            meal_plan_code
            availabilities
          }
          offers{
            room_code
            rate_code
            title
            meal_plan_code
            availabilities
          }
        }
        mealplans
      }`
  fetcher(mergedQuery, clientId, variables)
    .then(({ cm }) => {
      if (cm) {
        setRateplans(Object.values(cm || {}))
        // TODO
        // Check below error validation we have to check if any room for the asked occupancy is available or not
        setDataLoading((e) => ({
          ...e,
          roomsLoading: false,
          ...(!cm?.rateplansForRoom1?.rates?.length
            ? { roomsMessage: receptionLabels.noRoomTextLabel[language] }
            : { roomsMessage: '' }),
        }))
      }
    })
    .catch((error) => {
      console.log(receptionLabels.roomErrorLabel[language] + error.message)
      setDataLoading((e) => ({
        ...e,
        roomsLoading: false,
        roomsMessage: receptionLabels.roomErrorLabel[language],
      }))
    })
}

export const getInterests = async ({ language, clientId, setInterests }) => {
  const variables = {
    language,
    provider: PROVIDER,
  }
  fetcher(
    `query($config: JSON! $language: String! $provider: String!) {
        cm(
          config: $config
          provider: $provider
          language: $language
        ) {
          services{
            code
            title
            description
            categories
            images{
              url
            }
            price {
              amount
              currency
            }
          }
          categories{
            code
            title
          }
        }
      }`,
    clientId,
    variables,
  )
    .then(({ cm }) => {
      let servicesOfInterests
      if (cm) {
        if (cm.categories && cm.services) {
          const categoriesWithInterest = cm.categories?.filter((x) => x.code.match(/^INT_.*/g))
          const interestCategoryCodes = categoriesWithInterest?.map((category) => category.code)
          servicesOfInterests =
            categoriesWithInterest?.length &&
            cm.services?.reduce((acc, service) => {
              const interestCategoryInService = service.categories.find((category) =>
                interestCategoryCodes.includes(category),
              )
              if (interestCategoryInService) {
                const interestCategoryInCategories = categoriesWithInterest.find(
                  (category) => category.code === interestCategoryInService,
                )
                acc.push({
                  ...service,
                  interestCategoryTitle: interestCategoryInCategories.title,
                })
              }
              return acc
            }, [])
          setInterests(servicesOfInterests || [])
        }
      }
    })
    .catch((error) => {
      console.log(receptionLabels.interestErrorLabel[language] + error.message)
    })
}

export const getRoomsOffers = async ({ language, clientId, setRoomOffers, setDataLoading }) => {
  const variables = {
    language,
    provider: PROVIDER,
    roomCode: '',
  }
  fetcher(
    `query ($config: JSON!, $language: String!, $provider: String!, $roomCode: String!) {
        cm(config: $config, language: $language, provider: $provider) {
          roomOffers(roomCode: $roomCode){
            code
            title
            roomCode
            description
            images{
              url
              fileName
            }
            minStay
            minPrice
            availabilityPeriod
            mealPlanInfo
            minimumOccupancy
            standardOccupancy
            maximumOccupancy
          }
        }
      }`,
    clientId,
    variables,
  )
    .then(({ cm }) => {
      if (cm && cm.roomOffers) {
        setRoomOffers(cm.roomOffers)
      }
      setDataLoading((e) => ({
        ...e,
        offersLoading: false,
        ...(!cm?.roomOffers?.length
          ? { offersMessage: receptionLabels.noOfferTextLabel[language] }
          : { offersMessage: '' }),
      }))
    })
    .catch((error) => {
      console.log(receptionLabels.offerErrorLabel[language] + error)
      setDataLoading((e) => ({
        ...e,
        offersLoading: false,
        offersMessage: receptionLabels.noOfferTextLabel[language],
      }))
    })
}

export const getCalendar = async ({ occupancy, language, setCalLoading, clientId, setCalendarData }) => {
  const variables = {
    language,
    provider: PROVIDER,
    rooms: occupancy?.map((o) => ({ adults: Number(o.adults), children: o.childage.map(Number) })),
  }
  setCalLoading(true)
  fetcher(
    `query(
        $config: JSON!
        $language: String!
        $provider: String!
        $roomCodes: String
        $rooms: [calendarRoomOccupancy]
      ) {
        cm(config: $config, language: $language, provider: $provider) {
          calendar(
            roomCode: $roomCodes
            rooms: $rooms
            days: KUBE
          ) {
            days
            maxstay
            closedto
            blacklistedStays
          }
        }
      }      
    `,
    clientId,
    variables,
  )
    .then(({ cm }) => {
      if (cm && cm.calendar) {
        setCalendarData(cm.calendar)
        setCalLoading(false)
      }
    })
    .catch((error) => {
      console.log(receptionLabels.calendarErrorLabel[language] + error)
    })
}

export const getAvailableOffers = async ({
  start,
  end,
  occupancy,
  language,
  clientId,
}) => {
  const variables = {
    language,
    provider: PROVIDER,
    start,
    end,
    rooms: occupancy?.map((o) => ({ adults: Number(o.adults), children: o.childage.map(Number) })),
  }
  const key = JSON.stringify(variables)
  if (AVAIL_OFFERS_HASH_OBJ[key]) {
    return AVAIL_OFFERS_HASH_OBJ[key]
  }
  return fetcher(
    `query(
        $config: JSON!
        $language: String!
        $provider: String!
        $start: String!
        $end: String!
        $rooms: [calendarRoomOccupancy]
      ) {
        cm(config: $config, language: $language, provider: $provider) {
          offersForAutoReply(start: $start, end: $end, rooms: $rooms)
        }
      }      
  `,
    clientId,
    variables,
  )
    .then(({ cm }) => {
      if (cm && cm.offersForAutoReply) {
        AVAIL_OFFERS_HASH_OBJ[key] = cm.offersForAutoReply
        return cm.offersForAutoReply
      }
    })
    .catch((error) => {
      console.log('Unable to retrieve offer data. Reason: ' + error.message)
      return error.message
    })
}

export const getBookability = async ({ language, clientId, setMaxRoomsPerBooking }) => {
  const variables = {
    language,
    provider: PROVIDER,
  }
  return fetcher(
    `query(
        $config: JSON!
        $language: String!
        $provider: String!
      ) {
        cm(config: $config, language: $language, provider: $provider) {
          bookability {
            maxRoomsPerBooking
          }
        }
      }      
  `,
    clientId,
    variables,
  )
    .then(({ cm }) => {
      if (cm && cm.bookability && cm.bookability.maxRoomsPerBooking) {
        setMaxRoomsPerBooking(cm.bookability.maxRoomsPerBooking)
      }
    })
    .catch((error) => {
      console.log('Error in bookability api' + error)
    })
}
