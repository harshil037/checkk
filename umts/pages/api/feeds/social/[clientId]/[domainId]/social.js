import nextConnect from 'next-connect'
import cors from '../../../../../../middlewares/cors'
import middleware from '../../../../../../middlewares/middleware'
import {
    getClientDataSource,
    getSocialWallData
} from '../../../../../../lib/db'

const handler = nextConnect()

handler.use(middleware).use(cors)
handler.get(async (req, res) => {
    const {
        query: {
            clientId,
            domainId,
            req_limit,
            req_offset,
            req_social_handles
        },
    } = req
    const clientData = await getClientDataSource(req, domainId, clientId, 'facebook')
    let postsToReturn = [];
    if (clientData) {
        postsToReturn = await getSocialWallData(req, clientData._id, clientData.clientId, req_offset, req_limit, req_social_handles)
    }
    res.status(200).send({ //Returning Data from DB
        data: postsToReturn
    });
})

export default handler