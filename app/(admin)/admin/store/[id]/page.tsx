import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar, Shield, Package, FileText, User as UserIcon } from "lucide-react";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. ดึงข้อมูล User พร้อม Relation ที่เกี่ยวข้อง
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      role: true, // ✅ จุดที่ 1: ต้องสั่งดึงตาราง Role มาด้วย
      articles: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      orders: {
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!user) return notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      
      {/* Header */}
      <Link href="/admin/users" className="inline-flex items-center text-slate-400 hover:text-white mb-6 text-sm transition-colors group">
        <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไปรายชื่อผู้ใช้
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl mb-8">
        <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900"></div>
        <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
                <div className="relative w-24 h-24 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                    {user.image ? (
                        <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <UserIcon size={40} />
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                <p className="text-slate-400 flex items-center gap-2 justify-center md:justify-start mb-6">
                    <Mail size={14} /> {user.email}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                    {/* ✅ จุดที่ 2: เรียกใช้ user.role.name แทน user.role เพียวๆ */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${user.role?.name === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                        <Shield size={12} /> {user.role?.name || "MEMBER"}
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {user.isActive ? "Active" : "Inactive"}
                    </span>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                        <Calendar size={12} /> เข้าร่วมเมื่อ {user.createdAt.toLocaleDateString('th-TH')}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-t border-slate-800">
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-500 text-xs uppercase font-bold mb-1">บทความ</p>
                        <p className="text-2xl font-bold text-white flex items-center gap-2">
                             <FileText className="text-blue-500" size={20} /> {user.articles.length}
                        </p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-500 text-xs uppercase font-bold mb-1">คำสั่งซื้อ</p>
                        <p className="text-2xl font-bold text-white flex items-center gap-2">
                             <Package className="text-emerald-500" size={20} /> {user.orders.length}
                        </p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-500 text-xs uppercase font-bold mb-1">Level / XP</p>
                        <p className="text-2xl font-bold text-white flex items-center gap-2">
                             <span className="text-yellow-500 text-lg">LV.{user.level}</span>
                             <span className="text-slate-600 text-sm">/ {user.xp} XP</span>
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Orders */}
         <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Package className="text-emerald-500" /> คำสั่งซื้อล่าสุด</h2>
            <div className="space-y-3">
                {user.orders.length > 0 ? user.orders.map(order => (
                    <div key={order.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                        <div>
                             <p className="text-white font-bold text-sm">{order.product.title}</p>
                             <p className="text-slate-500 text-xs">{order.createdAt.toLocaleDateString('th-TH')}</p>
                        </div>
                        <span className="text-emerald-400 font-mono font-bold">฿{Number(order.total).toLocaleString()}</span>
                    </div>
                )) : (
                    <p className="text-slate-500 text-sm">ไม่มีประวัติคำสั่งซื้อ</p>
                )}
            </div>
         </div>

         {/* Articles */}
         <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FileText className="text-blue-500" /> บทความล่าสุด</h2>
            <div className="space-y-3">
                {user.articles.length > 0 ? user.articles.map(article => (
                    <div key={article.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <p className="text-white font-bold text-sm truncate">{article.title}</p>
                        <p className="text-slate-500 text-xs mt-1">{new Date(article.createdAt).toLocaleDateString('th-TH')}</p>
                    </div>
                )) : (
                    <p className="text-slate-500 text-sm">ยังไม่มีบทความ</p>
                )}
            </div>
         </div>
      </div>

    </div>
  );
}