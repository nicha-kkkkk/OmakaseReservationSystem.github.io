// backend/routes/ongoingRoutes.js
import express from "express";
import Reservation from "../models/Reservation.js";
import jwtAuth from "../middleware/jwtAuth.js";


/**
 * @swagger
 * /ongoing/info/ongoing/{date}/{month}/{year}:
 *   get:
 *     summary: ดึงข้อมูลการจองรายวัน (Ongoing)
 *     description: ใช้สำหรับดึงข้อมูลการจองของวันที่กำหนด เพื่อแสดงในหน้าตาราง ongoing
 *     tags: [Ongoing]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: integer
 *         description: วันที่ (เช่น 8)
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: เดือน (เช่น 11)
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: ปี (เช่น 2025)
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 dataOngoing:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                       reservation_time:
 *                         type: string
 *                       number_of_people:
 *                         type: number
 *                       course_name:
 *                         type: string
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */

const router = express.Router();

router.get("/info/ongoing/:date/:month/:year",jwtAuth, async (req, res) => {
  try {
    const { date, month, year } = req.params;
    console.log(date, month, year);
    const data = await Reservation.find({
      "reservation_date.day": Number(date),
      "reservation_date.month": Number(month),
      "reservation_date.year": Number(year),
    });
    res.json({ dataOngoing: data, status: "success" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;