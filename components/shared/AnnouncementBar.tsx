import { getSystemConfig } from "@/lib/actions";
import { Megaphone } from "lucide-react";

export default async function AnnouncementBar() {
  // ดึงค่าตั้งค่าจาก DB
  const config = await getSystemConfig();

  // ถ้าปิดใช้งาน หรือไม่มีข้อความ -> ไม่ต้องแสดงอะไร
  if (!config.announceEnabled || !config.announceText) return null;

  return (
    <div className="bg-orange-600 text-white text-xs md:text-sm font-bold py-2 px-4 text-center relative z-50">
      <div className="container mx-auto flex items-center justify-center gap-2 animate-pulse">
        <Megaphone size={16} />
        <span>{config.announceText}</span>
      </div>
    </div>
  );
}