// app/(public)/register/page.tsx
import { getSystemConfig } from "@/lib/actions";
import RegisterForm from "@/components/auth/RegisterForm"; // เรียกใช้ Form ที่แยกไว้
import { Lock } from "lucide-react";
import Link from "next/link";

// ✅ ใส่ async ตรงนี้ได้ เพราะเป็น Server Component
export default async function RegisterPage() {
  
  // 1. ดึงค่า Config
  const config = await getSystemConfig();

  // 2. เช็คว่าปิดรับสมัครหรือไม่
  if (!config.registrationEnabled) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                <Lock size={32} className="text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">ปิดรับสมัครสมาชิกชั่วคราว</h1>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
                ขออภัย ขณะนี้ระบบยังไม่เปิดให้สมัครสมาชิกใหม่ กรุณาติดตามประกาศจากทางเว็บไซต์
            </p>
            <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all">
                กลับหน้าหลัก
            </Link>
        </div>
    );
  }

  // 3. ถ้าเปิดรับสมัคร -> แสดงฟอร์ม (Client Component)
  return <RegisterForm />;
}