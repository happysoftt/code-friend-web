import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import EditProductForm from "@/components/admin/EditProductForm"; 

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. ดึงข้อมูลสินค้า และ หมวดหมู่
  const [rawProduct, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ]);

  if (!rawProduct) return notFound();

  // ✅ แก้ไขตรงนี้: แปลง Decimal เป็น Number ก่อนส่งไป Client Component
  const product = {
    ...rawProduct,
    price: rawProduct.price.toNumber(), // หรือ .toString() ก็ได้ ขึ้นอยู่กับว่าใน Form รับค่าแบบไหน
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/store" className="inline-flex items-center text-slate-400 hover:text-white mb-4 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปหน้าร้านค้า
        </Link>
        <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
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

      {/* ส่ง product ที่แปลงค่าแล้วไป */}
      <EditProductForm product={product} categories={categories} />
      
    </div>
  );
}