const prisma = require("../lib/prisma");
const gamePlayService = require("../services/gamePlayService");
const { buildOverview } = require("./profileController");
const PASSED_STATUSES = ["PASS", "PERFECT"];
const STUDENT_ROLE_ID = 1;
const DAY_MS = 24 * 60 * 60 * 1000;

const REVERSE_KEYWORDS = ["ตามอารมณ์", "โดยไม่จำเป็น"];

const isReverseItem = (questionText = "") =>
    REVERSE_KEYWORDS.some((word) => questionText.includes(word));

// "YYYY-MM-DD" ตามเวลาไทย
const todayInBangkok = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

const toDateKey = (date) =>
    date ? new Date(date).toISOString().slice(0, 10) : null;

// Date → "YYYY-MM-DD" ตามเวลาไทย
const toBangkokKey = (date) =>
    new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

const daysBetween = (fromKey, toKey) =>
    Math.round((Date.parse(toKey) - Date.parse(fromKey)) / DAY_MS);

const average = (values) => {
    const list = values.filter((v) => typeof v === "number");
    if (list.length === 0) return null;
    return Math.round(list.reduce((sum, v) => sum + v, 0) / list.length);
};

const normalizedGain = (pre, post) => {
    if (pre === null || post === null) return null;
    if (pre >= 100) return post >= 100 ? 0 : null; // ไม่เหลือช่องว่างให้พัฒนาแล้ว
    return (post - pre) / (100 - pre);
};

