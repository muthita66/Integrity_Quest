const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/level/:levelId", async (req, res) => {
    try {
        const levelId = Number(req.params.levelId);

        const scenes = await prisma.introScene.findMany({
            where: {
                level_id: levelId,
            },

            orderBy: {
                scene_order: "asc",
            },

            include: {
                introDialog: {
                    orderBy: {
                        dialog_order: "asc",
                    },
                },

                sceneMission: {
                    include: {
                        sceneMissionRules: {
                            orderBy: {
                                id: "asc",
                            },
                        },
                    },
                },
            },
        });

        res.json(scenes);

    } catch (error) {

        console.error(
            "Error fetching intro scenes:",
            error
        );

        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูล Scene ได้",
        });
    }
});

module.exports = router;