"use client";

import { updateLesson } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Youtube, Loader2, ListOrdered, Type, FileText } from "lucide-react";

// ✅ Import ของแต่งหล่อ
import toast from "react-hot-toast";

interface EditLessonFormProps {
  initialData: {
    id: string;
    title: string;
    order: number;
    videoUrl: string;
    content: string | null;
    courseId: string;
  };
}

export default function EditLessonForm({ initialData }: EditLessonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateLesson(formData);
    setLoading(false);

    if (result?.error) {
        toast.error(result.error); // ❌ แจ้งเตือนสีแดง
    } else {
        toast.success("บันทึกการแก้ไขเรียบร้อย!"); // ✅ แจ้งเตือนสีเขียว
        router.push(`/admin/learn/${initialData.courseId}`);
        router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
        <input type="hidden" name="id" value={initialData.id} />
        <input type="hidden" name="courseId" value={initialData.courseId} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Order Input */}
            <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                    <ListOrdered size={14} /> ลำดับตอน
                </label>
                <input 
                    name="order" 
                    type="number"
                    defaultValue={initialData.order}
                    required 
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
                    defaultValue={initialData.title}
                    required 
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
                    defaultValue={initialData.videoUrl}
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-blue-400 font-mono text-sm focus:outline-none focus:border-purple-500 transition-all"
                />
            </div>
        </div>

        {/* Content Textarea */}
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                <FileText size={14} /> เนื้อหาประกอบ (Description / Code Snippet)
            </label>
            <textarea 
                name="content" 
                defaultValue={initialData.content || ""}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 font-mono text-sm leading-relaxed focus:outline-none focus:border-purple-500 transition-all resize-y scrollbar-thin scrollbar-thumb-slate-700"
            />
        </div>

        <div className="pt-6 border-t border-slate-800">
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึกการแก้ไข</>}
            </button>
        </div>

    </form>
  );
}