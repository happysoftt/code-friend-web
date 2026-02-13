import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import CommentSection from "@/components/shared/CommentSection";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!article) return notFound();

  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } }
  });

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="relative w-full h-[400px] md:h-[500px]">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10"></div>
        {article.coverImage && (
          <Image 
            src={article.coverImage} 
            alt={article.title} 
            fill 
            sizes="100vw"
            className="object-cover opacity-60" 
            priority 
          />
        )}
        
        <div className="absolute inset-0 z-20 container mx-auto px-4 flex flex-col justify-end pb-12">
          <Link href="/articles" className="text-slate-300 hover:text-white flex items-center gap-2 mb-6 w-fit bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 transition-colors">
            <ArrowLeft size={16} /> กลับไปหน้ารวม
          </Link>
          
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-pink-600 text-white text-xs font-bold rounded-full">
              {article.category?.name || "General"}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl">
            {article.title}
          </h1>

          <div className="flex items-center gap-6 text-slate-300 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden relative border border-slate-600">
                <Image 
                  src={article.author.image || `https://ui-avatars.com/api/?name=${article.author.name}`} 
                  alt={article.author.name || ""} 
                  fill 
                  sizes="32px"
                  className="object-cover" 
                />
              </div>
              <span>{article.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(article.createdAt).toLocaleDateString('th-TH', { dateStyle: 'long' })}</span>
            </div>
          </div>
        </div>
      </div>

      <article className="container mx-auto px-4 mt-12 max-w-3xl">
        <div className="prose prose-invert prose-lg max-w-none text-slate-300">
          <MarkdownRenderer content={article.content} />
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800">
          <h3 className="text-white font-bold mb-4">แท็กที่เกี่ยวข้อง</h3>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-sm flex items-center gap-2">
              <Tag size={14} /> Technology
            </span>
            <span className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-sm flex items-center gap-2">
              <Tag size={14} /> Coding
            </span>
          </div>
        </div>
        
        <div className="mt-12">
          <CommentSection 
            comments={article.comments as any} 
            articleId={article.id} 
          />
        </div>
      </article>
    </div>
  );
}