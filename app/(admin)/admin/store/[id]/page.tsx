import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import EditProductForm from "@/components/admin/EditProductForm"; 

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // ✅ 1. ต้องดึงทั้ง "สินค้า" และ "หมวดหมู่" มาพร้อมกัน
  const [rawProduct, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }) // ดึงหมวดหมู่เรียงตามชื่อ
  ]);

  if (!rawProduct) return notFound();

  // 2. แปลงข้อมูลสินค้า (Decimal -> Number)
  const product = {
    ...rawProduct,
    price: Number(rawProduct.price), // แปลงราคาให้เป็น Number
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      
      {/* Header สวยๆ */}
      <div className="mb-8">
        <Link href="/admin/store" className="inline-flex items-center text-slate-400 hover:text-white mb-4 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปหน้าร้านค้า
        </Link>
        <div className="flex items-center gap-3">
             <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500 border border-pink-500/20">
                <ShoppingBag size={28} />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">แก้ไขสินค้า</h1>
                <p className="text-slate-400 mt-1">
                    ID: <span className="font-mono text-xs bg-slate-900 px-2 py-1 rounded border border-slate-800">{product.id}</span>
                </p>
             </div>
        </div>
      </div>

      {/* ✅ 3. ส่งทั้ง product และ categories ไปให้ Form */}
      <EditProductForm product={product} categories={categories} />
      
    </div>
  );
}