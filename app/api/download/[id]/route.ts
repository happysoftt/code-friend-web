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

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const isFree = Number(product.price) === 0 || product.isFree;
  let canDownload = isFree;

  if (!canDownload && session.user.role !== "ADMIN") {
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
    return NextResponse.json({ error: "Forbidden: You do not own this product" }, { status: 403 });
  }

  const targetUrl = product.fileUrl || product.downloadUrl;

  if (!targetUrl) {
    return NextResponse.json({ error: "File link not found" }, { status: 404 });
  }

  try {
      prisma.product.update({
          where: { id: productId },
          data: { downloadCount: { increment: 1 } }
      }).catch(() => {});
  } catch (e) {
      // Ignore stats error
  }

  return NextResponse.redirect(targetUrl);
}