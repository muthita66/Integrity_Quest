const prisma = require("../lib/prisma");

const LEVEL_ID = 9;
const TOTAL_ITEMS = 11;

const PERSONAL_TYPE_ID = 5;
const CLUB_TYPE_ID = 6;

// ================= IP Reward =================
// กติกา: เกมนี้ตอบผิดแม้ข้อเดียวก็ FAILED ทันที (ไม่มีโอกาสแก้ตัว)
// ดังนั้นถ้าเล่นจบแบบผ่าน (ครบ 11/11) แปลว่าตอบถูกทุกข้อจริงๆ ไม่ต้อง
// มี "no-wrong bonus" แยกเหมือน Receipt Hunt เพราะซ้ำซ้อนกับเงื่อนไข
// ผ่านด่านอยู่แล้ว
//   Base (ผ่านด่าน)                    = 5 IP
//   Speed Bonus (เวลาที่ใช้จริง
//     <= 30 วินาที)                     = 5 IP
// รวมสูงสุด 10 IP — เวลาที่ใช้จริงคำนวณจาก started_at/completed_at
// ของ game_play_history เอง ไม่เชื่อ client
const BASE_PASS_IP = 5;
const SPEED_BONUS_IP = 5;
const SPEED_BONUS_SECONDS = 30;

// =====================================================
// Start Money Game
// =====================================================
exports.startMoneyGame = async (playId) => {
    // ตรวจสอบ Game Play
    const play = await prisma.game_play_history.findUnique({
        where: {
            play_id: playId,
        },
    });

    if (!play) {
        throw new Error("ไม่พบรอบการเล่นนี้");
    }

    // ตรวจสอบว่าเป็น Unit 3 Level 2
    if (play.level_id !== LEVEL_ID) {
        throw new Error(
            "Play นี้ไม่ใช่เกมแยกเงิน Unit 3 Level 2"
        );
    }

    if (play.status !== "IN_PROGRESS") {
        throw new Error(
            "เกมนี้ไม่ได้อยู่ในสถานะกำลังเล่น"
        );
    }

    // ดึงรายการเงินของ Level 2
    const levelItems =
        await prisma.level_items.findMany({
            where: {
                level_id: LEVEL_ID,
                is_required: true,
                item_type_id: {
                    in: [
                        PERSONAL_TYPE_ID,
                        CLUB_TYPE_ID,
                    ],
                },
            },
            include: {
                items: true,
                item_types: true,
            },
            orderBy: {
                id: "asc",
            },
        });

    // ตรวจจำนวนรายการ
    if (levelItems.length !== TOTAL_ITEMS) {
        throw new Error(
            `เกมแยกเงินต้องมี ${TOTAL_ITEMS} รายการ แต่พบ ${levelItems.length} รายการ`
        );
    }

    // ตรวจว่ามีทั้งเงินส่วนตัวและเงินชมรม
    const personalItems = levelItems.filter(
        (item) =>
            item.item_type_id === PERSONAL_TYPE_ID
    );

    const clubItems = levelItems.filter(
        (item) =>
            item.item_type_id === CLUB_TYPE_ID
    );

    if (
        personalItems.length === 0 ||
        clubItems.length === 0
    ) {
        throw new Error(
            "ข้อมูลเกมต้องมีทั้งเงินส่วนตัวและเงินชมรม"
        );
    }

    // ลบข้อมูลคำตอบเก่าของ Play นี้
    // กรณีมีการเริ่มเกมซ้ำ
    await prisma.game_play_money.deleteMany({
        where: {
            play_id: playId,
        },
    });

    // ส่งข้อมูลให้ Frontend
    // ไม่ส่ง item_type_id เพราะเป็นคำตอบที่ถูก
    const items = levelItems.map(
        (levelItem) => ({
            item_id: levelItem.item_id,
            name: levelItem.items.name,
            amount: levelItem.items.description,
        })
    );

    return {
        items,
        total_items: items.length,
    };
};

