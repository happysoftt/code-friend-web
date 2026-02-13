import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// ✅ แก้ไข: ใช้ as any เพื่อปิด Error เรื่อง Version ของ Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any, 
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  if (!sessionId || !orderId) {
    // ถ้าไม่มีข้อมูล ให้ดีดกลับไปหน้าร้านค้า
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/store`);
  }

  try {
    // 1. เช็คกับ Stripe อีกรอบเพื่อความชัวร์ว่าจ่ายจริง
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      
      // ✅ เพิ่มการเช็ค: ถ้า Order นี้เคยทำรายการสำเร็จไปแล้ว ไม่ต้องทำซ้ำ (กันลูกค้ารีเฟรชหน้า)
      const existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
          select: { status: true }
      });

      if (existingOrder && existingOrder.status !== "COMPLETED") {
          // 2. อัปเดตสถานะ Order เป็น "จ่ายแล้ว"
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "COMPLETED",
              // ใช้ session.id แทนถ้า payment_intent ไม่มีค่า
              transactionId: (session.payment_intent as string) || sessionId, 
            },
          });

          // 3. สร้าง License Key แถมให้ลูกค้า (ถ้ายังไม่มี)
          const existingKey = await prisma.licenseKey.findFirst({
             where: { orderId: orderId }
          });

          if (!existingKey) {
             await prisma.licenseKey.create({
                data: {
                    orderId: orderId,
                    key: `KEY-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Date.now()}`
                }
             });
          }
      }
    }
  } catch (error) {
    console.error("Stripe Error:", error);
  }

  // 4. พาผู้ใช้ไปหน้า Dashboard พร้อมแจ้งว่าสำเร็จ
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/dashboard?success=true`);
}