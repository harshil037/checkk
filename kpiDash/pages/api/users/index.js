import nextConnect from 'next-connect'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { find, insert } from '../../../utils/mongoHelpers'
import middleware from '../../../middlewares/middleware'

const handler = nextConnect()

handler.use(middleware)

handler.post(async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body

    if (!(email && password && firstname && lastname)) {
      res.status(400).json({ error: 'All fields required', data: null })
      return
    }

    const existingUser = await find({ db: req.db, collection: 'users', find: { email }, limit: 1 })

    if (existingUser.data) {
      res.status(401).json({ error: 'User already exists', data: null })
      return
    }

    const encryptedPassword = await bcrypt.hash(password, 10)

    const userData = await insert({
      db: req.db,
      collection: 'users',
      document: {
        firstname,
        lastname,
        email: email.toLowerCase(),
        password: encryptedPassword,
        role:'admin'
      },
    })

    const user = userData.data

    const token = jwt.sign(
      {
        user_id: user._id,
        email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: '2h',
      },
    )
    console.log("token : ", token)
    user.token = token

    user.password = undefined

    res.status(201).json({ data: user, error: null })
  } catch (error) {
    res.status(500).json({ error: error.message, data: null })
  }
})

export default handler
