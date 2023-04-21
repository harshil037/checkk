import { createProxyMiddleware } from 'http-proxy-middleware'

const apiProxy = createProxyMiddleware({
  target: 'https://worker.mts-online.com',
  changeOrigin: true,
  secure: false,
})

export default function (req, res) {
  const origin = req.headers
  console.log({ origin })
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

// import cors from '../../../../../middlewares/cors'
// import middleware from '../../../../../middlewares/middleware'
// // import protectedAPI from '../../../../middlewares/protectedAPI'
// import ensureReqBody from '../../../../../middlewares/ensureReqBody'
// // import { getClient, getDomain } from '../../../../lib/db'

// const fakeData = [
//   {
//     ps: 'Hobex',
//     code: 'vmts-3781497174',
//     clientno: 'u0724',
//     status: 'redeemable ',
//     type: 'VOUCHER',
//     language: 'de',
//     createdAt: '2021-01-28',
//     lastUpdatedAt: '2021-01-28T11:25:17.366Z',
//     basket: null,
//     initialValue: '10.50',
//     currentValue: '10.50',
//   },
// ]

// const exampleData = {
//   data: [
//     {
//       code: '23',
//       type: 'VALUE',
//       createdAt: '2021-01-28',
//       lastUpdatedAt: '2021-01-28T11:25:17.366Z',
//       validUntil: '2022-10-13',
//       status: 'redeemable',
//       initialValue: '300',
//       currentValue: '250',
//     },
//     {
//       code: '89',
//       type: 'SPA',
//       createdAt: '2021-01-28',
//       lastUpdatedAt: '2021-01-28T11:25:17.366Z',
//       validUntil: '2023-04-05',
//       status: 'redeemable',
//       initialValue: '500',
//       currentValue: '450',
//     },
//   ],
//   meta: {},
// }

// const handler = nextConnect()

// // endpoint}/vouchers?expandTransactions={boolean}&updatedSince={timestamp}&updatedUntil=

// handler
//   .use(middleware)
//   .use(cors)
//   .use(ensureReqBody)
//   .get(async (req, res) => {
//     res.json({ data: fakeData })
//     // res.json(exampleData)
//   })
//   .post(async (req, res) => {
//     console.log('POST')
//     const {
//       query: { expandTransactions },
//       headers: { origin },
//       body,
//     } = req
//     console.log({ body })
//     res.statusCode = 200
//     res.setHeader('Content-Type', 'application/json')
//     // res.json({ data: fakeData })
//     res.json(exampleData)
//   })

// export default handler
