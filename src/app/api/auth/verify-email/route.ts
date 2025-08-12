import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(
      new URL("/api/auth/signin?error=Verification", process.env.NEXTAUTH_URL)
    );
  }

  const hashed = hashToken(token);
  const vt = await prisma.verificationToken.findFirst({
    where: { identifier: email.toLowerCase(), token: hashed },
  });

  if (!vt || vt.expires < new Date()) {
    return NextResponse.redirect(
      new URL("/api/auth/signin?error=Verification", process.env.NEXTAUTH_URL)
    );
  }

  // Mark user as verified, remove token
  await prisma.$transaction([
    prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier: vt.identifier, token: vt.token } },
    }),
  ]);

  // Redirect to sign-in with success hint
  return NextResponse.redirect(
    new URL("/api/auth/signin?verified=1", process.env.NEXTAUTH_URL)
  );
}
