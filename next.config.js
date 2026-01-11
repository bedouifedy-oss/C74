const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add empty turbopack config to fix the warning
  turbopack: {},
  
  // Keep existing i18n configuration
  webpack: (config) => {
    config.resolve.alias['next-intl/config'] = path.resolve(__dirname, 'src/i18n.ts');
    return config;
  }
};

module.exports = nextConfig;
