export const validate = (schema) => (req, res, next) => {
  try {
    if (req.method === 'GET') {
      next()
    } else {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const { error } = schema.validate(data)
      if (error) {
        res.status(422).send({ succes: false, message: error.details[0].message })
      } else {
        next()
      }
    }
  } catch (e) {
    res.status(500).send({ success: false })
  }
}
