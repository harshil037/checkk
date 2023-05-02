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

// import nextConnect from 'next-connect'
// // import nodemailer from 'nodemailer'

// import cors from '../../../../../../../../../../middlewares/cors'
// import middleware from '../../../../../../../../../../middlewares/middleware'
// // import protectedAPI from '../../../../../middlewares/protectedAPI'
// import { getClientDataSource, addClientDataSource } from '../../../../../../../../../../lib/db'
// import { saltHashPassword } from '../../../../../../../../../../lib/crypto'

// const handler = nextConnect()

// handler
//   .use(middleware)
//   .use(cors)
//   .delete(async (req, res) => {
//     const {
//       query: { clientNumber, code, id },
//     } = req

//     const authorization =
//       req.headers?.authorization && Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString()

//     const origin = authorization && authorization.split(':')[0]
//     const token = authorization && authorization.split(':')[1]
//     const saltedPassword = origin && saltHashPassword(origin).substring(0, 50)

//     if (!authorization || token !== saltedPassword) {
//       res.status(401).send({ error: 'Not authorized', user: null })
//       return
//     }

//     const vouchers = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsVouchers')) || []
//     // const clientVoucher = vouchers.find(
//     //   (v) => v.clientno === clientNumber && v.status === 'redeemable' && v.code === code,
//     // )

//     const now = new Date(Date.now()).toISOString()

//     const saveVouchersRef = await addClientDataSource(
//       req,
//       'mts-online.com',
//       'u0000',
//       'vmtsVouchers',
//       vouchers.map((v) => {
//         return v.code === code && v.clientno === clientNumber
//           ? {
//               ...v,
//               fetched: false,
//               status: 'cancelled',
//               lastUpdatedAt: now,
//               transactions: [
//                 ...v.transactions,
//                 {
//                   cancelledAt: now,
//                   amount: v.currentValue,
//                   createdAt: now,
//                 },
//               ],
//             }
//           : v
//       }),
//     )

//     // res.statusCode = 201
//     // res.setHeader('Content-Type', 'application/json')
//     // res.json({ ...clientVoucher, type: 'redemption' })
//     res.statusCode = 204
//     res.setHeader('Content-Type', 'application/json')
//     res.json({})
//   })

// export default handler
