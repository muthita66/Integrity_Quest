const prisma = require("../lib/prisma");
const getSlipsByLevel = async (req, res) => {
    try {
        const { levelId } = req.params;

        const parsedLevelId = Number(levelId);

        if (!Number.isInteger(parsedLevelId)) {
            return res.status(400).json({
                success: false,
                message: "levelId ต้องเป็นตัวเลข",
            });
        }

        const slips = await prisma.$queryRaw`
            SELECT
                i.items_id AS id,
                i.items_id,
                i.name,
                i.image AS item_image,

                s.bank,
                s."from",
                s.amount,
                s.answer,
                s.image,
                s.clue

            FROM level_items li

            INNER JOIN items i
                ON i.items_id = li.item_id

            INNER JOIN slip_details s
                ON s.items_id = i.items_id

            WHERE li.level_id = ${parsedLevelId}

            ORDER BY i.items_id ASC
        `;

        return res.status(200).json({
            success: true,
            level_id: parsedLevelId,
            count: slips.length,
            data: slips,
        });
    } catch (error) {
        console.error("Get Slips By Level Error:", error);

        return res.status(500).json({
            success: false,
            message: "ไม่สามารถดึงข้อมูลสลิปได้",
            error: error.message,
        });
    }
};

module.exports = {
    getSlipsByLevel,
};