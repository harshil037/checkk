import nextConnect from 'next-connect'
import isMongoId from 'validator/lib/isMongoId'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import ensureReqBody from '../../../middlewares/ensureReqBody'
import { ObjectId } from 'mongodb'
import { getVoucherData, updateVoucherTransaction } from '../../../lib/db'
import { aggregate } from '../../../lib/mongoHelpers'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI).use(ensureReqBody)

handler.get(async (req, res) => {
  try {
    const { req_offSet, req_limit, req_search, req_sort, id, clientId } = req.query

    if (id) {
      const voucher = await getVoucherData(req, ObjectId(id))
      if (!voucher) {
        res.status(200).json({ success: false })
      } else {
        res.status(200).json({ success: true, voucher })
      }
    } else {
      let limit = req_limit ? parseInt(req_limit) : 500
      let skip = req_offSet ? parseInt(req_offSet) : 0
      let expr = (req_search && req_search.trim().replace(/ /g, '.*|.*')) || ''
      expr = `.*${expr}.*`
      let searchRegex = { $regex: expr, $options: 'i' }

      let query = req_search
        ? {
            $or: [
              { 'voucherItems.buyer.firstname': searchRegex },
              { 'voucherItems.buyer.lastname': searchRegex },
              { 'voucherItems.recipientMessage.name': searchRegex },
              { 'voucherItems.buyer.email': searchRegex },
              { 'voucherItems.code': searchRegex },
            ],
            paymentStatus: { $exists: true },
          }
        : { paymentStatus: { $exists: true } }

      if (clientId) query.clientId = clientId

      const vouchers = req_sort
        ? await aggregate({
            db: req.db,
            query,
            collection: 'productVmtsVouchers',
            skip,
            limit,
            sort: JSON.parse(req_sort),
          })
        : await aggregate({ db: req.db, query, collection: 'productVmtsVouchers', skip, limit })

      if (!vouchers || !vouchers.data) {
        res.status(200).json({ success: false })
      } else {
        res.status(200).json({ success: true, vouchers })
      }
    }
  } catch (e) {
    console.log({ e })
    res.status(500).send({ success: false, error: e.message })
  }
})

handler.patch(async (req, res) => {
  const { transactionItem } = req.body
  const _id = isMongoId(req.body._id) ? ObjectId(req.body._id) : nullvoucher

  const voucherData = await getVoucherData(req, _id)
  if (!voucherData) {
    res.status(404).send({ error: 'No voucher found', voucher: null })
    return
  }

  let changes = {}
  const options = { returnOriginal: false }
  if (transactionItem) {
    let transactions = voucherData?.transactions || []
    transactions.push(transactionItem)
    changes = { transactions }

    const result = await updateVoucherTransaction(req, _id, changes, options)
    res.status(200).json({
      error: result.error,
      transactions,
    })
  } else {
    const result = await updateVoucherTransaction(req, _id, changes, options)
    res.status(200).json({
      error: result.error,
      data: { status: 'passed' },
    })
  }
})

export default handler
