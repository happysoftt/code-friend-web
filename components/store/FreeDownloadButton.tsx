"use client"; // 👈 สำคัญมาก! บรรทัดนี้บอกว่าไฟล์นี้ทำงานฝั่ง Client

import { Zap, Loader2, Download } from "lucide-react";
import { useState } from "react";

interface FreeDownloadButtonProps {
  productId: string;
}

export default function FreeDownloadButton({ productId }: FreeDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault(); // กันไม่ให้ Link ทำงานแบบปกติทันที (ถ้าต้องการ logic เพิ่ม)
    setLoading(true);
    
    // จำลอง Delay นิดหน่อยให้รู้ว่ากดแล้ว หรือเก็บ Stat ก่อนโหลด
    setTimeout(() => {
        setLoading(false);
        // สั่งให้ Browser วิ่งไปที่ Link ดาวน์โหลด
        window.location.href = `/api/download/${productId}`;
    }, 800);
  };

  return (
    <button 
        onClick={handleDownload}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 transition-all active:scale-95 mb-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
    >
        {loading ? (
            <><Loader2 size={20} className="animate-spin" /> กำลังดาวน์โหลด...</>
        ) : (
            <><Zap size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" /> ดาวน์โหลดไฟล์ทันที</>
        )}
    </button>
  );
}