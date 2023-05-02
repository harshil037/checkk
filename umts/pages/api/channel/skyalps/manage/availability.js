import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import protectedAPI from '../../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../../middlewares/ensureReqBody'
import { soapRequest } from '../../../../../lib/soapRequest'
import { makeAvailabilitySoapBody, makeRatesSoapBody } from '../../../../../lib/skyalpsHelpers'
import { parseStringPromise } from 'xml2js'

const handler = nextConnect()

// handler
//   .use(middleware) //
//   .use(protectedAPI)
//   .use(ensureReqBody)

handler.post(async (req, res) => {
  const { roomData, rateCode, roomCode, hostId, xtoken, hotelCode } = req.body
  // console.log(data, startDate, roomCode, hostId, xtoken, hotelCode)

  const availXml = makeAvailabilitySoapBody(roomData, roomCode, hostId, xtoken, hotelCode)
  const ratesXml = makeRatesSoapBody(roomData, rateCode, roomCode, hostId, xtoken, hotelCode)

  // res.status(200).json({ availXml, ratesXml })

  // now quering skyalps api
  const url = 'http://avesnet02.datagest.it:8080/skyalps.az1.test/interop/channelManagerAves/v2/soap'

  const availabilityHeaders = {
    'Content-Type': 'text/xml;charset=UTF-8',
    soapAction: 'urn:IChannelManagerService/ManageAvailability',
  }
  // console.log(availXml)
  const ratesHeaders = {
    'Content-Type': 'text/xml;charset=UTF-8',
    soapAction: 'urn:IChannelManagerService/ManageRates',
  }

  const { response } = await soapRequest({ url: url, headers: availabilityHeaders, xml: availXml })
  const { headers, body, statusCode } = response

  let data = {}
  let success = false
  if (statusCode === 200) {
    const { response } = await soapRequest({ url: url, headers: ratesHeaders, xml: ratesXml })
    const { headers, body, statusCode } = response
    data = { availability: true, rates: false }
    if (statusCode === 200) {
      const skyalps = await parseStringPromise(body, { mergeAttrs: true, explicitArray: false })
      data = skyalps
      success = true
    }
  }

  res.status(200).json({ data, success })
})

export default handler
