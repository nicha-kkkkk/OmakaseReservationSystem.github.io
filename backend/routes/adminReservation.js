
// backend/routes/adminReservation.js
import express from "express";
import Reservation from "../models/Reservation.js";
import { createNotification } from "./notificationRoutes.js";
import { sendConfirmEmail } from "../utils/sendEmail.js"; // ใช้ SMTP_CONFIRM_*
import Notification from "../models/Notification.js";
import mongoose from "mongoose";
/**
 * @swagger
 * /admin/reservation/all:
 *   get:
 *     summary: ดึงข้อมูลการจองทั้งหมด (admin)
 *     tags: [AdminReservation]
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *
 * /admin/reservation/{id}/confirm:
 *   put:
 *     summary: ยืนยันการจอง (admin)
 *     tags: [AdminReservation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ยืนยันสำเร็จ
 */


const router = express.Router();

// ─────── ดึงทั้งหมด ───────
router.get("/all", async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user_id", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ status: "success", reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "เกิดข้อผิดพลาด" });
  }
});

// ─────── ดึงตามวัน ───────
router.get("/by-date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const reservations = await Reservation.find({ reservation_time: date })
      .populate("user_id", "name email phone")
      .sort({ reservation_hour: 1 });
    res.json({ status: "success", reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "เกิดข้อผิดพลาด" });
  }
});

// ─────── อัปเดตสถานะเช็คอิน ───────
router.put("/:id/checkin", async (req, res) => {
  try {
    const { id } = req.params;
    const { checkin_status } = req.body;

    const allowed = ["กำลังมา", "เช็คอินแล้ว", "ยกเลิกเช็คอิน"];
    if (!allowed.includes(checkin_status)) {
      return res.status(400).json({ status: "error", message: "สถานะเช็คอินไม่ถูกต้อง" });
    }

    const updated = await Reservation.findByIdAndUpdate(
      id,
      { checkin_status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: "error", message: "ไม่พบการจองนี้" });
    }

    res.json({
      status: "success",
      message: `อัปเดตเช็คอินเป็น "${checkin_status}" สำเร็จ`,
      reservation: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "เกิดข้อผิดพลาดในการอัปเดตเช็คอิน" });
  }
});

// ---------------------- ยืนยันการจอง ----------------------
router.put("/:id/confirm", async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id).populate("user_id");

    if (!reservation) {
      return res.status(404).json({ status: "error", message: "ไม่พบการจอง" });
    }

    // ✅ ถ้ายืนยันไปแล้ว ห้ามทำซ้ำ
    if (reservation.status === "ชำระเงินเรียบร้อย" && reservation.emailSent && reservation.notified) {
      return res.json({ status: "success", message: "เคยยืนยันและส่งอีเมลไปแล้ว" });
    }

    // ✅ อัปเดตสถานะ
    reservation.status = "ชำระเงินเรียบร้อย";
    reservation.emailSent = true;
    reservation.notified = true;
    await reservation.save();

    // ✅ ส่งอีเมล
    if (reservation.user_id?.email) {
      const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; padding:20px; border-radius:8px;">
        <h2 style="text-align:center; color:#730606;">ยืนยันการจอง Kitsune Omakase</h2>
        <p>สวัสดีคุณ <b>${reservation.user_id.name}</b>,</p>
        <p>การจองของคุณได้รับการยืนยันเรียบร้อยแล้ว 🎉</p>

        <table style="width:100%; border-collapse:collapse; margin-top:20px;">
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><b>คอร์ส</b></td>
            <td style="padding:8px; border:1px solid #ddd;">${reservation.course_name}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><b>วันเวลา</b></td>
            <td style="padding:8px; border:1px solid #ddd;">
              ${new Date(reservation.reservation_time).toLocaleDateString('th-TH')} ${reservation.reservation_hour}
            </td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><b>ราคารวม</b></td>
            <td style="padding:8px; border:1px solid #ddd;">${reservation.total_price.toLocaleString()} บาท</td>
          </tr>
        </table>

        <p style="margin-top:20px;">ขอบคุณที่ใช้บริการ Kitsune Omakase 💖</p>
      </div>
      `;

      await sendConfirmEmail(
        reservation.user_id.email,
        "ยืนยันการจอง Kitsune Omakase",
        emailHTML
      );
    }

    // ✅ อัปเดต Notification เดิมหรือสร้างใหม่ถ้าไม่มี
    let notification = await Notification.findOne({ reservation_id: reservation._id, type: "new_reservation" });

    if (notification) {
      notification.message = "การจองของคุณได้รับการยืนยันแล้ว";
      notification.confirm_status = "ยืนยันแล้ว";
      notification.emailSent = true;
      await notification.save();
    } else {
      await createNotification(
        reservation._id,
        "new_reservation",
        "การจองของคุณได้รับการยืนยันแล้ว"
      );
    }

    res.json({
      status: "success",
      message: "ยืนยันการจองสำเร็จ และส่ง Email/Notification แล้ว",
    });
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ status: "error", message: "เกิดข้อผิดพลาดในการยืนยันการจอง" });
  }
});

// ---------------------- ยืนยันการเลื่อนวันจอง ----------------------

// ---------------------- ยืนยันการเลื่อนวันจอง ----------------------
router.put("/:id/reschedule/confirm", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ แปลง id เป็น ObjectId ก่อนค้นหา
    const notification = await Notification.findOne({
      reservation_id: new mongoose.Types.ObjectId(id),
      type: "reschedule"
    }).populate({
      path: "reservation_id",
      populate: { path: "user_id" },
    });

    if (!notification) {
      return res.status(404).json({ status: "error", message: "ไม่พบ Notification การเลื่อนสำหรับการจองนี้" });
    }

    // ✅ อัปเดตสถานะ Notification
    notification.confirm_status = "ยืนยันแล้ว";
    notification.emailSent = true;
    await notification.save();

    const reservation = notification.reservation_id;

    // ✅ ส่งอีเมลแจ้งลูกค้า
    if (reservation.user_id?.email) {
      const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; padding:20px; border-radius:8px;">
        <h2 style="text-align:center; color:#730606;">ยืนยันการเลื่อนวันจอง Kitsune Omakase</h2>
        <p>สวัสดีคุณ <b>${reservation.user_id.name}</b>,</p>
        <p>การเลื่อนวันจองของคุณได้รับการยืนยันแล้ว 🎉</p>

        <table style="width:100%; border-collapse:collapse; margin-top:20px;">
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><b>คอร์ส</b></td>
            <td style="padding:8px; border:1px solid #ddd;">${reservation.course_name}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><b>วันเวลาใหม่</b></td>
            <td style="padding:8px; border:1px solid #ddd;">
              ${new Date(reservation.reservation_time).toLocaleDateString('th-TH')} ${reservation.reservation_hour}
            </td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><b>ราคารวม</b></td>
            <td style="padding:8px; border:1px solid #ddd;">${reservation.total_price.toLocaleString()} บาท</td>
          </tr>
        </table>

        <p style="margin-top:20px;">ขอบคุณที่ใช้บริการ Kitsune Omakase 💖</p>
      </div>
      `;

      await sendConfirmEmail(
        reservation.user_id.email,
        "ยืนยันการเลื่อนวันจอง Kitsune Omakase",
        emailHTML
      );
    }

    res.json({
      status: "success",
      message: "ยืนยันการเลื่อนวันจองสำเร็จ และส่งอีเมลแจ้งลูกค้าแล้ว",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "เกิดข้อผิดพลาดในการยืนยันการเลื่อนวันจอง" });
  }
});


export default router;
