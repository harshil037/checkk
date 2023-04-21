const protectedAPI = async (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authorized', data: null })
  } else {
    next()
  }
}

export default protectedAPI
