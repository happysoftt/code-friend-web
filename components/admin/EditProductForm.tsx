"use client";

import { updateProduct } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Image as ImageIcon, Link as LinkIcon, DollarSign, Loader2, Sparkles, FolderTree } from "lucide-react";
import Image from "next/image";

// ✅ Import ของแต่งหล่อ
import toast from "react-hot-toast";

interface EditProductFormProps {
  product: any;
  categories: any[];
}

export default function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(product.image);
  
  const [isFree, setIsFree] = useState(product.isFree || product.price === 0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateProduct(formData); 
    setLoading(false);

    if (result?.error) {
        toast.error(result.error); // ❌ แจ้งเตือนสีแดง
    } else {
        toast.success("บันทึกข้อมูลเรียบร้อย!"); // ✅ แจ้งเตือนสีเขียว
        router.push("/admin/store");
        router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <input type="hidden" name="id" value={product.id} />
        
        {/* --- Left Column: Main Info --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Name */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 block">ชื่อสินค้า</label>
                <input 
                    name="name" 
                    defaultValue={product.name || product.title}
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                />
            </div>

            {/* Description */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 block">รายละเอียดสินค้า</label>
                <textarea 
                    name="description" 
                    defaultValue={product.description || ""}
                    rows={6} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed focus:outline-none focus:border-emerald-500 transition-all resize-y scrollbar-thin scrollbar-thumb-slate-700"
                />
            </div>

            {/* File URL */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                    <LinkIcon size={14} /> ลิงก์ดาวน์โหลด
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LinkIcon className="text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    </div>
                    <input 
                        name="fileUrl" 
                        defaultValue={product.fileUrl || ""}
                        required 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-blue-400 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-all" 
                    />
                </div>
            </div>
        </div>

        {/* --- Right Column: Settings --- */}
        <div className="space-y-6 lg:sticky lg:top-8 h-fit">
            
            {/* Save Button */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">บันทึกการเปลี่ยนแปลง</h3>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึกข้อมูล</>}
                </button>
            </div>

            {/* Price & Free Toggle */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-500" /> ราคา
                </h3>
                
                {/* Toggle Free */}
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl mb-4 cursor-pointer hover:border-slate-700 transition-colors" onClick={() => setIsFree(!isFree)}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isFree ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                            <Sparkles size={18} />
                        </div>
                        <span className="text-sm font-medium text-slate-300">แจกฟรี</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isFree ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isFree ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <input type="hidden" name="isFree" value={isFree ? "true" : "false"} />
                </div>

                {/* Price Input */}
                <div className={`transition-all duration-300 ${isFree ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-bold">฿</span>
                        </div>
                        <input 
                            name="price" 
                            type="number" 
                            disabled={isFree}
                            defaultValue={product.price}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white font-mono text-lg font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                        />
                    </div>
                </div>
            </div>

            {/* Category */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                    <FolderTree size={14} /> หมวดหมู่
                </label>
                <div className="relative">
                    <select 
                        name="categoryId" 
                        defaultValue={product.categoryId || ""}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 transition-all"
                    >
                        <option value="">-- เลือกหมวดหมู่ --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Image Upload */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={16} className="text-emerald-500" /> รูปปกสินค้า
                </h3>
                
                <div className={`border-2 border-dashed rounded-xl overflow-hidden transition-all relative group ${preview ? 'border-emerald-500/50' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50'}`}>
                    <input 
                        type="file" 
                        name="image" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                    />
                    
                    {preview ? (
                        <div className="relative aspect-video">
                            <Image src={preview} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold z-10 pointer-events-none">
                                คลิกเพื่อเปลี่ยนรูป
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <span className="text-slate-400 text-sm font-medium">อัปโหลดรูปภาพ</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    </form>
  );
}