"use client";

import { createLearningPath } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, ArrowLeft, Loader2, GraduationCap, Type, AlignLeft, X } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "../../../../utils/uploadthing"; // ✅ มั่นใจว่า path นี้ถูกต้องตามโปรเจกต์คุณ

export default function CreateCoursePage() {
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(""); // ✅ เก็บ URL จาก Cloud
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!thumbnailUrl) {
      alert("กรุณาอัปโหลดรูปภาพให้เสร็จก่อนครับ");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // ✅ ส่ง URL รูปที่ได้จาก Uploadthing แทนการส่งไฟล์ File
    formData.set("thumbnail", thumbnailUrl); 

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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all"
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
                  placeholder="อธิบายสั้นๆ ว่าคอร์สนี้เกี่ยวกับอะไร..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed focus:outline-none focus:border-purple-500 transition-all resize-none"
              />
          </div>

          {/* 📸 Image Upload Section (Client-side) */}
          <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                  รูปปกคอร์ส (Thumbnail)
              </label>
              
              <div className="bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-2xl p-4 transition-all">
                  {thumbnailUrl ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden group">
                        <img src={thumbnailUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => setThumbnailUrl("")}
                            className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center">
                        <UploadButton
                            endpoint="imageUploader"
                            onClientUploadComplete={(res) => {
                                setThumbnailUrl(res[0].url);
                                alert("อัปโหลดสำเร็จ!");
                            }}
                            onUploadError={(error: Error) => {
                                alert(`Error: ${error.message}`);
                            }}
                            appearance={{
                                button: "bg-purple-600 after:bg-purple-700 focus-within:ring-purple-600",
                                container: "w-max",
                                allowedContent: "text-slate-500"
                            }}
                        />
                    </div>
                  )}
              </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
              <button 
                  type="submit" 
                  disabled={loading || !thumbnailUrl}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                  {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> สร้างคอร์สเรียน</>}
              </button>
          </div>
      </form>
    </div>
  );
}