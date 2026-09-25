const express = require("express");
const router = express.Router();

const {
    getQuizzes,
    submitQuizAnswers,
    checkQuizStatus,
} = require("../controllers/quizController");
const authMiddleware = require("../../middleware/authMiddleware");

// GET /api/quizzes?type=pre_test
router.get("/quizzes", getQuizzes);

// GET /api/quiz-answers/status?type=pre_test  (เช็คว่าทำไปแล้วหรือยัง)
router.get("/quiz-answers/status", authMiddleware, checkQuizStatus);

// POST /api/quiz-answers
router.post("/quiz-answers", authMiddleware, submitQuizAnswers);

module.exports = router;