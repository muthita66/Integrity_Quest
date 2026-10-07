const prisma = require("../lib/prisma");
const gamePlayService = require("../services/gamePlayService");
const parseId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const answer = async (req, res) => {
    try {
        const playId = parseId(req.body.playId);
        const wordId = parseId(req.body.wordId);

        if (!playId || !wordId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ playId และ wordId",
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

        if (!gamePlayService.isWordClueLevel(play.level_id)) {
            return res.status(400).json({
                success: false,
                message: "รอบการเล่นนี้ไม่ใช่ด่านตามหาคำ",
            });
        }

        if (play.completed_at) {
            return res.status(400).json({
                success: false,
                message: "เกมนี้จบแล้ว กรุณาเริ่มรอบใหม่",
            });
        }

        const result = await gamePlayService.recordWordAnswer(
            play,
            wordId,
            req.body.text
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
        console.error("Error in word answer:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = { answer };