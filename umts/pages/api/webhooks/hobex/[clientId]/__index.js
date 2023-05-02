import nextConnect from 'next-connect'
import crypto from 'crypto'

import middleware from '../../../../../middlewares/middleware'
import { saveWebhookData, getHobexSecret } from '../../../../../lib/db'

const handler = nextConnect()

handler.use(middleware)

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
  return decipher.update(cipherText) + decipher.final()
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
        const decipherResult = data.map((cipherText) =>
          JSON.parse(decryptRequestBody(dataSource.hobexSecret, ivfromHttpHeader, authTagFromHttpHeader, cipherText)),
        )

        const result = await saveWebhookData(req, { clientId, provider: 'hobex', data: decipherResult })

        if (result) {
          res.status(200).send({ success: true })
        } else {
          console.log('error while saving inquiry in db', req.body)
          res.status(500).send({ success: false })
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
