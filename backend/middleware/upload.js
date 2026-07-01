// backend/middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "_" + safe);
  },
});

const fileFilter = (_, file, cb) => {
  const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only PNG/JPG/WEBP allowed"), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
