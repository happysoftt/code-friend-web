import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  console.log("📥 เริ่มต้นการบันทึกออเดอร์..."); // Log 1

  try {
    // 1. เช็ค Login
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("❌ ไม่ได้ล็อกอิน");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. รับข้อมูลจากหน้าบ้าน
    const formData = await request.formData();
    const file = formData.get("slip") as File;
    const productId = formData.get("productId") as string;
    const price = formData.get("price");

    console.log("📦 รับข้อมูล:", { productId, price, fileName: file?.name }); // Log 2

    if (!file || !productId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // 3. เตรียมโฟลเดอร์เก็บรูป
    const relativeUploadDir = "/uploads/slips";
    const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // โฟลเดอร์มีอยู่แล้ว ไม่เป็นไร
    }

    // 4. บันทึกรูปภาพ
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `slip-${Date.now()}-${Math.round(Math.random() * 1000)}${path.extname(file.name)}`;
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    console.log("✅ บันทึกรูปเสร็จแล้วที่:", filepath); // Log 3

    // 5. บันทึกลง Database
    const newOrder = await prisma.order.create({
      data: {
        userId: session.user.id,
        productId: productId,
        total: Number(price),
        status: "WAITING_VERIFY", // สถานะรอตรวจสอบ
        slipUrl: `${relativeUploadDir}/${filename}`, // เก็บ Path รูป
      },
    });

    console.log("🎉 บันทึก Database สำเร็จ! Order ID:", newOrder.id); // Log 4

    return NextResponse.json({ success: true, orderId: newOrder.id });

  } catch (error) {
    console.error("🔥 Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}