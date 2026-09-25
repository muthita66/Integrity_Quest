const prisma = require("../lib/prisma");

// ============================================================
// CONSTANTS
// ============================================================

const STATUS = {
    LOCKED: "LOCKED",
    UNLOCKED: "UNLOCKED",
    IN_PROGRESS: "IN_PROGRESS",
    PASS: "PASS",
    PERFECT: "PERFECT",
    FAIL: "FAIL",
};

// ============================================================
// HELPER : ตรวจว่า Status ถือว่า "ผ่าน Level" หรือไม่
// ============================================================

const isPassedStatus = (status) => {
    return (
        status === STATUS.PASS ||
        status === STATUS.PERFECT
    );
};

// ============================================================
// HELPER : ตรวจว่า User ทำ Pre-Test แล้วหรือยัง
// ============================================================
// Pre-Test เก็บคำตอบไว้ใน user_quiz_answers (join quizzes
// ที่ quiz_type = 'pre_test') ถ้ามีอย่างน้อย 1 แถว = ทำแล้ว
//
// กติกา: Unit แรก (Unit 1) จะล็อกจนกว่าจะทำ Pre-Test
//        ทำ Pre-Test เสร็จ → Unit 1 + Level แรกเปิดอัตโนมัติ
// ============================================================

const hasCompletedPreTest = async (userId) => {
    const count = await prisma.user_quiz_answers.count({
        where: {
            user_id: Number(userId),
            quizzes: {
                is: {
                    quiz_type: "pre_test",
                },
            },
        },
    });

    return count > 0;
};

// ============================================================
// UPDATE LEVEL PROGRESS
// ============================================================
// เรียกหลัง completeGame() ตัดสินผล Level แล้ว
//
// ตัวอย่าง:
//
// await updateLevelProgress({
//     userId,
//     levelId,
//     score,
//     status: "PASS",
// });
//
// ============================================================

const updateLevelProgress = async ({
    userId,
    levelId,
    score = 0,
    status,
    passed = null,
}) => {
    // --------------------------------------------------------
    // ตรวจสอบข้อมูล
    // --------------------------------------------------------

    if (!userId) {
        throw new Error("userId is required");
    }

    if (!levelId) {
        throw new Error("levelId is required");
    }

    // --------------------------------------------------------
    // ดึง Level
    // --------------------------------------------------------

    const level = await prisma.level.findUnique({
        where: {
            level_id: Number(levelId),
        },

        select: {
            level_id: true,
            unit_id: true,
            order_no: true,
            is_final: true,
        },
    });

    if (!level) {
        throw new Error("ไม่พบ Level");
    }

    // --------------------------------------------------------
    // ตรวจสอบว่า Level ผ่านหรือไม่
    // --------------------------------------------------------

    const isLevelPassed =
        passed !== null
            ? Boolean(passed)
            : isPassedStatus(status);

    // --------------------------------------------------------
    // หาข้อมูล Progress เดิม
    // --------------------------------------------------------

    const existingProgress =
        await prisma.user_level_progress.findUnique({
            where: {
                user_id_level_id: {
                    user_id: Number(userId),
                    level_id: Number(levelId),
                },
            },
        });

    // --------------------------------------------------------
    // คำนวณคะแนน
    // --------------------------------------------------------

    const currentScore = Number(score) || 0;

    const bestScore = existingProgress
        ? Math.max(
            existingProgress.best_score || 0,
            currentScore
        )
        : currentScore;

    // --------------------------------------------------------
    // Status ที่จะบันทึก
    // --------------------------------------------------------

    let progressStatus;

    if (isLevelPassed) {
        progressStatus =
            status === STATUS.PERFECT
                ? STATUS.PERFECT
                : STATUS.PASS;
    } else {
        progressStatus = status || STATUS.IN_PROGRESS;
    }

    // --------------------------------------------------------
    // Update / Create Level Progress
    // --------------------------------------------------------

    const levelProgress =
        await prisma.user_level_progress.upsert({
            where: {
                user_id_level_id: {
                    user_id: Number(userId),
                    level_id: Number(levelId),
                },
            },

            update: {
                status: progressStatus,

                is_locked: false,

                score: currentScore,

                best_score: bestScore,

                completed_at: isLevelPassed
                    ? new Date()
                    : existingProgress?.completed_at || null,

                last_accessed: new Date(),
            },

            create: {
                user_id: Number(userId),

                unit_id: level.unit_id,

                level_id: level.level_id,

                status: progressStatus,

                is_locked: false,

                score: currentScore,

                best_score: bestScore,

                completed_at: isLevelPassed
                    ? new Date()
                    : null,

                last_accessed: new Date(),
            },
        });

    // --------------------------------------------------------
    // ถ้า Level ผ่าน
    // → ปลดล็อก Level ถัดไป
    // --------------------------------------------------------

    if (isLevelPassed) {
        await unlockNextLevel({
            userId: Number(userId),
            level,
        });
    }

    // --------------------------------------------------------
    // Update Unit Progress
    // --------------------------------------------------------

    await updateUnitProgress({
        userId: Number(userId),
        unitId: level.unit_id,
    });

    return levelProgress;
};

