

// backend/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["new_reservation", "reschedule","reschedule_confirmed"], 
    required: true 
  },

  reservation_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Reservation", 
    required: true 
  },

  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },

  // ✅ สถานะของการยืนยัน (เพิ่มใหม่)
  confirm_status: {
    type: String,
    enum: ["รอการยืนยัน", "ยืนยันแล้ว"],
    default: "รอการยืนยัน"
  },

  // ✅ ถ้าเป็นการเลื่อนจะเก็บข้อมูลวันเก่ากับวันใหม่ไว้ได้
  old_date: { type: Date },
  new_date: { type: Date },
  new_hour: { type: String },

  // ✅ ใช้ตรวจว่าอีเมลแจ้งเตือนไปแล้วหรือยัง
  emailSent: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
