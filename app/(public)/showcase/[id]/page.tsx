import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Github, MessageCircle, Calendar } from "lucide-react"; 
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CommentSection from "@/components/community/CommentSection"; 
import { LikeButton, VisitButton } from "@/components/community/ShowcaseButtons";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const project = await prisma.showcase.findUnique({ where: { id }, select: { title: true, description: true } });
    return {
        title: project?.title || "Project Details",
        description: project?.description?.slice(0, 150) || "ดูรายละเอียดผลงานใน Code Friend Showcase",
    };
}

export default async function ShowcaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const project = await prisma.showcase.findUnique({
    where: { id },
    include: {
        user: true,
        comments: {
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        },
        likes: true, 
    }
  });

  if (!project) return notFound();

  const isLikedByMe = session?.user 
    ? project.likes.some(like => like.userId === session.user.id) 
    : false;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans pb-20">
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-[-100px] lg:right-1/4 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-indigo-600/10 blur-[80px] lg:blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-[-100px] lg:left-0 w-[250px] lg:w-[400px] h-[250px] lg:h-[400px] bg-purple-600/10 blur-[80px] lg:blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-6 lg:pt-10">
        
        <Link href="/showcase" className="inline-flex items-center text-slate-400 hover:text-white mb-6 lg:mb-8 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            กลับไปหน้า Showcase
        </Link>

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            
            {/* 1. ส่วนเนื้อหาหลัก (Image + Description) [Desktop: ซ้าย 8 ช่อง] */}
            <div className="lg:col-span-8 space-y-6 lg:space-y-8">
                
                {/* Image Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl relative group">
                    <div className="relative aspect-video w-full bg-slate-950">
                        {project.image ? (
                            <Image src={project.image} alt={project.title} fill className="object-cover" priority />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700">No Preview</div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl lg:rounded-3xl p-5 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                            💡 รายละเอียดโปรเจกต์
                        </h2>
                        <div className="self-start sm:self-auto">
                            <LikeButton 
                                showcaseId={project.id} 
                                initialLikes={project.likes.length} 
                                initialIsLiked={isLikedByMe} 
                                currentUser={session?.user} 
                            />
                        </div>
                    </div>
                    <div className="prose prose-sm lg:prose-base prose-invert prose-slate max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {project.description}
                    </div>
                </div>
            </div>

            {/* 2. ส่วน Sidebar (Info & Buttons) [Desktop: ขวา 4 ช่อง] */}
            {/* บนมือถือ Grid นี้จะแสดงต่อจากส่วนที่ 1 ทันที (ซึ่งถูกต้องแล้ว) */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl lg:rounded-3xl p-5 lg:p-6 shadow-xl lg:sticky lg:top-24">
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                        {project.title}
                    </h1>

                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-slate-800 relative overflow-hidden border border-slate-700">
                             <Image 
                                src={project.user.image || `https://ui-avatars.com/api/?name=${project.user.name}&background=random`} 
                                alt={project.user.name || "User"} 
                                fill className="object-cover" 
                            />
                        </div>
                        <div>
                            <p className="text-xs lg:text-sm text-slate-400">Created by</p>
                            <p className="font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer text-sm lg:text-base">
                                {project.user.name}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                            <Calendar size={16} /> 
                            <span>เผยแพร่: {new Date(project.createdAt).toLocaleDateString('th-TH', { dateStyle: 'medium' })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-emerald-400 text-sm font-bold">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{project.demoClicks || 0} คนเข้าชมเว็บไซต์แล้ว</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {project.demoUrl && (
                            <VisitButton showcaseId={project.id} url={project.demoUrl} />
                        )}
                        {project.githubUrl && (
                            <a 
                                href={project.githubUrl} 
                                target="_blank"
                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700"
                            >
                                <Github size={18} /> ดู Source Code
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. ส่วน Comment (ย้ายออกมาอยู่นอกสุด) [Desktop: ซ้าย 8 ช่อง] */}
            {/* บนมือถือ: จะแสดงเป็นลำดับที่ 3 (ล่างสุด) ถูกต้อง */}
            {/* บน Desktop: col-span-8 จะทำให้มันตบลงมาบรรทัดใหม่ ทางซ้าย ตรงกับเนื้อหาหลักพอดี */}
            <div className="lg:col-span-8" id="comments">
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl lg:rounded-3xl p-5 lg:p-8">
                    
                    <CommentSection 
                        showcaseId={project.id} 
                        initialComments={project.comments} 
                        currentUser={session?.user}
                    />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}