import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditArticleForm from "@/components/admin/EditArticleForm"; // ✅ เรียกใช้ Form ที่เราเพิ่งสร้าง

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. ดึงข้อมูลจาก Server (ใช้ Prisma ได้ปกติ เพราะไฟล์นี้เป็น Server Component)
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) return notFound();

  // 2. ส่งข้อมูลไปให้ Client Component จัดการต่อ (UploadThing, State, etc.)
  return <EditArticleForm article={article} />;
}