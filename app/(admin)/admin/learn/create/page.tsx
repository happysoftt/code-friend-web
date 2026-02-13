"use client";

import { createLearningPath } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Image as ImageIcon, ArrowLeft, Loader2, GraduationCap, Type, AlignLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCoursePage() {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createLearningPath(formData);
    setLoading(false);

    if (result.success) {
        router.push("/admin/learn");
        router.refresh();
    } else {
        alert(result.error);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/learn" className="inline-flex items-center text-slate-400 hover:text-white mb-4 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปจัดการคอร์สเรียน
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="p-3 bg-purple-500/10 rounded-xl text-purple-500"><GraduationCap size={28} /></span>
            สร้างคอร์สเรียนใหม่
        </h1>
        <p className="text-slate-400 mt-2 ml-1">เริ่มสร้างเส้นทางการเรียนรู้เพื่อแบ่งปันความรู้</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          
          {/* Title Input */}
          <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                  <Type size={14} /> ชื่อคอร์ส (Title)
              </label>
              <input 
                  name="title" 
                  required 
                  placeholder="เช่น: Fullstack Next.js 14 Masterclass" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
          </div>

          {/* Description Input */}
          <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                  <AlignLeft size={14} /> รายละเอียด (Description)
              </label>
              <textarea 
                  name="description" 
                  rows={4}
                  placeholder="อธิบายสั้นๆ ว่าคอร์สนี้เกี่ยวกับอะไร เหมาะกับใคร..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed focus:outline-none focus:border-purple-500 transition-all resize-none scrollbar-thin scrollbar-thumb-slate-700"
              />
          </div>

          {/* Image Upload */}
          <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                  <ImageIcon size={14} /> รูปปกคอร์ส (Thumbnail)
              </label>
              
              <div className={`border-2 border-dashed rounded-xl overflow-hidden transition-all relative group ${previewUrl ? 'border-purple-500/50' : 'border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/50'}`}>
                  <input 
                      type="file" 
                      name="image" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                  />
                  
                  {previewUrl ? (
                      <div className="relative aspect-video">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold z-10 pointer-events-none">
                              คลิกเพื่อเปลี่ยนรูป
                          </div>
                      </div>
                  ) : (
                      <div className="p-12 text-center">
                          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                              <ImageIcon size={32} className="text-slate-500 group-hover:text-purple-400" />
                          </div>
                          <span className="text-slate-400 text-sm font-medium block group-hover:text-white transition-colors">คลิกเพื่ออัปโหลดรูปภาพ</span>
                          <span className="text-slate-600 text-xs mt-1 block">JPG, PNG (แนะนำ 16:9)</span>
                      </div>
                  )}
              </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
              <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> สร้างคอร์สเรียน</>}
              </button>
          </div>

      </form>
    </div>
  );
}