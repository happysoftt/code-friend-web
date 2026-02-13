import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Menu, PlayCircle, CheckCircle } from "lucide-react";
import Markdown from "react-markdown"; // ถ้ายังไม่ได้ลง ให้รัน npm install react-markdown

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonSlug: string }> }) {
  const { slug, lessonSlug } = await params;

  // 1. ดึงข้อมูล Path เพื่อเอาไว้ทำ Sidebar
  const path = await prisma.learningPath.findUnique({
    where: { slug },
    include: {
      lessons: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!path) return notFound();

  // 2. หา Lesson ปัจจุบันจาก lessonSlug
  const currentLesson = path.lessons.find(l => l.slug === lessonSlug);
  if (!currentLesson) return notFound();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950">
      
      {/* Sidebar (Desktop) / Drawer (Mobile would need JS state, keeping simple for now) */}
      <aside className="w-full lg:w-80 border-r border-slate-800 bg-slate-900 lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
            <Link href={`/learn/${slug}`} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 mb-3">
                <ArrowLeft size={14} /> กลับไปหน้าสารบัญ
            </Link>
            <h2 className="font-bold text-white leading-tight">{path.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{path.lessons.length} บทเรียน</p>
        </div>
        
        <div className="py-2">
            {path.lessons.map((lesson, index) => {
                const isActive = lesson.slug === lessonSlug;
                return (
                    <Link 
                        key={lesson.id}
                        href={`/learn/${slug}/${lesson.slug}`}
                        className={`block px-4 py-3 border-l-2 transition-colors ${
                            isActive 
                            ? "border-purple-500 bg-purple-500/10" 
                            : "border-transparent hover:bg-slate-800/50"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <span className={`text-xs mt-0.5 font-mono ${isActive ? "text-purple-400" : "text-slate-500"}`}>
                                EP.{index + 1}
                            </span>
                            <span className={`text-sm ${isActive ? "text-white font-medium" : "text-slate-300"}`}>
                                {lesson.title}
                            </span>
                        </div>
                    </Link>
                );
            })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
         {/* Video Section */}
         <div className="w-full aspect-video bg-black sticky top-0 z-20 shadow-2xl">
             {currentLesson.videoUrl ? (
                 <iframe 
                    src={currentLesson.videoUrl} 
                    className="w-full h-full" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                 ></iframe>
             ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900">
                     <PlayCircle size={64} className="mb-4 opacity-50" />
                     <p>บทเรียนนี้ไม่มีวิดีโอ (อ่านเนื้อหาด้านล่าง)</p>
                 </div>
             )}
         </div>

         {/* Content Section */}
         <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
                {currentLesson.title}
            </h1>
            
            <div className="prose prose-invert prose-lg max-w-none">
                {/* ถ้ายังไม่ได้ลง react-markdown ให้ใช้ div ธรรมดาไปก่อน */}
                {/* <Markdown>{currentLesson.content}</Markdown> */}
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-light">
                    {currentLesson.content}
                </div>
            </div>

            {/* Navigation Buttons (Next/Prev) */}
            <div className="mt-12 flex justify-between pt-8 border-t border-slate-800">
                <button disabled className="text-slate-500 cursor-not-allowed">
                    {/* ทำ Logic หา Previous Lesson ได้ถ้าต้องการ */}
                    &larr; บทก่อนหน้า
                </button>
                <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold transition-all">
                    บทถัดไป &rarr;
                </button>
            </div>
         </div>
      </main>
    </div>
  );
}