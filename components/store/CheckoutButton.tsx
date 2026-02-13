"use client";

import { createOrder } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";

export default function CheckoutButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    const result = await createOrder(productId);
    
    if (result.success) {
        alert("ชำระเงินสำเร็จ! ขอบคุณที่อุดหนุน");
        router.push("/orders"); // ไปหน้าประวัติการซื้อ
        router.refresh();
    } else {
        alert("เกิดข้อผิดพลาด: " + result.error);
        setLoading(false);
    }
  };

  return (
    <button 
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
    >
        {loading ? (
            "กำลังประมวลผล..."
        ) : (
            <>
                <CreditCard size={20} /> ชำระเงินทันที
            </>
        )}
    </button>
  );
}