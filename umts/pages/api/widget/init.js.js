import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import cors from '../../../middlewares/cors'

const handler = nextConnect()

handler
  .use(middleware)
  .use(cors)
  .get(async (req, res) => {
    const initScript = await fetch(`https://cdn.mts-online.com/mts.js`)
    const init = initScript?.ok && initScript.text()

    res.setHeader('Cache-Control', 's-maxage=86400')
    res.setHeader('Content-Type', 'text/javascript')
    res.send(await init)
  })

export default handler
