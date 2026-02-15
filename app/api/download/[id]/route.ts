import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  const session = await getServerSession(authOptions);

  // 1. เช็ค Login
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. ดึงข้อมูลสินค้า
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }


  let canDownload = false;

  if (session.user.role === "ADMIN") {
    canDownload = true;
  } 
 
  else if (product.isFree || Number(product.price) === 0) {
    canDownload = true;
  } 

  else {
    const order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
        
        status: "COMPLETED", 
      },
    });

    if (order) {
      canDownload = true;
    }
  }


  if (!canDownload) {
    return NextResponse.json(
      { error: "Forbidden: คุณยังไม่ได้สั่งซื้อสินค้านี้ หรือรอการตรวจสอบยอดเงิน" }, 
      { status: 403 }
    );
  }


  const targetUrl = product.fileUrl || product.downloadUrl;

  if (!targetUrl) {
    return NextResponse.json({ error: "File link not found" }, { status: 404 });
  }


  try {
      
      await prisma.product.update({
          where: { id: productId },
          data: { downloadCount: { increment: 1 } }
      });

  
      await prisma.downloadHistory.create({
        data: {
            userId: session.user.id,
            productId: productId,
            ipAddress: request.headers.get("x-forwarded-for") || "unknown"
        }
      });
  } catch (e) {
      console.error("Stats Error:", e);
     
  }


  return NextResponse.redirect(targetUrl);
}