// =====================================================
// Classify Money
// =====================================================
exports.classifyMoney = async (
    playId,
    itemId,
    selectedTypeId
) => {
    // ตรวจสอบ Play
    const play =
        await prisma.game_play_history.findUnique({
            where: {
                play_id: playId,
            },
        });

    if (!play) {
        throw new Error("ไม่พบรอบการเล่นนี้");
    }

    if (play.level_id !== LEVEL_ID) {
        throw new Error(
            "Play นี้ไม่ใช่เกมแยกเงิน Unit 3 Level 2"
        );
    }

    if (play.status !== "IN_PROGRESS") {
        throw new Error("เกมนี้จบไปแล้ว");
    }

    // ตรวจสอบประเภทที่ผู้เล่นเลือก
    if (
        selectedTypeId !== PERSONAL_TYPE_ID &&
        selectedTypeId !== CLUB_TYPE_ID
    ) {
        throw new Error(
            "ประเภทเงินที่เลือกไม่ถูกต้อง"
        );
    }

    // ตรวจสอบว่า Item อยู่ใน Level 2
    const levelItem =
        await prisma.level_items.findFirst({
            where: {
                level_id: LEVEL_ID,
                item_id: itemId,
                is_required: true,
            },
            include: {
                items: true,
                item_types: true,
            },
        });

    if (!levelItem) {
        throw new Error(
            "ไม่พบรายการเงินนี้ในเกม Unit 3 Level 2"
        );
    }

    // ตรวจสอบว่ารายการนี้เคยตอบแล้วหรือไม่
    const existingAnswer =
        await prisma.game_play_money.findUnique({
            where: {
                play_id_item_id: {
                    play_id: playId,
                    item_id: itemId,
                },
            },
        });

    if (existingAnswer) {
        throw new Error(
            "รายการนี้ถูกจัดประเภทไปแล้ว"
        );
    }

    // ตรวจคำตอบ
    const isCorrect =
        levelItem.item_type_id === selectedTypeId;

    // บันทึกคำตอบ
    await prisma.game_play_money.create({
        data: {
            play_id: playId,
            item_id: itemId,
            selected_type_id: selectedTypeId,
            is_correct: isCorrect,
            answered_at: new Date(),
        },
    });

    // =================================================
    // ตอบผิด → FAILED ทันที
    // =================================================
    if (!isCorrect) {
        await prisma.game_play_history.update({
            where: {
                play_id: playId,
            },
            data: {
                score: 0,
                status: "FAILED",
                completed_at: new Date(),
            },
        });

        return {
            item_id: itemId,
            selected_type_id: selectedTypeId,
            is_correct: false,
            is_failed: true,
            is_completed: false,
            game_status: "FAILED",
        };
    }

    // =================================================
    // นับจำนวนที่ตอบถูก
    // =================================================
    const correctCount =
        await prisma.game_play_money.count({
            where: {
                play_id: playId,
                is_correct: true,
            },
        });

    const answeredCount =
        await prisma.game_play_money.count({
            where: {
                play_id: playId,
            },
        });

    // =================================================
    // ครบ 11 รายการ
    // =================================================
    if (correctCount === TOTAL_ITEMS) {
        return {
            item_id: itemId,
            selected_type_id: selectedTypeId,
            is_correct: true,
            correct_count: correctCount,
            answered_count: answeredCount,
            remaining_count: 0,
            is_failed: false,
            is_completed: true,
            game_status: "IN_PROGRESS",
        };
    }

    return {
        item_id: itemId,
        selected_type_id: selectedTypeId,
        is_correct: true,
        correct_count: correctCount,
        answered_count: answeredCount,
        remaining_count:
            TOTAL_ITEMS - correctCount,
        is_failed: false,
        is_completed: false,
        game_status: "IN_PROGRESS",
    };
};

