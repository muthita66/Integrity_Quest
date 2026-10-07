const express = require("express");
const router = express.Router();
const { respond, special } = require("../controllers/crisisGameController");
const authenticateToken = require("../../middleware/authMiddleware");
router.use(authenticateToken);

// เลือกตัวเลือก / เหตุการณ์หลุดมือ
router.post("/respond", respond);
// เหตุการณ์พิเศษ (ข่าวปลอม / วันคุณธรรม / ครูเวรมาช่วย)
router.post("/special", special);
module.exports = router;