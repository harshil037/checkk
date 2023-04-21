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
  // you need permission for most of these fields
  const userFieldSet =
    'id, name, about, email, accounts, link, is_verified, significant_other, relationship_status, website, picture, photos, feed'

  const id = 15386512930
  const fbToken =
    'EAADSIzvHuZBsBACjDQH0gSoJXRPDvbakizgIucHUmmVurKZBZBn1NXMl5ce8mkYcBAC2mgMEtRcvj7mipAvTEszpjRtJkxKI0pYB7dfx57WlVluENBGY3P2ZCcRPJ0l2z2o5pU5wT7TIfu6QJ5HXGcY0oRMgJ8IB1XZCqpMfPgAZDZD'

  console.log(
    `https://graph.facebook.com/v2.8/${id}?` +
      new URLSearchParams({
        access_token: fbToken,
        fields: userFieldSet,
      }),
  )

  const data = await fetch(
    `https://graph.facebook.com/v2.8/${id}?` +
      new URLSearchParams({
        access_token: fbToken,
        fields: userFieldSet,
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
