import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import ensureReqBody from '../../../middlewares/ensureReqBody'
import { getClientDataSource } from '../../../lib/db'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI).use(ensureReqBody)

handler.post(async (req, res) => {
  try {
    const data = typeof req.body === 'object' ? req.body : JSON.parse(req.body)
    const { domain, client } = data

    const voucher = await getClientDataSource(req, domain, client, 'voucher')

    if (!voucher) {
      res.status(200).json({ success: false })
    } else {
      res.status(200).json({ success: true, voucher })
    }
  } catch (e) {
    console.log({ e })
    res.status(500).send({ success: false, error: e.message })
  }
})

export default handler
