import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io", // ✅ UploadThing (เพิ่มเพื่อความชัวร์)
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com", // ✅ UI Avatars (รูปโปรไฟล์)
      },
      {
        protocol: "https",
        hostname: "**", // ✅ อันเดิมของคุณ (อนุญาตทุกเว็บ)
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;