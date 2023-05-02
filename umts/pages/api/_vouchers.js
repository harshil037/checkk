import nextConnect from 'next-connect'
import isMongoId from 'validator/lib/isMongoId'
import middleware from '../../middlewares/middleware'
import protectedAPI from '../../middlewares/protectedAPI'
import ensureReqBody from '../../middlewares/ensureReqBody'
import { extractUser } from '../../lib/api-helpers'
import { ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import {
  getVoucherData,
  createVoucherRecord,
  updateVoucherData,
  updateVoucherTransaction,
  deleteVoucherData,
  getUser,
} from '../../lib/db'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

handler.get(async (req, res) => {
  const {
    query: { id },
  } = req

  if (id) {
    if (id == '_new') {
      const voucher = {
        ps: 'Hobex',
        buyer: {
          firstName: 'Caroline',
          lastName: 'Hübscher-Wirth',
          email: 'caroline.huebscher-wirth@swiss.com',
        },
        customer: {
          salutation: 'Dear',
          name: 'mahommad',
          email: 'caroline.huebscher-wirth@swiss.com',
          message: 'hope you will enjoy',
        },
        code:
          'VMTS-' +
          new Date().toISOString().replace(/T.*/, '').split('-').join('-') +
          '-' +
          Math.floor(Math.random() * (999 - 100 + 1) + 100),
        clientNo: '',
        status: 'redeemable',
        language: 'de',
        basket: {
          totalAmount: 1000,
          voucherType: 'serviceVoucher',
          voucher: {
            items: [],
            totalAmount: 1000,
          },
          appointment: {
            items: [],
            totalAmount: 0,
          },
          personalData: {
            sendInvoice: false,
            firstName: 'Caroline',
            lastName: 'Hübscher-Wirth',
            email: 'caroline.huebscher-wirth@swiss.com',
            acceptPrivacy: '',
          },
        },
        id: uuidv4(),
        initialValue: '1000.00',
        currentValue: '1000.00',
        comments: 'NAME: Daniel | EMAIL: caroline.huebscher-wirth@swiss.com | VIA email | TO: me   ',
        email: 'caroline.huebscher-wirth@swiss.com',
        fetched: true,
      }
      res.status(200).json({
        error: null,
        voucher,
      })
    } else {
      const voucher = await getVoucherData(req, ObjectId(id))
      if (voucher) {
        res.status(200).json({
          error: null,
          voucher,
        })
      } else {
        res.status(400).json({})
      }
    }
  } else {
    const currentUser = extractUser(req)
    const nUser = await getUser(req, currentUser._id)

    const { superadmin, roles, _id } = currentUser

    const domains = superadmin
      ? [{}]
      : roles.reduce((acc, d) => {
          if (d.role === 'admin') {
            return d.domain !== '*' ? [...acc, { roles: { $elemMatch: { domain: d.domain } } }] : [...acc, {}]
          } else return [...acc, { _id }]
        }, [])

    const {
      query: { req_limit, req_offset, req_sort, req_search, req_domain_url },
    } = req

    if (req_limit) {
      const length = await req.db
        .collection('vouchers')
        .find(
          {
            code: { $regex: '.*' + req_search + '.*', $options: 'i' },
            $or: !superadmin
              ? [
                  {
                    clientNo: {
                      $in: nUser.clients.map((item) => {
                        return item.clientNumber
                      }),
                    },
                  },
                ]
              : [{}],
          },
          { $and: domains },
        )
        .count()

      await req.db
        .collection('vouchers')
        .find({
          code: { $regex: '.*' + req_search + '.*', $options: 'i' },
          $or: !superadmin
            ? [
                {
                  clientNo: {
                    $in: nUser.clients.map((item) => {
                      return item.clientNumber
                    }),
                  },
                },
              ]
            : [{}],
        })
        .collation({ locale: 'en' })
        .sort({ name: parseInt(req_sort) })
        .skip(parseInt(req_offset))
        .limit(parseInt(req_limit))
        .toArray((error, result) => {
          if (error) {
            res.status(500).json({ error, domains: null, length: 0 })
          } else {
            res.status(200).json({
              error: null,
              vouchers: result,
              length: length,
            })
          }
        })
    } else {
      await req.db
        .collection('vouchers')
        .find({ $and: domains })
        .toArray((error, result) => {
          if (error) {
            res.status(500).json({ error, users: null })
          } else {
            const vouchers = result.map(({ password, ...user }) => user)
            res.status(200).json({
              error: null,
              vouchers,
            })
          }
        })
    }
  }
})

handler.post(async (req, res) => {
  const currentUser = extractUser(req)
  const { superadmin, roles, clients } = currentUser

  if (!superadmin) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }

  const _id = ObjectId()
  const transactionDate = new Date().toISOString()
  const document = {
    _id,
    ...req.body,
    transactions: [
      {
        id: uuidv4(),
        type: 'sale',
        createdAt: transactionDate,
        amount: req.body.initialValue,
      },
    ],
    createdAt: transactionDate,
    lastUpdatedAt: transactionDate,
  }

  const { data, error } = await createVoucherRecord(req, document)
  res.status(201).send({
    error,
    data,
  })
})

