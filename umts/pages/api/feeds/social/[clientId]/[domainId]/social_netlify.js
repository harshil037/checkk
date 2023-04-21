import nextConnect from 'next-connect'
import cors from '../../../../../../middlewares/cors'
import middleware from '../../../../../../middlewares/middleware'
import {
    updateFacebookToken,
    getClientDataSource,
    getSocialWallData,
    storeSocialWallData
} from '../../../../../../lib/db'
import {
    URLSearchParams
} from 'url'


const handler = nextConnect()

const fbGraphUrl = 'https://graph.facebook.com/';
const netlifyUrl = 'https://eloquent-lovelace-28c6ba.netlify.app/.netlify/functions/index/';

const formattedFbData = [];
const formattedInstagramData = [];

handler.use(middleware).use(cors)

handler.get(async (req, res) => {
    const {
        query: {
            clientId,
            domainId,
            limit,
            offset,
            social_handles
        },
    } = req

    const clientData = await getClientDataSource(req, domainId, clientId, 'facebook')

    //overriding params from url
    if(limit) {
        clientData.limit = limit;
    }
    if(offset) {
        clientData.offset = offset;
    }
    if(social_handles) {
        clientData.social_handles = social_handles;
    }

    var numOfPostsAsked = parseInt(clientData.limit) + parseInt(clientData.offset);

    const socialWallDataDb = await getSocialWallData(req, clientData._id, clientData.clientId)

    if(socialWallDataDb) {
        var timeSinceUpdate = Math.abs(new Date(socialWallDataDb.lastUpdatedAt) - new Date());
        var minuteSinceUpdate = Math.floor((timeSinceUpdate/1000)/60)
    }



    if(socialWallDataDb && minuteSinceUpdate < 30) {
        var postsInDb = socialWallDataDb.socialwallData.length

        if(postsInDb >= parseInt(clientData.offset) && postsInDb >= numOfPostsAsked) {
            var postsToReturn = socialWallDataDb.socialwallData.slice( clientData.offset, numOfPostsAsked )
            res.status(200).send({  //Returning Data from DB
                data: postsToReturn
            });
            res.end();
        } else {
            var netlifyResponse = await getDatafromNetlify(req, res, clientData)
            if(netlifyResponse.status = 200) {
                if(netlifyResponse.data) {
                    await updateFacebookToken(req, clientData._id, netlifyResponse.refreshToken) //Storing the new Token to DB
                    await storeSocialWallData(req, clientData._id, clientData.clientId, netlifyResponse.data)

                    if(netlifyResponse.data.length >= parseInt(offset) && netlifyResponse.data.length >= numOfPostsAsked) {
                        var postsToReturn = netlifyResponse.data.slice( clientData.offset, numOfPostsAsked )
                        res.status(200).send({
                            data: postsToReturn
                        })
                        res.end();
                    } else {
                        res.status(400).send({
                            error: "No more posts to show, Try asking less no of Posts !!"
                        })
                        res.end();
                    }
                }
            }else {
                res.status(400).send({
                    error: "Error in fetching Data"
                })
                res.end();
            }
        }
    } else {
        // console.log("1 Call to Netlify")
        var netlifyResponse = await getDatafromNetlify(req, res, clientData)
        // console.log("3 Netlify Responded",netlifyResponse)
        if(netlifyResponse.status = 200) {
            if(netlifyResponse.data) {
                await updateFacebookToken(req, clientData._id, netlifyResponse.refreshToken) //Storing the new Token to DB
                await storeSocialWallData(req, clientData._id, clientData.clientId, netlifyResponse.data)
                var postsToReturn = netlifyResponse.data.slice( clientData.offset, numOfPostsAsked )
                res.status(200).send({
                    data: postsToReturn
                })
                res.end();
            }
        } else {
            res.status(400).send({
                error: "Error in fetching Data"
            })
            res.end();
        }

    }



})



/****** Fetching Data from Netlify ******/
async function getDatafromNetlify(req, res, clientData) {
    const netRes = await fetch(
        `${netlifyUrl}/social?` +
        new URLSearchParams(clientData).toString(), {
            method: 'GET',
        },
    )
    var netlifyResponse = await netRes.json()
    // console.log("2 Netlify Response",netlifyResponse)
    return netlifyResponse;
};


export default handler