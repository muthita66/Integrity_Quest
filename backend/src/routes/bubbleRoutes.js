const express = require("express");

const router = express.Router();

const bubbleController = require(
    "../controllers/bubbleController"
);

router.get(
    "/level/:levelId",
    bubbleController.getBubblesByLevel
);

module.exports = router;