"use client";

import { createProduct, updateProduct, getProduct } from "@/lib/actions"; 
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { PackagePlus, Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, DollarSign, Loader2, Sparkles, FolderTree, AlignLeft, Type } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id"); // รับ ID จาก URL ?id=... เพื่อดูว่าเป็นโหมดแก้ไขไหม

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFree, setIsFree] = useState(false);

  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formDataState, setFormDataState] = useState({
    name: "",
    price: "",
    description: "",
    fileUrl: "",
    categoryId: ""
  });

  // 1. ดึงหมวดหมู่ และ ข้อมูลสินค้า (ถ้ามี ID)
  useEffect(() => {
    const initData = async () => {
      setFetching(true);
      try {
        // ดึงหมวดหมู่
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          setCategories(await catRes.json());
        }

        // ถ้ามี productId แสดงว่าเป็นการ "แก้ไข" -> ให้ดึงข้อมูลเก่ามาใส่
        if (productId) {
          const product = await getProduct(productId);
          if (product) {
            setFormDataState({
              name: product.title || product.name || "", 
              price: product.price.toString(),
              description: product.description || "",
              fileUrl: product.downloadUrl || product.fileUrl || "",
              categoryId: product.categoryId || ""
            });
            setIsFree(product.isFree || product.price === 0);
            if (product.image) setPreview(product.image);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setFetching(false);
      }
    };

    initData();
  }, [productId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDataState(prev => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    let result;
    if (productId) {
        // กรณีแก้ไข
        formData.append("id", productId);
        result = await updateProduct(formData);
    } else {
        // กรณีสร้างใหม่
        result = await createProduct(formData);
    }

    setLoading(false);

    if (result?.error) {
      alert(result.error);
    } else {
      router.push("/admin/store");
      router.refresh();
    }
  }

  if (fetching) {
    return (
        <div className="min-h-screen flex items-center justify-center text-emerald-500">
            <Loader2 className="animate-spin" size={40} />
        </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/store" className="inline-flex items-center text-slate-400 hover:text-white mb-4 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปหน้าร้านค้า
        </Link>
        <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                <PackagePlus size={28} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {productId ? "แก้ไขสินค้า" : "ลงขายสินค้าใหม่"}
                </h1>
                <p className="text-slate-400 mt-1">
                    {productId ? `กำลังแก้ไข ID: ${productId}` : "กรอกรายละเอียดสินค้าของคุณให้ครบถ้วน"}
                </p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column: Main Info --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Name */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                    <Type size={14} /> ชื่อสินค้า
                </label>
                <input 
                    name="name" 
                    value={formDataState.name}
                    onChange={handleInputChange}
                    required 
                    placeholder="เช่น: E-Commerce System Source Code"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                />
            </div>

            {/* Description */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col h-full">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                    <AlignLeft size={14} /> รายละเอียดสินค้า
                </label>
                <textarea 
                    name="description" 
                    value={formDataState.description}
                    onChange={handleInputChange}
                    rows={8} 
                    placeholder="อธิบายคุณสมบัติ และสิ่งที่ลูกค้าจะได้รับ..."
                    className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed focus:outline-none focus:border-emerald-500 transition-all resize-none scrollbar-thin scrollbar-thumb-slate-700"
                />
            </div>

            {/* File URL */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                    <LinkIcon size={14} /> ลิงก์ดาวน์โหลด (Google Drive / GitHub)
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LinkIcon className="text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    </div>
                    <input 
                        name="fileUrl" 
                        value={formDataState.fileUrl}
                        onChange={handleInputChange}
                        required 
                        placeholder="https://..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-blue-400 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-all" 
                    />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 ml-1">*ลิงก์นี้จะถูกส่งให้ลูกค้าทางอีเมลอัตโนมัติ</p>
            </div>
        </div>

        {/* --- Right Column: Settings --- */}
        <div className="space-y-6 lg:sticky lg:top-8 h-fit">
            
            {/* Save Button */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">ดำเนินการ</h3>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> {productId ? "บันทึกการแก้ไข" : "ลงขายสินค้า"}</>}
                </button>
            </div>

            {/* Price & Free Toggle */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-500" /> ราคาขาย
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
                            value={formDataState.price}
                            onChange={handleInputChange}
                            placeholder="0.00" 
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
                        value={formDataState.categoryId}
                        onChange={handleInputChange}
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
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                                <ImageIcon size={24} className="text-slate-500 group-hover:text-emerald-400" />
                            </div>
                            <span className="text-slate-400 text-sm font-medium">อัปโหลดรูปภาพ</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </form>
    </div>
  );
}

// Wrap Component with Suspense
export default function CreateStoreProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-500"><Loader2 className="animate-spin" size={40} /></div>}>
      <ProductForm />
    </Suspense>
  );
}