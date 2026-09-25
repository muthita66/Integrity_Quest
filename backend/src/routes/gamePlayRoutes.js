const express = require("express");
const router = express.Router();

const gamePlayController = require("../controllers/gamePlayController");
const needWantController = require("../controllers/needWantController");
const comparisonController = require("../controllers/comparisonController");

const authMiddleware = require("../../middleware/authMiddleware");

// ทดสอบว่า Route ถูกโหลด
console.log("Game Play Route: POST /start registered");

router.post(
    "/start",
    authMiddleware,
    gamePlayController.startGame
);

router.post(
    "/answer",
    authMiddleware,
    gamePlayController.answerGame
);

router.post(
    "/complete",
    authMiddleware,
    gamePlayController.completeGame
);

router.post(
    "/bubble/shoot",
    authMiddleware,
    gamePlayController.shootBubble
);

router.post(
    "/case/start",
    authMiddleware,
    gamePlayController.startCaseAttempt
);

router.post(
    "/case/complete",
    authMiddleware,
    gamePlayController.completeCaseAttempt
);

router.post(
    "/case/items",
    authMiddleware,
    gamePlayController.saveCaseItems
);

router.post(
    "/case/retry",
    authMiddleware,
    gamePlayController.retryCaseAttempt
);

router.post(
    "/need-want",
    authMiddleware,
    needWantController.saveNeedWant
);

router.post(
    "/comparison",
    authMiddleware,
    comparisonController.saveComparisonAnswer
);

module.exports = router;
