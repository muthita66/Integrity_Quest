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

// เข้าถึง play นี้ได้ไหม (เจ้าของ หรืออาจารย์) → คืน play หรือ null
const loadAccessiblePlay = async (req, res, playId) => {
    const play = await prisma.game_play_history.findUnique({
        where: { play_id: playId },
        select: {
            play_id: true,
            user_id: true,
            level_id: true,
            completed_at: true,
            score: true,
            earned_ip: true,
            status: true,
        },
    });

    if (!play) {
        res.status(404).json({ success: false, message: "ไม่พบรอบการเล่นนี้" });
        return null;
    }

    if (!gamePlayService.isBudgetLevel(play.level_id)) {
        res.status(400).json({
            success: false,
            message: "รอบการเล่นนี้ไม่ใช่ด่านจัดสรรงบประมาณ",
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

const submit = async (req, res) => {
    try {
        const playId = parseId(req.body.playId);

        if (!playId) {
            return res.status(400).json({ success: false, message: "กรุณาระบุ playId" });
        }

        const play = await loadAccessiblePlay(req, res, playId);
        if (!play) return;

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

        const checked = gamePlayService.validateBudgets(req.body.budgets);

        if (!checked.ok) {
            return res.status(400).json({ success: false, message: checked.message });
        }

        await gamePlayService.saveBudgetAllocations(playId, checked.budgets);
        await gamePlayService.saveBudgetEvent(playId, req.body.event);

        return res.status(201).json({
            success: true,
            data: { play_id: playId, budgets: checked.budgets },
        });
    } catch (error) {
        return handleError(res, "budget submit", error);
    }
};

const getPlay = async (req, res) => {
    try {
        const playId = parseId(req.params.playId);

        if (!playId) {
            return res.status(400).json({ success: false, message: "playId ต้องเป็นตัวเลข" });
        }

        const play = await loadAccessiblePlay(req, res, playId);
        if (!play) return;

        const budgets = await gamePlayService.getBudgetAllocations(playId);

        if (!budgets) {
            return res.status(404).json({
                success: false,
                message: "รอบนี้ยังไม่ได้จัดสรรงบประมาณ",
            });
        }

        const eventType = await gamePlayService.getBudgetEvent(playId);
        const result = gamePlayService.calcBudgetResult(budgets, eventType);

        return res.status(200).json({
            success: true,
            data: {
                play_id: playId,
                completed: Boolean(play.completed_at),
                status: play.status,
                earned_ip: play.completed_at ? play.earned_ip : result.earnedIP,

                budgets,
                total_budget: gamePlayService.BUDGET_TOTAL,
                used_budget: result.used,
                remaining_budget: result.remaining,

                score: result.score,
                base_score: result.base_score,
                penalty: result.penalty,
                event: result.event,
                weakest: result.weakest,
                happiness: result.happiness,
                rank: result.rank,
            },
        });
    } catch (error) {
        return handleError(res, "budget getPlay", error);
    }
};

module.exports = { submit, getPlay };