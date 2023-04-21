import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import protectedAPI from '../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../middlewares/ensureReqBody'
import { createSkyalpsRecord, getSkyalpsData, deleteSkyalpsData, updateSkyalpsData } from '../../../../lib/db'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

handler.post(async (req, res) => {
  const { clientId } = req.query
  const data = JSON.parse(req.body)

  const result = await createSkyalpsRecord(req, { clientId, ...data })

  if (result) {
    res.json({ success: result })
  } else {
    res.json({ success: false })
  }
})

handler.get(async (req, res) => {
  const { clientId } = req.query

  const data = await getSkyalpsData(req, clientId)

  if (data) {
    res.json({ success: true, data })
  } else {
    res.json({ success: false })
  }
})

handler.put(async (req, res) => {
  const { clientId } = req.query
  const data = JSON.parse(req.body)

  const result = await updateSkyalpsData(req, clientId, data)

  if (result) {
    res.json({ success: result })
  } else {
    res.json({ success: false })
  }
})

handler.delete(async (req, res) => {
  const { clientId } = req.query

  const result = await deleteSkyalpsData(req, clientId)

  if (result) {
    res.json({ success: result })
  } else {
    res.json({ success: false })
  }
})

export default handler
