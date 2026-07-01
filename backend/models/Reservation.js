

// backend/models/Reservation.js
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reservation_time: { type: Date, required: true },
  reservation_hour: { type: String, required: true },
  number_of_people: { type: Number, required: true },
  rescheduleCount: { type: Number, default: 0 },
  total_price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["รอดำเนินการ", "รอยืนยัน", "ชำระเงินเรียบร้อย", "ยกเลิก"], 
    default: "รอดำเนินการ" 
  },

  checkin_status: {
    type: String,
    enum: ["กำลังมา", "เช็คอินแล้ว", "ยกเลิกเช็คอิน"],
    default: "กำลังมา"
  },

  allergies: [String],
  selected_menu: [String],
  course_name: String,
  course_price: Number,

  // ✅ เพิ่มสองฟิลด์นี้
  emailSent: { type: Boolean, default: false },
  notified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Reservation", reservationSchema);
