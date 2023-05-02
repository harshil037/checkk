import { session, Store, MemoryStore } from 'next-session'
import connectMongo from 'connect-mongo'

/**
 *  If you get into an error cannot read property of undefined (reading Store)
 *  then change the version of next-session to "next-session": "3.3.2" in package.json
 *  and remove node_modules and package-lock.json and run npm install
 */

const MongoStore = connectMongo({ Store, MemoryStore })

export default function (req, res, next) {
  const mongoStore = new MongoStore({
    client: req.dbClient,
    stringify: false,
    ttl: 24 * 60 * 60,
  })
  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: {
      // the next line allows to use the session in non-https environments like
      // Next.js dev mode (http://localhost:3000)
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: 24 * 60 * 60,
    },
  })(req, res, next)
}
