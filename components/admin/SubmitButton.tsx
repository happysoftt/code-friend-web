"use client";

import { useFormStatus } from "react-dom";
import { Save, Loader2 } from "lucide-react";

export default function SubmitButton({ label = "บันทึก" }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending} 
      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
    >
      {pending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
      {pending ? "กำลังบันทึก..." : label}
    </button>
  );
}