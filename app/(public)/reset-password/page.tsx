"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { resetPassword } from "@/lib/actions"; // Server Action ที่เราเตรียมไว้
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!token) {
      toast.error("ลิงก์ไม่ถูกต้องหรือหมดอายุ");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    try {
      const res = await resetPassword(token, password);

      if (res?.error) {
        toast.error(res.error);
      } else {
        setSuccess(true);
        toast.success("เปลี่ยนรหัสผ่านสำเร็จ!");
        
        // Redirect อัตโนมัติ
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  // State: เปลี่ยนรหัสสำเร็จ
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 font-sans">
        <div className="w-full max-w-md bg-slate-900/50 border border-green-500/30 p-8 rounded-3xl text-center backdrop-blur-sm shadow-2xl shadow-green-900/20 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 border border-green-500/30">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">เรียบร้อย!</h2>
          <p className="text-slate-400 mb-8">
            รหัสผ่านของคุณถูกเปลี่ยนแล้ว <br/>
            กำลังพาคุณไปหน้าเข้าสู่ระบบ...
          </p>
          <Link href="/login" className="block w-full py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/30">
            เข้าสู่ระบบทันที
          </Link>
        </div>
      </div>
    );
  }

  // กรณีไม่มี Token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="text-center p-8 bg-slate-900 rounded-3xl border border-red-500/30">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">ลิงก์ไม่ถูกต้อง</h1>
            <p className="text-slate-400 mb-6">กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่อีกครั้ง</p>
            <Link href="/forgot-password" className="text-blue-400 hover:underline">ขอลิงก์ใหม่</Link>
        </div>
      </div>
    );
  }

  // State: ฟอร์มเปลี่ยนรหัส
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden font-sans text-slate-200">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />
      </div>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-inner">
             <Lock size={24} className="text-slate-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">ตั้งรหัสผ่านใหม่</h1>
          <p className="text-slate-400 text-sm">กรุณากรอกรหัสผ่านใหม่ของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">รหัสผ่านใหม่</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="อย่างน้อย 6 ตัวอักษร" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">ยืนยันรหัสผ่าน</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="password" 
                required 
                placeholder="กรอกรหัสผ่านอีกครั้ง" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <> ยืนยันรหัสผ่านใหม่ <ArrowRight size={20} /> </>}
          </button>

        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-800">
          <Link href="/login" className="text-slate-500 hover:text-white text-sm transition-colors">
             ยกเลิกและกลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>

      </div>
    </div>
  );
}

// Export Default wrapped in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#020617] text-white"><Loader2 className="animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}