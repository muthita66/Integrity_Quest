const prisma = require("../lib/prisma");

const receiptHuntController = require("./receiptHuntController");
const finalLevelController = require("./finalLevelController");
const moneyGameController = require("./moneyGameController");
const userProgressController = require("./userProgressController");

// Unit 4 Level 1 : Slip Hunt
const gamePlayService =
    require("../services/gamePlayService");

const recalcIntegrityPoints = async (userId) => {
    const uid = Number(userId);

    const bestPerLevel =
        await prisma.game_play_history.groupBy({
            by: ["level_id"],
            where: {
                user_id: uid,
                completed_at: { not: null },
            },
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

// Utility
const shuffle = (array) => {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
};

const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
};


// Progress Helper
const saveLevelProgress = async ({
    userId,
    levelId,
    score,
    status,
    passed,
}) => {
    try {
        return await userProgressController.updateLevelProgress({
            userId,
            levelId,
            score,
            status,
            passed,
        });
    } catch (error) {
        console.error(
            "updateLevelProgress error:",
            {
                userId,
                levelId,
                status,
                passed,
            },
            error
        );

        return null;
    }
};

// START GAME
exports.startGame = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            level_id,
            play_id,
        } = req.body;

        if (!level_id) {
            return res.status(400).json({
                message: "กรุณาระบุ level_id",
            });
        }

        const levelId = Number(level_id);

        // ตรวจสอบ Level
        const level = await prisma.level.findUnique({
            where: {
                level_id: levelId,
            },
        });

        if (!level) {
            return res.status(404).json({
                message: "ไม่พบ Level นี้",
            });
        }

        // ตรวจสอบสิทธิ์การเข้า Level (Level Lock)
        const levelProgress =
            await prisma.user_level_progress.findUnique({
                where: {
                    user_id_level_id: {
                        user_id: Number(userId),
                        level_id: levelId,
                    },
                },
                select: {
                    is_locked: true,
                    status: true,
                },
            });

        const unitProgress =
            await prisma.user_progress.findUnique({
                where: {
                    user_id_unit_id: {
                        user_id: Number(userId),
                        unit_id: level.unit_id,
                    },
                },
                select: {
                    is_locked: true,
                },
            });

        const currentUnit =
            await prisma.units.findUnique({
                where: {
                    unit_id: level.unit_id,
                },
                select: {
                    unit_id: true,
                    order_number: true,
                    is_active: true,
                },
            });

        const firstActiveUnit =
            await prisma.units.findFirst({
                where: {
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

        const firstLevelOfUnit =
            await prisma.level.findFirst({
                where: {
                    unit_id: level.unit_id,
                },
                orderBy: {
                    order_no: "asc",
                },
                select: {
                    level_id: true,
                },
            });

        const isFirstLevelOfUnit =
            firstLevelOfUnit?.level_id === levelId;

        const isFirstActiveUnit =
            currentUnit?.unit_id ===
            firstActiveUnit?.unit_id;

        // กรณีมี Progress แล้วแต่ถูกล็อก
        if (levelProgress?.is_locked === true) {
            return res.status(403).json({
                message: "Level นี้ยังไม่ปลดล็อก",
                data: {
                    level_id: levelId,
                    is_locked: true,
                    status: levelProgress.status,
                },
            });
        }

        // กรณียังไม่มี Level Progress
        if (!levelProgress) {
            // Level ที่ไม่ใช่ Level แรกของ Unit
            // ต้องรอ Level ก่อนหน้าปลดล็อก
            if (!isFirstLevelOfUnit) {
                return res.status(403).json({
                    message: "Level นี้ยังไม่ปลดล็อก",
                    data: {
                        level_id: levelId,
                        is_locked: true,
                        status: "LOCKED",
                    },
                });
            }

            // ถ้าเป็น Level แรกของ Unit แต่ Unit ยังล็อกอยู่
            if (unitProgress?.is_locked === true) {
                return res.status(403).json({
                    message: "Unit นี้ยังไม่ปลดล็อก",
                    data: {
                        level_id: levelId,
                        is_locked: true,
                        status: "LOCKED",
                    },
                });
            }

            // ถ้ายังไม่มี Unit Progress เลย
            // อนุญาตเฉพาะ Unit แรกที่ active เท่านั้น
            if (!unitProgress && !isFirstActiveUnit) {
                return res.status(403).json({
                    message: "Unit นี้ยังไม่ปลดล็อก",
                    data: {
                        level_id: levelId,
                        is_locked: true,
                        status: "LOCKED",
                    },
                });
            }
        }

        // Unit แรก: ต้องทำ Pre-Test ก่อนถึงจะเล่นได้
        if (isFirstActiveUnit) {
            const preTestDone =
                await userProgressController.hasCompletedPreTest(
                    userId
                );

            if (!preTestDone) {
                return res.status(403).json({
                    message: "กรุณาทำ Pre-Test ก่อนเริ่ม Unit 1",
                    data: {
                        level_id: levelId,
                        is_locked: true,
                        status: "LOCKED",
                        require_pre_test: true,
                    },
                });
            }
        }

        // ถ้า Unit ไม่ active ให้ป้องกันไว้ด้วย
        if (currentUnit?.is_active === false) {
            return res.status(403).json({
                message: "Unit นี้ไม่เปิดให้เล่นในขณะนี้",
                data: {
                    level_id: levelId,
                    is_locked: true,
                },
            });
        }

        // นับจำนวนข้อมูลสำหรับ Score
        let maxScore = 0;

        // Unit 6 Level 1 : Crisis Response (level_id หาจาก DB — unit 6 ลำดับ 1)
        const isCrisis = await gamePlayService.isCrisisLevel(levelId);

        // Unit 6 Level 2 : Good Network (ใช้ question/choice — หา level จาก DB)
        const isNetwork = await gamePlayService.isGoodNetworkLevel(levelId);

        // Unit 6 Level 3 : ShadowMirror (กระจกสะท้อนใจ) — คำถามปลายเปิด
        const isShadowMirror = await gamePlayService.isShadowMirrorLevel(levelId);

        if (levelId === 5) {
            // Unit 2 Level 1: Need / Want
            maxScore = await prisma.level_items.count({
                where: {
                    level_id: levelId,
                },
            });

            if (maxScore === 0) {
                return res.status(400).json({
                    message: "Level 1 ยังไม่มี Items",
                });
            }
        } else if (levelId === 6) {
            // Unit 2 Level 2: Calculation / Comparison
            maxScore = await prisma.comparison_questions.count({
                where: {
                    level_id: levelId,
                },
            });

            if (maxScore === 0) {
                return res.status(400).json({
                    message: "Level 2 ยังไม่มี Comparison Questions",
                });
            }
        } else if (levelId === 7) {
            // Unit 2 Final Level
            const questionCount = await prisma.question.count({
                where: {
                    level_id: levelId,
                },
            });

            if (questionCount === 0) {
                return res.status(400).json({
                    message: "Unit 2 Final Level ยังไม่มีคำถาม",
                });
            }

            maxScore = questionCount;
        } else if (levelId === 8) {
            // Unit 3 Level 1 : Receipt Hunt
            // ใน 1 รอบมี Target 8 รูป
            maxScore = 8;
        } else if (levelId === 9) {
            // Unit 3 Level 2 : Money Game (แยกเงินส่วนตัว/เงินชมรม)
            maxScore = 11;
        } else if (levelId === 10) {
            // Unit 3 FinalLevel : Treasurer
            // Final score ของเกมคิดเต็ม 100 คะแนน
            maxScore = 100;
        } else if (gamePlayService.isSlipHuntLevel(levelId)) {
            // Unit 4 Level 1 : Slip Hunt

            maxScore = gamePlayService.SLIP_HUNT_TOTAL_SLIPS;
        } else if (isShadowMirror) {
            // Unit 6 Level 3 : ShadowMirror — คะแนนเต็มคือค่าเฉลี่ย trait
            maxScore = 100;
        } else if (isCrisis) {
            // Unit 6 Level 1 : รับมือวิกฤต (โจทย์อยู่ใน level_crisis_events)
            maxScore = 0;

            const eventCount = (
                await gamePlayService.getCrisisEvents(levelId)
            ).length;

            if (eventCount === 0) {
                return res.status(400).json({
                    message: "ด่านนี้ยังไม่มีเหตุการณ์",
                });
            }
        } else if (gamePlayService.isInspectorLevel(levelId)) {
            // Unit 5 Level 3 : Integrity Inspector (โจทย์อยู่ใน level_projects)
            maxScore = 100;

            const projectCount = (
                await gamePlayService.getInspectorProjects(levelId)
            ).length;

            if (projectCount === 0) {
                return res.status(400).json({
                    message: "ด่านนี้ยังไม่มีเอกสารโครงการ",
                });
            }
        } else if (gamePlayService.isBudgetLevel(levelId)) {
            // Unit 5 Level 2 : จัดสรรงบประมาณ — คะแนนเต็ม 100
            maxScore = 100;
        } else if (gamePlayService.isWordClueLevel(levelId)) {
            // Unit 5 Level 1 : ตามหาคำจากคำใบ้ (โจทย์อยู่ใน level_words)
            maxScore = (
                await gamePlayService.getWordPuzzles(levelId)
            ).length;

            if (maxScore === 0) {
                return res.status(400).json({
                    message: "ด่านนี้ยังไม่มีคำศัพท์",
                });
            }
        } else if (gamePlayService.isSlotLevel(levelId)) {
            // Unit 4 Level 2 : Slot (กับดักพนัน)
            maxScore = 0;
        } else if (levelId !== 2) {
            // Level อื่น ๆ ที่ใช้ question + choice
            const questionCount = await prisma.question.count({
                where: {
                    level_id: levelId,
                },
            });

            if (questionCount === 0) {
                return res.status(400).json({
                    message: "Level นี้ยังไม่มีคำถาม",
                });
            }

            maxScore = questionCount;
        }

        // Level 2 : Bubble Shooter + Boss
        if (levelId === 2) {
            maxScore = 0;

            const baseBubbles = await prisma.bubbles.findMany({
                where: {
                    level_id: levelId,
                    is_active: true,
                },
            });

            if (baseBubbles.length === 0) {
                return res.status(400).json({
                    message: "Level 2 ยังไม่มี Bubble",
                });
            }

            // แยก Good / Bad
            const goodBubbles = shuffleArray(
                baseBubbles.filter(
                    (bubble) =>
                        String(bubble.bubble_type)
                            .trim()
                            .toLowerCase() === "good"
                )
            );

            const badBubbles = shuffleArray(
                baseBubbles.filter(
                    (bubble) =>
                        String(bubble.bubble_type)
                            .trim()
                            .toLowerCase() === "bad"
                )
            );

            // สุ่มจำนวน Good Bubble 4 - 6 ลูก
            const MIN_GOOD_BUBBLES = 4;
            const MAX_GOOD_BUBBLES = 6;
            const TOTAL_BUBBLES = 12;

            const goodRange =
                MAX_GOOD_BUBBLES -
                MIN_GOOD_BUBBLES +
                1;

            const numberOfGoodBubbles =
                Math.floor(
                    Math.random() * goodRange
                ) + MIN_GOOD_BUBBLES;

            const numberOfBadBubbles =
                TOTAL_BUBBLES -
                numberOfGoodBubbles;

            // ตรวจสอบจำนวน Bubble
            if (
                goodBubbles.length < numberOfGoodBubbles ||
                badBubbles.length < numberOfBadBubbles
            ) {
                return res.status(400).json({
                    message:
                        "จำนวน Good/Bad Bubble ใน Database ไม่เพียงพอ",
                    data: {
                        good_available:
                            goodBubbles.length,

                        good_required:
                            numberOfGoodBubbles,

                        bad_available:
                            badBubbles.length,

                        bad_required:
                            numberOfBadBubbles,
                    },
                });
            }

            // เลือก Bubble ตามจำนวนที่สุ่มได้
            const selectedBubbles = shuffleArray([
                ...goodBubbles.slice(
                    0,
                    numberOfGoodBubbles
                ),

                ...badBubbles.slice(
                    0,
                    numberOfBadBubbles
                ),
            ]);


            // สร้าง Game Play History
            const targetPlayId = play_id
                ? Number(play_id)
                : null;

            let play;

            if (targetPlayId) {
                const existingPlay =
                    await prisma.game_play_history.findUnique({
                        where: {
                            play_id: targetPlayId,
                        },
                    });

                if (!existingPlay) {
                    return res.status(404).json({
                        message:
                            "ไม่พบรอบการเล่นสำหรับ Retry",
                    });
                }

                if (existingPlay.user_id !== userId) {
                    return res.status(403).json({
                        message:
                            "ไม่มีสิทธิ์ Retry รอบการเล่นนี้",
                    });
                }

                if (existingPlay.level_id !== 2) {
                    return res.status(400).json({
                        message:
                            "play_id นี้ไม่ใช่ Level 2",
                    });
                }

                if (
                    existingPlay.status === "COMPLETED" ||
                    existingPlay.status === "PERFECT" ||
                    existingPlay.status === "PASS"
                ) {
                    return res.status(400).json({
                        message:
                            "เกมนี้จบแล้ว ไม่สามารถ Retry ได้",
                    });
                }
                await prisma.game_play_bubbles.deleteMany({
                    where: {
                        play_id: existingPlay.play_id,
                    },
                });

                await prisma.game_play_answers.deleteMany({
                    where: {
                        play_id: existingPlay.play_id,
                    },
                });

                play =
                    await prisma.game_play_history.update({
                        where: {
                            play_id:
                                existingPlay.play_id,
                        },

                        data: {
                            score: 0,
                            max_score: 0,
                            completed_at: null,
                            status: "IN_PROGRESS",
                            correct_count: 0,
                            // wrong_count ไม่รีเซ็ตโดยตั้งใจ
                        },
                    });
            } else {
                play =
                    await prisma.game_play_history.create({
                        data: {
                            user_id: userId,
                            level_id: levelId,
                            score: 0,
                            max_score: maxScore,
                            started_at: new Date(),
                            status: "IN_PROGRESS",
                        },
                    });
            }

            // บันทึก Bubble ที่ถูกสุ่มของ Play นี้
            await prisma.game_play_bubbles.createMany({
                data: selectedBubbles.map(
                    (bubble, index) => ({
                        play_id: play.play_id,
                        bubble_id: bubble.bubble_id,
                        bubble_order: index + 1,
                        is_destroyed: false,
                        is_correct: null,
                        destroyed_at: null,
                    })
                ),
            });

            // ดึง Bubble ของ Play นี้กลับมา
            const playBubbles =
                await prisma.game_play_bubbles.findMany({
                    where: {
                        play_id: play.play_id,
                    },

                    orderBy: {
                        bubble_order: "asc",
                    },

                    include: {
                        bubbles: true,
                    },
                });

            return res.status(201).json({
                message: "เริ่มเกม Level 2 สำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    score: play.score,
                    max_score: play.max_score,
                    status: play.status,
                    started_at: play.started_at,

                    bubbles: playBubbles.map(
                        (item) => ({
                            play_bubble_id:
                                item.play_bubble_id,

                            bubble_id:
                                item.bubble_id,

                            bubble_order:
                                item.bubble_order,

                            bubble_text:
                                item.bubbles.bubble_text,

                            bubble_type:
                                item.bubbles.bubble_type,
                        })
                    ),
                },
            });
        }

        // Level อื่น ๆ
        const play = await prisma.game_play_history.create({
            data: {
                user_id: userId,
                level_id: levelId,
                score: 0,
                max_score: maxScore,
                started_at: new Date(),
                status: "IN_PROGRESS",
            },
        });

        // Unit 3 Level 1 : Receipt Hunt
        if (levelId === 8) {
            const receiptHunt = await receiptHuntController.startReceiptHunt(
                play.play_id
            );

            return res.status(201).json({
                message:
                    "เริ่มเกม Receipt Hunt สำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    score: play.score,
                    max_score: play.max_score,
                    status: play.status,
                    started_at: play.started_at,

                    ...receiptHunt,
                },
            });
        }

        // Unit 3 Level 2 : Money Game
        if (levelId === 9) {
            const moneyGame = await moneyGameController.startMoneyGame(
                play.play_id
            );

            return res.status(201).json({
                message:
                    "เริ่มเกมแยกเงินสำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    score: play.score,
                    max_score: play.max_score,
                    status: play.status,
                    started_at: play.started_at,

                    ...moneyGame,
                },
            });
        }

        // Unit 3 FinalLevel : Treasurer
        if (levelId === 10) {
            const treasurer =
                await finalLevelController.startTreasurerGame(
                    play.play_id
                );

            return res.status(201).json({
                message:
                    "เริ่มเกม Treasurer สำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    score: play.score,
                    max_score: play.max_score,
                    status: play.status,
                    started_at: play.started_at,

                    treasurer,
                },
            });
        }

        // Unit 6 Level 1 : Crisis Response
        if (isNetwork) {
            const questions =
                await gamePlayService.getGoodNetworkQuestions(levelId);

            return res.status(201).json({
                message: "เริ่มเกมเครือข่ายความดีสำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    score: play.score,
                    max_score: play.max_score,
                    status: play.status,
                    started_at: play.started_at,

                    lives: gamePlayService.NETWORK_LIVES,
                    questions,
                },
            });
        }

        if (isCrisis) {
            const events =
                await gamePlayService.getCrisisEvents(levelId);

            return res.status(201).json({
                message: "เริ่มเกม Crisis Response สำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    status: play.status,
                    started_at: play.started_at,

                    game_seconds: gamePlayService.CRISIS_SECONDS,
                    events,
                },
            });
        }

        // Unit 5 Level 3 : Integrity Inspector
        if (gamePlayService.isInspectorLevel(levelId)) {
            const projects =
                await gamePlayService.getInspectorProjects(levelId);

            return res.status(201).json({
                message: "เริ่มเกม Integrity Inspector สำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    status: play.status,
                    started_at: play.started_at,

                    time_limit: gamePlayService.INSPECTOR_SECONDS,
                    projects,
                },
            });
        }

        // Unit 5 Level 2 : จัดสรรงบประมาณให้เมือง
        if (gamePlayService.isBudgetLevel(levelId)) {
            return res.status(201).json({
                message: "เริ่มเกมจัดสรรงบประมาณสำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    status: play.status,
                    started_at: play.started_at,

                    total_budget: gamePlayService.BUDGET_TOTAL,
                    categories: gamePlayService.BUDGET_CATEGORIES,
                },
            });
        }

        // Unit 5 Level 1 : ตามหาคำจากคำใบ้
        if (gamePlayService.isWordClueLevel(levelId)) {
            const words = await gamePlayService.getWordPuzzles(levelId);

            return res.status(201).json({
                message: "เริ่มเกมตามหาคำสำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    score: play.score,
                    max_score: play.max_score,
                    status: play.status,
                    started_at: play.started_at,

                    words,
                },
            });
        }

        // Unit 4 Level 3 : Firewall Defender
        if (gamePlayService.isFirewallLevel(levelId)) {
            const questions =
                await gamePlayService.getFirewallQuestions(levelId);

            return res.status(201).json({
                message: "เริ่มเกม Firewall สำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    score: play.score,
                    max_score: play.max_score,
                    status: play.status,
                    started_at: play.started_at,

                    hearts: gamePlayService.FIREWALL_HEARTS,
                    questions,
                },
            });
        }

        // Unit 4 Level 2 : Slot (กับดักพนัน)
        if (gamePlayService.isSlotLevel(levelId)) {
            return res.status(201).json({
                message: "เริ่มเกมสล็อตสำเร็จ",

                data: {
                    play_id: play.play_id,
                    user_id: play.user_id,
                    level_id: play.level_id,
                    status: play.status,
                    started_at: play.started_at,

                    start_balance:
                        gamePlayService.SLOT_START_BALANCE,
                    bets: gamePlayService.SLOT_BETS,
                },
            });
        }

        return res.status(201).json({
            message: "เริ่มเกมสำเร็จ",
            data: play,
        });
    } catch (error) {
        console.error(
            "startGame error:",
            error
        );

        return res.status(500).json({
            message: "ไม่สามารถเริ่มเกมได้",
            error: error.message,
        });
    }
};

