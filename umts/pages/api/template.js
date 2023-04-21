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
// import Cors from 'cors'
// const formidable = require('formidable')

// const cors = Cors({
//   methods: ['GET', 'POST', 'HEAD'],
// })

// const runMiddleware = (req, res, fn) => {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result) => {
//       if (result instanceof Error) {
//         return reject(result)
//       }

//       return resolve(result)
//     })
//   })
// }

// async function handler(req, res) {
//   await runMiddleware(req, res, cors)

//   const data = await new Promise(function (resolve, reject) {
//     const form = new formidable.IncomingForm({ keepExtensions: true })
//     form.parse(req, function (err, fields, files) {
//       if (err) return reject(err)
//       resolve({ fields, files })
//     })
//   })

//   console.log(data)
//   res.json({ data })
// }

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// export default handler
