const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/level/:levelId/hints", async (req, res) => {
    try {
        const levelId = Number(req.params.levelId);

        const hints = await prisma.level_hints.findMany({
            where: {
                level_id: levelId,
            },
            orderBy: {
                hint_order: "asc",
            },
        });

        res.json(hints);
    } catch (error) {
        console.error("Error fetching level hints:", error);

        res.status(500).json({
            message: "Failed to fetch level hints",
            error: error.message,
        });
    }
});

module.exports = router;