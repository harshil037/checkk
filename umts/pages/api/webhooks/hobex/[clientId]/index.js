import nextConnect from 'next-connect'
import crypto from 'crypto'
import axios from 'axios'

import middleware from '../../../../../middlewares/middleware'
import { saveWebhookData, getHobexSecret } from '../../../../../lib/db'
import { encryptHexa } from '../../../../../lib/crypto'

const handler = nextConnect()

handler.use(middleware)

const SECRET = process.env.ENCRYPTION_SECRET

const decryptRequestBody = (secret, initializationVector, authenticationTag, data) => {
  // Convert data to process
  const key = Buffer.from(secret, 'hex')
  const iv = Buffer.from(initializationVector, 'hex')
  const authTag = Buffer.from(authenticationTag, 'hex')
  const cipherText = Buffer.from(data, 'hex')

  // Prepare descryption
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  // Decrypt
  return JSON.parse(decipher.update(cipherText) + decipher.final())
}

const sendToPragsParking = async (data) => {
  try {
    await axios.post('https://parking.mts-online.com/v1/webhook/confirm', data)
    return true
  } catch (e) {
    console.log(e.message)
    return true
  }
}

handler.post(async (req, res) => {
  try {
    const { clientId } = req.query

    const dataSource = await getHobexSecret(req, clientId)

    if (dataSource?.hobexSecret) {
      // Data from server
      // Initialization-Vector (Hexadecimal)
      const ivfromHttpHeader = req.headers['x-initialization-vector']

      // Authentication-Tag (Hexadecimal)
      const authTagFromHttpHeader = req.headers['x-authentication-tag']

      const data = req.body.encryptedBody

      if (data && ivfromHttpHeader && authTagFromHttpHeader) {
        if (Array.isArray(data)) {
          const decipherResult = data
            .map((cipherText) =>
              decryptRequestBody(dataSource.hobexSecret, ivfromHttpHeader, authTagFromHttpHeader, cipherText),
            )
            .map((item) => {
              const info = item
              if (info.type === 'PAYMENT') {
                info.payload.debug = encryptHexa(SECRET, JSON.stringify(info.payload.card))
                delete info.payload.card
              }
              return info
            })

          const result = await saveWebhookData(req, { clientId, provider: 'hobex', data: decipherResult })

          if (result) {
            sendToPragsParking({ data: decipherResult })
            res.status(200).send({ success: true })
          } else {
            console.log('error while saving inquiry in db', req.body)
            res.status(500).send({ success: false })
          }
        } else {
          const decipherResult = decryptRequestBody(
            dataSource.hobexSecret,
            ivfromHttpHeader,
            authTagFromHttpHeader,
            data,
          )

          if (decipherResult.type === 'PAYMENT') {
            decipherResult.payload.debug = encryptHexa(SECRET, JSON.stringify(decipherResult.payload.card))
            delete decipherResult.payload.card
          }

          const result = await saveWebhookData(req, { clientId, provider: 'hobex', data: decipherResult })

          if (result) {
            sendToPragsParking({ data: decipherResult })
            res.status(200).send({ success: true })
          } else {
            console.log('error while saving inquiry in db', req.body)
            res.status(500).send({ success: false })
          }
        }
      } else {
        res.status(400).send({ success: false, error: 'empty request', data: { headers: req.headers, body: req.body } })
      }
    } else {
      console.log('can not find data sources ==>', clientId)
      res.status(500).send({ success: false })
    }
  } catch (e) {
    console.log(e)
    res.status(500).send({ success: false, data: { headers: req.headers, body: req.body }, error: e.message })
  }
})

export default handler
