import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import { customRole, isLoggedIn } from '../../../middlewares/user'

const handler = nextConnect()

handler.use(middleware).use(isLoggedIn).use(customRole('admin'))

handler.get(async (req, res) => {
  res.status(200).json({ message: 'hello from products' })
})
