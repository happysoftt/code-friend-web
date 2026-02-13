"use client";

import { submitShowcase } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadCloud, Loader2, Image as ImageIcon, ArrowLeft, Type, AlignLeft, Globe, Github, ImagePlus } from "lucide-react";

// ✅ Import ของแต่งหล่อ
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function SubmitShowcasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await submitShowcase(formData);
    
    setLoading(false);

    if (res.success) {
        // 🎉 ใช้ SweetAlert แสดงความยินดีแบบอลังการ
        await MySwal.fire({
            title: 'ส่งผลงานสำเร็จ!',
            text: 'ขอบคุณที่ร่วมสนุก ผลงานของคุณจะแสดงหลังจากผ่านการตรวจสอบครับ',
            icon: 'success',
            background: '#1e293b', // สีพื้นหลัง Dark Mode (Slate-800)
            color: '#fff',
            confirmButtonText: 'กลับไปดูผลงาน',
            confirmButtonColor: '#4f46e5', // สี Indigo-600
            padding: '2em',
            customClass: {
                popup: 'rounded-3xl border border-slate-700 shadow-2xl',
                title: 'text-2xl font-bold',
                htmlContainer: 'text-slate-300'
            }
        });
        
        router.push("/showcase");
    } else {
        // ❌ ใช้ Toast แจ้ง Error เล็กๆ
        toast.error(res.error || "เกิดข้อผิดพลาดในการส่งข้อมูล", {
            style: {
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #ef4444'
            }
        });
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white py-12 selection:bg-indigo-500/30 relative overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 p-64 bg-indigo-600/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 left-0 p-64 bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        
        {/* Back Button */}
        <Link href="/showcase" className="inline-flex items-center text-slate-400 hover:text-white mb-8 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปหน้า Showcase
        </Link>

        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-lg shadow-indigo-900/20">
                <UploadCloud size={32} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">ส่งผลงานเข้าประกวด 🚀</h1>
            <p className="text-slate-400">โชว์ฝีมือของคุณให้โลกเห็น! (ผลงานจะแสดงหลังจากผ่านการตรวจสอบ)</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            
            {/* Title */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">ชื่อผลงาน</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Type className="text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    </div>
                    <input 
                        name="title" 
                        required 
                        placeholder="เช่น: เว็บ Portfolio สุดเท่" 
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600" 
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">รายละเอียด</label>
                <div className="relative group">
                    <div className="absolute top-3 left-3 pointer-events-none">
                        <AlignLeft className="text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    </div>
                    <textarea 
                        name="description" 
                        rows={3} 
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600 resize-none" 
                        placeholder="อธิบายเกี่ยวกับโปรเจกต์นี้ เทคโนโลยีที่ใช้ หรือแรงบันดาลใจ..."
                    ></textarea>
                </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Demo URL (ถ้ามี)</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Globe className="text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        </div>
                        <input name="demoUrl" placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-600 text-sm" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">GitHub URL (ถ้ามี)</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Github className="text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                        </div>
                        <input name="githubUrl" placeholder="https://github.com/..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-600 text-sm" />
                    </div>
                </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">รูปตัวอย่าง (Screenshot)</label>
                
                <div className={`border-2 border-dashed rounded-xl p-8 text-center relative transition-all group ${previewUrl ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50'}`}>
                    <input 
                        type="file" 
                        name="image" 
                        accept="image/*" 
                        required 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                    />
                    
                    {previewUrl ? (
                        <div className="relative z-10">
                            <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-lg mb-2" />
                            <p className="text-indigo-400 text-sm font-medium flex items-center justify-center gap-2">
                                <ImagePlus size={16} /> {fileName}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">คลิกเพื่อเปลี่ยนรูป</p>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                                <ImageIcon size={24} className="text-slate-500 group-hover:text-indigo-400" />
                            </div>
                            <span className="text-slate-300 font-medium block">คลิกเพื่ออัปโหลดรูปภาพ</span>
                            <span className="text-slate-500 text-xs mt-1 block">รองรับ JPG, PNG (Max 5MB)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
                {loading ? <Loader2 className="animate-spin" /> : <><UploadCloud size={20} /> ส่งผลงาน</>}
            </button>
        </form>
      </div>
    </div>
  );
}