// ANSWER QUESTION
exports.answerGame = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            play_id,
            question_id,
            choice_id,
        } = req.body;

        // ตรวจข้อมูลที่ส่งมา
        if (
            !play_id ||
            !question_id ||
            !choice_id
        ) {
            return res.status(400).json({
                message:
                    "กรุณาระบุ play_id, question_id และ choice_id",
            });
        }

        const playId = Number(play_id);
        const questionId = Number(question_id);
        const choiceId = Number(choice_id);

        if (
            isNaN(playId) ||
            isNaN(questionId) ||
            isNaN(choiceId)
        ) {
            return res.status(400).json({
                message:
                    "play_id, question_id และ choice_id ต้องเป็นตัวเลข",
            });
        }

        // 1. ตรวจสอบรอบการเล่น
        const play = await prisma.game_play_history.findUnique({
            where: {
                play_id: playId,
            },
        });

        if (!play) {
            return res.status(404).json({
                message:
                    "ไม่พบรอบการเล่นนี้",
            });
        }

        // ป้องกันไม่ให้ User คนอื่นส่ง play_id ของคนอื่นมาใช้
        if (play.user_id !== userId) {
            return res.status(403).json({
                message:
                    "ไม่มีสิทธิ์เข้าถึงรอบการเล่นนี้",
            });
        }

        // เกมจบแล้ว ไม่สามารถตอบเพิ่ม
        if (play.completed_at) {
            return res.status(400).json({
                message:
                    "เกมนี้จบแล้ว ไม่สามารถตอบคำถามเพิ่มได้",
            });
        }

        // Level 2 : ถ้ารอบนี้ FAILED (ยิง Good ผิดไปแล้ว)
        // ต้อง Retry ก่อนถึงจะตอบ Boss ต่อได้
        if (
            play.level_id === 2 &&
            play.status !== "IN_PROGRESS"
        ) {
            return res.status(400).json({
                message:
                    "รอบนี้ยังไม่ผ่านด่าน Bubble กรุณา Retry ก่อน",
            });
        }

        // Unit 6 Level 2 : Good Network — ผิดครบ 3 ครั้ง (หัวใจหมด) ตอบต่อไม่ได้
        if (await gamePlayService.isGoodNetworkLevel(play.level_id)) {
            const wrongSoFar =
                await prisma.game_play_answers.count({
                    where: {
                        play_id: playId,
                        is_correct: false,
                    },
                });

            if (wrongSoFar >= gamePlayService.NETWORK_LIVES) {
                return res.status(400).json({
                    message:
                        "หัวใจหมดแล้ว ไม่สามารถตอบเพิ่มได้",
                });
            }
        }

        // Unit 4 Level 3 : Firewall — ผิดครบ 4 ครั้ง (หัวใจหมด) ตอบต่อไม่ได้
        if (gamePlayService.isFirewallLevel(play.level_id)) {
            const wrongSoFar =
                await prisma.game_play_answers.count({
                    where: {
                        play_id: playId,
                        is_correct: false,
                    },
                });

            if (wrongSoFar >= gamePlayService.FIREWALL_HEARTS) {
                return res.status(400).json({
                    message:
                        "Firewall ถูกเจาะแล้ว ไม่สามารถตอบเพิ่มได้",
                });
            }
        }

        // 2. ตรวจสอบ Question
        const question = await prisma.question.findUnique({
            where: {
                question_id: questionId,
            },
        });

        if (!question) {
            return res.status(404).json({
                message:
                    "ไม่พบคำถามนี้",
            });
        }

        // Question ต้องเป็นของ Level ที่กำลังเล่น
        if (
            question.level_id !==
            play.level_id
        ) {
            return res.status(400).json({
                message:
                    "คำถามนี้ไม่อยู่ใน Level ที่กำลังเล่น",
            });
        }

        // 3. ตรวจสอบ Choice
        const choice = await prisma.choice.findUnique({
            where: {
                choice_id: choiceId,
            },
        });

        if (!choice) {
            return res.status(404).json({
                message:
                    "ไม่พบตัวเลือกนี้",
            });
        }

        // Choice ต้องเป็นของ Question นี้
        if (
            choice.question_id !==
            questionId
        ) {
            return res.status(400).json({
                message:
                    "ตัวเลือกนี้ไม่ใช่ตัวเลือกของคำถามนี้",
            });
        }

        // 4. ตรวจว่าตอบข้อนี้ไปแล้วหรือยัง
        const existingAnswer = await prisma.game_play_answers.findFirst({
            where: {
                play_id: playId,
                question_id: questionId,
            },
        });

        if (existingAnswer) {
            return res.status(409).json({
                message:
                    "คุณตอบคำถามข้อนี้ไปแล้ว",
                data: existingAnswer,
            });
        }


        // 5. บันทึกคำตอบ
        // Level 2 : Boss Bubble
        const isLevel2 = play.level_id === 2;

        const answer =
            await prisma.game_play_answers.create({
                data: {
                    play_id: playId,
                    question_id: questionId,
                    choice_id: choiceId,
                    is_correct: choice.is_correct,

                    ip_reward:
                        isLevel2
                            ? 0
                            : choice.ip_reward,

                    answered_at:
                        new Date(),
                },
            });

        // ถ้า Level 2 ตอบผิด
        if (
            isLevel2 &&
            choice.is_correct === false
        ) {
            await prisma.game_play_history.update({
                where: {
                    play_id: playId,
                },

                data: {
                    score: 0,

                    wrong_count: {
                        increment: 1,
                    },
                },
            });
        } else if (isLevel2) {
            // Level 2 ไม่สะสม Score จากคำตอบ
            await prisma.game_play_history.update({
                where: {
                    play_id: playId,
                },

                data: {
                    score: 0,
                },
            });
        } else {

            const scoreResult =
                await prisma.game_play_answers.aggregate({
                    where: {
                        play_id: playId,
                    },

                    _sum: {
                        ip_reward: true,
                    },
                });

            const currentScore =
                scoreResult._sum.ip_reward || 0;

            await prisma.game_play_history.update({
                where: {
                    play_id: playId,
                },

                data: {
                    score: currentScore,
                },
            });
        }

        // ส่งผลกลับ Frontend
        let reveal = {};

        if (await gamePlayService.isGoodNetworkLevel(play.level_id)) {
            const correctChoice = await prisma.choice.findFirst({
                where: { question_id: questionId, is_correct: true },
                select: { choice_id: true },
            });

            reveal = {
                correct_choice_id: correctChoice?.choice_id ?? null,
                explanation: choice.is_correct
                    ? question.correct_explain
                    : question.wrong_explain || question.correct_explain,
            };
        }

        return res.status(201).json({
            message:
                "บันทึกคำตอบสำเร็จ",

            data: {
                play_id: playId,
                question_id: questionId,
                choice_id: choiceId,

                is_correct:
                    choice.is_correct,

                ...reveal,

                ip_reward:
                    isLevel2
                        ? 0
                        : choice.ip_reward,

                current_score:
                    isLevel2
                        ? 0
                        : (
                            await prisma.game_play_history.findUnique({
                                where: {
                                    play_id: playId,
                                },
                                select: {
                                    score: true,
                                },
                            })
                        )?.score ?? 0,

                max_score:
                    isLevel2
                        ? 0
                        : play.max_score,
            },
        });
    } catch (error) {
        console.error(
            "Answer game error:",
            error
        );

        return res.status(500).json({
            message:
                "เกิดข้อผิดพลาดในการบันทึกคำตอบ",

            error:
                error.message,
        });
    }
};

