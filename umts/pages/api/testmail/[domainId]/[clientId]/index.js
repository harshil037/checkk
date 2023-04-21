import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import Mailer from '../../../../../lib/mail2'

const handler = nextConnect()

handler.use(middleware)

handler.post(async (req, res) => {
  try {
    const {domainId, clientId} = req.query;
    
    const result = await Mailer({req, domainId, clientId})
    console.log("result",result)
    res.json({ error: null, success: result })
  } catch (e) {
    res.json({ error: e.message, success: false })
  }
})

export default handler
