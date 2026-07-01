
// backend/routes/reservationRoutes.js
import express from "express";
import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import FoodCourse from "../models/FoodCourse.js";
import Notification from "../models/Notification.js";

import cors from "cors";

/**
 * @swagger
 * /reservation:
 *   post:
 *     summary: สร้างการจองใหม่
 *     tags: [Reservation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               reservation_time:
 *                 type: string
 *               reservation_hour:
 *                 type: string
 *               number_of_people:
 *                 type: number
 *               course_name:
 *                 type: string
 *               course_price:
 *                 type: number
 *     responses:
 *       201:
 *         description: สร้างการจองสำเร็จ
 *
 * /reservation/availability:
 *   get:
 *     summary: ตรวจสอบที่นั่งว่าง
 *     tags: [Reservation]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: course_name
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: reservation_hour
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: แสดงจำนวนที่นั่งที่เหลือ
 */


const router = express.Router();

// -------------------------------------------
// ---------------------- ตรวจสอบที่นั่งว่าง ----------------------
router.get("/availability", async (req, res) => {
  try {
    const { date, course_name, reservation_hour } = req.query;
    if (!date || !course_name || !reservation_hour) {
      return res.status(400).json({ message: "กรุณาระบุ date, course_name และ reservation_hour" });
    }

    let courseKey = null;
    if (course_name.includes("499")) courseKey = 499;
    else if (course_name.includes("699")) courseKey = 699;
    else if (course_name.includes("899")) courseKey = 899;
    else if (course_name.includes("1099")) courseKey = 1099;

    const course = await FoodCourse.findOne({ name: courseKey });
    const maxSeats = course?.maxSeats || 10;

    const reservedDocs = await Reservation.find({ reservation_time: date, course_name, reservation_hour });
    const reservedSeats = reservedDocs.reduce((sum, r) => sum + (r.number_of_people || 0), 0);
    const remaining = maxSeats - reservedSeats;

    res.json({ remaining: remaining >= 0 ? remaining : 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

  router.post("/", async (req, res) => {
  try {
    const { 
      user_id, reservation_time, reservation_hour, number_of_people, 
      allergies, selected_menu, course_name, course_price, status 
    } = req.body;

    if (!user_id || !reservation_time || !reservation_hour || !number_of_people) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
    }

    let courseKey = null;
    if (course_name.includes("499")) courseKey = 499;
    else if (course_name.includes("699")) courseKey = 699;
    else if (course_name.includes("899")) courseKey = 899;
    else if (course_name.includes("1099")) courseKey = 1099;

    const course = await FoodCourse.findOne({ name: courseKey });
    const maxSeats = course?.maxSeats || 10;

    const reservedDocs = await Reservation.find({ reservation_time, course_name, reservation_hour });
    const reservedSeats = reservedDocs.reduce((sum, r) => sum + (r.number_of_people || 0), 0);

    if (reservedSeats + number_of_people > maxSeats) {
      return res.status(400).json({ message: `จำนวนที่นั่งไม่พอ เหลือ ${maxSeats - reservedSeats} ที่นั่ง` });
    }

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ message: "ไม่พบลูกค้า" });

    // ✅ คำนวณ total_price
    let total_price = number_of_people * (course_price || 0);

    const reservation = new Reservation({
      user_id,
      reservation_time,
      reservation_hour,
      number_of_people,
      total_price, // ✅ เพิ่มตรงนี้
      status: status || "รอดำเนินการ",
      allergies: Array.isArray(allergies) ? allergies : [],
      selected_menu: Array.isArray(selected_menu) ? selected_menu : [],
      course_name,
      course_price
    });

    const saved = await reservation.save();

    // 🔔 สร้าง Notification สำหรับพนักงาน
    await Notification.create({
      type: "new_reservation",
      reservation_id: saved._id,
      message: `มีการจองใหม่จาก ${user.name} จำนวน ${number_of_people} คน`
    });

    res.status(201).json({ message: "สร้างการจองสำเร็จ", reservation: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});


// ---------------------- เลื่อนวันจอง ----------------------
router.put("/:id/reschedule", async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;

    if (!newDate) return res.status(400).json({ message: "กรุณาระบุวันใหม่" });

    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });

    const today = new Date();
    const currentReservationDate = new Date(reservation.reservation_time);
    const newReservationDate = new Date(newDate);

    const diffDaysBefore = (currentReservationDate - today) / (1000 * 60 * 60 * 24);
    if (diffDaysBefore < 3) return res.status(400).json({ message: "ไม่สามารถเลื่อนการจองภายใน 3 วันก่อนวันนัดหมายได้" });

    const diffDaysAfter = (newReservationDate - currentReservationDate) / (1000 * 60 * 60 * 24);
    if (diffDaysAfter > 30) return res.status(400).json({ message: "สามารถเลื่อนวันจองได้ไม่เกิน 30 วันจากวันเดิม" });

    let rescheduleCount = Number(reservation.rescheduleCount || 0);
    if (rescheduleCount >=2) return res.status(400).json({ message: "คุณได้เลื่อนการจองครบ 1 ครั้งแล้ว" });

    const coursePrice = reservation.course_price.toString();
    const course = await FoodCourse.findOne({ name: Number(coursePrice) });
    const maxSeats = course?.maxSeats || 10;

    const courseHours = {
      "499": "11:00-12:00",
      "699": "13:00-14:30",
      "899": "15:30-17:30",
      "1099": "18:30-21:00"
    };
    const targetHour = courseHours[coursePrice];
    if (!targetHour) return res.status(400).json({ message: "ไม่พบช่วงเวลาสำหรับคอร์สนี้" });

    const reservedDocs = await Reservation.find({
      reservation_time: newReservationDate,
      course_name: reservation.course_name,
      reservation_hour: targetHour,
      _id: { $ne: id }
    });

    const reservedSeats = reservedDocs.reduce((sum, r) => sum + (r.number_of_people || 0), 0);
    const remainingSeats = maxSeats - reservedSeats;
    const numPeople = reservation.number_of_people;

    if (remainingSeats < numPeople) {
      return res.status(400).json({
        message: `ขณะนี้วันที่ ${newDate} เวลา ${targetHour} มีผู้จองเต็มสำหรับ ${numPeople} ท่าน กรุณาเลือกวันอื่น`
      });
    }

    reservation.reservation_time = newReservationDate;
    reservation.reservation_hour = targetHour;
    reservation.rescheduleCount = rescheduleCount + 1;

    await reservation.save();

    const user = await User.findById(reservation.user_id);

    // 🔔 สร้าง Notification สำหรับพนักงาน
    await Notification.create({
      type: "reschedule",
      reservation_id: reservation._id,
      message: `${user.name} เลื่อนวันจองเป็น ${newDate} เวลา ${targetHour}`
    });

    res.json({ message: "เลื่อนวันจองสำเร็จ", reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});


// ---------------------- ตั้งค่าจำนวนสูงสุดต่อรอบ ----------------------
router.put("/setMaxSeats/:course_price", async (req, res) => {
  try {
    const { course_price } = req.params;
    const { maxSeats } = req.body;

    if (!maxSeats || isNaN(maxSeats) || maxSeats <= 0) {
      return res.status(400).json({ message: "กรุณาระบุจำนวนที่นั่งให้ถูกต้อง" });
    }

    // ✅ อัปเดตใน MongoDB
    const updatedCourse = await FoodCourse.findOneAndUpdate(
      { name: Number(course_price) },
      { $set: { maxSeats: Number(maxSeats) } },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "ไม่พบคอร์สนี้" });
    }

    res.json({ 
      message: `อัปเดตจำนวนสูงสุดของคอร์ส ${course_price} เป็น ${maxSeats} ที่นั่งสำเร็จ`, 
      course: updatedCourse
    });
  } catch (err) {
    console.error("❌ Error updating maxSeats:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

// ---------------------- ดึงการจองของผู้ใช้ ----------------------
router.get("/my", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "กรุณาระบุ userId" });

    const reservations = await Reservation.find({ user_id: userId })
      .populate("user_id", "name email phone")
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

// ---------------------- ดึงรายการการจองทั้งหมด (กรองตามคอร์สได้) ----------------------
router.get("/", async (req, res) => {
  try {
    const { course_price } = req.query;
    let filter = {};

    if (course_price) {
      filter.course_price = parseInt(course_price, 10);
    }

    const reservations = await Reservation.find(filter)
      .populate("user_id", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ reservations });
  } catch (err) {
    console.error("❌ Error fetching reservations:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

// ---------------------- ดึงการจองตาม ID ----------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "รหัสการจองไม่ถูกต้อง" });
    }

    const reservation = await Reservation.findById(id)
      .populate("user_id", "name email phone");
    if (!reservation) return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });

    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

// ---------------------- อัปเดตสถานะ ----------------------
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });

    const allowedStatuses = ["รอดำเนินการ", "รอยืนยัน", "ชำระเงินเรียบร้อย", "ยกเลิก"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
    }

    reservation.status = status || reservation.status;
    const updated = await reservation.save();

    const customer = await User.findById(reservation.user_id)
      .select("name email phone");

    res.json({ message: "อัปเดตสถานะสำเร็จ", reservation: updated, customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

export default router;
