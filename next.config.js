/** @type {import('next').NextConfig} */
const codespaceName = process.env.CODESPACE_NAME;
const forwardingDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

const forwardedOrigins =
  codespaceName && forwardingDomain
    ? [
        `${codespaceName}-3000.${forwardingDomain}`,
        `${codespaceName}-3001.${forwardingDomain}`,
        `${codespaceName}-3000.preview.${forwardingDomain}`,
        `${codespaceName}-3001.preview.${forwardingDomain}`,
      ]
    : [];

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  experimental: {
    memoryBasedWorkersCount: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000', 'localhost:3001', '127.0.0.1:3001', ...forwardedOrigins],
    },
  },
};

module.exports = nextConfig;
