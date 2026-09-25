const prisma = require("../lib/prisma");
const { closeOpenSessions } = require("./activityController");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ============================================================
// ROLE
// ============================================================
//
// student = role_id 1 (เหมือนเดิม)
// teacher = หา role_id จากตาราง roles ที่ role_name = 'อาจารย์'
//           (หรือ 'teacher') ไม่ hardcode เลข เผื่อ role_id ใน DB ไม่ใช่ 2
// ============================================================

const STUDENT_ROLE_ID = 1;

const ROLE = {
    STUDENT: "student",
    TEACHER: "teacher",
};

const getTeacherRoleId = async () => {
    const role = await prisma.roles.findFirst({
        where: {
            OR: [
                { role_name: "อาจารย์" },
                {
                    role_name: {
                        equals: ROLE.TEACHER,
                        mode: "insensitive",
                    },
                },
            ],
        },
        select: { role_id: true },
    });

    return role?.role_id ?? null;
};

// แปลง role_id → "student" / "teacher"
const getRoleName = async (roleId) => {
    if (Number(roleId) === STUDENT_ROLE_ID) {
        return ROLE.STUDENT;
    }

    const teacherRoleId = await getTeacherRoleId();

    if (teacherRoleId !== null && Number(roleId) === teacherRoleId) {
        return ROLE.TEACHER;
    }

    return null;
};

// ตรวจรหัสอาจารย์ (เทียบแบบ timing-safe)
const isValidInviteCode = (inputCode) => {
    const expected = process.env.TEACHER_INVITE_CODE;

    if (!expected || !inputCode) {
        return false;
    }

    const a = Buffer.from(String(inputCode));
    const b = Buffer.from(String(expected));

    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// ไม่ส่ง password (hash) กลับไปให้ Frontend
const toPublicUser = (user, role) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role_id: user.role_id,
    role,
});

// ============================================================
// Register
// ============================================================
//
// body.role = "student" (ค่าเริ่มต้น) หรือ "teacher"
//
// student: username, firstName, lastName, email, password,
//          gender, age, faculty, major, year
// teacher: username, firstName, lastName, email, password,
//          gender, faculty, department, position, inviteCode
// ============================================================

