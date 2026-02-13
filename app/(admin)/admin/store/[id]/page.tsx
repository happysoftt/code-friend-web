import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions"; 
import { notFound, redirect } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. ดึงข้อมูลสินค้า
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) return notFound();

  async function updateProductAction(formData: FormData) {
    "use server";
    // เรียกใช้ Server Action หลัก (ต้องมั่นใจว่าใน lib/actions.ts รับค่า 'title' ไม่ใช่ 'name')
    await updateProduct(formData);
    redirect("/admin/store");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/store" className="inline-flex items-center text-slate-400 hover:text-white mb-6 text-sm">
        <ArrowLeft size={16} className="mr-1" /> กลับไปหน้ารายการ
      </Link>

      {/* ✅ แก้จุดที่ 1: ใช้ product.title */}
      <h1 className="text-3xl font-bold text-white mb-8">แก้ไขสินค้า: {product.title}</h1>
      
      <form action={updateProductAction} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-6">
        <input type="hidden" name="id" value={product.id} />

        {/* ส่วนรูปภาพ */}
        <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800 flex-shrink-0">
                {product.image ? (
                    <Image src={product.image} alt="Current" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                )}
            </div>
            <div className="flex-1">
                <label className="block text-slate-400 mb-2 text-sm">เปลี่ยนรูปภาพปก (ถ้าต้องการ)</label>
                <div className="relative">
                    <input type="file" name="image" accept="image/*" className="w-full text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
                </div>
                <p className="text-xs text-slate-500 mt-2">*หากไม่เลือก จะใช้รูปเดิม</p>
            </div>
        </div>

        <div className="border-t border-slate-800 my-4"></div>

        {/* ✅ แก้จุดที่ 2: เปลี่ยน name="name" เป็น name="title" และ defaultValue เป็น product.title */}
        <div>
          <label className="block text-slate-400 mb-2 text-sm">ชื่อสินค้า</label>
          <input 
            name="title" 
            defaultValue={product.title} 
            required 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-2 text-sm">รายละเอียด</label>
          <textarea name="description" defaultValue={product.description || ""} rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-slate-400 mb-2 text-sm">ราคา (บาท)</label>
          <input 
            name="price" 
            type="number" 
            // แปลง Decimal เป็น String เพื่อใส่ใน input
            defaultValue={product.price.toString()} 
            required 
            min="0"
            step="0.01" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-green-400 font-bold text-lg focus:border-green-500 outline-none" 
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
          <Save size={20} /> บันทึกการแก้ไข
        </button>
      </form>
    </div>
  );
}