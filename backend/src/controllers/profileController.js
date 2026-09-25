const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const userProgressController = require("./userProgressController");

// ============================================================
// Profile (ข้อมูลของผู้ใช้ที่ login อยู่)
// ------------------------------------------------------------
// GET  /api/profile           ดึงข้อมูล + สถิติ (IP, streak, progress)
// PUT  /api/profile           แก้ข้อมูลส่วนตัว
// PUT  /api/profile/password  เปลี่ยนรหัสผ่าน
// ============================================================

const STUDENT_ROLE_ID = 1;

const PASSED_STATUSES = ["PASS", "PERFECT"];

// student / teacher จาก role_id + ข้อมูลที่ผูกอยู่
const getRole = (user) => {
    if (user.role_id === STUDENT_ROLE_ID) return "student";
    if (user.teachers?.length) return "teacher";
    return "student";
};

// % ความคืบหน้าภาพรวม "ทุกบท" (รวม Unit ที่ยังไม่เปิด)
// ------------------------------------------------------------
// แต่ละบทมีน้ำหนักเท่ากัน:
//   progress = เฉลี่ย( ด่านที่ผ่านในบท / ด่านทั้งหมดในบท )
// บทที่ยังไม่มีด่านใน DB (ยังไม่ได้ทำเนื้อหา) นับเป็น 0%
// เช่น 6 บท ผ่านครบ 3 บท → 50%
const getProgressPercent = async (userId) => {
    const units = await prisma.units.findMany({
        select: { unit_id: true },
    });

    if (units.length === 0) return 0;

    const levels = await prisma.level.findMany({
        select: { level_id: true, unit_id: true },
    });

    const passedRows = await prisma.user_level_progress.findMany({
        where: {
            user_id: userId,
            status: { in: PASSED_STATUSES },
        },
        select: { level_id: true },
    });

    const passedIds = new Set(passedRows.map((r) => r.level_id));

    const totalRatio = units.reduce((sum, unit) => {
        const unitLevels = levels.filter((l) => l.unit_id === unit.unit_id);

        if (unitLevels.length === 0) return sum; // บทที่ยังไม่มีด่าน = 0%

        const passed = unitLevels.filter((l) => passedIds.has(l.level_id)).length;

        return sum + passed / unitLevels.length;
    }, 0);

    return Math.round((totalRatio / units.length) * 100);
};

// streak ที่แสดง: ถ้าไม่ได้เข้าเกินเมื่อวาน → ขาดแล้ว แสดง 0
// (ค่าใน DB จะถูกรีเซ็ตเป็น 1 ตอน Login ครั้งถัดไป)
const getDisplayStreak = (stats) => {
    if (!stats?.last_login_date || !stats.current_streak) return 0;

    const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Bangkok",
    });
    const lastDay = new Date(stats.last_login_date).toISOString().slice(0, 10);

    const diffDays = Math.round(
        (Date.parse(today) - Date.parse(lastDay)) / (24 * 60 * 60 * 1000)
    );

    return diffDays <= 1 ? stats.current_streak : 0;
};

// รวมข้อมูลโปรไฟล์ให้อยู่ในรูปแบบเดียวกันทั้งนักเรียน/อาจารย์
const buildProfile = async (userId) => {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            role_id: true,
            students: {
                take: 1,
                select: {
                    first_name: true,
                    last_name: true,
                    gender: true,
                    birth_year: true,
                    entry_year: true,
                    major_id: true,
                    majors: { select: { faculty_id: true } },
                },
            },
            teachers: {
                take: 1,
                select: {
                    first_name: true,
                    last_name: true,
                    gender: true,
                    dept_id: true,
                    position: true,
                },
            },
            user_stats: {
                select: {
                    integrity_points: true,
                    current_streak: true,
                    last_login_date: true,
                },
            },
        },
    });

    if (!user) return null;

    const role = getRole(user);
    const student = user.students[0] || null;
    const teacher = user.teachers[0] || null;

    let faculty = "";
    if (role === "teacher" && teacher?.dept_id) {
        const dept = await prisma.departments.findUnique({
            where: { dept_id: teacher.dept_id },
            select: { faculty_id: true },
        });
        faculty = dept?.faculty_id ?? "";
    } else if (student?.majors?.faculty_id) {
        faculty = student.majors.faculty_id;
    }

    const person = role === "teacher" ? teacher : student;

    return {
        id: user.id,
        role,
        username: user.username,
        email: user.email,

        firstName: person?.first_name || "",
        lastName: person?.last_name || "",
        gender: person?.gender || "",
        faculty: faculty === "" ? "" : String(faculty),

        // student
        age: student?.birth_year
            ? String(new Date().getFullYear() - student.birth_year)
            : "",
        year: student?.entry_year ? String(student.entry_year) : "",
        major: student?.major_id ? String(student.major_id) : "",

        // teacher
        department: teacher?.dept_id ? String(teacher.dept_id) : "",
        position: teacher?.position || "",

        // stats (แสดงใน Header)
        stats: {
            integrity_points: user.user_stats?.integrity_points ?? 0,
            current_streak: getDisplayStreak(user.user_stats),
            progress_percent:
                role === "student"
                    ? await getProgressPercent(user.id)
                    : 0,
        },
    };
};

