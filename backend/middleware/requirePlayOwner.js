const prisma = require("../src/lib/prisma");

// ใช้ต่อจาก authenticateToken: play_id (จาก :playId หรือ body.play_id)
// ต้องเป็นของผู้ใช้ที่ login อยู่ กันการยิง play_id ของคนอื่น
const requirePlayOwner = async (req, res, next) => {
    try {
        const playId = Number(req.params.playId ?? req.body?.play_id);

        if (!Number.isInteger(playId)) {
            return res.status(400).json({
                message: "play_id ไม่ถูกต้อง",
            });
        }

        const play = await prisma.game_play_history.findUnique({
            where: { play_id: playId },
            select: { user_id: true },
        });

        if (!play) {
            return res.status(404).json({
                message: "ไม่พบข้อมูลการเล่น",
            });
        }

        if (play.user_id !== Number(req.user.id)) {
            return res.status(403).json({
                message: "ไม่มีสิทธิ์เข้าถึงข้อมูลการเล่นนี้",
            });
        }

        next();
    } catch (error) {
        console.error("requirePlayOwner error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = requirePlayOwner;
