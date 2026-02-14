"use client";

import { createArticle } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Image as ImageIcon, ArrowLeft, Loader2, Type, AlignLeft, FileText, ImagePlus } from "lucide-react";
import Link from "next/link";

export default function CreateArticlePage() {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  // ฟังก์ชันแสดงตัวอย่างรูปภาพ
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
    const result = await createArticle(formData);
    
    setLoading(false);

    if (result.success) {
        // ใช้ Toast หรือ UI สวยๆ แทน Alert เดิม
        router.push("/admin/articles");
        router.refresh();
    } else {
        alert(result.error);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <Link href="/admin/articles" className="inline-flex items-center text-slate-400 hover:text-white mb-2 text-sm transition-colors group">
                <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปหน้ารวม
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="p-2 bg-pink-500/10 rounded-lg text-pink-500"><FileText size={28} /></span>
                เขียนบทความใหม่
            </h1>
          </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* --- Left Column: Content Editor --- */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Title Input */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-1">
                    <Type size={14} /> หัวข้อบทความ
                </label>
                <input 
                    name="title" 
                    required 
                    placeholder="เช่น: สอนเขียน Next.js ฉบับจับมือทำ..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
            </div>

            {/* Content Textarea */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col min-h-[500px]">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-1">
                    <AlignLeft size={14} /> เนื้อหา (Markdown / HTML)
                </label>
                <textarea 
                    name="content" 
                    required 
                    placeholder="เริ่มเขียนเรื่องราวของคุณที่นี่..." 
                    className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 font-mono text-sm leading-relaxed focus:outline-none focus:border-pink-500 transition-all resize-none scrollbar-thin scrollbar-thumb-slate-700"
                ></textarea>
                <div className="mt-2 text-right text-xs text-slate-500">
                    รองรับ Markdown Styling **bold**, *italic*, # header
                </div>
            </div>
         </div>

         {/* --- Right Column: Settings & Sidebar --- */}
         <div className="space-y-6 lg:sticky lg:top-8 h-fit">
            
            {/* Publish Button */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">การเผยแพร่</h3>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-pink-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> เผยแพร่บทความ</>}
                </button>
            </div>

            {/* Cover Image Upload */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={16} className="text-pink-500" /> ภาพปก
                </h3>
                
                <div className={`border-2 border-dashed rounded-xl overflow-hidden transition-all relative group ${previewUrl ? 'border-pink-500/50' : 'border-slate-700 hover:border-pink-500/50 hover:bg-slate-800/50'}`}>
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
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-pink-500/20 group-hover:text-pink-400 transition-colors">
                                <ImagePlus size={24} className="text-slate-500 group-hover:text-pink-400" />
                            </div>
                            <span className="text-slate-400 text-sm font-medium block group-hover:text-white transition-colors">คลิกเพื่ออัปโหลด</span>
                            <span className="text-slate-600 text-xs mt-1 block">PNG, JPG (แนะนำ 16:9)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Excerpt */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">คำโปรย (Excerpt)</label>
                <textarea 
                    name="excerpt" 
                    rows={4}
                    placeholder="สรุปสั้นๆ ให้คนอยากอ่าน..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-pink-500 transition-all resize-none placeholder-slate-600"
                ></textarea>
            </div>

         </div>

      </form>
    </div>
  );
}