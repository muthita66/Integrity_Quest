const express = require("express");
const router = express.Router();
const { spin, getPlay } = require("../controllers/slotGameController");
const authenticateToken = require("../../middleware/authMiddleware");

router.use(authenticateToken);
// หมุน 1 ครั้ง — body: { playId, bet }
router.post("/spin", spin);
// สรุป + ประวัติการหมุนของรอบนี้
router.get("/play/:playId", getPlay);
module.exports = router;