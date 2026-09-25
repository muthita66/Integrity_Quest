const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

router.get("/level/:levelId", async (req, res) => {
    try {
        const levelId = Number(req.params.levelId);

        const questions = await prisma.comparison_questions.findMany({
            where: {
                level_id: levelId,
            },
            orderBy: {
                question_order: "asc",
            },
            include: {
                items_comparison_questions_left_item_idToitems: true,
                items_comparison_questions_right_item_idToitems: true,
            },
        });

        res.json(questions);
    } catch (error) {
        console.error("Error fetching comparison questions:", error);

        res.status(500).json({
            message: "Failed to fetch comparison questions",
            error: error.message,
        });
    }
});

module.exports = router;