// ============================================================
// GET /api/profile
// ============================================================

exports.getProfile = async (req, res) => {
    try {
        const profile = await buildProfile(Number(req.user.id));

        if (!profile) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        return res.json({ data: profile });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// PUT /api/profile
// ============================================================

exports.updateProfile = async (req, res) => {
    try {
        const userId = Number(req.user.id);

        const {
            username,
            email,
            firstName,
            lastName,
            gender,

            // student
            age,
            major,
            year,

            // teacher
            faculty,
            department,
            position,
        } = req.body;

        if (!username || !email || !firstName || !lastName || !gender) {
            return res.status(400).json({
                message: "กรุณากรอกข้อมูลให้ครบ",
            });
        }

        const current = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role_id: true,
                teachers: { take: 1, select: { teacher_id: true } },
            },
        });

        if (!current) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        // username / email ต้องไม่ซ้ำกับคนอื่น
        const duplicate = await prisma.users.findFirst({
            where: {
                id: { not: userId },
                OR: [{ email }, { username }],
            },
            select: { id: true },
        });

        if (duplicate) {
            return res.status(400).json({
                message: "Email หรือ Username นี้ถูกใช้แล้ว",
            });
        }

        const role = getRole(current);

        if (role === "teacher") {
            if (!faculty || !department || !position) {
                return res.status(400).json({
                    message: "กรุณากรอกคณะ ภาควิชา และตำแหน่งให้ครบ",
                });
            }

            const dept = await prisma.departments.findUnique({
                where: { dept_id: Number(department) },
                select: { dept_id: true, faculty_id: true },
            });

            if (!dept || dept.faculty_id !== Number(faculty)) {
                return res.status(400).json({
                    message: "ไม่พบภาควิชาที่เลือกในคณะนี้",
                });
            }

            const teacherData = {
                first_name: firstName,
                last_name: lastName,
                gender,
                dept_id: dept.dept_id,
                position,
            };

            await prisma.$transaction(async (tx) => {
                await tx.users.update({
                    where: { id: userId },
                    data: { username, email },
                });

                // มีแถวใน teachers แล้ว → แก้ / ยังไม่มี → สร้างใหม่
                const updated = await tx.teachers.updateMany({
                    where: { user_id: userId },
                    data: teacherData,
                });

                if (updated.count === 0) {
                    await tx.teachers.create({
                        data: { ...teacherData, user_id: userId },
                    });
                }
            });
        } else {
            const ageNumber = Number(age);
            const majorId = Number(major);

            if (!Number.isInteger(ageNumber) || ageNumber <= 0 || !majorId || !year) {
                return res.status(400).json({
                    message: "กรุณากรอกอายุ สาขา และชั้นปีให้ถูกต้อง",
                });
            }

            const majorRow = await prisma.majors.findUnique({
                where: { major_id: majorId },
                select: { major_id: true },
            });

            if (!majorRow) {
                return res.status(400).json({ message: "ไม่พบสาขาที่เลือก" });
            }

            const studentData = {
                first_name: firstName,
                last_name: lastName,
                gender,
                birth_year: new Date().getFullYear() - ageNumber,
                entry_year: Number(year),
                major_id: majorId,
            };

            await prisma.$transaction(async (tx) => {
                await tx.users.update({
                    where: { id: userId },
                    data: { username, email },
                });

                // มีแถวใน students แล้ว → แก้ / ยังไม่มี → สร้างใหม่
                const updated = await tx.students.updateMany({
                    where: { user_id: userId },
                    data: studentData,
                });

                if (updated.count === 0) {
                    await tx.students.create({
                        data: { ...studentData, user_id: userId },
                    });
                }
            });
        }

        const profile = await buildProfile(userId);

        return res.json({
            message: "บันทึกข้อมูลสำเร็จ",
            data: profile,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// PUT /api/profile/password
// ============================================================

exports.changePassword = async (req, res) => {
    try {
        const userId = Number(req.user.id);
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "กรุณากรอกรหัสผ่านให้ครบ",
            });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({
                message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร",
            });
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
            });
        }

        await prisma.users.update({
            where: { id: userId },
            data: { password: await bcrypt.hash(newPassword, 10) },
        });

        return res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// GET /api/profile/overview
