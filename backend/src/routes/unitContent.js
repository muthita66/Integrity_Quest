const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/:unitId/contents", async (req, res) => {
    try {
        const unitId = Number(req.params.unitId);

        const parent = await prisma.unit_contents.findFirst({
            where: {
                unit_id: unitId,
                parent_id: null,
            },
        });

        if (!parent) {
            return res.status(404).json({
                error: "Unit not found",
            });
        }

        const cards = await prisma.unit_contents.findMany({
            where: {
                unit_id: unitId,
                parent_id: parent.content_id,
            },
            orderBy: {
                order_number: "asc",
            },
        });

        res.json({
            header: parent,
            cards,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Server Error",
        });
    }
});

module.exports = router;