import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// ✅ ใช้ as any ดักไว้เพื่อป้องกัน error เรื่อง version ไม่ตรง
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any, 
});

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  // ถ้าไม่มีข้อมูลที่จำเป็น ให้ดีดกลับไปหน้าร้านค้า
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!sessionId || !orderId) {
    return NextResponse.redirect(`${baseUrl}/store`);
  }

  try {
    // 1. เช็คกับ Stripe ว่าจ่ายเงินจริงไหม
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      
      // ✅ แก้ไข 1: ดึง productId มาด้วย เพื่อเอาไปใช้สร้าง License Key
      const existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
          select: { 
              status: true,
              productId: true // <--- เพิ่มตรงนี้
          }
      });

      if (existingOrder && existingOrder.status !== "COMPLETED") {
          // 2. อัปเดตสถานะ Order เป็น "จ่ายแล้ว"
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "COMPLETED",
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
                    // ✅ แก้ไข 2: ใส่ productId ที่ดึงมา
                    productId: existingOrder.productId, 
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
  return NextResponse.redirect(`${baseUrl}/dashboard?success=true`);
}