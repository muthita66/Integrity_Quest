const prisma = require('../lib/prisma');
const { updateLevelProgress } = require('./userProgressController');

const passed = (status) => ['PASS', 'PERFECT'].includes(status);

exports.getCertificate = async (req, res) => {
    try {
        const userId = Number(req.user.id);
        // Require every chapter, including chapters not yet enabled on the map.
        const units = await prisma.units.findMany({ select: { unit_id: true } });
        const levels = await prisma.level.findMany({ select: { level_id: true, unit_id: true } });
        const progress = await prisma.user_level_progress.findMany({ where: { user_id: userId } });
        const byLevel = new Map(progress.map((p) => [p.level_id, p]));
        const eligible = units.length > 0 && units.every((unit) => {
            const chapterLevels = levels.filter((l) => l.unit_id === unit.unit_id);
            return chapterLevels.length > 0 && chapterLevels.every((l) => {
                const p = byLevel.get(l.level_id);
                return p && passed(p.status) && p.completed_at;
            });
        });
        if (!eligible) return res.status(403).json({ message: 'เล่นให้ผ่านครบทุกบทเพื่อรับเกียรติบัตร' });
        const postTest = await prisma.user_quiz_answers.findFirst({
            where: { user_id: userId, quizzes: { quiz_type: 'post_test' } },
            select: { answered_at: true },
        });
        if (!postTest) return res.status(403).json({ code: 'POST_TEST_REQUIRED', message: 'ทำ Post-test ก่อน เพื่อรับเกียรติบัตรคนเก่ง' });
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { username: true, students: { take: 1, select: { first_name: true, last_name: true } }, teachers: { take: 1, select: { first_name: true, last_name: true } } },
        });
        if (!user) return res.status(404).json({ message: 'ไม่พบผู้เล่น' });
        const person = user.students[0] || user.teachers[0];
        const name = person ? [person.first_name, person.last_name].filter(Boolean).join(' ').trim() : '';
        const completedAt = new Date(Math.max(new Date(postTest.answered_at).getTime(), ...levels.map((l) => new Date(byLevel.get(l.level_id).completed_at).getTime())));
        return res.json({ data: { name: name || user.username, completedAt: completedAt.toISOString() } });
    } catch (error) {
        console.error('Certificate error:', error);
        return res.status(500).json({ message: 'โหลดเกียรติบัตรไม่สำเร็จ กรุณาลองใหม่' });
    }
};

// The reflection game has no scored pass threshold; all six answers complete it.
exports.completeReflection = async (req, res) => {
    try {
        const answers = req.body.answers;
        if (!Array.isArray(answers) || answers.length !== 6 || answers.some((a) => typeof a.answer !== 'string' || !a.answer.trim())) {
            return res.status(400).json({ message: 'กรุณาตอบให้ครบทั้ง 6 ข้อ' });
        }
        const levels = await prisma.level.findMany({ where: { unit_id: 6 }, orderBy: { order_no: 'asc' } });
        const level = levels[2];
        if (!level) return res.status(404).json({ message: 'ไม่พบด่านกระจก' });
        const userId = Number(req.user.id);
        const progress = await prisma.user_level_progress.findMany({ where: { user_id: userId, unit_id: 6 } });
        if (!levels.slice(0, 2).every((l) => progress.some((p) => p.level_id === l.level_id && passed(p.status)))) {
            return res.status(403).json({ message: 'กรุณาผ่านสองด่านก่อนหน้าในบทที่ 6 ก่อน' });
        }
        await updateLevelProgress({ userId, levelId: level.level_id, status: 'PASS', score: 0 });
        const totalIP = await prisma.$transaction(async (tx) => {
            const now = new Date();
            await tx.game_play_history.create({ data: {
                user_id: userId, level_id: level.level_id, score: 0, max_score: 0,
                started_at: now, completed_at: now, status: 'PASS', earned_ip: 250,
            } });
            const best = await tx.game_play_history.groupBy({
                by: ['level_id'], where: { user_id: userId, completed_at: { not: null } },
                _max: { earned_ip: true },
            });
            const total = best.reduce((sum, row) => sum + (row._max.earned_ip ?? 0), 0);
            await tx.user_stats.upsert({
                where: { user_id: userId }, update: { integrity_points: total },
                create: { user_id: userId, total_points: 0, current_streak: 0,
                    highest_score: 0, last_login_date: now, integrity_points: total },
            });
            return total;
        });
        return res.json({ success: true, data: { earned_ip: 250, total_integrity_points: totalIP } });
    } catch (error) {
        console.error('Complete reflection error:', error);
        return res.status(500).json({ message: 'บันทึกผลไม่สำเร็จ กรุณาลองใหม่' });
    }
};
