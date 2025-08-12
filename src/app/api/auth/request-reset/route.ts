import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRandomToken, hashToken, addMinutes } from "@/lib/tokens";
import { sendMail } from "@/lib/mail";

const Schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email } = Schema.parse(json);
    const normalized = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true, name: true } });

    // Always reply success even if user not found to avoid user enumeration
    if (!user) {
      return NextResponse.json({ ok: true, message: "If an account exists, a reset email has been sent." });
    }

    // Invalidate previous reset tokens
    await prisma.passwordResetToken.deleteMany({ where: { identifier: normalized } });

    const plainToken = createRandomToken(32);
    const token = hashToken(plainToken);
    const expires = addMinutes(new Date(), 30);

    await prisma.passwordResetToken.create({
      data: {
        identifier: normalized,
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${plainToken}&email=${encodeURIComponent(normalized)}`;

    await sendMail({
      to: normalized,
      subject: "Reset your password",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Reset your password</h2>
          <p>Click the button below to choose a new password. This link expires in 30 minutes.</p>
          <p><a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Reset Password</a></p>
          <p>If the button doesn't work, paste this URL into your browser:<br/>${resetUrl}</p>
        </div>
      `,
      text: `Reset your password: ${resetUrl}`,
    });

    return NextResponse.json({ ok: true, message: "If an account exists, a reset email has been sent." });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("request-reset error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
