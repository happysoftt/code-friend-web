// app/(admin)/admin/articles/DeleteButton.tsx
"use client"; // 👈 สำคัญ! เพื่อให้ใช้ onClick ได้

import { Trash2 } from "lucide-react";
import { deleteArticle } from "./actions";

export default function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteArticle}
      onSubmit={(e) => {
        // แจ้งเตือนก่อนลบ
        if (!confirm("คุณแน่ใจหรือไม่ที่จะลบบทความนี้?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded-lg text-slate-400 transition-all border border-slate-700 hover:border-red-500"
        title="ลบ"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}