// Unit 1 Level 1 : Magic Mirror — IP สเกลใหม่
const MIRROR_IP = {
    PER_CORRECT: 50,              // ตอบถูกข้อละ 50 (5 ข้อ = 250)
    FIRST_TRY_PERFECT_BONUS: 50,  // ถูกครบตั้งแต่ครั้งแรก +50 (เต็ม 300)
    MAX_WRONG_TO_PASS: 3,         // ผิดเกิน 3 ข้อ = FAIL (เกณฑ์ผ่านเดิม)
};

// COMPLETE GAME
exports.completeGame = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            play_id,
            final_score,
            is_timeout,
        } = req.body;

        if (!play_id) {
            return res.status(400).json({
                message:
                    "กรุณาระบุ play_id",
            });
        }

        const playId = Number(play_id);

        if (
            !Number.isInteger(playId) ||
            playId <= 0
        ) {
            return res.status(400).json({
                message:
                    "play_id ต้องเป็นจำนวนเต็มที่ถูกต้อง",
            });
        }

        // ค้นหา Play
        const play = await prisma.game_play_history.findUnique({
            where: {
                play_id: playId,
            },
        });

        if (!play) {
            return res.status(404).json({
                message:
                    "ไม่พบรอบการเล่นนี้",
            });
        }

        // ตรวจสอบ User
        if (play.user_id !== userId) {
            return res.status(403).json({
                message:
                    "ไม่มีสิทธิ์เข้าถึงรอบการเล่นนี้",
            });
        }

        // ถ้าเกมจบแล้ว
        if (play.completed_at) {
            return res.status(200).json({
                message:
                    "เกมนี้จบไปแล้ว",

                data: {
                    play_id:
                        play.play_id,

                    score:
                        play.score,

                    max_score:
                        play.max_score,

                    correct_count:
                        play.correct_count,

                    wrong_count:
                        play.wrong_count,

                    earned_ip:
                        play.earned_ip,

                    status:
                        play.status,

                    completed_at:
                        play.completed_at,
                },
            });
        }

        // Unit 1 Level 2 : Bubble Shooter + Boss Bubble
        if (play.level_id === 2) {
            const BOSS_QUESTION_COUNT = 3;
            const BUBBLE_IP_EACH = 10;      // Bubble Bad ลูกละ 10
            const BOSS_IP_EACH = 20;        // Boss ข้อละ 20
            const FIRST_TRY_BONUS_IP = 0;   // โบนัสไม่เคยผิด (ตอนนี้ไม่มี)

            if (play.status !== "IN_PROGRESS") {
                return res.status(400).json({
                    message:
                        "รอบนี้ยังไม่ผ่านด่าน Bubble กรุณา Retry ก่อน",

                    data: {
                        status: play.status,
                    },
                });
            }

            const playBubbles =
                await prisma.game_play_bubbles.findMany({
                    where: {
                        play_id: playId,
                    },

                    include: {
                        bubbles: true,
                    },
                });

            const isBadBubble = (item) =>
                String(item.bubbles.bubble_type)
                    .trim()
                    .toLowerCase() === "bad";

            const remainingBad = playBubbles.filter(
                (item) =>
                    isBadBubble(item) &&
                    !item.is_destroyed
            ).length;

            const destroyedGood = playBubbles.filter(
                (item) =>
                    !isBadBubble(item) &&
                    item.is_destroyed
            ).length;

            if (
                playBubbles.length === 0 ||
                remainingBad > 0 ||
                destroyedGood > 0
            ) {
                return res.status(400).json({
                    message:
                        "ยังไม่ผ่านด่าน Bubble",

                    data: {
                        remaining_bad: remainingBad,
                        destroyed_good: destroyedGood,
                    },
                });
            }

            const bossAnswers =
                await prisma.game_play_answers.findMany({
                    where: {
                        play_id: playId,
                    },

                    select: {
                        question_id: true,
                        is_correct: true,
                    },
                });

            const bossCorrectCount = bossAnswers.filter(
                (answer) => answer.is_correct === true
            ).length;

            if (
                bossAnswers.length < BOSS_QUESTION_COUNT ||
                bossCorrectCount < BOSS_QUESTION_COUNT
            ) {
                return res.status(400).json({
                    message:
                        "ยังตอบ Boss ไม่ครบหรือยังไม่ถูกทุกข้อ",

                    data: {
                        answered: bossAnswers.length,
                        correct: bossCorrectCount,
                        total: BOSS_QUESTION_COUNT,
                    },
                });
            }

            const wrongCount = play.wrong_count ?? 0;
            const isFirstTry = wrongCount === 0;

            const badDestroyed = playBubbles.filter(
                (item) => isBadBubble(item) && item.is_destroyed
            ).length;

            const bubbleIP = badDestroyed * BUBBLE_IP_EACH;
            const bossIP = bossCorrectCount * BOSS_IP_EACH;
            const bonusIP = isFirstTry ? FIRST_TRY_BONUS_IP : 0;
            const earnedIP = bubbleIP + bossIP + bonusIP;

            const status = isFirstTry ? "PERFECT" : "PASS";
            const completedAt = new Date();

            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },

                    data: {
                        score: 0,
                        max_score: 0,
                        correct_count: bossCorrectCount,
                        earned_ip: earnedIP,
                        completed_at: completedAt,
                        status: status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: 0,
                status: status,
                passed: true,
            });

            const userStats = {
                integrity_points:
                    await recalcIntegrityPoints(userId),
            };

            return res.status(200).json({
                message: "จบเกม Level 2 สำเร็จ",

                data: {
                    play_id: playId,
                    status: status,

                    bubble_ip: bubbleIP,
                    bubble_count: badDestroyed,
                    boss_ip: bossIP,
                    bonus_ip: bonusIP,
                    earned_ip: earnedIP,

                    wrong_count: wrongCount,
                    boss_correct: bossCorrectCount,
                    boss_total: BOSS_QUESTION_COUNT,

                    total_integrity_points:
                        userStats?.integrity_points ?? 0,

                    completed_at: completedAt,

                    is_perfect: status === "PERFECT",
                    is_pass: true,
                },
            });
        }

        // Unit 2 Level 1 : Need / Want
        if (play.level_id === 5) {
            // สเกลใหม่: ถูกครบ 10 ชิ้น = 100 / ผ่านตั้งแต่ครั้งแรก +50 → 150
            const BASE_PASS_IP = 100;
            const FIRST_TRY_BONUS_IP = 50;

            const totalItems =
                await prisma.level_items.count({
                    where: {
                        level_id: 5,
                    },
                });

            const answeredItems =
                await prisma.game_play_need_want.count({
                    where: {
                        play_id: playId,
                    },
                });

            if (
                answeredItems <
                totalItems
            ) {
                return res.status(400).json({
                    message:
                        "ยังจัดหมวดหมู่ Item ไม่ครบทุกชิ้น",

                    data: {
                        answered:
                            answeredItems,

                        total:
                            totalItems,
                    },
                });
            }

            const levelItemsWithType =
                await prisma.level_items.findMany({
                    where: { level_id: 5 },
                    select: {
                        item_id: true,
                        item_types: {
                            select: { code: true, name: true },
                        },
                        items: {
                            select: { name: true, image: true },
                        },
                    },
                });

            const answers =
                await prisma.game_play_need_want.findMany({
                    where: { play_id: playId },
                    select: {
                        item_id: true,
                        user_type: true,
                        is_correct: true,
                    },
                });

            const itemResults = answers.map((answer) => {
                const levelItem = levelItemsWithType.find(
                    (li) => li.item_id === answer.item_id
                );

                return {
                    item_id: answer.item_id,
                    name: levelItem?.items?.name || "",
                    image: levelItem?.items?.image || "",
                    correct_type:
                        levelItem?.item_types?.code || "",
                    correct_type_label:
                        levelItem?.item_types?.name || "",
                    user_type: answer.user_type,
                    is_correct: answer.is_correct,
                };
            });

            const correctAnswers = itemResults.filter(
                (item) => item.is_correct
            ).length;

            const isPerfect = correctAnswers === totalItems;
            const status = isPerfect ? "PASS" : "FAIL";
            const completedAt = new Date();

            const priorCompletedCount =
                await prisma.game_play_history.count({
                    where: {
                        user_id: userId,
                        level_id: 5,
                        completed_at: { not: null },
                        play_id: { not: playId },
                    },
                });

            const isFirstTry = priorCompletedCount === 0;
            const baseIP = isPerfect ? BASE_PASS_IP : 0;
            const bonusIP =
                isPerfect && isFirstTry
                    ? FIRST_TRY_BONUS_IP
                    : 0;
            const earnedIP = baseIP + bonusIP;

            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },
                    data: {
                        score: correctAnswers,
                        max_score: totalItems,
                        earned_ip: earnedIP,
                        completed_at: completedAt,
                        status: status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: correctAnswers,
                status: status,
                passed: isPerfect,
            });

            const userStats = {
                integrity_points:
                    await recalcIntegrityPoints(userId),
            };

            return res.status(200).json({
                message:
                    isPerfect
                        ? "จบเกม Need / Want สำเร็จ (PASS)"
                        : "จบเกม Need / Want (FAIL)",

                data: {
                    play_id: playId,
                    status: status,
                    score: correctAnswers,
                    max_score: totalItems,

                    base_ip: baseIP,
                    bonus_ip: bonusIP,
                    earned_ip: earnedIP,
                    is_first_try: isFirstTry,

                    total_integrity_points:
                        userStats?.integrity_points ?? 0,

                    items: itemResults,

                    completed_at: completedAt,

                    is_perfect: isPerfect,
                    is_pass: isPerfect,
                },
            });
        }

        // Unit 2 Level 2 : Calculation / Comparison
        if (play.level_id === 6) {
            const totalQuestions =
                await prisma.comparison_questions.count({
                    where: {
                        level_id: 6,
                    },
                });

            const answeredQuestions =
                await prisma.game_play_comparison.findMany({
                    where: {
                        play_id: playId,
                    },

                    distinct: [
                        "comparison_question_id",
                    ],

                    select: {
                        comparison_question_id:
                            true,
                    },
                });

            if (
                answeredQuestions.length <
                totalQuestions
            ) {
                return res.status(400).json({
                    message:
                        "ยังตอบคำถาม Level 2 ไม่ครบทุกข้อ",

                    data: {
                        answered:
                            answeredQuestions.length,

                        total:
                            totalQuestions,
                    },
                });
            }

            const correctlyAnsweredQuestions =
                await prisma.game_play_comparison.findMany({
                    where: {
                        play_id: playId,
                        is_correct: true,
                    },

                    distinct: [
                        "comparison_question_id",
                    ],

                    select: {
                        comparison_question_id:
                            true,
                    },
                });

            const isPass =
                correctlyAnsweredQuestions.length ===
                totalQuestions;
            const COMPARE_IP_PER_CORRECT = 20;
            const COMPARE_IP_FIRST_TRY_BONUS = 10;

            const firstTryCorrectCount =
                await prisma.game_play_comparison.count({
                    where: {
                        play_id: playId,

                        first_try_correct:
                            true,
                    },
                });

            const answerIP = isPass
                ? correctlyAnsweredQuestions.length *
                COMPARE_IP_PER_CORRECT
                : 0;

            const firstTryBonusIP = isPass
                ? firstTryCorrectCount *
                COMPARE_IP_FIRST_TRY_BONUS
                : 0;

            const earnedIP = answerIP + firstTryBonusIP;
            const messageStatus =
                firstTryCorrectCount === totalQuestions
                    ? "PERFECT"
                    : firstTryCorrectCount >= 3
                        ? "GREAT"
                        : firstTryCorrectCount >= 1
                            ? "PASS"
                            : "FAIL";

            const completedAt =
                new Date();

            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },

                    data: {
                        score:
                            firstTryCorrectCount,

                        max_score:
                            totalQuestions,

                        earned_ip:
                            earnedIP,

                        completed_at:
                            completedAt,

                        status:
                            messageStatus,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: firstTryCorrectCount,
                status: messageStatus,
                passed: isPass,
            });

            const userStats = {
                integrity_points:
                    await recalcIntegrityPoints(userId),
            };

            return res.status(200).json({
                message: isPass
                    ? "จบเกม Level 2 สำเร็จ (PASS)"
                    : "จบเกม Level 2 (FAIL)",

                data: {
                    play_id: playId,

                    status: messageStatus,

                    is_pass: isPass,

                    score:
                        firstTryCorrectCount,

                    max_score:
                        totalQuestions,

                    answer_ip: answerIP,
                    first_try_bonus_ip: firstTryBonusIP,
                    first_try_correct: firstTryCorrectCount,
                    earned_ip: earnedIP,

                    total_integrity_points:
                        userStats?.integrity_points ?? 0,

                    answered:
                        answeredQuestions.length,

                    total:
                        totalQuestions,

                    completed_at: completedAt,

                    is_perfect:
                        firstTryCorrectCount ===
                        totalQuestions,
                },
            });
        }

        // Unit 2 Final Level : level_id = 7
        if (play.level_id === 7) {
            const INITIAL_MONEY = 500;
            const PASS_SCORE = 8;
            const IP_PER_CORRECT = 10;
            const MEDAL_BONUS_IP = {
                GOLD: 50,
                SILVER: 25,
                BRONZE: 5,
            };

            const totalQuestions =
                await prisma.question.count({
                    where: {
                        level_id: 7,
                    },
                });

            const answeredQuestions =
                await prisma.game_play_answers.findMany({
                    where: {
                        play_id: playId,
                    },

                    distinct: [
                        "question_id",
                    ],

                    select: {
                        question_id: true,
                    },
                });

            const answersWithCost =
                await prisma.game_play_answers.findMany({
                    where: {
                        play_id: playId,
                    },

                    select: {
                        is_correct: true,

                        choice: {
                            select: {
                                cost: true,
                            },
                        },
                    },
                });

            const totalSpent = answersWithCost.reduce(
                (sum, answer) =>
                    sum + (answer.choice?.cost ?? 0),
                0
            );

            const moneyRemaining =
                INITIAL_MONEY - totalSpent;

            const isBankrupt = moneyRemaining <= 0;
            const isTimeout = is_timeout === true;

            if (
                answeredQuestions.length <
                totalQuestions &&
                !isBankrupt &&
                !isTimeout
            ) {
                return res.status(400).json({
                    message:
                        "ยังตอบคำถามไม่ครบและเงินยังไม่หมด ยังจบภารกิจไม่ได้",

                    data: {
                        answered:
                            answeredQuestions.length,

                        total: totalQuestions,
                    },
                });
            }

            const correctAnswers =
                answersWithCost.filter(
                    (answer) => answer.is_correct
                ).length;

            const isPassed =
                !isBankrupt &&
                !isTimeout &&
                correctAnswers >= PASS_SCORE;

            const status = isPassed ? "PASS" : "FAIL";
            const priorCompletedCount =
                await prisma.game_play_history.count({
                    where: {
                        user_id: userId,
                        level_id: 7,
                        completed_at: { not: null },
                        play_id: { not: playId },
                    },
                });

            const isFirstTry =
                priorCompletedCount === 0;

            const allCorrect =
                totalQuestions > 0 &&
                correctAnswers === totalQuestions;

            let medal = null;

            if (isPassed && isFirstTry) {
                if (allCorrect) {
                    medal = "GOLD";
                } else if (
                    correctAnswers >=
                    totalQuestions - 1
                ) {
                    medal = "SILVER";
                } else if (
                    correctAnswers >=
                    totalQuestions - 2
                ) {
                    medal = "BRONZE";
                }
            }

            const medalBonusIP = medal
                ? MEDAL_BONUS_IP[medal]
                : 0;

            const answerIP = isPassed
                ? correctAnswers * IP_PER_CORRECT
                : 0;

            const earnedIP = isPassed
                ? answerIP + medalBonusIP
                : 0;

            const completedAt =
                new Date();

            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },

                    data: {
                        score:
                            correctAnswers,

                        max_score:
                            totalQuestions,

                        earned_ip:
                            earnedIP,

                        completed_at:
                            completedAt,

                        status:
                            status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: correctAnswers,
                status: status,
                passed: isPassed,
            });

            const userStats = {
                integrity_points:
                    await recalcIntegrityPoints(userId),
            };

            return res.status(200).json({
                message: isPassed
                    ? "จบ Unit 2 Final Level สำเร็จ (PASS)"
                    : "จบ Unit 2 Final Level (FAIL)",

                data: {
                    play_id: playId,
                    status: status,
                    is_pass: isPassed,
                    score: correctAnswers,
                    max_score: totalQuestions,
                    answered: answeredQuestions.length,
                    total: totalQuestions,
                    money_remaining: moneyRemaining,
                    is_bankrupt: isBankrupt,
                    is_timeout: isTimeout,
                    medal: medal,
                    is_first_try: isFirstTry,

                    // base_ip = IP จากข้อที่ตอบถูก (ข้อละ 10)
                    base_ip: answerIP,
                    answer_ip: answerIP,
                    medal_bonus_ip: medalBonusIP,
                    earned_ip: earnedIP,
                    total_integrity_points:
                        userStats?.integrity_points ??
                        0,
                    completed_at: completedAt,
                    is_perfect: allCorrect,
                },
            });
        }

        if (gamePlayService.isSlipHuntLevel(play.level_id)) {
            const stats =
                await gamePlayService.getSlipHuntAnswerStats(playId);

            if (stats.answered < stats.total) {
                return res.status(400).json({
                    message: "ยังตรวจสลิปไม่ครบทุกใบ",
                    data: {
                        answered: stats.answered,
                        total: stats.total,
                    },
                });
            }

            const result =
                gamePlayService.calcSlipHuntResult(stats.correct);

            const completedAt = new Date();

            // updateMany + completed_at: null กันจบเกมซ้ำ / ได้ IP ซ้ำ
            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },
                    data: {
                        score: stats.correct,
                        max_score: stats.total,
                        correct_count: stats.correct,
                        wrong_count: stats.wrong,
                        earned_ip: result.earnedIP,
                        completed_at: completedAt,
                        status: result.status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: stats.correct,
                status: result.status,
                passed: result.isPass,
            });

            // IP รวม = ผลรวม earned_ip ที่ดีที่สุดของแต่ละ level
            const totalIP =
                await recalcIntegrityPoints(userId);

            const slips =
                await gamePlayService.getSlipHuntAnswers(playId);

            return res.status(200).json({
                message: result.isPass
                    ? "จบเกม Slip Hunt สำเร็จ (PASS)"
                    : "จบเกม Slip Hunt (FAIL)",

                data: {
                    play_id: playId,
                    status: result.status,

                    score: stats.correct,
                    max_score: stats.total,
                    correct_count: stats.correct,
                    wrong_count: stats.wrong,

                    answer_ip: result.answerIP,
                    perfect_bonus_ip: result.perfectBonusIP,
                    earned_ip: result.earnedIP,

                    total_integrity_points: totalIP ?? 0,

                    slips,

                    completed_at: completedAt,

                    is_perfect: result.isPerfect,
                    is_pass: result.isPass,
                    is_fail: !result.isPass,
                },
            });
        }

        if (await gamePlayService.isGoodNetworkLevel(play.level_id)) {
            const stats =
                await gamePlayService.getGoodNetworkStats(
                    playId,
                    play.level_id
                );

            if (!stats.reachedGoal && !stats.isOutOfLives) {
                return res.status(400).json({
                    message: "ยังไม่ถึงศาลยุติธรรม และหัวใจยังไม่หมด",
                    data: {
                        answered: stats.answered,
                        wrong: stats.wrong,
                    },
                });
            }

            const result =
                gamePlayService.calcGoodNetworkResult(stats);

            const completedAt = new Date();

            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },
                    data: {
                        score: stats.correct,
                        correct_count: stats.correct,
                        wrong_count: stats.wrong,
                        earned_ip: result.earnedIP,
                        completed_at: completedAt,
                        status: result.status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: stats.correct,
                status: result.status,
                passed: result.isPass,
            });

            const totalIP =
                await recalcIntegrityPoints(userId);

            return res.status(200).json({
                message: result.isPass
                    ? "จบเกมเครือข่ายความดีสำเร็จ (PASS)"
                    : "จบเกมเครือข่ายความดี (FAIL)",

                data: {
                    play_id: playId,
                    status: result.status,

                    score: stats.correct,
                    max_score: play.max_score,
                    correct_count: stats.correct,
                    wrong_count: stats.wrong,
                    earned_ip: result.earnedIP,

                    lives_left: stats.livesLeft,
                    reached_goal: stats.reachedGoal,
                    total_integrity_points: totalIP ?? 0,
                    completed_at: completedAt,

                    is_perfect: result.isPerfect,
                    is_pass: result.isPass,
                    is_fail: !result.isPass,
                },
            });
        }

        // Unit 6 Level 1 : Crisis Response
        if (await gamePlayService.isCrisisLevel(play.level_id)) {
            const elapsed = gamePlayService.crisisElapsed(play);

            if (elapsed < gamePlayService.CRISIS_SECONDS - 3) {
                return res.status(400).json({
                    message: "ยังไม่หมดเวลาภารกิจ",
                    data: {
                        elapsed: Math.floor(elapsed),
                        required: gamePlayService.CRISIS_SECONDS,
                    },
                });
            }

            const totals =
                await gamePlayService.getCrisisTotals(playId);
            const result =
                gamePlayService.calcCrisisResult(totals);

            const completedAt = new Date();

            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },
                    data: {
                        score: totals.score,
                        max_score: 0,
                        correct_count: totals.helped,
                        wrong_count: totals.missed,
                        earned_ip: result.earnedIP,
                        completed_at: completedAt,
                        status: result.status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: totals.score,
                status: result.status,
                passed: result.isPass,
            });

            const totalIP =
                await recalcIntegrityPoints(userId);

            return res.status(200).json({
                message: "จบเกม Crisis Response สำเร็จ",

                data: {
                    play_id: playId,
                    status: result.status,

                    score: totals.score,
                    integrity: totals.integrity,
                    helped: totals.helped,
                    missed: totals.missed,
                    correct_count: totals.helped,
                    wrong_count: totals.missed,
                    rank: result.rank,
                    earned_ip: result.earnedIP,

                    total_integrity_points: totalIP ?? 0,
                    completed_at: completedAt,

                    is_perfect: result.isPerfect,
                    is_pass: true,
                    is_fail: false,
                },
            });
        }

        // Unit 5 Level 3 : Integrity Inspector
        if (gamePlayService.isInspectorLevel(play.level_id)) {
            const stats =
                await gamePlayService.getInspectorStats(
                    playId,
                    play.level_id
                );

            if (stats.decided < stats.total && is_timeout !== true) {
                return res.status(400).json({
                    message: "ยังตรวจเอกสารไม่ครบทุกโครงการ",
                    data: {
                        decided: stats.decided,
                        total: stats.total,
                    },
                });
            }

            const result =
                gamePlayService.calcInspectorResult(stats);

            const review = gamePlayService.buildInspectorReview(
                await gamePlayService.getProjectDecisions(playId)
            );

            const completedAt = new Date();

            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },
                    data: {
                        score: stats.score,
                        max_score: 100,
                        correct_count: stats.correct,
                        wrong_count: stats.wrong,
                        earned_ip: result.earnedIP,
                        completed_at: completedAt,
                        status: result.status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: stats.score,
                status: result.status,
                passed: result.isPass,
            });

            const totalIP =
                await recalcIntegrityPoints(userId);

            return res.status(200).json({
                message: "จบเกม Integrity Inspector สำเร็จ",

                data: {
                    play_id: playId,
                    status: result.status,

                    score: stats.score,
                    max_score: 100,
                    correct_count: stats.correct,
                    wrong_count: stats.wrong,
                    earned_ip: result.earnedIP,

                    integrity: stats.integrity,
                    rank: result.rank,
                    decided: stats.decided,
                    total_projects: stats.total,
                    is_timeout: stats.decided < stats.total,

                    protected_baht: review.protected_baht,
                    lost_baht: review.lost_baht,
                    review_projects: review.projects,

                    total_integrity_points: totalIP ?? 0,
                    completed_at: completedAt,

                    is_perfect: result.isPerfect,
                    is_pass: true,
                    is_fail: false,
                },
            });
        }

        // Unit 5 Level 2 : จัดสรรงบประมาณให้เมือง
        if (gamePlayService.isBudgetLevel(play.level_id)) {
            const budgets =
                await gamePlayService.getBudgetAllocations(playId);

            if (!budgets) {
                return res.status(400).json({
                    message: "ยังไม่ได้ส่งการจัดสรรงบประมาณ",
                });
            }

            const budgetEvent =
                await gamePlayService.getBudgetEvent(playId);

            const result =
                gamePlayService.calcBudgetResult(budgets, budgetEvent);

            const completedAt = new Date();

            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },
                    data: {
                        score: result.score,
                        max_score: 100,
                        earned_ip: result.earnedIP,
                        completed_at: completedAt,
                        status: result.status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: result.score,
                status: result.status,
                passed: result.isPass,
            });

            const totalIP =
                await recalcIntegrityPoints(userId);

            return res.status(200).json({
                message: "จบเกมจัดสรรงบประมาณสำเร็จ",

                data: {
                    play_id: playId,
                    status: result.status,

                    score: result.score,
                    max_score: 100,
                    earned_ip: result.earnedIP,

                    rank: result.rank,
                    happiness: result.happiness,
                    budgets,
                    total_budget: gamePlayService.BUDGET_TOTAL,
                    remaining_budget: result.remaining,

                    total_integrity_points: totalIP ?? 0,
                    completed_at: completedAt,

                    is_perfect: result.isPerfect,
                    is_pass: true,
                    is_fail: false,
                },
            });
        }

        // Unit 5 Level 1 : ตามหาคำจากคำใบ้
        if (gamePlayService.isWordClueLevel(play.level_id)) {
            const stats =
                await gamePlayService.getWordStats(
                    playId,
                    play.level_id
                );

            if (stats.solved < stats.total) {
                return res.status(400).json({
                    message: "ยังหาคำไม่ครบทุกคำ",
                    data: {
                        solved: stats.solved,
                        total: stats.total,
                    },
                });
            }

            const result = gamePlayService.calcWordResult(stats);
            const completedAt = new Date();
            const updated = await prisma.game_play_history.updateMany({
                where: {
                    play_id: playId,
                    completed_at: null,
                },
                data: {
                    score: stats.solved,
                    max_score: stats.total,
                    correct_count: stats.solved,
                    wrong_count: stats.wrong,
                    earned_ip: result.earnedIP,
                    completed_at: completedAt,
                    status: result.status,
                },
            });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: stats.solved,
                status: result.status,
                passed: result.isPass,
            });

            const totalIP =
                await recalcIntegrityPoints(userId);

            return res.status(200).json({
                message: "จบเกมตามหาคำสำเร็จ",

                data: {
                    play_id: playId,
                    status: result.status,

                    score: stats.solved,
                    max_score: stats.total,
                    correct_count: stats.solved,
                    wrong_count: stats.wrong,
                    earned_ip: result.earnedIP,
                    max_ip: stats.maxIP,

                    total_integrity_points: totalIP ?? 0,
                    completed_at: completedAt,

                    is_perfect: result.isPerfect,
                    is_pass: result.isPass,
                    is_fail: !result.isPass,
                },
            });
        }

        // Unit 4 Level 3 : Firewall Defender
        if (gamePlayService.isFirewallLevel(play.level_id)) {
            const stats =
                await gamePlayService.getFirewallStats(
                    playId,
                    play.level_id
                );

            if (stats.answered < stats.total && !stats.isBroken) {
                return res.status(400).json({
                    message:
                        "ยังตอบคำถามไม่ครบ และ Firewall ยังไม่ถูกเจาะ",
                    data: {
                        answered: stats.answered,
                        total: stats.total,
                    },
                });
            }

            const result =
                gamePlayService.calcFirewallResult(stats);

            const completedAt = new Date();

            // updateMany + completed_at: null กันจบเกมซ้ำ / ได้ IP ซ้ำ
            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },
                    data: {
                        score: stats.correct,
                        max_score: stats.total,
                        correct_count: stats.correct,
                        wrong_count: stats.wrong,
                        earned_ip: result.earnedIP,
                        completed_at: completedAt,
                        status: result.status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: stats.correct,
                status: result.status,
                passed: result.isPass,
            });

            const totalIP =
                await recalcIntegrityPoints(userId);

            return res.status(200).json({
                message: result.isPass
                    ? "จบเกม Firewall สำเร็จ (PASS)"
                    : "จบเกม Firewall (FAIL)",

                data: {
                    play_id: playId,
                    status: result.status,

                    // key เดียวกับกรณี "เกมนี้จบไปแล้ว" ด้านบน
                    // หน้า Result จึงใช้ได้ทั้งสองแบบ
                    score: stats.correct,
                    max_score: stats.total,
                    correct_count: stats.correct,
                    wrong_count: stats.wrong,
                    earned_ip: result.earnedIP,

                    answered: stats.answered,
                    hearts_left: stats.heartsLeft,
                    total_integrity_points: totalIP ?? 0,

                    completed_at: completedAt,

                    is_perfect: result.isPerfect,
                    is_pass: result.isPass,
                    is_fail: !result.isPass,
                },
            });
        }

        // Unit 4 Level 2 : Slot (กับดักพนัน)
        if (gamePlayService.isSlotLevel(play.level_id)) {
            const summary =
                await gamePlayService.getSlotSummary(playId);

            if (!summary.is_broke) {
                return res.status(400).json({
                    message: "ยังเล่นไม่จบ เครดิตยังไม่หมด",
                    data: {
                        spins: summary.spins,
                        balance: summary.balance,
                    },
                });
            }

            const result = gamePlayService.calcSlotResult();
            const completedAt = new Date();

            // updateMany + completed_at: null กันจบเกมซ้ำ / ได้ IP ซ้ำ
            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },
                    data: {
                        // score = จำนวนครั้งที่หมุนจนเครดิตหมด
                        score: summary.spins,
                        max_score: 0,
                        earned_ip: result.earnedIP,
                        completed_at: completedAt,
                        status: result.status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: summary.spins,
                status: result.status,
                passed: result.isPass,
            });

            const totalIP =
                await recalcIntegrityPoints(userId);

            return res.status(200).json({
                message: "จบเกมสล็อตสำเร็จ (PASS)",

                data: {
                    play_id: playId,
                    status: result.status,

                    earned_ip: result.earnedIP,
                    total_integrity_points: totalIP ?? 0,

                    spins: summary.spins,
                    start_balance: summary.start_balance,
                    peak_balance: summary.peak_balance,
                    total_bet: summary.total_bet,
                    total_reward: summary.total_reward,
                    rounds: summary.rounds,

                    completed_at: completedAt,

                    is_perfect: false,
                    is_pass: true,
                    is_fail: false,
                },
            });
        }

        // Level อื่น ๆ ที่ใช้ question + choice
        const questionCount =
            await prisma.question.count({
                where: {
                    level_id:
                        play.level_id,
                },
            });

        const answerCount =
            await prisma.game_play_answers.count({
                where: {
                    play_id: playId,
                },
            });

        if (
            answerCount <
            questionCount
        ) {
            return res.status(400).json({
                message:
                    "ยังตอบคำถามไม่ครบทุกข้อ",

                data: {
                    answered:
                        answerCount,

                    total:
                        questionCount,
                },
            });
        }

        // Unit 1 Level 1 : Mirror Quiz
        if (play.level_id === 1) {
            // ดึงคำตอบทั้งหมดของการเล่นรอบนี้
            const answers =
                await prisma.game_play_answers.findMany({
                    where: {
                        play_id: playId,
                    },

                    select: {
                        is_correct:
                            true,
                    },
                });

            const correctCount =
                answers.filter(
                    (answer) =>
                        answer.is_correct === true
                ).length;

            const wrongCount =
                answers.filter(
                    (answer) =>
                        answer.is_correct === false
                ).length;

            const priorCompletedCount =
                await prisma.game_play_history.count({
                    where: {
                        user_id: userId,
                        level_id: 1,
                        completed_at: { not: null },
                        play_id: { not: playId },
                    },
                });

            const isFirstTry = priorCompletedCount === 0;

            let status;

            if (wrongCount > MIRROR_IP.MAX_WRONG_TO_PASS) {
                status = "FAIL";
            } else if (wrongCount === 0) {
                status = "PERFECT";
            } else {
                status = "PASS";
            }

            const answerIP =
                correctCount * MIRROR_IP.PER_CORRECT;

            const perfectBonusIP =
                status === "PERFECT" && isFirstTry
                    ? MIRROR_IP.FIRST_TRY_PERFECT_BONUS
                    : 0;

            const earnedIP = answerIP + perfectBonusIP;

            const completedAt = new Date();


            const updated =
                await prisma.game_play_history.updateMany({
                    where: {
                        play_id: playId,
                        completed_at: null,
                    },

                    data: {
                        score: correctCount,
                        max_score: questionCount,
                        correct_count: correctCount,
                        wrong_count: wrongCount,
                        earned_ip: earnedIP,
                        completed_at: completedAt,
                        status: status,
                    },
                });

            if (updated.count === 0) {
                return res.status(200).json({
                    message: "เกมนี้จบไปแล้ว",
                });
            }

            const completedPlay = {
                play_id: playId,
                score: correctCount,
                max_score: questionCount,
                completed_at: completedAt,
            };

            // UPDATE USER LEVEL PROGRESS
            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: completedPlay.score,
                status: status,
                passed:
                    status === "PASS" ||
                    status === "PERFECT",
            });

            // เพิ่ม IP ให้ User
            // IP รวม = ผลรวม earned_ip ที่ดีที่สุดของแต่ละ level
            // (เล่นซ้ำไม่บวกเพิ่ม นับเฉพาะรอบที่ดีที่สุด)
            const userStats = {
                integrity_points:
                    await recalcIntegrityPoints(userId),
            };

            // ส่งผลกลับ Frontend
            return res.status(200).json({
                message:
                    "จบเกม Mirror Quiz สำเร็จ",

                data: {
                    play_id: completedPlay.play_id,
                    score: completedPlay.score,
                    max_score: completedPlay.max_score,
                    correct_count: correctCount,
                    wrong_count: wrongCount,
                    answer_ip: answerIP,
                    perfect_bonus_ip: perfectBonusIP,
                    perfectBonusIP,

                    is_first_try:
                        isFirstTry,

                    earned_ip:
                        earnedIP,

                    total_integrity_points:
                        userStats
                            ?.integrity_points ??
                        0,

                    status:
                        status,

                    completed_at:
                        completedPlay.completed_at,

                    is_perfect:
                        status ===
                        "PERFECT",

                    is_pass:
                        status === "PASS" ||
                        status === "PERFECT",

                    is_fail:
                        status ===
                        "FAIL",
                },
            });
        }

        // Unit 1 FinalLevel : level_id = 3
        if (play.level_id === 3) {
            const RANK_BONUS_IP = {
                MASTER: 50,
                EXPERT: 20,
                NOVICE: 0,
                TRAINEE: 0,
            };

            const activeCases = await prisma.final_cases.findMany({
                where: { level_id: play.level_id, is_active: true },
                select: { case_id: true },
            });

            const caseCount = activeCases.length;

            const passedCases = await prisma.game_play_case_attempts.findMany({
                where: { play_id: playId, is_passed: true },
                distinct: ["case_id"],
                select: { case_id: true },
            });

            if (passedCases.length < caseCount) {
                return res.status(400).json({
                    message: "ยังผ่าน Case ไม่ครบทุก Case",
                    data: {
                        passed_cases: passedCases.length,
                        total_cases: caseCount,
                    },
                });
            }

            const allAttempts = await prisma.game_play_case_attempts.findMany({
                where: { play_id: playId },
                select: {
                    case_id: true,
                    attempt_number: true,
                    is_timeout: true,
                },
            });

            const maxAttemptByCase = {};
            let hasAnyTimeout = false;

            for (const attempt of allAttempts) {
                const current = maxAttemptByCase[attempt.case_id] || 0;

                if (attempt.attempt_number > current) {
                    maxAttemptByCase[attempt.case_id] = attempt.attempt_number;
                }

                if (attempt.is_timeout) {
                    hasAnyTimeout = true;
                }
            }

            const retryCaseCount = Object.values(maxAttemptByCase).filter(
                (maxAttempt) => maxAttempt > 1
            ).length;

            let rank;

            if (hasAnyTimeout) {
                rank = "TRAINEE";
            } else if (retryCaseCount === 0) {
                rank = "MASTER";
            } else if (retryCaseCount <= 2) {
                rank = "EXPERT";
            } else {
                rank = "NOVICE";
            }

            const answerIpResult = await prisma.game_play_answers.aggregate({
                where: { play_id: playId },
                _sum: { ip_reward: true },
            });

            const caseAnswerIP = answerIpResult._sum.ip_reward || 0;
            const bonusIP = RANK_BONUS_IP[rank] ?? 0;
            const earnedIP = caseAnswerIP + bonusIP;

            const correctChoices = await prisma.choice.findMany({
                where: {
                    is_correct: true,
                    question: {
                        level_id: play.level_id,
                        case_id: { not: null },
                    },
                },
                select: { ip_reward: true },
            });

            const maxCaseIP = correctChoices.reduce(
                (sum, choice) => sum + choice.ip_reward,
                0
            );

            const completedAt = new Date();

            const updated = await prisma.game_play_history.updateMany({
                where: { play_id: playId, completed_at: null },
                data: {
                    score: caseAnswerIP,
                    max_score: maxCaseIP,
                    earned_ip: earnedIP,
                    completed_at: completedAt,
                    status: rank,
                },
            });

            if (updated.count === 0) {
                return res.status(200).json({ message: "เกมนี้จบไปแล้ว" });
            }

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: caseAnswerIP,
                status: rank,
                passed: true,
            });

            const userStats = {
                integrity_points:
                    await recalcIntegrityPoints(userId),
            };

            return res.status(200).json({
                message: "จบ Final Level สำเร็จ",
                data: {
                    play_id: playId,
                    rank,
                    case_answer_ip: caseAnswerIP,
                    bonus_ip: bonusIP,
                    earned_ip: earnedIP,
                    max_case_ip: maxCaseIP,
                    retry_case_count: retryCaseCount,
                    has_any_timeout: hasAnyTimeout,
                    total_integrity_points: userStats?.integrity_points ?? 0,
                    completed_at: completedAt,
                },
            });
        }


        const completedAt = new Date();

        const parsedFinalScore = Number(final_score);

        const finalScore = Number.isFinite(parsedFinalScore)
            ? Math.max(
                0,
                Math.min(
                    100,
                    parsedFinalScore
                )
            )
            : play.score;

        const finalMaxScore = play.max_score;

        // บันทึกผลการเล่น
        const completedPlay =
            await prisma.game_play_history.update({
                where: {
                    play_id: playId,
                },

                data: {
                    score:
                        finalScore,

                    max_score:
                        finalMaxScore,

                    completed_at:
                        completedAt,

                    status:
                        "COMPLETED",
                },
            });

        // ส่งผลกลับ
        return res.status(200).json({
            message:
                "จบเกมสำเร็จ",

            data: {
                play_id:
                    completedPlay.play_id,

                score:
                    completedPlay.score,

                max_score:
                    completedPlay.max_score,

                answered:
                    answerCount,

                total:
                    questionCount,

                completed_at:
                    completedPlay.completed_at,

                is_perfect:
                    completedPlay.score ===
                    completedPlay.max_score,
            },
        });
    } catch (error) {
        console.error(
            "Complete game error:",
            error
        );

        return res.status(500).json({
            message:
                "เกิดข้อผิดพลาดในการจบเกม",

            error:
                error.message,
        });
    }
};

