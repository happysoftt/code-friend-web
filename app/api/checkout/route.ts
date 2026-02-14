import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// ✅ แก้ไข: เพิ่ม fallback key เพื่อไม่ให้ Build พังบน Vercel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any, 
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId } = body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // ✅ แก้ไข: จัดการ Base URL ให้รองรับทั้ง Local และ Production
  const baseUrl = process.env.NEXTAUTH_URL || "https://code-friend-web-gumo.vercel.app";
  
  let validatedImage: string[] = [];
  if (product.image) {
    if (product.image.startsWith("http")) {
        validatedImage = [product.image];
    } else {
        // ตรวจสอบว่ามี / นำหน้าหรือไม่
        const imagePath = product.image.startsWith('/') ? product.image : `/${product.image}`;
        validatedImage = [`${baseUrl}${imagePath}`];
    }
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: (session.user as any).id, 
        productId: product.id,
        total: product.price, 
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
              name: product.title, 
              images: validatedImage, 
            },
            unit_amount: Math.round(Number(product.price) * 100), 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // ✅ แก้ไข: ใช้ baseUrl เพื่อความแม่นยำในการ Redirect
      success_url: `${baseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}&product_id=${product.id}`,
      cancel_url: `${baseUrl}/store/checkout/${product.id}`,
      metadata: {
        orderId: order.id,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}