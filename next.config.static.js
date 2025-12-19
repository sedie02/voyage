/** @type {import('next').NextConfig} */
// Static export config voor normale hosting (public_html)

const nextConfig = {
  // Static export mode
  output: 'export',

  // Geen trailing slash (voor .htaccess compatibiliteit)
  trailingSlash: false,

  // Image optimization (moet uit voor static export)
  images: {
    unoptimized: true,
  },

  // Geen server-side features
  reactStrictMode: true,
  swcMinify: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Voyage',
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },
};

module.exports = nextConfig;

