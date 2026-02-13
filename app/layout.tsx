import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import MaintenanceGuard from "@/components/shared/MaintenanceGuard"; // ✅ 1. Import มา
import { getSystemConfig } from "@/lib/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSystemConfig();
  return {
    title: config.siteName || "Code Friend",
    description: config.description || "แหล่งรวมคอร์สเรียน",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ 2. ดึงค่า Config และ User Role มาเตรียมไว้
  const config = await getSystemConfig();
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          
          {/* ✅ 3. ครอบด้วย MaintenanceGuard */}
          <MaintenanceGuard config={config} userRole={session?.user?.role}>
             {children}
          </MaintenanceGuard>

        </Providers>
      </body>
    </html>
  );
}