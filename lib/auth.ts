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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      
      // ดึงข้อมูล Role จาก Database มาใส่ใน Token (บัตรผ่านชั้นใน)
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email! },
        include: { role: true },
      });

      if (dbUser) {
        token.id = dbUser.id;
        // @ts-ignore
        token.role = dbUser.role?.name || "USER";
      }

      // 🔥 กันเหนียว: บังคับอีเมลคุณให้เป็น ADMIN ทันทีในระดับ Token
      if (token.email === "klolo20221@gmail.com") {
        token.role = "ADMIN";
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // 🔥 สำคัญที่สุด: ก๊อปปี้ยศจาก Token มาใส่ใน Session (บัตรผ่านชั้นนอก)
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role; // บรรทัดนี้จะทำให้หน้า Layout เห็นคำว่า "ADMIN"
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};