// Level 2 : ยิง Bubble
exports.shootBubble = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            play_bubble_id,
        } = req.body;

        if (!play_bubble_id) {
            return res.status(400).json({
                message:
                    "กรุณาระบุ play_bubble_id",
            });
        }

        // ค้นหา Bubble ของ Play นี้
        const playBubble =
            await prisma.game_play_bubbles.findUnique({
                where: {
                    play_bubble_id:
                        Number(
                            play_bubble_id
                        ),
                },

                include: {
                    bubbles: true,
                    game_play_history:
                        true,
                },
            });

        if (!playBubble) {
            return res.status(404).json({
                message:
                    "ไม่พบ Bubble ของการเล่นนี้",
            });
        }

        // ตรวจสอบ User
        if (
            playBubble
                .game_play_history
                .user_id !== userId
        ) {
            return res.status(403).json({
                message:
                    "ไม่มีสิทธิ์แก้ไขการเล่นนี้",
            });
        }

        // ตรวจสอบว่าเกมยังเล่นอยู่
        if (
            playBubble
                .game_play_history
                .status !==
            "IN_PROGRESS"
        ) {
            return res.status(400).json({
                message:
                    "เกมนี้จบไปแล้ว",
            });
        }

        // ตรวจสอบว่า Bubble ถูกยิงไปแล้วหรือยัง
        if (playBubble.is_destroyed) {
            return res.status(400).json({
                message:
                    "Bubble นี้ถูกยิงไปแล้ว",
            });
        }

        // ตรวจสอบว่า Bubble เป็น Good หรือ Bad
        const bubbleType =
            String(
                playBubble
                    .bubbles
                    .bubble_type
            )
                .trim()
                .toLowerCase();

        const isCorrect =
            bubbleType === "bad";

        // อัปเดตประวัติ Bubble
        const updatedBubble =
            await prisma.game_play_bubbles.update({
                where: {
                    play_bubble_id:
                        Number(
                            play_bubble_id
                        ),
                },

                data: {
                    is_destroyed:
                        true,

                    is_correct:
                        isCorrect,

                    destroyed_at:
                        new Date(),
                },
            });

        // ถ้ายิง Good → เกมผิด (FAILED ต้อง Retry)
        if (!isCorrect) {
            await prisma.game_play_history.update({
                where: {
                    play_id:
                        playBubble
                            .game_play_history
                            .play_id,
                },

                data: {
                    status:
                        "FAILED",

                    wrong_count: {
                        increment: 1,
                    },
                },
            });

            return res.status(200).json({
                message:
                    "ยิง Bubble ผิด",

                data: {
                    play_bubble_id:
                        updatedBubble
                            .play_bubble_id,

                    bubble_id:
                        updatedBubble
                            .bubble_id,

                    is_destroyed:
                        updatedBubble
                            .is_destroyed,

                    is_correct:
                        updatedBubble
                            .is_correct,

                    destroyed_at:
                        updatedBubble
                            .destroyed_at,

                    game_status:
                        "FAILED",
                },
            });
        }

        return res.status(200).json({
            message:
                "ยิง Bubble ถูกต้อง",

            data: {
                play_bubble_id:
                    updatedBubble
                        .play_bubble_id,

                bubble_id:
                    updatedBubble
                        .bubble_id,

                is_destroyed:
                    updatedBubble
                        .is_destroyed,

                is_correct:
                    updatedBubble
                        .is_correct,

                destroyed_at:
                    updatedBubble
                        .destroyed_at,

                score:
                    0,

                game_status:
                    "IN_PROGRESS",
            },
        });
    } catch (error) {
        console.error(
            "shootBubble error:",
            error
        );

        return res.status(500).json({
            message:
                "ไม่สามารถบันทึกการยิง Bubble ได้",

            error:
                error.message,
        });
    }
};