// ============================================================
// UNLOCK NEXT LEVEL
// ============================================================

const unlockNextLevel = async ({
    userId,
    level,
}) => {
    // --------------------------------------------------------
    // หา Level ถัดไปจาก order_no
    // --------------------------------------------------------

    const nextLevel = await prisma.level.findFirst({
        where: {
            unit_id: level.unit_id,

            order_no: {
                gt: level.order_no,
            },
        },

        orderBy: {
            order_no: "asc",
        },

        select: {
            level_id: true,
            unit_id: true,
            order_no: true,
        },
    });

    // ไม่มี Level ถัดไป
    // แสดงว่า Unit นี้อาจจบแล้ว
    if (!nextLevel) {
        return null;
    }

    // --------------------------------------------------------
    // ตรวจ Progress ของ Level ถัดไป
    // --------------------------------------------------------

    const existingNextLevel =
        await prisma.user_level_progress.findUnique({
            where: {
                user_id_level_id: {
                    user_id: Number(userId),
                    level_id: nextLevel.level_id,
                },
            },
        });

    // --------------------------------------------------------
    // ถ้ายังไม่มี → สร้าง
    // --------------------------------------------------------

    if (!existingNextLevel) {
        return await prisma.user_level_progress.create({
            data: {
                user_id: Number(userId),

                unit_id: nextLevel.unit_id,

                level_id: nextLevel.level_id,

                status: STATUS.UNLOCKED,

                is_locked: false,

                score: 0,

                best_score: 0,

                completed_at: null,

                last_accessed: new Date(),
            },
        });
    }

    // --------------------------------------------------------
    // ถ้ามีอยู่แล้วแต่ยัง LOCKED → Unlock
    // --------------------------------------------------------

    if (existingNextLevel.is_locked) {
        return await prisma.user_level_progress.update({
            where: {
                user_id_level_id: {
                    user_id: Number(userId),
                    level_id: nextLevel.level_id,
                },
            },

            data: {
                status:
                    existingNextLevel.status === STATUS.LOCKED
                        ? STATUS.UNLOCKED
                        : existingNextLevel.status,

                is_locked: false,

                last_accessed: new Date(),
            },
        });
    }

    return existingNextLevel;
};

// ============================================================
// UPDATE UNIT PROGRESS
// ============================================================
// คำนวณว่า Unit นี้ผ่านไปกี่ Level
//
// completion_percentage =
//     passed levels / total levels * 100
//
// ============================================================

const updateUnitProgress = async ({
    userId,
    unitId,
}) => {
    // --------------------------------------------------------
    // ดึง Level ทั้งหมดของ Unit
    // --------------------------------------------------------

    const levels = await prisma.level.findMany({
        where: {
            unit_id: Number(unitId),
        },

        select: {
            level_id: true,
        },

        orderBy: {
            order_no: "asc",
        },
    });

    const totalLevels = levels.length;

    // ไม่มี Level
    if (totalLevels === 0) {
        return null;
    }

    // --------------------------------------------------------
    // ดึง Level Progress ของ User
    // --------------------------------------------------------

    const levelProgress =
        await prisma.user_level_progress.findMany({
            where: {
                user_id: Number(userId),

                unit_id: Number(unitId),
            },

            select: {
                level_id: true,
                status: true,
            },
        });

    // --------------------------------------------------------
    // หา Level ที่ผ่านแล้ว
    // --------------------------------------------------------

    const passedLevelIds =
        new Set(
            levelProgress
                .filter((item) =>
                    isPassedStatus(item.status)
                )
                .map((item) => item.level_id)
        );

    // --------------------------------------------------------
    // จำนวน Level ที่ผ่าน
    // --------------------------------------------------------

    const passedLevels =
        levels.filter((level) =>
            passedLevelIds.has(level.level_id)
        ).length;

    // --------------------------------------------------------
    // คำนวณ %
    // --------------------------------------------------------

    const completionPercentage =
        Math.round(
            (passedLevels / totalLevels) * 100
        );

    // --------------------------------------------------------
    // Unit ผ่านครบหรือยัง
    // --------------------------------------------------------

    const unitCompleted =
        passedLevels === totalLevels;

    // --------------------------------------------------------
    // Update / Create user_progress
    // --------------------------------------------------------

    const unitProgress =
        await prisma.user_progress.upsert({
            where: {
                user_id_unit_id: {
                    user_id: Number(userId),

                    unit_id: Number(unitId),
                },
            },

            update: {
                completion_percentage:
                    completionPercentage,

                is_locked: false,

                last_accessed: new Date(),

                score: passedLevels,
            },

            create: {
                user_id: Number(userId),

                unit_id: Number(unitId),

                completion_percentage:
                    completionPercentage,

                is_locked: false,

                last_accessed: new Date(),

                score: passedLevels,
            },
        });

    // --------------------------------------------------------
    // ถ้า Unit ผ่านครบ
    // → ปลดล็อก Unit ถัดไป
    // --------------------------------------------------------

    if (unitCompleted) {
        await unlockNextUnit({
            userId: Number(userId),

            unitId: Number(unitId),
        });
    }

    return unitProgress;
};

