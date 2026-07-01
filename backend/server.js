// backend/server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import adminReservationRoutes from "./routes/adminReservation.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();
const app = express();

// ─────── Middleware ───────
app.use(cors({
  origin: ["http://127.0.0.1:5500","http://127.0.0.1:5501","http://localhost:5500","https://nicha-kkkkk.github.io"],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────── Rate limiter ───────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "ส่งคำขอมากเกินไป กรุณาลองใหม่ภายหลัง" }
});
app.use("/api/", limiter);

// ─────── Test route ───────
app.get("/", (req, res) => res.json({ message: "Kitsune API OK" }));

// ─────── Routes ───────
// ⚠️ วาง authRoutes ก่อน foodRoutes
app.use("/api", authRoutes);
app.use("/api", foodRoutes);
app.use("/api", staffRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/admin/reservations", adminReservationRoutes);
app.use("/api/admin/reservations/notifications", notificationRoutes);

// ─────── Swagger Docs ───────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KITSUNE OMAKASE API",
      version: "1.0.0",
      description: "API เอกสารระบบ Omakase (Auth, Courses, Upload)",
    },
    servers: [
      {
        url: "http://127.0.0.1:8080",
        description: "Local Dev Server",
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log("📘 Swagger UI: http://127.0.0.1:8080/api-docs");

// ─────── Database ───────
const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/kitsune";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ─────── Start server ───────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on http://127.0.0.1:${PORT}`));
