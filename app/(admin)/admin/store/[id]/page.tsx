import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProductForm from "@/components/admin/EditProductForm"; // ✅ เรียกใช้ Form ที่เราเพิ่งสร้าง

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. ดึงข้อมูลสินค้า
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) return notFound();

  // 2. ส่งข้อมูลไปให้ Client Component
  // แปลง Type ให้ตรงกับที่ Form ต้องการ (บางที Decimal ของ Prisma อาจต้องแปลงเป็น Number)
  const productData = {
    ...product,
    price: Number(product.price),
    // แปลงค่าอื่นๆ ถ้าจำเป็น
  };

  return <EditProductForm product={productData} />;
}