import nextConnect from 'next-connect'
import cors from '../../../../../../../../../../middlewares/cors'
import middleware from '../../../../../../../../../../middlewares/middleware'
import { saltHashPassword } from '../../../../../../../../../../lib/crypto'
import {saveApiLogs, getClientDataSource} from "../../../../../../../../../../lib/db"

const handler = nextConnect()

// get asa - mergeClients info from client datasource
const getClientCredientals = async (req, domain, client, dataSource) => {
  const data = await getClientDataSource(req, domain, client, dataSource)
  return data ? data : null
}

handler
  .use(middleware)
  .use(cors)
  .delete(async (req, res) => {
    const {
      query: { clientId, code, id },
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

    const now = new Date(Date.now()).toISOString()

    const saveVouchersRef = await req.db
      .collection('productVmtsVouchers')
      .find({ clientId:{'$in': clientArr}, 'voucherItems.code': code })
      .forEach((doc) => {
        doc.voucherItems.forEach((item) => {
          if (item.code === code) {
            item.fetched = false
            item.status = 'cancelled'
            item.lastUpdatedAt = now
            item.transactions = [
              ...item.transactions,
              {
                cancelledAt: now,
                amount: item.currentValue,
                createdAt: now,
              },
            ]
          }
        })
        req.db.collection('productVmtsVouchers').updateOne({ clientId:{'$in': clientArr}, 'voucherItems.code': code },{$set:doc})
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
        endpoint: `api/vmts/webhooks/asa/[clientId]/vouchers/[code]/transactions/[id]`,
        ...(req?.body ? {body:req.body}:{}),
        response : {success:true}
      })

    res.statusCode = 204
    res.setHeader('Content-Type', 'application/json')
    res.json()
  })

export default handler
