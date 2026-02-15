import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth"; // ⚠️ ตรวจสอบ path นี้ให้ถูกต้อง

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนแจ้งชำระเงิน" }, { status: 401 });
    }

    const body = await req.json();
    const { slipUrl, productId, price } = body;

    if (!slipUrl || !productId) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน (ขาดสลิปหรือสินค้า)" },
        { status: 400 }
      );
    }

    // ✅ บันทึกลง DB (แก้ไขชื่อ Field ให้ตรงกับ Schema)
    const order = await prisma.order.create({
      data: {
        productId: productId,
        
        // ✅ แก้จาก totalPrice เป็น total
        total: Number(price), 
        
        slipUrl: slipUrl,
        
        // ✅ แก้สถานะให้ตรงกับ enum OrderStatus (WAITING_VERIFY เหมาะสุดสำหรับรอตรวจสลิป)
        status: "WAITING_VERIFY", 
        
        userId: session.user.id, 
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