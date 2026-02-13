import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  if (!sessionId || !orderId) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/store`);
  }

  try {
    // 1. เช็คกับ Stripe อีกรอบเพื่อความชัวร์ว่าจ่ายจริง
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // 2. อัปเดตสถานะ Order เป็น "จ่ายแล้ว"
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "COMPLETED",
          // เก็บ Transaction ID ไว้ตรวจสอบ
          transactionId: session.payment_intent as string, 
        },
      });

      // 3. (Optional) สร้าง License Key แถมให้ลูกค้า
      await prisma.licenseKey.create({
        data: {
            orderId: orderId,
            key: `KEY-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Date.now()}`
        }
      });
    }
  } catch (error) {
    console.error("Stripe Error:", error);
  }

  // 4. พาผู้ใช้ไปหน้า Dashboard พร้อมแจ้งว่าสำเร็จ
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?success=true`);
}