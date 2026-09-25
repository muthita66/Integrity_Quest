const prisma = require("../lib/prisma");

const receiptHuntController =
    require("./receiptHuntController");

const finalLevelController =
    require("./finalLevelController");

const moneyGameController =
    require("./moneyGameController");

const userProgressController =
    require("./userProgressController");

// ============================================================
// Integrity Points (IP) รวม
// ============================================================
//
// IP รวมของ User = ผลรวมของ earned_ip "ที่ดีที่สุด" ของแต่ละ level
// คำนวณใหม่จาก game_play_history ทุกครั้งที่เล่นจบ แทนการบวกเพิ่ม
//   - เล่นซ้ำแล้วได้มากกว่าเดิม → IP รวมเพิ่มตามส่วนต่าง
//   - เล่นซ้ำแล้วได้เท่า/น้อยกว่า → IP รวมไม่เปลี่ยน
// เรียกซ้ำกี่ครั้งก็ได้ค่าเท่าเดิม (ไม่มีทางนับซ้ำ)
//
// ต้องเรียก "หลัง" บันทึก earned_ip ลง game_play_history แล้ว
// ============================================================

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

// ============================================================
// Utility
// ============================================================

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

// ============================================================
// Progress Helper
// ============================================================
//
// เรียก updateLevelProgress() หลังบันทึกผลเกมเสร็จแล้ว
// ห่อ try/catch ไว้ เพื่อไม่ให้ error ของระบบ Progress ทำให้
// Response ของเกมพัง (ผลเกม + IP ถูกบันทึกไปแล้วก่อนหน้านี้)
// ============================================================

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

