import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, Clock, BookOpen, MessageSquare, List } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CommentSection from "@/components/community/CommentSection"; 
import { Metadata } from "next";

// Helper: Youtube URL
function getYoutubeEmbedUrl(url: string) {
    if (!url) return "";
    let videoId = "";
    if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
    else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

// ✅ แก้ไข: เปลี่ยน slug เป็น id เพื่อให้หาด้วย UUID ได้
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params; // ตัวแปร slug ในที่นี้คือ UUID จาก URL
    const course = await prisma.learningPath.findUnique({ 
        where: { id: slug }, 
        select: { title: true } 
    });
    return { title: course ? `${course.title} - Learning Space` : "Course Player" };
}

export default async function CoursePlayerPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ ep?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { slug } = await params;
  const { ep } = await searchParams || {};

  // ✅ แก้ไข: เปลี่ยน where: { slug } เป็น where: { id: slug }
  const course = await prisma.learningPath.findUnique({
    where: { id: slug },
    include: {
        lessons: { orderBy: { order: "asc" } },
        comments: {
          include: { user: true },
          orderBy: { createdAt: "desc" }
        }
    }
  });

  if (!course) return notFound();

  const currentLesson = ep ? course.lessons.find(l => l.slug === ep) : course.lessons[0];
  const currentIndex = currentLesson ? course.lessons.findIndex(l => l.id === currentLesson.id) : 0;
  const progressPercent = Math.round(((currentIndex + 1) / course.lessons.length) * 100);

  // --- ส่วน Sidebar (Playlist) ---
  const LessonList = () => (
    <div className="flex flex-col h-full bg-[#161b22] border-l border-slate-800">
        <div className="p-6 border-b border-slate-800 bg-[#161b22]">
            <Link href="/learn" className="text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-4 transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> กลับหน้ารวมคอร์ส
            </Link>
            <h2 className="font-bold text-white text-lg line-clamp-2 leading-snug">{course.title}</h2>
            
            <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>ตำแหน่งปัจจุบัน</span>
                    <span className="text-purple-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 min-h-[300px] lg:min-h-0">
            {course.lessons.map((lesson, index) => {
                const isActive = currentLesson?.id === lesson.id;
                return (
                    <Link 
                        key={lesson.id} 
                        // ✅ ใช้ course.id หรือ slug เดิมที่มีปัญหาเพื่อให้ URL สอดคล้องกัน
                        href={`/learn/${slug}?ep=${lesson.slug}`}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all group ${
                            isActive ? 'bg-purple-600/10 border border-purple-500/50' : 'hover:bg-slate-800/50 border border-transparent'
                        }`}
                    >
                        <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold mt-0.5 transition-colors ${
                            isActive ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
                        }`}>
                            {isActive ? <PlayCircle size={14} fill="currentColor" /> : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-snug mb-1 transition-colors ${isActive ? 'text-purple-400' : 'text-slate-300 group-hover:text-white'}`}>
                                {lesson.title}
                            </p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-2">
                                <span className="flex items-center gap-1"><Clock size={10} /> {lesson.duration} น.</span>
                            </p>
                        </div>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 self-center animate-pulse" />}
                    </Link>
                )
            })}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col lg:flex-row font-sans text-slate-200 overflow-hidden">
       
       {/* --- LEFT SIDE: VIDEO & CONTENT --- */}
       <div className="flex-1 lg:h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex flex-col">
          
          <div className="p-4 bg-slate-900 border-b border-slate-800 lg:hidden flex items-center gap-3 sticky top-0 z-30">
              <Link href="/learn" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft size={18}/>
              </Link>
              <span className="font-bold text-white truncate text-sm">{course.title}</span>
          </div>

          <div className="w-full bg-black aspect-video relative group shadow-2xl z-20 flex-shrink-0">
              {currentLesson ? (
                 currentLesson.videoUrl ? (
                    <iframe 
                        src={getYoutubeEmbedUrl(currentLesson.videoUrl)}
                        className="w-full h-full" 
                        allowFullScreen 
                        title={currentLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                 ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900">
                        <PlayCircle size={64} opacity={0.5} />
                        <p className="mt-4 font-medium">ไม่มีวิดีโอสำหรับบทเรียนนี้</p>
                    </div>
                 )
              ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-900">
                    <p>เลือกบทเรียนเพื่อเริ่มเรียน</p>
                 </div>
              )}
          </div>

          <div className="max-w-5xl mx-auto p-6 md:p-10 pb-24 w-full">
              
              <div className="flex items-start justify-between gap-4 mb-8 border-b border-slate-800 pb-8">
                  <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                          {currentLesson?.title || course.title}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><BookOpen size={14}/> {course.title}</span>
                          {currentLesson?.duration && (
                              <span className="flex items-center gap-1"><Clock size={14}/> {currentLesson.duration} นาที</span>
                          )}
                      </div>
                  </div>
              </div>

              {currentLesson && currentLesson.content && (
                  <div className="prose prose-invert prose-slate max-w-none mb-12">
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} /> 
                  </div>
              )}

              <div className="lg:hidden mb-12 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-4 bg-slate-900 border-b border-slate-800 font-bold flex items-center gap-2">
                      <List size={18} /> บทเรียนในคอร์สนี้
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                      <LessonList />
                  </div>
              </div>
              
              <CommentSection 
                  learningPathId={course.id} 
                  initialComments={course.comments} 
                  currentUser={session?.user}
              />
          </div>
       </div>

       <div className="hidden lg:block w-96 h-screen flex-shrink-0 sticky top-0">
           <LessonList />
       </div>
    </div>
  );
}