import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createRandomToken, hashToken, addMinutes } from "@/lib/tokens";
import { sendMail } from "@/lib/mail";
const RegisterSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { name, email, password } = RegisterSchema.parse(json);
        const normalizedEmail = email.toLowerCase();
        const existing = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        // If verified user already exists
        if (existing?.emailVerified) {
            return NextResponse.json(
                { error: "Account already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        let userId = existing?.id;
        if (!existing) {
            const created = await prisma.user.create({
                data: {
                    name,
                    email: normalizedEmail,
                    passwordHash,
                },
                select: { id: true },
            });
            userId = created.id;
        } else {
            // User exists but not verified: update password/name to latest
            await prisma.user.update({
                where: { id: existing.id },
                data: { name, passwordHash },
            });
            userId = existing.id;
        }

        // Create email verification token (hashed at rest)
        const plainToken = createRandomToken(32);
        const token = hashToken(plainToken);
        const expires = addMinutes(new Date(), 30);

        // Delete any existing tokens for this identifier
        await prisma.verificationToken.deleteMany({
            where: { identifier: normalizedEmail },
        });

        await prisma.verificationToken.create({
            data: {
                identifier: normalizedEmail,
                token,
                expires,
            },
        });

        const verifyUrl = `${process.env.NEXTAUTH_URL
            }/api/auth/verify-email?token=${plainToken}&email=${encodeURIComponent(
                normalizedEmail
            )}`;

        await sendMail({
            to: normalizedEmail,
            subject: "Verify your email",
            html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6">
                <h2>Verify your email</h2>
                <p>Hi ${name || "there"
                }, please confirm your email to activate your account.</p>
                <p>This link expires in 30 minutes.</p>
                <p><a href="${verifyUrl}" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Verify Email</a></p>
                <p>If the button doesn't work, paste this URL into your browser:<br/>${verifyUrl}</p>
            </div>`,
            text: `Verify your email: ${verifyUrl}`,
        });
        return NextResponse.json({
            ok: true,
            message: "Check your email to verify your account.",
        });
    } catch (err: any) {
        if (err?.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid input", details: err.issues },
                { status: 400 }
            );
        }
        console.error("Register error:", err);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
