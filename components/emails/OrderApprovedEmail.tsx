import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface OrderApprovedEmailProps {
  customerName: string;
  productName: string;
  downloadLink: string;
  orderId: string;
}

export default function OrderApprovedEmail({
  customerName,
  productName,
  downloadLink,
  orderId,
}: OrderApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>คำสั่งซื้อของคุณสำเร็จแล้ว! ดาวน์โหลดสินค้าได้เลย</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>ขอบคุณสำหรับการสั่งซื้อ! 🎉</Heading>
          <Text style={text}>สวัสดีคุณ {customerName},</Text>
          <Text style={text}>
            เราได้ตรวจสอบการชำระเงินของคุณเรียบร้อยแล้ว
            นี่คือสินค้าที่คุณสั่งซื้อครับ:
          </Text>

          <Section style={productBox}>
            <Text style={productTitle}>{productName}</Text>
            <Text style={text}>Order ID: #{orderId.slice(0, 8)}</Text>
            
            <Button
              href={downloadLink}
              style={button}
            >
              ดาวน์โหลดไฟล์สินค้า
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            หากปุ่มกดไม่ได้ สามารถคลิกที่ลิงก์นี้:
            <br />
            <Link href={downloadLink} style={anchor}>
              {downloadLink}
            </Link>
          </Text>
          
          <Text style={footer}>
            ขอบคุณที่ใช้บริการ Code Friend
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (CSS ใน Email ต้องเขียนแบบ Inline)
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  padding: "0 20px",
};

const productBox = {
  padding: "20px",
  backgroundColor: "#f0f0f0",
  borderRadius: "8px",
  margin: "20px",
  textAlign: "center" as const,
};

const productTitle = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "10px",
};

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px",
  margin: "20px auto",
  fontWeight: "bold",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};

const anchor = {
  color: "#007ee6",
};