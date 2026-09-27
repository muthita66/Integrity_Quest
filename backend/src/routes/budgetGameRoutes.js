const express = require("express");
const router = express.Router();

const { submit, getPlay } = require("../controllers/budgetGameController");

const authenticateToken = require("../../middleware/authMiddleware");

/**
 * Routes สำหรับ Budget Game (Unit 5 Level 2 : จัดสรรงบประมาณให้เมือง)
 * Base URL: /api/budget-game
 *
 * ทุก route ต้อง login (ส่ง Authorization: Bearer <token>)
 */

router.use(authenticateToken);

// ส่งการจัดสรรงบ — body: { playId, budgets }
router.post("/submit", submit);

// งบที่จัดสรร + คะแนน (หน้า Result)
router.get("/play/:playId", getPlay);

module.exports = router;