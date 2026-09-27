const express = require("express");
const router = express.Router();

const {
    recordAnswer,
    getHistory,
    getSummary,
    checkComplete,
    getUserStats,
    getAnswer,
    deleteGameHistory,
} = require("../controllers/slipHuntController");

const authenticateToken = require("../../middleware/authMiddleware");

/**
 * Routes สำหรับ Slip Hunt Game (Unit 4 Level 1)
 * Base URL: /api/slip-hunt
 *
 * ทุก route ต้อง login (ส่ง Authorization: Bearer <token>)
 * และเข้าถึงได้เฉพาะรอบการเล่นของตัวเอง (อาจารย์ดูได้ทุกคน)
 *
 * Flow:
 * 1. POST /api/game-play/start        { level_id }     → play_id
 * 2. POST /api/slip-hunt/answer        ทีละสลิป (5 ครั้ง)
 * 3. POST /api/game-play/complete      { play_id }      → ผล + IP
 * 4. GET  /api/slip-hunt/play/:playId  ใช้แสดงหน้า Result
 */

router.use(authenticateToken);

// บันทึกคำตอบ 1 สลิป
// body: { playId, slipId, slipOrder (1-5), playerChoice: "real" | "fake" }
router.post("/answer", recordAnswer);

// ประวัติคำตอบของรอบนี้ (หน้า Result)
router.get("/play/:playId", getHistory);

// สรุปผลของรอบนี้
router.get("/summary/:playId", getSummary);

// ตอบครบ 5 สลิปหรือยัง
router.get("/check/:playId", checkComplete);

// ประวัติทั้งหมดของผู้เล่น (ตัวเอง หรืออาจารย์) ?levelId=
router.get("/user/:userId", getUserStats);

// คำตอบ 1 สลิป
router.get("/answer/:playSlipId", getAnswer);

// ล้างคำตอบของรอบที่ยังไม่จบ (เริ่มใหม่)
router.delete("/play/:playId", deleteGameHistory);

module.exports = router;