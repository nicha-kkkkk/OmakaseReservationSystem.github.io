// backend/utils/sendEmail.js
import nodemailer from "nodemailer";

export async function sendConfirmEmail(to, subject, htmlContent) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_CONFIRM_HOST,
    port: parseInt(process.env.SMTP_CONFIRM_PORT),
    secure: false, // ใช้ true ถ้า port 465
    auth: {
      user: process.env.SMTP_CONFIRM_USER,
      pass: process.env.SMTP_CONFIRM_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_CONFIRM_FROM,
      to,
      subject,
      html: htmlContent, // ส่ง HTML
    });
    console.log("📧 Confirm Email sent:", info.response);
  } catch (err) {
    console.error("❌ Error sending confirm email:", err);
    throw err; // ให้ route handle
  }
}
