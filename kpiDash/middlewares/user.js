import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { find } from '../utils/mongoHelpers'

export const isLoggedIn = async (req, res, next) => {
  if(!req.cookies?.token) return

  const token = req.cookies?.token || req.header?.Authorization?.replace('Bearer ', '')

  if (!token) {
    res.status(401).json({ error: 'Not authorized', data: null })
    return
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  // req.user = await find({ db: req.db, collection: 'users', find: { _id: decoded.user_id }, limit: 1 })
  req.user = await find({
    db: req.db,
    collection: 'users',
    find: { _id: typeof decoded.user_id != 'object' ? ObjectId(decoded.user_id) : decoded.user_id },
    limit: 1,
  })
  next()
}

export const customRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.data.role)) {
      res.status(403).json({ error: 'Not Allowed to access this resource', data: null })
    }
    next()
  }
