const express = require("express");
const router = express.Router();
const {
    getSlipsByLevel,
} = require("../controllers/slipController");
router.get("/level/:levelId", getSlipsByLevel);
module.exports = router;