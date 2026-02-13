import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Video } from "lucide-react";
import Link from "next/link";
import EditLessonForm from "@/components/admin/EditLessonForm"; // Import Form

export default async function EditLessonPage({ params }: { params: Promise<{ id: string, lessonId: string }> }) {
  const { id: courseId, lessonId } = await params;

  // ดึงข้อมูลบทเรียน
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) return notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <Link href={`/admin/learn/${courseId}`} className="inline-flex items-center text-slate-400 hover:text-white mb-4 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปรายการบทเรียน
        </Link>
        <div className="flex items-center gap-3">
             <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 border border-purple-500/20">
                <Video size={28} />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">แก้ไขบทเรียน</h1>
                <p className="text-slate-400 mt-1 flex items-center gap-2">
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-xs font-mono border border-slate-800">EP.{lesson.order}</span>
                    {lesson.title}
                </p>
             </div>
        </div>
      </div>

      {/* Client Form */}
      <EditLessonForm initialData={{...lesson, courseId}} />
      
    </div>
  );
}