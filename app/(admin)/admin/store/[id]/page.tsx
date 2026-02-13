import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Package, Save } from "lucide-react";
import Link from "next/link";
import { updateProduct } from "@/lib/actions"; // อย่าลืม import server action (หรือเขียน inline ก็ได้)

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. ดึงข้อมูลสินค้า
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) return notFound();

  // 2. Server Action สำหรับอัปเดต
  async function updateProductAction(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const isFree = formData.get("isFree") === "on";
    const isActive = formData.get("isActive") === "on";

    await prisma.product.update({
        where: { id },
        data: {
            title,        // ✅ ใช้ title
            description,
            price,
            isFree,
            isActive
        }
    });

    redirect("/admin/store");
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      
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
                {/* ✅ แก้ไขจุดที่ Error: เปลี่ยน name เป็น title */}
                <h1 className="text-3xl font-bold text-white tracking-tight">แก้ไขสินค้า: {product.title}</h1>
                <p className="text-slate-400 text-sm">รหัสสินค้า: {product.slug}</p>
            </div>
        </div>
      </div>

      <form action={updateProductAction} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
        <input type="hidden" name="id" value={product.id} />

        {/* Title Input */}
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">ชื่อสินค้า</label>
            <input 
                name="title" // ✅ ต้องส่งชื่อ field เป็น title
                defaultValue={product.title} // ✅ เปลี่ยนจาก name เป็น title
                required 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-all" 
            />
        </div>

        {/* Description Input */}
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">รายละเอียด</label>
            <textarea 
                name="description" 
                defaultValue={product.description} 
                rows={4}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-pink-500 transition-all resize-none" 
            />
        </div>

        {/* Price & Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="pt-4 border-t border-slate-800">
            <button 
                type="submit" 
                className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-pink-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Save size={20} /> บันทึกการแก้ไข
            </button>
        </div>

      </form>
    </div>
  );
}