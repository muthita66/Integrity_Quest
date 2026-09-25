const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/level/:levelId/items", async (req, res) => {
    try {
        const levelId = Number(req.params.levelId);

        if (Number.isNaN(levelId)) {
            return res.status(400).json({
                message: "levelId ไม่ถูกต้อง",
            });
        }

        const levelItems = await prisma.level_items.findMany({
            where: {
                level_id: levelId,
            },
            orderBy: {
                id: "asc",
            },
            include: {
                items: {
                    select: {
                        items_id: true,
                        name: true,
                        image: true,
                    },
                },
                item_types: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
            },
        });

        const items = levelItems.map((levelItem) => ({
            item_id: levelItem.items.items_id,
            name: levelItem.items.name,
            image: levelItem.items.image,
            item_type_id: levelItem.item_type_id,
            item_type: levelItem.item_types.code,
            quantity: levelItem.quantity,
            is_required: levelItem.is_required,
        }));

        res.json(items);

    } catch (error) {
        console.error("Error fetching level items:", error);

        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูล Items ได้",
        });
    }
});

module.exports = router;