exports.register = async (req, res) => {
    try {
        const {
            role = ROLE.STUDENT,
            username,
            firstName,
            lastName,
            email,
            password,
            gender,

            // student + teacher
            faculty,

            // student
            age,
            major,
            year,

            // teacher
            department,
            position,
            inviteCode,
        } = req.body;

        if (role !== ROLE.STUDENT && role !== ROLE.TEACHER) {
            return res.status(400).json({
                message: "role ไม่ถูกต้อง",
            });
        }

        if (!username || !email || !password || !firstName || !lastName || !gender) {
            return res.status(400).json({
                message: "กรุณากรอกข้อมูลให้ครบ",
            });
        }

        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username },
                ],
            },
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email หรือ Username นี้ถูกใช้แล้ว",
            });
        }

        // ========================================================
        // TEACHER
        // ========================================================

        if (role === ROLE.TEACHER) {
            if (!isValidInviteCode(inviteCode)) {
                return res.status(403).json({
                    message: "รหัสอาจารย์ไม่ถูกต้อง",
                });
            }

            if (!faculty || !department || !position) {
                return res.status(400).json({
                    message: "กรุณากรอกคณะ ภาควิชา และตำแหน่งให้ครบ",
                });
            }

            const dept = await prisma.departments.findUnique({
                where: { dept_id: Number(department) },
                select: { dept_id: true, faculty_id: true },
            });

            // ภาควิชาต้องอยู่ในคณะที่เลือก
            if (!dept || dept.faculty_id !== Number(faculty)) {
                return res.status(400).json({
                    message: "ไม่พบภาควิชาที่เลือกในคณะนี้",
                });
            }

            const teacherRoleId = await getTeacherRoleId();

            if (teacherRoleId === null) {
                return res.status(500).json({
                    message:
                        "ยังไม่มี role 'อาจารย์' ในตาราง roles กรุณาเพิ่มก่อน",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // สร้าง user + teacher พร้อมกัน (ถ้าพังจะไม่เหลือ user ค้าง)
            const user = await prisma.users.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    role_id: teacherRoleId,
                    created_at: new Date(),
                    last_login: new Date(),

                    teachers: {
                        create: {
                            first_name: firstName,
                            last_name: lastName,
                            gender,
                            dept_id: dept.dept_id,
                            position,
                        },
                    },
                },
            });

            return res.status(201).json({
                message: "Register success",
                user: toPublicUser(user, ROLE.TEACHER),
            });
        }

        // ========================================================
        // STUDENT (เหมือนเดิม)
        // ========================================================

        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้าง user + student พร้อมกัน (ถ้าพังจะไม่เหลือ user ค้าง)
        const user = await prisma.users.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role_id: STUDENT_ROLE_ID,
                created_at: new Date(),
                last_login: new Date(),

                students: {
                    create: {
                        first_name: firstName,
                        last_name: lastName,
                        gender,
                        birth_year:
                            new Date().getFullYear() - Number(age),
                        entry_year: Number(year),

                        majors: {
                            connect: {
                                major_id: Number(major),
                            },
                        },
                    },
                },
            },
        });

        return res.status(201).json({
            message: "Register success",
            user: toPublicUser(user, ROLE.STUDENT),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};

// ============================================================
// Daily Streak (นับตอน Login)
// ------------------------------------------------------------
// ใช้วันที่ตามเวลาไทย (Asia/Bangkok)
//   - Login วันเดียวกับครั้งก่อน   → streak เท่าเดิม
//   - Login วันถัดไปพอดี           → streak + 1
//   - เว้นเกิน 1 วัน / ยังไม่เคยมี  → streak = 1
// ============================================================

const DAY_MS = 24 * 60 * 60 * 1000;

// "YYYY-MM-DD" ของวันนี้ตามเวลาไทย
const todayInBangkok = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

// คอลัมน์ DATE ที่ Prisma คืนมาเป็น Date เวลา 00:00 UTC → "YYYY-MM-DD"
const toDateKey = (date) =>
    date ? new Date(date).toISOString().slice(0, 10) : null;

const updateLoginStreak = async (userId) => {
    const today = todayInBangkok();

    const stats = await prisma.user_stats.findUnique({
        where: { user_id: userId },
        select: { current_streak: true, last_login_date: true },
    });

    const lastDay = toDateKey(stats?.last_login_date);

    let streak = 1;

    if (lastDay) {
        const diffDays = Math.round(
            (Date.parse(today) - Date.parse(lastDay)) / DAY_MS
        );

        if (diffDays === 0) {
            streak = Math.max(stats.current_streak || 0, 1);
        } else if (diffDays === 1) {
            streak = (stats.current_streak || 0) + 1;
        }
    }

    await prisma.user_stats.upsert({
        where: { user_id: userId },
        update: {
            current_streak: streak,
            last_login_date: new Date(today),
        },
        create: {
            user_id: userId,
            total_points: 0,
            current_streak: streak,
            highest_score: 0,
            last_login_date: new Date(today),
            integrity_points: 0,
        },
    });

    return streak;
};

// ============================================================
// Login
// ============================================================
//
// body: { email, password, role }
//   role = "student" / "teacher" ที่ผู้ใช้เลือกในหน้า Login
//   ถ้าเลือกไม่ตรงกับบัญชีจริง → ไม่ให้เข้า
// response: { token, user: { id, username, email, role_id, role } }
// ============================================================

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // ค้นหา User
        const user = await prisma.users.findFirst({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(400).json({
                message: "Email not found",
            });
        }

        // ตรวจสอบ Password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Wrong password",
            });
        }

        // ตรวจสอบ Role ที่เลือกให้ตรงกับบัญชี
        const userRole = await getRoleName(user.role_id);

        if (role && userRole && role !== userRole) {
            return res.status(403).json({
                message:
                    userRole === ROLE.TEACHER
                        ? "บัญชีนี้เป็นบัญชีอาจารย์ กรุณาเลือก 'อาจารย์'"
                        : "บัญชีนี้เป็นบัญชีนักเรียน กรุณาเลือก 'นักเรียน'",
            });
        }

        // สร้าง JWT Token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: userRole,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        // อัปเดตเวลาการ Login ล่าสุด
        await prisma.users.update({
            where: {
                id: user.id,
            },
            data: {
                last_login: new Date(),
            },
        });

        // อัปเดต Daily Streak (ถ้าพังไม่ให้ Login พัง)
        try {
            await updateLoginStreak(user.id);
        } catch (streakError) {
            console.error("Update streak error:", streakError);
        }

        // บันทึกประวัติ LOGIN
        // type_id = 1 จาก action_types
        await prisma.logs_user_actions.create({
            data: {
                user_id: user.id,
                type_id: 1,
                reference_id: null,
                description: "เข้าสู่ระบบ",
                time_spent: null,
                created_at: new Date(),
            },
        });

        // ส่งข้อมูลกลับ Frontend (ไม่ส่ง password)
        return res.json({
            message: "Login success",
            token,
            user: toPublicUser(user, userRole),
        });
    } catch (error) {
        console.log("Login error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

// ============================================================
// Departments (ใช้ในฟอร์มสมัครอาจารย์)
// GET /departments
// ============================================================

exports.getDepartments = async (req, res) => {
    try {
        const departments = await prisma.departments.findMany({
            select: {
                dept_id: true,
                dept_name: true,
                faculty_id: true,
            },
            orderBy: {
                dept_name: "asc",
            },
        });

        return res.json(departments);
    } catch (error) {
        console.log("Get departments error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

// ============================================================
// Logout
// ============================================================

exports.logout = async (req, res) => {
    try {
        // ข้อมูล user มาจาก JWT Middleware
        const userId = req.user.id;
        const now = new Date();

        // ----------------------------------------------------
        // หา LOGIN ครั้งล่าสุดของ user คนนี้ (type_id = 1)
        // เพื่อคำนวณเวลาที่อยู่ในเกม (นาที)
        // ----------------------------------------------------
        const lastLogin = await prisma.logs_user_actions.findFirst({
            where: {
                user_id: userId,
                type_id: 1,
                created_at: { lte: now },
            },
            orderBy: { created_at: "desc" },
            select: { log_id: true, created_at: true },
        });

        const timeSpentMinutes = lastLogin?.created_at
            ? Math.max(
                0,
                Math.round(
                    (now.getTime() - lastLogin.created_at.getTime()) / 60000
                )
            )
            : null;

        // บันทึกประวัติ Logout
        // type_id = 2 = LOGOUT
        // reference_id = log_id ของ LOGIN ที่จับคู่กัน
        // time_spent   = จำนวนนาทีตั้งแต่ LOGIN ถึง LOGOUT
        await prisma.logs_user_actions.create({
            data: {
                user_id: userId,
                type_id: 2,
                reference_id: lastLogin?.log_id ?? null,
                description: "ออกจากระบบ",
                time_spent: timeSpentMinutes,
                created_at: now,
            },
        });

        // ปิดรอบการใช้งาน (user_sessions) ที่ยังเปิดอยู่
        try {
            await closeOpenSessions(userId, now);
        } catch (sessionError) {
            console.error("Close session error:", sessionError);
        }

        res.status(200).json({
            success: true,
            message: "Logout success",
            time_spent: timeSpentMinutes,
        });
    } catch (error) {
        console.log("Logout error:", error);

        res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};