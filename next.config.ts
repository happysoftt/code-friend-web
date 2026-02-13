import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // อนุญาตให้ใช้รูป SVG (เช่นรูปจาก ui-avatars)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // อนุญาตทุกเว็บ
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // เพิ่มขนาดไฟล์อัปโหลด
    },
  },
};

export default nextConfig;