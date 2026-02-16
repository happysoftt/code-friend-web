import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, BookOpen, Clock, Users, Search } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function LearningPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  // ✅ รับค่า searchParams
  const sParams = await searchParams;
  const q = sParams?.q;

  // ดึงคอร์ส พร้อมข้อมูลบทเรียนเพื่อคำนวณเวลารวม
  const courses = await prisma.learningPath.findMany({
    where: { 
        published: true,
        ...(q ? { title: { contains: q, mode: 'insensitive' } } : {})
    },
    orderBy: { createdAt: "desc" },
    include: { 
      _count: { select: { lessons: true } },
      lessons: { select: { duration: true } } 
    }
  });

  // ✅ Helper: คำนวณเวลารวม (นาที -> ชม./นาที)
  const getTotalDuration = (lessons: { duration: string | number | null }[]) => {
    const totalMinutes = lessons.reduce((acc, lesson) => {
      // ตรวจสอบประเภทข้อมูลและแปลงเป็นตัวเลข
      const mins = typeof lesson.duration === 'string' 
        ? parseInt(lesson.duration, 10) 
        : (lesson.duration || 0);
      return acc + (isNaN(mins) ? 0 : mins);
    }, 0);

    // ถ้าไม่มีข้อมูลหรือเป็น 0 ให้แจ้งผู้เรียน
    if (totalMinutes === 0) return "ยังไม่มีข้อมูลเวลา";
    
    // ถ้าไม่ถึง 1 ชม.
    if (totalMinutes < 60) return `${totalMinutes} นาที`;
    
    // คำนวณ ชม. และ นาที
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    return mins > 0 ? `${hours} ชม. ${mins} นาที` : `${hours} ชม.`;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-purple-500/30 font-sans">
      
      {/* --- HERO HEADER --- */}
      <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-[#020617] pointer-events-none" />
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-purple-300 text-xs font-bold mb-6 backdrop-blur-md shadow-lg shadow-purple-900/10">
                 <BookOpen size={14} /> Learning Center
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                 คลังความรู้ <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 animate-pulse">สำหรับคนเริ่มเขียนโค้ด</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                 รวมสิ่งที่เราเรียนรู้ระหว่างทาง ทั้งบทเรียน ตัวอย่าง และโปรเจกต์จริง <br className="hidden md:block"/> สำหรับคนที่อยากฝึกเขียนโค้ด และค่อย ๆ เก่งขึ้นไปด้วยกัน
            </p>

            <form className="max-w-xl mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full p-2 pl-6 shadow-2xl transition-all focus-within:border-purple-500/50">
                    <Search className="text-slate-500" size={20} />
                    <input 
                        name="q"
                        defaultValue={q}
                        placeholder="ค้นหาคอร์สเรียน..." 
                        className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 px-4 py-2"
                    />
                </div>
            </form>
          </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="container mx-auto px-4 pb-24">
        
        <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["ทั้งหมด", "Web Development", "Mobile App", "DevOps", "Data Science", "Design"].map((cat, i) => (
                <button key={i} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    i === 0 
                    ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/20" 
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:border-purple-500/50"
                }`}>
                    {cat}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
                const courseTime = getTotalDuration(course.lessons);

                return (
                    <Link 
                        key={course.id} 
                        href={`/learn/${course.id}`}
                        className="group relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col backdrop-blur-sm"
                    >
                        {/* Thumbnail */}
                        <div className="h-52 bg-slate-800 relative overflow-hidden">
                            {course.thumbnail ? (
                                <Image 
                                    src={course.thumbnail} 
                                    alt={course.title} 
                                    fill 
                                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950">
                                    <BookOpen size={48} opacity={0.3} />
                                </div>
                            )}
                            
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                    <PlayCircle size={32} fill="currentColor" className="text-white" />
                                </div>
                            </div>

                            <div className="absolute top-4 left-4 flex gap-2">
                                 <span className="bg-purple-600/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg border border-purple-400/30 uppercase tracking-wider">
                                     Free Course
                                 </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                                <span className="flex items-center gap-1"><BookOpen size={12} /> {course._count.lessons} บทเรียน</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {courseTime}</span>
                            </div>

                            <h3 className="font-bold text-xl text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors leading-tight">
                                {course.title}
                            </h3>
                            
                            <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                                {course.description || "เรียนรู้พื้นฐานและเทคนิคสำคัญ ผ่านการลงมือทำจริง..."}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[8px] text-white">
                                            <Users size={10} />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-purple-400 text-xs font-bold group-hover:underline">
                                    เริ่มเรียนเลย &rarr;
                                </span>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>

        {courses.length === 0 && (
            <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-700 mb-4">
                    <Search className="text-slate-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">ไม่พบคอร์สเรียน</h3>
                <p className="text-slate-500 mt-2">ลองค้นหาด้วยคำอื่น หรือกลับมาดูใหม่เร็วๆ นี้</p>
                {q && <Link href="/learn" className="inline-block mt-6 text-purple-400 hover:underline">ดูคอร์สทั้งหมด</Link>}
            </div>
        )}
      </div>
    </div>
  );
}