exports.requireTeacher = async (req, res, next) => {
    try {
        const teacher = await prisma.teachers.findFirst({
            where: { user_id: Number(req.user.id) },
            select: {
                teacher_id: true,
                first_name: true,
                last_name: true,
                position: true,
                dept_id: true,
            },
        });

        if (!teacher) {
            return res.status(403).json({
                message: "หน้านี้สำหรับอาจารย์เท่านั้น",
            });
        }

        req.teacher = teacher;
        return next();
    } catch (error) {
        console.error("requireTeacher error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const teacher = req.teacher;

        const department = teacher.dept_id
            ? await prisma.departments.findUnique({
                where: { dept_id: teacher.dept_id },
                select: { dept_name: true, faculty_id: true },
            })
            : null;

        const teacherFacultyId = department?.faculty_id ?? null;

        const [faculties, majors] = await Promise.all([
            prisma.faculties.findMany({
                select: { faculty_id: true, faculty_name: true },
            }),
            prisma.majors.findMany({
                select: { major_id: true, major_name: true, faculty_id: true },
            }),
        ]);

        const facultyById = new Map(faculties.map((f) => [f.faculty_id, f]));
        const majorById = new Map(majors.map((m) => [m.major_id, m]));
        const teacherGroupRows = await prisma.teacher_student_groups.findMany({
            where: { teacher_id: teacher.teacher_id },
            orderBy: { group_id: "asc" },
        });

        const groups = teacherGroupRows.map((g, index) => ({
            group_id: g.group_id,
            label: `กลุ่มที่ ${index + 1}`,
            faculty_id: g.faculty_id,
            faculty_name: facultyById.get(g.faculty_id)?.faculty_name || null,
            major_id: g.major_id,
            major_name: majorById.get(g.major_id)?.major_name || null,
            year: g.year,
            note: g.note,
        }));

        const requestedScope =
            req.query.scope || (groups[0] ? `group:${groups[0].group_id}` : "all");

        const activeGroup =
            String(requestedScope) !== "all"
                ? groups.find((g) => `group:${g.group_id}` === String(requestedScope)) ||
                null
                : null;

        const scope = activeGroup ? `group:${activeGroup.group_id}` : "all";

        // เงื่อนไข Prisma where สำหรับนิสิตที่ตรงกับกลุ่มเดียว
        const buildGroupWhere = (group) => {
            const majorIds = majors
                .filter((m) => {
                    if (group.faculty_id && m.faculty_id !== group.faculty_id) {
                        return false;
                    }
                    if (group.major_id && m.major_id !== group.major_id) {
                        return false;
                    }
                    return true;
                })
                .map((m) => m.major_id);

            return {
                major_id: { in: majorIds },
                ...(group.year ? { entry_year: group.year } : {}),
            };
        };

        const studentsWhere = activeGroup
            ? buildGroupWhere(activeGroup)
            : groups.length > 0
                ? { OR: groups.map(buildGroupWhere) }
                : // อาจารย์เก่าที่ยังไม่มีกลุ่มเลย (ข้อมูลก่อนฟีเจอร์นี้) —
                // ไม่กรอง กันหน้าจอว่างเปล่าไปเลย
                {};

        const students = await prisma.students.findMany({
            where: studentsWhere,
            select: {
                user_id: true,
                first_name: true,
                last_name: true,
                gender: true,
                entry_year: true,
                major_id: true,
            },
        });

        const userIds = students.map((s) => s.user_id);
        const [
            users,
            stats,
            units,
            levels,
            passedRows,
            plays,
            timeSpent,
            quizzes,
            quizAnswers,
        ] = await Promise.all([
            prisma.users.findMany({
                where: { id: { in: userIds }, role_id: STUDENT_ROLE_ID },
                select: { id: true, username: true, email: true },
            }),
            prisma.user_stats.findMany({
                where: { user_id: { in: userIds } },
                select: {
                    user_id: true,
                    integrity_points: true,
                    current_streak: true,
                    last_login_date: true,
                    streak_star_count: true,
                },
            }),
            prisma.units.findMany({ select: { unit_id: true } }),
            prisma.level.findMany({ select: { level_id: true, unit_id: true } }),
            prisma.user_level_progress.findMany({
                where: {
                    user_id: { in: userIds },
                    status: { in: PASSED_STATUSES },
                },
                select: { user_id: true, level_id: true },
            }),
            prisma.game_play_history.groupBy({
                by: ["user_id"],
                where: { user_id: { in: userIds }, completed_at: { not: null } },
                _count: { _all: true },
                _max: { completed_at: true },
            }),
            // เวลาใช้งานจริง (heartbeat) จาก user_sessions
            prisma.user_sessions.groupBy({
                by: ["user_id"],
                where: { user_id: { in: userIds } },
                _sum: { active_minutes: true },
                _max: { last_seen_at: true },
            }),
            prisma.quizzes.findMany({
                select: {
                    quiz_id: true,
                    quiz_type: true,
                    question_text: true,
                    max_score: true,
                },
            }),
            prisma.user_quiz_answers.findMany({
                where: { user_id: { in: userIds } },
                select: { user_id: true, quiz_id: true, score_given: true },
            }),
        ]);

        const userById = new Map(users.map((u) => [u.id, u]));
        const statsByUser = new Map(stats.map((s) => [s.user_id, s]));
        const playsByUser = new Map(plays.map((p) => [p.user_id, p]));
        const sessionByUser = new Map(timeSpent.map((t) => [t.user_id, t]));
        const quizById = new Map(quizzes.map((q) => [q.quiz_id, q]));

        // ด่านที่ผ่านของแต่ละคน
        const passedByUser = new Map();
        passedRows.forEach((row) => {
            if (!passedByUser.has(row.user_id)) {
                passedByUser.set(row.user_id, new Set());
            }
            passedByUser.get(row.user_id).add(row.level_id);
        });

        // Level ของแต่ละบท (ใช้คิด % ภาพรวมแบบเดียวกับหน้า Progress)
        const levelsByUnit = new Map(
            units.map((u) => [
                u.unit_id,
                levels.filter((l) => l.unit_id === u.unit_id),
            ])
        );
        const totalLevels = levels.length;

        const getProgressPercent = (passedSet) => {
            if (units.length === 0) return 0;

            const ratio = units.reduce((sum, unit) => {
                const unitLevels = levelsByUnit.get(unit.unit_id);
                if (!unitLevels.length) return sum;

                const passed = unitLevels.filter((l) =>
                    passedSet.has(l.level_id)
                ).length;

                return sum + passed / unitLevels.length;
            }, 0);

            return Math.round((ratio / units.length) * 100);
        };

        // คะแนน Pre/Post (เป็น % ของคะแนนเต็ม, กลับคะแนนข้อเชิงลบแล้ว)
        const quizScoreByUser = new Map();
        quizAnswers.forEach((answer) => {
            const quiz = quizById.get(answer.quiz_id);
            if (!quiz) return;

            const type = String(quiz.quiz_type);
            const max = quiz.max_score || 5;
            const score = isReverseItem(quiz.question_text)
                ? max + 1 - answer.score_given
                : answer.score_given;

            if (!quizScoreByUser.has(answer.user_id)) {
                quizScoreByUser.set(answer.user_id, {});
            }

            const bucket = quizScoreByUser.get(answer.user_id);
            bucket[type] = bucket[type] || { score: 0, max: 0 };
            bucket[type].score += score;
            bucket[type].max += max;
        });

        const toPercent = (entry) =>
            entry && entry.max ? Math.round((entry.score / entry.max) * 100) : null;

        const today = todayInBangkok();

        const rows = students
            .filter((s) => userById.has(s.user_id))
            .map((student) => {
                const user = userById.get(student.user_id);
                const stat = statsByUser.get(student.user_id);
                const play = playsByUser.get(student.user_id);
                const passedSet = passedByUser.get(student.user_id) || new Set();
                const major = majorById.get(student.major_id);
                const faculty = facultyById.get(major?.faculty_id);
                const quiz = quizScoreByUser.get(student.user_id) || {};

                const lastLoginKey = toDateKey(stat?.last_login_date);
                const session = sessionByUser.get(student.user_id);
                const lastActiveAt =
                    [session?._max.last_seen_at, play?._max.completed_at]
                        .filter(Boolean)
                        .map((d) => new Date(d))
                        .sort((a, b) => b - a)[0] || null;
                const lastActiveKey = lastActiveAt
                    ? [toBangkokKey(lastActiveAt), lastLoginKey]
                        .filter(Boolean)
                        .sort()
                        .pop()
                    : lastLoginKey;

                const streakAlive =
                    lastLoginKey && daysBetween(lastLoginKey, today) <= 1;

                const preTest = toPercent(quiz.pre_test);
                const postTest = toPercent(quiz.post_test);
                const progress = getProgressPercent(passedSet);

                let status;
                if (preTest === null) status = "no_pretest";
                else if (totalLevels && passedSet.size >= totalLevels) status = "completed";
                else if ((play?._count._all || 0) > 0) status = "playing";
                else status = "not_started";

                return {
                    user_id: student.user_id,
                    username: user.username,
                    email: user.email,
                    first_name: student.first_name,
                    last_name: student.last_name,
                    gender: student.gender,
                    year: student.entry_year,
                    major_id: student.major_id,
                    major_name: major?.major_name || "-",
                    faculty_id: major?.faculty_id ?? null,
                    faculty_name: faculty?.faculty_name || "-",

                    progress,
                    passed_levels: passedSet.size,
                    total_levels: totalLevels,
                    integrity_points: stat?.integrity_points ?? 0,
                    streak: streakAlive ? stat?.current_streak ?? 0 : 0,
                    streak_stars: stat?.streak_star_count ?? 0,
                    plays: play?._count._all ?? 0,
                    time_spent: session?._sum.active_minutes ?? 0, // นาที (ใช้งานจริง)
                    last_active: lastActiveKey,       // "YYYY-MM-DD"
                    last_active_at: lastActiveAt,     // เวลาเต็ม (ถ้ามี)
                    pre_test: preTest,
                    post_test: postTest,
                    status,
                };
            })
            .sort((a, b) => b.integrity_points - a.integrity_points);

        const activeIn7Days = rows.filter(
            (r) => r.last_active && daysBetween(r.last_active, today) <= 6
        ).length;

        const paired = rows.filter(
            (r) => r.pre_test !== null && r.post_test !== null
        );

        const pairedBreakdown = { improved: [], same: [], declined: [] };

        paired.forEach((r) => {
            const diff = r.post_test - r.pre_test;
            const entry = {
                user_id: r.user_id,
                name: `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.username,
                pre_test: r.pre_test,
                post_test: r.post_test,
                diff,
            };

            if (diff > 0) pairedBreakdown.improved.push(entry);
            else if (diff < 0) pairedBreakdown.declined.push(entry);
            else pairedBreakdown.same.push(entry);
        });

        const avgPreTest = average(paired.map((r) => r.pre_test));
        const avgPostTest = average(paired.map((r) => r.post_test));

        const summary = {
            total_students: rows.length,
            active_7_days: activeIn7Days,
            pre_test_done: rows.filter((r) => r.pre_test !== null).length,
            post_test_done: rows.filter((r) => r.post_test !== null).length,
            completed_all: rows.filter((r) => r.status === "completed").length,
            avg_progress: average(rows.map((r) => r.progress)) ?? 0,
            avg_time_spent: average(rows.map((r) => r.time_spent)) ?? 0,
            avg_integrity_points: average(rows.map((r) => r.integrity_points)) ?? 0,
            paired_count: paired.length,
            avg_pre_test: avgPreTest,
            avg_post_test: avgPostTest,
            normalized_gain: normalizedGain(avgPreTest, avgPostTest),
            paired_breakdown: pairedBreakdown,
        };

        return res.json({
            data: {
                teacher: {
                    name: `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim(),
                    position: teacher.position || "",
                    dept_name: department?.dept_name || "",
                    faculty_id: teacherFacultyId,
                    faculty_name:
                        facultyById.get(teacherFacultyId)?.faculty_name || "",
                },
                scope,
                groups,
                summary,
                students: rows,
            },
        });
    } catch (error) {
        console.error("Teacher dashboard error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.addGroup = async (req, res) => {
    try {
        const teacher = req.teacher;
        const { faculty, major, year, note } = req.body;

        if (!faculty && !major && !year && !(note && String(note).trim())) {
            return res.status(400).json({
                message: "กรุณาเลือกอย่างน้อย 1 เงื่อนไข (คณะ/สาขา/ชั้นปี/รายละเอียด)",
            });
        }

        const group = await prisma.teacher_student_groups.create({
            data: {
                teacher_id: teacher.teacher_id,
                faculty_id: faculty ? Number(faculty) : null,
                major_id: major ? Number(major) : null,
                year: year ? Number(year) : null,
                note: note ? String(note).trim() : null,
            },
        });

        return res.status(201).json({
            message: "เพิ่มกลุ่มสำเร็จ",
            data: group,
        });
    } catch (error) {
        console.error("Add teacher group error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const teacher = req.teacher;
        const groupId = Number(req.params.id);

        if (!Number.isInteger(groupId)) {
            return res.status(400).json({ message: "รหัสกลุ่มไม่ถูกต้อง" });
        }

        const group = await prisma.teacher_student_groups.findUnique({
            where: { group_id: groupId },
            select: { group_id: true, teacher_id: true },
        });

        if (!group || group.teacher_id !== teacher.teacher_id) {
            return res.status(404).json({ message: "ไม่พบกลุ่มนี้" });
        }

        await prisma.teacher_student_groups.delete({ where: { group_id: groupId } });

        return res.json({ message: "ลบกลุ่มสำเร็จ" });
    } catch (error) {
        console.error("Delete teacher group error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const teacher = req.teacher;
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId)) {
            return res.status(400).json({ message: "รหัสนิสิตไม่ถูกต้อง" });
        }

        const student = await prisma.students.findFirst({
            where: { user_id: userId },
            select: { user_id: true, major_id: true, entry_year: true },
        });

        if (!student) {
            return res.status(404).json({ message: "ไม่พบนิสิตรายนี้" });
        }

        const [teacherGroupRows, majors] = await Promise.all([
            prisma.teacher_student_groups.findMany({
                where: { teacher_id: teacher.teacher_id },
            }),
            prisma.majors.findMany({ select: { major_id: true, faculty_id: true } }),
        ]);

        if (teacherGroupRows.length > 0) {
            const groupMatchesStudent = (group) => {
                const majorIds = majors
                    .filter((m) => {
                        if (group.faculty_id && m.faculty_id !== group.faculty_id) {
                            return false;
                        }
                        if (group.major_id && m.major_id !== group.major_id) {
                            return false;
                        }
                        return true;
                    })
                    .map((m) => m.major_id);

                if (!majorIds.includes(student.major_id)) return false;
                if (group.year && student.entry_year !== group.year) return false;
                return true;
            };

            const belongsToSomeGroup = teacherGroupRows.some(groupMatchesStudent);

            if (!belongsToSomeGroup) {
                return res.status(403).json({
                    message: "ไม่มีสิทธิ์ลบนิสิตรายนี้ เนื่องจากไม่อยู่ในกลุ่มที่ท่านดูแล",
                });
            }
        }

        await prisma.$transaction(async (tx) => {
            const plays = await tx.game_play_history.findMany({
                where: { user_id: userId },
                select: { play_id: true },
            });
            const playIds = plays.map((p) => p.play_id);

            if (playIds.length > 0) {
                const attempts = await tx.game_play_case_attempts.findMany({
                    where: { play_id: { in: playIds } },
                    select: { attempt_id: true },
                });
                const attemptIds = attempts.map((a) => a.attempt_id);

                if (attemptIds.length > 0) {
                    await tx.game_play_items.deleteMany({
                        where: { attempt_id: { in: attemptIds } },
                    });
                }

                await tx.game_play_case_attempts.deleteMany({
                    where: { play_id: { in: playIds } },
                });
                await tx.game_play_answers.deleteMany({
                    where: { play_id: { in: playIds } },
                });
                await tx.game_play_bubbles.deleteMany({
                    where: { play_id: { in: playIds } },
                });
            }

            await tx.game_play_history.deleteMany({ where: { user_id: userId } });
            await tx.feedback.deleteMany({ where: { user_id: userId } });
            await tx.user_earned_rewards.deleteMany({ where: { user_id: userId } });
            await tx.user_quiz_answers.deleteMany({ where: { user_id: userId } });
            await tx.user_stats.deleteMany({ where: { user_id: userId } });
            await tx.students.deleteMany({ where: { user_id: userId } });
            await tx.users.deleteMany({ where: { id: userId } });
        });

        return res.json({ message: "ลบข้อมูลนิสิตสำเร็จ" });
    } catch (error) {
        console.error("Delete student error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const RECENT_SESSIONS = 500;

const getStudentActivity = async (userId) => {
    const today = todayInBangkok();
    const todayStart = new Date(`${today}T00:00:00+07:00`);
    const weekStart = new Date(todayStart.getTime() - 6 * DAY_MS);

    const [total, todaySum, weekSum, sessions] = await Promise.all([
        prisma.user_sessions.aggregate({
            where: { user_id: userId },
            _sum: { active_minutes: true },
            _count: { _all: true },
        }),
        prisma.user_sessions.aggregate({
            where: { user_id: userId, started_at: { gte: todayStart } },
            _sum: { active_minutes: true },
        }),
        prisma.user_sessions.aggregate({
            where: { user_id: userId, started_at: { gte: weekStart } },
            _sum: { active_minutes: true },
        }),
        prisma.user_sessions.findMany({
            where: { user_id: userId },
            orderBy: { started_at: "desc" },
            take: RECENT_SESSIONS,
            select: {
                session_id: true,
                started_at: true,
                last_seen_at: true,
                ended_at: true,
                active_minutes: true,
            },
        }),
    ]);

    return {
        total_minutes: total._sum.active_minutes ?? 0,
        total_sessions: total._count._all,
        today_minutes: todaySum._sum.active_minutes ?? 0,
        week_minutes: weekSum._sum.active_minutes ?? 0,
        sessions: sessions.map((s) => ({
            ...s,
            // ยังไม่ปิดรอบ และ heartbeat ล่าสุดไม่เกิน 5 นาที = กำลังออนไลน์
            is_online:
                !s.ended_at &&
                Date.now() - new Date(s.last_seen_at).getTime() <= 5 * 60 * 1000,
        })),
    };
};

exports.getStudentProgress = async (req, res) => {
    try {
        const studentUserId = Number(req.params.id);

        if (!Number.isInteger(studentUserId)) {
            return res.status(400).json({ message: "รหัสนิสิตไม่ถูกต้อง" });
        }

        // ต้องเป็นบัญชีนิสิตเท่านั้น (กันดูข้อมูลบัญชีอาจารย์ / แอดมิน)
        const student = await prisma.users.findFirst({
            where: { id: studentUserId, role_id: STUDENT_ROLE_ID },
            select: { id: true },
        });

        if (!student) {
            return res.status(404).json({ message: "ไม่พบนิสิต" });
        }

        const [overview, activity] = await Promise.all([
            buildOverview(studentUserId),
            getStudentActivity(studentUserId),
        ]);

        return res.json({ data: { ...overview, activity } });
    } catch (error) {
        console.error("Get student progress error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const NEED_WANT_LABEL = { need: "จำเป็น (Need)", want: "อยากได้ (Want)" };

const toSeconds = (start, end) =>
    start && end
        ? Math.max(0, Math.round((new Date(end) - new Date(start)) / 1000))
        : null;

// ---------- Question + Choice (Unit 1, Unit 2 Final, Boss ฯลฯ) ----------
const buildQuestionSection = async (playId) => {
    const answers = await prisma.game_play_answers.findMany({
        where: { play_id: playId },
        orderBy: { answered_at: "asc" },
        select: {
            is_correct: true,
            ip_reward: true,
            question: {
                select: {
                    question_order: true,
                    question_text: true,
                    choice: {
                        where: { is_correct: true },
                        select: { choice_text: true },
                    },
                },
            },
            choice: { select: { choice_text: true, feedback: true, cost: true } },
        },
    });

    if (answers.length === 0) return null;

    return {
        key: "questions",
        title: "คำตอบรายข้อ",
        rows: answers.map((a, index) => ({
            title: `${a.question?.question_order ?? index + 1}. ${a.question?.question_text ?? "-"}`,
            answer: a.choice?.choice_text ?? "-",
            correct_answer: a.is_correct
                ? null
                : a.question?.choice?.map((c) => c.choice_text).join(" / ") || null,
            is_correct: a.is_correct,
            note: [
                a.choice?.cost ? `ใช้เงิน ${a.choice.cost} บาท` : null,
                a.choice?.feedback || null,
            ]
                .filter(Boolean)
                .join(" · "),
        })),
    };
};

// ---------- Bubble Shooter (Unit 1 Level 2) ----------
const buildBubbleSection = async (playId) => {
    const bubbles = await prisma.game_play_bubbles.findMany({
        where: { play_id: playId, is_destroyed: true },
        orderBy: { destroyed_at: "asc" },
        select: {
            is_correct: true,
            bubbles: { select: { bubble_text: true, bubble_type: true } },
        },
    });

    if (bubbles.length === 0) return null;

    return {
        key: "bubbles",
        title: "ฟองที่ยิง",
        rows: bubbles.map((b) => ({
            title: b.bubbles?.bubble_text ?? "-",
            answer: "ยิงแตก",
            correct_answer:
                String(b.bubbles?.bubble_type).toLowerCase() === "good"
                    ? "ไม่ควรยิง (พฤติกรรมดี)"
                    : null,
            is_correct: b.is_correct,
            note: "",
        })),
    };
};

// ---------- Need / Want (Unit 2 Level 1) ----------
const buildNeedWantSection = async (playId, levelId) => {
    const answers = await prisma.game_play_need_want.findMany({
        where: { play_id: playId },
        orderBy: { answered_at: "asc" },
        select: {
            item_id: true,
            user_type: true,
            is_correct: true,
            items: { select: { name: true } },
        },
    });

    if (answers.length === 0) return null;

    const levelItems = await prisma.level_items.findMany({
        where: { level_id: levelId },
        select: { item_id: true, item_types: { select: { code: true, name: true } } },
    });

    const correctByItem = new Map(levelItems.map((li) => [li.item_id, li.item_types]));
    const label = (code) => NEED_WANT_LABEL[String(code).toLowerCase()] || code;

    return {
        key: "need_want",
        title: "การแยก Need / Want",
        rows: answers.map((a) => {
            const correct = correctByItem.get(a.item_id);
            return {
                title: a.items?.name ?? "-",
                answer: label(a.user_type),
                correct_answer: a.is_correct ? null : correct?.name || label(correct?.code),
                is_correct: a.is_correct,
                note: "",
            };
        }),
    };
};

// ---------- Comparison (Unit 2 Level 2) ----------
const buildComparisonSection = async (playId) => {
    const rows = await prisma.game_play_comparison.findMany({
        where: { play_id: playId },
        orderBy: [{ comparison_question_id: "asc" }, { attempt_number: "asc" }],
        select: {
            user_answer: true,
            is_correct: true,
            attempt_number: true,
            first_try_correct: true,
            comparison_questions: {
                select: {
                    question_order: true,
                    question_text: true,
                    left_item_id: true,
                    right_item_id: true,
                    left_price: true,
                    right_price: true,
                    correct_answer: true,
                    items_comparison_questions_left_item_idToitems: { select: { name: true } },
                    items_comparison_questions_right_item_idToitems: { select: { name: true } },
                },
            },
        },
    });

    if (rows.length === 0) return null;

    // user_answer / correct_answer อาจเป็น item_id หรือ 1/2 (ซ้าย/ขวา)
    const describe = (q, value) => {
        const left = q.items_comparison_questions_left_item_idToitems?.name;
        const right = q.items_comparison_questions_right_item_idToitems?.name;
        if (value === q.left_item_id || value === 1) return `${left ?? "ซ้าย"} (${q.left_price} บาท)`;
        if (value === q.right_item_id || value === 2) return `${right ?? "ขวา"} (${q.right_price} บาท)`;
        return String(value);
    };

    return {
        key: "comparison",
        title: "การเปรียบเทียบความคุ้มค่า",
        rows: rows.map((r) => {
            const q = r.comparison_questions;
            return {
                title: `${q.question_order}. ${q.question_text}`,
                answer: describe(q, r.user_answer),
                correct_answer: r.is_correct ? null : describe(q, q.correct_answer),
                is_correct: r.is_correct,
                note: `ครั้งที่ ${r.attempt_number}${r.first_try_correct ? " · ถูกตั้งแต่ครั้งแรก" : ""}`,
            };
        }),
    };
};

// ---------- Final Case (Unit 1 Final) ----------
const buildCaseSection = async (playId) => {
    const attempts = await prisma.game_play_case_attempts.findMany({
        where: { play_id: playId },
        orderBy: [{ case_id: "asc" }, { attempt_number: "asc" }],
        select: {
            attempt_number: true,
            is_passed: true,
            is_timeout: true,
            elapsed_seconds: true,
            final_cases: { select: { case_number: true, title: true } },
            game_play_items: {
                select: { is_correct: true, items: { select: { name: true } } },
            },
        },
    });

    if (attempts.length === 0) return null;

    return {
        key: "cases",
        title: "คดีที่สืบสวน",
        rows: attempts.map((a) => ({
            title: `คดี ${a.final_cases?.case_number ?? ""} · ${a.final_cases?.title ?? "-"} (ครั้งที่ ${a.attempt_number})`,
            answer:
                a.game_play_items.length > 0
                    ? a.game_play_items
                        .map((i) => `${i.is_correct ? "✓" : "✗"} ${i.items?.name ?? "-"}`)
                        .join(", ")
                    : "ไม่ได้เลือกหลักฐาน",
            correct_answer: null,
            is_correct: a.is_timeout ? false : a.is_passed,
            note: [
                a.is_timeout ? "หมดเวลา" : null,
                a.elapsed_seconds != null ? `ใช้เวลา ${a.elapsed_seconds} วินาที` : null,
            ]
                .filter(Boolean)
                .join(" · "),
        })),
    };
};

// ---------- Receipt Hunt (Unit 3 Level 1) ----------
const buildReceiptSection = async (playId) => {
    const items = await prisma.game_play_receipt_hunt.findMany({
        where: { play_id: playId },
        orderBy: [{ selected_at: "asc" }, { item_order: "asc" }],
        select: {
            is_target: true,
            is_selected: true,
            is_correct: true,
            items: { select: { name: true } },
        },
    });

    if (items.length === 0) return null;

    const selected = items.filter((i) => i.is_selected);
    const missed = items.filter((i) => i.is_target && !i.is_selected);

    return {
        key: "receipt",
        title: "เอกสารที่เลือก",
        rows: [
            ...selected.map((i) => ({
                title: i.items?.name ?? "-",
                answer: "เลือก",
                correct_answer: i.is_target ? null : "ไม่ใช่เอกสารการเงิน",
                is_correct: i.is_correct ?? i.is_target,
                note: "",
            })),
            ...missed.map((i) => ({
                title: i.items?.name ?? "-",
                answer: "ไม่ได้เลือก",
                correct_answer: "ต้องเลือก (เอกสารการเงิน)",
                is_correct: null,
                note: "หาไม่เจอ",
            })),
        ],
    };
};

// ---------- Money Game (Unit 3 Level 2) ----------
const buildMoneySection = async (playId, levelId) => {
    const answers = await prisma.game_play_money.findMany({
        where: { play_id: playId },
        orderBy: { answered_at: "asc" },
        select: {
            item_id: true,
            is_correct: true,
            items: { select: { name: true, price: true } },
            item_types: { select: { name: true } },
        },
    });

    if (answers.length === 0) return null;

    const levelItems = await prisma.level_items.findMany({
        where: { level_id: levelId },
        select: { item_id: true, item_types: { select: { name: true } } },
    });

    const correctByItem = new Map(levelItems.map((li) => [li.item_id, li.item_types?.name]));

    return {
        key: "money",
        title: "การแยกเงินส่วนตัว / เงินชมรม",
        rows: answers.map((a) => ({
            title: a.items?.name ?? "-",
            answer: a.item_types?.name ?? "-",
            correct_answer: a.is_correct ? null : correctByItem.get(a.item_id) || null,
            is_correct: a.is_correct,
            note: a.items?.price ? `${Number(a.items.price).toLocaleString()} บาท` : "",
        })),
    };
};

// ---------- Treasurer (Unit 3 Final) ----------
const buildTreasurerSections = async (playId) => {
    const [summary, events, receipts] = await Promise.all([
        prisma.game_play_treasurer.findUnique({ where: { play_id: playId } }),
        prisma.game_play_treasurer_events.findMany({
            where: { play_id: playId },
            orderBy: { applied_at: "asc" },
        }),
        prisma.game_play_treasurer_receipts.findMany({
            where: { play_id: playId },
            orderBy: { created_at: "asc" },
            include: { game_play_treasurer_receipt_items: true },
        }),
    ]);

    const sections = [];

    if (events.length > 0) {
        const [eventRows, choiceRows] = await Promise.all([
            prisma.final_level_events.findMany({
                where: { event_id: { in: events.map((e) => e.event_id) } },
                select: { event_id: true, title: true },
            }),
            prisma.final_level_event_choices.findMany({
                where: { choice_id: { in: events.map((e) => e.choice_id) } },
                select: { choice_id: true, choice_text: true, feedback: true },
            }),
        ]);

        const eventById = new Map(eventRows.map((e) => [e.event_id, e]));
        const choiceById = new Map(choiceRows.map((c) => [c.choice_id, c]));

        sections.push({
            key: "treasurer_events",
            title: "เหตุการณ์ระหว่างเล่น",
            rows: events.map((e) => {
                const bad = e.missing_receipt_flag || e.unnecessary_purchase_flag || e.score_change < 0;
                return {
                    title: eventById.get(e.event_id)?.title ?? `เหตุการณ์ #${e.event_id}`,
                    answer: choiceById.get(e.choice_id)?.choice_text ?? "-",
                    correct_answer: null,
                    is_correct: bad ? false : e.score_change > 0 ? true : null,
                    note: [
                        e.money_change ? `เงิน ${e.money_change > 0 ? "+" : ""}${e.money_change}` : null,
                        e.score_change ? `คะแนน ${e.score_change > 0 ? "+" : ""}${e.score_change}` : null,
                        choiceById.get(e.choice_id)?.feedback || null,
                    ]
                        .filter(Boolean)
                        .join(" · "),
                };
            }),
        });
    }

    if (receipts.length > 0) {
        const itemIds = receipts.flatMap((r) =>
            r.game_play_treasurer_receipt_items.map((i) => i.item_id)
        );
        const itemRows = await prisma.items.findMany({
            where: { items_id: { in: itemIds } },
            select: { items_id: true, name: true },
        });
        const itemName = new Map(itemRows.map((i) => [i.items_id, i.name]));

        sections.push({
            key: "treasurer_receipts",
            title: "การซื้อของและใบเสร็จ",
            rows: receipts.map((r, index) => ({
                title: `ใบเสร็จที่ ${index + 1} · ${Number(r.total_amount).toLocaleString()} บาท`,
                answer:
                    r.is_saved === true ? "เก็บใบเสร็จ" : r.is_saved === false ? "ไม่เก็บใบเสร็จ" : "ยังไม่ตัดสินใจ",
                correct_answer: r.is_saved === false ? "ควรเก็บใบเสร็จ" : null,
                is_correct: r.is_saved === true ? true : r.is_saved === false ? false : null,
                note: r.game_play_treasurer_receipt_items
                    .map((i) => `${itemName.get(i.item_id) ?? "-"} × ${i.quantity}`)
                    .join(", "),
            })),
        });
    }

    return { summary, sections };
};

// ---------- Slip Hunt (Unit 4 Level 1) ----------
const SLIP_CHOICE_LABEL = { real: "สลิปจริง", fake: "สลิปปลอม" };

const buildSlipHuntSection = async (playId) => {
    try {
        const rows = await prisma.$queryRaw`
            SELECT gsh.slip_order, gsh.player_choice, gsh.is_correct,
                   i.name AS slip_name, s.bank, s."from" AS sender,
                   s.amount, s.answer AS correct_answer, s.clue
            FROM game_play_slip_hunt gsh
            LEFT JOIN items i ON i.items_id = gsh.slip_id
            LEFT JOIN slip_details s ON s.items_id = gsh.slip_id
            WHERE gsh.play_id = ${playId}
            ORDER BY gsh.slip_order ASC
        `;

        if (rows.length === 0) return null;

        const label = (v) => SLIP_CHOICE_LABEL[String(v).toLowerCase()] || v;

        return {
            key: "slip_hunt",
            title: "การตรวจสลิป",
            rows: rows.map((r) => ({
                title: `${r.slip_order}. ${[r.bank, r.sender].filter(Boolean).join(" · ") || r.slip_name || "สลิป"}${r.amount ? ` · ${Number(r.amount).toLocaleString()} บาท` : ""
                    }`,
                answer: label(r.player_choice),
                correct_answer: r.is_correct ? null : label(r.correct_answer),
                is_correct: r.is_correct,
                note: r.clue ? `จุดสังเกต: ${r.clue}` : "",
            })),
        };
    } catch (error) {
        console.error("buildSlipHuntSection error:", error.message);
        return null;
    }
};

// ---------- Slot (Unit 4 Level 2 : กับดักพนัน) ----------
const buildSlotSection = async (playId) => {
    try {
        const rows = await prisma.$queryRaw`
            SELECT spin_no, bet, balance_before, reward, balance_after,
                   result_symbols
            FROM game_play_slot_rounds
            WHERE play_id = ${playId}
            ORDER BY spin_no ASC
        `;

        if (rows.length === 0) return null;

        const baht = (n) => `฿${Number(n).toLocaleString()}`;

        return {
            key: "slot_rounds",
            title: "การหมุนสล็อตแต่ละครั้ง",
            rows: rows.map((r, index) => {
                const prev = rows[index - 1];
                let behavior = "";

                if (prev && r.bet > prev.bet) {
                    behavior =
                        prev.reward > 0
                            ? "เพิ่มเดิมพันหลังชนะ"
                            : "เพิ่มเดิมพันหลังแพ้ (ไล่เอาทุนคืน)";
                } else if (prev && r.bet < prev.bet) {
                    behavior = "ลดเดิมพัน";
                }

                return {
                    title: `ครั้งที่ ${r.spin_no} · เดิมพัน ${baht(r.bet)}`,
                    answer: `${r.result_symbols} → ${r.reward > 0 ? `ชนะ ${baht(r.reward)}` : "แพ้"
                        }`,
                    correct_answer: null,
                    is_correct: null,
                    note: [
                        `เครดิต ${baht(r.balance_before)} → ${baht(r.balance_after)}`,
                        behavior,
                    ]
                        .filter(Boolean)
                        .join(" · "),
                };
            }),
        };
    } catch (error) {
        console.error("buildSlotSection error:", error.message);
        return null;
    }
};

// ---------- Word Clue (Unit 5 Level 1 : ตามหาคำจากคำใบ้) ----------
const buildWordSection = async (playId) => {
    try {
        const rows = await prisma.$queryRaw`
            SELECT lw.word_id, lw.word_order, lw.answer, lw.clue,
                   a.attempt_no, a.typed_text, a.is_correct
            FROM game_play_word_answers a
            JOIN level_words lw ON lw.word_id = a.word_id
            WHERE a.play_id = ${playId}
            ORDER BY lw.word_order ASC, a.attempt_no ASC
        `;

        if (rows.length === 0) return null;

        const byWord = new Map();
        for (const r of rows) {
            if (!byWord.has(r.word_id)) byWord.set(r.word_id, { ...r, tries: [] });
            byWord.get(r.word_id).tries.push(r);
        }

        return {
            key: "word_clue",
            title: "การหาคำจากคำใบ้",
            rows: [...byWord.values()].map((w) => {
                const correctTry = w.tries.find((t) => t.is_correct);
                const wrongTries = w.tries.filter((t) => !t.is_correct);

                return {
                    title: `${w.word_order}. ${w.clue}`,
                    answer: correctTry
                        ? `${w.answer} (ถูกในครั้งที่ ${correctTry.attempt_no})`
                        : "ยังหาไม่เจอ",
                    correct_answer: correctTry ? null : w.answer,
                    is_correct: correctTry
                        ? wrongTries.length === 0 ? true : null
                        : false,
                    note: wrongTries.length
                        ? `พิมพ์ผิด: ${wrongTries.map((t) => t.typed_text).join(", ")}`
                        : "",
                };
            }),
        };
    } catch (error) {
        console.error("buildWordSection error:", error.message);
        return null;
    }
};

// ---------- Budget (Unit 5 Level 2 : จัดสรรงบประมาณให้เมือง) ----------
const BUDGET_LABEL = {
    school: "การศึกษา (โรงเรียน)",
    hospital: "สาธารณสุข (โรงพยาบาล)",
    road: "คมนาคม (ถนน)",
    fire: "ความปลอดภัย (ดับเพลิง)",
    park: "สวนสาธารณะ",
    water: "ระบบน้ำสะอาด",
};

const buildBudgetSection = async (playId) => {
    try {
        const budgets = await gamePlayService.getBudgetAllocations(playId);
        if (!budgets) return null;

        const budgetEvent = await gamePlayService.getBudgetEvent(playId);
        const result = gamePlayService.calcBudgetResult(budgets, budgetEvent);
        const total = gamePlayService.BUDGET_TOTAL;

        return {
            key: "budget_allocation",
            title: "การจัดสรรงบประมาณ",
            rows: [
                ...gamePlayService.BUDGET_CATEGORIES.map((code) => ({
                    title: BUDGET_LABEL[code] || code,
                    answer: `${budgets[code]} เหรียญ (${Math.round((budgets[code] / total) * 100)}%)`,
                    correct_answer: null,
                    is_correct: null,
                    note: budgets[code] === 0 ? "ไม่ได้รับงบเลย" : "",
                })),
                {
                    title: "สรุป",
                    answer: `คะแนน ${result.score}/100 · Rank ${result.rank}`,
                    correct_answer: null,
                    is_correct: null,
                    note: [
                        `ความสุขประชาชน ${result.happiness}% (ยิ่งกระจายงบสมดุลยิ่งสูง)`,
                        result.event
                            ? `เหตุการณ์ ${result.event.title}: ${result.event.category_name} ${result.event.amount} เหรียญ${result.event.triggered ? ` (ต่ำกว่า ${result.event.min_required} หัก ${result.event.penalty} คะแนน)` : " (รับมือได้)"}`
                            : null,
                    ]
                        .filter(Boolean)
                        .join(" · "),
                },
            ],
        };
    } catch (error) {
        console.error("buildBudgetSection error:", error.message);
        return null;
    }
};

// ---------- Integrity Inspector (Unit 5 Level 3) ----------
const ACTION_LABEL = { approve: "อนุมัติ", reject: "ปฏิเสธ" };

const buildInspectorSection = async (playId) => {
    try {
        const decisions = await gamePlayService.getProjectDecisions(playId);
        if (decisions.length === 0) return null;

        return {
            key: "project_decisions",
            title: "การตรวจเอกสารโครงการ",
            rows: decisions.map((d) => ({
                title: `${d.decision_order}. ${d.name} · งบ ${d.budget_text} / ราคากลาง ${d.price_estimate}`,
                answer: d.took_bribe
                    ? "รับสินบน แล้วอนุมัติ"
                    : ACTION_LABEL[d.action] || d.action,
                correct_answer: d.is_correct
                    ? null
                    : `${ACTION_LABEL[d.correct_action]}${d.has_bribe ? " (และไม่รับสินบน)" : ""}`,
                is_correct: d.is_correct,
                note: [
                    d.refused_bribe ? "ปฏิเสธสินบน" : null,
                    `คะแนน ${d.score_delta > 0 ? "+" : ""}${d.score_delta}`,
                    d.integrity_delta ? `Integrity ${d.integrity_delta}` : null,
                    d.explanation || null,
                ]
                    .filter(Boolean)
                    .join(" · "),
            })),
        };
    } catch (error) {
        console.error("buildInspectorSection error:", error.message);
        return null;
    }
};

// ---------- Crisis Response (Unit 6 Level 1) ----------
const SPECIAL_LABEL = {
    fakeNews: "📢 ข่าวปลอมระบาด",
    virtueDay: "🎉 วันคุณธรรม",
    teacherHelp: "👨‍🏫 ครูเวรมาช่วย",
};

const buildCrisisSection = async (playId) => {
    try {
        const timeline = await gamePlayService.getCrisisTimeline(playId);
        if (timeline.length === 0) return null;

        return {
            key: "crisis_responses",
            title: "การรับมือเหตุการณ์ในโรงเรียน (เรียงตามเวลา)",
            rows: timeline.map((t) => {
                if (t.kind === "special") {
                    return {
                        title: `เหตุการณ์พิเศษ: ${SPECIAL_LABEL[t.special_code] || t.special_code}`,
                        answer: t.integrity_delta
                            ? `Integrity ${t.integrity_delta > 0 ? "+" : ""}${t.integrity_delta}`
                            : "-",
                        correct_answer: null,
                        is_correct: null,
                        note: "เกิดขึ้นเองแบบสุ่ม ไม่ใช่การตัดสินใจของนิสิต",
                    };
                }

                const answer =
                    t.outcome === "timeout"
                        ? "ไม่ได้ช่วย (หลุดมือ)"
                        : t.outcome === "auto"
                            ? `ครูเวรช่วยแก้ให้ (${t.choice_label})`
                            : t.choice_label;

                return {
                    title: `${t.spawn_no}. ${t.title}`,
                    answer,
                    correct_answer: null,
                    // เลือกแล้ว Integrity ไม่ลด = ดี / ลด หรือ หลุดมือ = ไม่ดี
                    is_correct: t.outcome === "auto" ? null : t.integrity_delta >= 0,
                    note: [
                        `คะแนน ${t.score_delta > 0 ? "+" : ""}${t.score_delta}`,
                        t.integrity_delta ? `Integrity ${t.integrity_delta > 0 ? "+" : ""}${t.integrity_delta}` : null,
                        t.outcome === "choice" && t.response_seconds != null
                            ? `ตัดสินใจใน ${t.response_seconds} วิ`
                            : null,
                        t.outcome === "timeout" ? t.timeout_note : t.note,
                    ]
                        .filter(Boolean)
                        .join(" · "),
                };
            }),
        };
    } catch (error) {
        console.error("buildCrisisSection error:", error.message);
        return null;
    }
};

// ---------- ShadowMirror (Unit 6 Level 3 : กระจกสะท้อนใจ) ----------
const SHADOW_MIRROR_TRAIT_LABEL = {
    logic: "Logic · ตรรกะ",
    empathy: "Empathy · ความเห็นใจ",
    responsibility: "Responsibility · ความรับผิดชอบ",
    consistency: "Consistency · ความสอดคล้อง",
};

const SHADOW_MIRROR_BADGE_LABEL = {
    LEGEND: "ตำนานแห่งกระจก",
    PLATINUM: "ตรารางวัลระดับแพลทินัม",
    GOLD: "ตรารางวัลระดับทอง",
    SILVER: "ตรารางวัลระดับเงิน",
    BRONZE: "ตรารางวัลระดับบรอนซ์",
};

const buildShadowMirrorSection = async (playId) => {
    try {
        const row = await prisma.game_play_shadow_mirror.findUnique({
            where: { play_id: playId },
        });

        if (!row) return null;

        const answers = Array.isArray(row.answers) ? row.answers : [];

        const qaRows = answers.map((a, index) => ({
            title: `ข้อ ${index + 1} · ${a?.question ?? "-"}`,
            answer: a?.answer?.trim() ? a.answer : "(ไม่ได้ตอบ)",
            correct_answer: null,
            is_correct: null,
            note: "",
        }));

        const traitRows = [
            { key: "logic", score: row.logic_score, note: row.logic_note },
            { key: "empathy", score: row.empathy_score, note: row.empathy_note },
            {
                key: "responsibility",
                score: row.responsibility_score,
                note: row.responsibility_note,
            },
            { key: "consistency", score: row.consistency_score, note: row.consistency_note },
        ].map((t) => ({
            title: SHADOW_MIRROR_TRAIT_LABEL[t.key] || t.key,
            answer: `${t.score}/100`,
            correct_answer: null,
            is_correct: null,
            note: t.note || "",
        }));

        const summaryRow = {
            title: "สรุปภาพรวมจาก AI",
            answer: `คะแนนเฉลี่ย ${Number(row.avg_score).toFixed(1)}/100 · ${SHADOW_MIRROR_BADGE_LABEL[row.badge_key] || row.badge_key
                }`,
            correct_answer: null,
            is_correct: null,
            note: [
                row.overall_reflection || null,
                row.shadow_message ? `เงาบอกว่า: ${row.shadow_message}` : null,
            ]
                .filter(Boolean)
                .join(" · "),
        };

        // แยกเป็น 2 หัวข้อ ให้รู้ว่าส่วนไหนนิสิตตอบเอง ส่วนไหน AI วิเคราะห์
        return [
            {
                key: "shadow_mirror_answers",
                title: "คำตอบของนิสิต",
                rows: qaRows,
            },
            {
                key: "shadow_mirror_ai",
                title: "🤖 ผลวิเคราะห์โดย AI (Gemini)",
                rows: [...traitRows, summaryRow],
            },
        ];
    } catch (error) {
        console.error("buildShadowMirrorSection error:", error.message);
        return null;
    }
};

exports.getLevelPlayDetail = async (req, res) => {
    try {
        const studentUserId = Number(req.params.id);
        const levelId = Number(req.params.levelId);

        if (!Number.isInteger(studentUserId) || !Number.isInteger(levelId)) {
            return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
        }

        const student = await prisma.users.findFirst({
            where: { id: studentUserId, role_id: STUDENT_ROLE_ID },
            select: { id: true },
        });

        if (!student) {
            return res.status(404).json({ message: "ไม่พบนิสิต" });
        }
        const isBadgeLevel = await gamePlayService.isShadowMirrorLevel(levelId);

        let playWhere = {
            user_id: studentUserId,
            level_id: levelId,
            completed_at: { not: null },
        };

        if (isBadgeLevel) {
            const hasRealPlay = await prisma.game_play_history.findFirst({
                where: { ...playWhere, game_play_shadow_mirror: { isNot: null } },
                select: { play_id: true },
            });

            if (hasRealPlay) {
                playWhere = { ...playWhere, game_play_shadow_mirror: { isNot: null } };
            }
        }

        const [level, play, playCount] = await Promise.all([
            prisma.level.findUnique({
                where: { level_id: levelId },
                select: { level_id: true, title: true, order_no: true, unit_id: true },
            }),
            prisma.game_play_history.findFirst({
                where: playWhere,
                orderBy: { completed_at: "desc" },
            }),
            prisma.game_play_history.count({ where: playWhere }),
        ]);

        if (!level) {
            return res.status(404).json({ message: "ไม่พบด่านนี้" });
        }

        if (!play) {
            return res.json({ data: { level, play: null, sections: [] } });
        }

        // ด่านที่ให้ "ตรา" แทน IP (ShadowMirror) : ส่งตราของรอบล่าสุดไปให้ popup
        let badge = null;

        if (isBadgeLevel) {
            const sm = await prisma.game_play_shadow_mirror
                .findUnique({ where: { play_id: play.play_id } })
                .catch(() => null);

            // มีแถวคำตอบ → ใช้ตราที่บันทึกไว้ / ไม่มี แต่รอบนี้มี max_score (รอบใหม่) → คิดจากคะแนน
            // รอบเก่าที่เล่นก่อนมีระบบบันทึก (max_score = 0) จะไม่แสดงตรา
            const avg = sm
                ? Number(sm.avg_score)
                : Number(play.max_score) > 0
                    ? Number(play.score) || 0
                    : null;

            if (avg !== null) {
                const ranks = gamePlayService.SHADOW_MIRROR_RANKS;
                const rank = ranks.find((r) => r.test(avg)) || ranks[ranks.length - 1];
                const key = sm?.badge_key || rank.key;
                const th = ranks.find((r) => r.key === key)?.th || key;

                badge = { key, th, avg: Math.round(avg * 10) / 10 };
            }
        }

        const [questions, bubbles, needWant, comparison, cases, receipt, money, treasurer, slipHunt, slot, wordClue, budget, inspector, crisis, shadowMirror] =
            await Promise.all([
                buildQuestionSection(play.play_id),
                buildBubbleSection(play.play_id),
                buildNeedWantSection(play.play_id, levelId),
                buildComparisonSection(play.play_id),
                buildCaseSection(play.play_id),
                buildReceiptSection(play.play_id),
                buildMoneySection(play.play_id, levelId),
                buildTreasurerSections(play.play_id),
                buildSlipHuntSection(play.play_id),
                buildSlotSection(play.play_id),
                buildWordSection(play.play_id),
                buildBudgetSection(play.play_id),
                buildInspectorSection(play.play_id),
                buildCrisisSection(play.play_id),
                buildShadowMirrorSection(play.play_id),
            ]);

        const sections = [
            bubbles,
            questions,
            needWant,
            comparison,
            cases,
            receipt,
            money,
            ...treasurer.sections,
            slipHunt,
            slot,
            wordClue,
            budget,
            inspector,
            crisis,
            ...(Array.isArray(shadowMirror) ? shadowMirror : [shadowMirror]),
        ].filter(Boolean);

        return res.json({
            data: {
                level,
                play: {
                    play_id: play.play_id,
                    attempt_number: playCount, // รอบล่าสุด = ครั้งที่เท่านี้
                    started_at: play.started_at,
                    completed_at: play.completed_at,
                    duration_seconds: toSeconds(play.started_at, play.completed_at),
                    status: play.status,
                    score: play.score,
                    max_score: play.max_score,
                    correct_count: play.correct_count,
                    wrong_count: play.wrong_count,
                    // ด่านที่ให้ตรา: ไม่แสดง IP (ค่าเก่าที่ค้างอยู่ไม่ใช่ผลจริง)
                    earned_ip: isBadgeLevel ? null : play.earned_ip,
                    is_badge_level: isBadgeLevel,
                    badge,
                },
                treasurer: treasurer.summary
                    ? {
                        grade: treasurer.summary.grade,
                        success: treasurer.summary.success,
                        final_balance: treasurer.summary.final_balance,
                        spent_amount: treasurer.summary.spent_amount,
                        fail_reason: treasurer.summary.fail_reason,
                        feedback: treasurer.summary.feedback,
                    }
                    : null,
                sections,
            },
        });
    } catch (error) {
        console.error("Get level play detail error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};