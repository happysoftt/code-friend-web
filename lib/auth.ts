import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma), // กลับมาใช้ Adapter มาตรฐาน
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user) {
          throw new Error("ไม่พบผู้ใช้งานนี้ในระบบ");
        }

        if (!user.password) {
          throw new Error("บัญชีนี้สมัครผ่าน Google โปรดเข้าสู่ระบบด้วยปุ่ม Google");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("รหัสผ่านไม่ถูกต้อง");
        }

        if (!user.isActive) {
           throw new Error("บัญชีถูกระงับ");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role?.name || "USER",
          roleId: user.roleId,
        };
      },
    }),
  ],
callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. ถ้า login ครั้งแรก
      if (user) {
        token.id = user.id;
      }

      // 2. ถ้ามีการอัปเดต profile
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      // 3. 🔥 ไม้ตาย: บังคับให้เมล์นี้เป็น ADMIN ทันที (ไม่ต้องรอ Database)
      // ใส่บรรทัดนี้ไว้ก่อนเรียก prisma เพื่อความชัวร์
      if (token.email === "klolo20221@gmail.com") {
         token.role = "ADMIN"; 
         return token; // ส่งค่ากลับเลย ไม่ต้องไป query ให้เสียเวลา
      }

      // 4. สำหรับ user คนอื่น ค่อยไปดึงจาก DB ตามปกติ
      if (token.email) {
        try {
            const dbUser = await prisma.user.findUnique({
                where: { email: token.email },
                include: { role: true },
            });
    
            if (dbUser) {
                token.id = dbUser.id;
                // @ts-ignore
                token.role = dbUser.role?.name || "USER";
            }
        } catch (error) {
            console.log("Error fetching user role:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role; // รับค่ามาจาก JWT ด้านบน
      }
      return session;
    },
},
  secret: process.env.NEXTAUTH_SECRET,
};