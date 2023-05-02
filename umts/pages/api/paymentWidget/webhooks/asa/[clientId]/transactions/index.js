import nextConnect from 'next-connect'
import cors from '../../../../../../../middlewares/cors'
import middleware from '../../../../../../../middlewares/middleware'
import ensureReqBody from '../../../../../../../middlewares/ensureReqBody'
import { getPaymentRecords, updatePaymentRecords, saveApiLogs } from '../../../../../../../lib/db'
import { saltHashPassword, decryptHexa } from '../../../../../../../lib/crypto'

const handler = nextConnect()

handler.use(middleware).use(cors).use(ensureReqBody)
const SECRET = process.env.ENCRYPTION_SECRET
handler.get(async (req, res) => {
  const {
    query: { clientId },
  } = req
  try {
    const getCardDetails = (paymentCard, property) => {
      switch (property) {
        case 'cardHolderName':
          return paymentCard.holder
          break
        case 'cardMaskNumber':
          return `XXXXXXXXXXXX${paymentCard.last4Digits}`
          break
        case 'expiryDate':
          return `${paymentCard.expiryMonth}${paymentCard.expiryYear?.slice(2)}`
          break
          return ''
      }
    }
    const authorization =
      req.headers?.authorization && Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString()

    const origin = authorization && authorization.split(':')[0]
    const token = authorization && authorization.split(':')[1]
    const saltedPassword = origin && saltHashPassword(origin).substring(0, 50)
    if (!authorization || token !== saltedPassword) {
      res.status(401).send({ error: 'Not authorized', user: null })
      return
    }

    const payments = await getPaymentRecords(req, {
      client:clientId,
      paymentMode: 'live',
      paymentStatus: 'success',
      'transactionData.fetched': false,
      'transactionData.fetched': { $exists: true },
      paymentResponse: { $exists: true },
    })
    const SavePaymentRef = await updatePaymentRecords(
      req,
      {
        client:clientId,
        paymentMode: 'live',
        paymentStatus: 'success',
        'transactionData.fetched': false,
        'transactionData.fetched': { $exists: true },
        paymentResponse: { $exists: true },
      },
      { 'transactionData.fetched': true },
    )

    // console.log('payments', payments)
    // console.log('SavePaymentRef', SavePaymentRef)
    const reservations = payments?.reduce((acc, curr) => {
      if (acc[curr?.reservationId]) {
        acc[curr?.reservationId]?.transactions.push({
          amount: parseFloat(curr.amount).toFixed(2),
          currencyCode: curr?.currency || 'EUR',
          paymentSystem: curr?.provider || 'HOBEX',
          transactionId: curr.paymentResponse.id,
          timeStamp: curr.paymentResponse.timeStamp,
          statusCode: curr.paymentResponse.result.code,
          statusDescription: curr.paymentResponse.result.description,
          reference: curr.reference,
          reservationId: curr.reservationId,
          transactionData: curr.transactionData,
          paymentCard: JSON.parse(decryptHexa(SECRET, curr.transactionData?.debug)),
        })
      } else {
        acc[curr?.reservationId] = {
          reservationId: curr.reservationId,
          transactions: [
            {
              amount: parseFloat(curr.amount).toFixed(2),
              currencyCode: curr?.currency || 'EUR',
              paymentSystem: curr?.provider || 'HOBEX',
              transactionId: curr.paymentResponse.id,
              timeStamp: curr.paymentResponse.timeStamp,
              statusCode: curr.paymentResponse.result.code,
              statusDescription: curr.paymentResponse.result.description,
              reference: curr.reference,
              reservationId: curr.reservationId,
              transactionData: curr.transactionData,
              paymentCard: JSON.parse(decryptHexa(SECRET, curr.transactionData?.debug)),
            },
          ],
        }
      }
      return acc
    }, {})
    // console.log(reservations)
    let transactionsXML = `<OTA_ResRetrieveRS>
  <ReservationsList>
   ${Object.values(reservations)?.map((reservation) => {
     return `<HotelReservation>
    <UniqueID Type="14" ID="${reservation.reservationId}"/>
    <ResGlobalInfo>
      <DepositPayments>
        ${reservation?.transactions?.map((transaction) => {
          return `<GuaranteePayment>
          <AcceptedPayments>
            <AcceptedPayment PaymentTransactionTypeCode="charge">
              <PaymentCard CardCode="VI" ExpireDate="${getCardDetails(transaction.paymentCard, 'expiryDate')}">
                <CardHolderName>${getCardDetails(transaction.paymentCard, 'cardHolderName')}</CardHolderName>
                <CardNumber Mask="${getCardDetails(transaction.paymentCard, 'cardMaskNumber')}"/> Token="${
            transaction.paymentCard?.token || transaction.transactionId
          }" TokenProviderID="${transaction.paymentSystem}">
                </CardNumber>
              </PaymentCard>
              <TPA_Extensions>
                <TransactionDetails>
                  <PSP>${transaction.paymentSystem}</PSP>
                  <TransactionID>${transaction.transactionId}</TransactionID>
                  <TimeStamp>${transaction.timeStamp}</TimeStamp>
                  <StatusCode>${transaction.statusCode}</StatusCode>
                  <StatusDescription>${transaction.statusDescription}</StatusDescription>
                </TransactionDetails>
              </TPA_Extensions>
            </AcceptedPayment>
          </AcceptedPayments>
          <AmountPercent>
            <Amount>${transaction.amount}</Amount>
            <CurrencyCode>${transaction.currencyCode}</CurrencyCode>
          </AmountPercent>
        </GuaranteePayment>`
        })}
      </DepositPayments>
    </ResGlobalInfo>
  </HotelReservation>`
   })}
  </ReservationsList>
</OTA_ResRetrieveRS>`
    saveApiLogs(req, {
      clientId: clientId,
      product: 'vmts',
      headers: req.headers,
      queryParams: req.query,
      timestamp: Date.now(),
      createdAt: new Date(Date.now()),
      url: req.url,
      method: req.method,
      endpoint: `api/vmts/webhooks/asa/[clientId]/transactions`,
      ...(req?.body ? { body: req.body } : {}),
      response: {},
    })
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/xml')
    res.send(transactionsXML)
  } catch (e) {
    console.log('======================= | Error ASA Webhook | => | fetching transactions | ============')
    console.log({ error: e })
    res.send(`<OTA_ResRetrieveRS>
        <ReservationsList>
        </ReservationsList>
</OTA_ResRetrieveRS>`)
  }
})

