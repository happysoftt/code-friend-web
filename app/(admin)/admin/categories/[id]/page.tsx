import { prisma } from "@/lib/prisma";
import { updateCategory } from "@/lib/actions"; // อย่าลืมสร้าง Action นี้นะครับ
import { notFound, redirect } from "next/navigation";
import { Save, ArrowLeft, FolderTree, Type, Link as LinkIcon, AlignLeft } from "lucide-react";
import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton"; // ใช้ปุ่มที่เราเคยสร้างไว้ (ถ้ามี) หรือใช้ button ปกติก็ได้

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // ดึงข้อมูลเดิม
  const category = await prisma.category.findUnique({
    where: { id }
  });

  if (!category) return notFound();

  // Server Action สำหรับ Update
  async function updateAction(formData: id, FormData) {
    "use server";
    await updateCategory(formData);
    redirect("/admin/categories");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/categories" className="inline-flex items-center text-slate-400 hover:text-white mb-4 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปจัดการหมวดหมู่
        </Link>
        <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <FolderTree className="text-amber-500" size={24} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">แก้ไขหมวดหมู่</h1>
                <p className="text-slate-400 text-sm">แก้ไขข้อมูล: {category.name}</p>
            </div>
        </div>
      </div>

      <form action={updateAction} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
        <input type="hidden" name="id" value={category.id} />

        {/* Name Input */}
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                <Type size={14} /> ชื่อหมวดหมู่
            </label>
            <input 
                name="name" 
                defaultValue={category.name}
                required 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
            />
        </div>

        {/* Slug Input */}
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                <LinkIcon size={14} /> URL Slug
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-mono">/</div>
                <input 
                    name="slug" 
                    defaultValue={category.slug}
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-amber-400 font-mono text-sm focus:outline-none focus:border-amber-500 transition-all" 
                />
            </div>
        </div>

        {/* Description Input */}
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                <AlignLeft size={14} /> รายละเอียด
            </label>
            <textarea 
                name="description" 
                defaultValue={category.description || ""}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-amber-500 transition-all resize-none" 
            />
        </div>

        <div className="pt-4 border-t border-slate-800">
            {/* ถ้าคุณมี SubmitButton component ให้ใช้ตัวนั้น ถ้าไม่มีให้ใช้ button ธรรมดา */}
            <button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-amber-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Save size={20} /> บันทึกการแก้ไข
            </button>
        </div>

      </form>
    </div>
  );
}