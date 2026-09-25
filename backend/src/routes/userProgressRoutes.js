const express = require("express");
const router = express.Router();

const userProgressController =
    require("../controllers/userProgressController");

const authMiddleware =
    require("../../middleware/authMiddleware");

// ============================================================
// GET USER PROGRESS
// ============================================================
// ใช้สำหรับ MapPage
// ดึง Progress ของ Unit และ Level ของ User ที่ Login อยู่
// ============================================================

router.get(
    "/",
    authMiddleware,
    userProgressController.getUserProgress
);

module.exports = router;