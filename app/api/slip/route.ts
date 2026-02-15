import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slipUrl, productId, price } = body;

    // 1. ตรวจสอบข้อมูลอีกครั้ง
    if (!slipUrl || !productId) {
      console.log("Missing data:", { slipUrl, productId });
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน (ขาดสลิปหรือสินค้า)" },
        { status: 400 }
      );
    }

    // 2. บันทึกลง Database (Table Order)
    // หมายเหตุ: ตรงนี้ต้องแก้ให้ตรงกับ Schema จริงของคุณ
    const order = await prisma.order.create({
      data: {
        productId: productId,
        totalPrice: Number(price), // ตรวจสอบชื่อ field ใน DB ว่าใช้ price หรือ totalPrice
        slipUrl: slipUrl,
        status: "PENDING", // สถานะรอตรวจสอบ
        userId: "user_id_here", // ถ้ามีระบบ User login ต้องใส่ ID ด้วย
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 }
    );
  }
}