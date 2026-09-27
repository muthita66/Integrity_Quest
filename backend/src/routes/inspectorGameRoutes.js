const express = require("express");
const router = express.Router();

const { decide } = require("../controllers/inspectorGameController");

const authenticateToken = require("../../middleware/authMiddleware");

/**
 * Routes สำหรับ Integrity Inspector (Unit 5 Level 3 : ตัดสินใจเพื่อประชาชน)
 * Base URL: /api/inspector-game
 *
 * ทุก route ต้อง login (ส่ง Authorization: Bearer <token>)
 */

router.use(authenticateToken);

// ตัดสิน 1 โครงการ — body: { playId, projectId, action, tookBribe, refusedBribe }
router.post("/decide", decide);

module.exports = router;