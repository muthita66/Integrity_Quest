const prisma = require("../lib/prisma");
const gamePlayService = require("../services/gamePlayService");

// ============================================================
// Crisis Response (Unit 6 Level 1 : รับมือวิกฤตในโรงเรียน)
// ------------------------------------------------------------
// ทุก route ต้อง login (authenticateToken ใน crisisGameRoutes)
//
// Flow:
// 1. POST /api/game-play/start       { level_id } → play_id + events
// 2. POST /api/crisis-game/respond   ทุกครั้งที่เลือกตัวเลือก / เหตุการณ์หลุดมือ
//    body: { playId, spawnNo, eventId, choiceId | null, responseSeconds }
// 3. POST /api/crisis-game/special   เมื่อเกิดเหตุการณ์พิเศษ
//    body: { playId, specialCode, eventId?, spawnNo? }  (teacherHelp ส่งเหตุการณ์ที่จะแก้)
// 4. หมดเวลา → POST /api/game-play/complete { play_id } → Rank / IP
// ============================================================

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

// ตรวจรอบการเล่น: ต้องเป็นของตัวเอง + ด่าน Crisis + ยังไม่จบ
const loadOwnPlay = async (req, res) => {
    const playId = parseId(req.body.playId);

    if (!playId) {
        res.status(400).json({ success: false, message: "กรุณาระบุ playId" });
        return null;
    }

    const play = await prisma.game_play_history.findUnique({
        where: { play_id: playId },
        select: {
            play_id: true,
            user_id: true,
            level_id: true,
            started_at: true,
            completed_at: true,
        },
    });

    if (!play) {
        res.status(404).json({ success: false, message: "ไม่พบรอบการเล่นนี้" });
        return null;
    }

    if (play.user_id !== Number(req.user.id)) {
        res.status(403).json({ success: false, message: "ไม่มีสิทธิ์เล่นในรอบการเล่นนี้" });
        return null;
    }

    if (!(await gamePlayService.isCrisisLevel(play.level_id))) {
        res.status(400).json({ success: false, message: "รอบการเล่นนี้ไม่ใช่ด่าน Crisis Response" });
        return null;
    }

    if (play.completed_at) {
        res.status(400).json({ success: false, message: "เกมนี้จบแล้ว กรุณาเริ่มรอบใหม่" });
        return null;
    }

    return play;
};

/** POST /api/crisis-game/respond */
const respond = async (req, res) => {
    try {
        const play = await loadOwnPlay(req, res);
        if (!play) return;

        const choiceId = req.body.choiceId ? parseId(req.body.choiceId) : null;

        const result = await gamePlayService.recordCrisisResponse(play, {
            spawnNo: req.body.spawnNo,
            eventId: parseId(req.body.eventId),
            choiceId,
            outcome: choiceId ? "choice" : "timeout",
            responseSeconds: req.body.responseSeconds,
        });

        if (!result.ok) {
            return res.status(result.status).json({ success: false, message: result.message });
        }

        const { ok, ...data } = result;
        return res.status(201).json({ success: true, data });
    } catch (error) {
        return handleError(res, "crisis respond", error);
    }
};

/** POST /api/crisis-game/special */
const special = async (req, res) => {
    try {
        const play = await loadOwnPlay(req, res);
        if (!play) return;

        const result = await gamePlayService.recordCrisisSpecial(play, {
            specialCode: String(req.body.specialCode || ""),
            eventId: parseId(req.body.eventId),
            spawnNo: req.body.spawnNo,
        });

        if (!result.ok) {
            return res.status(result.status).json({ success: false, message: result.message });
        }

        const { ok, ...data } = result;
        return res.status(201).json({ success: true, data });
    } catch (error) {
        return handleError(res, "crisis special", error);
    }
};

module.exports = { respond, special };