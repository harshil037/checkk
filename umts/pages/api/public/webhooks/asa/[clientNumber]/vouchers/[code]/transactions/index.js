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

// import cors from '../../../../../../../../../middlewares/cors'
// import middleware from '../../../../../../../../../middlewares/middleware'
// // import protectedAPI from '../../../../../middlewares/protectedAPI'
// import ensureReqBody from '../../../../../../../../../middlewares/ensureReqBody'
// import { getClientDataSource, addClientDataSource } from '../../../../../../../../../lib/db'
// import { getKeyFromPassword, getSalt, encrypt, decrypt, saltHashPassword } from '../../../../../../../../../lib/crypto'
// // import { getClient, getDomain } from '../../../../../lib/db'
// import { v4 as uuidv4 } from 'uuid'

// const handler = nextConnect()

// const getClientCredientals = async (req, domain, client, dataSource) => {
//   const data = await getClientDataSource(req, domain, client, dataSource)
//   return data ? data : null
// }

// handler
//   .use(middleware)
//   .use(cors)
//   .use(ensureReqBody)
//   .post(async (req, res) => {
//     const {
//       query: { clientNumber, code },
//       body,
//     } = req

//     console.log('==================================')
//     console.log({ body })

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

//     console.log({ vouchers })

//     const now = new Date(Date.now()).toISOString()
//     const value = parseFloat(body.amount || 0)
//       .toFixed(2)
//       .toString()

//     const transaction = {
//       id: uuidv4(),
//       type: body.type,
//       createdAt: now,
//       amount: value,
//       comment: body.comment,
//     }

//     console.log({ transaction })
//     const saveVouchersRef = await addClientDataSource(
//       req,
//       'mts-online.com',
//       'u0000',
//       'vmtsVouchers',
//       vouchers.map((v) => {
//         if (v.code === code && v.clientno === clientNumber) {
//           const currentValueFloat = parseFloat(v.value) - parseFloat(body.amount)
//           const status = currentValueFloat <= 0 ? 'REDEEMED' : v.status
//           const currentValue = currentValueFloat.toFixed(2).toString()
//           return {
//             ...v,
//             fetched: false,
//             currentValue,
//             status,
//             lastUpdatedAt: now,
//             transactions: [...v.transactions, transaction],
//           }
//         } else {
//           return v
//         }
//       }),
//     )

//     // res.statusCode = 201
//     // res.setHeader('Content-Type', 'application/json')
//     // res.json({ ...clientVoucher, type: 'redemption' })
//     res.statusCode = 201
//     res.setHeader('Content-Type', 'application/json')
//     res.json({ ...transaction })
//   })

// export default handler
