"use client";

import { updateProduct } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Package, ArrowLeft, Loader2, Image as ImageIcon, X, FolderTree } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// ✅ Import แบบ Relative Path ที่ถูกต้อง
import { UploadButton } from "../../app/utils/uploadthing";

// ✅ 1. เพิ่ม Type Category
interface Category {
  id: string;
  name: string;
}

// ✅ 2. อัปเดต Type Product
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string | null;
  isFree: boolean;
  isActive: boolean;
  slug: string;
  categoryId: string | null;
}

// ✅ 3. แก้ตรงนี้ให้รับ categories: Category[] เพิ่มเข้ามา
export default function EditProductForm({ product, categories }: { product: Product, categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(product.image || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("image", imageUrl); 
    
    if (!formData.get("isFree")) formData.set("isFree", "false");
    if (!formData.get("isActive")) formData.set("isActive", "false");

    const result = await updateProduct(formData);
    
    setLoading(false);

    if (result?.error) {
      alert(result.error);
    } else {
      router.push("/admin/store");
      router.refresh();
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/store" className="inline-flex items-center text-slate-400 hover:text-white mb-4 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปจัดการสินค้า
        </Link>
        <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500 border border-pink-500/20">
                <Package size={24} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">แก้ไขสินค้า: {product.title}</h1>
                <p className="text-slate-400 text-sm">รหัสสินค้า: {product.slug}</p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <input type="hidden" name="id" value={product.id} />

        {/* --- Left Column: Main Info --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Title Input */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">ชื่อสินค้า</label>
                <input 
                    name="title" 
                    defaultValue={product.title} 
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-all" 
                />
            </div>

            {/* Description Input */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">รายละเอียด</label>
                <textarea 
                    name="description" 
                    defaultValue={product.description} 
                    rows={6}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-pink-500 transition-all resize-none" 
                />
            </div>

            {/* Price & Options */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">ราคา (บาท)</label>
                    <input 
                        type="number"
                        name="price"
                        step="0.01" 
                        defaultValue={Number(product.price)} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-pink-500 transition-all" 
                    />
                </div>
                
                <div className="flex flex-col gap-4 justify-center p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="isFree" defaultChecked={product.isFree} className="w-5 h-5 accent-pink-500" />
                        <span className="text-white">แจกฟรี (Free Product)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="w-5 h-5 accent-green-500" />
                        <span className="text-white">วางขาย / เผยแพร่ (Active)</span>
                    </label>
                </div>
            </div>

            {/* ✅ เพิ่ม Dropdown เลือกหมวดหมู่ */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                    <FolderTree size={14} /> หมวดหมู่
                </label>
                <div className="relative">
                    <select 
                        name="categoryId" 
                        defaultValue={product.categoryId || ""}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white appearance-none cursor-pointer focus:outline-none focus:border-pink-500 transition-all"
                    >
                        <option value="">-- เลือกหมวดหมู่ --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* --- Right Column: Image & Actions --- */}
        <div className="space-y-6">
            
            {/* Image Upload Section */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                    <ImageIcon size={14} /> รูปสินค้า
                </label>

                <div className={`relative w-full rounded-xl overflow-hidden border border-slate-700 mb-4 bg-slate-950 flex flex-col items-center justify-center p-4 ${!imageUrl ? 'border-dashed py-10' : ''}`}>
                    {imageUrl ? (
                        <div className="relative w-full aspect-video">
                            <Image src={imageUrl} alt="Product Image" fill className="object-cover rounded-lg" />
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
                <p className="text-[10px] text-slate-500 text-center">อัปโหลดรูปใหม่เพื่อเปลี่ยนรูปเดิม</p>
            </div>

            {/* Save Button */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                 <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-pink-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึกการแก้ไข</>}
                </button>
            </div>
        </div>

      </form>
    </div>
  );
}