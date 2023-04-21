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
  const { hostId, xtoken, hotelCode } = JSON.parse(req.body)

  const url = 'http://avesnet02.datagest.it:8080/skyalps.az1.test/interop/channelManagerAves/v2/soap'

  const sampleHeaders = {
    'Content-Type': 'text/xml;charset=UTF-8',
    soapAction: 'urn:IChannelManagerService/GetRooms',
  }

  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                <soapenv:Header/>
                <soapenv:Body>
                    <GetRooms>
                        <!--Optional:-->
                        <RoomListRQ>
                        <!--Optional:-->
                        <RqHeader HostID="${hostId}" Xtoken="${xtoken}" Interface="WEB">
                            
                        </RqHeader>
                        <!--Optional:-->
                        <HotelCode>${hotelCode}</HotelCode>
                        </RoomListRQ>
                    </GetRooms>
                </soapenv:Body>
               </soapenv:Envelope>`

  const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml }) // Optional timeout parameter(milliseconds)
  const { headers, body, statusCode } = response
  // console.log(headers)
  // console.log(body)
  // console.log(statusCode)
  let data = []

  if (statusCode === 200) {
    const skyalps = await parseStringPromise(body, { mergeAttrs: true, explicitArray: false })

    if (skyalps['s:Envelope']['s:Body']['GetRoomsResponse']['RoomListRS']['RoomList']) {
      data = skyalps['s:Envelope']['s:Body']['GetRoomsResponse']['RoomListRS']['RoomList']['RoomInfo']
    } else {
      data = []
    }
  }

  res.status(200).json(data)
})

export default handler
