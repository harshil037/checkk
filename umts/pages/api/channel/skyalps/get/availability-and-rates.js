import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import protectedAPI from '../../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../../middlewares/ensureReqBody'
import { soapRequest } from '../../../../../lib/soapRequest'
import { parseStringPromise } from 'xml2js'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

handler.post(async (req, res) => {
  const { hostId, xtoken, hotelCode, roomCode, rateCode, startDate, periodLength } = JSON.parse(req.body)

  const url = 'http://avesnet02.datagest.it:8080/skyalps.az1.test/interop/channelManagerAves/v2/soap'

  const sampleHeaders = {
    'Content-Type': 'text/xml;charset=UTF-8',
    soapAction: 'urn:IChannelManagerService/GetAvailabilityAndRates',
  }

  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                  <soapenv:Header/>
                  <soapenv:Body>
                      <GetAvailabilityAndRates>
                          <!--Optional:-->
                          <GetAvailabilityAndRatesRQ>
                              <!--Optional:-->
                              <RqHeader HostID="${hostId}" Xtoken="${xtoken}" Interface="WEB">
                              </RqHeader>
                              <!--Optional:-->
                              <HotelCode>${hotelCode}</HotelCode>
                              <!--Optional:-->
                              <RoomList>
                              <!--Zero or more repetitions:-->
                              <RoomCode>${roomCode}</RoomCode>
                              </RoomList>
                              <!--Optional:-->
                              <RateCode>${rateCode}</RateCode>
                              <StartDate>${startDate}</StartDate>
                              <PeriodLength>${periodLength}</PeriodLength>
                          </GetAvailabilityAndRatesRQ>
                      </GetAvailabilityAndRates>
                  </soapenv:Body>
                  </soapenv:Envelope>`

  const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml }) // Optional timeout parameter(milliseconds)
  const { headers, body, statusCode } = response
  //   console.log(headers)
  //   console.log(body)
  //   console.log(statusCode)
  let data = {}

  if (statusCode === 200) {
    const skyalps = await parseStringPromise(body, { mergeAttrs: true, explicitArray: false })

    data =
      skyalps['s:Envelope']['s:Body']['GetAvailabilityAndRatesResponse']['GetAvailabilityAndRatesRS']['RoomList'][
        'RoomDetail'
      ]
  }

  res.status(200).json(data)
})

export default handler
