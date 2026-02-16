// lib/gamification.ts
import { prisma } from "@/lib/prisma";

// 1. กำหนดเรท XP ตามที่คุณต้องการ
export const XP_RATES = {
  DAILY_LOGIN: 10,
  CREATE_SNIPPET: 50,
  SUBMIT_SHOWCASE: 100,
  COMMENT: 5,
  LIKE: 1,
  BUY_PRODUCT: 200,
};

// 2. ฟังก์ชันแจก XP และคำนวณ Level Up
export async function awardXP(userId: string, amount: number, reason: string) {
  try {
    // ดึงข้อมูล User ปัจจุบัน
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    if (!user) return;

    // คำนวณ XP ใหม่
    const newXP = user.xp + amount;
    
    // คำนวณ Level ใหม่ (สูตร: ทุก 1000 XP = 1 Level)
    // ตัวอย่าง: 2500 XP = Level 3 (Floor(2.5) + 1)
    const newLevel = Math.floor(newXP / 1000) + 1;

    // อัปเดตลง Database
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel, // อัปเดตเลเวลอัตโนมัติ
      },
    });

    // (Optional) เก็บ Log การได้แต้ม (ถ้ามีตาราง AuditLog)
    /*
    await prisma.auditLog.create({
      data: {
        userId,
        action: "EARN_XP",
        details: `ได้รับ ${amount} XP จาก ${reason}`,
      }
    });
    */

    console.log(`User ${userId} earned ${amount} XP from ${reason}. New Level: ${newLevel}`);

  } catch (error) {
    console.error("Error awarding XP:", error);
  }
}

// 3. ฟังก์ชันเช็ค Daily Login (แจกวันละครั้ง)
export async function checkDailyLogin(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // ตัดเวลาทิ้ง เหลือแค่วันที่

  try {
    // หา Log ว่าวันนี้แจกไปยัง? (อาจต้องเพิ่ม field 'lastLoginDate' ใน User หรือใช้ AuditLog)
    // แต่วิธีที่ง่ายที่สุดคือเช็คจาก User โดยตรงถ้ามี field lastLogin
    // ในที่นี้สมมติว่าเราเช็คจาก AuditLog ง่ายๆ
    
    const log = await prisma.auditLog.findFirst({
      where: {
        userId,
        action: "DAILY_LOGIN_XP",
        createdAt: { gte: today }, // หา log ที่สร้างวันนี้
      },
    });

    if (!log) {
      // ถ้ายังไม่มี Log ของวันนี้ -> แจก XP
      await awardXP(userId, XP_RATES.DAILY_LOGIN, "Daily Login");
      
      // บันทึกกันพลาดแจกซ้ำ
      await prisma.auditLog.create({
        data: {
          userId,
          action: "DAILY_LOGIN_XP",
          details: "ได้รับ XP จากการเข้าสู่ระบบรายวัน",
        },
      });
      return true; // แจกแล้ว
    }
    
    return false; // วันนี้แจกไปแล้ว
  } catch (error) {
    console.error("Daily Login Error:", error);
    return false;
  }
}