/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      unoptimized: true,
    },
    experimental: {
        cpus: 1
    },
    staticPageGenerationTimeout: 60 * 15,
};

export default nextConfig;

// Initialize OpenNext for development - enables Cloudflare bindings in dev server
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
