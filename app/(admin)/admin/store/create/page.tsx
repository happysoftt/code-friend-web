"use client";

import { createProduct, updateProduct, getProduct } from "@/lib/actions"; 
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { PackagePlus, Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, DollarSign, Loader2, Sparkles, FolderTree, AlignLeft, Type, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// ✅ เพิ่ม Import UploadButton
import { UploadButton } from "../../../../utils/uploadthing"; 

interface Category {
  id: string;
  name: string;
}

function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  // ✅ เปลี่ยนจาก preview เฉยๆ เป็น imageUrl เพื่อเก็บ URL จริงที่จะส่งไป DB
  const [imageUrl, setImageUrl] = useState<string>(""); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFree, setIsFree] = useState(false);

  const [formDataState, setFormDataState] = useState({
    title: "", 
    price: "",
    description: "",
    fileUrl: "",
    categoryId: ""
  });

  useEffect(() => {
    const initData = async () => {
      setFetching(true);
      try {
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          setCategories(await catRes.json());
        }

        if (productId) {
          const product = await getProduct(productId);
          if (product) {
            setFormDataState({
              title: product.title || "",
              price: product.price.toString(),
              description: product.description || "",
              fileUrl: product.downloadUrl || product.fileUrl || "",
              categoryId: product.categoryId || ""
            });
            setIsFree(product.isFree || Number(product.price) === 0);
            // ✅ Set รูปภาพเดิมถ้ามี
            if (product.image) setImageUrl(product.image);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDataState(prev => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // ✅ เช็คว่ามีรูปหรือยัง
    if (!imageUrl) {
        alert("กรุณาอัปโหลดรูปภาพสินค้าก่อนครับ");
        return;
    }

    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // ✅ ยัด URL รูปภาพลงไปใน FormData แทนไฟล์ดิบ
    formData.set("image", imageUrl); 
    
    let result;
    if (productId) {
        formData.append("id", productId);
        result = await updateProduct(formData);
    } else {
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
            
            {/* Name Input */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                    <Type size={14} /> ชื่อสินค้า
                </label>
                <input 
                    name="title" 
                    value={formDataState.title}
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
                    disabled={loading || !imageUrl}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* ✅ Image Upload (UploadThing) */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={16} className="text-emerald-500" /> รูปปกสินค้า
                </h3>
                
                <div className={`border-2 border-dashed rounded-xl overflow-hidden transition-all relative group p-4 flex flex-col items-center justify-center ${imageUrl ? 'border-emerald-500/50' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50'}`}>
                    
                    {imageUrl ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                            <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                            {/* ปุ่มลบรูป */}
                            <button 
                                type="button"
                                onClick={() => setImageUrl("")}
                                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            {/* ✅ ปุ่ม UploadThing */}
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
                                    button: "bg-emerald-600 hover:bg-emerald-500 focus-within:ring-emerald-600 after:bg-emerald-600",
                                    container: "p-2",
                                    allowedContent: "text-slate-400 text-xs"
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

        </div>
      </form>
    </div>
  );
}

export default function CreateStoreProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-500"><Loader2 className="animate-spin" size={40} /></div>}>
      <ProductForm />
    </Suspense>
  );
}