// ============================================================
// UNLOCK NEXT UNIT
// ============================================================

const unlockNextUnit = async ({
    userId,
    unitId,
}) => {
    // --------------------------------------------------------
    // หา Unit ปัจจุบัน
    // --------------------------------------------------------

    const currentUnit = await prisma.units.findUnique({
        where: {
            unit_id: Number(unitId),
        },

        select: {
            unit_id: true,
            order_number: true,
        },
    });

    if (!currentUnit) {
        return null;
    }

    // --------------------------------------------------------
    // หา Unit ถัดไปจาก order_number
    // --------------------------------------------------------

    const nextUnit = await prisma.units.findFirst({
        where: {
            order_number: {
                gt: currentUnit.order_number,
            },

            is_active: true,
        },

        orderBy: {
            order_number: "asc",
        },

        select: {
            unit_id: true,
            order_number: true,
        },
    });

    if (!nextUnit) {
        return null;
    }

    // --------------------------------------------------------
    // ตรวจ User Progress ของ Unit ถัดไป
    // --------------------------------------------------------

    const existingProgress =
        await prisma.user_progress.findUnique({
            where: {
                user_id_unit_id: {
                    user_id: Number(userId),

                    unit_id: nextUnit.unit_id,
                },
            },
        });

    // --------------------------------------------------------
    // ถ้ายังไม่มี → สร้าง
    // --------------------------------------------------------

    if (!existingProgress) {
        return await prisma.user_progress.create({
            data: {
                user_id: Number(userId),

                unit_id: nextUnit.unit_id,

                score: 0,

                completion_percentage: 0,

                is_locked: false,

                last_accessed: new Date(),
            },
        });
    }

    // --------------------------------------------------------
    // ถ้ามี → Unlock
    // --------------------------------------------------------

    if (existingProgress.is_locked) {
        return await prisma.user_progress.update({
            where: {
                user_id_unit_id: {
                    user_id: Number(userId),

                    unit_id: nextUnit.unit_id,
                },
            },

            data: {
                is_locked: false,

                last_accessed: new Date(),
            },
        });
    }

    return existingProgress;
};

// ============================================================
// GET USER PROGRESS
// ============================================================
// GET /api/user-progress
//
// ดึง Progress ของ Unit + Level ของ User ที่ Login อยู่
// ============================================================

