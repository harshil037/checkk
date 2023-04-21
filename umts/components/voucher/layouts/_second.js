import React, { useEffect, useRef, useState } from 'react'
import Image from '../image/'
import currency_symbols from 'currency-symbol-map/map'

const Second = (props) => {
  const { pdfLayout, hotelId, width, loader, elementRef, styles, recipient, fontFiles, type, language } = props
  const { layout, imgurl, selectedServices, amount, currency, labels, logo, categoryName } = pdfLayout
  const fontFamilyStyles = `<style>
  ${fontFiles?.reduce((acc, curr) => {
    return (acc += `
    @font-face {
      font-family: ${curr?.fontFamily};
      src: url('${curr?.src}');
    }`)
  }, '')}
  </style>`
  const stylestemp = `<style>
  p{
    margin: 0;
    font-family: 'Inter', sans-serif;
  }
  * {
  box-sizing: border-box;
  }
  body{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  </style>`

  return (
    <div
      style={{
        width: '900px',
        boxSizing: 'border-box',
        margin: '0',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: styles?.['fontFamily-heading'],
        fontWeight: styles?.['fontWeight-body'],
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: fontFamilyStyles }}></div>
      <div dangerouslySetInnerHTML={{ __html: stylestemp }}></div>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          {/* bannerCut */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              width: '353px',
              backgroundImage: `url(${`https://res.cloudinary.com/seekda/image/upload/w_${width},c_fill,q_auto,f_webp/production/${hotelId}/${imgurl}`})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
            }}
          >
            {/* <img
              src={
                isValidHttpUrl(imgurl)
                  ? imgurl
                  : `https://res.cloudinary.com/seekda/image/upload/w_${width},c_fill,q_auto,f_webp/production/${hotelId}/${imgurl}`
              }
              alt=""
              style={{
                width: '373',
                height: '595',
                objectPosition: 'right',
                objectFit: 'cover',
              }}
            /> */}
          </div>
          {/* bannerSkew */}
          <div
            style={{
              transform: 'skew(10deg, 0deg)',
              marginLeft: '-55px',
              background: '#ffffff',
              marginRight: '-100px',
              padding: '0 80px 10px 40px',
              flex: '1',
            }}
          >
            <div style={{ transform: 'skew(-10deg, 0deg)' }}>
              <div style={{ textAlign: 'right', paddingRight: '30px', display: 'flex', placeContent: 'end' }}>
                <img
                  // style={{ height: '100%', objectFit: 'cover' }}
                  src={logo}
                  width="162"
                  height="37"
                />
              </div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: styles?.['fontWeight-subHeading'],
                  color: styles?.['color-secondary'],
                  margin: '0',
                  marginBottom: '10px',
                  fontFamily: styles?.['fontFamily-heading'],
                }}
              >
                {labels?.title}
              </h2>
              <div style={{ paddingLeft: '50px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', minWidth: '400px', minHeight: '70px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px', width: '100%' }}>
                    <p
                      style={{
                        fontSize: '20px',
                        width: '65%',
                        paddingRight: '10px',
                        fontFamily: styles?.['fontFamily-body'],
                        fontWeight: styles?.['fontWeight-subHeading'],
                        color: styles?.['color-secondary'],
                        marginBottom: '14px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {type === 'servicesVoucher' ? labels?.services : type === 'valueVoucher' ? labels?.voucher : ''}
                    </p>
                    <p
                      style={{
                        width: '35%',
                        whiteSpace: 'nowrap',
                        fontFamily: styles?.['fontFamily-body'],
                        marginBottom: '14px',
                        fontWeight: styles?.['fontWeight-effect'],
                        textAlign: 'center',
                      }}
                    >
                      {language === 'en'
                        ? (amount || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : (amount || 0).toLocaleString('de-DE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                      {currency_symbols['EUR'] || '€'}
                    </p>
                    {/* <p
                      style={{
                        fontSize: '12px',
                        lineHeight: '12px',
                        width: '70%',
                        paddingRight: '10px',
                        marginBottom: '10px',
                      }}
                    >
                      2x Körperpeeling mit Mango und Sheabutter
                    </p>
                    <p style={{ fontSize: '12px', width: '30%', marginBottom: '10px' }}>€ 57</p> */}

                    {/*  */}
                    {selectedServices.map((services, index) => (
                      <div
                        key={index.toString()}
                        style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                      >
                        <span
                          style={{
                            fontSize: '12px',
                            lineHeight: '12px',
                            marginBottom: '8px',
                            width: '70%',
                            fontFamily: styles?.['fontFamily-body'],
                            display: 'block',
                          }}
                        >
                          {services?.title}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            lineHeight: '12px',
                            marginBottom: '8px',
                            width: '70%',
                            fontFamily: styles?.['fontFamily-body'],
                            display: 'block',
                            textAlign: 'center',
                          }}
                        >
                          x{services?.count}
                        </span>
                        <span style={{ fontSize: '8px', width: '30%', display: 'block', marginBottom: '10px' }}>
                          {language === 'en'
                            ? (services?.price?.amount * services?.count || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : (services?.price?.amount * services.count || 0).toLocaleString('de-DE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                          {currency_symbols['EUR'] || '€'}
                        </span>
                      </div>
                    ))}
                    {/*  */}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: styles?.['color-primary'],
                    marginBottom: '10px',
                    marginTop: '10px',
                  }}
                >
                  {labels?.subTitle}
                </div>
                {/*  */}
                <div
                  style={{
                    marginLeft: '10px',
                    transform: 'skew(10deg, 0deg)',
                    background: '#F3EFEE',
                    padding: '20px 30px 40px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ transform: 'skew(-10deg, 0deg)', maxWidth: '343px' }}>
                    <p
                      style={{
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: styles?.['color-primary'],
                        marginBottom: '10px',
                      }}
                    >
                      {recipient?.salutation} {recipient?.name}
                    </p>
                    <p style={{ fontSize: '12px', lineHeight: '16px', color: styles?.['color-primary'] }}>
                      {recipient?.message}
                    </p>
                  </div>
                </div>
              </div>
              {/*  */}
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '10px', paddingBottom: '10px' }}>
                <div
                  id="voucher-code"
                  style={{ display: 'flex', alignItems: 'center', padding: '0 0 0 30px', width: '40%' }}
                >
                  <p style={{ fontSize: '14px', marginRight: '10px', fontWeight: styles?.['fontWeight-subHeading'] }}>
                    {labels?.code}
                  </p>
                  <p
                    style={{
                      padding: '5px 5px',
                      fontSize: '10px',
                      background: '#E8E1DE',
                      display: 'inline-block',
                      fontWeight: styles?.['fontWeight-effect'],
                    }}
                  >
                    {labels?.defaultCode || 'XXXXXXXXXXXXXXXX'}
                  </p>
                </div>
                <div
                  style={{ padding: '0 25px 0 10px', width: '60%', borderLeft: '0.5px solid rgba(41, 41, 41, 0.3)' }}
                >
                  <p style={{ fontSize: '11px', lineHeight: '18px' }}>{labels?.footer?.address}</p>
                  <p style={{ fontSize: '11px', lineHeight: '18px' }}>
                    {labels?.footer?.phone} {labels?.footer?.email && labels?.footer?.email}{' '}
                  </p>
                </div>
              </div>
              {/*  */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Second
