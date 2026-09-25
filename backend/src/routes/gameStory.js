const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/level/:levelId", async (req, res) => {
    try {
        const levelId = Number(req.params.levelId);

        console.log("Fetching game story for level:", levelId);

        if (Number.isNaN(levelId)) {
            return res.status(400).json({
                message: "levelId ไม่ถูกต้อง",
            });
        }

        const stories = await prisma.game_story.findMany({
            where: {
                level_id: levelId,
            },
            orderBy: {
                story_order: "asc",
            },
        });

        console.log("Stories:", stories);

        res.json(stories);

    } catch (error) {
        console.error("================================");
        console.error("GAME STORY ERROR:");
        console.error(error);
        console.error("================================");

        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูล Story ได้",
            error: error.message,
        });
    }
});

module.exports = router;