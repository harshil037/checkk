const ensureCredientals = (req, res, next) => {
  if (req.body && (typeof req.body.password !== 'string' || typeof req.body.email !== 'string')) {
    res.status(401).send({ error: 'Not authorized', user: null })
  } else {
    next()
  }
}

export default ensureCredientals
