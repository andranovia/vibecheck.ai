import nodemailer from "nodemailer";

export async function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  // Ethereal fallback for local dev
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@example.com",
    ...opts,
  });
  const preview = (nodemailer as any).getTestMessageUrl?.(info);
  if (preview) {
    console.log("Email preview URL:", preview);
  }
}
