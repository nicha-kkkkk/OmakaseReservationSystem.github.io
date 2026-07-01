// backend/routes/authRoutes.js
import dotenv from "dotenv";
dotenv.config();


import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "kitsune_secret";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: สมัครสมาชิกใหม่
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: สมัครสมาชิกสำเร็จ
 *
 * /auth/login:
 *   post:
 *     summary: เข้าสู่ระบบผู้ใช้
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 */


// สมัครสมาชิก
router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ error: "อีเมลนี้ถูกใช้แล้ว" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, phone, email, password: hashed });
    await user.save();

    res.json({ message: "สมัครสมาชิกสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบ" });
  }
});


// ✅ เข้าสู่ระบบ
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "ไม่พบผู้ใช้งาน" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "รหัสผ่านไม่ถูกต้อง" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "kitsuneSecret", { expiresIn: "1h" });

    res.json({ message: "เข้าสู่ระบบสำเร็จ", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});


// ✅ ดึงข้อมูลโปรไฟล์ผู้ใช้
router.get("/profile", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ไม่พบรหัสผู้ใช้" });

    const user = await User.findById(id).select("-password"); // ไม่ส่ง password กลับ
    if (!user) return res.status(404).json({ error: "ไม่พบข้อมูลผู้ใช้" });

    res.json(user);
  } catch (err) {
    console.error("GET /profile error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});


// ✅ อัปเดตข้อมูลผู้ใช้
router.put("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, password } = req.body;

    const updateData = { name, phone, email };

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) return res.status(404).json({ error: "ไม่พบผู้ใช้" });

    res.json({ message: "อัปเดตข้อมูลสำเร็จ", user: updatedUser });
  } catch (err) {
    console.error("PUT /profile error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});



// ส่งอีเมลรีเซ็ตรหัสผ่าน

console.log("📨 ตรวจสอบค่า SMTP จาก .env:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
});


// ✅ ฟังก์ชันสร้าง transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ✅ เทมเพลตอีเมล HTML สวย
function buildResetEmailTemplate(name, resetUrl) {
  return `
  <div style="font-family:sans-serif; background:#fff5f5; padding:20px; border-radius:10px;">
    <h2 style="color:#b92e2e; text-align:center;">KITSUNE OMAKASE</h2>
    <p>สวัสดีคุณ <strong>${name}</strong>,</p>
    <p>เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ<br>
    หากคุณไม่ได้ร้องขอ กรุณาเพิกเฉยอีเมลนี้</p>
    <p style="margin:20px 0;">
      <a href="${resetUrl}" 
         style="background:#b92e2e;color:white;padding:10px 20px;
                text-decoration:none;border-radius:8px;">
        รีเซ็ตรหัสผ่านของคุณ
      </a>
    </p>
    <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
    <hr>
    <p style="font-size:12px;color:#555;">© 2025 KITSUNE OMAKASE, All rights reserved.</p>
  </div>`;
}

// ✅ ลืมรหัสผ่าน
router.post("/auth/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📩 รับคำขอลืมรหัสผ่านจาก:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("⚠️ ไม่พบอีเมลในระบบ:", email);
      return res.json({ message: "หากมีบัญชีนี้ เราได้ส่งลิงก์รีเซ็ตไปแล้ว" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expires = Date.now() + 1000 * 60 * 60;

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = new Date(expires);
    await user.save();
    console.log("✅ อัปเดต token reset ลง MongoDB สำเร็จ");

    const resetUrl = `${process.env.FRONTEND_ORIGIN}/reset-password.html?token=${token}&email=${encodeURIComponent(email)}`;
    console.log("🔗 ลิงก์รีเซ็ต:", resetUrl);

    console.log("📤 กำลังส่งอีเมลผ่าน SMTP:", process.env.SMTP_USER);
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "รีเซ็ตรหัสผ่าน | KITSUNE OMAKASE",
      html: buildResetEmailTemplate(user.name, resetUrl),
    });

    console.log("✅ ส่งอีเมลสำเร็จแล้ว");
    res.json({ message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลเรียบร้อย" });

  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง" });
  }
});




// ✅ รีเซ็ตรหัสผ่านใหม่
router.post("/auth/reset", async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password)
      return res.status(400).json({ error: "ข้อมูลไม่ครบ" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() }, // ยังไม่หมดอายุ
    });

    if (!user)
      return res.status(400).json({ error: "ลิงก์ไม่ถูกต้องหรือหมดอายุ" });

    // ✅ อัปเดตรหัสใหม่
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log("✅ อัปเดตรหัสผ่านใหม่สำเร็จ:", user.email);

    res.json({ message: "เปลี่ยนรหัสผ่านเรียบร้อย" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});





export default router;


