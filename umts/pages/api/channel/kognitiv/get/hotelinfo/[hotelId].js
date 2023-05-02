import nextConnect from 'next-connect'
import middleware from '../../../../../../middlewares/middleware'
import protectedAPI from '../../../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../../../middlewares/ensureReqBody'
import axios from 'axios'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

handler.get(async (req, res) => {
  const token = 42
  const language = 'EN'
  const { hotelId } = req.query

  try {
    const response = await axios.get(
      `https://switch.seekda.com/properties/${hotelId}/hotelinfo.json?type=hotelsearch&token=${token}&language=${language}`,
    )
    const data = response.data

    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(404).json({ success: false })
    console.log('eror while getting hotel info from kognitiv =>', error)
  }
})

export default handler
