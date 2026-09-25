const express = require("express");

const router = express.Router();

const {
    requireTeacher,
    getDashboard,
    getStudentProgress,
    getLevelPlayDetail,
} = require("../controllers/teacherController");

const authenticateToken = require("../../middleware/authMiddleware");

// ทุก route ของอาจารย์: ต้อง login + ต้องเป็นอาจารย์
router.use(authenticateToken, requireTeacher);

// GET /api/teacher/dashboard?scope=faculty|all
router.get("/dashboard", getDashboard);

// GET /api/teacher/students/:id/progress (รายละเอียดรายบท/รายด่าน)
router.get("/students/:id/progress", getStudentProgress);

// GET /api/teacher/students/:id/levels/:levelId/latest (คำตอบรอบล่าสุด)
router.get("/students/:id/levels/:levelId/latest", getLevelPlayDetail);

module.exports = router;