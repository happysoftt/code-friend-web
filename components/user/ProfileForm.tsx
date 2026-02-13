"use client";

import { updateProfile } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Loader2, Camera, Github, Facebook, Globe } from "lucide-react";

export default function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(user.image || `https://ui-avatars.com/api/?name=${user.name}`);
  const router = useRouter();

  // ฟังก์ชันแสดงตัวอย่างรูปเมื่อเลือกไฟล์
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        setPreview(url);
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);

    if (result.success) {
        alert("บันทึกข้อมูลเรียบร้อย!");
        router.refresh(); // รีเฟรชเพื่อให้ข้อมูลใหม่แสดงผลทันที
    } else {
        alert("เกิดข้อผิดพลาด: " + result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
        
        {/* ส่วนอัปโหลดรูปภาพ */}
        <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 relative bg-slate-950">
                    <Image src={preview} alt="Profile" fill className="object-cover" />
                </div>
                {/* Overlay เมื่อเอาเมาส์ไปชี้ */}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                </div>
                <input 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                />
            </div>
            <p className="text-xs text-slate-500 mt-3">คลิกที่รูปเพื่อเปลี่ยน (แนะนำไฟล์ JPG, PNG)</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            {/* ชื่อ */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-300 mb-2">ชื่อที่ใช้แสดง (Display Name)</label>
                <input 
                    name="name" 
                    defaultValue={user.name} 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                />
            </div>

            {/* อีเมล (แก้ไขไม่ได้) */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-300 mb-2">อีเมล (Email)</label>
                <input 
                    value={user.email} 
                    disabled
                    className="w-full bg-slate-800 border border-slate-800 rounded-xl p-3 text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">*อีเมลไม่สามารถเปลี่ยนแปลงได้</p>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-300 mb-2">เกี่ยวกับฉัน (Bio)</label>
                <textarea 
                    name="bio" 
                    rows={3}
                    defaultValue={user.profile?.bio}
                    placeholder="แนะนำตัวสั้นๆ..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                ></textarea>
            </div>

            {/* Social Links */}
            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                    <Github size={16} /> GitHub URL
                </label>
                <input 
                    name="github" 
                    defaultValue={user.profile?.github}
                    placeholder="https://github.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                    <Facebook size={16} /> Facebook URL
                </label>
                <input 
                    name="facebook" 
                    defaultValue={user.profile?.facebook}
                    placeholder="https://facebook.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                    <Globe size={16} /> Website / Portfolio
                </label>
                <input 
                    name="website" 
                    defaultValue={user.profile?.website}
                    placeholder="https://mywebsite.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
            </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> บันทึกการเปลี่ยนแปลง</>}
            </button>
        </div>
    </form>
  );
}