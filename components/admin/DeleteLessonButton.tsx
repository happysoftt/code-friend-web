"use client";

import { deleteLesson } from "@/lib/actions";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ✅ Import ของแต่งหล่อ
import toast from "react-hot-toast";
import { confirmSwal } from "@/lib/swal";

export default function DeleteLessonButton({ lessonId, courseId }: { lessonId: string, courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation(); // กันไม่ให้กดทะลุไปโดนลิ้งก์อื่น
    
    // ใช้ SweetAlert ถามยืนยัน
    const result = await confirmSwal.fire({
        title: 'ยืนยันการลบบทเรียน?',
        text: "เนื้อหาในบทเรียนนี้จะหายไปทันที",
        icon: 'warning',
        confirmButtonText: 'ลบทิ้ง',
        confirmButtonClass: 'bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 shadow-lg shadow-red-900/20' // ปุ่มแดง
    } as any);

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
        await deleteLesson(lessonId, courseId);
        toast.success("ลบบทเรียนเรียบร้อย"); // ✅ แจ้งเตือนสีเขียว
        router.refresh();
    } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการลบ"); // ❌ แจ้งเตือนสีแดง
    } finally {
        setLoading(false);
    }
  }

  return (
    <button 
        onClick={handleDelete}
        disabled={loading}
        className="p-2.5 bg-slate-800 hover:bg-red-900/30 text-slate-500 hover:text-red-400 rounded-lg transition-all border border-transparent hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group"
        title="ลบบทเรียน"
    >
        {loading ? <Loader2 size={16} className="animate-spin text-red-500" /> : <Trash2 size={16} className="group-hover:stroke-2" />}
    </button>
  );
}