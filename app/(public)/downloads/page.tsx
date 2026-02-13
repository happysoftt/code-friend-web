import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Package, FileCode, Download, CloudDownload } from "lucide-react";
import DownloadButton from "@/components/downloads/DownloadButton";

export const dynamic = 'force-dynamic';

export default async function DownloadsPage() {
  // ดึงสินค้าที่เป็นราคา 0 หรือ isFree (แจกฟรี)
  const downloads = await prisma.product.findMany({
    where: { 
        isActive: true, 
        OR: [
            { price: 0 },
            { isFree: true }
        ]
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-sans">
      
      {/* --- HERO HEADER --- */}
      <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-[#020617] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-blue-300 text-xs font-bold mb-6 backdrop-blur-md shadow-lg shadow-blue-900/10">
                 <CloudDownload size={14} /> Free Resources
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                 ศูนย์รวม <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse">ดาวน์โหลดฟรี</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                 Source Code, Template, และเครื่องมือช่วยพัฒนาสำหรับนักพัฒนา <br className="hidden md:block"/> หยิบไปใช้ได้เลยโดยไม่มีค่าใช้จ่าย
            </p>
          </div>
      </div>

      {/* --- GRID CONTENT --- */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {downloads.map((item) => (
            <div key={item.id} className="group bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 flex flex-col backdrop-blur-sm relative">
              
              {/* Image Section */}
              <div className="relative h-56 w-full bg-slate-800 overflow-hidden">
                  {item.image ? (
                      <Image 
                          src={item.image} 
                          alt={item.title} // [แก้] ใช้ title ตาม Schema
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <Package size={48} opacity={0.5} />
                      </div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 border border-blue-400/30">
                      <Download size={12} /> FREE
                  </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {item.title} {/* [แก้] ใช้ title */}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                      {item.description || "ไม่มีรายละเอียด"}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                          <FileCode size={14} className="mr-1.5 text-blue-500" /> 
                          Source Code
                      </div>
                      
                      {/* ปุ่ม Download Component */}
                      <div className="relative z-10">
                        <DownloadButton productId={item.id} fileUrl={item.downloadUrl || item.fileUrl || "#"} />
                      </div>
                  </div>
              </div>
            </div>
          ))}
        </div>
        
        {downloads.length === 0 && (
           <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
             <Package size={48} className="mx-auto mb-4 opacity-30" />
             <p className="text-lg font-medium">ยังไม่มีไฟล์ดาวน์โหลดในขณะนี้</p>
             <p className="text-sm mt-1">โปรดติดตามตอนต่อไป...</p>
           </div>
         )}
      </div>
    </div>
  );
}