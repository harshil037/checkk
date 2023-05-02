import nextConnect from 'next-connect'
import cors from '../../../../../../../middlewares/cors'
import middleware from '../../../../../../../middlewares/middleware'
import ensureReqBody from '../../../../../../../middlewares/ensureReqBody'
import {
  getVmtsVoucherCheckout,
  updateVmtsVoucher,
  saveApiLogs,
  getClientDataSource
} from '../../../../../../../lib/db'
import {saltHashPassword } from '../../../../../../../lib/crypto'

const handler = nextConnect()

handler.use(middleware).use(cors)
.use(ensureReqBody)

// get asa - mergeClients info from client datasource
const getClientCredientals = async (req, domain, client, dataSource) => {
  const data = await getClientDataSource(req, domain, client, dataSource)
  return data ? data : null
}

handler.get(async (req, res) => {
  const {
    query: { clientId },
  } = req

  const authorization =
  req.headers?.authorization && Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString()

  const origin = authorization && authorization.split(':')[0]
  const token = authorization && authorization.split(':')[1]
  const saltedPassword = origin && saltHashPassword(origin).substring(0, 50)
  if (!authorization || token !== saltedPassword) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }
  //  other clients to merge - get it from client data source - asa.mergeClients
  const asaDataSource = clientId && (await getClientCredientals(req, req?.headers?.origin, clientId, 'asa'))
  const clientArr = asaDataSource?.mergeClients.split(',') || [clientId]

  const vouchers = await getVmtsVoucherCheckout(req, {
    clientId:{'$in': clientArr}, paymentMode:'live',
    'voucherItems.status': { $in: ['redeemable', 'cancelled'] },
  })
  const saveVouchersRef = await updateVmtsVoucher(
    req,
    { clientId:{'$in': clientArr}, paymentMode:'live' , "voucherItems.status":{$in: ["redeemable", "cancelled"]}},
    {"voucherItems.$.fetched": true}
  )
  console.log("saveVouchersRef",saveVouchersRef)

  const clientVouchers = vouchers?.reduce((acc, curr) => {
    return [...acc, ...curr.voucherItems.filter((x) => !x.fetched && (x.status === 'redeemable' || x.status === 'cancelled'))]
  }, [])
  saveApiLogs(req, {
    clientId:clientArr,
    product : "vmts",
    headers: req.headers,
    queryParams: req.query,
    timestamp: Date.now(),
    createdAt: new Date(Date.now()),
    url: req.url,
    method:req.method,
    endpoint: `api/vmts/webhooks/asa/[clientId]/vouchers`,
    ...(req?.body ? {body:req.body}:{}),
    response : {
      data: clientVouchers.map((v) => ({
        code: v.code,
        type: v.type,
        createdAt: v.createdAt,
        lastUpdatedAt: v.lastUpdatedAt,
        status: v.status,
        initialValue: v.initialValue,
        currentValue: v.currentValue,
        comments: v.comments,
        language: v.language,
        buyer: v.buyer,
        transactions: v.transactions,
      }))
    }
  })

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({
    data: clientVouchers.map((v) => ({
      code: v.code,
      type: v.type,
      createdAt: v.createdAt,
      lastUpdatedAt: v.lastUpdatedAt,
      status: v.status,
      initialValue: v.initialValue,
      currentValue: v.currentValue,
      comments: v.comments,
      language: v.language,
      buyer: v.buyer,
      transactions: v.transactions,
    })),
  })
})

handler.post(async (req, res) => {
  const {
    query: { clientId },
    body,
  } = req

  console.log('==================================')
  console.log({ body })

  const authorization =
    req.headers?.authorization && Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString()

  const origin = authorization && authorization.split(':')[0]
  const token = authorization && authorization.split(':')[1]
  const saltedPassword = origin && saltHashPassword(origin).substring(0, 50)
  if (!authorization || token !== saltedPassword) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }

  //  other clients to merge - get it from client data source - asa.mergeClients
  const asaDataSource = clientId && (await getClientCredientals(req, req?.headers?.origin, clientId, 'asa'))
  const clientArr = asaDataSource?.mergeClients.split(',') || [clientId]

  const vouchers = await getVmtsVoucherCheckout(req, { clientId:{'$in': clientArr}, paymentMode:'live' , 'voucherItems.status': { $in: ['redeemable'] } })
  const clientVouchers = vouchers?.reduce((acc, curr) => {
    return [...acc, ...curr.voucherItems.filter((x) => !x.fetched && x.status === 'redeemable')]
  }, [])

  saveApiLogs(req, {
    clientId:clientArr,
    product : "vmts",
    headers: req.headers,
    queryParams: req.query,
    timestamp: Date.now(),
    createdAt: new Date(Date.now()),
    url: req.url,
    method:req.method,
    endpoint: `api/vmts/webhooks/asa/[clientId]/vouchers`,
    ...(req?.body ? {body:req.body}:{}),
    response : {
      data: clientVouchers
    }
  })
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({ data: clientVouchers })
})

export default handler
