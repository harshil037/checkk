import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import protectedAPI from '../../../../middlewares/protectedAPI'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI)
handler.post(async (req, res) => {
  const clientId = req.query.id
  const body = JSON.parse(req.body)

  // const response = await fetch(`https://worker.mts-online.com/api/flipBook/convert/${clientId}`, {
  //   method: 'POST',
  //   body: JSON.stringify(body),
  // })
  const response = await fetch(`http://10.10.10.119:3004/api/flipBook/convert/${clientId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const data = await response.json()

  res.json(data)
})

export default handler
