import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any, 
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // ตรวจสอบ session ว่ามี user จริงไหม
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId } = body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // จัดการ URL รูปภาพ
  let validatedImage: string[] = [];
  if (product.image) {
    if (product.image.startsWith("http")) {
        validatedImage = [product.image];
    } else {
        validatedImage = [`${process.env.NEXTAUTH_URL}${product.image}`];
    }
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: session.user.id as string, // Cast as string หาก Type ยังไม่สมบูรณ์
        productId: product.id,
        total: product.price, // Prisma จัดการ Decimal ลง DB ให้เองได้
        status: "PENDING", 
      },
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "thb", 
            product_data: {
              name: product.title, // [แก้ไข 1] ใช้ title ตาม Schema
              images: validatedImage, 
            },
            // [แก้ไข 2] แปลง Decimal เป็น Number ก่อนคูณ
            unit_amount: Math.round(Number(product.price) * 100), 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}&product_id=${product.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/store/checkout/${product.id}`,
      metadata: {
        orderId: order.id,
        userId: session.user.id as string,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}