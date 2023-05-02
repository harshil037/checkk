import nextConnect from 'next-connect'

const handler = nextConnect()
handler
  .use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888')

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true)
  })
  .get(async (req, res) => {
    res.status(200).json({ name: 'Arse' })
  })

export default handler
