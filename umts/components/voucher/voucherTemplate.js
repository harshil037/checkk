import React from 'react'

const voucherTemplate = ({ data }) => {
  const {
    type,
    value,
    salutation,
    name,
    greetings,
    services,
    code,
    templateImage,
    issueDate,
    expiryDate,
    address,
    language,
    logo,
  } = data
  return (
    <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'flex-start' }}>
      <div style={{ width: '100%' }}>
        <img src={templateImage?.fileName} style={{ width: '100%', height: '500px' }} />
      </div>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: ' center',
            paddingTop: '50px',
            marginLeft: 0,
            paddingBottom: '30px',
          }}
        >
          <img src={logo} style={{ width: '100px' }} />
        </div>
        <div style={{ fontSize: ' 32px', lineHeight: '32px', textAlign: 'center' }}>{type}</div>
        <div style={{ fontSize: ' 28px', lineHeight: '30px', textAlign: 'center', padding: '10px' }}>{value} €</div>
        <div style={{ fontSize: ' 16px', lineHeight: ' 18px', textAlign: 'center', paddingTop: ' 16px' }}>
          {salutation} {name}
        </div>
        <div
          style="
              font-family: ;
              font-size: 16px;
              line-height: 20px;
              text-align: center;
              padding-top: 16px;
              padding-bottom: 16px;
            "
          style={{
            whiteSpace: 'pre-line',
            fontSize: '16px',
            lineHeight: '20px',
            textAlign: 'center',
            paddingTop: '16px',
            paddingBottom: '16px',
          }}
          dangerouslySetInnerHTML={{ __html: data.greetings }}
        />
        <div style={{ textAlign: 'center' }}>
          {Object.entries(services).map(([key, service]) => {
            if (service.isSelected) {
              return (
                <>
                  {service.quantity} x {service.title}
                  <br />
                </>
              )
            }
          })}
        </div>
      </div>
      <div style={{ marginTop: '100px' }}>
        <div style={{ padding: '12px' }}>
          <hr style={{ marginTop: '20px', marginBottom: '20px', border: 'none', height: '1px' }} />
          <div
            style={{
              fontSize: '14px',
              lineHeight: '18px',
              display: 'flex',
              marginTop: '20px',
              justifyContent: 'space-between',
              paddingLeft: '10px',
              paddingRight: '10px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'start' }}>
              <div>Gutschein: {code}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'end' }}>
              <div>Ausgestellt: {new Date(issueDate).toLocaleDateString()}</div>
              <div>Einzulösen bis: {new Date(expiryDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '14px', lineHeight: '18px', textAlign: 'center', marginTop: 0 }}>
          <hr style={{ marginTop: '20px', marginBottom: '20px', border: 'none', height: '1px' }} />
          <p>{address?.title?.[language]}</p>
          <p>
            {address?.street1?.[language]}, {address?.street2?.[language]}
          </p>
          <p>Tel. {address?.telephone?.[language]}</p>
          <p>www.villaverde-meran.com/ | {address?.email?.[language]}</p>
        </div>
      </div>
    </div>
  )
}

export default voucherTemplate
