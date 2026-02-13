import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/user/ProfileForm"; 
import { Settings as SettingsIcon, ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // ดึงข้อมูล User และ Profile ล่าสุด
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  });

  if (!user) return redirect("/");

  return (
    <div className="min-h-screen bg-[#020617] text-white py-12 selection:bg-blue-500/30 relative overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
         
         {/* Back Button */}
         <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-8 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับไป Dashboard
         </Link>

         {/* Header */}
         <div className="flex items-center gap-5 mb-8">
             <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl shadow-blue-900/10">
                 <UserCog className="text-blue-400" size={32} />
             </div>
             <div>
                 <h1 className="text-3xl font-bold text-white tracking-tight">ตั้งค่าโปรไฟล์</h1>
                 <p className="text-slate-400 mt-1">จัดการข้อมูลส่วนตัวและช่องทางการติดต่อของคุณ</p>
             </div>
         </div>

         {/* Main Form Card */}
         <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
             
             {/* Top Decoration Line */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50" />

             {/* ส่งข้อมูล user ไปให้ Form จัดการต่อ */}
             <ProfileForm user={user} />
         </div>
      </div>
    </div>
  );
}