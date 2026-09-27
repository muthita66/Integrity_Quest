const express = require("express");
const router = express.Router();

const { respond, special } = require("../controllers/crisisGameController");

const authenticateToken = require("../../middleware/authMiddleware");

/**
 * Routes สำหรับ Crisis Response (Unit 6 Level 1 : รับมือวิกฤตในโรงเรียน)
 * Base URL: /api/crisis-game
 *
 * ทุก route ต้อง login (ส่ง Authorization: Bearer <token>)
 */

router.use(authenticateToken);

// เลือกตัวเลือก / เหตุการณ์หลุดมือ
router.post("/respond", respond);

// เหตุการณ์พิเศษ (ข่าวปลอม / วันคุณธรรม / ครูเวรมาช่วย)
router.post("/special", special);

module.exports = router;