handler.put(async (req, res) => {
  const currentUser = extractUser(req)
  const { superadmin, roles, clients } = currentUser

  if (!superadmin) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }

  const _id = isMongoId(req.body._id) ? ObjectId(req.body._id) : null
  const { _id: id, ...voucherData } = req.body
  voucherData.lastUpdatedAt = new Date().toISOString()
  try {
    const { data, error } = await updateVoucherData(req, _id, voucherData, { returnOriginal: false })
    res.status(200).json({
      error,
      data,
    })
  } catch (e) {
    console.log(e)
  }
})

handler.patch(async (req, res) => {
  const currentUser = extractUser(req)
  const { superadmin, roles, clients } = currentUser

  const { transactionItem } = req.body
  const _id = isMongoId(req.body._id) ? ObjectId(req.body._id) : null

  if (!superadmin) {
    res.status(401).send({ error: 'Not authorized', user: null })
    return
  }

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

handler.delete(async (req, res) => {
  const currentUser = extractUser(req)
  const { superadmin, roles } = currentUser
  let result
  const { ids, isMul } = req.body

  if (isMul && isMul == true) {
    result = await deleteVoucherData(req, _id, isMul)
  } else {
    const _id = isMongoId(req.body._id) ? ObjectId(req.body._id) : null

    if (!_id) {
      res.status(400).send({ error: 'Missing or non-valid _id field', voucher: null })
      return
    }

    const voucher = await getVoucherData(req, _id)

    if (!voucher) {
      res.status(404).send({ error: 'No voucher found', voucher: null })
      return
    }
    result = await deleteVoucherData(req, _id)
  }
  if (result && result.data > 0) {
    res.status(202).json({
      error: result.error,
      data: 'Voucher removed',
    })
  } else {
    res.status(500).json({
      error: "Couldn't remove a voucher",
      data: result.error,
    })
  }
})

const authorizeUserRoles = (targetRoles, roles, superadmin, user) =>
  targetRoles.reduce((acc, r) => {
    const userDomain = roles.find((d) => d.domain === r.domain)
    if (!acc) return false
    if (superadmin || (userDomain && userDomain.role === 'admin' && !user.superadmin)) {
      return [...acc, r]
    } else return false
  }, [])

const authorizeUserClients = (targetClients, clients, superadmin) =>
  targetClients &&
  targetClients.reduce((acc, r) => {
    const userClient = clients.find((c) => c === r._id)
    if (!acc) return false
    if (superadmin || userClient) {
      return [...acc, r]
    } else return false
  }, [])

const authorizeRoleChange = (superadmin, targetRole) => (superadmin ? targetRole : false)

export default handler
