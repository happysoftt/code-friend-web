"use client";

import { createArticle } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Image as ImageIcon, ArrowLeft, Loader2, Type, AlignLeft, FileText, X } from "lucide-react";
import Link from "next/link";
// ✅ เพิ่ม Import UploadButton
import { UploadButton } from "../../../../utils/uploadthing";

export default function CreateArticlePage() {
  const [loading, setLoading] = useState(false);
  // ✅ เปลี่ยนมาเก็บ URL จริงจาก UploadThing
  const [imageUrl, setImageUrl] = useState<string>(""); 
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // ✅ เช็คก่อนว่าอัปรูปหรือยัง
    if (!imageUrl) {
        alert("กรุณาอัปโหลดรูปปกบทความก่อนครับ");
        return;
    }

    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    // ✅ ส่ง URL รูปไปแทนไฟล์ดิบ
    formData.set("image", imageUrl);

    const result = await createArticle(formData);
    
    setLoading(false);

    if (result.success) {
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
                    disabled={loading || !imageUrl}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-pink-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> เผยแพร่บทความ</>}
                </button>
            </div>

            {/* ✅ Cover Image Upload (UploadThing) */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={16} className="text-pink-500" /> ภาพปก
                </h3>
                
                <div className={`border-2 border-dashed rounded-xl overflow-hidden transition-all relative group p-4 flex flex-col items-center justify-center ${imageUrl ? 'border-pink-500/50' : 'border-slate-700 hover:border-pink-500/50 hover:bg-slate-800/50'}`}>
                    
                    {imageUrl ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => setImageUrl("")}
                                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <UploadButton
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                    setImageUrl(res[0].url);
                                    alert("อัปโหลดสำเร็จ!");
                                }}
                                onUploadError={(error: Error) => {
                                    alert(`Error: ${error.message}`);
                                }}
                                appearance={{
                                    button: "bg-pink-600 hover:bg-pink-500 focus-within:ring-pink-600 after:bg-pink-600",
                                    container: "p-2",
                                    allowedContent: "text-slate-400 text-xs"
                                }}
                            />
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