/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
        swcPlugins: [
            ["@lingui/swc-plugin", {}]
        ]
    },
}; 

module.exports = nextConfig;
