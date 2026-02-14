import { getSystemConfig } from "@/lib/actions";
import SettingsForm from "@/components/admin/SettingsForm";
import { Settings } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // ดึงค่า Config ล่าสุดจาก DB
  const initialData = await getSystemConfig();

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen pb-24">
       {/* Header */}
       <div className="mb-10 border-b border-slate-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/20">
                    <Settings size={28} />
                </span>
                System Settings
            </h1>
            <p className="text-slate-400">ควบคุมทุกอย่างในเว็บไซต์ของคุณได้จากที่นี่</p>
        </div>
       </div>

       {/* เรียกใช้ Form Component และส่งข้อมูลไป */}
       <SettingsForm initialData={initialData} />
    </div>
  );
}