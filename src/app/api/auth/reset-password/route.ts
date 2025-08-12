import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

const Schema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, token, password } = Schema.parse(json);
    const normalized = email.toLowerCase();

    const hashed = hashToken(token);
    const dbToken = await prisma.passwordResetToken.findFirst({
      where: { identifier: normalized, token: hashed },
    });

    if (!dbToken || dbToken.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { email: normalized }, data: { passwordHash } }),
      prisma.passwordResetToken.delete({ where: { id: dbToken.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("reset-password error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
