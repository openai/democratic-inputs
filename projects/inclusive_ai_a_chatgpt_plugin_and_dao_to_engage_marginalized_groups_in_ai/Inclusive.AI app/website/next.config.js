/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prefer loading of ES Modules over CommonJS
  experimental: { esmExternals: true },
  reactStrictMode: true,
  // swcMinify: true,

  // https://github.com/vercel/next.js/issues/27650
  // webpack(config) {
  //   config.infrastructureLogging = { debug: /PackFileCache/ }
  //   return config;
  // },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  i18n: {
    localeDetection: true,
    locales: ['en'],
    defaultLocale: 'en',
    domains: [
      {
        domain: 'myinclusiveai.com',
        defaultLocale: 'en',
      },
    ],
  },
  trailingSlash: true,

  trailingSlash: false,

  images: {
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: 'flagcdn.com',
      //   port: '',
      //   // pathname: '/w20/*.png',
      //   pathname: '/**'
      // },
    ],
  },
}

module.exports = nextConfig;
