// backend/routes/staffRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import Staff from "../models/staff.js";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /staff/register:
 *   post:
 *     summary: สมัครพนักงานใหม่
 *     tags: [Staff]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: สมัครสำเร็จ
 *
 * /staff/login:
 *   post:
 *     summary: เข้าสู่ระบบพนักงาน
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: สำเร็จ
 *
 * /staff/change-password:
 *   put:
 *     summary: เปลี่ยนรหัสผ่านพนักงาน
 *     tags: [Staff]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: เปลี่ยนรหัสผ่านสำเร็จ
 */


const router = express.Router();

// ✅ สร้างพนักงานใหม่
router.post("/staff/register", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStaff = new Staff({
      name,
      phone,
      email,
      password: hashedPassword
    });

    await newStaff.save();

    res.status(201).json({
      message: "สร้างพนักงานใหม่สำเร็จ",
      staff: {
        id: newStaff._id,
        name: newStaff.name,
        phone: newStaff.phone,
        email: newStaff.email
      }
    });
  } catch (err) {
    console.error("❌ ERROR /staff/register:", err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/staff/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(401).json({ message: "อีเมลไม่ถูกต้อง" });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });

    // ✅ สร้าง token แล้วส่งกลับ
    const token = jwt.sign(
      { id: staff._id, email: staff.email },
      process.env.JWT_SECRET || "kitsune_secret",
      { expiresIn: "2h" }
    );

    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ route เปลี่ยนรหัสผ่าน http://127.0.0.1:8080/api/staff/change-password
router.put("/staff/change-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // 1️⃣ ตรวจว่ามี email ในระบบไหม
    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(404).json({ message: "ไม่พบพนักงานนี้" });
    }

    // 2️⃣ เข้ารหัสรหัสผ่านใหม่
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3️⃣ อัปเดตลง MongoDB
    staff.password = hashedPassword;
    await staff.save();

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
