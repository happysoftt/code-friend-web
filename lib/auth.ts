import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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

        // ค้นหาผู้ใช้ในระบบ
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
          roleId: user.roleId || "", // ป้องกันค่า null
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // กรณีมีการอัปเดตข้อมูลผู้ใช้ (Update Profile)
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      // กรณีล็อกอินครั้งแรก (Initial Sign In)
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }

      // ตรวจสอบสิทธิ์ล่าสุดจาก Database เสมอ (สำคัญมากสำหรับการเปลี่ยน Role)
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
          console.error("Error refreshing user role:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // ส่งต่อข้อมูล ID และ Role ไปยังฝั่ง Client
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};