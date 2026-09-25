const express = require("express");

const router = express.Router();

const { heartbeat } = require("../controllers/activityController");

const authenticateToken = require("../../middleware/authMiddleware");

// POST /api/activity/heartbeat (หน้าเว็บส่งทุก 1 นาทีที่ใช้งานจริง)
router.post("/heartbeat", authenticateToken, heartbeat);

module.exports = router;