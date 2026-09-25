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

// level_id ของ Unit 3 FinalLevel (Treasurer)
const TREASURER_LEVEL_ID = 10;

// =====================================================
// หลังส่งผล /complete สำเร็จ → sync Progress + IP
// (ใช้ res.on("finish") เพราะ completeTreasurerGame ส่ง response เอง)
// =====================================================
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

// =====================================================
// โหลดข้อมูล FinalLevel จาก Database
// =====================================================
router.get(
    "/data",
    finalLevelController.getFinalLevelData
);

// =====================================================
// Unit 3 FinalLevel : Treasurer
// เดิมมีแค่ POST /result ที่เชื่อค่าจาก client ทั้งหมด — เปลี่ยนเป็น
// 4 endpoint นี้แทน ทุก action ที่กระทบเงิน/คะแนน/ผลจบเกม คำนวณที่
// backend จากข้อมูลจริงใน DB เท่านั้น (ดู finalLevelController.js)
// =====================================================

// ชำระเงิน (checkout ตะกร้า) — ตรวจราคา/งบ/เงินสำรองจาก DB ทั้งหมด
router.post(
    "/checkout",
    authMiddleware,
    finalLevelController.checkoutCart
);

// เก็บ/ไม่เก็บใบเสร็จ แล้วสุ่ม Event ต่อ (ถ้ามี)
router.post(
    "/receipt/decide",
    authMiddleware,
    finalLevelController.decideReceipt
);

// ตอบ Event — รับแค่ event_id/choice_id ผลกระทบอ่านจาก DB เท่านั้น
router.post(
    "/event/apply",
    authMiddleware,
    finalLevelController.applyEventChoice
);

// จบเกม — คำนวณ score/grade/success/IP จากข้อมูลจริงใน DB เท่านั้น
// (แทนที่ POST /result เดิม) + sync Progress/IP หลังจบ
router.post(
    "/complete",
    authMiddleware,
    syncAfterComplete,
    finalLevelController.completeTreasurerGame
);

// =====================================================
// โหลดข้อมูล Final Case เดิม (Unit 1 FinalLevel)
// =====================================================
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