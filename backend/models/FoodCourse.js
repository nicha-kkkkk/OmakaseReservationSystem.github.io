// backend/models/FoodCourse.js
import mongoose from "mongoose";

const timeSchema = new mongoose.Schema({
  hour: { type: Number, required: true },
  minute: { type: Number, required: true }
});

const foodItemSchema = new mongoose.Schema({
  food_id: { type: Number, required: true },
  food_name: { type: String, required: true },
  food_img: {
    filename: { type: String },
    mimeType: { type: String },
    base64: { type: String },
  },
});

const foodCourseSchema = new mongoose.Schema({
  name: { type: Number, required: true },
  times: { type: [timeSchema], required: true },
  list_foods: { type: [foodItemSchema], required: true },

  // ✅ เพิ่ม maxSeats
  maxSeats: { type: Number, default: 10 } 
});

export default mongoose.model("FoodCourse", foodCourseSchema, "food_course");
