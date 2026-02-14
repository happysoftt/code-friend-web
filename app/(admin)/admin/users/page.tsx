import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Users, Search, Shield, User, Mail, Calendar } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams || {};

  // ค้นหาผู้ใช้
  const users = await prisma.user.findMany({
    where: q ? {
        OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } }
        ]
    } : undefined,
    orderBy: { createdAt: "desc" },
    include: { 
        _count: { select: { orders: true } },
        role: true // <--- ✅ ใส่ตรงนี้เพิ่มครับ! สำคัญมาก ถ้าไม่ใส่ระบบจะไม่รู้ว่า user role อะไร
    }
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Users className="text-purple-500" /> จัดการผู้ใช้งาน
            </h1>
            <p className="text-slate-400">สมาชิกทั้งหมดในระบบ ({users.length} คน)</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
         
         {/* Toolbar */}
         <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            
            {/* Search Form */}
            <form className="relative w-full max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหาชื่อ, อีเมล..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all placeholder-slate-600" 
                />
            </form>

            {/* Stats (Mockup) */}
            <div className="flex gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Admin
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span> User
                </div>
            </div>
         </div>

         {/* Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
               <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-800">
                  <tr>
                      <th className="px-6 py-4 w-[35%]">ผู้ใช้งาน</th>
                      <th className="px-6 py-4 w-[15%]">สิทธิ์ (Role)</th>
                      <th className="px-6 py-4 w-[15%] text-right">ยอดคำสั่งซื้อ</th>
                      <th className="px-6 py-4 w-[20%]">วันที่สมัคร</th>
                      <th className="px-6 py-4 w-[15%] text-right">จัดการ</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800 text-sm">
                  {users.map(user => {
                      // Logic ดึงชื่อ Role (รองรับทั้ง String และ Relation Object)
                      // ถ้า user.role เป็น object ให้ดึง .name, ถ้าไม่มีให้เป็น "MEMBER"
                      const roleName = (typeof user.role === 'object' && user.role !== null) 
                        ? (user.role as any).name 
                        : (String(user.role || "MEMBER"));
                      
                      const isAdmin = roleName.toUpperCase() === "ADMIN";

                      return (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                         
                         {/* User Info */}
                         <td className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700 group-hover:border-purple-500/50 transition-colors">
                                  <Image 
                                     src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} 
                                     alt={user.name || "User"} 
                                     fill 
                                     className="object-cover" 
                                  />
                               </div>
                               <div className="min-w-0">
                                  <p className="font-bold text-white text-sm mb-0.5 truncate group-hover:text-purple-400 transition-colors">
                                     {user.name || "Unknown"}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                                     <Mail size={10} /> {user.email}
                                  </div>
                               </div>
                            </div>
                         </td>

                         {/* Role (แก้ไข Logic การแสดงผลให้ฉลาดขึ้น) */}
                         <td className="px-6 py-4 align-middle">
                            {isAdmin ? (
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20 shadow-sm shadow-purple-900/10">
                                  <Shield size={10} /> ADMIN
                               </span>
                            ) : (
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
                                  <User size={10} /> MEMBER
                               </span>
                            )}
                         </td>

                         {/* Order Count */}
                         <td className="px-6 py-4 text-right align-middle">
                            <span className="font-mono text-slate-300 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                               {user._count.orders}
                            </span>
                         </td>

                         {/* Created At */}
                         <td className="px-6 py-4 align-middle text-slate-500 text-xs">
                            <div className="flex items-center gap-2">
                                 <Calendar size={12} />
                                 {new Date(user.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                         </td>

                         {/* Actions */}
                         <td className="px-6 py-4 text-right align-middle">
                            <Link 
                                 href={`/admin/users/${user.id}`} 
                                 className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-400 border border-slate-700 hover:border-purple-500 transition-all opacity-60 group-hover:opacity-100"
                            >
                                 จัดการ
                            </Link>
                         </td>
                      </tr>
                   )})}
                   
                   {users.length === 0 && (
                      <tr>
                         <td colSpan={5} className="text-center py-20">
                             <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 mb-4">
                                 <Users className="text-slate-600" size={32} />
                             </div>
                             <p className="text-slate-500 font-medium">ไม่พบผู้ใช้งาน</p>
                             <p className="text-slate-600 text-xs mt-1">ลองค้นหาด้วยคำอื่น</p>
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