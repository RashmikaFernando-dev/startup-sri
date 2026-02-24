import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="StartupSri - Microloan Platform for Tech Entrepreneurs in Sri Lanka" />
        <meta name="theme-color" content="#1976d2" />
        <link rel="icon" href="/StartupSri.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
