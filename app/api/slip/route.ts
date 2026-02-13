import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(request: NextRequest) {
  try {
    console.log("📥 [API] เริ่มต้นการอัปโหลดสลิป...");

    // 1. เช็ค Login
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. รับข้อมูล
    const formData = await request.formData();
    const file = formData.get("slip") as File | null; // รับเป็น null ได้
    const productId = formData.get("productId") as string;
    const price = formData.get("price");

    if (!file || !productId) {
      console.error("❌ ข้อมูลไม่ครบ: ไม่มีไฟล์ หรือ ไม่มี Product ID");
      return NextResponse.json({ error: "กรุณาแนบสลิปและระบุสินค้า" }, { status: 400 });
    }

    console.log(`📦 กำลังบันทึกไฟล์: ${file.name} (${file.size} bytes)`);

    // 3. เตรียม Path (ใช้ path.resolve เพื่อความชัวร์)
    const uploadDir = path.resolve(process.cwd(), "public/uploads/slips");

    // ตรวจสอบและสร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadDir)) {
      console.log("📂 ไม่พบโฟลเดอร์ uploads/slips กำลังสร้างใหม่...");
      await mkdir(uploadDir, { recursive: true });
    }

    // 4. แปลงไฟล์และบันทึก
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ตั้งชื่อไฟล์ (ใช้ Timestamp เพื่อไม่ให้ชื่อซ้ำ)
    const ext = path.extname(file.name) || ".jpg";
    const filename = `slip-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);
    console.log("✅ บันทึกไฟล์สำเร็จที่:", filePath);

    // 5. บันทึกลง Database
    const newOrder = await prisma.order.create({
      data: {
        userId: session.user.id,
        productId: productId,
        total: Number(price) || 0,
        status: "WAITING_VERIFY",
        slipUrl: `/uploads/slips/${filename}`, // Path สำหรับเรียกใช้หน้าเว็บ
        paymentRef: `SLIP-${Date.now()}`
      },
    });

    console.log("🎉 บันทึก Database สำเร็จ Order ID:", newOrder.id);

    return NextResponse.json({ success: true, orderId: newOrder.id });

  } catch (error: any) {
    console.error("🔥 Server Error:", error); // ดู Error ที่ Terminal
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}