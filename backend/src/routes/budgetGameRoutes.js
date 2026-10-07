const express = require("express");
const router = express.Router();
const { submit, getPlay } = require("../controllers/budgetGameController");
const authenticateToken = require("../../middleware/authMiddleware");

router.use(authenticateToken);
// ส่งการจัดสรรงบ — body: { playId, budgets }
router.post("/submit", submit);

// งบที่จัดสรร + คะแนน (หน้า Result)
router.get("/play/:playId", getPlay);
module.exports = router;