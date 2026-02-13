"use client";

import { QRCodeCanvas } from "qrcode.react";
import generatePayload from "promptpay-qr";
import { Copy, Check, Download, ScanLine } from "lucide-react";
import { useState, useRef } from "react";

interface PromptPayQRCodeProps {
  promptpayId: string; // เบอร์โทร หรือ เลขบัตรประชาชน
  amount: number;      // ยอดเงิน
}

export default function PromptPayQRCode({ promptpayId, amount }: PromptPayQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // 1. สร้าง Payload พร้อมเพย์ (ถ้าไม่มี ID ไม่ต้องสร้าง)
  // หมายเหตุ: promptpay-qr รองรับทั้งเบอร์มือถือและเลขบัตร
  const payload = promptpayId ? generatePayload(promptpayId, { amount }) : "";

  // ฟังก์ชัน Copy เลขบัญชี
  const handleCopy = () => {
    navigator.clipboard.writeText(promptpayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ฟังก์ชันดาวน์โหลด QR Code
  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `promptpay-${amount}.png`;
        link.click();
    }
  };

  if (!promptpayId) {
    return (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-400 text-sm animate-pulse">
            <ScanLine size={32} className="mx-auto mb-2 opacity-50" />
            ❌ ยังไม่ได้ตั้งค่าเลขบัญชี PromptPay ในระบบหลังบ้าน
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-xl max-w-[320px] mx-auto border border-slate-200">
      
      {/* Header PromptPay Logo */}
      <div className="bg-[#003D7A] w-full p-3 rounded-xl mb-4 flex justify-center shadow-inner">
         <img 
            src="https://upload.wikimedia.org/wikipedia/commons/c/c5/PromptPay-logo.png" 
            alt="PromptPay" 
            className="h-8 object-contain filter brightness-0 invert" 
         />
      </div>

      {/* QR Code Area */}
      <div className="relative group" ref={qrRef}>
          <div className="p-4 border-2 border-[#003D7A]/10 rounded-2xl bg-white shadow-sm">
            <QRCodeCanvas 
                value={payload} 
                size={220} 
                level="H" // ความละเอียดสูง
                bgColor="#FFFFFF"
                fgColor="#000000"
                includeMargin={true}
                className="rounded-lg"
            />
          </div>
          
          {/* Logo ตรงกลาง QR (Optional - ทำให้ดูพรีเมียม) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
                <span className="font-black text-[#003D7A] text-[10px]">PAY</span>
             </div>
          </div>
      </div>

      {/* ยอดเงิน */}
      <div className="text-center w-full mt-5">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">ยอดชำระรวม</p>
          <p className="text-4xl font-black text-[#003D7A] tracking-tight">฿{amount.toLocaleString()}</p>
          
          {/* เลขบัญชี + ปุ่ม Copy */}
          <div className="mt-4 bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-200 w-full group/copy">
              <div className="text-left overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-bold">เลขพร้อมเพย์ / PromptPay ID</p>
                  <p className="text-slate-700 font-mono font-bold text-base truncate tracking-wide">{promptpayId}</p>
              </div>
              <button 
                onClick={handleCopy}
                className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-slate-400 hover:text-[#003D7A] hover:border-blue-200 transition-all active:scale-95"
                title="คัดลอก"
              >
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
          </div>

          {/* ปุ่ม Save QR */}
          <button 
            onClick={handleDownload}
            className="mt-3 text-xs text-slate-400 hover:text-[#003D7A] font-medium flex items-center justify-center gap-1 w-full py-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
             <Download size={14} /> บันทึก QR Code
          </button>
      </div>
    </div>
  );
}