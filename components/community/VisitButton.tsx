"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { incrementShowcaseView } from "../..//lib/actions"; 
interface VisitButtonProps {
  showcaseId: string;
  url: string;
}

export const VisitButton = ({ showcaseId, url }: VisitButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {

      await incrementShowcaseView(showcaseId); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      // 2. เปิดลิงก์ใน Tab ใหม่
      window.open(url, "_blank");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 active:scale-95 disabled:opacity-70"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <ExternalLink size={18} />}
      เข้าชมเว็บไซต์
    </button>
  );
};