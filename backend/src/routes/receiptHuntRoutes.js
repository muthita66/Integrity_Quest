const express = require("express");
const router = express.Router();

const receiptHuntController = require("../controllers/receiptHuntController");
const { syncLevelResult } = require("../controllers/levelSyncController");

// ================= Unit 3 Level 1 : Receipt Hunt =================

// เริ่มเกม Receipt Hunt
router.post(
    "/start/:playId",
    async (req, res) => {
        try {
            const { playId } = req.params;

            if (!playId) {
                return res.status(400).json({
                    message: "ไม่พบ play_id",
                });
            }

            const result =
                await receiptHuntController.startReceiptHunt(
                    Number(playId)
                );

            return res.status(201).json({
                message: "เริ่มเกม Receipt Hunt สำเร็จ",
                data: result,
            });
        } catch (error) {
            console.error(
                "Receipt Hunt Start Error:",
                error
            );

            return res.status(500).json({
                message: "ไม่สามารถเริ่มเกม Receipt Hunt ได้",
                error: error.message,
            });
        }
    }
);

// เลือก Receipt
router.post(
    "/select",
    async (req, res) => {
        try {
            const {
                play_id,
                play_item_id,
            } = req.body;

            if (!play_id || !play_item_id) {
                return res.status(400).json({
                    message: "กรุณาระบุ play_id และ play_item_id",
                });
            }

            const result =
                await receiptHuntController.selectReceipt(
                    Number(play_id),
                    Number(play_item_id)
                );

            return res.status(200).json({
                message: result.is_correct
                    ? "เลือกถูกต้อง"
                    : "เลือกไม่ถูกต้อง",
                data: result,
            });
        } catch (error) {
            console.error(
                "Receipt Hunt Select Error:",
                error
            );

            return res.status(400).json({
                message: "ไม่สามารถเลือก Receipt ได้",
                error: error.message,
            });
        }
    }
);

// จบเกม Receipt Hunt
router.post(
    "/complete",
    async (req, res) => {
        try {
            const { play_id } = req.body;

            if (!play_id) {
                return res.status(400).json({
                    message: "กรุณาระบุ play_id",
                });
            }

            const result =
                await receiptHuntController.completeReceiptHunt(
                    Number(play_id)
                );

            if (!result.is_completed) {
                return res.status(400).json({
                    message: "ยังเก็บ Receipt ไม่ครบ",
                    data: result,
                });
            }

            // บันทึก Progress (ปลดล็อกด่านถัดไป) + คำนวณ IP แบบคะแนนดีที่สุด
            const progress = await syncLevelResult(Number(play_id));

            return res.status(200).json({
                message: "จบเกม Receipt Hunt สำเร็จ",
                data: result,
                progress,
            });
        } catch (error) {
            console.error(
                "Receipt Hunt Complete Error:",
                error
            );

            return res.status(400).json({
                message: "ไม่สามารถจบเกม Receipt Hunt ได้",
                error: error.message,
            });
        }
    }
);

module.exports = router;