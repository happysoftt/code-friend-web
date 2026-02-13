"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions"; // Server Action ที่เราเตรียมไว้
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false); // สถานะว่าส่งเมลไปแล้วหรือยัง

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await requestPasswordReset(email);

      if (res?.error) {
        toast.error(res.error);
      } else {
        setIsSent(true);
        toast.success("ส่งลิงก์รีเซ็ตไปที่อีเมลแล้ว!");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 font-sans text-slate-200 relative overflow-hidden">
      
      {/* Background Decor (Cyberpunk Style) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />
      </div>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        
        {/* State 1: ส่งสำเร็จ */}
        {isSent ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 border border-green-500/30 shadow-lg shadow-green-900/20">
              <CheckCircle size={40} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">เช็คอีเมลของคุณ</h1>
            <p className="text-slate-400 mb-8">
              เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่ <br/> 
              <span className="font-bold text-white">{email}</span> แล้ว
            </p>
            <Link 
              href="/login" 
              className="block w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          /* State 2: ฟอร์มกรอกอีเมล */
          <>
            <div className="mb-8">
              <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors group">
                <ArrowLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับ
              </Link>
              
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-900/20">
                <Mail size={24} />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">ลืมรหัสผ่าน?</h1>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                ไม่ต้องห่วง! กรอกอีเมลที่คุณใช้สมัครสมาชิก <br className="hidden sm:block"/>
                เดี๋ยวเราส่งวิธีตั้งรหัสใหม่ไปให้ครับ
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">อีเมลของคุณ</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Mail className="text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "ส่งลิงก์รีเซ็ต"}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}