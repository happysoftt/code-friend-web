"use client";

import { deleteProduct } from "@/lib/actions";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ✅ Import ของแต่งหล่อ
import toast from "react-hot-toast";
import { confirmSwal } from "@/lib/swal";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation(); // กันไม่ให้ไปกดโดน Link ของการ์ดสินค้า (ถ้ามี)
    
    // ใช้ SweetAlert ถามยืนยัน
    const result = await confirmSwal.fire({
        title: 'ยืนยันการลบสินค้า?',
        text: "สินค้าจะหายไปจากหน้าร้านทันที และกู้คืนไม่ได้",
        icon: 'warning',
        confirmButtonText: 'ลบทิ้ง',
        confirmButtonClass: 'bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 shadow-lg shadow-red-900/20' // ปุ่มแดง
    } as any);

    if (!result.isConfirmed) return;

    setLoading(true);
    const resultAction = await deleteProduct(productId);
    
    if (resultAction?.error) {
      toast.error(resultAction.error); // ❌ แจ้งเตือนสีแดง
      setLoading(false);
    } else {
      toast.success("ลบสินค้าเรียบร้อย"); // ✅ แจ้งเตือนสีเขียว
      router.refresh();
      // ไม่ต้อง setLoading(false) เพราะเดี๋ยวหน้าเว็บจะรีเฟรชหรือ Element หายไปเอง
    }
  }

  return (
    <button 
        onClick={handleDelete}
        disabled={loading}
        className="p-2.5 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-lg transition-all border border-slate-700 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group shadow-sm" 
        title="ลบถาวร"
    >
        {loading ? <Loader2 size={16} className="animate-spin text-red-500" /> : <Trash2 size={16} className="group-hover:stroke-2" />}
    </button>
  );
}