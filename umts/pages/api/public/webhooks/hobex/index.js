import { createProxyMiddleware } from 'http-proxy-middleware'

const apiProxy = createProxyMiddleware({
  target: 'https://worker.mts-online.com',
  changeOrigin: true,
  secure: false,
})

export default function (req, res) {
  const origin = req.headers

  apiProxy(req, res, (result) => {
    if (result instanceof Error) {
      throw result
    }

    throw new Error(`Request '${req.url}' is not proxied! We should never reach here!`)
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
// import Cors from 'micro-cors'

// const cors = Cors({
//   allowMethods: ['GET', 'POST', 'HEAD'],
// })

// const handler = async (req, res) => {
//   console.log(req.body)
//   res.statusCode = 200
//   res.setHeader('Content-Type', 'application/json')
//   res.json({ error: null, data: 'ok' })
// }

// export default cors(handler)
