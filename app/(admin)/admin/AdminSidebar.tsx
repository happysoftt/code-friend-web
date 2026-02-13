"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, ShoppingCart, Package, Users, FileText, 
  BookOpen, Settings, LogOut, Shield, Award, Code2, FolderTree, Globe
} from "lucide-react";

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  const mainMenus = [
    { name: "Overview", icon: LayoutDashboard, href: "/admin" },
    { name: "Orders", icon: ShoppingCart, href: "/admin/orders" },
    { name: "Products", icon: Package, href: "/admin/store" },
    { name: "Categories", icon: FolderTree, href: "/admin/categories" },
  ];

  const contentMenus = [
    { name: "Articles", icon: FileText, href: "/admin/articles" },
    { name: "Courses", icon: BookOpen, href: "/admin/learn" },
    { name: "Showcase", icon: Award, href: "/admin/showcase" },
    { name: "Snippets", icon: Code2, href: "/admin/snippets" },
  ];

  const systemMenus = [
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  const renderLink = (item: any) => {
    const isActive = pathname === item.href;
    return (
      <Link 
        key={item.href} 
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
          isActive 
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40" 
          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
        }`}
      >
        <item.icon size={18} className={isActive ? "text-white" : "group-hover:text-emerald-400 transition-colors"} />
        <span className="text-sm font-medium">{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col z-50 shadow-2xl">
      
      {/* Header */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-900/20">
        <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-900/30">
            <Shield size={20} />
        </div>
        <div>
            <h1 className="font-bold text-white leading-none text-base tracking-tight">Admin Console</h1>
            <p className="text-[10px] text-emerald-500 mt-1.5 uppercase tracking-[0.15em] font-black">Control Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
        
        {/* Main Section */}
        <div>
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Main Store</p>
            <div className="space-y-1">{mainMenus.map(renderLink)}</div>
        </div>

        {/* Content Section */}
        <div>
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Content Hub</p>
            <div className="space-y-1">{contentMenus.map(renderLink)}</div>
        </div>

        {/* System Section */}
        <div>
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Administration</p>
            <div className="space-y-1">{systemMenus.map(renderLink)}</div>
        </div>

      </nav>

      {/* Footer (Admin Profile) */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-slate-950/50 border border-slate-800/50">
             <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700 shadow-inner">
                <Image 
                    src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff`} 
                    alt="Admin" fill className="object-cover" 
                />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name || "Admin"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Now</span>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <Link href="/" className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-300 transition-all border border-slate-700 group">
                <Globe size={12} className="group-hover:rotate-12 transition-transform" /> หน้าเว็บ
            </Link>
            <button 
                onClick={() => window.location.href = '/api/auth/signout'}
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-[10px] font-bold transition-all border border-slate-700 hover:border-red-500/20 group"
            >
                <LogOut size={12} className="group-hover:-translate-x-0.5 transition-transform" /> ออกจากระบบ
            </button>
        </div>
      </div>
    </aside>
  );
}