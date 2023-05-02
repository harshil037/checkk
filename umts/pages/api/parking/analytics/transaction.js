import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import { getTransactions } from '../../../../lib/db'

const handler = nextConnect()

handler.use(middleware)

handler.get(async (req, res) => {
  try {
    const transaction = await getTransactions(req)

    res.status(200).send({ success: true, data: transaction })
  } catch (e) {
    res.status(500).send({ success: false, error: e.message })
  }
})

export default handler
