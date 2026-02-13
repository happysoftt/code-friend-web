import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Package, Download, User, LogOut, Key, Clock, 
  CheckCircle, FileText, Github, Facebook, 
  Globe, LayoutDashboard, Settings, ShoppingBag, ShieldCheck, ArrowRight 
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
        profile: true, 
        orders: {
            include: {
                product: true,
                licenseKeys: true
            },
            orderBy: { createdAt: "desc" }
        }
    }
  });

  if (!user) return redirect("/");

  // คำนวณสถิติ
  const completedOrders = user.orders.filter(o => o.status === "COMPLETED");
  const totalSpent = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="min-h-screen bg-[#020617] text-white py-12 selection:bg-purple-500/30 font-sans">
      
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 p-64 bg-purple-600/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 left-0 p-48 bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR PROFILE --- */}
          <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 text-center sticky top-24 shadow-2xl">
                  
                  {/* Avatar */}
                  <div className="relative mx-auto w-28 h-28 mb-6 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-slate-700 bg-slate-900">
                          <Image 
                             src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                             alt="Profile" 
                             fill 
                             className="object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                      </div>
                      {session.user.role === "ADMIN" && (
                          <div className="absolute bottom-0 right-0 bg-yellow-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-lg">
                              ADMIN
                          </div>
                      )}
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                  <p className="text-slate-500 text-sm mb-4 font-mono">{user.email}</p>
                  
                  {user.profile?.bio && (
                      <p className="text-slate-400 text-sm italic mb-6 px-2 leading-relaxed">
                          "{user.profile.bio}"
                      </p>
                  )}

                  {/* Social Links */}
                  <div className="flex justify-center gap-3 mb-8">
                      {user.profile?.github && (
                          <a href={user.profile.github} target="_blank" className="p-2.5 bg-slate-800 hover:bg-[#333] text-slate-400 hover:text-white rounded-xl transition-all hover:-translate-y-1">
                              <Github size={18} />
                          </a>
                      )}
                      {user.profile?.facebook && (
                          <a href={user.profile.facebook} target="_blank" className="p-2.5 bg-slate-800 hover:bg-[#1877F2] text-slate-400 hover:text-white rounded-xl transition-all hover:-translate-y-1">
                              <Facebook size={18} />
                          </a>
                      )}
                      {user.profile?.website && (
                          <a href={user.profile.website} target="_blank" className="p-2.5 bg-slate-800 hover:bg-green-600 text-slate-400 hover:text-white rounded-xl transition-all hover:-translate-y-1">
                              <Globe size={18} />
                          </a>
                      )}
                      {!user.profile?.github && !user.profile?.facebook && !user.profile?.website && (
                          <span className="text-xs text-slate-600 border border-slate-800 px-3 py-1 rounded-full">ยังไม่เชื่อมต่อ Social</span>
                      )}
                  </div>
                  
                  {/* Menu Actions */}
                  <div className="space-y-3">
                      <Link href="/settings" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-slate-700/50 hover:border-slate-600">
                          <Settings size={16} /> แก้ไขโปรไฟล์
                      </Link>
                      
                      {session.user.role === "ADMIN" && (
                          <Link href="/admin" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                              <LayoutDashboard size={16} /> ระบบหลังบ้าน
                          </Link>
                      )}

                      <Link href="/api/auth/signout" className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 mt-4 border border-transparent hover:border-red-500/30">
                          <LogOut size={16} /> ออกจากระบบ
                      </Link>
                  </div>
              </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1 space-y-8">
              
              <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
                  <div>
                      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Dashboard</h1>
                      <p className="text-slate-400">ยินดีต้อนรับกลับมา, จัดการข้อมูลและสินค้าของคุณได้ที่นี่</p>
                  </div>
                  <div className="text-right hidden md:block">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Total Spent</p>
                      <p className="text-2xl font-mono font-bold text-green-400">฿{totalSpent.toLocaleString()}</p>
                  </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-3xl p-6 overflow-hidden">
                      <div className="absolute top-0 right-0 p-20 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-500" />
                      <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300"><Package size={24} /></div>
                              <span className="text-indigo-200 text-sm font-bold">สินค้าที่ครอบครอง</span>
                          </div>
                          <h3 className="text-4xl font-black text-white mb-1">{completedOrders.length} <span className="text-lg font-normal text-indigo-300">รายการ</span></h3>
                          <p className="text-xs text-indigo-400/70 mt-2">รวมสินค้าที่ซื้อและดาวน์โหลดฟรี</p>
                      </div>
                  </div>

                  <div className="group relative bg-slate-900/50 border border-slate-800 rounded-3xl p-6 overflow-hidden hover:border-slate-700 transition-colors">
                      <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><User size={24} /></div>
                              <span className="text-slate-400 text-sm font-bold">ระดับสมาชิก</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <h3 className="text-2xl font-bold text-white capitalize">{user.role === 'ADMIN' ? 'Administrator' : 'General Member'}</h3>
                              {user.role === 'ADMIN' && <ShieldCheck className="text-yellow-500" size={20} />}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">เข้าร่วมเมื่อ: {new Date(user.createdAt).toLocaleDateString('th-TH')}</p>
                      </div>
                  </div>
              </div>

              {/* Orders List */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                  <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                      <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                          <Package className="text-blue-500" size={20} /> รายการสั่งซื้อล่าสุด
                      </h3>
                      <Link href="/store" className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                          ไปที่ร้านค้า <ArrowRight size={12} />
                      </Link>
                  </div>
                  
                  <div className="divide-y divide-slate-800">
                      {user.orders.map((order) => (
                          <div key={order.id} className="p-6 hover:bg-slate-800/30 transition-colors group">
                              <div className="flex flex-col md:flex-row gap-6">
                                  {/* Product Image */}
                                  <div className="w-full md:w-24 h-24 bg-slate-800 rounded-xl overflow-hidden relative flex-shrink-0 border border-slate-700/50 group-hover:border-slate-600 transition-colors">
                                      {order.product.image ? (
                                          <Image src={order.product.image} alt="" fill className="object-cover" />
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center text-slate-600"><ShoppingBag size={24} opacity={0.5} /></div>
                                      )}
                                  </div>

                                  {/* Order Details */}
                                  <div className="flex-1 min-w-0">
                                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                                          <div>
                                              <h4 className="font-bold text-white text-lg truncate group-hover:text-blue-400 transition-colors">{order.product.name}</h4>
                                              <p className="text-xs text-slate-500">Order ID: #{order.id.slice(0,8)} • {new Date(order.createdAt).toLocaleDateString('th-TH')}</p>
                                          </div>
                                          <div className="text-right">
                                              {order.total > 0 ? (
                                                  <span className="font-mono font-bold text-white">฿{Number(order.total).toLocaleString()}</span>
                                              ) : (
                                                  <span className="text-green-400 font-bold text-sm bg-green-900/20 px-2 py-1 rounded">FREE</span>
                                              )}
                                          </div>
                                      </div>

                                      {/* Status & License */}
                                      <div className="flex flex-wrap items-center gap-3 mt-3">
                                          {order.status === "COMPLETED" && (
                                              <span className="text-green-400 text-[10px] font-bold flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                                  <CheckCircle size={12} /> ชำระเงินแล้ว
                                              </span>
                                          )}
                                          {order.status === "WAITING_VERIFY" && (
                                              <span className="text-yellow-400 text-[10px] font-bold flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 animate-pulse">
                                                  <Clock size={12} /> รอตรวจสอบสลิป
                                              </span>
                                          )}
                                          {order.status === "PENDING" && (
                                              <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                                                  <FileText size={12} /> รอชำระเงิน
                                              </span>
                                          )}

                                          {/* Show License Key */}
                                          {order.status === "COMPLETED" && order.licenseKeys.length > 0 && (
                                              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                                                  <Key size={12} className="text-yellow-500" />
                                                  <code className="text-xs text-slate-300 font-mono tracking-wide">{order.licenseKeys[0].key}</code>
                                              </div>
                                          )}
                                      </div>
                                  </div>

                                  {/* Actions Button */}
                                  <div className="flex items-center md:self-center pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 w-full md:w-auto mt-4 md:mt-0">
                                      {order.status === "COMPLETED" ? (
                                          // ✅ แก้ไขลิงก์ดาวน์โหลดให้ใช้ Product ID แทน Order ID เพื่อให้ตรงกับ API ที่เราทำ
                                          <a 
                                              href={`/api/download/${order.product.id}`} 
                                              // target="_blank" // เปิดแท็บใหม่ถ้าต้องการ
                                              className="w-full md:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 active:scale-95"
                                          >
                                              <Download size={16} /> ดาวน์โหลด
                                          </a>
                                      ) : (
                                          <button disabled className="w-full md:w-auto px-5 py-2.5 bg-slate-800 text-slate-500 rounded-xl font-bold text-sm cursor-not-allowed border border-slate-700">
                                              {order.status === "WAITING_VERIFY" ? "รออนุมัติ..." : "ยังไม่สำเร็จ"}
                                          </button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ))}

                      {user.orders.length === 0 && (
                          <div className="py-20 text-center">
                              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                                  <Package size={32} className="text-slate-600" />
                              </div>
                              <p className="text-slate-400 font-medium">คุณยังไม่มีประวัติการสั่งซื้อ</p>
                              <Link href="/store" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-flex items-center gap-1 hover:underline">
                                  ไปเลือกซื้อสินค้ากันเถอะ <ArrowRight size={14} />
                              </Link>
                          </div>
                      )}
                  </div>
              </div>

          </div>
        </div>
      </div>
    </div>
  );
}