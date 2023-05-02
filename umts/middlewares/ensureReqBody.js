import { isEmpty } from '../lib/utils'

const ensureReqBody = (req, res, next) => {
  if ((req.body && !isEmpty(req.body)) || req.method === 'GET' || req.method === 'DELETE') {
    next()
  } else {
    res.status(422).json({ error: 'Missing request body', data: null })
  }
}

export default ensureReqBody
