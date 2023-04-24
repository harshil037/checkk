import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'

const handler = nextConnect()

handler.use(middleware)

handler.get(async (req, res) => {
  res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true })
  res.status(200).json({
    success: true,
    message: 'logout success',
  })
})

export default handler
