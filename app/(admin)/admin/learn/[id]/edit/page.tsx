import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import EditCourseForm from "@/components/admin/EditCourseForm"; // Import Form ที่เราเพิ่งสร้าง

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. ดึงข้อมูลคอร์สเดิม
  const course = await prisma.learningPath.findUnique({
    where: { id },
  });

  if (!course) return notFound();

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/learn" className="inline-flex items-center text-slate-400 hover:text-white mb-4 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปจัดการคอร์สเรียน
        </Link>
        <div className="flex items-center gap-3">
             <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 border border-purple-500/20">
                <GraduationCap size={28} />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">แก้ไขข้อมูลคอร์ส</h1>
                <p className="text-slate-400 mt-1">ID: <span className="font-mono text-xs bg-slate-900 px-2 py-1 rounded">{course.id}</span></p>
             </div>
        </div>
      </div>

      {/* เรียกใช้ Client Form Component พร้อมส่งข้อมูลเดิมไปให้ */}
      <EditCourseForm initialData={course} />
      
    </div>
  );
}