/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'zod/v3': 'zod',
    };

    return config;
  },
};

export default nextConfig;
