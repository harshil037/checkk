import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const IFrame = (props) => {
    const width = (props.isIpadView && '768px') || (props.isMobileView && '456px') || '1440px'

    const [iframeBody, setIframeBody] = useState(null)
    const [iframeHead, setIframeHead] = useState(null)
    const myRef = useRef(null)

    useEffect(() => {
      if (myRef) {
        setIframeBody(myRef?.current.contentWindow?.document?.body)
        setIframeHead(myRef?.current.contentWindow?.document?.head)
      }
    }, [myRef])

    useEffect(() => {
      const styles = document.head.querySelectorAll('style')
      const links = document.head.querySelectorAll('link')
      const metas = document.head.querySelectorAll('meta')
      const head = iframeHead
      for (let i = 0; i < styles.length; i++) {
        const style = styles[i].cloneNode(true)
        if (
          (style.innerHTML.indexOf('#__MTS') !== -1 || style.innerHTML.indexOf('.stf__') !== -1) &&
          head?.innerHTML.indexOf(style?.outerHTML) === -1
        ) {
          head?.appendChild(style)
        }
      }
      for (let i = 0; i < metas.length; i++) {
        const meta = metas[i].cloneNode(true)
        if (head?.innerHTML.indexOf(meta?.outerHTML) === -1) {
          head?.appendChild(meta)
        }
      }
      for (let i = 0; i < links.length; i++) {
        const link = links[i].cloneNode(true)
        if (
          head?.innerHTML.indexOf(link?.outerHTML) === -1 &&
          link?.getAttribute('href')?.indexOf('/_next/static/css/') !== -1
        ) {
          fetch(`${window.location.origin}${link?.getAttribute('href')}`)
            .then((res) => res.text())
            .then((res) => {
              if (res.indexOf('#__MTS') !== -1) {
                head?.appendChild(link)
              }
            })
        }
      }
      // props.module !== 'WidgetFlipbook' && iframeBody && (iframeBody.querySelector('div').style.display = 'inline-table')
      props.module === 'WidgetPriceCalculator' && props.version === '1' && iframeBody && (iframeBody.querySelector('div').style.display = 'inline-table')
      props.module === 'WidgetRoomsList' && iframeBody && (iframeBody.querySelector('div').style.display = 'inline-table')
    }, [iframeHead, iframeBody, width])

    return (
      <iframe
        height="100%"
        onLoad={(e) => {
          if (e.target?.contentWindow?.document?.body) {
            setIframeBody(e.target?.contentWindow?.document?.body)
            setIframeHead(e.target?.contentWindow?.document?.head)
          }
        }}
        width={width}
        ref={myRef}
        style={props.style || {}}
      >
        {iframeBody && createPortal(props.children, iframeBody)}
      </iframe>
    )
  }

export default IFrame