// ------------------------------------------------------------
// ภาพรวมทุกบท (รวมบทที่ยังไม่เปิด) สำหรับหน้า "ความคืบหน้าของฉัน"
//
// unit.status
//   completed    ผ่านครบทุกด่าน
//   in_progress  เล่นไปแล้วบางส่วน
//   not_started  ปลดล็อกแล้ว ยังไม่เคยเล่น
//   locked       ยังไม่ปลดล็อก
//   coming_soon  บทยังไม่เปิด / ยังไม่มีด่านใน DB
//
// level.state (เหมือนก้อนหินบนแผนที่)
//   passed / ready / locked
// ============================================================

const buildOverview = async (userId) => {
    const [units, levels, unitProgress, levelProgress, history, latestPlays, firstPlays, preTestDone] =
        await Promise.all([
            prisma.units.findMany({
                orderBy: { order_number: "asc" },
                select: {
                    unit_id: true,
                    name_th: true,
                    name_en: true,
                    order_number: true,
                    is_active: true,
                },
            }),
            prisma.level.findMany({
                orderBy: [{ unit_id: "asc" }, { order_no: "asc" }],
                select: {
                    level_id: true,
                    unit_id: true,
                    title: true,
                    order_no: true,
                    is_final: true,
                },
            }),
            prisma.user_progress.findMany({
                where: { user_id: userId },
                select: { unit_id: true, is_locked: true },
            }),
            prisma.user_level_progress.findMany({
                where: { user_id: userId },
                select: {
                    level_id: true,
                    status: true,
                    is_locked: true,
                    best_score: true,
                },
            }),
            prisma.game_play_history.groupBy({
                by: ["level_id"],
                where: { user_id: userId, completed_at: { not: null } },
                _count: { _all: true },
                _max: { earned_ip: true, completed_at: true },
            }),
            // รอบล่าสุดของแต่ละด่าน (ไว้แสดง "คะแนนครั้งล่าสุด")
            prisma.game_play_history.findMany({
                where: { user_id: userId, completed_at: { not: null } },
                orderBy: { completed_at: "desc" },
                distinct: ["level_id"],
                select: { level_id: true, earned_ip: true, status: true },
            }),
            // รอบแรกที่เล่นจบของแต่ละด่าน (ไว้เทียบ "ครั้งแรก → ล่าสุด")
            prisma.game_play_history.findMany({
                where: { user_id: userId, completed_at: { not: null } },
                orderBy: { completed_at: "asc" },
                distinct: ["level_id"],
                select: { level_id: true, earned_ip: true },
            }),
            userProgressController.hasCompletedPreTest(userId),
        ]);

    const unitProgressById = new Map(unitProgress.map((u) => [u.unit_id, u]));
    const levelProgressById = new Map(levelProgress.map((l) => [l.level_id, l]));
    const historyById = new Map(history.map((h) => [h.level_id, h]));
    const latestById = new Map(latestPlays.map((p) => [p.level_id, p]));
    const firstById = new Map(firstPlays.map((p) => [p.level_id, p]));

    const firstActiveUnitId =
        units.find((u) => u.is_active)?.unit_id ?? null;

    const result = units.map((unit) => {
        const unitLevels = levels.filter((l) => l.unit_id === unit.unit_id);

        const comingSoon = !unit.is_active || unitLevels.length === 0;

        // ล็อกบท: ใช้กติกาเดียวกับ /api/user-progress
        let unitLocked;
        if (comingSoon) {
            unitLocked = true;
        } else if (unit.unit_id === firstActiveUnitId) {
            unitLocked =
                !preTestDone ||
                (unitProgressById.get(unit.unit_id)?.is_locked ?? false);
        } else {
            unitLocked =
                unitProgressById.get(unit.unit_id)?.is_locked ?? true;
        }

        const levelRows = unitLevels.map((level, index) => {
            const progress = levelProgressById.get(level.level_id) || null;
            const played = historyById.get(level.level_id) || null;
            const latest = latestById.get(level.level_id) || null;
            const first = firstById.get(level.level_id) || null;

            const passed = PASSED_STATUSES.includes(progress?.status);

            let state;
            if (unitLocked) state = "locked";
            else if (passed) state = "passed";
            else if (index === 0 || progress?.is_locked === false) state = "ready";
            else state = "locked";

            return {
                level_id: level.level_id,
                order_no: level.order_no,
                title: level.title,
                is_final: level.is_final,
                state,
                status: progress?.status || null,
                best_ip: played?._max.earned_ip ?? 0,
                first_ip: first?.earned_ip ?? null,
                last_ip: latest?.earned_ip ?? null,
                last_status: latest?.status ?? null,
                best_score: progress?.best_score ?? 0,
                times_played: played?._count._all ?? 0,
                last_played: played?._max.completed_at ?? null,
            };
        });

        const passedCount = levelRows.filter((l) => l.state === "passed").length;
        const playedAny = levelRows.some((l) => l.times_played > 0);

        const percent = unitLevels.length
            ? Math.round((passedCount / unitLevels.length) * 100)
            : 0;

        let status;
        if (comingSoon) status = "coming_soon";
        else if (unitLevels.length && passedCount === unitLevels.length) status = "completed";
        else if (passedCount > 0 || playedAny) status = "in_progress";
        else if (unitLocked) status = "locked";
        else status = "not_started";

        return {
            unit_id: unit.unit_id,
            order_number: unit.order_number,
            name_th: unit.name_th,
            name_en: unit.name_en,
            status,
            is_locked: unitLocked,
            percent,
            passed_levels: passedCount,
            total_levels: unitLevels.length,
            total_best_ip: levelRows.reduce((sum, l) => sum + l.best_ip, 0),
            levels: levelRows,
        };
    });

    return {
        pre_test_done: preTestDone,
        overall_percent: await getProgressPercent(userId),
        units: result,
    };
};