exports.getUserProgress = async (req, res) => {
    try {
        const userId = Number(req.user.id);

        // ========================================================
        // 1. ดึง Unit ที่ Active
        // ========================================================

        const units = await prisma.units.findMany({
            where: {
                is_active: true,
            },

            orderBy: {
                order_number: "asc",
            },

            select: {
                unit_id: true,
                name_th: true,
                name_en: true,
                order_number: true,
            },
        });

        // ========================================================
        // 2. ดึง Level ทั้งหมด
        // ========================================================

        const levels = await prisma.level.findMany({
            orderBy: [
                {
                    unit_id: "asc",
                },
                {
                    order_no: "asc",
                },
            ],

            select: {
                level_id: true,
                unit_id: true,
                title: true,
                description: true,
                order_no: true,
                is_final: true,
            },
        });

        // ========================================================
        // 3. ดึง Unit Progress ของ User
        // ========================================================

        const unitProgressList =
            await prisma.user_progress.findMany({
                where: {
                    user_id: userId,
                },

                select: {
                    progress_id: true,
                    unit_id: true,
                    score: true,
                    completion_percentage: true,
                    is_locked: true,
                    last_accessed: true,
                },
            });

        // ========================================================
        // 4. ดึง Level Progress ของ User
        // ========================================================

        const levelProgressList =
            await prisma.user_level_progress.findMany({
                where: {
                    user_id: userId,
                },

                select: {
                    progress_id: true,
                    unit_id: true,
                    level_id: true,
                    status: true,
                    is_locked: true,
                    score: true,
                    best_score: true,
                    completed_at: true,
                    last_accessed: true,
                },
            });

        // ========================================================
        // 4.1 Pre-Test → ใช้ตัดสินการล็อก Unit แรก
        // ========================================================

        const preTestDone =
            await hasCompletedPreTest(userId);

        const firstUnitId =
            units[0]?.unit_id ?? null;

        // ========================================================
        // 5. จัดข้อมูล Unit + Level
        // ========================================================

        const result = units.map((unit) => {
            const isFirstUnit =
                unit.unit_id === firstUnitId;

            // ----------------------------------------------------
            // หา Progress ของ Unit นี้
            // ----------------------------------------------------

            const unitProgress =
                unitProgressList.find(
                    (item) =>
                        item.unit_id === unit.unit_id
                ) || null;

            // ----------------------------------------------------
            // หา Level ของ Unit นี้
            // ----------------------------------------------------

            const unitLevels = levels
                .filter(
                    (level) =>
                        level.unit_id === unit.unit_id
                )
                .map((level, levelIndex) => {
                    const progress =
                        levelProgressList.find(
                            (item) =>
                                item.level_id ===
                                level.level_id
                        ) || null;

                    // ------------------------------------------------
                    // Unit แรก: ยังไม่ทำ Pre-Test → ล็อกทุก Level
                    //           ทำแล้ว + ยังไม่มี progress → Level แรกเปิด
                    // Unit อื่น: ใช้ progress ตามเดิม (ไม่มี = ล็อก)
                    // ------------------------------------------------
                    let levelLocked =
                        progress?.is_locked ?? true;

                    if (isFirstUnit && !preTestDone) {
                        levelLocked = true;
                    } else if (
                        isFirstUnit &&
                        !progress &&
                        levelIndex === 0
                    ) {
                        levelLocked = false;
                    }

                    return {
                        level_id: level.level_id,

                        title: level.title,

                        description:
                            level.description,

                        order_no:
                            level.order_no,

                        is_final:
                            level.is_final,

                        status:
                            isFirstUnit && !preTestDone
                                ? STATUS.LOCKED
                                : progress?.status ||
                                (levelLocked
                                    ? STATUS.LOCKED
                                    : STATUS.UNLOCKED),

                        is_locked:
                            levelLocked,

                        score:
                            progress?.score || 0,

                        best_score:
                            progress?.best_score || 0,

                        completed_at:
                            progress?.completed_at ||
                            null,

                        last_accessed:
                            progress?.last_accessed ||
                            null,
                    };
                });

            // ----------------------------------------------------
            // Return Unit
            // ----------------------------------------------------

            return {
                unit_id: unit.unit_id,

                name_th: unit.name_th,

                name_en: unit.name_en,

                order_number:
                    unit.order_number,

                completion_percentage:
                    unitProgress
                        ?.completion_percentage || 0,

                // Unit แรก: ล็อกจนกว่าจะทำ Pre-Test
                //           ทำแล้วแต่ยังไม่มี progress → เปิด
                is_locked:
                    isFirstUnit
                        ? !preTestDone ||
                        (unitProgress?.is_locked ?? false)
                        : unitProgress?.is_locked ?? true,

                pre_test_done: preTestDone,

                score:
                    unitProgress?.score || 0,

                last_accessed:
                    unitProgress?.last_accessed ||
                    null,

                levels: unitLevels,
            };
        });

        // ========================================================
        // 6. ส่ง Response
        // ========================================================

        return res.status(200).json({
            message: "ดึงข้อมูล Progress สำเร็จ",
            data: result,
        });
    } catch (error) {
        console.error(
            "Get User Progress Error:",
            error
        );

        return res.status(500).json({
            message:
                "ไม่สามารถดึงข้อมูล Progress ได้",
            error:
                error.message ||
                "Unknown error",
        });
    }
};

// ============================================================
// EXPORT
// ============================================================

exports.updateLevelProgress =
    updateLevelProgress;

exports.updateUnitProgress =
    updateUnitProgress;

exports.unlockNextLevel =
    unlockNextLevel;

exports.unlockNextUnit =
    unlockNextUnit;

exports.hasCompletedPreTest =
    hasCompletedPreTest;