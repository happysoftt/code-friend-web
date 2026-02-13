import { prisma } from "@/lib/prisma";
import { Users, DollarSign, ShoppingBag, FileText, ArrowUpRight, TrendingUp, Activity, Plus, Download, Eye, Package, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AnalyticsChart from "@/components/admin/AnalyticsChart";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic'; 

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 1. ดึงข้อมูลสถิติ
  const [
      userCount, 
      orderCount, 
      articleCount, 
      totalRevenueData, 
      recentOrders,
      totalDownloads,
      totalViews,
      topProducts,
      recentDownloads
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.article.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "COMPLETED" } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true, product: true } }),
    prisma.downloadHistory.count(),
    prisma.product.aggregate({ _sum: { viewCount: true } }),
    prisma.product.findMany({ take: 5, orderBy: { downloadCount: 'desc' }, select: { title: true, downloadCount: true, viewCount: true } }),
    
    // ✅ แก้จุดที่ 1: เปลี่ยน createdAt -> downloadedAt
    prisma.downloadHistory.findMany({ 
        take: 5, 
        orderBy: { downloadedAt: 'desc' }, 
        include: { product: true, user: true } 
    })
  ]);

  const totalRevenue = totalRevenueData._sum.total || 0;

  // 2. เตรียมข้อมูลกราฟ (ยอดโหลด 7 วันย้อนหลัง)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // ✅ แก้จุดที่ 2: เปลี่ยน createdAt -> downloadedAt ใน query กราฟ
  const downloadsLast7Days = await prisma.downloadHistory.findMany({
    where: { downloadedAt: { gte: sevenDaysAgo } },
    select: { downloadedAt: true }
  });

  const chartDataMap = new Map();
  for (let i = 0; i < 7; i++) {
     const d = new Date();
     d.setDate(d.getDate() - i);
     const key = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
     chartDataMap.set(key, 0);
  }
  
  // ✅ แก้จุดที่ 3: เปลี่ยน item.createdAt -> item.downloadedAt ในลูป
  downloadsLast7Days.forEach(item => {
     const key = new Date(item.downloadedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
     if (chartDataMap.has(key)) chartDataMap.set(key, chartDataMap.get(key) + 1);
  });
  
  const chartData = Array.from(chartDataMap, ([name, downloads]) => ({ name, downloads })).reverse();


  return (
    <div className="p-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-400 text-sm mt-1">ยินดีต้อนรับกลับ, ผู้ดูแลระบบ</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Online
            </span>
            <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                {new Date().toLocaleTimeString('th-TH')}
            </span>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Revenue" 
            value={`฿${Number(totalRevenue).toLocaleString()}`} 
            icon={<DollarSign className="text-emerald-400" size={24} />} 
            trend="+12.5%" color="emerald"
        />
        <StatCard 
            title="Total Orders" 
            value={orderCount.toLocaleString()} 
            icon={<ShoppingBag className="text-orange-400" size={24} />} 
            trend="+8.1%" color="orange"
        />
        <StatCard 
            title="Downloads" 
            value={totalDownloads.toLocaleString()} 
            icon={<Download className="text-blue-400" size={24} />} 
            trend="New" color="blue"
        />
        <StatCard 
            title="Total Views" 
            value={(totalViews._sum.viewCount || 0).toLocaleString()} 
            icon={<Eye className="text-purple-400" size={24} />} 
            trend="New" color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* --- CHART SECTION (2/3) --- */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Activity size={18} className="text-emerald-500" /> สถิติการดาวน์โหลด (7 วัน)
                </h3>
            </div>
            <div className="h-[300px] w-full">
                <AnalyticsChart data={chartData} />
            </div>
        </div>

        {/* --- TOP PRODUCTS (1/3) --- */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <Package size={18} className="text-yellow-500" /> สินค้ายอดฮิต
            </h3>
            <div className="space-y-3">
                {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-950/30 rounded-xl border border-slate-800/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${i===0 ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                {i + 1}
                            </div>
                            <p className="truncate font-medium text-slate-200 text-sm">{p.title}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-emerald-400 font-bold text-xs">{p.downloadCount} โหลด</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>

      <div className="grid lg:grid-cols-2 gap-8">
          
          {/* RECENT ORDERS TABLE */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <ShoppingBag size={18} className="text-blue-500" /> คำสั่งซื้อล่าสุด
                </h3>
                <Link href="/admin/orders" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors">
                    ดูทั้งหมด <ArrowUpRight size={14} />
                </Link>
            </div>
            <div className="space-y-3">
                {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700">
                                <Image src={order.user.image || `https://ui-avatars.com/api/?name=${order.user.name}`} alt="User" fill className="object-cover" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">{order.user.name}</p>
                                <p className="text-xs text-slate-500">{order.product.title}</p> 
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-mono font-bold text-emerald-400 text-sm">+฿{Number(order.total).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-600 font-mono">{new Date(order.createdAt).toLocaleDateString('th-TH')}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* RECENT DOWNLOADS TABLE */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Download size={18} className="text-purple-500" /> การดาวน์โหลดล่าสุด
                </h3>
            </div>
            <div className="space-y-3">
                {recentDownloads.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-purple-400 font-bold border border-slate-700">
                                <Download size={16} />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm truncate max-w-[150px]">{log.product.title}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <User size={10} /> {log.user?.name || "Guest"}
                                </p> 
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded">FREE</span>
                            {/* ✅ แก้จุดที่ 4: log.downloadedAt */}
                            <p className="text-[10px] text-slate-600 font-mono mt-1">{new Date(log.downloadedAt).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" /> Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionButton href="/admin/store/create" icon={<ShoppingBag size={18} />} label="ลงสินค้าใหม่" color="text-emerald-400" bgColor="bg-emerald-500/10" borderColor="border-emerald-500/20" />
                <ActionButton href="/admin/articles/create" icon={<FileText size={18} />} label="เขียนบทความ" color="text-purple-400" bgColor="bg-purple-500/10" borderColor="border-purple-500/20" />
                <ActionButton href="/admin/orders" icon={<DollarSign size={18} />} label="ตรวจสอบยอดเงิน" color="text-blue-400" bgColor="bg-blue-500/10" borderColor="border-blue-500/20" />
            </div>
      </div>

    </div>
  );
}

// --- Components ย่อย ---

function StatCard({ title, value, icon, trend, color }: any) {
    const colorClasses: any = {
        emerald: "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40",
        blue: "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40",
        orange: "bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40",
        purple: "bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40",
    };

    return (
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${colorClasses[color] || colorClasses.blue}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-slate-900 border border-slate-800`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-bold bg-slate-900 text-emerald-400 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                        <TrendingUp size={10} /> {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
            </div>
        </div>
    )
}

function ActionButton({ href, icon, label, color, bgColor, borderColor }: any) {
    return (
        <Link href={href} className={`group block w-full py-4 px-4 bg-slate-950 hover:bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 text-sm text-slate-300 transition-all flex items-center justify-between`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bgColor} ${color} border ${borderColor} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <span className="font-bold group-hover:text-white transition-colors">{label}</span>
            </div>
            <Plus size={16} className="text-slate-600 group-hover:text-white transition-colors" />
        </Link>
    )
}