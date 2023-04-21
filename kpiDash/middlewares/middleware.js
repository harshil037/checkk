import cookieParser from 'cookie-parser'
import nextConnect from 'next-connect'
import database from './database'

const middleware = nextConnect()

middleware.use(cookieParser()).use(database)

export default middleware
