import { getLoginUser } from '../lib/db'

const anonymousAPI = async (req, res, next) => {
  const anonymousToken = req.headers['x-anonymous-token']
  if (!req.user && typeof anonymousToken != 'undefined' && anonymousToken != '') {
    try {
      const data = await getLoginUser(req, anonymousToken)
      req.user = data
      next()
    } catch (er) {
      next()
    }
  } else {
    next()
  }
}

export default anonymousAPI
