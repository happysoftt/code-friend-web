"use client";

import { createComment } from "@/lib/actions"; // ตรวจสอบว่า import ถูกต้อง
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { User, Send, MessageSquare } from "lucide-react";
import Image from "next/image";

interface CommentSectionProps {
  showcaseId?: string;
  articleId?: string;
  learningPathId?: string;
  initialComments?: any[]; // ใส่ ? เผื่อไว้
  currentUser: any;
}

export default function CommentSection({ 
  showcaseId, 
  articleId, 
  learningPathId,
  initialComments = [], // ✅ กำหนดค่าเริ่มต้นเป็น array ว่างเสมอ
  currentUser 
}: CommentSectionProps) {
  
  // ✅ ใช้ค่าจาก initialComments หรือ array ว่าง (กัน Error undefined)
  const [comments, setComments] = useState(initialComments || []);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      return;
    }

    startTransition(async () => {
      // เรียก Server Action
      const result = await createComment({
        content,
        showcaseId, // ส่ง ID ไป (ถ้ามี)
        articleId,  // ส่ง ID ไป (ถ้ามี)
        learningPathId,
      });

      if (result?.error) {
        alert(result.error);
      } else {
        setContent(""); // เคลียร์ช่องพิมพ์
        router.refresh(); // รีเฟรชหน้าเพื่อดึงคอมเมนต์ใหม่
        
        // *หมายเหตุ: ปกติ router.refresh จะอัปเดต prop initialComments เข้ามาใหม่
        // แต่ถ้าอยากให้ UI อัปเดตทันทีแบบ Optimistic UI ต้องเขียนเพิ่ม
        // ในที่นี้เอาแบบง่ายคือรอ refresh หน้าจอ
      }
    });
  };

  return (
    <div className="mt-12 border-t border-slate-800 pt-8">
      {/* ✅ ตรงนี้จะไม่ Error แล้ว เพราะ comments เป็น array เสมอ */}
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="text-indigo-400" /> ความคิดเห็น ({comments.length})
      </h3>

      {/* Comment Form */}
      <div className="bg-slate-900/50 p-6 rounded-2xl mb-8 border border-slate-800">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden relative border border-slate-700">
            {currentUser?.image ? (
                <Image src={currentUser.image} alt="Me" fill className="object-cover" />
            ) : (
                <User className="w-full h-full p-2 text-slate-500" />
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนความคิดเห็นของคุณ..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px] resize-none transition-all"
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={isPending || !content.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPending ? "กำลังส่ง..." : <><Send size={18} /> ส่งความคิดเห็น</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-slate-900/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden relative border border-slate-700">
                 <Image 
                    src={comment.user?.image || `https://ui-avatars.com/api/?name=${comment.user?.name || 'User'}`} 
                    alt={comment.user?.name || "User"} 
                    fill 
                    className="object-cover" 
                 />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">{comment.user?.name || "Anonymous"}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleDateString('th-TH', { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500 italic bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
            ยังไม่มีความคิดเห็น เป็นคนแรกที่เริ่มพูดคุยเลย!
          </div>
        )}
      </div>
    </div>
  );
}