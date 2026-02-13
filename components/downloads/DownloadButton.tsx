"use client";

import { trackDownload } from "@/lib/actions";
import { Download } from "lucide-react";

export default function DownloadButton({ productId, fileUrl }: { productId: string, fileUrl: string }) {
  
  const handleDownload = async () => {
    // 1. แจ้ง Server ว่ามีการดาวน์โหลด (ไม่ต้องรอให้เสร็จ)
    trackDownload(productId);
    
    // 2. เปิดลิ้งค์ไฟล์
    window.open(fileUrl, "_blank");
  };

  return (
    <button 
        onClick={handleDownload}
        className="flex items-center gap-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
    >
        <Download size={16} /> ดาวน์โหลด
    </button>
  );
}