export default handler

// <OTA_ResRetrieveRS>
//   <ReservationsList>
//     <HotelReservation>
//       <UniqueID Type="14" ID="ABC123"/>
//       <ResGlobalInfo>
//         <DepositPayments>
//           <GuaranteePayment>
//             <AcceptedPayments>
//               <AcceptedPayment PaymentTransactionTypeCode="charge">
//                 <PaymentCard CardCode="VI" ExpireDate="1124">
//                   <CardHolderName>MUELLER JOHANN</CardHolderName>
//                   <CardNumber Mask="XXXXXXXXXXXX1234" Token="39acd49f7db2fabc317db3d969592345" TokenProviderID="HOBEX">
//                     <PlainText>4539123412341234</PlainText>
//                   </CardNumber>
//                 </PaymentCard>
//                 <TPA_Extensions>
//                   <TransactionDetails>
//                     <PSP>HOBEX</PSP>
//                     <TransactionID>8ac7a49f7dbffc9c0107cc3d9abc583c</TransactionID>
//                     <TimeStamp>2021-12-13T12:51:49</TimeStamp>
//                     <StatusCode>000.100.110</StatusCode>
//                     <StatusDescription>Request successfully processed</StatusDescription>
//                   </TransactionDetails>
//                 </TPA_Extensions>
//               </AcceptedPayment>
//             </AcceptedPayments>
//             <AmountPercent>
//               <Amount>300.00</Amount>
//               <CurrencyCode>EUR</CurrencyCode>
//             </AmountPercent>
//           </GuaranteePayment>
//         </DepositPayments>
//       </ResGlobalInfo>
//     </HotelReservation>
//   </ReservationsList>
// </OTA_ResRetrieveRS>
