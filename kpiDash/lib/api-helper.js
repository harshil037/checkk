const extractUser = (req) => {
  if (!req.user) return null

  const { firstname, lastname, email, password } = req.user
  return { firstname, lastname, email, password }
}

export { extractUser }
