module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'https://arweave.net/',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'https://nftstorage.link/',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'https://creator-hub-prod.s3.us-east-2.amazonaws.com',
        port: '',
      },
    ],
  },
}