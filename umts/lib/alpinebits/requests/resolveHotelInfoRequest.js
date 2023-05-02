export async function resolveHotelInfoRequest(parsedReqJson) {
    let hotelInfoRQ = parsedReqJson?.OTA_HotelDescriptiveInfoRQ?.HotelDescriptiveInfos?.[0]?.HotelDescriptiveInfo
    let hotelcode = hotelInfoRQ?.[0]?.['$']?.HotelCode
    const hotelInfo = await fetch(
        `https://switch.seekda.com/switch/1.009/rest/${hotelcode}?skd-channel-id=IBE`,
        {
            method: 'GET',
            headers: {
                Authorization: 'Basic aW5mb0BtdHMtaXRhbGlhLml0OkFGNTdVVDNTVE00Wg==',
            }
        }
    );
    const data = await hotelInfo.text();
    return data;
}