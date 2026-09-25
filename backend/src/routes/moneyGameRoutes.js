const express = require("express");
const router = express.Router();

const moneyGameController = require("../controllers/moneyGameController");
const { syncLevelResult } = require("../controllers/levelSyncController");

// =====================================================
// Unit 3 Level 2 : Money Game
// =====================================================

// เริ่มเกม
router.post(
    "/start/:playId",
    async (req, res) => {
        try {
            const playId = Number(req.params.playId);

            if (!Number.isInteger(playId)) {
                return res.status(400).json({
                    message: "playId ไม่ถูกต้อง",
                });
            }

            const data =
                await moneyGameController.startMoneyGame(
                    playId
                );

            return res.status(200).json({
                message: "เริ่มเกมแยกเงินสำเร็จ",
                data,
            });
        } catch (error) {
            console.error(
                "Start Money Game Error:",
                error
            );

            return res.status(400).json({
                message: error.message,
            });
        }
    }
);

// เลือกประเภทเงิน
router.post(
    "/classify",
    async (req, res) => {
        try {
            const {
                play_id,
                item_id,
                selected_type_id,
            } = req.body;

            if (
                play_id === undefined ||
                item_id === undefined ||
                selected_type_id === undefined
            ) {
                return res.status(400).json({
                    message:
                        "กรุณาระบุ play_id, item_id และ selected_type_id",
                });
            }

            const data =
                await moneyGameController.classifyMoney(
                    Number(play_id),
                    Number(item_id),
                    Number(selected_type_id)
                );

            return res.status(200).json({
                message: data.is_correct
                    ? "จัดประเภทเงินถูกต้อง"
                    : "จัดประเภทเงินไม่ถูกต้อง",
                data,
            });
        } catch (error) {
            console.error(
                "Classify Money Error:",
                error
            );

            return res.status(400).json({
                message: error.message,
            });
        }
    }
);

// จบเกม
router.post(
    "/complete",
    async (req, res) => {
        try {
            const { play_id } = req.body;

            if (play_id === undefined) {
                return res.status(400).json({
                    message: "กรุณาระบุ play_id",
                });
            }

            const data =
                await moneyGameController.completeMoneyGame(
                    Number(play_id)
                );

            // บันทึก Progress (ปลดล็อกด่านถัดไป) + คำนวณ IP แบบคะแนนดีที่สุด
            const progress = await syncLevelResult(Number(play_id));

            return res.status(200).json({
                message: "จบเกมแยกเงินสำเร็จ",
                data,
                progress,
            });
        } catch (error) {
            console.error(
                "Complete Money Game Error:",
                error
            );

            return res.status(400).json({
                message: error.message,
            });
        }
    }
);

// หมดเวลา / แพ้
router.post(
    "/fail",
    async (req, res) => {
        try {
            const { play_id } = req.body;

            if (play_id === undefined) {
                return res.status(400).json({
                    message: "กรุณาระบุ play_id",
                });
            }

            const data =
                await moneyGameController.failMoneyGame(
                    Number(play_id)
                );

            // บันทึกว่าเล่นแล้วแต่ไม่ผ่าน (ถ้าเคยผ่านแล้วจะไม่ลดสถานะ)
            const progress = await syncLevelResult(Number(play_id));

            return res.status(200).json({
                message: "เกมแยกเงินสิ้นสุด",
                data,
                progress,
            });
        } catch (error) {
            console.error(
                "Fail Money Game Error:",
                error
            );

            return res.status(400).json({
                message: error.message,
            });
        }
    }
);

module.exports = router;