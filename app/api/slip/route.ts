import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ ลบ import UTApi ออกไปเลยครับ จะได้ไม่มีปัญหาเรื่อง Token อีก
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const price = formData.get("price");
    
    // ✅ เปลี่ยนจากรับ File เป็นรับ URL (String) ที่อัปโหลดเสร็จแล้วจากหน้าบ้าน
    const slipUrl = formData.get("slipUrl") as string; 

    if (!slipUrl || !productId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน (ขาดสลิปหรือสินค้า)" }, { status: 400 });
    }

    // ✅ บันทึกลง Database ทันที (ไม่ต้องผ่าน utapi.uploadFiles แล้ว)
    const newOrder = await prisma.order.create({
      data: {
        userId: (session.user as any).id,
        productId: productId,
        total: Number(price) || 0,
        status: "WAITING_VERIFY",
        slipUrl: slipUrl, // ใช้ URL จากหน้าบ้าน
        paymentRef: `SLIP-${Date.now()}`
      },
    });

    return NextResponse.json({ success: true, orderId: newOrder.id });

  } catch (error: any) {
    console.error("🔥 Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}