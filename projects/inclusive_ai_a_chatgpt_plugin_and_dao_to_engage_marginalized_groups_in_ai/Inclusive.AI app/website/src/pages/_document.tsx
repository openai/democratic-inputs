import React from 'react'
import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

const meta = {
  title: 'Inclusive AI DAO',
  description: 'Inclusive AI DAO',
}

// if (process.env.NODE_ENV === 'development') {
//   const a11y = require('react-a11y').default
//   a11y(React, ReactDOM, {
//     rules: {
//       'img-uses-alt': 'warn',
//       'img-redundant-alt': ['warn', ['image', 'photo', 'foto', 'bild']],
//       // ...
//     },
//   })
// }

export default function AppDocument() {
  return (
    <Html lang="en">
      <Head>
        <meta name="robots" content="follow, index" />
        <meta name="description" content={meta.description} />
        {/* PWA primary color */}
        {/* <meta name='theme-color' content={theme.palette.primary.main} /> */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-5MM433HR');`}
        </Script>
      </Head>
      <body>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5MM433HR"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// AppDocument.getInitialProps = async (ctx: any) => {
//   const sheets = new ServerStyleSheets()
//   const originalRenderPage = ctx.renderPage

//   ctx.renderPage = () =>
//     originalRenderPage({
//       enhanceApp: (App: any) => (props: any) =>
//         sheets.collect(<App {...props} />),
//     })

//   const initialProps = await Document.getInitialProps(ctx)

//   return {
//     ...initialProps,
//     // Styles fragment is rendered after the app and page rendering finish.
//     styles: [
//       ...React.Children.toArray(initialProps.styles),
//       sheets.getStyleElement(),
//     ],
//   }
// }
