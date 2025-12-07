/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    output: "export",
    basePath: isProd ? "/stock-ai-platform" : "",
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
