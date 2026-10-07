const slipHuntService = require("../services/slipHuntService");
const gamePlayService = require("../services/gamePlayService");
const prisma = require("../lib/prisma");
const TOTAL_SLIPS = gamePlayService.SLIP_HUNT_TOTAL_SLIPS || 5;

const isTeacher = async (userId) =>
    (await prisma.teachers.count({ where: { user_id: Number(userId) } })) > 0;

// ตรวจว่าเข้าถึง play นี้ได้ไหม → คืน play หรือส่ง error แล้วคืน null
const loadAccessiblePlay = async (req, res, playId) => {
    const play = await prisma.game_play_history.findUnique({
        where: { play_id: Number(playId) },
        select: {
            play_id: true,
            user_id: true,
            level_id: true,
            completed_at: true,
        },
    });

    if (!play) {
        res.status(404).json({ success: false, message: "ไม่พบรอบการเล่นนี้" });
        return null;
    }

    const userId = Number(req.user.id);

    if (play.user_id !== userId && !(await isTeacher(userId))) {
        res.status(403).json({
            success: false,
            message: "ไม่มีสิทธิ์เข้าถึงรอบการเล่นนี้",
        });
        return null;
    }

    return play;
};

const parseId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const handleError = (res, label, error) => {
    console.error(`Error in ${label}:`, error);
    return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
    });
};

const recordAnswer = async (req, res) => {
    try {
        const { playId, slipId, slipOrder, playerChoice } = req.body;

        const parsedPlayId = parseId(playId);
        const parsedSlipId = parseId(slipId);
        const parsedOrder = Number(slipOrder);
        const choice = String(playerChoice || "").toLowerCase();

        if (!parsedPlayId || !parsedSlipId || !Number.isInteger(parsedOrder)) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: playId, slipId, slipOrder, playerChoice",
            });
        }

        if (!["real", "fake"].includes(choice)) {
            return res.status(400).json({
                success: false,
                message: 'playerChoice must be "real" or "fake"',
            });
        }

        if (parsedOrder < 1 || parsedOrder > TOTAL_SLIPS) {
            return res.status(400).json({
                success: false,
                message: `slipOrder ต้องอยู่ระหว่าง 1-${TOTAL_SLIPS}`,
            });
        }

        const play = await loadAccessiblePlay(req, res, parsedPlayId);
        if (!play) return;

        // บันทึกคำตอบได้เฉพาะเจ้าของรอบเท่านั้น (อาจารย์ดูได้อย่างเดียว)
        if (play.user_id !== Number(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "ไม่มีสิทธิ์ตอบในรอบการเล่นนี้",
            });
        }

        if (play.completed_at) {
            return res.status(400).json({
                success: false,
                message: "เกมนี้จบแล้ว ไม่สามารถตอบเพิ่มได้",
            });
        }

        if (!gamePlayService.isSlipHuntLevel(play.level_id)) {
            return res.status(400).json({
                success: false,
                message: "รอบการเล่นนี้ไม่ใช่ด่าน Slip Hunt",
            });
        }

        // ตอบสลิปเดิม / ลำดับเดิมซ้ำไม่ได้
        const duplicate = await prisma.$queryRaw`
            SELECT 1 FROM game_play_slip_hunt
            WHERE play_id = ${parsedPlayId}
              AND (slip_id = ${parsedSlipId} OR slip_order = ${parsedOrder})
            LIMIT 1
        `;

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "ตรวจสลิปนี้ไปแล้ว",
            });
        }

        const result = await slipHuntService.recordSlipHuntAnswer(
            parsedPlayId,
            parsedSlipId,
            parsedOrder,
            choice
        );

        return res.status(201).json(result);
    } catch (error) {
        return handleError(res, "recordAnswer", error);
    }
};

