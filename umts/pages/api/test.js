import nextConnect from 'next-connect'
import isMongoId from 'validator/lib/isMongoId'
import middleware from '../../middlewares/middleware'
import { ObjectId } from 'mongodb'
import { insert, update } from '../../lib/mongoHelpers'

const handler = nextConnect()

handler.use(middleware)

const demoObj = {
  clientId: 'u0658',
  period: [{ arrival: '2022-08-21', departure: '2022-08-24' }],
  room: [{ code: '', title: '', adults: 2, children: 0, confirmed: 0 }],
  salutation: null,
  gender: '',
  firstname: 'giacomo',
  lastname: 'gaiano',
  email: 'giacomo966@tiscali.it',
  address: 'Italia, Salerno, Laspro3',
  zip: null,
  place: null,
  country: {},
  phone: '3316438692',
  language: 'it',
  confirmed: 0,
  channel: 'yesalps',
  dogs: 0,
  channelInfo: { channel: 'yesalps', createDateTime: '2022-07-05T11:40:32', uniqueId: { ID: '4626977', Type: '14' } },
  response: true,
  timestamp: 1656980200020,
}

handler.get(async (req, res) => {
  //   const { data, error } = await insert({ db: req.db, collection: 'channelRequests', document: demoObj })
  const { data, error } = await update({
    db: req.db,
    collection: 'channelRequests',
    query: { _id: ObjectId('62fe1ae26275a50483803d48') },
    document: { $set: { response: false } },
  })
  console.log(data)
  console.error(error.message)
  res.send(data)
})

export default handler
