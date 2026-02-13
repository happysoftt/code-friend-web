import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { CheckCircle, XCircle, Clock, FileText, Image as ImageIcon, Search, ShoppingCart, Calendar } from "lucide-react";
import Link from "next/link";
import OrderActions from "@/components/admin/OrderActions"; 

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string, q?: string }> }) {
  const { status, q } = await searchParams || {};

  // สร้างเงื่อนไขค้นหา (Filter + Search)
  const whereCondition: any = {};

  if (status && status !== "ALL") {
    whereCondition.status = status;
  }

  if (q) {
    whereCondition.OR = [
        { id: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { product: { title: { contains: q, mode: 'insensitive' } } }
    ];
  }

  const orders = await prisma.order.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      product: true,
    },
  });

  // Helper ฟังก์ชันสำหรับเลือกสีสถานะ
  const getStatusBadge = (status: string) => {
      switch (status) {
          case 'COMPLETED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle size={12} /> สำเร็จ</span>;
          case 'WAITING_VERIFY': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse"><Clock size={12} /> รอตรวจสอบ</span>;
          case 'FAILED': 
          case 'CANCELLED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20"><XCircle size={12} /> ยกเลิก</span>;
          default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-500 border border-slate-700">รอชำระเงิน</span>;
      }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <ShoppingCart className="text-blue-500" /> จัดการคำสั่งซื้อ
            </h1>
            <p className="text-slate-400">ตรวจสอบและอนุมัติรายการสั่งซื้อ ({orders.length} รายการ)</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Toolbar (Tabs + Search) */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col xl:flex-row gap-4 justify-between items-center">
            
            {/* Filter Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
                {[
                    { label: "ทั้งหมด", value: "ALL", icon: null },
                    { label: "รอตรวจสอบ", value: "WAITING_VERIFY", icon: "⏳" },
                    { label: "สำเร็จแล้ว", value: "COMPLETED", icon: "✅" },
                    { label: "ยกเลิก", value: "FAILED", icon: "❌" } // หรือ CANCELLED แล้วแต่ DB คุณ
                ].map((tab) => (
                    <Link 
                        key={tab.value} 
                        href={`/admin/orders?status=${tab.value}${q ? `&q=${q}` : ''}`} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                            (!status && tab.value === 'ALL') || status === tab.value 
                            ? 'bg-slate-800 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </Link>
                ))}
            </div>

            {/* Search Bar */}
            <form className="relative w-full max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหา ID, ลูกค้า, หรือสินค้า..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-slate-600 text-sm" 
                />
                {status && <input type="hidden" name="status" value={status} />}
            </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-800">
                <th className="px-6 py-4 w-[15%]">Order ID</th>
                <th className="px-6 py-4 w-[20%]">ลูกค้า</th>
                <th className="px-6 py-4 w-[25%]">สินค้า</th>
                <th className="px-6 py-4 w-[10%] text-right">ยอดเงิน</th>
                <th className="px-6 py-4 w-[10%] text-center">หลักฐาน</th>
                <th className="px-6 py-4 w-[10%] text-center">สถานะ</th>
                <th className="px-6 py-4 w-[10%] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* ID & Date */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-white font-bold truncate" title={order.id}>#{order.id.slice(0, 8)}...</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Calendar size={10} />
                            {new Date(order.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                  </td>

                  {/* User */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700">
                             <Image 
                                src={order.user.image || `https://ui-avatars.com/api/?name=${order.user.name}`} 
                                alt="User" fill className="object-cover" 
                             />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-white text-xs truncate">{order.user.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{order.user.email}</p>
                        </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden relative border border-slate-700 flex-shrink-0">
                             {order.product.image ? (
                                <Image src={order.product.image} alt="Product" fill className="object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">No Img</div>
                             )}
                        </div>
                        <span className="text-sm font-medium text-slate-300 truncate max-w-[200px]" title={order.product.title}>{order.product.title}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 align-middle text-right">
                    <span className="font-mono font-bold text-white">฿{Number(order.total).toLocaleString()}</span>
                  </td>

                  {/* Slip */}
                  <td className="px-6 py-4 align-middle text-center">
                    {order.slipUrl ? (
                      <a 
                        href={order.slipUrl} 
                        target="_blank" 
                        className="inline-flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 border border-slate-700 hover:border-blue-500 px-2 py-1 rounded-md transition-all group"
                      >
                        <ImageIcon size={12} /> 
                        <span>View</span>
                      </a>
                    ) : (
                      <span className="text-slate-700 text-xs">-</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 align-middle text-center">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* Action (✅ แก้ไขแล้ว: ใช้ OrderActions ตัวเดียวจบ) */}
                  <td className="px-6 py-4 align-middle text-right">
                       <OrderActions orderId={order.id} status={order.status} />
                  </td>
                  
                </tr>
              ))}

              {orders.length === 0 && (
                 <tr>
                    <td colSpan={7} className="text-center py-20">
                        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 mb-4">
                            <FileText className="text-slate-600" size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">ไม่พบรายการสั่งซื้อ</p>
                        <p className="text-slate-600 text-xs mt-1">ลองเปลี่ยนตัวกรอง หรือค้นหาใหม่</p>
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