import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import cors from '../../../../../middlewares/cors'
import { getClientDataSource } from '../../../../../lib/db'
import { decryptHexa } from '../../../../../lib/crypto'
import Mailjet from 'node-mailjet'

const handler = nextConnect()
handler.use(middleware).use(cors)

const SECRET = process.env.ENCRYPTION_SECRET

// get newsletter info from client datasource
const getClientCredientals = async (req, domain, client, dataSource) => {
  const data = await getClientDataSource(req, domain, client, dataSource)
  return data ? data : null
}

handler.post(async (req, res) => {
  const data = typeof req.body === 'object' ? req.body : JSON.parse(req.body)
  const { contactInfo, contactListId, contactProperties } = data
  const { mtsId, mtsNameField, mtsEmailField, optin, language, ...otherContactInfo } = contactInfo

  // sending required properties from all contact properties
  const allowedContactProperties = {}
  contactProperties.map((property) => {
    if (Object.keys(otherContactInfo).includes(property)) {
      allowedContactProperties[property] = otherContactInfo?.[property]
    }
  })

  // decrypt optin (return email+today's date)
  const optInKey2 = decryptHexa(SECRET, optin)
  // optin key(email+today's date)
  const key = mtsEmailField + new Date().toLocaleDateString('de-DE')

  // check optin key is valid or not
  if (optInKey2 === key) {
    // mtsId --> clientId
    // LIVE
    // const newsletter = mtsId && (await getClientCredientals(req, req?.headers?.origin, mtsId, 'newsletter'))
    // const newsletter =
    //   mtsId && (await getClientCredientals(req, 'https://www.weissenstein-pietralba.com', mtsId, 'newsletter'))
    // console.log({ newsletter })
    // TEST :: weissenstein-pietralba

    // pietralba (API keys call)
    // const newsletter = mtsId && (await getClientCredientals(req, 'www.weissenstein-pietralba.com', mtsId, 'newsletter'))

    // hotel arndt (API keys call)
    const newsletter = mtsId && (await getClientCredientals(req, 'www.hotelarndt', mtsId, 'newsletter'))
    // const MJ_APIKEY_PUBLIC = `fa763659a391e0f44a01bd9f724f56db`
    // const MJ_APIKEY_PRIVATE = `77329ecba20158cc9a77c40d20060fbd`

    // const MJ_APIKEY_PUBLIC = `f2bda6b68ff2b0fd628c7dc0504b0c7b`
    // const MJ_APIKEY_PRIVATE = `829674dd72a7e8b36e51f4ded9f5d477`

    const mailjet = Mailjet.apiConnect(newsletter?.MJ_APIKEY_PUBLIC, newsletter?.MJ_APIKEY_PRIVATE)
    const request = mailjet
      .post('contactslist', { version: 'v3' })
      .id(contactListId)
      .action('managemanycontacts')
      .request({
        Action: 'addnoforce',
        Contacts: [
          {
            Email: mtsEmailField,
            IsExcludedFromCampaigns: 'false',
            Name: mtsNameField || '',
            Properties: {
              ...otherContactInfo,
            },
          },
        ],
      })
    request
      .then((result) => {
        res.status(200).json({ success: true, result: result.body })
      })
      .catch((err) => {
        console.log(err)
        res.status(200).json({ success: false, err: err.statusCode })
      })
  } else {
    res.status(401).json({ success: false, err: `Unable to authenticate data` })
  }
})

export default handler
