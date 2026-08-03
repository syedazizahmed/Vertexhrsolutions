import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return transporter;
};

export const sendVerificationEmail = async ({ to, name, otp }) => {
  const t = getTransporter();
  if (!t) {
    console.warn('Email not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing) — skipping send. OTP:', otp);
    return;
  }

  await t.sendMail({
    from: `"Vertex HR Solutions" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your verification code — Vertex HR Solutions',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0B2E6D;">Welcome, ${name}!</h2>
        <p>Enter this code to verify your email address on Vertex HR Solutions:</p>
        <p style="margin: 24px 0; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0B2E6D; text-align: center;">
          ${otp}
        </p>
        <p style="color: #666; font-size: 13px;">This code expires in 15 minutes. If you didn't create this account, you can ignore this email.</p>
      </div>
    `,
  });
};
