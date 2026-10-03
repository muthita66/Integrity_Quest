const express = require("express");

const router = express.Router();

const {
    requireTeacher,
    getDashboard,
    getStudentProgress,
    getLevelPlayDetail,
    addGroup,
    deleteGroup,
} = require("../controllers/teacherController");

const authenticateToken = require("../../middleware/authMiddleware");

// ทุก route ของอาจารย์: ต้อง login + ต้องเป็นอาจารย์
router.use(authenticateToken, requireTeacher);

// GET /api/teacher/dashboard?scope=all|group:<group_id>
router.get("/dashboard", getDashboard);

// POST /api/teacher/groups (เพิ่มกลุ่มนักเรียนที่ดูแล — ปุ่ม "+ เพิ่มกลุ่ม")
router.post("/groups", addGroup);

// DELETE /api/teacher/groups/:id (ลบกลุ่มนักเรียนที่ดูแล — ปุ่มสามจุด → "ลบกลุ่มนี้")
router.delete("/groups/:id", deleteGroup);

// GET /api/teacher/students/:id/progress (รายละเอียดรายบท/รายด่าน)
router.get("/students/:id/progress", getStudentProgress);

// GET /api/teacher/students/:id/levels/:levelId/latest (คำตอบรอบล่าสุด)
router.get("/students/:id/levels/:levelId/latest", getLevelPlayDetail);

module.exports = router;