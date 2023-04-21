export async function validateRequestXML(version, msg) {
    const validateReq = await fetch(
        `https://development.alpinebits.org/validator`,
        {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                msg: msg,
                version: version
            }),
        }
    );

    const data = await validateReq.json();
    return data;
}

