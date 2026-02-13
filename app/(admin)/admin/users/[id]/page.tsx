import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar, Package, Github, Facebook, Globe, DollarSign } from "lucide-react";
import UserManageCard from "@/components/admin/UserManageCard";

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // ดึงข้อมูล User + Profile + Orders + บทความที่เขียน
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
        profile: true,
        orders: {
            include: { product: true },
            orderBy: { createdAt: "desc" }
        },
        articles: true
    }
  });

  if (!user) return <div className="p-8 text-white">ไม่พบผู้ใช้งาน</div>;

  // คำนวณยอดซื้อรวม
  const totalSpent = user.orders
    .filter(o => o.status === "COMPLETED")
    .reduce((acc, curr) => acc + Number(curr.total), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link href="/admin/users" className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors w-fit">
         <ArrowLeft size={18} /> กลับไปหน้ารายชื่อ
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Info */}
          <div className="space-y-8">
              {/* Profile Card */}
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
                  <div className="w-32 h-32 mx-auto bg-slate-800 rounded-full mb-4 overflow-hidden border-4 border-slate-700 relative">
                      <Image src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} alt="" fill className="object-cover" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  <p className="text-slate-500 mb-4">{user.email}</p>
                  
                  <div className="flex justify-center gap-2 mb-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                          {user.role}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {user.isActive ? 'Active' : 'Banned'}
                      </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                      <div>
                          <p className="text-slate-500 text-xs uppercase font-bold">ยอดซื้อรวม</p>
                          <p className="text-green-400 font-mono text-lg font-bold">฿{totalSpent.toLocaleString()}</p>
                      </div>
                      <div>
                          <p className="text-slate-500 text-xs uppercase font-bold">คำสั่งซื้อ</p>
                          <p className="text-white font-mono text-lg font-bold">{user.orders.length}</p>
                      </div>
                  </div>
              </div>

              {/* Social & Bio */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-white font-bold mb-4">ข้อมูลติดต่อ & Bio</h3>
                  <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-slate-400">
                          <Mail size={16} /> {user.email}
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                          <Calendar size={16} /> สมัครเมื่อ {new Date(user.createdAt).toLocaleDateString("th-TH")}
                      </div>
                      {user.profile?.github && (
                          <a href={user.profile.github} target="_blank" className="flex items-center gap-3 text-blue-400 hover:underline">
                              <Github size={16} /> GitHub
                          </a>
                      )}
                      {user.profile?.facebook && (
                          <a href={user.profile.facebook} target="_blank" className="flex items-center gap-3 text-blue-400 hover:underline">
                              <Facebook size={16} /> Facebook
                          </a>
                      )}
                  </div>
                  
                  {user.profile?.bio && (
                      <div className="mt-6 pt-6 border-t border-slate-800">
                          <p className="text-slate-300 italic">"{user.profile.bio}"</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Right Column: Manage & History */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Management Component */}
              <UserManageCard user={{ 
                  id: user.id, 
                  role: user.role,
                  name: user.name, 
                  email: user.email,
                  isActive: user.isActive // <--- ✅ เพิ่มตรงนี้ครับ เพื่อให้ปุ่มแบนรู้สถานะ
              }} />

              {/* Order History */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <Package className="text-blue-500" /> ประวัติการสั่งซื้อ ({user.orders.length})
                      </h3>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-300">
                          <thead className="bg-slate-950 text-slate-500 uppercase font-bold text-xs">
                              <tr>
                                  <th className="p-4">วันที่</th>
                                  <th className="p-4">สินค้า</th>
                                  <th className="p-4">ราคา</th>
                                  <th className="p-4 text-right">สถานะ</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                              {user.orders.map(order => (
                                  <tr key={order.id} className="hover:bg-slate-800/50">
                                      <td className="p-4">{new Date(order.createdAt).toLocaleDateString("th-TH")}</td>
                                      <td className="p-4 font-bold text-white">{order.product.name}</td>
                                      <td className="p-4">฿{Number(order.total).toLocaleString()}</td>
                                      <td className="p-4 text-right">
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                                              order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                              order.status === 'WAITING_VERIFY' ? 'bg-yellow-500/20 text-yellow-400' :
                                              'bg-slate-800 text-slate-500'
                                          }`}>
                                              {order.status}
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                              {user.orders.length === 0 && (
                                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">ไม่มีประวัติการสั่งซื้อ</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
}