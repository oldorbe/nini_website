/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
      // Tina Media Manager requests /media/list, /media/upload, etc.; separate route so upload can use raw body
      { source: "/media/:path*", destination: "/api/media/:path*" },
    ];
  },
};

module.exports = nextConfig;
