import Link from "next/link";
import { Calendar, User } from "lucide-react";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  slug: string;
  author: string;
  date: string;
  category: string;
}

export default function ArticleCard({ title, excerpt, slug, author, date, category }: ArticleCardProps) {
  return (
    <Link href={`/articles/${slug}`} className="group block h-full">
      <div className="h-full rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-primary/50 hover:bg-slate-800/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
            {category}
          </span>
          <span className="flex items-center text-xs text-slate-500">
            <Calendar className="mr-1 h-3 w-3" /> {date}
          </span>
        </div>
        
        <h3 className="mb-2 text-xl font-bold text-slate-100 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        
        <p className="mb-4 text-sm text-slate-400 line-clamp-3 flex-grow">
          {excerpt}
        </p>
        
        <div className="mt-auto flex items-center text-xs text-slate-500 border-t border-border pt-4">
          <User className="mr-2 h-4 w-4 text-slate-400" />
          {author}
        </div>
      </div>
    </Link>
  );
}