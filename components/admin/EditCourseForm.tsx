"use client";

import { updateLearningPath } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Image as ImageIcon, Loader2, Type, AlignLeft, BookOpen } from "lucide-react";
import Image from "next/image";

// ✅ Import ของแต่งหล่อ
import toast from "react-hot-toast";

interface EditCourseFormProps {
  initialData: {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    published: boolean;
    slug: string;
  };
}

export default function EditCourseForm({ initialData }: EditCourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData.image);
  const [published, setPublished] = useState(initialData.published);

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
    const result = await updateLearningPath(formData);
    setLoading(false);

    if (result?.error) {
        toast.error(result.error); // ❌ แจ้งเตือนสีแดง
    } else {
        toast.success("บันทึกคอร์สเรียนเรียบร้อย!"); // ✅ แจ้งเตือนสีเขียว
        router.push("/admin/learn");
        router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <input type="hidden" name="id" value={initialData.id} />
         
         {/* --- Left Column: Content Editor --- */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Title Input */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-1">
                    <Type size={14} /> ชื่อคอร์ส
                </label>
                <input 
                    name="title" 
                    defaultValue={initialData.title}
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
            </div>

            {/* Description Textarea */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col h-full">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-1">
                    <AlignLeft size={14} /> รายละเอียดคอร์ส
                </label>
                <textarea 
                    name="description" 
                    defaultValue={initialData.description || ""}
                    rows={8}
                    className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 font-mono text-sm leading-relaxed focus:outline-none focus:border-purple-500 transition-all resize-none scrollbar-thin scrollbar-thumb-slate-700"
                ></textarea>
            </div>
         </div>

         {/* --- Right Column: Settings & Sidebar --- */}
         <div className="space-y-6 lg:sticky lg:top-8 h-fit">
            
            {/* Save Button */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">บันทึกการเปลี่ยนแปลง</h3>
                
                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl mb-4 cursor-pointer hover:border-slate-700 transition-colors" onClick={() => setPublished(!published)}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${published ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                            <BookOpen size={18} />
                        </div>
                        <span className="text-sm font-medium text-slate-300">{published ? "เผยแพร่แล้ว" : "ซ่อนคอร์ส"}</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${published ? 'bg-green-500' : 'bg-slate-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${published ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <input type="hidden" name="published" value={published ? "true" : "false"} />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึกข้อมูล</>}
                </button>
            </div>

            {/* Cover Image Upload */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={16} className="text-purple-500" /> ภาพปกคอร์ส
                </h3>
                
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
                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold z-10 pointer-events-none">
                                คลิกเพื่อเปลี่ยนรูป
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                                <ImageIcon size={24} className="text-slate-500 group-hover:text-purple-400" />
                            </div>
                            <span className="text-slate-400 text-sm font-medium block">อัปโหลดรูปภาพ</span>
                        </div>
                    )}
                </div>
            </div>
         </div>
    </form>
  );
}