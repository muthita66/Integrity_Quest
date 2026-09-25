const prisma = require("../lib/prisma");
const userProgressController = require("./userProgressController");

// ============================================================
// Level Sync (ใช้กับด่านที่มี controller แยก เช่น Unit 3)
// ------------------------------------------------------------
// หลังเล่นจบ 1 รอบ (มีแถวใน game_play_history ที่ completed_at แล้ว)
//   1. อัปเดต user_level_progress → ผ่านแล้วปลดล็อกด่าน/บทถัดไป
//   2. คำนวณ Integrity Points ใหม่ = ผลรวม "คะแนนดีที่สุด" ของแต่ละด่าน
//      (ทับค่าที่ controller เดิมบวกเพิ่มไว้ → เล่นซ้ำปั๊ม IP ไม่ได้)
//
// ห่อ try/catch ไว้ทั้งหมด: ถ้าพัง จะไม่ทำให้ผลเกมที่ส่งกลับพัง
// ============================================================

// สถานะที่ถือว่า "ผ่านด่าน" (Unit 3 ใช้ COMPLETED / FAILED)
const PASSED_PLAY_STATUSES = [
    "PASS",
    "PERFECT",
    "COMPLETED",
    "GREAT",
    "EXPERT",
    "MASTER",
];

const PROGRESS_PASSED = ["PASS", "PERFECT"];

// IP รวม = ผลรวม earned_ip สูงสุดของแต่ละด่าน (เหมือนใน gamePlayController)
const recalcIntegrityPoints = async (userId) => {
    const uid = Number(userId);

    const bestPerLevel = await prisma.game_play_history.groupBy({
        by: ["level_id"],
        where: { user_id: uid, completed_at: { not: null } },
        _max: { earned_ip: true },
    });

    const total = bestPerLevel.reduce(
        (sum, row) => sum + (row._max.earned_ip ?? 0),
        0
    );

    await prisma.user_stats.upsert({
        where: { user_id: uid },
        update: { integrity_points: total },
        create: {
            user_id: uid,
            total_points: 0,
            current_streak: 0,
            highest_score: 0,
            last_login_date: new Date(),
            integrity_points: total,
        },
    });

    return total;
};

// sync จาก play_id
const syncLevelResult = async (playId) => {
    try {
        const play = await prisma.game_play_history.findUnique({
            where: { play_id: Number(playId) },
            select: {
                user_id: true,
                level_id: true,
                status: true,
                score: true,
                completed_at: true,
            },
        });

        // ยังไม่จบเกม → ไม่ต้องทำอะไร
        if (!play || !play.completed_at) return null;

        const passed = PASSED_PLAY_STATUSES.includes(play.status);

        const existing = await prisma.user_level_progress.findUnique({
            where: {
                user_id_level_id: {
                    user_id: play.user_id,
                    level_id: play.level_id,
                },
            },
            select: { status: true },
        });

        // เล่นซ้ำแล้วไม่ผ่าน แต่เคยผ่านไปแล้ว → ไม่ลดสถานะเดิม
        const keepOldPass =
            !passed && PROGRESS_PASSED.includes(existing?.status);

        if (!keepOldPass) {
            await userProgressController.updateLevelProgress({
                userId: play.user_id,
                levelId: play.level_id,
                score: play.score,
                status: passed
                    ? play.status === "PERFECT"
                        ? "PERFECT"
                        : "PASS"
                    : "FAIL",
                passed,
            });
        }

        const integrityPoints = await recalcIntegrityPoints(play.user_id);

        return { passed, integrity_points: integrityPoints };
    } catch (error) {
        console.error("syncLevelResult error:", { playId }, error);
        return null;
    }
};

// sync รอบล่าสุดที่จบแล้วของ user ในด่านที่กำหนด (ใช้เมื่อไม่รู้ play_id)
const syncLatestPlay = async (userId, levelId) => {
    try {
        const play = await prisma.game_play_history.findFirst({
            where: {
                user_id: Number(userId),
                level_id: Number(levelId),
                completed_at: { not: null },
            },
            orderBy: { completed_at: "desc" },
            select: { play_id: true },
        });

        return play ? await syncLevelResult(play.play_id) : null;
    } catch (error) {
        console.error("syncLatestPlay error:", { userId, levelId }, error);
        return null;
    }
};

module.exports = {
    syncLevelResult,
    syncLatestPlay,
    recalcIntegrityPoints,
};