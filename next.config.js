/** @type {import('next').NextConfig} */
const nextConfig = {
     async rewrites() {
        return [
        { source: '/', destination: '/collection/pop' },
        ];
  },
}

module.exports = nextConfig
