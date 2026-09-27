const express = require("express");
const router = express.Router();
const { answer } = require("../controllers/wordGameController");
const authenticateToken = require("../../middleware/authMiddleware");
router.use(authenticateToken);

// ตรวจคำตอบ 1 ครั้ง (กด Enter) — body: { playId, wordId, text }
router.post("/answer", answer);
module.exports = router;