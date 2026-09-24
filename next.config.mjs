/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    // Public profile links: Nuvra Link renders at /@username
    return [{ source: '/@:username', destination: '/u/:username' }];
  },
};

export default nextConfig;
