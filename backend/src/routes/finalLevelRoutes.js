const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

const finalLevelController = require("../controllers/finalLevelController");
const authMiddleware = require("../../middleware/authMiddleware");
const {
    syncLevelResult,
    syncLatestPlay,
} = require("../controllers/levelSyncController");

const TREASURER_LEVEL_ID = 10;
const syncAfterComplete = (req, res, next) => {
    res.on("finish", () => {
        if (res.statusCode >= 400) return;

        const playId = Number(req.body?.play_id);

        if (Number.isInteger(playId) && playId > 0) {
            syncLevelResult(playId);
        } else if (req.user?.id) {
            syncLatestPlay(req.user.id, TREASURER_LEVEL_ID);
        }
    });

    next();
};

router.get(
    "/data",
    finalLevelController.getFinalLevelData
);

router.post(
    "/checkout",
    authMiddleware,
    finalLevelController.checkoutCart
);

router.post(
    "/receipt/decide",
    authMiddleware,
    finalLevelController.decideReceipt
);

router.post(
    "/event/apply",
    authMiddleware,
    finalLevelController.applyEventChoice
);

router.post(
    "/complete",
    authMiddleware,
    syncAfterComplete,
    finalLevelController.completeTreasurerGame
);

router.get("/:levelId", async (req, res) => {
    try {
        const levelId = Number(req.params.levelId);

        if (Number.isNaN(levelId)) {
            return res.status(400).json({
                message: "Invalid levelId",
            });
        }

        const cases = await prisma.final_cases.findMany({
            where: {
                level_id: levelId,
                is_active: true,
            },
            orderBy: {
                case_number: "asc",
            },
            include: {
                final_case_items: {
                    orderBy: {
                        item_order: "asc",
                    },
                    include: {
                        items: true,
                    },
                },

                question: {
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
                },
            },
        });

        res.json(cases);
    } catch (error) {
        console.error("Final Level API Error:", error);

        res.status(500).json({
            message: "ไม่สามารถโหลดข้อมูล Final Level ได้",
            error: error.message,
        });
    }
});

module.exports = router;