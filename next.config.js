/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    ASTRONOMY_APP_ID: process.env.ASTRONOMY_APP_ID,
    ASTRONOMY_APP_SECRET: process.env.ASTRONOMY_APP_SECRET
  }
};

export default nextConfig;