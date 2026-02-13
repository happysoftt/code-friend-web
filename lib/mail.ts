import { Resend } from "resend";
import OrderApprovedEmail from "@/components/emails/OrderApprovedEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

// ฟังก์ชันส่งอีเมลแจ้งลูกค้าว่า "อนุมัติแล้ว"
export async function sendOrderApprovedEmail(
  email: string,
  customerName: string,
  productName: string,
  orderId: string
) {
  // สร้างลิงก์ดาวน์โหลด (ลิงก์เว็บจริง หรือ localhost)
  const downloadLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  try {
    await resend.emails.send({
      from: "Code Friend Admin <onboarding@resend.dev>", // ใช้เมลทดสอบของ Resend ไปก่อน
      to: email, // ส่งหาลูกค้า
      subject: "✅ คำสั่งซื้อของคุณได้รับการอนุมัติแล้ว!",
      react: OrderApprovedEmail({
        customerName,
        productName,
        downloadLink,
        orderId,
      }),
    });
    console.log("Email sent successfully to:", email);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}