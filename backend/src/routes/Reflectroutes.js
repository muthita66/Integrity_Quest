const express = require("express");
const router = express.Router();

const reflectController = require("../controllers/reflectController");
const authMiddleware = require("../../middleware/authMiddleware");

// ============================================================
// Unit 6 Level 3 : ShadowMirror (กระจกสะท้อนใจ)
// ============================================================
//
// ต้องเรียก POST /api/game-play/start (ด้วย level_id ของ ShadowMirror
// — level_id = 19 ตาม DB ปัจจุบัน) ก่อนเสมอ เพื่อให้ได้ play_id แล้ว
// ค่อยส่งคำตอบทั้ง 6 ข้อมาที่ endpoint นี้
// ============================================================

router.post("/", authMiddleware, reflectController.submitReflection);

module.exports = router;