// Unit 1 : Final Level START CASE ATTEMPT
exports.startCaseAttempt = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            play_id,
            case_id,
        } = req.body;

        if (
            !play_id ||
            !case_id
        ) {
            return res.status(400).json({
                message:
                    "กรุณาระบุ play_id และ case_id",
            });
        }

        const playId =
            Number(play_id);

        const caseId =
            Number(case_id);

        const play =
            await prisma.game_play_history.findUnique({
                where: {
                    play_id:
                        playId,
                },
            });

        if (!play) {
            return res.status(404).json({
                message:
                    "ไม่พบรอบการเล่นนี้",
            });
        }

        if (
            play.user_id !==
            userId
        ) {
            return res.status(403).json({
                message:
                    "ไม่มีสิทธิ์เข้าถึงรอบการเล่นนี้",
            });
        }

        const caseData =
            await prisma.final_cases.findUnique({
                where: {
                    case_id:
                        caseId,
                },
            });

        if (!caseData) {
            return res.status(404).json({
                message:
                    "ไม่พบ Case นี้",
            });
        }

        const lastAttempt =
            await prisma.game_play_case_attempts.findFirst({
                where: {
                    play_id:
                        playId,

                    case_id:
                        caseId,
                },

                orderBy: {
                    attempt_number:
                        "desc",
                },
            });

        const attemptNumber =
            lastAttempt
                ? lastAttempt.attempt_number +
                1
                : 1;

        const attempt =
            await prisma.game_play_case_attempts.create({
                data: {
                    play_id:
                        playId,

                    case_id:
                        caseId,

                    attempt_number:
                        attemptNumber,

                    started_at:
                        new Date(),

                    completed_at:
                        null,

                    elapsed_seconds:
                        null,

                    is_timeout:
                        false,

                    is_passed:
                        false,
                },
            });

        return res.status(201).json({
            message:
                "เริ่ม Case สำเร็จ",

            data: {
                attempt_id:
                    attempt.attempt_id,

                play_id:
                    attempt.play_id,

                case_id:
                    attempt.case_id,

                attempt_number:
                    attempt.attempt_number,

                started_at:
                    attempt.started_at,
            },
        });
    } catch (error) {
        console.error(
            "Start Case Attempt Error:",
            error
        );

        return res.status(500).json({
            message:
                "ไม่สามารถเริ่ม Case ได้",

            error:
                error.message,
        });
    }
};

