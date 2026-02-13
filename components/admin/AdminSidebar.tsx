"use client";

import { useState } from "react"; // ✅ เพิ่ม useState
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileText, ShoppingBag, 
  DownloadCloud, GraduationCap, Code2, 
  Rocket, ShieldAlert, LogOut, Menu, X // ✅ เพิ่ม icon Menu, X
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "ภาพรวม (Overview)", href: "/admin" },
  { icon: FileText, label: "จัดการบทความ", href: "/admin/articles/create" },
  { icon: GraduationCap, label: "จัดการคอร์สเรียน", href: "/admin/learn" },
  { icon: Code2, label: "จัดการ Snippets", href: "/snippets/new" },
  { icon: DownloadCloud, label: "จัดการไฟล์ดาวน์โหลด", href: "/admin/downloads/create" },
  { icon: ShoppingBag, label: "จัดการร้านค้า", href: "/admin/store" },
  { icon: Rocket, label: "อนุมัติ Showcase", href: "/admin/showcase" },
  { icon: ShieldAlert, label: "ประวัติระบบ (Logs)", href: "/admin/audit-logs" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // ✅ State สำหรับเปิดปิดเมนูในมือถือ

  return (
    <>
      {/* 🔴 ส่วนที่ 1: ปุ่ม Hamburger (แสดงเฉพาะมือถือ md:hidden) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[999] p-2.5 bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700 hover:bg-slate-700 transition-all active:scale-95"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 🔴 ส่วนที่ 2: ฉากหลังมืด (Overlay) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[990] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🔴 ส่วนที่ 3: ตัว Sidebar */}
      {/* ปรับ CSS ให้รองรับ Fixed Slide ในมือถือ และ Sticky ในจอใหญ่ */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-[995] 
        transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:sticky md:top-0 md:h-screen md:shadow-none
      `}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
             <ShieldAlert className="text-blue-500" size={24}/> Admin Panel
          </h2>
          <p className="text-xs text-slate-500 pl-8">จัดการระบบ Code Friend</p>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsOpen(false)} // ปิดเมนูเมื่อคลิก (ในมือถือ)
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-white transition-colors"} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer (Status) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
              <p className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">สถานะระบบ</p>
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  ONLINE
              </div>
          </div>
          
          {/* ปุ่ม Logout (แถมให้ เพราะเห็น import LogOut มาแต่ไม่ได้ใช้) */}
          <button 
             onClick={() => window.location.href = '/api/auth/signout'}
             className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
             <LogOut size={14} /> ออกจากระบบ
          </button>
        </div>

      </aside>
    </>
  );
}