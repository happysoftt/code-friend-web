import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar"; // Import Client Component ที่เพิ่งสร้าง

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  console.log("DEBUG - USER ROLE IN SESSION:", session?.user?.role);
  console.log("Current User Session:", session?.user);
  // เช็คสิทธิ์: ต้องเป็น ADMIN เท่านั้น
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* Sidebar (Client Component) */}
      <AdminSidebar user={session.user} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen relative">
         {/* Background Glow */}
         <div className="fixed inset-0 pointer-events-none z-0">
             <div className="absolute top-0 right-0 p-96 bg-blue-600/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
         </div>

         {/* Content */}
         <div className="relative z-10">
            {children}
         </div>
      </main>
    </div>
  );
}