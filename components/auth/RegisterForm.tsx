"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // ✅ State สำหรับควบคุม Modal ยืนยันความสำเร็จ
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }

      // ✅ สมัครสำเร็จ: เปิด Modal และตั้งเวลาเปลี่ยนหน้า
      setShowSuccessModal(true);
      
      setTimeout(() => {
        router.push("/login");
      }, 3000); // รอ 3 วินาทีแล้วเด้งไป

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-sans text-slate-200 relative overflow-hidden">
      
      {/* ✅ 1. Success Modal (หน้าต่างเด้งเมื่อสำเร็จ) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-green-500/50 p-8 rounded-3xl shadow-2xl shadow-green-900/20 text-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300 relative overflow-hidden">
              
              {/* แสงพื้นหลังวิบวับ */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/20 rounded-full blur-[50px] -z-10" />

              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 border border-green-500/20">
                 <CheckCircle size={40} className="animate-bounce" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">สมัครสมาชิกสำเร็จ!</h2>
              <p className="text-slate-400 text-sm mb-6">
                 ยินดีต้อนรับสู่ Code Friend <br/> 
                 กำลังพาคุณไปหน้าเข้าสู่ระบบ...
              </p>

              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                 <div className="h-full bg-green-500 animate-[progress_3s_ease-in-out_forwards]" style={{ width: '0%' }} />
              </div>
           </div>
        </div>
      )}

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute top-[40%] -right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">สร้างบัญชีใหม่</h1>
          <p className="text-slate-400 text-sm">กรอกข้อมูลเพื่อเริ่มต้นใช้งาน Code Friend</p>
        </div>

        {/* Google Sign-Up */}
        <div className="mb-6">
            <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95"
            >
                <FcGoogle size={24} />
                <span>สมัครด้วย Google</span>
            </button>
            <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-slate-600 text-xs uppercase font-bold tracking-wider">หรือสมัครด้วยอีเมล</span>
                <div className="flex-grow border-t border-slate-800"></div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Inputs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">ชื่อที่ใช้แสดง</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                name="name" type="text" placeholder="เช่น สมชาย ใจดี" required
                value={formData.name} onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">อีเมล</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                name="email" type="email" placeholder="example@email.com" required
                value={formData.email} onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">รหัสผ่าน</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                name="password" type={showPassword ? "text" : "password"} placeholder="อย่างน้อย 6 ตัวอักษร" required
                value={formData.password} onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">ยืนยันรหัสผ่าน</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                name="confirmPassword" type="password" placeholder="กรอกรหัสผ่านอีกครั้ง" required
                value={formData.confirmPassword} onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <> สมัครสมาชิก <ArrowRight size={20} /> </>}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-800">
          <p className="text-slate-400 text-sm">
            มีบัญชีอยู่แล้ว? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold hover:underline transition-all">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}