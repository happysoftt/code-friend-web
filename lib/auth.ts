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
      // 1. Update Profile (ถ้ามี)
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      // 2. Login ครั้งแรก
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }

      // 3. Logic การตรวจสอบสิทธิ์
      if (token.email) {
        // ✅ ไม้ตายที่ 1: บังคับให้เมล์นี้เป็น ADMIN ทันที (ไม่ต้องรอ Database)
        if (token.email === "klolo20221@gmail.com") {
          token.role = "ADMIN";
        }

        // ✅ ใช้ try/catch ป้องกัน Database ล่มแล้วพาเว็บพัง
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            include: { role: true },
          });

          if (dbUser) {
            token.id = dbUser.id;
            // ถ้า DB บอกว่าเป็น USER แต่เมล์เราคือไม้ตาย ให้ยึดค่า ADMIN ไว้
            if (token.email !== "klolo20221@gmail.com") {
               // @ts-ignore
               token.role = dbUser.role?.name || "USER";
            }
          }
        } catch (error) {
          console.error("Database Error in JWT:", error);
          // ถ้า DB Error เราก็ยังรอด เพราะ token.role ถูกเซ็ตเป็น ADMIN ไปแล้วจากข้างบน
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role; // ส่งค่า Role ที่ได้ไปให้หน้าเว็บ
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};