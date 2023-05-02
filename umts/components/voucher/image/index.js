import React, { useState } from 'react'
// ============ Components to include ============
import Loading from './Loading'

const Image = (props) => {
  const { hotelId, fileName, width, height, className, styles, loader } = props
  const screenSizes = [640, 768, 1024, 1536]
  const sourceLoader = {
    kognitiv: () =>
      `https://res.cloudinary.com/seekda/image/upload/w_${width},c_fill,q_auto,f_webp/production/${hotelId}/${fileName}`,
    //add more source loaders here, it defaults to "kognitiv" if no loader prop is given
  }

  const imgSrc = () => sourceLoader[loader ?? 'kognitiv']({ hotelId, fileName, width, height })

  const imgSrcSet = () => {
    return screenSizes
      .reduce((acc, width) => {
        return [...acc, imgSrc() + ` ${width}w`]
      }, [])
      .join(', ')
  }

  const imgSizes = () => {
    const defaultWidth = screenSizes[screenSizes.length - 1]
    return (
      screenSizes
        .reduce((acc, width) => {
          return [...acc, `(max-width: ${width}px) ${width}px`]
        }, [])
        .join(', ') + `, ${defaultWidth}px`
    )
  }

  const isValidHttpUrl = (string) => {
    try {
      const url = new URL(string)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (err) {
      return false
    }
  }

  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {isValidHttpUrl(fileName) ? (
        <img
          src={fileName}
          style={{ ...{ display: loaded ? '' : 'none' }, ...styles }}
          className={className}
          onLoad={() => {
            setLoaded(true)
          }}
        ></img>
      ) : (
        <img
          style={{ ...{ display: loaded ? '' : 'none' }, ...styles }}
          className={className}
          srcSet={imgSrcSet()}
          sizes={imgSizes()}
          onLoad={() => {
            setLoaded(true)
          }}
        />
      )}
      {!loaded && <Loading />}
    </>
  )
}

export default Image
