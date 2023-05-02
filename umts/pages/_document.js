import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
          <link rel="icon" type="image/png" sizes="16x16" href="/mts-favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/mts-favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="96x96" href="/mts-favicon-96x96.png" />
          <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="/mts-favicon-180x180.png" />
        </Head>
        <body id="__UMTS">
          <div id="portal" />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

MyDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => <App {...props} />,
    })

  const initialProps = await Document.getInitialProps(ctx)

  return {
    ...initialProps,
    styles: [...React.Children.toArray(initialProps.styles)],
  }
}
