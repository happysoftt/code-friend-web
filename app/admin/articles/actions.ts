// app/(admin)/admin/articles/actions.ts
"use server"; // 👈 สำคัญมาก! ต้องอยู่บรรทัดบนสุด

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteArticle(formData: FormData) {
  const id = formData.get("id") as string;
  
  if (id) {
    try {
      await prisma.article.delete({ where: { id } });
      // สั่งให้หน้ารายการรีเฟรชข้อมูลใหม่ทันที
      revalidatePath("/admin/articles");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }
}