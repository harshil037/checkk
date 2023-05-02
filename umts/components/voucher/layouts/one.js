import React, { useEffect, useRef, useState } from 'react'
import Image from '../image/'
import currency_symbols from 'currency-symbol-map/map'
import { isValidHttpUrl } from '../validHttpUrl'

const One = (props) => {
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
  const { imgurl, selectedServices, amount, currency, labels, logo, categoryName, backend, selectedVoucherType } =
    pdfLayout
  const fontFamilyStyles = `<style>
  ${fontFiles?.reduce((acc, curr) => {
    return (acc += `
    @font-face {
      font-family: ${curr?.fontFamily};
      src: url('${curr?.src}');
    }`)
  }, '')}
  </style>`
  return (
    <div
      style={{
        height: '1123px',
        width: '794px',
        boxSizing: 'border-box',
        margin: '0',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: styles?.['fontFamily-body'],
        fontWeight: styles?.['fontWeight-body'],
        background: styles?.['backgroundColor-effect'] || '#ffffff',
        // '--MTS-color-main': styles?.borderColor,
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: fontFamilyStyles }}></div>
      <div style={{ maxWidth: '794px', margin: '0 auto', width: '100%', height: '100%' }}>
        {/* <div style={{ overflow: 'hiddden' }}> */}
        {/* bannerCut */}
        {/* Added static width(w_794) and auto format(f_auto) to reduce image size */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '400px',
            backgroundImage: isValidHttpUrl(imgurl)
              ? `url(${imgurl})`
              : `url(https://res.cloudinary.com/seekda/image/upload/w_794,c_fill,q_auto,f_auto/production/${hotelId}/${imgurl})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
          }}
        >
          {/* <img
              src={
                isValidHttpUrl(imgurl)
                  ? imgurl
                  : `https://res.cloudinary.com/seekda/image/upload/w_794,c_fill,q_auto,f_auto/production/${hotelId}/${imgurl}`
              }
              alt=""
              style={{
                width: '100%',
                height: '393',
                objectPosition: 'center',
                objectFit: 'cover',
              }}
            /> */}
        </div>
        {/* bannerSkew */}
        <div
          style={{
            transform: 'skew(0deg, -10deg)',
            marginTop: '-75px',
            background: styles?.['backgroundColor-effect'] || '#ffffff',
            marginBottom: '10px',
            height: '723px',
          }}
        >
          <div style={{ transform: 'skew(0deg, 10deg)' }}>
            <div style={{ textAlign: 'right', paddingRight: '20px' }}>
              <img
                style={{
                  display: 'block',
                  marginLeft: 'auto',
                  width: 'auto',
                  maxHeight: '100px',
                  objectPosition: 'center',
                  objectFit: 'cover',
                }}
                src={logo}
              />
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: styles?.['fontWeight-subHeading'],
                color: styles?.['color-secondary'],
                textAlign: 'center',
                textTransform: 'capitalize',
                marginBottom: '18px',
                fontFamily: styles?.['fontFamily-heading'],
              }}
            >
              {labels?.title}
            </h2>
            <div
              style={{
                fontSize: '16px',
                marginBottom: '18px',
                textAlign: 'center',
                fontFamily: styles?.['fontFamily-heading'],
              }}
            >
              {labels?.subTitle}
            </div>
            <div style={{ display: 'flex', paddingTop: '24px', alignItems: 'flex-start' }}>
              {/*  */}
              <div style={{ width: '60%', paddingLeft: '30px', minWidth: '330px', minHeight: '70px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
                  <span
                    style={{
                      width: '60%',
                      // paddingRight: '10px',
                      fontFamily: styles?.['fontFamily-body'],
                      fontWeight: styles?.['fontWeight-subHeading'],
                      color: styles?.['color-secondary'],
                      fontSize: '20px',
                      lineHeight: '20px',
                      margin: '0',
                      marginBottom: '16px',
                    }}
                  >
                    {type === 'servicesVoucher' ? labels?.services : type === 'valueVoucher' ? labels?.voucher : ''}
                  </span>
                  {type === 'servicesVoucher' ? (
                    !restrictServicePrice && (
                      <span
                        style={{
                          width: '30%',
                          fontFamily: styles?.['fontFamily-body'],
                          fontWeight: styles?.['fontWeight-effect'],
                          fontSize: '16px',
                          lineHeight: '20px',
                          margin: '0',
                          marginBottom: '16px',
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
                      </span>
                    )
                  ) : (
                    <span
                      style={{
                        width: '30%',
                        fontFamily: styles?.['fontFamily-body'],
                        fontWeight: styles?.['fontWeight-effect'],
                        fontSize: '16px',
                        lineHeight: '20px',
                        margin: '0',
                        marginBottom: '16px',
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
                    </span>
                  )}

                  {/*  */}
                  {/* <div>
                      <span
                        style={{
                          fontSize: '10px',
                          lineHeight: '12px',
                          marginBottom: '15px',
                          width: '60%',
                          paddingRight: '10px',
                          margin: '0',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        2x Körperpeeling mit Mango und Sheabutter
                      </span>
                      <span style={{ fontSize: '10px', width: '30%' }}>€ 57</span>
                    </div> */}
                  {/*  */}
                  {selectedServices.map((services, index) => (
                    <div
                      key={index.toString()}
                      style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '4px' }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          lineHeight: '12px',
                          marginBottom: '4px',
                          width: '70%',
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
                        <span style={{ fontSize: '12px', width: '30%', display: 'block', textAlign: 'center' }}>
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
                </div>
              </div>
              {/*  */}
              <div
                style={{
                  width: '48%',
                  marginTop: '-45px',
                  paddingTop: '30px',
                  // overflow: 'hidden',
                  minWidth: '250px',
                  // minHeight: '450px',
                }}
              >
                <div
                  style={{
                    transform: 'skew(0deg, -10deg)',
                    background: styles?.['backgroundColor-effect-light'] || '#F3EFEE',
                    padding: '50px 30px 30px',
                    // height: '110%',
                    height: '100%',
                    minHeight: '320px',
                  }}
                >
                  <div style={{ transform: 'skew(0deg, 10deg)' }}>
                    <p
                      style={{
                        fontSize: '16px',
                        lineHeight: '16px',
                        color: styles?.['color-primary'],
                        marginBottom: '20px',
                      }}
                    >
                      {recipient?.salutation} {recipient?.name}
                    </p>
                    <p style={{ fontSize: '10px', lineHeight: '20px', color: styles?.['color-primary'], whiteSpace: "pre-wrap" }}>
                      {recipient?.message}
                    </p>
                  </div>
                </div>
              </div>
              {/*  */}
            </div>
            {/*  */}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: '20px',
              position: 'fixed',
              bottom: '-52px',
              left: '0',
              right: '0',
              transform: 'skew(0deg,10deg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 25px 0 30px', width: '40%' }}>
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
            <div style={{ padding: '0 15px', borderLeft: '0.5px solid rgba(41, 41, 41, 0.3)', width: '60%' }}>
              <p style={{ fontSize: '12px', lineHeight: '12px' }}>{labels?.footer?.address}</p>
              <p style={{ fontSize: '12px', lineHeight: '12px' }}>
                {labels?.footer?.phone} {labels?.footer?.email && labels?.footer?.email}{' '}
              </p>
            </div>
          </div>
          {/*  */}
        </div>
        {/* </div> */}
      </div>
    </div>
  )
}

export default One
