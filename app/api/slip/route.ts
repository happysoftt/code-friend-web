import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UTApi } from "uploadthing/server"; // ✅ ใช้ตัวนี้จัดการอัปโหลดบน Server

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("slip") as File | null;
    const productId = formData.get("productId") as string;
    const price = formData.get("price");

    if (!file || !productId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // 🔥 ส่งไฟล์ขึ้น Cloud แทนการเขียนลงเครื่อง (แก้ปัญหา Read-only error)
    const utapi = new UTApi();
    const uploadResponse = await utapi.uploadFiles(file);

    if (uploadResponse.error) {
      throw new Error("อัปโหลดไฟล์ล้มเหลว: " + uploadResponse.error.message);
    }

    const slipUrl = uploadResponse.data.url;

    // บันทึกข้อมูลลง Database ตามปกติ
    const newOrder = await prisma.order.create({
      data: {
        userId: (session.user as any).id,
        productId: productId,
        total: Number(price) || 0,
        status: "WAITING_VERIFY",
        slipUrl: slipUrl, // URL ของรูปจะมาจาก uploadthing.com
        paymentRef: `SLIP-${Date.now()}`
      },
    });

    return NextResponse.json({ success: true, orderId: newOrder.id });

  } catch (error: any) {
    console.error("🔥 Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}