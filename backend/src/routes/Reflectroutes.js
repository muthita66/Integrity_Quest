const express = require("express");
const router = express.Router();
const reflectController = require("../controllers/reflectController");
const authMiddleware = require("../../middleware/authMiddleware");
router.post("/", authMiddleware, reflectController.submitReflection);

module.exports = router;