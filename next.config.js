
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "http",
        hostname: "10.27.1.208",
        port: "4000",
      },
      {
        protocol: "http",
        hostname: "10.27.1.208",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "adminrocket.megascale.co.in",
      },
    ],
  },
  reactCompiler: true,
  allowedDevOrigins: ["10.27.1.208", "localhost"],
};

module.exports = nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "cdn.shopify.com",
//       },
//       {
//         protocol: "http",
//         hostname: "10.27.1.208",
//         port: "4000",
//       },
//       {
//         protocol: "http",
//         hostname: "10.27.1.208",
//       },
//       {
//         protocol: "http",
//         hostname: "localhost",
//         port: "4000",
//       },
//       {
//         protocol: "http",
//         hostname: "localhost",
//       },
//       {
//         protocol: "https",
//         hostname: "adminrocket.megascale.co.in",
//       },
//     ],
//     domains: ["10.27.1.208", "localhost", "adminrocket.megascale.co.in"],
//   },
//   reactCompiler: true,
//   allowedDevOrigins: ["10.27.1.208", "localhost"],
// };

// module.exports = nextConfig;
