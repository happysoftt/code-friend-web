"use client";

import { createCategory } from "@/lib/actions"; // อย่าลืมสร้าง Action นี้นะครับ
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, ArrowLeft, Loader2, FolderTree, Type, Link as LinkIcon, AlignLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // ฟังก์ชันสร้าง Slug อัตโนมัติจากชื่อ
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // แปลงเป็น Slug อย่างง่าย (ภาษาอังกฤษ)
    const generatedSlug = val.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    setSlug(generatedSlug);
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    // เรียก Server Action
    const result = await createCategory(formData);
    setLoading(false);

    if (result?.error) {
        alert(result.error);
    } else {
        router.push("/admin/categories");
        router.refresh();
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/categories" className="inline-flex items-center text-slate-400 hover:text-white mb-4 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปจัดการหมวดหมู่
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><FolderTree size={28} /></span>
            สร้างหมวดหมู่ใหม่
        </h1>
        <p className="text-slate-400 mt-2 ml-1">เพิ่มหมวดหมู่เพื่อจัดระเบียบสินค้าและบทความ</p>
      </div>

      <form action={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
        
        {/* Name Input */}
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                <Type size={14} /> ชื่อหมวดหมู่
            </label>
            <input 
                name="name" 
                value={name}
                onChange={handleNameChange}
                required 
                placeholder="เช่น: Web Development" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
            />
        </div>

        {/* Slug Input */}
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                <LinkIcon size={14} /> URL Slug (ภาษาอังกฤษ)
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-mono">
                    /
                </div>
                <input 
                    name="slug" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required 
                    placeholder="web-development" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-amber-400 font-mono text-sm focus:outline-none focus:border-amber-500 transition-all" 
                />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 ml-1">*ใช้สำหรับ URL (เช่น store/category/web-development)</p>
        </div>

        {/* Description Input (Optional) */}
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                <AlignLeft size={14} /> รายละเอียด (ไม่บังคับ)
            </label>
            <textarea 
                name="description" 
                rows={3}
                placeholder="คำอธิบายสั้นๆ เกี่ยวกับหมวดหมู่นี้..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-amber-500 transition-all resize-none" 
            />
        </div>

        <div className="pt-4 border-t border-slate-800">
            <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-amber-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึกหมวดหมู่</>}
            </button>
        </div>

      </form>
    </div>
  );
}