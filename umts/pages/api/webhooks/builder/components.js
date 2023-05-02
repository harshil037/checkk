import Cors from 'cors'
import nextConnect from 'next-connect'
import passport from '../../../../lib/passport'
import middleware from '../../../../middlewares/middleware'
import ensureReqBody from '../../../../middlewares/ensureReqBody'
import ensureCredientals from '../../../../middlewares/ensureCredientals'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(ensureReqBody)
  .use(ensureCredientals)

const cors = Cors({
  methods: ['POST', 'HEAD'],
})

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

// addId

handler.post(passport.authenticate('local'), async (req, res) => {
  const { email, password, ...components } = req.body
  await req.db.collection('library').drop(async (error, status) => {
    if (error && error.code !== 26) res.json({ error: 'Error updating components library: ' + error })
    if (status || error.code === 26) {
      await req.db
        .collection('library')
        .insertOne(components)
        .then(() => {
          req.logOut()
          res.json({ message: 'ok', error: null })
        })
    }
  })
})

export default handler
