const prisma = require("../lib/prisma");
const gamePlayService = require("../services/gamePlayService");

// ============================================================
// Integrity Inspector (Unit 5 Level 3 : ตัดสินใจเพื่อประชาชน)
// ------------------------------------------------------------
// ทุก route ต้อง login (authenticateToken ใน inspectorGameRoutes)
//
// Flow:
// 1. POST /api/game-play/start        { level_id: 16 } → play_id + projects
// 2. POST /api/inspector-game/decide  ทุกครั้งที่ปั๊มตรา
//    body: { playId, projectId, action: "approve"|"reject",
//            tookBribe, refusedBribe }
//    → backend ตัดสินถูก/ผิด + คิดคะแนน + บันทึก
// 3. ตัดสินครบ / หมดเวลา → POST /api/game-play/complete
//    { play_id, is_timeout } → คะแนน / Rank / IP
// ============================================================

const parseId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

/** POST /api/inspector-game/decide */
const decide = async (req, res) => {
    try {
        const playId = parseId(req.body.playId);
        const projectId = parseId(req.body.projectId);

        if (!playId || !projectId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ playId และ projectId",
            });
        }

        const play = await prisma.game_play_history.findUnique({
            where: { play_id: playId },
            select: {
                play_id: true,
                user_id: true,
                level_id: true,
                completed_at: true,
            },
        });

        if (!play) {
            return res.status(404).json({ success: false, message: "ไม่พบรอบการเล่นนี้" });
        }

        if (play.user_id !== Number(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "ไม่มีสิทธิ์เล่นในรอบการเล่นนี้",
            });
        }

        if (!gamePlayService.isInspectorLevel(play.level_id)) {
            return res.status(400).json({
                success: false,
                message: "รอบการเล่นนี้ไม่ใช่ด่าน Integrity Inspector",
            });
        }

        if (play.completed_at) {
            return res.status(400).json({
                success: false,
                message: "เกมนี้จบแล้ว กรุณาเริ่มรอบใหม่",
            });
        }

        const result = await gamePlayService.recordProjectDecision(
            play,
            projectId,
            String(req.body.action || "").toLowerCase(),
            req.body.tookBribe === true,
            req.body.refusedBribe === true
        );

        if (!result.ok) {
            return res.status(result.status).json({
                success: false,
                message: result.message,
            });
        }

        const { ok, ...data } = result;

        return res.status(201).json({ success: true, data });
    } catch (error) {
        console.error("Error in inspector decide:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = { decide };