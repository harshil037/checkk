import nextConnect from 'next-connect'
import cors from '../../../../../../../../../middlewares/cors'
import middleware from '../../../../../../../../../middlewares/middleware'
import ensureReqBody from '../../../../../../../../../middlewares/ensureReqBody'
import { saltHashPassword } from '../../../../../../../../../lib/crypto'
import {saveApiLogs, getClientDataSource} from "../../../../../../../../../lib/db"
import { v4 as uuidv4 } from 'uuid'

const handler = nextConnect()

// get asa - mergeClients info from client datasource
const getClientCredientals = async (req, domain, client, dataSource) => {
  const data = await getClientDataSource(req, domain, client, dataSource)
  return data ? data : null
}

handler
  .use(middleware)
  .use(cors)
  .use(ensureReqBody)
  .post(async (req, res) => {
    const {
      query: { clientId, code },
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

    const now = new Date(Date.now()).toISOString()
    const value = parseFloat(body.amount || 0)
      .toFixed(2)
      .toString()

    const transaction = {
      id: uuidv4(),
      type: body.type,
      createdAt: now,
      amount: value,
      comment: body.comment,
    }

    console.log({ transaction })

    const saveVouchersRef = await req.db.collection('productVmtsVouchers').find({clientId:{'$in': clientArr}, paymentMode:'live', 'voucherItems.code':code}).forEach((doc)=>{
      doc.voucherItems.forEach((item)=>{
        if(item.code === code){
          item.currentValue =( parseFloat(item.currentValue) - parseFloat(body.amount)).toFixed(2)
          item.fetched= false
          item.lastUpdatedAt=now
          item.transactions = [...item.transactions, transaction]
          if(item.currentValue <=0){
            item.status = 'REDEEMED'
          }
        }
      })
      req.db.collection('productVmtsVouchers').updateOne({clientId:{'$in': clientArr}, paymentMode:'live','voucherItems.code':code}, {$set:doc})
    })
    saveApiLogs(req, {
      clientId:clientArr,
      product : "vmts",
      headers: req.headers,
      queryParams: req.query,
      timestamp: Date.now(),
      createdAt: new Date(Date.now()),
      url: req.url,
      method:req.method,
      endpoint: `api/vmts/webhooks/asa/[clientId]/vouchers/[code]/transactions`,
      ...(req?.body ? {body:req.body}:{}),
      response : { ...transaction }
    })
    res.statusCode = 201
    res.setHeader('Content-Type', 'application/json')
    res.json({ ...transaction })
  })

export default handler
