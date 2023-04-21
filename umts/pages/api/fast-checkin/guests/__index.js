import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import { saveFastCheckinRecord, getFastCheckinGuest } from '../../../../lib/db'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN

const handler = nextConnect()

handler.use(middleware)

handler.post(async (req, res) => {
  if (req.headers['x-access-token'] === ACCESS_TOKEN) {
    const data = req.body
    if (data && Object.keys(data).length) {
      const result = await saveFastCheckinRecord(req, data)
      if (result) {
        res.status(200).send({ success: true })
      } else {
        console.log('error while saving inquiry in db', req.body)
        res.status(500).send({ success: false })
      }
    } else {
      res.status(400).send({ success: false, error: 'empty body' })
    }
  } else {
    res.status(401).send({ error: 'Unauthorized' })
  }
})

const makeGustXML = (guest) => {
  // console.log(guest)
  let doc = ''
  if (guest.document) {
    doc = `<Document>
        <DocType>${guest.document.docType}</DocType>
        <DocID>${guest.document.docId}</DocID>
        <IssuingCountry>${guest.document.issuingCountry}</IssuingCountry>
        <IssuingAuthority>${guest.document.issuingAuthority}</IssuingAuthority>
        <ExpireDate>${guest.document.expireDate}</ExpireDate>
      </Document>`
  }
  let firstName = `<FirstName>${guest.firstName}</FirstName>`
  let lastName = `<LastName>${guest.lastName}</LastName>`
  let gender = `<Gender>${guest.gender}</Gender>`
  let birth = `<Birth>
    <Date>${guest.birth.date}</Date>
    <Country>${guest.birth.country}</Country>
    <StateProv>${guest.birth.state}</StateProv>
    <City>${guest.birth.city}</City>
  </Birth>`
  let nationality = `<Nationality>${guest.nationality}</Nationality>`
  let address = ''
  if (guest.address) {
    address = `<Address>
    <Country>${guest.address.country}</Country>
    <StateProv>${guest.address.state}</StateProv>
    <PostalCode>${guest.address.postalcode}</PostalCode>
    <City>${guest.address.city}</City>
    <Street>${guest.address.street}</Street>
    </Address>`
  }

  let email = `<Email>${guest.email}</Email>`

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

handler.get(async (req, res) => {
  const firstName = req.query.FN
  const lastName = req.query.LN
  const dob = req.query.DOB

  const query = {}
  const filters = []
  if (firstName) {
    query['guests.firstName'] = firstName
    filters.push((item) => item.firstName === firstName)
  }
  if (lastName) {
    query['guests.lastName'] = lastName
    filters.push((item) => item.lastName === lastName)
  }
  if (dob) {
    query['guests.birth.date'] = dob
    filters.push((item) => item.birth.date === dob)
  }

  const data = await getFastCheckinGuest(req, query)
  if (data?.length) {
    const { guests } = data[0]
    if (guests.length) {
      let body = guests.filter((guest) => filters.every((fn) => fn(guest))).map(makeGustXML)

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
})

export default handler
