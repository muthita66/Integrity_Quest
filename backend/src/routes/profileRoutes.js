const express = require("express");

const router = express.Router();

const {
    getProfile,
    updateProfile,
    changePassword,
    getOverview,
    getDailyQuests,
    getLeaderboard,
    getTestStatusHandler,
} = require("../controllers/profileController");

const authenticateToken = require("../../middleware/authMiddleware");

// ข้อมูลของผู้ใช้ที่ login อยู่ (ต้องมี token ทุก route)
router.get("/", authenticateToken, getProfile);
router.get("/overview", authenticateToken, getOverview);
router.get("/daily-quests", authenticateToken, getDailyQuests);
router.get("/leaderboard", authenticateToken, getLeaderboard);
router.get("/test-status", authenticateToken, getTestStatusHandler);
router.put("/", authenticateToken, updateProfile);
router.put("/password", authenticateToken, changePassword);

module.exports = router;