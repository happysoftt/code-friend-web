import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ✅ Custom Adapter to handle user creation with default Role and Profile
const CustomPrismaAdapter = (p: typeof prisma) => {
  const adapter = PrismaAdapter(p);

  return {
    ...adapter,
    createUser: async (data: any) => {
      // 1. Find the "USER" role
      let userRole = await p.role.findUnique({ 
        where: { name: "USER" } 
      });

      // 2. If the role doesn't exist, create it to prevent errors
      if (!userRole) {
        userRole = await p.role.create({
          data: { name: "USER", description: "General Member" },
        });
      }

      // 3. Create the user with the assigned roleId and a default profile
      return p.user.create({
        data: {
          ...data,
          roleId: userRole.id, // ✅ Assign Role ID
          profile: {           // ✅ Create default Profile
            create: {
              bio: "สมาชิกใหม่จาก Google",
              stack: "Learner",
            },
          },
        },
      });
    },
  };
};

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma) as any, // ✅ Use the custom adapter (cast as any to avoid type strictness issues)
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

        if (!user.isActive) {
          throw new Error("บัญชีของคุณถูกระงับการใช้งาน");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("รหัสผ่านไม่ถูกต้อง");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role?.name || "USER",
          roleId: user.roleId,
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if user is active before allowing sign in
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser && !dbUser.isActive) {
          return false; 
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role || "USER";
      }

      // If role is missing in token (common on first Google login), fetch from DB
      if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role?.name || "USER";
          token.id = dbUser.id;
        }
      }

      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};