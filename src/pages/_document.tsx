import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary Meta Tags */}
        <title>MapChain - Instant AI & Official Property Valuations</title>
        <meta name="title" content="MapChain - Instant AI & Official Property Valuations" />
        <meta name="description" content="Get instant, AI-powered and official property valuations. Connect with valuators, buy, sell, and manage properties with blockchain transparency and frictionless onboarding. The world's easiest property valuation platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#00f0ff" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mapchain.app/" />
        <meta property="og:title" content="MapChain - Instant AI & Official Property Valuations" />
        <meta property="og:description" content="Get instant, AI-powered and official property valuations. Connect with valuators, buy, sell, and manage properties with blockchain transparency and frictionless onboarding." />
        <meta property="og:image" content="/og-image.png" />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://mapchain.app/" />
        <meta property="twitter:title" content="MapChain - Instant AI & Official Property Valuations" />
        <meta property="twitter:description" content="Get instant, AI-powered and official property valuations. Connect with valuators, buy, sell, and manage properties with blockchain transparency and frictionless onboarding." />
        <meta property="twitter:image" content="/og-image.png" />
        {/* Schema.org Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'MapChain',
          url: 'https://mapchain.app/',
          logo: '/logo.png',
          description: 'Get instant, AI-powered and official property valuations. Connect with valuators, buy, sell, and manage properties with blockchain transparency and frictionless onboarding.',
          sameAs: [
            'https://twitter.com/mapchain',
            'https://www.linkedin.com/company/mapchain',
            'https://github.com/mapchain'
          ]
        }) }} />
      </Head>
      <body style={{ background: '#0f172a' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
