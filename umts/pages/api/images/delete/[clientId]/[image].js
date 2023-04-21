import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import protectedAPI from '../../../../../middlewares/protectedAPI'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI)

handler.post(async (req, res) => {
  const clientId = req.query.clientId
  const image = req.query.image

  const response = await fetch(`https://worker.mts-online.com/api/images/delete/${clientId}/${image}`, {
    method: 'POST',
  })
  // const response = await fetch(`http://10.10.10.119:3004/api/images/delete/${clientId}/${image}`, {
  //   method: 'POST',
  // })

  const data = await response.json()

  res.json(data)
})

export default handler
