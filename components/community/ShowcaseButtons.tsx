"use client";

import { useState, useTransition } from "react";
import { Heart, ExternalLink, Loader2 } from "lucide-react";
import { toggleShowcaseLike, incrementDemoClick } from "@/lib/actions";
import { useRouter } from "next/navigation";

// --- ปุ่ม LIKE ---
interface LikeButtonProps {
  showcaseId: string;
  initialLikes: number;
  initialIsLiked: boolean;
  currentUser: any;
}

export function LikeButton({ showcaseId, initialLikes, initialIsLiked, currentUser }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = async () => {
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนกดถูกใจ");
      return;
    }

    // Optimistic Update (เปลี่ยนตัวเลขทันทีไม่ต้องรอ Server)
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes((prev) => (newIsLiked ? prev + 1 : prev - 1));

    // เรียก Server Action
    startTransition(async () => {
      const result = await toggleShowcaseLike(showcaseId);
      if (result.error) {
        // ถ้า Error ให้ rollback ค่ากลับ
        setIsLiked(!newIsLiked);
        setLikes((prev) => (!newIsLiked ? prev + 1 : prev - 1));
      } else {
         router.refresh();
      }
    });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-full border ${
        isLiked 
          ? "text-pink-400 bg-pink-500/10 border-pink-500/20" 
          : "text-slate-400 bg-slate-800/50 border-slate-700 hover:text-white hover:border-slate-600"
      }`}
    >
      <Heart 
        size={18} 
        className={`transition-transform ${isLiked ? "fill-pink-400 scale-110" : "scale-100"} ${isPending ? "animate-pulse" : ""}`} 
      />
      <span>{likes} ถูกใจ</span>
    </button>
  );
}

// --- ปุ่ม VISIT WEBSITE (นับยอดคลิก) ---
interface VisitButtonProps {
  showcaseId: string;
  url: string;
}

export function VisitButton({ showcaseId, url }: VisitButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    // 1. เรียก Action เพื่อนับยอด (แบบไม่รอผลก็ได้ เพื่อความเร็ว)
    incrementDemoClick(showcaseId); 
    
    // 2. หน่วงเวลานิดนึงให้ดูมี interaction หรือเปิดเลยก็ได้
    setTimeout(() => {
        setIsLoading(false);
        window.open(url, "_blank");
    }, 300);
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
    >
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ExternalLink size={18} />}
      เยี่ยมชมเว็บไซต์ (Live Demo)
    </button>
  );
}