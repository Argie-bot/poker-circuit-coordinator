/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config, { isServer }) => {
    // Exclude Puppeteer from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
      
      // Externalize puppeteer for client builds
      config.externals = [
        ...config.externals,
        'puppeteer',
        'puppeteer-core',
        '@puppeteer/browsers',
      ];
    }
    
    return config;
  },
}

module.exports = nextConfig