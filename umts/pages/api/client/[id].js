import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'

import { update, replace, remove, insert, find } from '../../../lib/mongoHelpers'
import { ObjectId } from 'mongodb'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)

export default async (req, res) => {
  const db = req.db

  if (req.method === 'POST') {
    const {
      query: { collection, id: method },
      body: document,
    } = req
    if (method === 'new') {
      const result = await insert({ db, collection, document })
      res.json(result)
    }
  }

  if (req.method === 'PATCH') {
    const {
      query: { collection, id },
      body,
    } = req
    const document = {
      $set: body,
    }
    const result = await update({
      db,
      collection,
      query: { _id: id },
      document,
      options: { returnOriginal: false },
    })
    res.json(result)
  }

  if (req.method === 'PUT') {
    const {
      query: { collection, id },
      body: document,
    } = req
    const result = await replace({
      db,
      collection,
      query: { _id: ObjectId(id) },
      document,
      options: { returnOriginal: false },
    })
    res.json(result)
  }

  if (req.method === 'GET') {
    const {
      query: { collection, id },
    } = req
    if (id === 'all') {
      res.json(await find({ db, collection }))
    } else {
      res.json(await find({ db, collection, find: { _id: ObjectId(id) }, limit: 1 }))
    }
  }

  if (req.method === 'DELETE') {
    const {
      query: { collection, id },
    } = req
    const document = { _id: ObjectId(id) }
    res.json(await remove({ db, collection, document }))
  }
}
