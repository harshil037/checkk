import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import cors from '../../../../../middlewares/cors'
import { getFastCheckinGuest, saveApiLogs } from '../../../../../lib/db'

const handler = nextConnect()

handler.use(middleware).use(cors)

const makeGustXML = (guest) => {
  let doc = ''

  if (guest.document) {
    doc = `<Document>
        <DocType>${guest.document.type}</DocType>
        <DocID>${guest.document.id}</DocID>
        <IssuingCountry>${guest.document.issuingCountry}</IssuingCountry>
        ${
          guest.document.issuingAuthority
            ? `<IssuingAuthority>${guest.document.issuingAuthority}</IssuingAuthority>`
            : ''
        }
        <ExpireDate>${guest.document.expireDate}</ExpireDate>
      </Document>`
  }

  let firstName = `<FirstName>${guest.firstName}</FirstName>`
  let lastName = `<LastName>${guest.lastName}</LastName>`
  let gender = `<Gender>${guest.gender}</Gender>`
  let birth = `<Birth>
    <Date>${guest.birth.date}</Date>
    <Country>${guest.birth.country}</Country>
    ${guest.birth.state ? `<StateProv>${guest.birth.state}</StateProv>` : ''}
    ${guest.birth.city ? `<City>${guest.birth.city}</City>` : ''}
  </Birth>`
  let nationality = `<Nationality>${guest.nationality}</Nationality>`
  let address = ''

  // this field is only available in head of the family (primary guest)
  if (guest.address) {
    address = `<Address>
    <Country>${guest.address.country}</Country>
    ${guest.address.state ? `<StateProv>${guest.address.state}</StateProv>` : ''}
    ${guest.address.postalCode ? `<PostalCode>${guest.address.postalCode}</PostalCode>` : ''}
    ${guest.address.city ? `<City>${guest.address.city}</City>` : ''}
    ${guest.address.street ? `<Street>${guest.address.street}</Street>` : ''}
    </Address>`
  }

  let email = guest.email ? `<Email>${guest.email}</Email>` : ''

  return `<Guest>${doc}
  ${firstName}
  ${lastName}
  ${gender}
  ${birth}
  ${nationality}
  ${address}
  ${email}
  </Guest>`
}

/**
 * to dynamicaly apply multiple filter to an array
 * @param {any[]} array any array on which you need to perform filter
 * @param {function[]} filters array of callback functions
 * @returns
 */
const multiFilter = (array, filters) => {
  return array.filter((arrayItem) => filters.every((fn) => fn(arrayItem)))
}

handler.get(async (req, res) => {
  try {
    // reservation ID generated by ASA
    const reservationId = req.query.RID || null
    let convertedReservationId = null

    if (reservationId && reservationId[0] === 'R') {
      if (reservationId.split('/').length > 1) {
        convertedReservationId = reservationId.split('/')[0]
      } else {
        convertedReservationId = `${reservationId}/${new Date().getFullYear()}`
      }
    }

    const externalReservationId = req.query.EXTID || null

    // guestID generated by FastCheckIn Widget
    const guestId = req.query.GID
    const firstName = req.query.FN
    const lastName = req.query.LN
    const dob = req.query.DOB

    saveApiLogs(req, {
      headers: req.headers,
      queryParams: req.query,
      timestamp: Date.now(),
      endpoint: 'api/fast-checkin/guests/[clientId]',
    })

    res.setHeader('Content-Type', 'text/xml')

    const quries = [reservationId]

    if (externalReservationId) quries.push(externalReservationId)

    if (convertedReservationId) {
      quries.push(convertedReservationId)
      const id1 = convertedReservationId.replace('R', '')
      const id2 = reservationId.replace('R', '')
      quries.push(id1)
      quries.push(id2)
    }

    // const query = reservationId
    //   ? {
    //       reservationId: {
    //         $in: [reservationId, externalReservationId, convertedReservationId, `R${convertedReservationId}`],
    //       },
    //     }
    //   : guestId
    //   ? { 'guests.guestId': guestId }
    //   : ''

    const query = reservationId
      ? {
          reservationId: {
            $in: quries,
          },
        }
      : guestId
      ? { 'guests.guestId': guestId }
      : ''

    if (query) {
      const data = await getFastCheckinGuest(req, query)

      if (data?.length) {
        // creating dynamic filters according to the query params
        const filters = []
        if (firstName) {
          filters.push((item) => item.firstName === firstName)
        }
        if (lastName) {
          filters.push((item) => item.lastName === lastName)
        }
        if (dob) {
          filters.push((item) => item.birth.date === dob)
        }
        if (guestId) {
          filters.push((item) => item.guestId === guestId)
        }

        const { guests } = data[0]

        if (guests.length) {
          const filteredGuests = multiFilter(guests, filters)

          // if no perticular guest found then return all guest form reservation
          const guestList = filteredGuests.length > 0 ? filteredGuests : guests

          const body = guestList.map(makeGustXML)

          if (body.length) {
            res.send(`<Guests>
            ${body.join('')}
            </Guests>`)
          } else {
            res.send('<Guests/>')
          }
        } else {
          res.send('<Guests/>')
        }
      } else {
        res.send('<Guests/>')
      }
    } else {
      res.send('<Guests/>')
    }
  } catch (e) {
    console.log('========= error while sending fast checkin guest data to asa =========')
    console.log(e)
    console.log('======================================================================')
    res.send('<Guests/>')
  }
})

export default handler
