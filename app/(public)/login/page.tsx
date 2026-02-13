"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc"; // npm install react-icons

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setFormError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
      } else {
        router.push("/"); 
        router.refresh(); 
      }
    } catch (error) {
      setFormError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden font-sans text-slate-200">
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />
      </div>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-lg shadow-green-900/20">
            <LogIn size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm">เข้าสู่ระบบเพื่อเข้าถึงคอร์สเรียนและโปรเจกต์ของคุณ</p>
        </div>

        {/* 1. Google Login (เพิ่มใหม่) */}
        <div className="mb-6">
            <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95"
            >
                <FcGoogle size={24} />
                <span>เข้าสู่ระบบด้วย Google</span>
            </button>
            
            {/* เส้นคั่น */}
            <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-slate-600 text-xs uppercase font-bold tracking-wider">หรือ</span>
                <div className="flex-grow border-t border-slate-800"></div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Error Message */}
          {(formError || errorMsg) && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3 animate-pulse">
              <AlertCircle size={18} />
              <span>{formError || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">อีเมล</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
              </div>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="name@example.com" 
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 block pl-10 p-3 placeholder-slate-600 transition-all outline-none" 
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-500 uppercase">รหัสผ่าน</label>
              <Link href="/forgot-password" className="text-xs text-green-500 hover:text-green-400 hover:underline">ลืมรหัสผ่าน?</Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
              </div>
              <input 
                name="password" 
                type={showPassword ? "text" : "password"}
                required 
                placeholder="••••••••" 
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 block pl-10 pr-10 p-3 placeholder-slate-600 transition-all outline-none" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "เข้าสู่ระบบ"}
          </button>

        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-green-400 hover:text-green-300 font-bold hover:underline transition-colors">
              สมัครสมาชิกฟรี
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}