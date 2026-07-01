// backend/routes/foodRoutes.js
import express from "express";
import multer from "multer";
import FoodCourse from "../models/FoodCourse.js";


/**
 * @swagger
 * /food/admin/food/{id}:
 *   get:
 *     summary: ดึงข้อมูลคอร์สหรืออาหาร
 *     description: 
 *       - ถ้า id = 0 ⇒ ดึงเฉพาะชื่อคอร์ส (เช่น 499, 699, 899)
 *       - ถ้า id ≠ 0 ⇒ ดึงรายการอาหารของคอร์สนั้น
 *     tags: [Food]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: หมายเลขคอร์ส (0 = ดึงทั้งหมด)
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dataPrice:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                 dataFood:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       list_foods:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             food_name:
 *                               type: string
 *                             food_img:
 *                               type: string
 *       500:
 *         description: Internal Server Error
 *
 * /food/admin/food/{courseName}:
 *   put:
 *     summary: อัปเดตรายชื่อและรูปภาพอาหารในคอร์ส
 *     tags: [Food]
 *     parameters:
 *       - in: path
 *         name: courseName
 *         required: true
 *         schema:
 *           type: string
 *         description: ชื่อคอร์ส เช่น "499", "699", "899"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string ของข้อมูลอาหารที่ต้องการอัปเดต
 *               food_img:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Updated successfully
 *       400:
 *         description: Missing data
 *       500:
 *         description: Internal Server Error
 */


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });


// ✅ GET: ราคาและอาหาร
router.get("/admin/food/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    if (id === 0) {
      const dataPrice = await FoodCourse.find({}, "name");
      return res.json({ dataPrice });
    } else {
      const dataFood = await FoodCourse.find({ name: id }, "list_foods");
      return res.json({ dataFood });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ✅ PUT: อัปเดตชื่อและรูป
router.put(
  "/admin/food/:courseName",
  upload.fields([
    { name: "food_img" },
    { name: "data", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("🟢 PUT /admin/food", req.params.courseName);
      console.log("📦 req.body:", req.body);
      console.log("📸 req.files:", req.files);

      if (!req.body || !req.body.data) {
        return res.status(400).json({
          message: "❌ Missing 'data' in FormData",
          body: req.body,
        });
      }

      const updates = JSON.parse(req.body.data);
      const files = req.files["food_img"] || [];

      for (const item of updates) {
        const updateFields = {};

        if (item.food_name)
          updateFields["list_foods.$.food_name"] = item.food_name;

        const file = item.fileName
          ? files.find(
              (f) =>
                f.originalname.toLowerCase().trim() ===
                item.fileName.toLowerCase().trim()
            )
          : null;
        if (file) {
          updateFields["list_foods.$.food_img"] = {
            filename: file.originalname,
            mimeType: file.mimetype,
            base64: file.buffer.toString("base64"),
          };
        }

        await FoodCourse.updateOne(
          {
            $or: [
              { name: req.params.courseName },
              { name: Number(req.params.courseName) }
            ],
            "list_foods.food_id": item.food_id
          },
          { $set: updateFields }
        );
      }


      const updated = await FoodCourse.findOne(
      {
        $or: [
          { name: req.params.courseName },
          { name: Number(req.params.courseName) }
        ]
      },
      "list_foods"
    );

      res.json({
        message: "✅ Updated successfully",
        updated: updated.list_foods,
      });
    } catch (err) {
      console.error("❌ Update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


export default router;
