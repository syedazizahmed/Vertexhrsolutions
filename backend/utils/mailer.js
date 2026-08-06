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

export const sendShortlistedEmail = async ({ to, name, jobTitle, company }) => {
  const t = getTransporter();
  if (!t) {
    console.warn('Email not configured — skipping shortlisted email to', to);
    return;
  }

  await t.sendMail({
    from: `"Vertex HR Solutions" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Congratulations! You've been shortlisted for ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0B2E6D;">Congratulations, ${name}! 🎉</h2>
        <p>Great news — you've been <strong>shortlisted</strong> for the <strong>${jobTitle}</strong> role at <strong>${company}</strong>.</p>
        <p>Our team will be in touch with you shortly regarding the next steps.</p>
        <p style="margin-top: 24px; color: #666; font-size: 13px;">Thank you for your interest in Vertex HR Solutions.</p>
      </div>
    `,
  });
};

export const sendRejectionEmail = async ({ to, name, jobTitle, company }) => {
  const t = getTransporter();
  if (!t) {
    console.warn('Email not configured — skipping rejection email to', to);
    return;
  }

  await t.sendMail({
    from: `"Vertex HR Solutions" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Update on your application for ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0B2E6D;">Dear ${name},</h2>
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> role at <strong>${company}</strong> and for taking the time to apply.</p>
        <p>Unfortunately, we are unable to proceed with your profile for this position at this time.</p>
        <p>We truly appreciate your interest in Vertex HR Solutions and encourage you to apply for future openings that match your profile.</p>
        <p style="margin-top: 24px; color: #666; font-size: 13px;">Wishing you the best in your job search.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async ({ to, name, otp }) => {
  const t = getTransporter();
  if (!t) {
    console.warn('Email not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing) — skipping send. Reset OTP:', otp);
    return;
  }

  await t.sendMail({
    from: `"Vertex HR Solutions" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your password reset code — Vertex HR Solutions',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0B2E6D;">Hi, ${name}</h2>
        <p>Use this code to reset your password on Vertex HR Solutions:</p>
        <p style="margin: 24px 0; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0B2E6D; text-align: center;">
          ${otp}
        </p>
        <p style="color: #666; font-size: 13px;">This code expires in 15 minutes. If you didn't request a password reset, you can ignore this email.</p>
      </div>
    `,
  });
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
