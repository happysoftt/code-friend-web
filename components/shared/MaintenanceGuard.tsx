"use client";

import { usePathname } from "next/navigation";
import { Wrench, Lock } from "lucide-react";
import Link from "next/link";

interface MaintenanceGuardProps {
  children: React.ReactNode;
  config: any;
  userRole?: string; // ส่ง Role ของ user มาเช็ค
}

export default function MaintenanceGuard({ children, config, userRole }: MaintenanceGuardProps) {
  const pathname = usePathname();

  // 1. ถ้าไม่ได้เปิดโหมดปิดปรับปรุง -> แสดงเนื้อหาปกติเลย
  if (!config?.maintenanceMode) {
    return <>{children}</>;
  }

  // 2. ข้อยกเว้น: ถ้าเป็น Admin -> ให้ผ่านได้เสมอ
  if (userRole === "ADMIN") {
    return (
      <>
        {/* แถบแจ้งเตือน Admin ว่าตอนนี้เว็บปิดอยู่นะ */}
        <div className="bg-red-600 text-white text-xs py-1 px-2 text-center fixed bottom-0 left-0 right-0 z-[9999] opacity-90">
          ⚠️ เว็บไซต์อยู่ในโหมดปิดปรับปรุง (Maintenance Mode) - คุณเห็นหน้านี้เพราะเป็น Admin
        </div>
        {children}
      </>
    );
  }

  // 3. ข้อยกเว้น: ยอมให้เข้าหน้า Login และ API ได้ (ไม่งั้นจะล็อกอินมาแก้ไม่ได้)
  const allowedPaths = ["/login", "/api", "/_next", "/static"];
  const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));

  if (isAllowedPath) {
    return <>{children}</>;
  }

  // 4. ถ้าไม่เข้าเงื่อนไขข้างบน -> แสดงหน้า "ปิดปรับปรุง"
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center font-sans">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 animate-pulse">
        <Wrench size={48} className="text-red-500" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
        ปิดปรับปรุงชั่วคราว
      </h1>
      
      <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed mb-8">
        เรากำลังอัปเกรดระบบเพื่อให้ดียิ่งขึ้นกว่าเดิม <br />
        กรุณากลับมาใหม่ในภายหลังครับ
      </p>

      {/* ปุ่มสำหรับเจ้าหน้าที่ (พาไปหน้า Login ที่เรายกเว้นไว้) */}
      <Link 
        href="/login" 
        className="text-slate-600 hover:text-slate-400 text-sm flex items-center gap-2 transition-colors border border-slate-800 px-4 py-2 rounded-full hover:bg-slate-900"
      >
        <Lock size={14} /> สำหรับเจ้าหน้าที่
      </Link>
    </div>
  );
}