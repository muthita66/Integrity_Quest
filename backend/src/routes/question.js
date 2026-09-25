const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/level/:levelId", async (req, res) => {
    try {
        const levelId = Number(req.params.levelId);

        if (Number.isNaN(levelId)) {
            return res.status(400).json({
                message: "levelId ไม่ถูกต้อง",
            });
        }

        const questions = await prisma.question.findMany({
            where: {
                level_id: levelId,
            },
            orderBy: {
                question_order: "asc",
            },
            include: {
                choice: {
                    orderBy: {
                        choice_id: "asc",
                    },
                },
            },
        });

        res.json(questions);

    } catch (error) {
        console.error("Error fetching questions:", error);

        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูลคำถามได้",
        });
    }
});

module.exports = router;