// COMPLETE CASE ATTEMPT
exports.completeCaseAttempt = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            play_id,
            case_id,
        } = req.body;

        if (
            !play_id ||
            !case_id
        ) {
            return res.status(400).json({
                message:
                    "กรุณาระบุ play_id และ case_id",
            });
        }

        const playId =
            Number(play_id);

        const caseId =
            Number(case_id);

        const play =
            await prisma.game_play_history.findUnique({
                where: {
                    play_id:
                        playId,
                },
            });

        if (!play) {
            return res.status(404).json({
                message:
                    "ไม่พบรอบการเล่น",
            });
        }

        if (
            play.user_id !==
            userId
        ) {
            return res.status(403).json({
                message:
                    "ไม่มีสิทธิ์เข้าถึงรอบการเล่นนี้",
            });
        }

        const attempt =
            await prisma.game_play_case_attempts.findFirst({
                where: {
                    play_id:
                        playId,

                    case_id:
                        caseId,

                    completed_at:
                        null,
                },

                orderBy: {
                    attempt_number:
                        "desc",
                },
            });

        if (!attempt) {
            return res.status(404).json({
                message:
                    "ไม่พบ Attempt ที่กำลังเล่น",
            });
        }

        const completedAt =
            new Date();

        const elapsedSeconds =
            Math.max(
                0,
                Math.floor(
                    (
                        completedAt.getTime() -
                        attempt.started_at.getTime()
                    ) / 1000
                )
            );

        const completedAttempt =
            await prisma.game_play_case_attempts.update({
                where: {
                    attempt_id:
                        attempt.attempt_id,
                },

                data: {
                    completed_at:
                        completedAt,

                    elapsed_seconds:
                        elapsedSeconds,

                    is_timeout:
                        false,

                    is_passed:
                        true,
                },
            });

        return res.status(200).json({
            message:
                "บันทึกการจบ Case สำเร็จ",

            data:
                completedAttempt,
        });
    } catch (error) {
        console.error(
            "Complete Case Attempt Error:",
            error
        );

        return res.status(500).json({
            message:
                "ไม่สามารถบันทึกการจบ Case ได้",

            error:
                error.message,
        });
    }
};

