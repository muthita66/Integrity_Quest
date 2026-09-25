const express = require("express");
const router = express.Router();
const levelResultController = require(
    "../controllers/levelResultController"
);

// GET RESULT MESSAGE
router.get(
    "/:levelId/:status",
    levelResultController.getResultMessage
);

module.exports = router;