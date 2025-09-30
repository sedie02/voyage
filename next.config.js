/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Caching strategies
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'mapbox-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'weather-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
  ],
});

const nextConfig = {
  // React strict mode voor betere development warnings
  reactStrictMode: true,

  // Optimalisatie voor production builds
  swcMinify: true,

  // Aangezien we hosten op Skylabs VM (niet Vercel)
  output: 'standalone',

  // Image optimization configuratie
  images: {
    domains: [
      'maps.googleapis.com',
      'lh3.googleusercontent.com', // Google Places photos
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables die beschikbaar zijn in de browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'Voyage',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },

  // Headers voor security en PWA
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Webpack configuratie voor custom optimalisaties
  webpack: (config, { isServer }) => {
    // Custom webpack config hier
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Experimental features
  experimental: {
    // Server Actions voor form handling
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // TypeScript configuratie
  typescript: {
    // !! WAARSCHUWING !!
    // Alleen tijdens development op false zetten als nodig
    // Voor production altijd type checking aanzetten
    ignoreBuildErrors: false,
  },

  // ESLint configuratie
  eslint: {
    // Directories die gecontroleerd worden tijdens build
    dirs: ['src', 'app', 'components', 'lib', 'hooks'],
  },
};

module.exports = withPWA(nextConfig);
