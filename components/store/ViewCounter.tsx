"use client";

import { useEffect } from "react";
import { incrementProductView } from "@/lib/actions";

export default function ViewCounter({ productId }: { productId: string }) {
  useEffect(() => {
    // เรียก Server Action เพื่อนับวิวเมื่อหน้าเว็บโหลดเสร็จ
    incrementProductView(productId);
  }, [productId]);

  return null; // Component นี้ทำงานเบื้องหลัง ไม่ต้องแสดงผลอะไร
}