// ใช้ร่วมกับหน้าแดชบอร์ดอาจารย์ (ดูรายละเอียดนิสิต)
exports.buildOverview = buildOverview;

exports.getOverview = async (req, res) => {
    try {
        const data = await buildOverview(Number(req.user.id));
        return res.json({ data });
    } catch (error) {
        console.error("Get overview error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// GET /api/profile/daily-quests
// ------------------------------------------------------------
// ภารกิจประจำวัน (รีเซ็ตทุกเที่ยงคืน เวลาไทย)
// คำนวณสดจาก game_play_history ของ "วันนี้" ไม่ต้องมีตารางเพิ่ม
//   1. เล่นจบ 1 ด่านวันนี้
//   2. ได้ PERFECT 1 ครั้งวันนี้
//   3. เก็บ IP ให้ได้ 10 แต้มวันนี้
// ============================================================

const DAILY_QUESTS = [
    { key: "complete_level", title: "เล่นจบ 1 ด่าน", target: 1 },
    { key: "perfect", title: "ได้ PERFECT 1 ครั้ง", target: 1 },
    { key: "earn_ip", title: "เก็บ IP ให้ได้ 10 แต้ม", target: 10 },
];

exports.getDailyQuests = async (req, res) => {
    try {
        const userId = Number(req.user.id);

        // ช่วงเวลา "วันนี้" ตามเวลาไทย (00:00 - 24:00 +07:00)
        const today = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Bangkok",
        });
        const start = new Date(`${today}T00:00:00+07:00`);
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

        const plays = await prisma.game_play_history.findMany({
            where: {
                user_id: userId,
                completed_at: { gte: start, lt: end },
            },
            select: { status: true, earned_ip: true },
        });

        const progressByKey = {
            complete_level: plays.length,
            perfect: plays.filter((p) => p.status === "PERFECT").length,
            earn_ip: plays.reduce((sum, p) => sum + (p.earned_ip || 0), 0),
        };

        const quests = DAILY_QUESTS.map((quest) => {
            const progress = Math.min(progressByKey[quest.key] || 0, quest.target);

            return {
                ...quest,
                progress,
                completed: progress >= quest.target,
            };
        });

        return res.json({
            data: {
                date: today,
                completed_count: quests.filter((q) => q.completed).length,
                quests,
            },
        });
    } catch (error) {
        console.error("Get daily quests error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// GET /api/profile/leaderboard
// ------------------------------------------------------------
// จัดอันดับจาก user_stats.integrity_points
// (= ผลรวมคะแนนดีที่สุดของแต่ละด่าน → เล่นซ้ำปั๊มคะแนนไม่ได้)
//   - เฉพาะนิสิต (role_id = 1) ที่มีคะแนน > 0
//   - คะแนนเท่ากัน → ผ่านด่านมากกว่าอยู่ก่อน → สมัครก่อนอยู่ก่อน
//   - ชื่อที่แสดง: "ชื่อจริง + ตัวแรกของนามสกุล." เช่น "สมชาย ก."
//     ไม่มีชื่อจริง → ใช้ username
// response: { top: [...5 อันดับ], me: {...} | null }
// ============================================================

const LEADERBOARD_SIZE = 5;

const toDisplayName = (user) => {
    const student = user.students?.[0];
    const first = student?.first_name?.trim();
    const last = student?.last_name?.trim();

    if (first) {
        return last ? `${first} ${Array.from(last)[0]}.` : first;
    }

    return user.username;
};

exports.getLeaderboard = async (req, res) => {
    try {
        const userId = Number(req.user.id);

        const stats = await prisma.user_stats.findMany({
            where: { integrity_points: { gt: 0 } },
            select: { user_id: true, integrity_points: true },
        });

        const users = await prisma.users.findMany({
            where: {
                id: { in: stats.map((s) => s.user_id) },
                role_id: STUDENT_ROLE_ID,
            },
            select: {
                id: true,
                username: true,
                students: {
                    take: 1,
                    select: { first_name: true, last_name: true },
                },
            },
        });

        const userById = new Map(users.map((u) => [u.id, u]));

        const passedCounts = await prisma.user_level_progress.groupBy({
            by: ["user_id"],
            where: {
                user_id: { in: users.map((u) => u.id) },
                status: { in: PASSED_STATUSES },
            },
            _count: { _all: true },
        });

        const passedByUser = new Map(
            passedCounts.map((p) => [p.user_id, p._count._all])
        );

        const ranking = stats
            .filter((s) => userById.has(s.user_id))
            .map((s) => ({
                user_id: s.user_id,
                name: toDisplayName(userById.get(s.user_id)),
                score: s.integrity_points,
                passed_levels: passedByUser.get(s.user_id) || 0,
            }))
            .sort(
                (a, b) =>
                    b.score - a.score ||
                    b.passed_levels - a.passed_levels ||
                    a.user_id - b.user_id
            )
            .map((row, index) => ({
                ...row,
                rank: index + 1,
                is_me: row.user_id === userId,
            }));

        const top = ranking.slice(0, LEADERBOARD_SIZE);
        const me = ranking.find((row) => row.is_me) || null;

        return res.json({
            data: {
                top,
                // ส่ง me เมื่อไม่อยู่ใน top (ให้ frontend แสดงแถว "คุณ" ด้านล่าง)
                me: me && me.rank > LEADERBOARD_SIZE ? me : null,
                total_players: ranking.length,
            },
        });
    } catch (error) {
        console.error("Get leaderboard error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// สถานะ Pre-Test / Post-Test
// ------------------------------------------------------------
// Post-Test ทำได้เมื่อ:
//   1. ทำ Pre-Test แล้ว
//   2. เล่นผ่านครบ "ทุกบท" (ทั้ง 6 บท) — บทที่ยังไม่เปิด/ยังไม่มีด่าน
//      นับว่ายังไม่ครบ
//   3. ยังไม่เคยทำ Post-Test
// ============================================================

const countQuizAnswers = (userId, quizType) =>
    prisma.user_quiz_answers.count({
        where: {
            user_id: userId,
            quizzes: { is: { quiz_type: quizType } },
        },
    });

const getTestStatus = async (userId) => {
    const [overview, preCount, postCount] = await Promise.all([
        buildOverview(userId),
        countQuizAnswers(userId, "pre_test"),
        countQuizAnswers(userId, "post_test"),
    ]);

    const unitsTotal = overview.units.length;
    const unitsCompleted = overview.units.filter(
        (u) => u.status === "completed"
    ).length;

    const preTestDone = preCount > 0;
    const postTestDone = postCount > 0;
    const allUnitsCompleted = unitsTotal > 0 && unitsCompleted === unitsTotal;

    return {
        pre_test_done: preTestDone,
        post_test_done: postTestDone,
        units_completed: unitsCompleted,
        units_total: unitsTotal,
        post_test_unlocked: preTestDone && allUnitsCompleted && !postTestDone,
    };
};

// ใช้เช็กฝั่ง backend ตอนบันทึกคำตอบ Post-Test (กันยิง API ตรง)
exports.getTestStatus = getTestStatus;

// GET /api/profile/test-status
exports.getTestStatusHandler = async (req, res) => {
    try {
        const data = await getTestStatus(Number(req.user.id));
        return res.json({ data });
    } catch (error) {
        console.error("Get test status error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};