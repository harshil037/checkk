import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import protectedAPI from '../../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../../middlewares/ensureReqBody'
import { soapRequest } from '../../../../../lib/soapRequest'
import { parseStringPromise } from 'xml2js'

const handler = nextConnect()

const decryptRestrictions = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  A: '$',
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10,
  k: 11,
  l: 12,
  m: 13,
  n: 14,
  o: 15,
  p: 16,
  q: 17,
  r: 18,
  s: 19,
  t: 20,
  u: 21,
  v: 22,
  w: 23,
  x: 24,
  y: 25,
  z: 26,
}

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

handler.post(async (req, res) => {
  const { rates, rateCode, roomCode, hostId, xtoken, hotelCode } = req.body

  const dateList = []
  for (let i = 0; i < rates.length; i++) {
    const currentRate = rates[i]
    for (let j = 0; j < currentRate.info.length; j++) {
      const rate = currentRate.info[j]
      const rest = currentRate.restriction[j]

      if (rate !== '-' && rate !== null) {
        let minStay
        let closedToArraival
        let closedToDeparture
        switch (decryptRestrictions[rest]) {
          case '$':
            minStay = 0
            closedToArraival = true
            closedToDeparture = false
            break
          case 0:
            minStay = 0
            closedToArraival = true
            closedToDeparture = true
            break
          default:
            minStay = decryptRestrictions[rest]
            closedToArraival = false
            closedToDeparture = false
            break
        }
        // console.log(rest, minStay, closedToArraival, closedToDeparture)
        dateList.push(
          `<DateInfo Day="${currentRate.year}-${currentRate.month < 10 ? `0${currentRate.month}` : currentRate.month}-${
            j + 1 < 10 ? `0${j + 1}` : j + 1
          }" Amount="${rate}" MinStay="${minStay}" ClosedArrival="${closedToArraival}" ClosedDeparture="${closedToDeparture}"/>`,
        )
      }
    }
  }

  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                  <soapenv:Header/>
                  <soapenv:Body>
                    <ManageRates>
                      <ManageRatesRQ>
                        <RqHeader HostID="${hostId}" Xtoken="${xtoken}" Interface="WEB"/>
                        <HotelCode>${hotelCode}</HotelCode>
                        <RoomCode>${roomCode}</RoomCode>
                        <RateCode>${rateCode}</RateCode>
                          <DateList>
                            ${dateList.join('\n')}
                          </DateList>
                      </ManageRatesRQ>
                    </ManageRates>
                  </soapenv:Body>
                </soapenv:Envelope>`

  // now quering skyalps api

  const url = 'http://avesnet02.datagest.it:8080/skyalps.az1.test/interop/channelManagerAves/v2/soap'

  const sampleHeaders = {
    'Content-Type': 'text/xml;charset=UTF-8',
    soapAction: 'urn:IChannelManagerService/ManageRates',
  }
  // console.log(xml)

  const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml })
  const { headers, body, statusCode } = response

  //   console.log(headers)
  //   console.log(body)
  //   console.log(statusCode)

  let data = {}
  let success = false
  if (statusCode === 200) {
    const skyalps = await parseStringPromise(body, { mergeAttrs: true, explicitArray: false })
    data = skyalps
    success = true
  }

  res.status(200).json({ data, success })
})

export default handler
