import nextConnect from 'next-connect'
import cors from '../../../../../../middlewares/cors'
import middleware from '../../../../../../middlewares/middleware'
import {
    getFacebookKeys,
    updateFacebookToken
} from '../../../../../../lib/db'
import { URLSearchParams } from 'url'


const handler = nextConnect()

const fbGraphUrl = 'https://graph.facebook.com/';

handler.use(middleware).use(cors)

handler.get(async (req, res) => {
    const {
        query: {
            clientId,
            domainId
        },
    } = req


    var clientFacebookKeys = await getFacebookKeys(req, clientId, domainId);
    
    const longLivedUserAccessToken = await fetch( //Fetching New longLivedUserAccessToken
        `${fbGraphUrl}oauth/access_token?` +
        new URLSearchParams({
            grant_type: "fb_exchange_token",
            client_id: clientFacebookKeys.appId,
            client_secret: clientFacebookKeys.appSecret,
            fb_exchange_token: clientFacebookKeys.longLivedUserAccessToken
        }), {
            method: 'GET',
        },
    )

    var result = await longLivedUserAccessToken.json()

    var updateToken = await updateFacebookToken(req, clientFacebookKeys._id, domainId, result.access_token) //Updating the New longLivedUserAccessToken in DB

    var pageDataResponse = await getInstagramPageData(result.access_token, clientFacebookKeys.instagramId) //fetching Instagram Data

    if (pageDataResponse) { //Returning Json Instagram Posts as response
        res.status(200).send({
            data: pageDataResponse
        })
    } else {
        res.status(500).send({
            error: 'Error in fetching data'
        })
    }
    
})


async function getInstagramPageData(access_token, instagramId) {
    try {
        const data = await fetch(
            `${fbGraphUrl}${instagramId}?` +
            new URLSearchParams({
                fields: "name,profile_picture_url,media{permalink,timestamp,media_type,media_url,comments,like_count,children{media_url,thumbnail_url}}",
                access_token: access_token,
            }), {
                method: 'GET',
            },
        )
        
        var pageData = await data.json()
        return pageData;

    } catch (error) {
        res.status(500).send({
            error: 'Error in fetching data'
        })
        return
    }
};


export default handler