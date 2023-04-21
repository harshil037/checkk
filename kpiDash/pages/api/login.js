import nextConnect from 'next-connect'
import jwt from 'jsonwebtoken'
import { find } from '../../../utils/mongoHelpers'
import middleware from '../../middlewares/middleware'

const handler = nextConnect()

handler.use(middleware)

handler.post(async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'email and password required', data: null })
    } else {
      res.status(200).json({
        data: { email, password },
        error: null,
      })
    }
    // get user from DB
    const userData = await find({ db: req.db, collection: 'users', find: { email }, limit: 1 })

    const user = userData.data

    if (!user) {
      res.status(400).json({ error: 'user not registerd', data: null })
    }

    const isPasswordValid = await bcrypt.compare(user.password, password)

    if (!isPasswordValid) {
      res.status(400).json({ error: 'password incorrect', data: null })
    }

    const token = jwt.sign(
      {
        user_id: user._id,
        email: user.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: '2h',
      },
    )

    const options = {
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
      httpOnly: true,
    }

    user.password = undefined

    res.status(200).cookie('token', token, options).json({
      data: {
        token,
        user,
      },
      error: null,
    })
  } catch (error) {
    res.status(500).json({ error: error.message, data: null })
  }
})

export default handler
