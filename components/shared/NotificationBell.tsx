"use client";

import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/actions"; // import action ที่สร้าง
import Link from "next/link";

// กำหนด Type ให้ตรงกับ Database
interface Notification {
  id: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationBell({ initialData = [] }: { initialData: Notification[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialData);
  const router = useRouter();

  // นับเฉพาะอันที่ยังไม่อ่าน
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ฟังก์ชันกดอ่านทีละอัน
  const handleRead = async (noti: Notification) => {
    // 1. อัปเดต UI ทันที (Optimistic Update)
    setNotifications((prev) => 
      prev.map((n) => n.id === noti.id ? { ...n, isRead: true } : n)
    );

    // 2. ส่งคำสั่งไปหลังบ้าน
    if (!noti.isRead) {
      await markNotificationAsRead(noti.id);
    }

    // 3. ถ้ามีลิงก์ ให้ไปที่ลิงก์นั้น
    if (noti.link) {
      setIsOpen(false);
      router.push(noti.link);
    }
  };

  // ฟังก์ชันอ่านทั้งหมด
  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true }))); // UI เปลี่ยนทันที
    await markAllNotificationsAsRead(); // สั่งหลังบ้าน
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#020617] animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/5"
          >
            <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">การแจ้งเตือน ({unreadCount})</h3>
                {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAll}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <CheckCheck size={12} /> อ่านทั้งหมด
                    </button>
                )}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        ไม่มีการแจ้งเตือนใหม่
                    </div>
                ) : (
                    notifications.map((noti) => (
                        <div 
                          key={noti.id} 
                          onClick={() => handleRead(noti)}
                          className={`p-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer flex gap-3 ${
                            !noti.isRead ? 'bg-slate-800/20' : ''
                          }`}
                        >
                            {/* จุดแสดงสถานะยังไม่อ่าน */}
                            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!noti.isRead ? 'bg-purple-500' : 'bg-slate-700'}`} />
                            
                            <div>
                                <p className={`text-sm ${!noti.isRead ? 'text-white font-medium' : 'text-slate-400'}`}>
                                  {noti.message}
                                </p>
                                <span className="text-[10px] text-slate-500 mt-1 block">
                                  {new Date(noti.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}