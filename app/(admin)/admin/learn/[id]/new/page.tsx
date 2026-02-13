"use client";

import { createLesson } from "@/lib/actions";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Save, ArrowLeft, Loader2, Youtube, ListOrdered, FileText, Type } from "lucide-react";
import Link from "next/link";

export default function NewLessonPage() {
  const params = useParams(); // ดึง courseId จาก URL
  const courseId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("courseId", courseId); // แนบ ID คอร์สไปด้วย
    
    const result = await createLesson(formData);
    setLoading(false);

    if (result.success) {
        router.push(`/admin/learn/${courseId}`); // กลับไปหน้ารายการบทเรียน
        router.refresh();
    } else {
        alert(result.error);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <Link href={`/admin/learn/${courseId}`} className="inline-flex items-center text-slate-400 hover:text-white mb-4 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> ยกเลิกและกลับไป
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="p-3 bg-purple-500/10 rounded-xl text-purple-500"><Youtube size={28} /></span>
            เพิ่มบทเรียนใหม่
        </h1>
        <p className="text-slate-400 mt-2 ml-1">เพิ่มเนื้อหาวิดีโอและรายละเอียดสำหรับคอร์สนี้</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Order Input */}
              <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                      <ListOrdered size={14} /> ลำดับตอน
                  </label>
                  <input 
                      name="order" 
                      type="number"
                      required 
                      placeholder="1" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-center text-lg focus:outline-none focus:border-purple-500 transition-all"
                  />
              </div>

              {/* Title Input */}
              <div className="md:col-span-3">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                      <Type size={14} /> ชื่อตอน (Episode Title)
                  </label>
                  <input 
                      name="title" 
                      required 
                      placeholder="เช่น: ติดตั้งโปรแกรม VS Code" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
              </div>
          </div>

          {/* Video URL Input */}
          <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                  <Youtube size={14} /> ลิงก์วิดีโอ (YouTube URL)
              </label>
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Youtube className="text-red-500 group-focus-within:text-red-400 transition-colors" size={20} />
                  </div>
                  <input 
                      name="videoUrl" 
                      required 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-blue-400 font-mono text-sm focus:outline-none focus:border-purple-500 transition-all"
                  />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 ml-1 flex items-center gap-1">
                  * แนะนำ: อัปโหลดลง YouTube แบบ <strong>Unlisted</strong> แล้วนำลิงก์มาแปะ
              </p>
          </div>

          {/* Description Textarea */}
          <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                  <FileText size={14} /> เนื้อหาประกอบ (Description / Code Snippet)
              </label>
              <textarea 
                  name="content" 
                  rows={6}
                  placeholder="รายละเอียดเพิ่มเติม ลิงก์ดาวน์โหลด หรือโค้ดตัวอย่าง..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 font-mono text-sm leading-relaxed focus:outline-none focus:border-purple-500 transition-all resize-y scrollbar-thin scrollbar-thumb-slate-700"
              />
          </div>

          <div className="pt-6 border-t border-slate-800">
              <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึกบทเรียน</>}
              </button>
          </div>

      </form>
    </div>
  );
}