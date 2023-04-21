const path = require('path')
import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import protectedAPI from '../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../middlewares/ensureReqBody'
import ejs from 'ejs'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

handler.post((req, res) => {
  try {
    // const staticPath = '/home/sagar.bhatt/Desktop/projects/u.mts/public/voucher.html'
    const htmlTemplatePath = path.join(__dirname, `../../../../../voucher.html`)
    console.log(htmlTemplatePath)
    // console.log(htmlTemplatePath)
    let temp = ''
    // ejs.renderFile(htmlTemplatePath)

    ejs.renderFile(htmlTemplatePath, JSON.parse(req.body), (err, str) => {
      //use str variable to send email
      if (err) {
        console.log('err', err)
        return res.send('Sorry, Preview not available!')
      }
      // console.log('str', str)
      temp = str
      // console.log('temp', temp)

      res.send(temp)
    })
  } catch (e) {
    console.log(e)
  }
})

export default handler
