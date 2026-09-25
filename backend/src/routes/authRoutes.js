const express = require("express");

const router = express.Router();

const {
    register,
    login,
    logout,
    getDepartments,
} = require("../controllers/authController");

const authenticateToken = require("../../middleware/authMiddleware");

// Register (นักเรียน / อาจารย์)
router.post("/register", register);

// Login
router.post("/login", login);

// รายชื่อภาควิชา (ฟอร์มสมัครอาจารย์)
router.get("/departments", getDepartments);

// Logout
router.post(
    "/logout",
    authenticateToken,
    logout
);

module.exports = router;