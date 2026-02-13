import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // 1. เช็คว่ามีอีเมลนี้หรือยัง
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // 2. เช็ค Role (ถ้าไม่มี USER ให้สร้างใหม่)
    let userRole = await prisma.role.findFirst({
        where: { name: "USER" }
    });

    if (!userRole) {
        userRole = await prisma.role.create({
            data: { name: "USER", description: "General User" }
        });
    }

    // 3. เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. สร้าง User
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: userRole.id,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        profile: {
            create: {
                bio: "ยินดีต้อนรับสู่ Code Friend!",
                stack: "Learner"
            }
        }
      },
    });

    return NextResponse.json({ success: true, message: "สมัครสมาชิกสำเร็จ" }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดจากระบบ" }, { status: 500 });
  }
}