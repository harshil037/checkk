import nextConnect from 'next-connect'
import cors from '../../../../../../middlewares/cors'
import { generateRandomNumber } from '../../../../../../lib/utils'
import middleware from '../../../../../../middlewares/middleware'
import { getClientDataSource, addClientDataSource, getDomain } from '../../../../../../lib/db'
import { URL, URLSearchParams } from 'url'
// import querystring from ('querystring')

const handler = nextConnect()

handler.use(middleware).use(cors)

handler.get(async (req, res) => {
  const {
    query: { limit, clientId, domainId },
  } = req

  const domain = await getDomain(req, domainId)
  const clientData = domain?.url
    ? await getClientDataSource(req, domain.url, clientId, 'facebook')
    : await getClientDataSource(req, domainId, clientId, 'facebook')
  // const id = clientData?.app_id
  // const fbToken = clientData?.token

  const userFieldSet = `name,feed.limit(${limit}){id,permalink_url,full_picture,message,shares, attachments, created_time}`

  // const id = 15386512930
  const id = 947096895725458

  const fbToken =
    'EAANdYS4Jn5IBAE6FxI5FOasjxpLLWTaMUnxdxAUO3dQaaMyd2GHZCtkBXnhqWn6T5SMKHHQZBGJH1ZAsGusTZCQIJ0YJaeRhfDZCDiYLIXZA4RCwB7U0PpPI23mKxwREsXSXlPFKqueZC2bAI1FVCS9zg3A6yGpk4njvV5OxDomvNfj5C96oBS61CPewZCMfCdDqQuBpNX6iuiCdBEV4gLkjD2PoZCKETTOkZD'

  const data = await fetch(
    `https://graph.facebook.com/v2.8/${id}?` +
      new URLSearchParams({
        access_token: fbToken,
        // fields: userFieldSet,
      }),
    {
      method: 'GET',
    },
  )

  const result = await data.json()

  if (result) {
    res.json({ error: null, data: result })
    return
  } else {
    res.status(500).send({ error: 'problems fetching the data', data: null })
    return
  }
})

export default handler
