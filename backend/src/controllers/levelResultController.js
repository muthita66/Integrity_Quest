const prisma = require("../lib/prisma");

// ============================================================
// GET RESULT MESSAGE
// GET /api/level-result/:levelId/:status
// ============================================================

exports.getResultMessage = async (req, res) => {
    try {
        const { levelId, status } = req.params;

        const parsedLevelId = Number(levelId);
        const resultStatus = String(status).trim().toUpperCase();

        // ========================================================
        // ตรวจสอบ level_id
        // ========================================================

        if (!Number.isInteger(parsedLevelId) || parsedLevelId <= 0) {
            return res.status(400).json({
                message: "levelId ต้องเป็นจำนวนเต็มที่ถูกต้อง",
            });
        }

        // ========================================================
        // ตรวจสอบ status
        // ========================================================

        const allowedStatuses = [
            "PERFECT",
            "GREAT",
            "PASS",
            "FAIL",
            "MASTER",
            "EXPERT",
            "NOVICE",
            "TRAINEE",
            "GOLD",
            "SILVER",
            "BRONZE",
            // Unit 3 Level 2 : Money Game — แยก FAIL เป็น 2 สาเหตุ
            // (ตอบผิดบัญชี / หมดเวลา) เพราะข้อความที่ควรแสดงต่างกัน
            "FAIL_WRONG",
            "FAIL_TIMEOUT",
        ];

        if (!allowedStatuses.includes(resultStatus)) {
            return res.status(400).json({
                message: "status ไม่ถูกต้อง",
                allowed_statuses: allowedStatuses,
            });
        }

        // ========================================================
        // ดึงข้อมูล Result จาก Database
        // ========================================================

        const resultMessage =
            await prisma.level_result_messages.findUnique({
                where: {
                    level_id_status: {
                        level_id: parsedLevelId,
                        status: resultStatus,
                    },
                },
                select: {
                    id: true,
                    level_id: true,
                    status: true,
                    heading: true,
                    title: true,
                    description: true,
                    highlight_text: true,
                    message: true,
                    verdict_label: true,
                    character_image: true,
                    mirror_image: true,
                },
            });

        // ========================================================
        // ไม่พบข้อมูล
        // ========================================================

        if (!resultMessage) {
            return res.status(404).json({
                message: "ไม่พบข้อมูล Result ของ Level นี้",
                data: {
                    level_id: parsedLevelId,
                    status: resultStatus,
                },
            });
        }

        // ========================================================
        // ส่งข้อมูลกลับ
        // ========================================================

        return res.status(200).json({
            message: "ดึงข้อมูล Result สำเร็จ",
            data: resultMessage,
        });
    } catch (error) {
        console.error(
            "Get Result Message Error:",
            error
        );

        return res.status(500).json({
            message: "ไม่สามารถดึงข้อมูล Result ได้",
            error: error.message,
        });
    }
};