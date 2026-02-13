"use client";

import { useState } from "react";
import { 
  Settings, Save, Globe, Megaphone, Loader2, Mail, Phone, Facebook, 
  Type, FileText, CreditCard, Palette, Monitor, Image as ImageIcon
} from "lucide-react";
import { updateSystemConfig } from "@/lib/actions"; // Server Action ที่เราสร้าง
import toast, { Toaster } from "react-hot-toast"; // แจ้งเตือนสวยๆ

export default function SettingsForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  
  // State สำหรับ Form (ใช้ค่าเริ่มต้นจาก Database)
  const [formData, setFormData] = useState(initialData);

  // ฟังก์ชันอัปเดต State เวลาพิมพ์
  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  // ฟังก์ชันบันทึกข้อมูลจริง
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // เรียก Server Action
    const result = await updateSystemConfig(formData);

    setLoading(false);

    if (result.success) {
      // ✅ แจ้งเตือนสำเร็จแบบสวยๆ
      toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว!", {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
        iconTheme: { primary: '#10b981', secondary: '#fff' },
      });
    } else {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
       {/* ใส่ Toaster ไว้ตรงนี้เพื่อให้แจ้งเตือนทำงาน */}
       <Toaster position="bottom-right" />

       {/* --- LEFT COLUMN --- */}
       <div className="lg:col-span-8 space-y-8">
            
            {/* 1. General Info */}
            <Section title="ข้อมูลเว็บไซต์" icon={<Globe className="text-blue-400" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup 
                        label="ชื่อเว็บไซต์" icon={<Type />} 
                        value={formData.siteName} 
                        onChange={(v: string) => handleChange('siteName', v)}
                    />
                    <InputGroup 
                        label="คำโปรย (Description)" icon={<FileText />} 
                        value={formData.description} 
                        onChange={(v: string) => handleChange('description', v)}
                    />
                </div>
            </Section>

            {/* 2. System Control */}
            <Section title="ควบคุมระบบ" icon={<Monitor className="text-purple-400" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ToggleCard 
                        title="Maintenance Mode" 
                        desc="ปิดเว็บไซต์ชั่วคราว (เฉพาะ Admin เข้าได้)"
                        enabled={formData.maintenanceMode}
                        onToggle={() => handleChange('maintenanceMode', !formData.maintenanceMode)}
                        danger
                    />
                    <ToggleCard 
                        title="เปิดรับสมัครสมาชิก" 
                        desc="อนุญาตให้คนทั่วไปสมัครสมาชิกได้"
                        enabled={formData.registrationEnabled}
                        onToggle={() => handleChange('registrationEnabled', !formData.registrationEnabled)}
                    />
                </div>
            </Section>

            {/* 3. Payment */}
            <Section title="การชำระเงิน (PromptPay)" icon={<CreditCard className="text-emerald-400" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup 
                        label="เบอร์โทร / เลขบัตร (PromptPay ID)" icon={<Phone />} 
                        value={formData.promptpayId} 
                        onChange={(v: string) => handleChange('promptpayId', v)}
                    />
                    <InputGroup 
                        label="ชื่อบัญชี" icon={<Type />} 
                        value={formData.promptpayName} 
                        onChange={(v: string) => handleChange('promptpayName', v)}
                    />
                </div>
            </Section>
       </div>

       {/* --- RIGHT COLUMN --- */}
       <div className="lg:col-span-4 space-y-8">
            
             {/* Save Button */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:sticky lg:top-8 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">บันทึกการแก้ไข</h3>
                    {loading && <Loader2 className="animate-spin text-slate-400" size={18} />}
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={20} /> {loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                </button>
             </div>

             {/* Announcement Bar */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Megaphone size={18} className="text-orange-500" /> ประกาศ
                    </h3>
                    <Switch 
                        enabled={formData.announceEnabled} 
                        onToggle={() => handleChange('announceEnabled', !formData.announceEnabled)} 
                    />
                </div>
                
                <div className={`transition-all duration-300 ${!formData.announceEnabled && 'opacity-50 pointer-events-none'}`}>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none resize-none"
                        rows={3}
                        value={formData.announceText || ""}
                        onChange={(e) => handleChange('announceText', e.target.value)}
                        placeholder="ใส่ข้อความประกาศที่นี่..."
                    />
                </div>
             </div>
       </div>
    </form>
  );
}

// --- Sub Components ---
// (เหมือนเดิม แต่เพิ่ม onChange ให้ InputGroup)

function Section({ title, icon, children }: any) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
                {title}
            </h3>
            {children}
        </div>
    )
}

function InputGroup({ label, icon, value, onChange }: any) {
    return (
        <div className="w-full">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
                {icon && <span className="text-slate-400">{icon}</span>} {label}
            </label>
            <div className="relative group">
                <input 
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                />
            </div>
        </div>
    )
}

function ToggleCard({ title, desc, enabled, onToggle, danger }: any) {
    return (
        <div 
            onClick={onToggle}
            className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between group ${
                enabled 
                ? (danger ? 'bg-red-500/10 border-red-500/50' : 'bg-emerald-500/10 border-emerald-500/50')
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
        >
            <div>
                <h4 className={`font-bold ${enabled ? (danger ? 'text-red-400' : 'text-emerald-400') : 'text-slate-300 group-hover:text-white'}`}>
                    {title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
            <Switch enabled={enabled} danger={danger} />
        </div>
    )
}

function Switch({ enabled, onToggle, danger }: any) {
    return (
        <div 
            onClick={onToggle}
            className={`w-12 h-7 rounded-full p-1 transition-colors relative flex-shrink-0 cursor-pointer ${
                enabled ? (danger ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-700'
            }`}
        >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
    )
}