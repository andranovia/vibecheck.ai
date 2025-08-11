import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // Use Prisma adapter to persist users/accounts
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // We’ll fully enable this after we build sign-up + email verification.
      authorize: async (credentials, req) => {
        if (!credentials?.email || !credentials?.password) return null;

        // Normalize email to lowercase to match registration/DB storage
        const email = credentials.email.toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.passwordHash) {
          // No credentials account or user not found
          return null;
        }

        // Optional: block login until email is verified
        if (!user.emailVerified) {
          // Return null to reject; we’ll surface a user-friendly message in the UI later
          return null;
        }

  const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        // Return the full user object, including 'role'
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role ?? "USER",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Attach id/role to JWT
      if (user) {
        token.id = user.id;
        // Fetch role on first sign-in or when user present
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
        token.role = dbUser?.role ?? "USER";
      } else if (token?.id) {
        // Refresh role periodically (light DB hit only on server)
        const dbUser = await prisma.user.findUnique({ where: { id: String(token.id) }, select: { role: true } });
        token.role = dbUser?.role ?? token.role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
};