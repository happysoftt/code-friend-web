"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, ChevronDown, LayoutDashboard, LogOut, 
  ShoppingBag, BookOpen, Code2, GraduationCap, Sparkles
} from "lucide-react";
import { getMyNotifications } from "@/lib/actions"; // Server Action
import NotificationBell from "@/components/shared/NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const profileRef = useRef<HTMLDivElement>(null);

  // 1. ตรวจจับ Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. ดึงข้อมูลแจ้งเตือน (เรียก Server Action)
  useEffect(() => {
    // สร้างฟังก์ชัน async ด้านใน useEffect
    const fetchNoti = async () => {
      if (session?.user) {
        try {
            // เรียก Server Action ได้ แต่ต้องระวังเรื่อง Security Context
            const data = await getMyNotifications();
            if (Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
      }
    };

    fetchNoti();
    
    // (Optional) ตั้ง Interval ให้ดึงใหม่ทุก 1 นาที (Realtime-ish)
    const interval = setInterval(fetchNoti, 60000); 
    return () => clearInterval(interval);

  }, [session]); // dependency คือ session
  
  // 4. ปิดเมนูเมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "หน้าแรก", path: "/", icon: <Sparkles size={18} /> },
    { name: "คอร์สเรียน", path: "/learn", icon: <GraduationCap size={18} /> },
    { name: "บทความ", path: "/articles", icon: <BookOpen size={18} /> },
    { name: "ร้านค้า", path: "/store", icon: <ShoppingBag size={18} /> },
    { name: "คอมมูนิตี้", path: "/showcase", icon: <LayoutDashboard size={18} /> },
    { name: "แจกโค้ด", path: "/snippets", icon: <Code2 size={18} /> },
    { name: "Top Developers", path: "/leaderboard", icon: <Code2 size={18} /> },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? "bg-[#020617]/90 backdrop-blur-xl border-slate-800/50 shadow-lg" 
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* --- LOGO --- */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
                <Code2 className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight leading-none group-hover:text-indigo-400 transition-colors">
                  Code Friend
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Community
                </span>
              </div>
            </Link>

            {/* --- DESKTOP MENU --- */}
            <div className="hidden xl:flex items-center gap-1 bg-slate-900/50 backdrop-blur-sm rounded-full p-1 border border-slate-800/50">
              {navLinks.map((link) => {
                const isActive = pathname === link.path || (pathname.startsWith(link.path) && link.path !== "/");
                return (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive 
                      ? "text-white bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* --- RIGHT SIDE --- */}
            <div className="hidden md:flex items-center gap-4">
              {session ? (
                <div className="flex items-center gap-3">
                  
                  {/* ✅ ส่งแจ้งเตือนที่ fetch มาเข้า Component */}
                  <NotificationBell initialData={notifications} />

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full border border-slate-700/50 bg-slate-800/50 hover:bg-slate-800 transition-all group hover:border-slate-600"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                          <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative">
                            {session.user?.image ? (
                                <Image 
                                    src={session.user.image} 
                                    alt="User" fill className="object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs text-white">
                                    {session.user?.name?.[0] || "U"}
                                </div>
                            )}
                          </div>
                      </div>
                      <div className="text-left hidden lg:block">
                          <p className="text-sm font-medium text-white leading-none max-w-[100px] truncate">
                              {session.user?.name?.split(" ")[0]}
                          </p>
                      </div>
                      <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-64 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/5"
                        >
                          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                              <p className="text-sm font-bold text-white truncate">{session.user?.name}</p>
                              <p className="text-xs text-slate-400 truncate">{session.user?.email}</p>
                          </div>
                          <div className="p-2 space-y-1">
                              {/* เช็ค Role Admin */}
                              {(session.user as any).role === "ADMIN" && (
                                  <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-yellow-500 hover:bg-yellow-500/10 transition-colors">
                                      <LayoutDashboard size={18} /> Admin Panel
                                  </Link>
                              )}
                              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                  <LayoutDashboard size={18} /> Dashboard
                              </Link>
                              <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                  <ShoppingBag size={18} /> ประวัติการสั่งซื้อ
                              </Link>
                          </div>
                          <div className="p-2 border-t border-slate-800">
                              <button 
                                  onClick={() => signOut()}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                  <LogOut size={18} /> ออกจากระบบ
                              </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                    เข้าสู่ระบบ
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>

            {/* --- MOBILE MENU BUTTON --- */}
            <div className="xl:hidden flex items-center gap-3">
              {session && <NotificationBell initialData={notifications} />}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-20 left-0 right-0 z-40 bg-[#020617] border-b border-slate-800 xl:hidden overflow-hidden shadow-2xl"
          >
            <div className="p-4 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto">
               {/* Mobile Links */}
               {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    pathname === link.path ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.icon} {link.name}
                </Link>
              ))}

              <div className="border-t border-slate-800 my-4 pt-4">
                  {session ? (
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                           <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden relative">
                              {session.user?.image ? (
                                <Image src={session.user.image} alt="User" fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white bg-slate-700">U</div>
                              )}
                           </div>
                           <div>
                              <p className="text-white font-bold">{session.user?.name}</p>
                              <p className="text-xs text-slate-500 truncate w-40">{session.user?.email}</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <Link href="/dashboard" className="flex items-center justify-center p-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm">Dashboard</Link>
                           <button onClick={() => signOut()} className="flex items-center justify-center p-3 rounded-xl bg-red-900/20 text-red-400 font-bold text-sm">Logout</button>
                        </div>
                     </div>
                  ) : (
                     <div className="grid grid-cols-2 gap-3">
                        <Link href="/login" className="flex items-center justify-center py-3 rounded-xl border border-slate-700 text-white font-bold text-sm">เข้าสู่ระบบ</Link>
                        <Link href="/register" className="flex items-center justify-center py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm">สมัครสมาชิก</Link>
                     </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}