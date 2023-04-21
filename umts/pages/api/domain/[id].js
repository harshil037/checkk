import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import { ObjectId } from 'mongodb'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI)

// get domain object by id
handler.get(async (req, res) => {
  const {
    query: { id },
  } = req
  let data = await req.db.collection('domains').findOne({ _id: ObjectId(id) })

  //get addresses from linked clients
  const client1 = await req.db
    .collection('clients')
    .aggregate([
      { $unwind: '$addresses' },
      { $match: { domains: { $in: [ObjectId(id)] } } },
      { $group: { _id: '$_id', addresses: { $push: '$addresses' } } },
    ])
    .toArray()

  // convert to array list and adding clients addresses in array named 'addresses'
  let addresses = []

  for (let index = 0; index < client1.length; index++) {
    let add = client1[index].addresses.map((item) => {
      let dData = Object.entries(item).reduce((item1, xx) => {
        item1 = [...item1, xx]
        return item1
      }, [])
      addresses = [...addresses, ...dData]
    })
  }

  //set already saved address to new list as selected address
  let finalAddresses = []
  if (data?.addressItems) {
    finalAddresses = data.addressItems.map((item) => {
      const [name, obj] = addresses.find(([x, y]) => y.id == item)
      addresses.splice(
        addresses.findIndex(([x, y]) => y.id == item),
        1,
      )
      return { title: name, value: item, isSelected: true }
    })
  }

  // get unselected address
  finalAddresses = [
    ...finalAddresses,
    ...addresses.map((item) => {
      const [name, obj] = item
      return { title: name, value: obj.id, isSelected: false }
    }),
  ]

  if (data) data.addresses = finalAddresses

  if (data && !data.hasOwnProperty('notes')) {
    data.notes = []
  }
  if (data && !data.hasOwnProperty('aliases')) {
    data.aliases = []
  }
  res.json({ domain: data })
})

export default handler
