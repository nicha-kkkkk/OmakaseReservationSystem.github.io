// backend/models/staff.js
import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },


  // password reset
  resetPasswordTokenHash: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true }

);

export default mongoose.model('staff', staffSchema,"staff");