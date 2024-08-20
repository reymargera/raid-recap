/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/raid-recap',
    images: {
      unoptimized: true,
    },
    experimental: {
        cpus: 1
    },
    staticPageGenerationTimeout: 60 * 15,
};

export default nextConfig;
