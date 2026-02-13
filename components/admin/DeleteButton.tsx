"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ✅ Import ของแต่งหล่อ
import toast from "react-hot-toast";
import { confirmSwal } from "@/lib/swal";

interface DeleteButtonProps {
  onDelete: () => Promise<any>; // รับ Server Action ที่ bind ID มาแล้ว
  className?: string; // เผื่ออยากปรับ CSS เพิ่มเติมจากภายนอก
}

export default function DeleteButton({ onDelete, className }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // ป้องกันการกดทะลุ

    // 1. ถามยืนยันด้วย SweetAlert
    const result = await confirmSwal.fire({
      title: 'ยืนยันการลบ?',
      text: "ข้อมูลนี้จะหายไปและไม่สามารถกู้คืนได้",
      icon: 'warning',
      confirmButtonText: 'ลบทิ้ง',
      confirmButtonClass: 'bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 shadow-lg shadow-red-900/20'
    } as any);

    if (!result.isConfirmed) return;

    // 2. เริ่มลบ
    setLoading(true);
    try {
        const res = await onDelete(); // เรียก Action
        
        if (res?.error) {
            toast.error(res.error); // ❌ แจ้งเตือน Error
        } else {
            toast.success("ลบข้อมูลเรียบร้อย"); // ✅ แจ้งเตือน Success
            router.refresh();
        }
    } catch (error) {
        toast.error("เกิดข้อผิดพลาด");
    } finally {
        setLoading(false);
    }
  };

  return (
    <button
      type="button" // เปลี่ยนเป็น button ธรรมดา (เพราะเราคุม submit เอง)
      disabled={loading}
      onClick={handleClick}
      className={`p-2 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-lg transition-all border border-slate-700 hover:border-red-500/30 disabled:opacity-50 active:scale-95 group ${className}`}
      title="ลบ"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin text-red-500" />
      ) : (
        <Trash2 size={16} className="group-hover:stroke-2" />
      )}
    </button>
  );
}