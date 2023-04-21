import React, { useEffect, useRef, useState } from 'react'
import Image from '../image/'
import currency_symbols from 'currency-symbol-map/map'
import { isValidHttpUrl } from '../validHttpUrl'

const Second = (props) => {
  const {
    pdfLayout,
    hotelId,
    width,
    loader,
    elementRef,
    styles,
    recipient,
    fontFiles,
    type,
    language,
    restrictServicePrice,
  } = props
  const {
    layout,
    imgurl,
    selectedServices,
    amount,
    currency,
    labels,
    logo,
    categoryName,
    backend,
    selectedVoucherType,
  } = pdfLayout
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
        width: '1123px',
        boxSizing: 'border-box',
        margin: '0',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: styles?.['fontFamily-heading'],
        fontWeight: styles?.['fontWeight-body'],
        background: styles?.['backgroundColor-effect'] || '#ffffff',
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: fontFamilyStyles }}></div>
      <div dangerouslySetInnerHTML={{ __html: stylestemp }}></div>
      <div style={{ width: '1123px', height: '794px', margin: '0 auto' }}>
        <div style={{ display: 'flex', overflow: 'hidden', height: '100%' }}>
          {/* bannerCut */}
          {/* Added static width(w_1123) and auto format(f_auto) to reduce image size */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              width: '440px',
              backgroundImage: isValidHttpUrl(imgurl)
                ? `url(${imgurl})`
                : `url(https://res.cloudinary.com/seekda/image/upload/w_1123,c_fill,q_auto,f_auto/production/${hotelId}/${imgurl})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
            }}
          >
            {/* <img
              src={
                isValidHttpUrl(imgurl)
                  ? imgurl
                  : `https://res.cloudinary.com/seekda/image/upload/w_1123,c_fill,q_auto,f_auto/production/${hotelId}/${imgurl}`
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
              transform: 'skew(5deg, 0deg)',
              marginLeft: '-40px',
              background: styles?.['backgroundColor-effect'] || '#ffffff',
              marginRight: '-100px',
              padding: '0px 150px 10px 40px',
              flex: '1',
            }}
          >
            <div style={{ transform: 'skew(-5deg, 0deg)', height: '100%' }}>
              <div style={{ textAlign: 'right', padding: '16px 16px 8px 0' }}>
                <img
                  // style={{ height: '100%', objectFit: 'cover' }}
                  style={{
                    display: 'block',
                    marginLeft: 'auto',
                    width: 'auto',
                    maxHeight: '80px',
                    objectPosition: 'center',
                    objectFit: 'cover',
                  }}
                  src={logo}
                  // width="162"
                  // height="37"
                />
              </div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: styles?.['fontWeight-subHeading'],
                  color: styles?.['color-secondary'],
                  margin: '0',
                  marginBottom: '8px',
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
                        marginBottom: '8px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {type === 'servicesVoucher' ? labels?.services : type === 'valueVoucher' ? labels?.voucher : ''}
                    </p>
                    {type === 'servicesVoucher' ? (
                      !restrictServicePrice && (
                        <p
                          style={{
                            width: '35%',
                            whiteSpace: 'nowrap',
                            fontFamily: styles?.['fontFamily-body'],
                            marginBottom: '8px',
                            fontWeight: styles?.['fontWeight-effect'],
                            textAlign: 'center',
                          }}
                        >
                          {backend ? (
                            <>
                              {selectedVoucherType !== 'DYNAMIC' && (
                                <>
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
                                </>
                              )}
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </p>
                      )
                    ) : (
                      <p
                        style={{
                          width: '35%',
                          whiteSpace: 'nowrap',
                          fontFamily: styles?.['fontFamily-body'],
                          marginBottom: '8px',
                          fontWeight: styles?.['fontWeight-effect'],
                          textAlign: 'center',
                        }}
                      >
                        {backend ? (
                          <>
                            {selectedVoucherType !== 'DYNAMIC' && (
                              <>
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
                              </>
                            )}
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                      </p>
                    )}

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
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '0 0 4px 0',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12px',
                            lineHeight: '12px',
                            marginBottom: '4px',
                            width: '80%',
                            fontFamily: styles?.['fontFamily-body'],
                            display: 'inline-block',
                          }}
                        >
                          <span style={{ marginRight: '12px' }}>{services?.title}</span>
                          <span>x{services?.count}</span>
                        </span>
                        {/* <span
                          style={{
                            fontSize: '12px',
                            lineHeight: '12px',
                            marginBottom: '4px',
                            width: '10%',
                            fontFamily: styles?.['fontFamily-body'],
                            display: 'block',
                            textAlign: 'center',
                          }}
                        >
                          x{services?.count}
                        </span> */}
                        {!restrictServicePrice && (
                          <span
                            style={{
                              fontSize: '12px',
                              width: '20%',
                              display: 'block',
                              marginBottom: '4px',
                              textAlign: 'center',
                            }}
                          >
                            {backend ? (
                              <>
                                {selectedVoucherType !== 'DYNAMIC' && (
                                  <>
                                    {language === 'en'
                                      ? (services?.price?.amount * services?.count || 0).toLocaleString('en-US', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : (services?.price?.amount * services?.count || 0).toLocaleString('de-DE', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}{' '}
                                    {currency_symbols['EUR'] || '€'}
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {language === 'en'
                                  ? (services?.price?.amount * services?.count || 0).toLocaleString('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  : (services?.price?.amount * services?.count || 0).toLocaleString('de-DE', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}{' '}
                                {currency_symbols['EUR'] || '€'}
                              </>
                            )}
                          </span>
                        )}
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
                    marginTop: '14px',
                  }}
                >
                  {labels?.subTitle}
                </div>
                {/*  */}
                <div
                  style={{
                    marginLeft: '10px',
                    transform: 'skew(5deg, 0deg)',
                    background: styles?.['backgroundColor-effect-light'] || '#F3EFEE',
                    padding: '20px 30px 40px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ transform: 'skew(-5deg, 0deg)', maxWidth: '343px' }}>
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
                    <p style={{ fontSize: '12px', lineHeight: '16px', color: styles?.['color-primary'], whiteSpace: "pre-wrap" }}>
                      {recipient?.message}
                    </p>
                  </div>
                </div>
              </div>
              {/*  */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 0 10px 30px',
                  width: '100%',
                  position: 'fixed',
                  bottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 0 0 30px', width: '40%' }}>
                  <p style={{ fontSize: '14px', marginRight: '10px', fontWeight: styles?.['fontWeight-subHeading'] }}>
                    {labels?.code}
                  </p>
                  <p
                    style={{
                      padding: '5px 5px',
                      fontSize: '10px',
                      background: styles?.['backgroundColor-effect-dark'] || '#E8E1DE',
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