// SAVE CASE ITEMS
exports.saveCaseItems = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            attempt_id,
            item_ids,
        } = req.body;

        if (
            !attempt_id ||
            !Array.isArray(item_ids) ||
            item_ids.length === 0
        ) {
            return res.status(400).json({
                message:
                    "กรุณาระบุ attempt_id และ item_ids",
            });
        }

        const attemptId =
            Number(attempt_id);

        const attempt =
            await prisma.game_play_case_attempts.findUnique({
                where: {
                    attempt_id:
                        attemptId,
                },

                include: {
                    game_play_history:
                        true,

                    final_cases: {
                        include: {
                            final_case_items:
                                true,
                        },
                    },
                },
            });

        if (!attempt) {
            return res.status(404).json({
                message:
                    "ไม่พบ Attempt นี้",
            });
        }

        if (
            attempt
                .game_play_history
                .user_id !==
            userId
        ) {
            return res.status(403).json({
                message:
                    "ไม่มีสิทธิ์เข้าถึง Attempt นี้",
            });
        }

        const selectedItemIds =
            item_ids.map(Number);

        const validItemIds =
            attempt
                .final_cases
                .final_case_items
                .map(
                    (item) =>
                        item.item_id
                );

        const invalidItem =
            selectedItemIds.some(
                (itemId) =>
                    !validItemIds.includes(
                        itemId
                    )
            );

        if (invalidItem) {
            return res.status(400).json({
                message:
                    "พบหลักฐานที่ไม่อยู่ใน Case นี้",
            });
        }
        // ป้องกันการบันทึกซ้ำ
        await prisma.game_play_items.deleteMany({
            where: {
                attempt_id:
                    attemptId,
            },
        });

        const records =
            attempt
                .final_cases
                .final_case_items
                .filter(
                    (caseItem) =>
                        selectedItemIds.includes(
                            caseItem.item_id
                        )
                )
                .map(
                    (caseItem) => ({
                        attempt_id:
                            attemptId,

                        item_id:
                            caseItem.item_id,

                        is_correct:
                            caseItem.is_key_evidence,

                        selected_at:
                            new Date(),
                    })
                );

        if (records.length > 0) {
            await prisma.game_play_items.createMany({
                data:
                    records,
            });
        }

        return res.status(201).json({
            message:
                "บันทึกหลักฐานสำเร็จ",

            data:
                records,
        });
    } catch (error) {
        console.error(
            "Save Case Items Error:",
            error
        );

        return res.status(500).json({
            message:
                "ไม่สามารถบันทึกหลักฐานได้",

            error:
                error.message,
        });
    }
};

