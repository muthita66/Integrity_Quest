const express = require("express");
const router = express.Router();

const userProgressController =
    require("../controllers/userProgressController");

const authMiddleware =
    require("../../middleware/authMiddleware");
const certificateController = require('../controllers/certificateController');
router.get('/certificate', authMiddleware, certificateController.getCertificate);
router.post('/reflection-complete', authMiddleware, certificateController.completeReflection);

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
