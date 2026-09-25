const prisma = require("../lib/prisma");

exports.getBubblesByLevel = async (req, res) => {
    try {
        const { levelId } = req.params;

        const bubbles = await prisma.bubbles.findMany({
            where: {
                level_id: Number(levelId),
                is_active: true,
            },
            orderBy: {
                bubble_id: "asc",
            },
        });

        res.json(bubbles);
    } catch (error) {
        console.error(
            "Get bubbles error:",
            error
        );

        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูล Bubble ได้",
            error: error.message,
        });
    }
};