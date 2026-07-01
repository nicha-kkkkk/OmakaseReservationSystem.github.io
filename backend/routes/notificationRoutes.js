
// backend/routes/notificationRoutes.js
import express from "express";
import Notification from "../models/Notification.js";
import Reservation from "../models/Reservation.js";

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: ดึง Notification ทั้งหมด
 *     tags: [Notification]
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *
 * /notification/{id}/read:
 *   put:
 *     summary: ทำเครื่องหมายว่าอ่านแล้ว
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: สำเร็จ
 */

const router = express.Router();

// ─────── ดึง notifications ทั้งหมด ───────
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "reservation_id",
        populate: { path: "user_id", select: "name email phone" },
      });

    // ✅ จัดรูปแบบข้อมูลเพื่อให้ Frontend ใช้งานได้สะดวก
    const formatted = notifications.map((n) => ({
      _id: n._id,
      reservation_id: n.reservation_id?._id, // ✅ เพิ่ม ID การจอง เพื่อใช้ในปุ่มยืนยัน
      type: n.type,
      message: n.message,
      course_name: n.reservation_id?.course_name,
      date: n.reservation_id?.reservation_time
        ? new Date(n.reservation_id.reservation_time).toLocaleDateString("th-TH")
        : "-",
      reservation_hour: n.reservation_id?.reservation_hour || "-",
      number_of_people: n.reservation_id?.number_of_people || 0,
      total_price: n.reservation_id?.total_price || 0,
      user_name: n.reservation_id?.user_id?.name || "-",
      user_email: n.reservation_id?.user_id?.email || "-",
      user_phone: n.reservation_id?.user_id?.phone || "-",
      isRead: n.isRead,
      createdAt: n.createdAt,
      
    }));

    res.json({ status: "success", notifications: formatted });
  } catch (err) {
    console.error("❌ โหลด notifications ล้มเหลว:", err);
    res
      .status(500)
      .json({ status: "fail", message: "ไม่สามารถโหลดแจ้งเตือนได้" });
  }
});

// ─────── ทำเครื่องหมายว่าอ่านแล้ว ───────
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ message: "ไม่พบ notification" });
    res.json({ message: "อ่านแล้ว", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ─────── สร้าง Notification ใหม่ ───────
export async function createNotification(reservationId, type, message) {
  try {
    const reservation = await Reservation.findById(reservationId).populate(
      "user_id"
    );
    if (!reservation) {
      console.error("❌ ไม่พบการจองสำหรับสร้าง Notification");
      return null;
    }

    const notification = new Notification({
      type,
      reservation_id: reservation._id,
      message,
    });

    await notification.save();
    console.log("✅ สร้าง Notification สำเร็จ:", notification._id);
    return notification;
  } catch (err) {
    console.error("❌ สร้าง Notification ล้มเหลว:", err);
    return null;
  }
}

export default router;