// =====================================================
// Complete Money Game
//
// เดิมฟังก์ชันนี้แค่ set score/status ไม่เคยให้ IP เลยทั้งด่าน —
// ตอนนี้เพิ่ม Base + Speed Bonus คำนวณจากข้อมูลจริงใน DB ทั้งหมด
// (started_at/completed_at ของ game_play_history เอง สำหรับเวลาที่
// ใช้จริง) ไม่เชื่อค่าที่ client ส่งมาเลย — ใช้ updateMany +
// completed_at: null กันเรียกจบเกมซ้ำได้ IP ซ้ำ (แนวเดียวกับด่านอื่น)
// =====================================================
exports.completeMoneyGame = async (playId) => {
    // ตรวจสอบ Play
    const play =
        await prisma.game_play_history.findUnique({
            where: {
                play_id: playId,
            },
        });

    if (!play) {
        throw new Error("ไม่พบรอบการเล่นนี้");
    }

    if (play.level_id !== LEVEL_ID) {
        throw new Error(
            "Play นี้ไม่ใช่เกมแยกเงิน Unit 3 Level 2"
        );
    }

    if (play.status !== "IN_PROGRESS") {
        throw new Error("เกมนี้จบไปแล้ว");
    }

    // นับคำตอบที่ถูก
    const correctCount =
        await prisma.game_play_money.count({
            where: {
                play_id: playId,
                is_correct: true,
            },
        });

    if (correctCount < TOTAL_ITEMS) {
        throw new Error(
            `ยังแยกเงินไม่ครบ ${TOTAL_ITEMS} รายการ`
        );
    }

    const completedAt = new Date();

    // ----------------------------------------------------
    // เวลาที่ใช้จริง = completed_at - started_at (ของรอบนี้เอง
    // ใน DB) ไม่ใช่เวลาที่ client คำนวณแล้วส่งมา
    // ----------------------------------------------------
    const elapsedSeconds = Math.max(
        0,
        Math.floor(
            (completedAt.getTime() - play.started_at.getTime()) /
            1000
        )
    );

    const isFast = elapsedSeconds <= SPEED_BONUS_SECONDS;
    const speedBonusIP = isFast ? SPEED_BONUS_IP : 0;
    const earnedIP = BASE_PASS_IP + speedBonusIP;

    // ----------------------------------------------------
    // บันทึกผล — updateMany + completed_at: null กันเรียกจบเกม
    // ซ้ำพร้อมกันได้ IP ซ้ำ
    // ----------------------------------------------------
    const updated = await prisma.game_play_history.updateMany({
        where: {
            play_id: playId,
            completed_at: null,
        },
        data: {
            score: TOTAL_ITEMS,
            max_score: TOTAL_ITEMS,
            earned_ip: earnedIP,
            status: "COMPLETED",
            completed_at: completedAt,
        },
    });

    if (updated.count === 0) {
        const alreadyCompleted =
            await prisma.game_play_history.findUnique({
                where: { play_id: playId },
            });

        return {
            play_id: playId,
            score: alreadyCompleted.score,
            max_score: alreadyCompleted.max_score,
            status: alreadyCompleted.status,
            earned_ip: alreadyCompleted.earned_ip,
            correct_count: correctCount,
            total_items: TOTAL_ITEMS,
            completed_at: alreadyCompleted.completed_at,
        };
    }

    // ----------------------------------------------------
    // เพิ่ม IP ให้ User
    // ----------------------------------------------------
    await prisma.user_stats.upsert({
        where: {
            user_id: play.user_id,
        },
        update: {
            integrity_points: {
                increment: earnedIP,
            },
        },
        create: {
            user_id: play.user_id,
            total_points: 0,
            current_streak: 0,
            highest_score: 0,
            last_login_date: new Date(),
            integrity_points: earnedIP,
        },
    });

    const userStats = await prisma.user_stats.findUnique({
        where: {
            user_id: play.user_id,
        },
        select: {
            integrity_points: true,
        },
    });

    return {
        play_id: playId,
        score: TOTAL_ITEMS,
        max_score: TOTAL_ITEMS,
        status: "COMPLETED",
        correct_count: correctCount,
        total_items: TOTAL_ITEMS,
        completed_at: completedAt,

        elapsed_seconds: elapsedSeconds,
        is_fast: isFast,

        base_ip: BASE_PASS_IP,
        speed_bonus_ip: speedBonusIP,
        earned_ip: earnedIP,

        total_integrity_points:
            userStats?.integrity_points ?? 0,
    };
};

// =====================================================
// Fail Money Game
// ใช้กรณีหมดเวลา
// =====================================================
exports.failMoneyGame = async (playId) => {
    // ตรวจสอบ Play
    const play =
        await prisma.game_play_history.findUnique({
            where: {
                play_id: playId,
            },
        });

    if (!play) {
        throw new Error("ไม่พบรอบการเล่นนี้");
    }

    if (play.level_id !== LEVEL_ID) {
        throw new Error(
            "Play นี้ไม่ใช่เกมแยกเงิน Unit 3 Level 2"
        );
    }

    if (play.status !== "IN_PROGRESS") {
        throw new Error("เกมนี้จบไปแล้ว");
    }

    // นับคะแนนที่ทำได้ก่อนหมดเวลา
    const correctCount =
        await prisma.game_play_money.count({
            where: {
                play_id: playId,
                is_correct: true,
            },
        });

    // เปลี่ยนสถานะเป็น FAILED
    const updatedPlay =
        await prisma.game_play_history.update({
            where: {
                play_id: playId,
            },
            data: {
                score: correctCount,
                max_score: TOTAL_ITEMS,
                status: "FAILED",
                completed_at: new Date(),
            },
        });

    return {
        play_id: updatedPlay.play_id,
        score: correctCount,
        max_score: TOTAL_ITEMS,
        status: updatedPlay.status,
        correct_count: correctCount,
        total_items: TOTAL_ITEMS,
        completed_at:
            updatedPlay.completed_at,
    };
};