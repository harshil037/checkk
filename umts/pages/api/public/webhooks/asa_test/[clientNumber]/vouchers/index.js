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

// import cors from '../../../../../../../middlewares/cors'
// import middleware from '../../../../../../../middlewares/middleware'
// // import protectedAPI from '../../../../../middlewares/protectedAPI'
// import ensureReqBody from '../../../../../../../middlewares/ensureReqBody'
// import { getClientDataSource, addClientDataSource } from '../../../../../../../lib/db'
// import { getKeyFromPassword, getSalt, encrypt, decrypt, saltHashPassword } from '../../../../../../../lib/crypto'
// // import { getClient, getDomain } from '../../../../../lib/db'

// const handler = nextConnect()

// const getClientCredientals = async (req, domain, client, dataSource) => {
//   const data = await getClientDataSource(req, domain, client, dataSource)
//   return data ? data : null
// }

// handler
//   .use(middleware)
//   .use(cors)
//   .use(ensureReqBody)
//   .get(async (req, res) => {
//     const {
//       query: { clientNumber },
//     } = req

//     const authorization =
//       req.headers?.authorization && Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString()

//     console.log('=============================')
//     console.log({ authorization })
//     console.log(req.headers?.authorization)
//     const origin = authorization && authorization.split(':')[0]
//     const token = authorization && authorization.split(':')[1]
//     const saltedPassword = origin && saltHashPassword(origin).substring(0, 50)

//     if (!authorization || token !== saltedPassword) {
//       res.status(401).send({ error: 'Not authorized', user: null })
//       return
//     }

//     const vouchers = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsVouchersDebug')) || []
//     const clientVouchers = vouchers.filter(
//       (v) => v.clientno === clientNumber && !v.fetched && (v.status === 'redeemable' || v.status === 'cancelled'),
//     )
//     console.log({ clientVouchers })

//     const saveVouchersRef = await addClientDataSource(
//       req,
//       'mts-online.com',
//       'u0000',
//       'vmtsVouchersDebug',
//       vouchers.map((v) => {
//         if (v.clientno === clientNumber && (v.status === 'redeemable' || v.status === 'cancelled')) {
//           return { ...v, fetched: true }
//         } else {
//           return v
//         }
//       }),
//     )

//     res.statusCode = 200
//     res.setHeader('Content-Type', 'application/json')
//     res.json({
//       data: clientVouchers.map((v) => ({
//         code: v.code,
//         type: v.type,
//         createdAt: v.createdAt,
//         lastUpdatedAt: v.lastUpdatedAt,
//         status: v.status,
//         initialValue: v.initialValue,
//         currentValue: v.currentValue,
//         comments: v.comments,
//         language: v.language,
//         buyer: v.buyer,
//         transactions: v.transactions,
//       })),
//     })
//   })
//   .post(async (req, res) => {
//     // const {
//     //   query: { clientNumber },
//     //   body,
//     // } = req

//     // console.log('==================================')
//     // console.log({ body })

//     // const authorization =
//     //   req.headers?.authorization && Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString()

//     // const origin = authorization && authorization.split(':')[0]
//     // const token = authorization && authorization.split(':')[1]
//     // const saltedPassword = origin && saltHashPassword(origin).substring(0, 50)

//     // if (token !== saltedPassword) {
//     //   res.status(401).send({ error: 'Not authorized', user: null })
//     //   return
//     // }

//     // const vouchers = (await getClientDataSource(req, 'mts-online.com', 'u0000', 'vmtsVouchers')) || []
//     // const clientVouchers = vouchers
//     //   .filter((v) => v.clientno === clientNumber && v.status === 'redeemable')
//     //   .map((v) => ({ ...v, cancelledAt: null }))

//     // res.statusCode = 200
//     // res.setHeader('Content-Type', 'application/json')
//     // res.json({ data: clientVouchers })
//     res.json({ data: 4 })
//   })

// export default handler
