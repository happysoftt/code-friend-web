"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast"; // 1. นำเข้า Toaster

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* 2. ตั้งค่า Toaster ให้พื้นหลังดำ ตัวหนังสือขาว */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b', // Slate-800
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981', // Emerald-500
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Red-500
              secondary: '#fff',
            },
          },
        }}
      />
      {children}
    </SessionProvider>
  );
}