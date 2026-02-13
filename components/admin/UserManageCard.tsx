"use client";

import { updateUserRole, adminResetPassword, deleteUser, toggleUserStatus } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Key, Trash2, Save, Loader2, AlertTriangle, CheckCircle, Ban, UserCheck } from "lucide-react";

// ✅ Import ของใหม่เข้ามา
import toast from "react-hot-toast";
import { confirmSwal, alertSwal } from "@/lib/swal"; 

export default function UserManageCard({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [role, setRole] = useState(user.role || "USER");

  // 1. เปลี่ยน Role (ใช้ Toast แจ้งเตือนเล็กๆ มุมจอ)
  async function handleRoleChange() {
    setLoading(true);
    try {
        await updateUserRole(user.id, role);
        toast.success("บันทึกสิทธิ์เรียบร้อย!"); 
        router.refresh();
    } catch (error) {
        toast.error("เกิดข้อผิดพลาด");
    } finally {
        setLoading(false);
    }
  }

  // 2. เปลี่ยนรหัสผ่าน (ใช้ SweetAlert แบบยืนยัน)
  async function handleResetPassword(formData: FormData) {
    const newPassword = formData.get("newPassword") as string;
    
    if (!newPassword || newPassword.length < 6) {
        toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        return;
    }

    const result = await confirmSwal.fire({
        title: 'ยืนยันการเปลี่ยนรหัสผ่าน?',
        text: `รหัสผ่านใหม่จะเป็น: "${newPassword}"`,
        icon: 'warning',
        confirmButtonText: 'ใช่, เปลี่ยนเลย'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    formData.append("userId", user.id); 

    const res = await adminResetPassword(formData);
    setLoading(false);

    if (res?.success) {
        alertSwal.fire('สำเร็จ!', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'success');
        const form = document.getElementById("resetPassForm") as HTMLFormElement;
        if(form) form.reset();
    } else {
        toast.error(res?.error || "เกิดข้อผิดพลาด");
    }
  }

  // 3. แบน/ปลดแบน (ใช้ SweetAlert แบบยืนยัน)
  async function handleToggleStatus() {
    const action = user.isActive ? "ระงับการใช้งาน (Ban)" : "ปลดแบน (Activate)";
    
    const result = await confirmSwal.fire({
        title: `ยืนยันการ${action}?`,
        text: user.isActive ? "ผู้ใช้นี้จะไม่สามารถเข้าสู่ระบบได้อีก" : "ผู้ใช้นี้จะกลับมาใช้งานได้ตามปกติ",
        icon: user.isActive ? 'error' : 'question',
        confirmButtonText: user.isActive ? 'ใช่, แบนเลย!' : 'ใช่, ปลดแบน!',
        confirmButtonClass: user.isActive ? 'bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 shadow-lg shadow-red-900/20' : undefined
    } as any);

    if(!result.isConfirmed) return;
    
    setLoading(true);
    const res = await toggleUserStatus(user.id);
    setLoading(false);

    if (res?.success) {
        toast.success(`${action} เรียบร้อย`);
        router.refresh();
    } else {
        toast.error("เกิดข้อผิดพลาด");
    }
  }

  // 4. ลบ User (ใช้ SweetAlert สีแดงเตือนภัย)
  async function handleDelete() {
    const result = await confirmSwal.fire({
        title: 'ยืนยันการลบถาวร?',
        text: "ข้อมูลประวัติการสั่งซื้อและบทความทั้งหมดจะหายไป กู้คืนไม่ได้!",
        icon: 'warning',
        confirmButtonText: 'ยืนยันลบ',
        confirmButtonClass: 'bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 shadow-lg shadow-red-900/20'
    } as any);

    if (!result.isConfirmed) return;
    
    setLoading(true);
    const res = await deleteUser(user.id);
    
    if (res?.success) {
        await alertSwal.fire('ลบสำเร็จ', 'ผู้ใช้งานถูกลบออกจากระบบแล้ว', 'success');
        router.push("/admin/users");
        router.refresh();
    } else {
        toast.error(res?.error || "ลบไม่สำเร็จ");
        setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Card 1: Role */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
         <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Shield className="text-purple-500" size={20} /> จัดการสิทธิ์ (Role)
         </h3>
         <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="w-full">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">ระดับผู้ใช้งาน</label>
                <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 w-full outline-none focus:border-purple-500 transition-all cursor-pointer"
                >
                    <option value="USER">Member (สมาชิกทั่วไป)</option>
                    <option value="ADMIN">Administrator (ผู้ดูแลระบบ)</option>
                </select>
            </div>
            <button 
                onClick={handleRoleChange}
                disabled={loading || role === user.role}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 whitespace-nowrap"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} บันทึก
            </button>
         </div>
      </div>

      {/* Card 2: Password & Status */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
         <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Key className="text-yellow-500" size={20} /> ความปลอดภัย & สถานะ
         </h3>
         
         <form id="resetPassForm" action={handleResetPassword} className="flex flex-col sm:flex-row gap-4 items-end mb-6">
            <input type="hidden" name="userId" value={user.id} />
            <div className="w-full">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">เปลี่ยนรหัสผ่านใหม่</label>
                <div className="relative">
                    <input 
                        name="newPassword" 
                        type="text" 
                        placeholder="ตั้งรหัสผ่านใหม่..." 
                        className="bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-4 pr-10 w-full outline-none focus:border-yellow-500 transition-all placeholder-slate-600"
                    />
                    <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                </div>
            </div>
            <button 
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg shadow-yellow-900/20 flex items-center justify-center gap-2 whitespace-nowrap"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} เปลี่ยนรหัส
            </button>
         </form>

         <div className="border-t border-slate-800 my-4"></div>

         <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">สถานะบัญชี</label>
            {user.isActive ? (
                <button 
                    onClick={handleToggleStatus}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-slate-950 border border-red-900/50 text-red-500 hover:bg-red-900/20"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Ban size={18} /> ระงับการใช้งาน (Ban)</>}
                </button>
            ) : (
                <button 
                    onClick={handleToggleStatus}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-green-600 hover:bg-green-500 text-white shadow-lg"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><UserCheck size={18} /> ปลดล็อคบัญชี (Activate)</>}
                </button>
            )}
            <p className="text-[10px] text-slate-600 mt-2 text-center">
                สถานะปัจจุบัน: <span className={user.isActive ? "text-green-500" : "text-red-500"}>{user.isActive ? "ปกติ (Active)" : "ถูกระงับ (Banned)"}</span>
            </p>
         </div>
      </div>

      {/* Card 3: Delete */}
      <div className="bg-red-950/10 border border-red-500/20 p-6 rounded-2xl shadow-sm">
         <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2 border-b border-red-500/20 pb-2">
            <AlertTriangle size={20} /> โซนอันตราย (Danger Zone)
         </h3>
         
         <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="text-sm text-slate-400 text-center sm:text-left">
                 <p className="font-bold text-slate-300">ลบบัญชีผู้ใช้ถาวร</p>
                 <p className="text-xs mt-1 opacity-80">การกระทำนี้ไม่สามารถกู้คืนได้ ข้อมูลทั้งหมดจะหายไป</p>
             </div>
             <button 
                onClick={handleDelete}
                disabled={loading}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 active:scale-95 transition-all"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />} ลบผู้ใช้งาน
            </button>
         </div>
      </div>

    </div>
  );
}