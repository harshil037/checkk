import jwt from 'jsonwebtoken'
import { find } from '../utils/mongoHelpers'

export const isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token || req.header.Authorization?.replace('Bearer ', '')

  if (!token) {
    res.status(401).json({ error: 'Not authorized', data: null })
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  req.user = await find({ db: req.db, collection: 'users', find: { _id: decoded.user_id }, limit: 1 })

  next()
}

export const customRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Not Allowed to access this resource', data: null })
    }
    next()
  }
