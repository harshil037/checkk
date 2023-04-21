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

const makeAvailabilitySoapBody = (roomData, roomCode, hostId, xtoken, hotelCode) => {
  const dateList = []
  for (let i = 0; i < roomData.length; i++) {
    const currentAvail = roomData[i]
    for (let j = 0; j < currentAvail.availabilityInfo.length; j++) {
      const qty = currentAvail.availabilityInfo[j]
      if (qty !== '-') {
        dateList.push(
          `<DateInfo Day="${currentAvail.year}-${
            currentAvail.month < 10 ? `0${currentAvail.month}` : currentAvail.month
          }-${j + 1 < 10 ? `0${j + 1}` : j + 1}" Qty="${qty}" StopSale="${qty > 0 ? 'false' : 'true'}" />`,
        )
      }
    }
  }

  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                  <soapenv:Header/>
                  <soapenv:Body>
                    <ManageAvailability>
                      <ManageAvailabilityRQ>
                        <RqHeader HostID="${hostId}" Xtoken="${xtoken}" Interface="WEB"/>
                        <HotelCode>${hotelCode}</HotelCode>
                        <RoomCode>${roomCode}</RoomCode>
                          <DateList>
                          ${dateList.join('\n')}
                          </DateList>
                      </ManageAvailabilityRQ>
                    </ManageAvailability>
                  </soapenv:Body>
               </soapenv:Envelope>`
  return xml
}

const makeRatesSoapBody = (roomData, rateCode, roomCode, hostId, xtoken, hotelCode) => {
  const dateList = []
  for (let i = 0; i < roomData.length; i++) {
    const currentRate = roomData[i]
    for (let j = 0; j < currentRate.ratesInfo.length; j++) {
      const rate = currentRate.ratesInfo[j]
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

  return xml
}

export { makeAvailabilitySoapBody, makeRatesSoapBody, decryptRestrictions }
