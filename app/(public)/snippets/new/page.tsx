"use client";

import { createSnippet } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Code2, Save, Loader2, ArrowLeft, Type, FileCode, AlignLeft, Terminal } from "lucide-react";

// ✅ Import ของแต่งหล่อ
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function NewSnippetPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    
    // เรียก Server Action
    const res = await createSnippet(formData);
    
    setLoading(false);

    if (res.success) {
        // 🎉 ใช้ SweetAlert แสดงความยินดี
        await MySwal.fire({
            title: 'บันทึก Snippet สำเร็จ!',
            text: 'ขอบคุณที่แบ่งปันความรู้ครับ',
            icon: 'success',
            background: '#0f172a', // สีพื้นหลัง Dark Mode (Slate-900)
            color: '#fff',
            confirmButtonText: 'ไปดู Snippet',
            confirmButtonColor: '#10b981', // สีเขียว (Emerald-500)
            padding: '2em',
            customClass: {
                popup: 'rounded-3xl border border-slate-700 shadow-2xl',
                title: 'text-2xl font-bold',
                htmlContainer: 'text-slate-300'
            }
        });
        
        router.push("/snippets");
    } else {
        // ❌ ใช้ Toast แจ้ง Error
        toast.error(res.error || "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง", {
            style: {
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #ef4444'
            }
        });
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white py-12 selection:bg-green-500/30 relative overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 p-64 bg-green-600/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 right-0 p-64 bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        
        {/* Back Button */}
        <Link href="/snippets" className="inline-flex items-center text-slate-400 hover:text-white mb-8 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปหน้า Snippets
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/20 shadow-lg shadow-green-900/20">
                <Code2 className="text-green-400" size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Create Snippet</h1>
                <p className="text-slate-400 mt-1">แชร์เทคนิคการเขียนโค้ด หรือฟังก์ชันที่มีประโยชน์</p>
            </div>
        </div>

        <form action={handleSubmit} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Top Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 opacity-50" />

            {/* Title & Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">ชื่อ Snippet</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Type className="text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
                        </div>
                        <input 
                            name="title" 
                            required 
                            placeholder="เช่น: useLocalStorage Hook" 
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-slate-600" 
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">ภาษา (Language)</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileCode className="text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
                        </div>
                        <select 
                            name="language" 
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="tsx">React (TSX)</option>
                            <option value="jsx">React (JSX)</option>
                            <option value="css">CSS / Tailwind</option>
                            <option value="python">Python</option>
                            <option value="sql">SQL</option>
                            <option value="go">Go (Golang)</option>
                            <option value="json">JSON</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">คำอธิบายสั้นๆ</label>
                <div className="relative group">
                    <div className="absolute top-3 left-3 pointer-events-none">
                        <AlignLeft className="text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
                    </div>
                    <input 
                        name="description" 
                        placeholder="โค้ดนี้ใช้ทำอะไร มีประโยชน์อย่างไร..." 
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-slate-600" 
                    />
                </div>
            </div>

            {/* Code Editor Area */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                    <Terminal size={14} /> Source Code
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#1e1e1e] group focus-within:ring-2 focus-within:ring-green-500 transition-all shadow-inner">
                    {/* Fake IDE Header */}
                    <div className="bg-[#252526] px-4 py-2 border-b border-slate-700/50 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <span className="text-xs text-slate-500 ml-2 font-mono">editor.tsx</span>
                    </div>
                    <textarea 
                        name="code" 
                        required 
                        rows={15} 
                        className="w-full bg-[#1e1e1e] p-4 text-green-400 font-mono text-sm leading-relaxed outline-none resize-none placeholder-slate-600 scrollbar-thin scrollbar-thumb-slate-700"
                        placeholder="// วางโค้ดของคุณที่นี่..."
                        spellCheck={false}
                    ></textarea>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex gap-4">
                <Link href="/snippets" className="flex-1 py-3.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-center">
                    ยกเลิก
                </Link>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-[2] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึก Snippet</>}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}