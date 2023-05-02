import { supportedActions } from '../validations/alpinebitsSupportedActions'

export function resolveHandshakingRequest (parsedReqJson) {
    let response
    let echoData = (parsedReqJson?.OTA_PingRQ?.EchoData?.[0] != ' ' && parsedReqJson?.OTA_PingRQ?.EchoData?.[0] != null) ? JSON.parse(parsedReqJson?.OTA_PingRQ?.EchoData?.[0]) : parsedReqJson?.OTA_PingRQ?.EchoData?.[0];

    let requestActions = echoData?.versions?.[0].actions

    let responseActions = [];
    if (requestActions && requestActions.length > 0) {
        requestActions.forEach((act) => {
        if (supportedActions.includes(act.action)) {
            responseActions.push(JSON.stringify(act))
        }
        act?.supports?.forEach((reqSup) => {
            if (supportedActions.includes(reqSup)) {
            responseActions.push(JSON.stringify(act))
            }
        })
        })
    }

    if(!echoData || !echoData?.versions) {
        response = "ERROR: not valid request xml."
    } else {
        let responseXML = `<?xml version="1.0" encoding="UTF-8" ?>
        <OTA_PingRS xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opentravel.org/OTA/2003/05" xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 OTA_PingRS.xsd" Version="8.000">
        
            <Success/>
            <Warnings>
                <Warning Type="11" Status="ALPINEBITS_HANDSHAKE">
                { "versions": [
                    { 
                        "version": "2022-10",
                        "actions": ${responseActions}
                    }] 
                }
                </Warning>
            </Warnings>
        
            <EchoData>
                ${JSON.stringify(echoData?.versions)}
            </EchoData>
        </OTA_PingRS>`
        response = responseXML
    }
    return response
}
