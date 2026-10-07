const prisma = require("../lib/prisma");

const shuffle = (array) => {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
};

const RECEIPT_HUNT_LEVEL_ID = 8;
const TARGET_ITEM_TYPE_ID = 3;
const DECOY_ITEM_TYPE_ID = 4;

const TARGET_COUNT = 8;
const DECOY_COUNT = 5;
const TOTAL_COUNT = 13;
const BASE_PASS_IP = 150;
const SPEED_BONUS_IP = 30;
const SPEED_BONUS_SECONDS = 30;
const NO_WRONG_BONUS_IP = 20;

const recalcIntegrityPoints = async (userId) => {
    const uid = Number(userId);

    const bestPerLevel = await prisma.game_play_history.groupBy({
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

exports.startReceiptHunt = async (playId) => {
    // 1. ตรวจสอบ Play
    const play = await prisma.game_play_history.findUnique({
        where: {
            play_id: playId,
        },
    });

    if (!play) {
        throw new Error("ไม่พบรอบการเล่นนี้");
    }

    // 2. ตรวจว่าเป็น Unit 3 Level 1
    if (play.level_id !== RECEIPT_HUNT_LEVEL_ID) {
        throw new Error("Play นี้ไม่ใช่ Receipt Hunt");
    }

    // 3. ดึง Item ของ Level 8
    const levelItems = await prisma.level_items.findMany({
        where: {
            level_id: RECEIPT_HUNT_LEVEL_ID,
        },
        include: {
            items: true,
            item_types: true,
        },
    });

    // 4. แยก Target / Decoy
    const targetItems = levelItems.filter(
        (item) => item.item_type_id === TARGET_ITEM_TYPE_ID
    );

    const decoyItems = levelItems.filter(
        (item) => item.item_type_id === DECOY_ITEM_TYPE_ID
    );

    // 5. ตรวจจำนวนข้อมูล
    if (targetItems.length < TARGET_COUNT) {
        throw new Error(
            `จำนวน Target ไม่เพียงพอ ต้องการ ${TARGET_COUNT} แต่มี ${targetItems.length}`
        );
    }

    if (decoyItems.length < DECOY_COUNT) {
        throw new Error(
            `จำนวน Decoy ไม่เพียงพอ ต้องการ ${DECOY_COUNT} แต่มี ${decoyItems.length}`
        );
    }

    // 6. สุ่ม Target 8 รูป
    const selectedTargets = shuffle(targetItems).slice(
        0,
        TARGET_COUNT
    );

    // 7. สุ่ม Decoy 5 รูป
    const selectedDecoys = shuffle(decoyItems).slice(
        0,
        DECOY_COUNT
    );

    // 8. รวมทั้งหมดแล้ว Shuffle
    const selectedItems = shuffle([
        ...selectedTargets,
        ...selectedDecoys,
    ]);

    // 9. ตรวจจำนวน
    if (selectedItems.length !== TOTAL_COUNT) {
        throw new Error(
            `จำนวน Item ที่สุ่มได้ไม่ถูกต้อง: ${selectedItems.length}`
        );
    }

    // 10. บันทึก Item ที่สุ่มได้
    await prisma.game_play_receipt_hunt.createMany({
        data: selectedItems.map((item, index) => ({
            play_id: playId,
            item_id: item.item_id,
            item_order: index + 1,
            is_target:
                item.item_type_id === TARGET_ITEM_TYPE_ID,
            is_selected: false,
            is_correct: null,
            selected_at: null,
        })),
    });

    // 11. ดึงข้อมูลกลับมาเรียงตามลำดับ
    const playItems =
        await prisma.game_play_receipt_hunt.findMany({
            where: {
                play_id: playId,
            },
            orderBy: {
                item_order: "asc",
            },
            include: {
                items: true,
            },
        });

    // 12. ส่งข้อมูลกลับ
    return {
        play_id: playId,
        level_id: RECEIPT_HUNT_LEVEL_ID,
        total_items: playItems.length,
        target_count: TARGET_COUNT,
        decoy_count: DECOY_COUNT,
        items: playItems.map((item) => ({
            play_item_id: item.id,
            item_id: item.item_id,
            item_order: item.item_order,
            name: item.items.name,
            image: item.items.image,
        })),
    };
};

exports.selectReceipt = async (playId, playItemId) => {
    const play = await prisma.game_play_history.findUnique({
        where: {
            play_id: Number(playId),
        },
    });

    if (!play) {
        throw new Error("ไม่พบข้อมูลการเล่นเกม");
    }

    if (play.level_id !== RECEIPT_HUNT_LEVEL_ID) {
        throw new Error("เกมนี้ไม่ใช่ Receipt Hunt");
    }

    if (play.status !== "IN_PROGRESS") {
        throw new Error("เกมนี้ไม่ได้อยู่ในสถานะกำลังเล่น");
    }

    const playItem = await prisma.game_play_receipt_hunt.findUnique({
        where: {
            id: Number(playItemId),
        },
        include: {
            items: true,
        },
    });

    if (!playItem) {
        throw new Error("ไม่พบรายการ Receipt Hunt");
    }

    if (playItem.play_id !== Number(playId)) {
        throw new Error("รายการนี้ไม่ใช่ของรอบการเล่นนี้");
    }

    if (playItem.is_selected) {
        throw new Error("รายการนี้ถูกเลือกไปแล้ว");
    }

    const isCorrect = playItem.is_target;

    const updatedItem = await prisma.game_play_receipt_hunt.update({
        where: {
            id: playItem.id,
        },
        data: {
            is_selected: true,
            is_correct: isCorrect,
            selected_at: new Date(),
        },
        include: {
            items: true,
        },
    });

    const selectedItems = await prisma.game_play_receipt_hunt.findMany({
        where: {
            play_id: Number(playId),
            is_selected: true,
        },
    });

    const correctCount = selectedItems.filter(
        (item) => item.is_correct === true
    ).length;

    const wrongCount = selectedItems.filter(
        (item) => item.is_correct === false
    ).length;

    if (wrongCount >= 3) {
        await prisma.game_play_history.update({
            where: {
                play_id: Number(playId),
            },
            data: {
                status: "FAILED",
            },
        });

        return {
            play_id: Number(playId),
            play_item_id: updatedItem.id,
            item_id: updatedItem.item_id,
            name: updatedItem.items.name,
            image: updatedItem.items.image,
            is_correct: isCorrect,
            correct_count: correctCount,
            wrong_count: wrongCount,
            max_wrong_count: 3,
            is_failed: true,
            is_completed: false,
            game_status: "FAILED",
        };
    }

    return {
        play_id: Number(playId),
        play_item_id: updatedItem.id,
        item_id: updatedItem.item_id,
        name: updatedItem.items.name,
        image: updatedItem.items.image,
        is_correct: isCorrect,
        correct_count: correctCount,
        wrong_count: wrongCount,
        max_wrong_count: 3,
        is_failed: false,
        is_completed: correctCount >= TARGET_COUNT,
        game_status: "IN_PROGRESS",
    };
};

exports.completeReceiptHunt = async (playId) => {
    const play = await prisma.game_play_history.findUnique({
        where: {
            play_id: Number(playId),
        },
    });

    if (!play) {
        throw new Error("ไม่พบข้อมูลการเล่นเกม");
    }

    if (play.level_id !== RECEIPT_HUNT_LEVEL_ID) {
        throw new Error("เกมนี้ไม่ใช่ Receipt Hunt");
    }

    if (play.status === "FAILED") {
        throw new Error("เกมนี้แพ้ไปแล้ว ไม่สามารถจบเกมได้");
    }

    if (play.status === "COMPLETED") {
        return {
            play_id: play.play_id,
            score: play.score,
            max_score: play.max_score,
            status: play.status,
            earned_ip: play.earned_ip,
            completed_at: play.completed_at,
        };
    }

    const playItems =
        await prisma.game_play_receipt_hunt.findMany({
            where: {
                play_id: Number(playId),
            },
        });

    if (playItems.length === 0) {
        throw new Error("ไม่พบรายการ Receipt Hunt");
    }

    const targetCount = playItems.filter(
        (item) => item.is_target
    ).length;

    const correctCount = playItems.filter(
        (item) =>
            item.is_target === true &&
            item.is_selected === true &&
            item.is_correct === true
    ).length;

    const wrongCount = playItems.filter(
        (item) =>
            item.is_selected === true &&
            item.is_correct === false
    ).length;

    // ต้องเก็บ Target ครบ 8 รายการ
    if (correctCount < TARGET_COUNT) {
        return {
            play_id: Number(playId),
            score: play.score,
            max_score: play.max_score,
            target_count: targetCount,
            correct_count: correctCount,
            wrong_count: wrongCount,
            is_completed: false,
            game_status: "IN_PROGRESS",
        };
    }

    const completedAt = new Date();
    const elapsedSeconds = Math.max(
        0,
        Math.floor(
            (completedAt.getTime() - play.started_at.getTime()) /
            1000
        )
    );

    const isFast = elapsedSeconds <= SPEED_BONUS_SECONDS;
    const isFlawless = wrongCount === 0;

    const speedBonusIP = isFast ? SPEED_BONUS_IP : 0;
    const noWrongBonusIP = isFlawless ? NO_WRONG_BONUS_IP : 0;
    const earnedIP = BASE_PASS_IP + speedBonusIP + noWrongBonusIP;
    const updated = await prisma.game_play_history.updateMany({
        where: {
            play_id: Number(playId),
            completed_at: null,
        },
        data: {
            score: TARGET_COUNT,
            correct_count: correctCount,
            wrong_count: wrongCount,
            earned_ip: earnedIP,
            status: "COMPLETED",
            completed_at: completedAt,
        },
    });

    if (updated.count === 0) {
        const alreadyCompleted =
            await prisma.game_play_history.findUnique({
                where: { play_id: Number(playId) },
            });

        return {
            play_id: Number(playId),
            score: alreadyCompleted.score,
            max_score: alreadyCompleted.max_score,
            status: alreadyCompleted.status,
            earned_ip: alreadyCompleted.earned_ip,
            completed_at: alreadyCompleted.completed_at,
        };
    }
    const totalIntegrityPoints =
        await recalcIntegrityPoints(play.user_id);

    return {
        play_id: playId,
        score: TARGET_COUNT,
        max_score: play.max_score,
        target_count: targetCount,
        correct_count: correctCount,
        wrong_count: wrongCount,
        status: "COMPLETED",
        completed_at: completedAt,
        is_completed: true,
        game_status: "COMPLETED",

        elapsed_seconds: elapsedSeconds,
        is_fast: isFast,
        is_flawless: isFlawless,

        base_ip: BASE_PASS_IP,
        speed_bonus_ip: speedBonusIP,
        no_wrong_bonus_ip: noWrongBonusIP,
        earned_ip: earnedIP,

        total_integrity_points: totalIntegrityPoints,
    };
};