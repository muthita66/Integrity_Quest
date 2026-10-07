const prisma = require("../lib/prisma");

const STATUS = {
    LOCKED: "LOCKED",
    UNLOCKED: "UNLOCKED",
    IN_PROGRESS: "IN_PROGRESS",
    PASS: "PASS",
    PERFECT: "PERFECT",
    FAIL: "FAIL",
};

const isPassedStatus = (status) => {
    return (
        status === STATUS.PASS ||
        status === STATUS.PERFECT
    );
};

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

const updateLevelProgress = async ({
    userId,
    levelId,
    score = 0,
    status,
    passed = null,
}) => {

    if (!userId) {
        throw new Error("userId is required");
    }

    if (!levelId) {
        throw new Error("levelId is required");
    }

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

    const isLevelPassed =
        passed !== null
            ? Boolean(passed)
            : isPassedStatus(status);

    const existingProgress =
        await prisma.user_level_progress.findUnique({
            where: {
                user_id_level_id: {
                    user_id: Number(userId),
                    level_id: Number(levelId),
                },
            },
        });

    const currentScore = Number(score) || 0;

    const bestScore = existingProgress
        ? Math.max(
            existingProgress.best_score || 0,
            currentScore
        )
        : currentScore;

    let progressStatus;

    if (isLevelPassed) {
        progressStatus =
            status === STATUS.PERFECT
                ? STATUS.PERFECT
                : STATUS.PASS;
    } else {
        progressStatus = status || STATUS.IN_PROGRESS;
    }

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
                    ? existingProgress?.completed_at || new Date()
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

    if (isLevelPassed) {
        await unlockNextLevel({
            userId: Number(userId),
            level,
        });
    }

    await updateUnitProgress({
        userId: Number(userId),
        unitId: level.unit_id,
    });

    return levelProgress;
};

const unlockNextLevel = async ({
    userId,
    level,
}) => {
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
    if (!nextLevel) {
        return null;
    }
    const existingNextLevel =
        await prisma.user_level_progress.findUnique({
            where: {
                user_id_level_id: {
                    user_id: Number(userId),
                    level_id: nextLevel.level_id,
                },
            },
        });

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

const updateUnitProgress = async ({
    userId,
    unitId,
}) => {
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

    const passedLevelIds =
        new Set(
            levelProgress
                .filter((item) =>
                    isPassedStatus(item.status)
                )
                .map((item) => item.level_id)
        );

    const passedLevels =
        levels.filter((level) =>
            passedLevelIds.has(level.level_id)
        ).length;

    const completionPercentage =
        Math.round(
            (passedLevels / totalLevels) * 100
        );

    const unitCompleted = passedLevels === totalLevels;

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

    if (unitCompleted) {
        await unlockNextUnit({
            userId: Number(userId),

            unitId: Number(unitId),
        });
    }

    return unitProgress;
};

const unlockNextUnit = async ({
    userId,
    unitId,
}) => {

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

    const existingProgress =
        await prisma.user_progress.findUnique({
            where: {
                user_id_unit_id: {
                    user_id: Number(userId),

                    unit_id: nextUnit.unit_id,
                },
            },
        });

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

exports.getUserProgress = async (req, res) => {
    try {
        const userId = Number(req.user.id);

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

        const preTestDone =
            await hasCompletedPreTest(userId);

        const firstUnitId =
            units[0]?.unit_id ?? null;

        const result = units.map((unit) => {
            const isFirstUnit =
                unit.unit_id === firstUnitId;

            const unitProgress =
                unitProgressList.find(
                    (item) =>
                        item.unit_id === unit.unit_id
                ) || null;

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

            return {
                unit_id: unit.unit_id,
                name_th: unit.name_th,
                name_en: unit.name_en,
                order_number:
                    unit.order_number,

                completion_percentage:
                    unitProgress
                        ?.completion_percentage || 0,
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

exports.updateLevelProgress = updateLevelProgress;
exports.updateUnitProgress = updateUnitProgress;
exports.unlockNextLevel = unlockNextLevel;
exports.unlockNextUnit = unlockNextUnit;
exports.hasCompletedPreTest = hasCompletedPreTest;
