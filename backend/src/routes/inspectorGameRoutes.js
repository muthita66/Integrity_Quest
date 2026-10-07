const express = require("express");
const router = express.Router();
const { decide } = require("../controllers/inspectorGameController");
const authenticateToken = require("../../middleware/authMiddleware");
router.use(authenticateToken);

// ตัดสิน 1 โครงการ — body: { playId, projectId, action, tookBribe, refusedBribe }
router.post("/decide", decide);

module.exports = router;