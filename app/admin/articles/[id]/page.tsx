import { prisma } from "@/lib/prisma";
import { updateArticle } from "@/lib/actions"; 
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileText, Image as ImageIcon, AlignLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SubmitButton from "@/components/admin/SubmitButton"; // Import ปุ่มที่สร้าง

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // ดึงข้อมูลบทความ
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) return notFound();

  // Server Action
  async function updateAction(formData: FormData) {
    "use server";
    await updateArticle(formData);
    redirect("/admin/articles");
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
      
      <form action={updateAction} className="space-y-6">
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
                    
                    {article.coverImage ? (
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-700 mb-4 group">
                            <Image src={article.coverImage} alt="Cover" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                                รูปปัจจุบัน
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-video bg-slate-950 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-600 mb-4">
                            <ImageIcon size={32} />
                        </div>
                    )}

                    <div className="relative">
                        <input 
                            type="file" 
                            name="coverImage" 
                            accept="image/*" 
                            className="block w-full text-sm text-slate-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-xs file:font-semibold
                            file:bg-purple-500/10 file:text-purple-400
                            hover:file:bg-purple-500/20
                            cursor-pointer" 
                        />
                        <p className="text-[10px] text-slate-500 mt-2 ml-1">อัปโหลดใหม่เพื่อเปลี่ยนรูปเดิม</p>
                    </div>
                </div>

                {/* Publish Status (Example Mockup) */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-4 ml-1">การตั้งค่า</label>
                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4">
                        <span className="text-sm text-slate-300">สถานะ</span>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">เผยแพร่แล้ว</span>
                    </div>
                    
                    <div className="border-t border-slate-800 my-4"></div>

                    <SubmitButton label="บันทึกการแก้ไข" />
                </div>
            </div>
        </div>

      </form>
    </div>
  );
}