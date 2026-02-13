import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Plus, Video, GripVertical, PlayCircle, Edit } from "lucide-react";
import DeleteLessonButton from "@/components/admin/DeleteLessonButton"; 

export const dynamic = 'force-dynamic';

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // ดึงข้อมูลคอร์ส และบทเรียนข้างใน (เรียงตามลำดับ Order)
  const course = await prisma.learningPath.findMany({ // แก้เป็น findUnique เพราะ id คือ Primary Key
    where: { id },
    include: {
        lessons: { orderBy: { order: "asc" } }
    },
    take: 1 // ใช้ take 1 แทน findUnique เพราะ findMany return array
  });

  const currentCourse = course[0]; // เอาตัวแรก

  if (!currentCourse) return <div className="p-8 text-white">ไม่พบคอร์สเรียน</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <Link href="/admin/learn" className="inline-flex items-center text-slate-400 hover:text-white mb-2 text-sm transition-colors group">
                <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปจัดการคอร์สเรียน
            </Link>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {currentCourse.title}
                </h1>
                <span className="text-xs font-mono bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-800">
                    {currentCourse.lessons.length} Lessons
                </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">จัดการเนื้อหาบทเรียนและวิดีโอภายในคอร์ส</p>
        </div>
        
        <Link 
            href={`/admin/learn/${currentCourse.id}/new`} 
            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 active:scale-95 transition-all"
        >
            <Plus size={20} /> เพิ่มบทเรียนใหม่
        </Link>
      </div>

      {/* Lesson List Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-sm">
          
          {/* List Header */}
          <div className="p-5 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>รายการบทเรียน</span>
              <span>Actions</span>
          </div>

          <div className="divide-y divide-slate-800">
              {currentCourse.lessons.map((lesson) => (
                  <div key={lesson.id} className="p-4 hover:bg-slate-800/50 transition-colors flex items-center gap-4 group">
                      
                      {/* Drag Handle */}
                      <div className="text-slate-700 cursor-move group-hover:text-slate-500 transition-colors">
                          <GripVertical size={20} />
                      </div>

                      {/* Video Icon */}
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-purple-500 flex-shrink-0 border border-slate-700 group-hover:border-purple-500/30 transition-colors">
                          <PlayCircle size={24} />
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold truncate text-base mb-0.5 group-hover:text-purple-400 transition-colors">
                              <span className="text-slate-500 mr-2 text-sm">EP.{lesson.order}</span>
                              {lesson.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {lesson.videoUrl ? (
                                <a href={lesson.videoUrl} target="_blank" className="flex items-center gap-1 hover:text-blue-400 transition-colors truncate max-w-[300px]">
                                    <Video size={12} /> {lesson.videoUrl}
                                </a>
                            ) : (
                                <span className="text-slate-600 flex items-center gap-1"><Video size={12} /> ไม่มีวิดีโอ</span>
                            )}
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span>{Math.floor(Math.random() * 60) + 10} min</span> {/* Mock Duration */}
                          </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          
                          {/* ปุ่มแก้ไข */}
                          <Link href={`/admin/learn/${currentCourse.id}/lessons/${lesson.id}`} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700">
                              <Edit size={16} />
                          </Link>

                          {/* ปุ่มลบ (Client Component) */}
                          <DeleteLessonButton lessonId={lesson.id} courseId={currentCourse.id} />
                      </div>
                  </div>
              ))}

              {currentCourse.lessons.length === 0 && (
                  <div className="p-20 text-center text-slate-500">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video size={32} className="text-slate-600" />
                      </div>
                      <p className="text-lg font-medium text-slate-400">คอร์สนี้ยังว่างเปล่า</p>
                      <p className="text-sm mt-2 text-slate-500">เริ่มสร้างเนื้อหาโดยการกดปุ่ม "เพิ่มบทเรียนใหม่"</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}