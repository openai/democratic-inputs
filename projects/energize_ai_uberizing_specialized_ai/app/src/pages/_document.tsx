import { Head, Html, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400&display=swap" rel="stylesheet" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="The community making safer AI" />
        <meta property="og:image" content="https://app.energize.ai/thumbnail.png" />
        <meta property="og:url" content="https://energize.ai/" />
        <meta property="og:description" content="Join today." />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="The community making safer AI" />
        <meta name="twitter:image" content="https://app.energize.ai/thumbnail.png" />
        <meta name="twitter:description" content="Join today." />
        <link href="//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0/katex.min.css" rel="stylesheet" />
      </Head>
      <body className="bg-white text-black dark:bg-black dark:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
