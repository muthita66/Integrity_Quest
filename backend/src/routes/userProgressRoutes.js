const express = require("express");
const router = express.Router();

const userProgressController =
    require("../controllers/userProgressController");

const authMiddleware =
    require("../../middleware/authMiddleware");
const certificateController = require('../controllers/certificateController');
router.get('/certificate', authMiddleware, certificateController.getCertificate);
router.post('/reflection-complete', authMiddleware, certificateController.completeReflection);

router.get(
    "/",
    authMiddleware,
    userProgressController.getUserProgress
);

module.exports = router;
