import nextConnect from 'next-connect'
import axios from 'axios'

const handler = nextConnect()

handler.get(async (req, res) => {
  const { clientId, requestId } = req.query
  const { data: smartResponseJSON } = await axios({
    method: 'get',
    url: `https://s.mts-online.com/${clientId}/de/enquiry/listumts?_id=${requestId}`,
  }).then(({ data }) => {
    if (data) {
      return data
    }
    return {}
  })
  if (smartResponseJSON.data.sr_umts === true) {
    if (smartResponseJSON.autoreply_landingpage) {
      res.status(200).json(smartResponseJSON)
      return
    } else {
      smartResponseJSON.autoreply_landingpage = [smartResponseJSON.autoreply]
      res.status(200).json(smartResponseJSON)
      return
    }
  }

  delete smartResponseJSON.autoreply_landingpage

  const autoreply = {}

  if (Array.isArray(smartResponseJSON.autoreply.data)) {
    smartResponseJSON.autoreply.data = smartResponseJSON.data.room.reduce((acc, r, idx) => {
      acc[`${r.code ? `${r.code}_${idx}` : idx}`] = smartResponseJSON.autoreply.data
      return acc
    }, {})
  }

  const occupancy = smartResponseJSON.data.room.map((r) => {
    return {
      adults: parseInt(r.adults),
      children: parseInt(r.children),
      ...(r.childage ? { childage: r.childage.map(Number) } : {}),
    }
  })
  const defaultDateRange = `${smartResponseJSON.data.period[0].arrival}to${smartResponseJSON.data.period[0].departure}`
  const secondaryDateRange = `${smartResponseJSON.data.period?.[1]?.arrival}to${smartResponseJSON.data.period?.[1]?.departure}`

  const setAutoReplyDummyObj = (dateRange, occupancy, period) => {
    autoreply[dateRange] = {
      ...smartResponseJSON.autoreply,
      period,
      occupancy,
      data: {},
    }
  }

  setAutoReplyDummyObj(defaultDateRange, occupancy, {
    arrival: smartResponseJSON.data.period[0].arrival,
    departure: smartResponseJSON.data.period[0].departure,
  })

  for (let requestedRoom in smartResponseJSON.autoreply.data) {
    const responseForRequestedRoom = smartResponseJSON.autoreply.data[requestedRoom]
    responseForRequestedRoom.forEach((suggestedRoom) => {
      const dateRange = Object.prototype.hasOwnProperty.call(suggestedRoom, 'alternativeDate')
        ? `${suggestedRoom.alternativeDate.arrival}to${suggestedRoom.alternativeDate.departure}`
        : suggestedRoom.isAlternativeDate === 2
        ? secondaryDateRange
        : defaultDateRange

      if (!autoreply[dateRange]) {
        setAutoReplyDummyObj(dateRange, occupancy, {
          arrival: dateRange.split('to')[0],
          departure: dateRange.split('to')[1],
        })
      }

      if (!autoreply[dateRange].data[requestedRoom]) {
        autoreply[dateRange].data[requestedRoom] = []
      }

      autoreply[dateRange].data[requestedRoom].push(suggestedRoom)
    })
  }

  smartResponseJSON.autoreply_landingpage = Object.values(autoreply).filter((r) => !!Object.values(r.data).length)

  res.status(200).json(smartResponseJSON)
  return
})

export default handler
