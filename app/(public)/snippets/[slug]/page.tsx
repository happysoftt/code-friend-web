import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, Calendar, Eye } from "lucide-react";
import CommentSection from "@/components/shared/CommentSection";
import CodeBlock from "@/components/snippet/CodeBlock"; 

export const dynamic = 'force-dynamic';

export default async function SnippetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. ดึงข้อมูล Snippet พร้อม Version ล่าสุด
  const snippet = await prisma.snippet.findUnique({
    where: { slug },
    include: { 
        author: true, 
        // ✅ เพิ่มส่วนนี้: ดึง Versions ล่าสุดมา 1 อัน
        versions: {
            orderBy: { createdAt: 'desc' },
            take: 1
        },
        comments: { include: { user: true }, orderBy: { createdAt: "desc" } } 
    }
  });

  if (!snippet) return notFound();
  
  // ✅ แก้ไข: ดึง code จาก versions ตัวแรก (ตัวล่าสุด)
  const codeContent = snippet.versions[0]?.code || "// No code available"; 

  return (
    <div className="min-h-screen bg-[#020617] text-white py-12 selection:bg-green-500/30 font-sans">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 p-64 bg-green-600/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 left-0 p-64 bg-blue-600/5 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {/* Back Button */}
        <Link href="/snippets" className="inline-flex items-center text-slate-400 hover:text-white mb-8 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปหน้ารวม Snippets
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold font-mono bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded uppercase tracking-wider">
                        {snippet.language}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(snippet.createdAt).toLocaleDateString('th-TH')}
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{snippet.title}</h1>
                <p className="text-slate-400 text-lg leading-relaxed">{snippet.description}</p>
            </div>

            {/* Author Card */}
            <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg min-w-[200px]">
                <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden relative border-2 border-slate-700">
                    <Image 
                      src={snippet.author.image || `https://ui-avatars.com/api/?name=${snippet.author.name}&background=random`} 
                      alt="Author" 
                      fill 
                      className="object-cover" 
                  />
                </div>
                <div>
                    <p className="text-white font-bold text-sm">{snippet.author.name}</p>
                    <p className="text-xs text-slate-500">Author</p>
                </div>
            </div>
        </div>

        {/* Code Block Window */}
        <div className="mb-12">
            <CodeBlock code={codeContent} language={snippet.language} />
        </div>
        
        {/* Comments Section */}
        
            <CommentSection 
                comments={snippet.comments} 
                snippetId={snippet.id} 
            />

      </div>
    </div>
  );
}