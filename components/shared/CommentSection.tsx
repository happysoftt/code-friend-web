"use client";

import { postComment, deleteComment } from "@/lib/actions"; 
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Send, Trash2, MessageSquare, Clock, User as UserIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast"; 

function timeAgo(dateInput: Date | string) {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "เมื่อสักครู่";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return date.toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' });
}

interface CommentProps {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  isOptimistic?: boolean; 
}

interface CommentSectionProps {
  comments: CommentProps[]; 
  articleId?: string;       
  snippetId?: string;       
  learningPathId?: string; 
  showcaseId?: string;
  currentUser?: any; 
}

export default function CommentSection({ 
  comments: initialComments = [], 
  articleId, 
  snippetId, 
  learningPathId, 
  showcaseId,
  currentUser 
}: CommentSectionProps) {
  
  const [comments, setComments] = useState<CommentProps[]>(initialComments);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition(); 
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    if (!content.trim()) return;

    if (!currentUser) {
       toast.error("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
       router.push("/login");
       return;
    }

    const tempId = Math.random().toString();
    const newComment: CommentProps = {
        id: tempId,
        content: content,
        createdAt: new Date(),
        user: {
            id: currentUser.id,
            name: currentUser.name,
            image: currentUser.image
        },
        isOptimistic: true
    };

    setComments([newComment, ...comments]); 
    setContent(""); 

    startTransition(async () => {
        const formData = new FormData();
        formData.append("content", newComment.content);
        if (articleId) formData.append("articleId", articleId);
        if (snippetId) formData.append("snippetId", snippetId);
        if (learningPathId) formData.append("learningPathId", learningPathId);
        if (showcaseId) formData.append("showcaseId", showcaseId);

        const res = await postComment(formData);

        if (!res.success) {
            // ✅ แก้ไขตรงนี้: ใส่Fallback string ป้องกัน undefined
            toast.error(res.error || "ไม่สามารถส่งความคิดเห็นได้");
            setComments(prev => prev.filter(c => c.id !== tempId));
        } else {
            router.refresh(); 
        }
    });
  }

  async function handleDelete(id: string) {
      if(!confirm("ต้องการลบความคิดเห็นนี้?")) return;
      
      setComments(prev => prev.filter(c => c.id !== id));
      
      const res = await deleteComment(id);
      if(!res.success) {
          toast.error(res.error || "ลบไม่สำเร็จ");
          router.refresh();
      } else {
          toast.success("ลบเรียบร้อย");
      }
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mt-12 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="text-blue-500" /> ความคิดเห็น <span className="text-slate-500 text-sm">({comments.length})</span>
      </h3>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
           {currentUser?.image ? (
               <Image src={currentUser.image} alt="Me" width={40} height={40} className="object-cover" />
           ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs"><UserIcon size={20} /></div>
           )}
        </div>
        <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2} 
                placeholder={currentUser ? "แสดงความคิดเห็น..." : "เข้าสู่ระบบเพื่อคอมเมนต์"}
                disabled={!currentUser || isPending}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pr-12 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none disabled:opacity-50 transition-all relative z-10"
            />
            <button 
                type="submit" 
                disabled={!currentUser || !content.trim() || isPending}
                className="absolute right-3 bottom-3 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all disabled:opacity-0 disabled:scale-75 z-20 shadow-lg shadow-blue-900/20 active:scale-95"
            >
                <Send size={16} />
            </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
            <div key={comment.id} className={`flex gap-4 group ${comment.isOptimistic ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700 relative">
                     <Image 
                        src={comment.user.image || `https://ui-avatars.com/api/?name=${comment.user.name || 'User'}`} 
                        alt={comment.user.name || "User"} 
                        fill 
                        className="object-cover" 
                     />
                </div>
                <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{comment.user.name || "Anonymous"}</h4>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock size={10} /> {timeAgo(comment.createdAt)}
                            </span>
                        </div>
                        
                        {(currentUser?.id === comment.user.id || currentUser?.role === "ADMIN") && !comment.isOptimistic && (
                            <button 
                                onClick={() => handleDelete(comment.id)}
                                className="text-slate-600 hover:text-red-400 text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                title="ลบความคิดเห็น"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                    
                    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-slate-300 text-sm leading-relaxed inline-block min-w-[200px]">
                        {comment.content}
                    </div>
                </div>
            </div>
        ))}

        {comments.length === 0 && (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">ยังไม่มีความคิดเห็น เป็นคนแรกเลยสิ!</p>
            </div>
        )}
      </div>
    </div>
  );
}