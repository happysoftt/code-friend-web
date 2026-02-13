import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Clock, Activity, Search, ShieldAlert, User, FileJson, Terminal } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams || {};

  // ดึงข้อมูล Logs
  const logs = await prisma.auditLog.findMany({
    where: {
        ...(q ? { 
            OR: [
                { action: { contains: q, mode: 'insensitive' } },
                { details: { contains: q, mode: 'insensitive' } },
                { user: { name: { contains: q, mode: 'insensitive' } } }
            ]
        } : {})
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100, // เพิ่มจำนวนรายการ
  });

  // ฟังก์ชันเลือกสีตาม Action (Helper)
  const getActionStyle = (action: string) => {
      const act = action.toUpperCase();
      if (act.includes("CREATE") || act.includes("ADD")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      if (act.includes("DELETE") || act.includes("REMOVE")) return "bg-red-500/10 text-red-500 border-red-500/20";
      if (act.includes("UPDATE") || act.includes("EDIT")) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      if (act.includes("LOGIN") || act.includes("AUTH")) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      return "bg-slate-800 text-slate-400 border-slate-700";
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                <Activity className="text-blue-500" /> System Audit Logs
            </h1>
            <p className="text-slate-400">บันทึกกิจกรรมทั้งหมดในระบบ ({logs.length} รายการล่าสุด)</p>
        </div>
      </div>

      {/* Card Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <form className="relative w-full max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input 
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหา Log (Action, User, Details)..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-slate-600 font-mono text-sm" 
                />
            </form>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <ShieldAlert size={14} /> Only Admins can view this page
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400 border-collapse min-w-[1000px]">
            <thead className="bg-slate-950/50 text-slate-400 uppercase font-bold text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 w-[15%]">Timestamp</th>
                <th className="px-6 py-4 w-[20%]">User</th>
                <th className="px-6 py-4 w-[15%]">Action</th>
                <th className="px-6 py-4 w-[50%]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Time */}
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {log.createdAt.toLocaleString("th-TH", { dateStyle: 'short', timeStyle: 'medium' })}
                    </div>
                  </td>

                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700">
                             <Image 
                                src={log.user?.image || `https://ui-avatars.com/api/?name=${log.user?.name || 'System'}`} 
                                alt="User" fill className="object-cover" 
                             />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-white text-xs truncate max-w-[150px]">
                                {log.user?.name || "System / Guest"}
                            </p>
                            <p className="text-[10px] text-slate-600 truncate font-mono">
                                ID: {log.user?.id?.slice(0, 8) || "N/A"}...
                            </p>
                        </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border font-mono ${getActionStyle(log.action)}`}>
                        {log.action}
                    </span>
                  </td>

                  {/* Details */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 max-w-xl">
                        <FileJson size={16} className="text-slate-600 mt-0.5 flex-shrink-0" />
                        <code className="text-xs text-slate-300 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800 truncate block w-full hover:whitespace-normal hover:bg-slate-900 transition-all cursor-text select-all">
                            {log.details || "-"}
                        </code>
                    </div>
                  </td>

                </tr>
              ))}
              
              {logs.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 mb-4">
                            <Terminal className="text-slate-600" size={32} />
                        </div>
                        <p>ยังไม่มีประวัติการใช้งาน (หรือค้นหาไม่เจอ)</p>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}