// RETRY CASE ATTEMPT
exports.retryCaseAttempt = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            play_id,
            case_id,
            is_timeout = false,
        } = req.body;

        if (
            !play_id ||
            !case_id
        ) {
            return res.status(400).json({
                message:
                    "กรุณาระบุ play_id และ case_id",
            });
        }

        const playId =
            Number(play_id);

        const caseId =
            Number(case_id);

        const play =
            await prisma.game_play_history.findUnique({
                where: {
                    play_id:
                        playId,
                },
            });

        if (!play) {
            return res.status(404).json({
                message:
                    "ไม่พบรอบการเล่น",
            });
        }

        if (
            play.user_id !==
            userId
        ) {
            return res.status(403).json({
                message:
                    "ไม่มีสิทธิ์เข้าถึงรอบการเล่นนี้",
            });
        }

        const currentAttempt =
            await prisma.game_play_case_attempts.findFirst({
                where: {
                    play_id:
                        playId,

                    case_id:
                        caseId,

                    completed_at:
                        null,
                },

                orderBy: {
                    attempt_number:
                        "desc",
                },
            });

        if (!currentAttempt) {
            return res.status(404).json({
                message:
                    "ไม่พบ Attempt ที่กำลังเล่น",
            });
        }

        const now =
            new Date();

        const elapsedSeconds =
            is_timeout
                ? 20
                : Math.max(
                    0,
                    Math.floor(
                        (
                            now.getTime() -
                            currentAttempt
                                .started_at
                                .getTime()
                        ) / 1000
                    )
                );

        const caseQuestion =
            await prisma.question.findFirst({
                where: {
                    case_id: caseId,
                },

                select: {
                    question_id: true,
                },
            });

        if (caseQuestion) {
            await prisma.game_play_answers.deleteMany({
                where: {
                    play_id: playId,
                    question_id: caseQuestion.question_id,
                },
            });
        }

        await prisma.game_play_case_attempts.update({
            where: {
                attempt_id:
                    currentAttempt.attempt_id,
            },

            data: {
                completed_at:
                    now,

                elapsed_seconds:
                    elapsedSeconds,

                is_timeout:
                    Boolean(
                        is_timeout
                    ),

                is_passed:
                    false,
            },
        });


        const nextAttemptNumber = currentAttempt.attempt_number + 1;

        const newAttempt =
            await prisma.game_play_case_attempts.create({
                data: {
                    play_id:
                        playId,

                    case_id:
                        caseId,

                    attempt_number:
                        nextAttemptNumber,

                    started_at:
                        now,

                    completed_at:
                        null,

                    elapsed_seconds:
                        null,

                    is_timeout:
                        false,

                    is_passed:
                        false,
                },
            });

        return res.status(201).json({
            message:
                is_timeout
                    ? "หมดเวลาและเริ่ม Attempt ใหม่สำเร็จ"
                    : "Retry สำเร็จ",

            data: {
                previous_attempt_id:
                    currentAttempt.attempt_id,

                new_attempt:
                    newAttempt,
            },
        });
    } catch (error) {
        console.error(
            "Retry Case Attempt Error:",
            error
        );

        return res.status(500).json({
            message:
                "ไม่สามารถ Retry Case ได้",

            error:
                error.message,
        });
    }
};