// ============================================================
// START GAME
// ============================================================

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

        // ========================================================
        // ตรวจสอบ Level
        // ========================================================

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

        // ========================================================
        // ตรวจสอบสิทธิ์การเข้า Level (Level Lock)
        // ========================================================
        //
        // กติกา:
        // 1. ถ้ามี user_level_progress และ is_locked = true
        //    → ห้ามเข้า Level
        // 2. ถ้ายังไม่มี user_level_progress
        //    → อนุญาตเฉพาะ Level แรกของ Unit แรกที่เปิดใช้งาน
        //       หรือ Level แรกของ Unit ที่ถูกปลดล็อกแล้ว
        // 3. Level ที่ไม่ใช่ Level แรกของ Unit
        //    ต้องมี progress row ที่ถูกปลดล็อกก่อนเสมอ
        //
        // Frontend แสดง 🔒 / 🔓 ได้ แต่ Backend เป็นตัวป้องกันจริง
        // เพื่อไม่ให้ผู้ใช้ bypass ด้วยการยิง API ตรง
        // ========================================================

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

        // ========================================================
        // Unit แรก: ต้องทำ Pre-Test ก่อนถึงจะเล่นได้
        // ========================================================
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

        // ========================================================
        // นับจำนวนข้อมูลสำหรับ Score
        // ========================================================

        let maxScore = 0;

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
            // เดิม level นี้ไม่มี branch เลย ตกไปเช็ค prisma.question
            // (ซึ่ง level นี้ไม่ได้ใช้ตาราง question เลย) ทำให้ยิง 400
            // หรือได้ play ที่ไม่มี items ติดไปเลย — ใน 1 รอบมี 11 รายการ
            maxScore = 11;
        } else if (levelId === 10) {
            // Unit 3 FinalLevel : Treasurer
            // Final score ของเกมคิดเต็ม 100 คะแนน
            maxScore = 100;
        } else if (levelId !== 2) {
            // Level อื่น ๆ ที่ใช้ question + choice
            // (Level 2 ไม่มี Score จึงข้ามการนับตรงนี้)
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

        // ========================================================
        // Level 2 : Bubble Shooter + Boss
        // ========================================================
        // Level 2 ไม่มี Score (ใช้ระบบ IP แทน คำนวณตอน completeGame)
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

            // ====================================================
            // สร้าง Game Play History
            // หรือใช้ play_id เดิมเฉพาะตอนที่ Frontend "ส่ง play_id มา
            // เอง" เท่านั้น (Retry จริง ๆ ผ่าน restartGame())
            //
            // ตั้งใจไม่ค้นหารอบเก่าที่ยังไม่จบมา "รีไซเคิล" อัตโนมัติ
            // แล้ว (เคยทำแบบนั้นเพื่อกัน StrictMode ยิงซ้ำ) เพราะทำให้
            // ทุกครั้งที่ผู้เล่นกด "เล่นใหม่" โดยไม่ตั้งใจ Retry ระบบ
            // จะไปรื้อรอบเก่าที่ค้างไว้เป็นวัน ๆ ขึ้นมาใช้แทนการสร้าง
            // รอบใหม่ การกัน StrictMode ยิงซ้ำตอนนี้ทำที่ฝั่ง Frontend
            // ด้วย isStartingRef ใน useBubbleGame.js แทนแล้ว
            // ====================================================

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

                // ล้างข้อมูลของรอบย่อยเดิม (Bubble + คำตอบ Boss)
                // แต่ยังคง game_play_history เดิมไว้
                // และไม่รีเซ็ต wrong_count เพราะใช้ตัดสินว่า
                // "เคยผิด/Retry" หรือไม่ สำหรับคำนวณ IP ตอนจบเกม
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

            // ====================================================
            // บันทึก Bubble ที่ถูกสุ่มของ Play นี้
            // ====================================================

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

            // ====================================================
            // ดึง Bubble ของ Play นี้กลับมา
            // ====================================================

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

        // ========================================================
        // Level อื่น ๆ
        // ========================================================

        const play =
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

        // ========================================================
        // Unit 3 Level 1 : Receipt Hunt
        // ========================================================

        if (levelId === 8) {
            const receiptHunt =
                await receiptHuntController.startReceiptHunt(
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

        // ========================================================
        // Unit 3 Level 2 : Money Game
        // ========================================================

        if (levelId === 9) {
            const moneyGame =
                await moneyGameController.startMoneyGame(
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

        // ========================================================
        // Unit 3 FinalLevel : Treasurer
        // ========================================================

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

// ============================================================
// ANSWER QUESTION
// ============================================================

exports.answerGame = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            play_id,
            question_id,
            choice_id,
        } = req.body;

        // ========================================================
        // ตรวจข้อมูลที่ส่งมา
        // ========================================================

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

        // ========================================================
        // 1. ตรวจสอบรอบการเล่น
        // ========================================================

        const play =
            await prisma.game_play_history.findUnique({
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

        // ========================================================
        // 2. ตรวจสอบ Question
        // ========================================================

        const question =
            await prisma.question.findUnique({
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

        // ========================================================
        // 3. ตรวจสอบ Choice
        // ========================================================

        const choice =
            await prisma.choice.findUnique({
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

        // ========================================================
        // 4. ตรวจว่าตอบข้อนี้ไปแล้วหรือยัง
        // ========================================================

        const existingAnswer =
            await prisma.game_play_answers.findFirst({
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

        // ========================================================
        // 5. บันทึกคำตอบ
        // ========================================================

        // ========================================================
        // Level 2 : Boss Bubble
        // ไม่ใช้ Score / ip_reward ระหว่างตอบ
        // IP จะคำนวณตอน completeGame()
        //
        // Level อื่น ๆ ที่ใช้ question + choice (รวม FinalLevel
        // level_id = 3) : ใช้ค่า ip_reward จริงของ choice ที่มีอยู่
        // ใน Database (ไม่ hardcode ว่าตอบถูก = 1 อีกต่อไป เพื่อให้
        // ทีม content ปรับค่า IP ต่อ choice ได้จาก DB โดยตรง)
        // ========================================================

        const isLevel2 =
            play.level_id === 2;

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

        // ========================================================
        // ถ้า Level 2 ตอบผิด
        // เก็บ wrong_count ไว้เป็นหลักฐานว่าเคย Retry
        // (ใช้ตัดสินโบนัส "ผ่านตั้งแต่รอบแรก" ตอน completeGame)
        // ========================================================

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
            // ====================================================
            // Logic เดิมของ Level อื่น
            // ====================================================

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

        // ========================================================
        // ส่งผลกลับ Frontend
        // ========================================================

        return res.status(201).json({
            message:
                "บันทึกคำตอบสำเร็จ",

            data: {
                play_id: playId,
                question_id: questionId,
                choice_id: choiceId,

                is_correct:
                    choice.is_correct,

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

// ============================================================
// COMPLETE GAME
// ============================================================

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

        // ========================================================
        // ค้นหา Play
        // ========================================================

        const play =
            await prisma.game_play_history.findUnique({
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

        // ========================================================
        // ตรวจสอบ User
        // ========================================================

        if (play.user_id !== userId) {
            return res.status(403).json({
                message:
                    "ไม่มีสิทธิ์เข้าถึงรอบการเล่นนี้",
            });
        }

        // ========================================================
        // ถ้าเกมจบแล้ว
        // ========================================================

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

        // ========================================================
        // Unit 1 Level 2 : Bubble Shooter + Boss Bubble
        // ========================================================
        //
        // กติกา IP (ตกลงล่าสุด)
        //   Bubble ผ่าน (ไม่ว่าจะผ่านรอบแรกหรือหลัง Retry)  = 2 IP
        //   + โบนัส 3 IP เฉพาะกรณี "ไม่เคยผิดเลยทั้งรอบ"
        //     คือ Bubble ผ่านตั้งแต่รอบแรก และ Boss ถูก 3/3
        //     ตั้งแต่ครั้งแรก (ไม่เคย Retry อะไรเลยทั้งเกม)
        //   => PERFECT (wrong_count === 0) = 5 IP
        //   => PASS    (wrong_count > 0)   = 2 IP
        //
        // "เคยผิด" ดูจาก wrong_count ซึ่งเพิ่มจาก
        //   - shootBubble  (ยิง Good ผิด)
        //   - answerGame   (ตอบ Boss ผิด)
        // และ wrong_count ไม่ถูกรีเซ็ตตอน Retry (ดู startGame)
        // ========================================================

        if (play.level_id === 2) {
            const BOSS_QUESTION_COUNT = 3;
            const BUBBLE_STAGE_IP = 2;
            const FIRST_TRY_BONUS_IP = 3;

            // ----------------------------------------------------
            // 1. รอบปัจจุบันต้องยังไม่ FAILED
            //    (ยิง Good ผิดแล้วต้อง Retry ก่อนถึงจะจบเกมได้)
            // ----------------------------------------------------
            if (play.status !== "IN_PROGRESS") {
                return res.status(400).json({
                    message:
                        "รอบนี้ยังไม่ผ่านด่าน Bubble กรุณา Retry ก่อน",

                    data: {
                        status: play.status,
                    },
                });
            }

            // ----------------------------------------------------
            // 2. ตรวจด่าน Bubble ของรอบปัจจุบัน
            //    Bad ต้องถูกยิงครบ / Good ต้องไม่ถูกยิงเลย
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // 3. ตรวจ Boss ต้องตอบถูกครบ 3/3
            //    (Retry จะลบคำตอบ Boss ของรอบก่อนใน startGame แล้ว
            //     ตรงนี้จึงมีแค่คำตอบของรอบปัจจุบัน)
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // 4. คำนวณ IP
            //    wrong_count นับรวมตลอดทั้งเกม (ไม่รีเซ็ตตอน Retry)
            //    ดังนั้นถ้า > 0 แปลว่าเคยผิดมาก่อน ไม่ว่าจะที่
            //    Bubble หรือ Boss ก็ตาม
            // ----------------------------------------------------
            const wrongCount = play.wrong_count ?? 0;
            const isFirstTry = wrongCount === 0;

            const bubbleIP = BUBBLE_STAGE_IP;
            const bonusIP = isFirstTry ? FIRST_TRY_BONUS_IP : 0;
            const earnedIP = bubbleIP + bonusIP;

            const status = isFirstTry ? "PERFECT" : "PASS";
            const completedAt = new Date();

            // ----------------------------------------------------
            // 5. บันทึกผล
            //    updateMany + completed_at: null กันเรียกซ้ำพร้อมกัน
            //    (ไม่ให้ได้ IP สองรอบจากการกดจบเกมรัว ๆ)
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // 5.1 UPDATE USER LEVEL PROGRESS
            //     Level 2 ผ่านเสมอเมื่อมาถึงจุดนี้ (PERFECT / PASS)
            //     เกมนี้ใช้ IP เป็นหลัก ไม่ใช้ Score จึงส่ง score = 0
            // ----------------------------------------------------
            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: 0,
                status: status,
                passed: true,
            });

            // ----------------------------------------------------
            // 6. เพิ่ม IP ให้ User
            // ----------------------------------------------------
            // IP รวม = ผลรวม earned_ip ที่ดีที่สุดของแต่ละ level
            // (เล่นซ้ำไม่บวกเพิ่ม นับเฉพาะรอบที่ดีที่สุด)
            const userStats = {
                integrity_points:
                    await recalcIntegrityPoints(userId),
            };

            // ----------------------------------------------------
            // 7. ส่งผลกลับ Frontend (ใช้ทำหน้า Result)
            // ----------------------------------------------------
            return res.status(200).json({
                message: "จบเกม Level 2 สำเร็จ",

                data: {
                    play_id: playId,
                    status: status,

                    bubble_ip: bubbleIP,
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

        // ========================================================
        // Unit 2 Level 1 : Need / Want
        // ========================================================
        //
        // กติกา (ตกลงกันไว้):
        //   ต้องตอบถูก "ครบทุกชิ้น" ถึงจะ PASS — ผิดแม้ชิ้นเดียว = FAIL
        //   ทันที จบเกม ต้องเริ่ม play ใหม่ (ไม่มีแก้คำตอบในรอบเดิม)
        //
        //   PASS  → ได้ IP พื้นฐาน + โบนัส "ผ่านตั้งแต่รอบแรก"
        //           (ไม่เคยมี play ที่ completed_at แล้วของ user คนนี้
        //           ใน level นี้มาก่อนเลย ไม่ว่าจะ PASS หรือ FAIL)
        //   FAIL  → IP = 0, ไม่เพิ่ม user_stats
        //
        // ตัวเลข IP เป็นค่าคงที่ปรับง่ายจุดเดียว (BASE_PASS_IP /
        // FIRST_TRY_BONUS_IP) — ยังไม่ได้ย้ายไป DB เหมือน RANK_BONUS_IP
        // ของ FinalLevel เพราะที่นี่มีแค่ 2 สถานะ (PASS/FAIL) ไม่ใช่
        // 4-tier แบบ Rank
        // ========================================================

        if (play.level_id === 5) {
            const BASE_PASS_IP = 5;
            const FIRST_TRY_BONUS_IP = 5;

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

            // ----------------------------------------------------
            // ดึงคำตอบทั้งหมดพร้อมชื่อ/รูปของ Item เพื่อส่งกลับให้
            // หน้า Result ใช้แสดงผลตรง ๆ (ไม่ต้องพึ่งข้อมูลที่ Frontend
            // จำไว้เองอีกต่อไป — เดิม Frontend คำนวณ pass/score เอง
            // แล้วส่งผ่าน router state ซึ่งไม่ตรวจสอบกับ DB เลย)
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // ผ่านตั้งแต่รอบแรก = ไม่เคยมี play ที่จบไปแล้ว (ไม่ว่าจะ
            // PASS หรือ FAIL) ของ user คนนี้ใน level นี้มาก่อนเลย
            // (นับเฉพาะ play อื่นที่ completed_at แล้ว ไม่รวม play
            // ปัจจุบัน)
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // บันทึกผล — updateMany + completed_at:null กันเรียกซ้ำ
            // พร้อมกันได้ IP ซ้ำ (แนวเดียวกับ Level 2 / FinalLevel)
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // UPDATE USER LEVEL PROGRESS
            //   ถูกครบ → PASS → Unlock Level 6
            //   ผิดอย่างน้อย 1 → FAIL → Level 6 ยัง LOCKED
            // ----------------------------------------------------
            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: correctAnswers,
                status: status,
                passed: isPerfect,
            });

            // ----------------------------------------------------
            // เพิ่ม IP ให้ User (เฉพาะตอน PASS)
            // ----------------------------------------------------
            // IP รวม = ผลรวม earned_ip ที่ดีที่สุดของแต่ละ level
            // (เล่นซ้ำไม่บวกเพิ่ม นับเฉพาะรอบที่ดีที่สุด)
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

        // ========================================================
        // Unit 2 Level 2 : Calculation / Comparison
        // ========================================================

        if (play.level_id === 6) {
            /*
             * เดิม branch นี้ปิดเกมเป็น "COMPLETED" เสมอโดยไม่เช็คเลยว่า
             * ตอบถูกจริงไหม และไม่เคยให้ IP เลยแม้แต่นิดเดียว (pass/fail
             * เดิมคำนวณแค่ฝั่ง Frontend จาก hp >= 15 เท่านั้น) — ตอนนี้
             * แก้ให้ backend ตรวจจริงจากข้อมูลในตาราง game_play_comparison
             * และให้ IP ตามกติกาที่ตกลงกันไว้: "ผ่าน" = ตอบถูกครบทุกข้อ
             * ไม่ว่าจะใช้กี่ครั้ง, "IP" = นับเป็นข้อๆ ไป ข้อไหนตอบถูก
             * ตั้งแต่ครั้งแรกที่พยายามข้อนั้น (ไม่ใช่ครั้งแรกที่เข้าเล่น
             * ทั้งด่าน) ได้ +1 IP ต่อข้อ สูงสุด 5 IP ต่อการเล่น 1 รอบ
             */
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

            // ---------------------------------------------------
            // "ผ่าน" = ตอบถูกครบทุกข้อ (นับจากข้อมูลจริงในตาราง
            // ไม่ใช่แค่เช็คว่าตอบครบทุกข้อโดยไม่สนว่าถูกหรือผิด) — ใช้
            // เป็นเงื่อนไขให้ IP เท่านั้น ไม่ใช่ข้อความที่แสดงบนหน้า
            // Result (ดู messageStatus ด้านล่าง)
            // ---------------------------------------------------
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

            // ---------------------------------------------------
            // IP = จำนวนข้อที่ตอบถูกตั้งแต่ครั้งแรกที่พยายามข้อนั้น
            // (1 IP ต่อข้อ สูงสุด totalQuestions) ให้เฉพาะตอนผ่านด่าน
            // ---------------------------------------------------
            const firstTryCorrectCount =
                await prisma.game_play_comparison.count({
                    where: {
                        play_id: playId,

                        first_try_correct:
                            true,
                    },
                });

            const earnedIP = isPass
                ? firstTryCorrectCount
                : 0;

            /*
             * ข้อความหน้า Result แบ่งเป็น 4 ระดับตามจำนวนข้อที่ตอบถูก
             * ตั้งแต่ครั้งแรก (ไม่ใช่แค่ PASS/FAIL 2 สถานะ) เพราะเกมนี้
             * "ผ่าน" ได้เสมอถ้าเล่นจนจบตามปกติ (ตอบผิดแค่ทำให้ตอบใหม่
             * ไม่ได้ทำให้จบเกมแบบ FAIL) สิ่งที่ต่างกันจริงๆ คือคะแนน/IP
             * ที่ได้ เลยใช้คะแนนมากำหนดข้อความแทน ตรงกับที่เคย hardcode
             * ไว้ใน ResultPage.jsx เดิม (5 = PERFECT, 3-4 = GREAT,
             * 1-2 = PASS, 0 = FAIL) เอามาเก็บใน level_result_messages
             * แทน
             */
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

            // ---------------------------------------------------
            // UPDATE USER LEVEL PROGRESS
            //   ต้องใช้ isPass ตัดสิน ไม่ใช่ messageStatus
            //   เช่น messageStatus = FAIL (first try 0 ข้อ)
            //   แต่สุดท้ายตอบถูกครบ → isPass = true → Progress PASS
            // ---------------------------------------------------
            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: firstTryCorrectCount,
                status: messageStatus,
                passed: isPass,
            });

            // IP รวม = ผลรวม earned_ip ที่ดีที่สุดของแต่ละ level
            // (เล่นซ้ำไม่บวกเพิ่ม นับเฉพาะรอบที่ดีที่สุด)
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

        // ========================================================
        // Unit 2 Final Level : level_id = 7
        // ========================================================

        if (play.level_id === 7) {
            /*
             * เดิม branch นี้บันทึกแค่ score/total แล้วปิดเป็น
             * "COMPLETED" เสมอ — money คงเหลือ, isPassed, เหรียญ
             * (gold/silver/bronze), expBonus/coinBonus ทั้งหมดคำนวณ
             * แค่ฝั่ง Frontend เท่านั้น ไม่เคยถูกตรวจกับ DB เลย และ
             * "เล่นครั้งแรก" (เงื่อนไขได้เหรียญ) ใช้ playCount ที่เป็น
             * state ในเครื่อง refresh หน้าเว็บก็รีเซ็ตได้ — ตอนนี้ย้าย
             * ทุกอย่างมาคำนวณที่ backend จากข้อมูลจริงในตาราง
             */
            const INITIAL_MONEY = 500;
            const PASS_SCORE = 8;
            const BASE_PASS_IP = 5;
            const MEDAL_BONUS_IP = {
                GOLD: 5,
                SILVER: 3,
                BRONZE: 1,
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

            // ---------------------------------------------------
            // money คงเหลือ = เงินตั้งต้น - ผลรวม cost ของทุกตัวเลือก
            // ที่เลือกไปจริง (เอาจาก choice.cost ผ่านคำตอบที่บันทึกไว้
            // ไม่เชื่อ money ที่ client ส่งมาเอง)
            // ---------------------------------------------------
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

            // หมดเวลา (Frontend ส่ง is_timeout: true ตอนเวลาเหลือ 0)
            // เชื่อค่าจาก client ได้ เพราะหมดเวลา = FAIL + 0 IP เสมอ
            // (อย่างมากก็แค่จบเกมแบบแพ้เร็วขึ้น ไม่มีทางได้เปรียบ)
            const isTimeout = is_timeout === true;

            // ---------------------------------------------------
            // จบภารกิจได้ 3 ทาง: ตอบครบทุกข้อ / เงินหมด / หมดเวลา
            // (เกมฝั่ง Frontend จะเรียก complete ทันทีที่เงินหมด แม้
            // ตอบยังไม่ครบทุกข้อ ต้องอนุญาตเคสนี้ด้วย ไม่งั้นจะจบเกม
            // ไม่ได้เลยตอนเงินหมด)
            // ---------------------------------------------------
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

            // ---------------------------------------------------
            // "เล่นครั้งแรก" (เงื่อนไขได้เหรียญ) นับจากประวัติการเล่น
            // จริงใน DB ไม่ใช่ playCount ฝั่ง Frontend — ต้องไม่เคยมี
            // play ที่ completed ของ level นี้มาก่อนเลย
            // ---------------------------------------------------
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

            const earnedIP = isPassed
                ? BASE_PASS_IP + medalBonusIP
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

            // ---------------------------------------------------
            // UPDATE USER LEVEL PROGRESS
            //   isPassed = true → Level 7 PASS → Unit 2 = 100%
            //   → Unlock Unit 3
            // ---------------------------------------------------
            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: correctAnswers,
                status: status,
                passed: isPassed,
            });

            // IP รวม = ผลรวม earned_ip ที่ดีที่สุดของแต่ละ level
            // (เล่นซ้ำไม่บวกเพิ่ม นับเฉพาะรอบที่ดีที่สุด)
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

                    answered:
                        answeredQuestions.length,

                    total: totalQuestions,

                    money_remaining:
                        moneyRemaining,

                    is_bankrupt: isBankrupt,

                    is_timeout: isTimeout,

                    medal: medal,

                    is_first_try: isFirstTry,

                    base_ip: isPassed
                        ? BASE_PASS_IP
                        : 0,

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

        // ========================================================
        // Level อื่น ๆ ที่ใช้ question + choice
        // ========================================================

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

        // ========================================================
        // Unit 1 Level 1 : Mirror Quiz
        // ========================================================

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

            // ====================================================
            // นับถูก / ผิด
            // ====================================================

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

            // ====================================================
            // คำนวณ IP
            // ====================================================

            let status;
            let answerIP = 0;
            let perfectBonusIP = 0;
            let earnedIP = 0;

            if (wrongCount > 3) {
                status = "FAIL";
                earnedIP = 0;
            } else if (wrongCount === 0) {
                status = "PERFECT";

                // ตอบถูกครบ 5 ข้อ
                answerIP = correctCount;

                // โบนัส PERFECT
                perfectBonusIP = 5;

                // IP รวม
                earnedIP = answerIP + perfectBonusIP;
            } else {
                status = "PASS";

                // ตอบถูกบางข้อ = ได้คะแนน แต่ไม่ได้ IP
                answerIP = 0;
                perfectBonusIP = 0;
                earnedIP = 0;
            }

            const completedAt =
                new Date();

            // ====================================================
            // บันทึกผลการเล่น
            // ====================================================

            const completedPlay =
                await prisma.game_play_history.update({
                    where: {
                        play_id: playId,
                    },

                    data: {
                        score:
                            correctCount,

                        max_score:
                            questionCount,

                        correct_count:
                            correctCount,

                        wrong_count:
                            wrongCount,

                        earned_ip:
                            earnedIP,

                        completed_at:
                            completedAt,

                        status:
                            status,
                    },
                });

            // ====================================================
            // UPDATE USER LEVEL PROGRESS
            // ====================================================

            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: completedPlay.score,
                status: status,
                passed:
                    status === "PASS" ||
                    status === "PERFECT",
            });

            // ====================================================
            // เพิ่ม IP ให้ User
            // ====================================================

            // IP รวม = ผลรวม earned_ip ที่ดีที่สุดของแต่ละ level
            // (เล่นซ้ำไม่บวกเพิ่ม นับเฉพาะรอบที่ดีที่สุด)
            const userStats = {
                integrity_points:
                    await recalcIntegrityPoints(userId),
            };

            // ====================================================
            // ส่งผลกลับ Frontend
            // ====================================================

            return res.status(200).json({
                message:
                    "จบเกม Mirror Quiz สำเร็จ",

                data: {
                    play_id:
                        completedPlay.play_id,

                    score:
                        completedPlay.score,

                    max_score:
                        completedPlay.max_score,

                    correct_count:
                        correctCount,

                    wrong_count:
                        wrongCount,

                    answer_ip:
                        answerIP,

                    perfect_bonus_ip:
                        perfectBonusIP,

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

        // ========================================================
        // Unit 1 FinalLevel : level_id = 3
        // ========================================================
        //
        // Rank (เก็บใน status ตรง ๆ ไม่เพิ่มคอลัมน์ใหม่):
        //   hasAnyTimeout = true                → TRAINEE  (ต่ำสุด ทับทุกกรณี)
        //   ไม่ timeout, retryCaseCount = 0     → MASTER   (สูงสุด)
        //   ไม่ timeout, retryCaseCount 1-2     → EXPERT
        //   ไม่ timeout, retryCaseCount >= 3    → NOVICE
        //
        // retryCaseCount = จำนวน Case ที่ attempt_number สูงสุด > 1
        //   (ครอบคลุมทั้ง Retry หลักฐานเกิน/ผิด, Timeout, และ Restart
        //    หลัง Verdict ผิด เพราะทั้งสามทางเรียก
        //    /api/game-play/case/retry เหมือนกันหมด)
        //
        // IP = caseAnswerIP (รวม choice.ip_reward จากคำตอบ Verdict 5 ข้อ)
        //      + โบนัสตาม Rank: MASTER +5 / EXPERT +2 / NOVICE +0 / TRAINEE +0
        // ========================================================

        if (play.level_id === 3) {
            const RANK_BONUS_IP = {
                MASTER: 5,
                EXPERT: 2,
                NOVICE: 0,
                TRAINEE: 0,
            };

            // ----------------------------------------------------
            // 1. ต้องผ่านทุก Case ก่อนถึงจะจบเกมได้
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // 2. ดึง Attempt ทั้งหมด เพื่อคำนวณ Rank
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // 3. รวม IP จากคำตอบ Verdict ทั้ง 5 Case (ip_reward จริงจาก choice)
            // ----------------------------------------------------
            const answerIpResult = await prisma.game_play_answers.aggregate({
                where: { play_id: playId },
                _sum: { ip_reward: true },
            });

            const caseAnswerIP = answerIpResult._sum.ip_reward || 0;
            const bonusIP = RANK_BONUS_IP[rank] ?? 0;
            const earnedIP = caseAnswerIP + bonusIP;

            // ----------------------------------------------------
            // 4. max_score = ผลรวม ip_reward ของตัวเลือกที่ถูกของทุก Case
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // 5. บันทึกผล (updateMany + completed_at: null กันจบเกมซ้ำ)
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // 5.1 UPDATE USER LEVEL PROGRESS
            //     status ของเกมคือ Rank (MASTER/EXPERT/NOVICE/TRAINEE)
            //     ไม่ใช่ PASS/FAIL — มาถึงจุดนี้ได้แปลว่าผ่าน Case ครบแล้ว
            //     จึงส่ง passed: true → user_level_progress.status = PASS
            // ----------------------------------------------------
            await saveLevelProgress({
                userId,
                levelId: play.level_id,
                score: caseAnswerIP,
                status: rank,
                passed: true,
            });

            // ----------------------------------------------------
            // 6. เพิ่ม IP ให้ User
            // ----------------------------------------------------
            // IP รวม = ผลรวม earned_ip ที่ดีที่สุดของแต่ละ level
            // (เล่นซ้ำไม่บวกเพิ่ม นับเฉพาะรอบที่ดีที่สุด)
            const userStats = {
                integrity_points:
                    await recalcIntegrityPoints(userId),
            };

            // ----------------------------------------------------
            // 7. ส่งผลกลับ Frontend (ใช้ทำหน้า Summary)
            // ----------------------------------------------------
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

        // ========================================================
        // Final Score
        // ========================================================

        const completedAt =
            new Date();

        const parsedFinalScore =
            Number(final_score);

        const finalScore =
            Number.isFinite(
                parsedFinalScore
            )
                ? Math.max(
                    0,
                    Math.min(
                        100,
                        parsedFinalScore
                    )
                )
                : play.score;

        const finalMaxScore =
            play.max_score;

        // ========================================================
        // บันทึกผลการเล่น
        // ========================================================

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

        // ========================================================
        // ส่งผลกลับ
        // ========================================================

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

// ============================================================
// Level 2 : ยิง Bubble
// ============================================================

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

        // ========================================================
        // ค้นหา Bubble ของ Play นี้
        // ========================================================

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

        // ========================================================
        // ตรวจสอบ User
        // ========================================================

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

        // ========================================================
        // ตรวจสอบว่าเกมยังเล่นอยู่
        // ========================================================

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

        // ========================================================
        // ตรวจสอบว่า Bubble ถูกยิงไปแล้วหรือยัง
        // ========================================================

        if (playBubble.is_destroyed) {
            return res.status(400).json({
                message:
                    "Bubble นี้ถูกยิงไปแล้ว",
            });
        }

        // ========================================================
        // ตรวจสอบว่า Bubble เป็น Good หรือ Bad
        // ========================================================

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

        // ========================================================
        // อัปเดตประวัติ Bubble
        // ========================================================

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

        // ========================================================
        // ถ้ายิง Good → เกมผิด (FAILED ต้อง Retry)
        // ========================================================

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

        // ========================================================
        // ถ้ายิง Bad ถูกต้อง
        // Level 2 ไม่มี Score แล้ว (IP คำนวณตอน completeGame)
        // จึงไม่บวกคะแนนตรงนี้อีกต่อไป (ตัด +5 เดิมออก)
        // ========================================================

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

// ============================================================
// Unit 1 : Final Level START CASE ATTEMPT
// ============================================================

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

// ============================================================
// COMPLETE CASE ATTEMPT
// ============================================================

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

// ============================================================
// SAVE CASE ITEMS
// ============================================================

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

        // ====================================================
        // ป้องกันการบันทึกซ้ำ
        // ====================================================

        await prisma.game_play_items.deleteMany({
            where: {
                attempt_id:
                    attemptId,
            },
        });

        // ====================================================
        // ตรวจว่าแต่ละหลักฐานเป็น key evidence หรือไม่
        // ====================================================

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

// ============================================================
// RETRY CASE ATTEMPT
// ============================================================

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

        // ====================================================
        // ล้างคำตอบเดิมของคำถามในคดีนี้ (ถ้าเคยตอบมาก่อน)
        //
        // endpoint นี้ใช้ร่วมกันทั้ง 3 ทาง: Retry หลักฐานเอง,
        // Timeout, และ Restart หลังตอบ Verdict ผิด — เฉพาะทางหลัง
        // เท่านั้นที่จะมีคำตอบเดิมค้างอยู่จริง (อีกสองทางยังไม่ถึง
        // ขั้นตอบคำถาม deleteMany จึงไม่พบอะไรให้ลบ ไม่กระทบ)
        //
        // ถ้าไม่ลบ ตอน submitAnswer() รอบใหม่จะชนกับ existingAnswer
        // check ใน answerGame (มี game_play_answers ของคำถามนี้
        // อยู่แล้วจากรอบก่อน) ทำให้กด "ยืนยันคำตอบ" แล้วเงียบ/ไม่ไปต่อ
        // ====================================================

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

        // ====================================================
        // ปิด Attempt ปัจจุบัน
        // ====================================================

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

        // ====================================================
        // สร้าง Attempt ใหม่
        // ====================================================

        const nextAttemptNumber =
            currentAttempt.attempt_number +
            1;

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