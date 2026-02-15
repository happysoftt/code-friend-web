"use client";

import { updateArticle } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, FileText, Image as ImageIcon, AlignLeft, ArrowLeft, Loader2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// ✅ Import UploadButton (ตรวจสอบ path ให้ตรงกับโปรเจกต์ของคุณ)
import { UploadButton } from "../../app/utils/uploadthing";
// กำหนด Type ของข้อมูลบทความที่รับเข้ามา
interface Article {
  id: string;
  title: string;
  content: string;
  coverImage: string | null;
  published: boolean;
}

export default function EditArticleForm({ article }: { article: Article }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // ✅ ใช้ State เก็บรูป โดยเริ่มต้นจากรูปเดิมใน Database
  const [imageUrl, setImageUrl] = useState<string>(article.coverImage || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // ✅ ส่ง URL รูปล่าสุด (ไม่ว่าจะรูปเดิมหรือรูปใหม่) ไปที่ Server Action
    formData.set("image", imageUrl); 

    const result = await updateArticle(formData);
    
    setLoading(false);

    if (result.success) {
      router.push("/admin/articles");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/articles" className="inline-flex items-center text-slate-400 hover:text-white mb-6 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปหน้ารายการ
        </Link>
        <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <FileText className="text-purple-400" size={24} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">แก้ไขบทความ</h1>
                <p className="text-slate-400 text-sm">แก้ไขเนื้อหา รูปภาพ หรือสถานะของบทความ</p>
            </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="id" value={article.id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Main Content */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Title Input */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">หัวข้อบทความ</label>
                    <input 
                        name="title" 
                        defaultValue={article.title} 
                        required 
                        placeholder="ใส่ชื่อบทความที่น่าสนใจ..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-lg font-bold placeholder-slate-600 transition-all" 
                    />
                </div>

                {/* Content Editor */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col h-full">
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1 flex items-center gap-2">
                        <AlignLeft size={14} /> เนื้อหา (Markdown)
                    </label>
                    <textarea 
                        name="content" 
                        defaultValue={article.content}
                        required 
                        rows={20} 
                        placeholder="เขียนเนื้อหาบทความที่นี่... รองรับ Markdown"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 font-mono text-sm leading-relaxed focus:border-purple-500 outline-none resize-y scrollbar-thin scrollbar-thumb-slate-700" 
                    />
                </div>
            </div>

            {/* Right Column: Settings & Image */}
            <div className="space-y-6">
                
                {/* Image Upload */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-4 ml-1 flex items-center gap-2">
                        <ImageIcon size={14} /> รูปภาพปก
                    </label>
                    
                    <div className={`relative w-full rounded-xl overflow-hidden border border-slate-700 mb-4 bg-slate-950 flex flex-col items-center justify-center p-4 ${!imageUrl ? 'border-dashed py-10' : ''}`}>
                        
                        {imageUrl ? (
                            <div className="relative w-full aspect-video">
                                <Image src={imageUrl} alt="Cover" fill className="object-cover rounded-lg" />
                                <button 
                                    type="button"
                                    onClick={() => setImageUrl("")}
                                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full transition-all z-10"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <UploadButton
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        setImageUrl(res[0].url);
                                        alert("อัปเดตรูปภาพสำเร็จ!");
                                    }}
                                    onUploadError={(error: Error) => {
                                        alert(`Error: ${error.message}`);
                                    }}
                                    appearance={{
                                        button: "bg-purple-600 hover:bg-purple-500 focus-within:ring-purple-600 after:bg-purple-600",
                                        container: "p-2",
                                        allowedContent: "text-slate-400 text-xs"
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Publish Status & Submit */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-4 ml-1">การดำเนินการ</label>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึกการแก้ไข</>}
                    </button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}