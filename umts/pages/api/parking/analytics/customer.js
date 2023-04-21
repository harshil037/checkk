import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import { getCustomer } from '../../../../lib/db'

const handler = nextConnect()

handler.use(middleware)

handler.get(async (req, res) => {
  try {
    const customer = await getCustomer(req)

    res.status(200).send({ success: true, data: customer })
  } catch (e) {
    res.status(500).send({ success: false, error: e.message })
  }
})

export default handler
