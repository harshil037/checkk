import Cors from 'cors'
import { getDomains } from '../lib/db'

const setCors = ({ origins }) =>
  Cors({
    origin: origins,
    methods: ['PUT', 'POST', 'OPTIONS'],
  })

const corsCheck = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

const cors = async (req, res, next) => {
  try {
    const origins = await getDomains(req)
    let aliases = []
    const urls = origins.reduce(
      (acc, o) => {
        if (o.aliases && o.aliases.length > 0) {
          aliases = aliases.concat(o.aliases)
        }

        return [...acc, `http://${o.url}`, `https://${o.url}`]
      },
      [
        /\.mts-online\.com$/,
        /\.localhost$/,
        /\.netlify\.app$/,
        'http://localhost:8888',
        'http://localhost:3000',
        'http://10.10.10.119:3004',
        'http://10.10.10.119:3005',
      ],
    )

    aliases.forEach((element) => {
      urls.push(`http://${element}`, `https://${element}`)
    })
    await corsCheck(req, res, setCors({ origins: urls }))
    next()
  } catch (error) {
    res.status(401).json({ error: 'Not authorized', data: null })
  }
}

export default cors
