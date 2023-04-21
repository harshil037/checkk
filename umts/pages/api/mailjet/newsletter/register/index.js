import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import cors from '../../../../../middlewares/cors'
import Mailjet from 'node-mailjet'
import { getClientDataSource, getClient } from '../../../../../lib/db'
import { encryptHexa } from '../../../../../lib/crypto'
import { URL } from 'url'

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
  const { formValues, sender, subject, templateId, url, domainUrl, clientId, action, language } = data

  if (action === 'register') {
    const clientInfo = await getClient(req, clientId)

    // generate optin key from email+today's date
    const optInKey = encryptHexa(SECRET, formValues?.mtsEmailField + new Date().toLocaleDateString('de-DE'))

    // confirmation url
    const parseURL = new URL(url)
    // appending name, emmail and contact property values in confirmation url
    for (let key in formValues) {
      parseURL.searchParams.append(key, formValues[key])
    }
    // appending optin and language in confirmation url
    if (optInKey) parseURL.searchParams.append('optin', optInKey)
    if (language) parseURL.searchParams.append('language', language)
    // mtsId --> clientId
    if (clientId) parseURL.searchParams.append('mtsId', clientId)

    // LIVE
    // const newsletter = clientId && (await getClientCredientals(req, req?.headers?.origin, clientId, 'newsletter'))
    // const newsletter =
    //   clientId && (await getClientCredientals(req, 'https://www.weissenstein-pietralba.com', clientId, 'newsletter'))
    // console.log({ clientId, newsletter })

    // TEST :: weissenstein-pietralba
    // const newsletter = clientId && (await getClientCredientals(req, 'www.weissenstein-pietralba.com', clientId, 'newsletter'))

    // pietralba (API keys call)
    // const newsletter = clientId && (await getClientCredientals(req, 'www.weissenstein-pietralba.com', clientId, 'newsletter'))

    // hotel arndt (API keys call)
    const newsletter = clientId && (await getClientCredientals(req, 'www.hotelarndt', clientId, 'newsletter'))
    // const MJ_APIKEY_PUBLIC = `fa763659a391e0f44a01bd9f724f56db`
    // const MJ_APIKEY_PRIVATE = `77329ecba20158cc9a77c40d20060fbd`


    // const MJ_APIKEY_PUBLIC = `f2bda6b68ff2b0fd628c7dc0504b0c7b`
    // const MJ_APIKEY_PRIVATE = `829674dd72a7e8b36e51f4ded9f5d477`

    console.log({newsletter})
    // connect
    const mailjet = Mailjet.apiConnect(newsletter?.MJ_APIKEY_PUBLIC, newsletter?.MJ_APIKEY_PRIVATE)

    // send mail
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: sender?.email,
            Name: sender?.name,
          },
          To: [
            {
              Email: formValues?.mtsEmailField,
              Name: formValues?.mtsNameField || '',
            },
          ],
          TemplateId: parseInt(templateId),
          TemplateLanguage: true,
          Variables: {
            domain: domainUrl,
            client_name: clientInfo?.name,
            confirmurl: parseURL.href,
          },
          Subject: subject,
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