/** GET /api/slip-hunt/play/:playId — ประวัติคำตอบของรอบนี้ */
const getHistory = async (req, res) => {
    try {
        const playId = parseId(req.params.playId);
        if (!playId) {
            return res.status(400).json({ success: false, message: "playId ต้องเป็นตัวเลข" });
        }

        if (!(await loadAccessiblePlay(req, res, playId))) return;

        return res.status(200).json(await slipHuntService.getSlipHuntHistory(playId));
    } catch (error) {
        return handleError(res, "getHistory", error);
    }
};

/** GET /api/slip-hunt/summary/:playId — สรุปผลของรอบนี้ */
const getSummary = async (req, res) => {
    try {
        const playId = parseId(req.params.playId);
        if (!playId) {
            return res.status(400).json({ success: false, message: "playId ต้องเป็นตัวเลข" });
        }

        if (!(await loadAccessiblePlay(req, res, playId))) return;

        return res.status(200).json(await slipHuntService.getSlipHuntSummary(playId));
    } catch (error) {
        return handleError(res, "getSummary", error);
    }
};

/** GET /api/slip-hunt/check/:playId — ตอบครบหรือยัง */
const checkComplete = async (req, res) => {
    try {
        const playId = parseId(req.params.playId);
        if (!playId) {
            return res.status(400).json({ success: false, message: "playId ต้องเป็นตัวเลข" });
        }

        if (!(await loadAccessiblePlay(req, res, playId))) return;

        return res.status(200).json(await slipHuntService.checkGameComplete(playId));
    } catch (error) {
        return handleError(res, "checkComplete", error);
    }
};

/** GET /api/slip-hunt/user/:userId — ประวัติทั้งหมด (ตัวเอง หรืออาจารย์) */
const getUserStats = async (req, res) => {
    try {
        const userId = parseId(req.params.userId);
        const levelId = req.query.levelId ? parseId(req.query.levelId) : null;

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId ต้องเป็นตัวเลข" });
        }

        const me = Number(req.user.id);

        if (userId !== me && !(await isTeacher(me))) {
            return res.status(403).json({
                success: false,
                message: "ดูได้เฉพาะประวัติของตัวเอง",
            });
        }

        return res.status(200).json(
            await slipHuntService.getUserSlipHuntStats(userId, levelId)
        );
    } catch (error) {
        return handleError(res, "getUserStats", error);
    }
};

/** GET /api/slip-hunt/answer/:playSlipId — คำตอบ 1 สลิป */
const getAnswer = async (req, res) => {
    try {
        const playSlipId = parseId(req.params.playSlipId);
        if (!playSlipId) {
            return res.status(400).json({ success: false, message: "playSlipId ต้องเป็นตัวเลข" });
        }

        const result = await slipHuntService.getSlipHuntAnswer(playSlipId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        if (!(await loadAccessiblePlay(req, res, result.data.play_id))) return;

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, "getAnswer", error);
    }
};

const deleteGameHistory = async (req, res) => {
    try {
        const playId = parseId(req.params.playId);
        if (!playId) {
            return res.status(400).json({ success: false, message: "playId ต้องเป็นตัวเลข" });
        }

        const play = await loadAccessiblePlay(req, res, playId);
        if (!play) return;

        if (play.user_id !== Number(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "ลบได้เฉพาะรอบการเล่นของตัวเอง",
            });
        }

        if (play.completed_at) {
            return res.status(400).json({
                success: false,
                message: "รอบนี้จบแล้ว ไม่สามารถลบประวัติได้ กรุณาเริ่มเกมใหม่",
            });
        }

        await prisma.$executeRaw`
            DELETE FROM game_play_slip_hunt
            WHERE play_id = ${playId}
        `;

        return res.status(200).json({
            success: true,
            message: "ลบประวัติเกมสำเร็จ",
        });
    } catch (error) {
        return handleError(res, "deleteGameHistory", error);
    }
};

module.exports = {
    recordAnswer,
    getHistory,
    getSummary,
    checkComplete,
    getUserStats,
    getAnswer,
    deleteGameHistory,
};