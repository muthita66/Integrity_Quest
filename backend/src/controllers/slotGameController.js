const prisma = require("../lib/prisma");
const gamePlayService = require("../services/gamePlayService");
const isTeacher = async (userId) =>
    (await prisma.teachers.count({ where: { user_id: Number(userId) } })) > 0;

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

// ตรวจว่าเข้าถึง play นี้ได้ไหม (เจ้าของ หรืออาจารย์) → คืน play หรือ null
const loadAccessiblePlay = async (req, res, playId) => {
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
        res.status(404).json({ success: false, message: "ไม่พบรอบการเล่นนี้" });
        return null;
    }

    if (!gamePlayService.isSlotLevel(play.level_id)) {
        res.status(400).json({
            success: false,
            message: "รอบการเล่นนี้ไม่ใช่ด่านสล็อต",
        });
        return null;
    }

    const me = Number(req.user.id);

    if (play.user_id !== me && !(await isTeacher(me))) {
        res.status(403).json({
            success: false,
            message: "ไม่มีสิทธิ์เข้าถึงรอบการเล่นนี้",
        });
        return null;
    }

    return play;
};

const spin = async (req, res) => {
    try {
        const playId = parseId(req.body.playId);

        if (!playId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ playId",
            });
        }

        const play = await loadAccessiblePlay(req, res, playId);
        if (!play) return;

        // หมุนได้เฉพาะเจ้าของรอบ (อาจารย์ดูได้อย่างเดียว)
        if (play.user_id !== Number(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "ไม่มีสิทธิ์เล่นในรอบการเล่นนี้",
            });
        }

        if (play.completed_at) {
            return res.status(400).json({
                success: false,
                message: "เกมนี้จบแล้ว กรุณาเริ่มรอบใหม่",
            });
        }

        const result = await gamePlayService.recordSlotSpin(
            playId,
            req.body.bet
        );

        if (!result.ok) {
            return res.status(result.status).json({
                success: false,
                message: result.message,
            });
        }

        return res.status(201).json({
            success: true,
            data: {
                ...result.round,
                is_broke: result.is_broke,
            },
        });
    } catch (error) {
        return handleError(res, "slot spin", error);
    }
};

const getPlay = async (req, res) => {
    try {
        const playId = parseId(req.params.playId);

        if (!playId) {
            return res.status(400).json({
                success: false,
                message: "playId ต้องเป็นตัวเลข",
            });
        }

        if (!(await loadAccessiblePlay(req, res, playId))) return;

        return res.status(200).json({
            success: true,
            data: await gamePlayService.getSlotSummary(playId),
        });
    } catch (error) {
        return handleError(res, "slot getPlay", error);
    }
};

module.exports = {
    spin,
    getPlay,
};