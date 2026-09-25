const prisma = require("../lib/prisma");

const FINAL_LEVEL_ID = 10;

// ================= คะแนนเต็มของ FinalLevel นี้ =================
// เปลี่ยนจาก 100 เป็น 15 คะแนน — แบ่งเท่า ๆ กัน 3 คะแนนต่อเงื่อนไข
// จาก 5 เงื่อนไข (ซื้อของจำเป็นครบ / เก็บใบเสร็จครบ / ไม่ติดลบ /
// เงินสำรองพอ / ไม่ซื้อของไม่จำเป็น) ดู completeTreasurerGame ด้านล่าง
const MAX_SCORE = 15;
const POINTS_PER_CRITERION = 3;

// ================= IP Reward =================
// ต้อง success ก่อนถึงจะได้ IP เลย (ภารกิจไม่ผ่าน = ไม่ได้ IP เลย
// ไม่ว่าจะทำเงื่อนไขย่อยได้กี่ข้อหรือทันเวลาแค่ไหนก็ตาม)
// เมื่อ success แล้วถึงนับ:
//   - เงื่อนไขละ 1 IP จาก 5 เงื่อนไขเดียวกับที่ใช้คิดคะแนน (ดูตัวแปร
//     criteriaMet ใน completeTreasurerGame) สูงสุด 5 IP
//   - ทันเวลา (elapsed <= limit_time) อีก +1 IP
// รวมสูงสุด 6 IP ต่อการเล่น 1 ครั้ง
const CRITERIA_IP = 1;
const TIME_BONUS_IP = 1;

// =====================================================
// Helpers
// =====================================================

// เกรดอิงสัดส่วน % เดิม (90/80/70/60%) เทียบกับคะแนนเต็มจริงของ level
// (maxScore เผื่อไว้เปลี่ยนคะแนนเต็มในอนาคตโดยไม่ต้องแก้เกณฑ์เกรด)
function getGrade(score, maxScore = MAX_SCORE) {
    if (score >= maxScore * 0.9) return "A";
    if (score >= maxScore * 0.8) return "B";
    if (score >= maxScore * 0.7) return "C";
    if (score >= maxScore * 0.6) return "D";
    return "F";
}

function getFeedback(
    success,
    missingReceiptFlag,
    unnecessaryPurchaseFlag,
    balance,
    minReserve
) {
    if (success) {
        return "ยอดเยี่ยม! คุณบริหารงบประมาณค่ายได้อย่างมีประสิทธิภาพ!";
    }

    if (missingReceiptFlag) {
        return "ควรเก็บใบเสร็จทุกครั้งเพื่อตรวจสอบบัญชีได้";
    }

    if (unnecessaryPurchaseFlag) {
        return "ระวังการซื้อของที่ไม่จำเป็น จะทำให้งบประมาณไม่เพียงพอ";
    }

    if (balance < minReserve) {
        return `ควรสำรองเงินไว้อย่างน้อย ${minReserve.toLocaleString(
            "th-TH"
        )} บาทเพื่อความปลอดภัย`;
    }

    return "ลองอีกครั้ง และวางแผนการใช้จ่ายให้รอบคอบมากขึ้น";
}

async function getConfig() {
    const config = await prisma.final_level_config.findUnique({
        where: { level_id: FINAL_LEVEL_ID },
    });

    if (!config) {
        throw new Error("ยังไม่มี FinalLevel Config");
    }

    return config;
}

// ตรวจสอบรอบการเล่นให้เป็นของ user นี้จริง และเป็น Treasurer FinalLevel จริง
async function loadTreasurerPlay(playId, userId) {
    const play = await prisma.game_play_history.findUnique({
        where: { play_id: playId },
    });

    if (!play) {
        return {
            error: { status: 404, message: "ไม่พบรอบการเล่นนี้" },
        };
    }

    if (play.user_id !== userId) {
        return {
            error: {
                status: 403,
                message: "ไม่มีสิทธิ์เข้าถึงรอบการเล่นนี้",
            },
        };
    }

    if (play.level_id !== FINAL_LEVEL_ID) {
        return {
            error: {
                status: 400,
                message: "รอบการเล่นนี้ไม่ใช่ Treasurer FinalLevel",
            },
        };
    }

    return { play };
}

// =====================================================
// คำนวณ "สถานะเกมจริง" ทั้งหมดจากข้อมูลที่ log ไว้ใน DB เท่านั้น
// (game_play_treasurer_receipts / _receipt_items / _events)
// ไม่เชื่อค่าใด ๆ จาก client เลย — ใช้ทั้งตอนจบเกมสำเร็จและตอนบังคับ FAIL
// =====================================================
async function computeGameState(playId) {
    const [levelItems, receipts, events] = await Promise.all([
        prisma.level_items.findMany({
            where: { level_id: FINAL_LEVEL_ID },
        }),

        prisma.game_play_treasurer_receipts.findMany({
            where: { play_id: playId },
            include: { game_play_treasurer_receipt_items: true },
        }),

        prisma.game_play_treasurer_events.findMany({
            where: { play_id: playId },
        }),
    ]);

    const allItems = receipts.flatMap(
        (receipt) => receipt.game_play_treasurer_receipt_items
    );

    const purchasedItemIds = new Set(
        allItems.map((item) => item.item_id)
    );

    const requiredItemIds = levelItems
        .filter((item) => item.is_required)
        .map((item) => item.item_id);

    const requiredComplete = requiredItemIds.every((id) =>
        purchasedItemIds.has(id)
    );

    // ไม่เก็บใบเสร็จ = missing receipt (เงินถูกตัดไปแล้วตอน checkout
    // ไม่ได้คืนตอนไม่เก็บใบเสร็จ ตรงกับพฤติกรรมเดิมของเกม)
    const missingReceiptFromDiscard = receipts.some(
        (receipt) => receipt.is_saved === false
    );

    const missingReceiptFromEvent = events.some(
        (event) => event.missing_receipt_flag
    );

    const missingReceiptFlag =
        missingReceiptFromDiscard || missingReceiptFromEvent;

    const unnecessaryCount = allItems.filter(
        (item) => item.item_type === "want"
    ).length;

    // ตรงกับพฤติกรรมเดิม: ซื้อของ "want" เยอะแค่ไหนก็แค่หักคะแนน ไม่ทำให้
    // ภารกิจ FAIL ทันที — ต้องเป็น event ที่ระบุ unnecessary_purchase เท่านั้น
    // ถึงจะ flip flag ที่มีผลต่อ success
    const unnecessaryPurchaseFlag = events.some(
        (event) => event.unnecessary_purchase_flag
    );

    const purchasedItemsJson = allItems.map((item) => ({
        item_id: item.item_id,
        category: item.category,
        item_type: item.item_type,
        quantity: item.quantity,
        unit_price: item.unit_price,
    }));

    return {
        requiredComplete,
        missingReceiptFlag,
        unnecessaryPurchaseFlag,
        unnecessaryCount,
        receiptCount: receipts.length,
        purchasedItemsJson,
    };
}

function buildResultPayload(treasurerRow, totalIntegrityPoints, ipBreakdown) {
    return {
        play_id: treasurerRow.play_id,
        success: treasurerRow.success,
        score: treasurerRow.score,
        max_score: treasurerRow.max_score,
        grade: treasurerRow.grade,
        start_budget: treasurerRow.start_budget,
        final_balance: treasurerRow.final_balance,
        spent_amount: treasurerRow.spent_amount,
        receipt_count: treasurerRow.receipt_count,
        unnecessary_count: treasurerRow.unnecessary_count,
        missing_receipt: treasurerRow.missing_receipt,
        unnecessary_purchase: treasurerRow.unnecessary_purchase,
        elapsed_time: treasurerRow.elapsed_time,
        hp_bonus: treasurerRow.hp_bonus,
        fail_reason: treasurerRow.fail_reason,
        feedback: treasurerRow.feedback,
        completed_at: treasurerRow.completed_at,

        base_ip: ipBreakdown?.baseIp ?? 0,
        time_bonus_ip: ipBreakdown?.timeBonusIp ?? 0,
        grade_bonus_ip: ipBreakdown?.gradeBonusIp ?? 0,
        earned_ip: ipBreakdown?.earnedIp ?? 0,
        total_integrity_points: totalIntegrityPoints,
    };
}

// สร้าง ipBreakdown ย้อนหลังจาก field ที่ persist ไว้แล้วใน
// game_play_treasurer/game_play_history — ใช้เฉพาะตอน "เกมจบไปแล้ว"
// (refetch/race กับ checkout/event) ไม่ต้อง computeGameState() ใหม่
// เพราะ deterministic เหมือนกันทุกอย่างกับตอนจบเกมจริง (ดู
// completeTreasurerGame: criteriaMet เดียวกัน) — earned_ip เอาจาก
// game_play_history ที่ persist จริงเป็นหลักเสมอ กัน baseIp+timeBonusIp
// ที่คำนวณย้อนหลังเพี้ยนไปจากตัวเลขจริงถ้า logic เปลี่ยนในอนาคต
function buildIpBreakdownFromStored(treasurerRow, minReserve, earnedIpFromHistory) {
    const criteriaMet = [
        true, // requiredComplete — เกมจบได้ต้องซื้อของจำเป็นครบเสมอ
        !treasurerRow.missing_receipt,
        treasurerRow.final_balance >= 0,
        treasurerRow.final_balance >= minReserve,
        treasurerRow.unnecessary_count === 0,
    ];
    const criteriaMetCount = criteriaMet.filter(Boolean).length;

    const baseIp = treasurerRow.success ? criteriaMetCount * CRITERIA_IP : 0;
    const timeBonusIp =
        treasurerRow.success && treasurerRow.hp_bonus ? TIME_BONUS_IP : 0;

    return {
        baseIp,
        timeBonusIp,
        gradeBonusIp: 0,
        earnedIp: earnedIpFromHistory ?? baseIp + timeBonusIp,
    };
}

// จบเกมทันทีแบบ FAILED (เงินเกินงบ / เงินสำรองไม่พอ ไม่ว่าจะจาก checkout
// หรือ event) — ใช้ร่วมกันทั้ง 2 จุด เพื่อไม่ให้ logic ผิดเพี้ยนกัน
async function finalizeTreasurerFailure(
    play,
    treasurer,
    config,
    reason,
    balanceOverride
) {
    const playId = play.play_id;
    const completedAt = new Date();

    const balance =
        balanceOverride !== undefined
            ? balanceOverride
            : treasurer.final_balance;

    const elapsedSeconds = Math.max(
        0,
        Math.floor(
            (completedAt.getTime() - play.started_at.getTime()) / 1000
        )
    );

    // updateMany + completed_at:null กันเรียกจบเกมซ้ำ (เช่น checkout กับ
    // event ยิงมาไล่เลี่ยกันจนทั้งคู่พยายามจบเกมพร้อมกัน)
    const updated = await prisma.game_play_history.updateMany({
        where: { play_id: playId, completed_at: null },
        data: {
            score: 0,
            max_score: MAX_SCORE,
            status: "FAILED",
            completed_at: completedAt,
        },
    });

    const userStats = await prisma.user_stats.findUnique({
        where: { user_id: play.user_id },
        select: { integrity_points: true },
    });

    if (updated.count === 0) {
        const existing = await prisma.game_play_treasurer.findUnique({
            where: { play_id: playId },
        });

        return buildResultPayload(
            existing,
            userStats?.integrity_points ?? 0,
            null
        );
    }

    const state = await computeGameState(playId);

    const treasurerRow = await prisma.game_play_treasurer.update({
        where: { play_id: playId },
        data: {
            score: 0,
            grade: "F",
            final_balance: balance,
            spent_amount: config.start_budget - balance,
            receipt_count: state.receiptCount,
            unnecessary_count: state.unnecessaryCount,
            missing_receipt: state.missingReceiptFlag,
            unnecessary_purchase: state.unnecessaryPurchaseFlag,
            elapsed_time: elapsedSeconds,
            hp_bonus: elapsedSeconds <= config.limit_time,
            success: false,
            fail_reason: reason,
            feedback: reason,
            purchased_items: state.purchasedItemsJson,
            completed_at: completedAt,
        },
    });

    // FAILED ไม่ได้ IP เลย (earned_ip ของ game_play_history คงค่า default 0)
    return buildResultPayload(
        treasurerRow,
        userStats?.integrity_points ?? 0,
        null
    );
}

// =====================================================
// Start Treasurer Game
// สร้างข้อมูลสรุปของรอบการเล่นใน game_play_treasurer
// =====================================================
exports.startTreasurerGame = async (playId) => {
    const config = await prisma.final_level_config.findUnique({
        where: {
            level_id: FINAL_LEVEL_ID,
        },
    });

    if (!config) {
        throw new Error("ยังไม่มี FinalLevel Config");
    }

    const existing = await prisma.game_play_treasurer.findUnique({
        where: {
            play_id: playId,
        },
    });

    if (existing) {
        return existing;
    }

    return prisma.game_play_treasurer.create({
        data: {
            play_id: playId,
            start_budget: config.start_budget,
            final_balance: config.start_budget,
            max_score: MAX_SCORE,
        },
    });
};

// =====================================================
// Checkout Cart
// รับแค่ item_id + quantity จาก client ราคา/หมวด/ประเภท/จำนวนซื้อได้
// สูงสุด อ่านจาก DB (level_items + items) ทั้งหมด ไม่เชื่อค่าจาก client
// เลยแม้แต่ตัวเลขเดียว — ตรวจงบต่อหมวดกับเงินสำรองขั้นต่ำจริงจาก
// final_level_config / final_level_category_budgets
// POST /api/final-level/checkout
// =====================================================
exports.checkoutCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { play_id, cart } = req.body;

        if (!play_id) {
            return res.status(400).json({
                message: "กรุณาระบุ play_id",
            });
        }

        const playId = Number(play_id);

        if (!Number.isInteger(playId) || playId <= 0) {
            return res.status(400).json({
                message: "play_id ต้องเป็นจำนวนเต็มที่ถูกต้อง",
            });
        }

        if (!Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({
                message: "ตะกร้าว่าง ไม่มีอะไรจะชำระเงิน",
            });
        }

        const { play, error } = await loadTreasurerPlay(playId, userId);

        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        if (play.status !== "IN_PROGRESS") {
            return res.status(400).json({
                message: "เกมนี้จบไปแล้ว",
            });
        }

        const treasurer = await prisma.game_play_treasurer.findUnique({
            where: { play_id: playId },
        });

        if (!treasurer) {
            return res.status(400).json({
                message: "ยังไม่ได้เริ่มเกม Treasurer",
            });
        }

        const config = await getConfig();

        // ---- โหลดข้อมูล item จริงจาก DB (ราคา/หมวด/ประเภท/ซื้อได้สูงสุด) ----
        const levelItems = await prisma.level_items.findMany({
            where: { level_id: FINAL_LEVEL_ID },
            include: { items: true, item_types: true },
        });

        const itemMap = new Map(
            levelItems.map((li) => [li.item_id, li])
        );

        // ---- จำนวนที่เคยซื้อไปแล้วของแต่ละ item ในรอบนี้ (ทุกใบเสร็จ) ----
        const previousItems =
            await prisma.game_play_treasurer_receipt_items.findMany({
                where: {
                    game_play_treasurer_receipts: { play_id: playId },
                },
                select: {
                    item_id: true,
                    category: true,
                    quantity: true,
                    unit_price: true,
                },
            });

        const purchasedQtyMap = new Map();

        previousItems.forEach((row) => {
            purchasedQtyMap.set(
                row.item_id,
                (purchasedQtyMap.get(row.item_id) || 0) + row.quantity
            );
        });

        // ---- ตรวจสอบตะกร้าทีละชิ้น คำนวณราคาจาก DB เท่านั้น ----
        let cartTotal = 0;
        const categoryTotals = {};
        const receiptItemsData = [];

        for (const cartLine of cart) {
            const itemId = Number(cartLine?.item_id);
            const quantity = Number(cartLine?.quantity);

            if (
                !Number.isInteger(itemId) ||
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                return res.status(400).json({
                    message: "รายการในตะกร้าไม่ถูกต้อง",
                });
            }

            const levelItem = itemMap.get(itemId);

            if (!levelItem) {
                return res.status(400).json({
                    message: `ไม่พบสินค้านี้ใน Level (item_id ${itemId})`,
                });
            }

            const maxPurchase = Number(levelItem.quantity || 0);
            const alreadyBought = purchasedQtyMap.get(itemId) || 0;

            if (
                maxPurchase > 0 &&
                alreadyBought + quantity > maxPurchase
            ) {
                return res.status(400).json({
                    message: `${levelItem.items.name} ซื้อได้สูงสุด ${maxPurchase} ชิ้น (ซื้อไปแล้ว ${alreadyBought} ชิ้น)`,
                });
            }

            const unitPrice = Number(levelItem.items.price || 0);
            const lineTotal = unitPrice * quantity;

            cartTotal += lineTotal;

            const category = levelItem.items.category || "";
            categoryTotals[category] =
                (categoryTotals[category] || 0) + lineTotal;

            receiptItemsData.push({
                item_id: itemId,
                category,
                item_type: levelItem.item_types?.code || null,
                quantity,
                unit_price: unitPrice,
            });
        }

        // ---- ตรวจงบต่อหมวด (ของเก่า + ตะกร้าใหม่ เทียบงบเต็มของหมวด) ----
        const budgets = await prisma.final_level_category_budgets.findMany({
            where: { config_id: config.id },
        });

        const budgetMap = new Map(
            budgets.map((b) => [b.category, b.budget])
        );

        const previousCategoryTotals = {};

        previousItems.forEach((row) => {
            const cat = row.category || "";
            previousCategoryTotals[cat] =
                (previousCategoryTotals[cat] || 0) +
                row.unit_price * row.quantity;
        });

        const categoryFailures = [];

        Object.entries(categoryTotals).forEach(([category, spentNow]) => {
            const totalSpent =
                (previousCategoryTotals[category] || 0) + spentNow;

            const categoryBudget = Number(budgetMap.get(category) || 0);

            if (totalSpent > categoryBudget) {
                categoryFailures.push(
                    `หมวด ${category}: ใช้ ${totalSpent.toLocaleString(
                        "th-TH"
                    )} บาท / งบ ${categoryBudget.toLocaleString(
                        "th-TH"
                    )} บาท (เกิน ${(
                        totalSpent - categoryBudget
                    ).toLocaleString("th-TH")} บาท)`
                );
            }
        });

        if (categoryFailures.length > 0) {
            const result = await finalizeTreasurerFailure(
                play,
                treasurer,
                config,
                "งบประมาณของบางหมวดไม่เพียงพอ"
            );

            return res.status(200).json({
                message: "งบประมาณของบางหมวดไม่เพียงพอ เกมจบแล้ว",
                data: { ...result, fail_reasons: categoryFailures },
            });
        }

        // ---- ตรวจเงินคงเหลือขั้นต่ำหลังชำระเงิน ----
        const currentBalance = treasurer.final_balance;
        const nextBalance = currentBalance - cartTotal;

        if (nextBalance < config.min_reserve) {
            const failReasons = [
                `ยอดซื้อรวม ${cartTotal.toLocaleString("th-TH")} บาท`,
                `เงินคงเหลือหลังซื้อ ${nextBalance.toLocaleString(
                    "th-TH"
                )} บาท`,
                `ต้องเหลือเงินสำรองอย่างน้อย ${config.min_reserve.toLocaleString(
                    "th-TH"
                )} บาท`,
            ];

            const result = await finalizeTreasurerFailure(
                play,
                treasurer,
                config,
                "เงินคงเหลือหลังการซื้อไม่ถึงเงินสำรองขั้นต่ำ",
                nextBalance
            );

            return res.status(200).json({
                message:
                    "เงินคงเหลือหลังการซื้อไม่ถึงเงินสำรองขั้นต่ำ เกมจบแล้ว",
                data: { ...result, fail_reasons: failReasons },
            });
        }

        // ---- ผ่านการตรวจสอบ: บันทึกใบเสร็จจริง + หักเงินจริง ----
        const receipt = await prisma.game_play_treasurer_receipts.create({
            data: {
                play_id: playId,
                total_amount: cartTotal,
                is_saved: null,
                game_play_treasurer_receipt_items: {
                    create: receiptItemsData,
                },
            },
            include: { game_play_treasurer_receipt_items: true },
        });

        await prisma.game_play_treasurer.update({
            where: { play_id: playId },
            data: { final_balance: nextBalance },
        });

        return res.status(201).json({
            message: "ชำระเงินสำเร็จ",
            data: {
                receipt_id: receipt.receipt_id,
                total_amount: cartTotal,
                balance: nextBalance,
                items: receipt.game_play_treasurer_receipt_items.map(
                    (row) => ({
                        item_id: row.item_id,
                        category: row.category,
                        item_type: row.item_type,
                        quantity: row.quantity,
                        unit_price: row.unit_price,
                    })
                ),
            },
        });
    } catch (error) {
        console.error("Checkout Cart Error:", error);

        return res.status(500).json({
            message: "ไม่สามารถชำระเงินได้",
            error: error.message,
        });
    }
};

// =====================================================
// Decide Receipt (เก็บ / ไม่เก็บ) แล้วสุ่ม Event ต่อ (ถ้ามี)
// POST /api/final-level/receipt/decide
// =====================================================
exports.decideReceipt = async (req, res) => {
    try {
        const userId = req.user.id;
        const { play_id, receipt_id, save } = req.body;

        const playId = Number(play_id);
        const receiptId = Number(receipt_id);

        if (
            !Number.isInteger(playId) ||
            playId <= 0 ||
            !Number.isInteger(receiptId) ||
            receiptId <= 0
        ) {
            return res.status(400).json({
                message: "play_id หรือ receipt_id ไม่ถูกต้อง",
            });
        }

        const { play, error } = await loadTreasurerPlay(playId, userId);

        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        if (play.status !== "IN_PROGRESS") {
            return res.status(400).json({
                message: "เกมนี้จบไปแล้ว",
            });
        }

        const receipt =
            await prisma.game_play_treasurer_receipts.findUnique({
                where: { receipt_id: receiptId },
            });

        if (!receipt || receipt.play_id !== playId) {
            return res.status(404).json({
                message: "ไม่พบใบเสร็จนี้",
            });
        }

        if (receipt.is_saved !== null) {
            return res.status(400).json({
                message: "ใบเสร็จนี้ถูกตัดสินใจไปแล้ว",
            });
        }

        await prisma.game_play_treasurer_receipts.update({
            where: { receipt_id: receiptId },
            data: { is_saved: Boolean(save), decided_at: new Date() },
        });

        // ---- สุ่ม Event 50% จาก event ของ level นี้ที่ยังไม่เคยเจอในรอบนี้ ----
        const appliedEventIds = (
            await prisma.game_play_treasurer_events.findMany({
                where: { play_id: playId },
                select: { event_id: true },
            })
        ).map((row) => row.event_id);

        const candidateEvents = await prisma.final_level_events.findMany({
            where: {
                level_id: FINAL_LEVEL_ID,
                is_active: true,
                event_id: {
                    notIn:
                        appliedEventIds.length > 0
                            ? appliedEventIds
                            : [0],
                },
            },
            include: { final_level_event_choices: true },
        });

        let event = null;

        if (candidateEvents.length > 0 && Math.random() < 0.5) {
            const picked =
                candidateEvents[
                Math.floor(Math.random() * candidateEvents.length)
                ];

            event = {
                event_id: picked.event_id,
                event_key: picked.event_key,
                title: picked.title,
                description: picked.description,
                choices: picked.final_level_event_choices.map(
                    (choice) => ({
                        choice_id: choice.choice_id,
                        choice_key: choice.choice_key,
                        choice_text: choice.choice_text,
                        money_change: choice.money_change,
                        score_change: choice.score_change,
                    })
                ),
            };
        }

        return res.status(200).json({
            message: "บันทึกการตัดสินใจใบเสร็จสำเร็จ",
            data: { receipt_id: receiptId, is_saved: Boolean(save), event },
        });
    } catch (error) {
        console.error("Decide Receipt Error:", error);

        return res.status(500).json({
            message: "ไม่สามารถบันทึกการตัดสินใจใบเสร็จได้",
            error: error.message,
        });
    }
};

// =====================================================
// Apply Event Choice
// รับแค่ event_id + choice_id ผลกระทบ (money_change/score_change/flags)
// อ่านจาก DB (final_level_event_choices) เท่านั้น ไม่เชื่อค่าจาก client
// POST /api/final-level/event/apply
// =====================================================
exports.applyEventChoice = async (req, res) => {
    try {
        const userId = req.user.id;
        const { play_id, event_id, choice_id } = req.body;

        const playId = Number(play_id);
        const eventId = Number(event_id);
        const choiceId = Number(choice_id);

        if (
            ![playId, eventId, choiceId].every(
                (n) => Number.isInteger(n) && n > 0
            )
        ) {
            return res.status(400).json({
                message: "play_id, event_id หรือ choice_id ไม่ถูกต้อง",
            });
        }

        const { play, error } = await loadTreasurerPlay(playId, userId);

        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        if (play.status !== "IN_PROGRESS") {
            return res.status(400).json({
                message: "เกมนี้จบไปแล้ว",
            });
        }

        const treasurer = await prisma.game_play_treasurer.findUnique({
            where: { play_id: playId },
        });

        if (!treasurer) {
            return res.status(400).json({
                message: "ยังไม่ได้เริ่มเกม Treasurer",
            });
        }

        // กันตอบ event เดิมซ้ำ (ฟาร์มเงิน/คะแนน) — unique(play_id, event_id)
        const alreadyApplied =
            await prisma.game_play_treasurer_events.findUnique({
                where: {
                    play_id_event_id: {
                        play_id: playId,
                        event_id: eventId,
                    },
                },
            });

        if (alreadyApplied) {
            return res.status(409).json({
                message: "Event นี้ถูกตอบไปแล้ว",
            });
        }

        const choice = await prisma.final_level_event_choices.findUnique({
            where: { choice_id: choiceId },
            include: { final_level_events: true },
        });

        if (
            !choice ||
            choice.event_id !== eventId ||
            choice.final_level_events.level_id !== FINAL_LEVEL_ID ||
            !choice.final_level_events.is_active
        ) {
            return res.status(400).json({
                message: "ตัวเลือกนี้ไม่ถูกต้องสำหรับ Event นี้",
            });
        }

        const config = await getConfig();

        const nextBalance = treasurer.final_balance + choice.money_change;
        const nextScore = treasurer.score + choice.score_change;

        await prisma.game_play_treasurer_events.create({
            data: {
                play_id: playId,
                event_id: eventId,
                choice_id: choiceId,
                money_change: choice.money_change,
                score_change: choice.score_change,
                missing_receipt_flag: choice.missing_receipt,
                unnecessary_purchase_flag: choice.unnecessary_purchase,
            },
        });

        await prisma.game_play_treasurer.update({
            where: { play_id: playId },
            data: { final_balance: nextBalance, score: nextScore },
        });

        // ---- เงินคงเหลือหลัง Event ต่ำกว่าเงินสำรองขั้นต่ำ จบเกมทันที ----
        if (nextBalance < config.min_reserve) {
            const failReasons = [
                `เงินคงเหลือปัจจุบัน ${nextBalance.toLocaleString(
                    "th-TH"
                )} บาท`,
                `ต้องเหลือเงินสำรองอย่างน้อย ${config.min_reserve.toLocaleString(
                    "th-TH"
                )} บาท`,
            ];

            const updatedTreasurer =
                await prisma.game_play_treasurer.findUnique({
                    where: { play_id: playId },
                });

            const result = await finalizeTreasurerFailure(
                play,
                updatedTreasurer,
                config,
                "เงินคงเหลือจากเหตุการณ์ไม่ถึงเงินสำรองขั้นต่ำ",
                nextBalance
            );

            return res.status(200).json({
                message:
                    "เงินคงเหลือจากเหตุการณ์ไม่ถึงเงินสำรองขั้นต่ำ เกมจบแล้ว",
                data: {
                    ...result,
                    fail_reasons: failReasons,
                    feedback: choice.feedback || result.feedback,
                },
            });
        }

        return res.status(200).json({
            message: "ตอบ Event สำเร็จ",
            data: {
                balance: nextBalance,
                score: nextScore,
                feedback: choice.feedback,
            },
        });
    } catch (error) {
        console.error("Apply Event Choice Error:", error);

        return res.status(500).json({
            message: "ไม่สามารถบันทึกการตอบ Event ได้",
            error: error.message,
        });
    }
};

// =====================================================
// Complete Treasurer Game
// รับแค่ play_id — score/grade/success/IP ทั้งหมดคำนวณจากข้อมูลจริง
// ใน DB (computeGameState) ไม่เชื่อค่าใด ๆ จาก client เลย
// POST /api/final-level/complete
// =====================================================
exports.completeTreasurerGame = async (req, res) => {
    try {
        const userId = req.user.id;
        const { play_id } = req.body;

        if (!play_id) {
            return res.status(400).json({
                message: "กรุณาระบุ play_id",
            });
        }

        const playId = Number(play_id);

        if (!Number.isInteger(playId) || playId <= 0) {
            return res.status(400).json({
                message: "play_id ต้องเป็นจำนวนเต็มที่ถูกต้อง",
            });
        }

        const { play, error } = await loadTreasurerPlay(playId, userId);

        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const treasurer = await prisma.game_play_treasurer.findUnique({
            where: { play_id: playId },
        });

        if (!treasurer) {
            return res.status(400).json({
                message: "ยังไม่ได้เริ่มเกม Treasurer",
            });
        }

        // ย้าย getConfig() มาไว้ตรงนี้ (แทนที่จะเรียกหลังเช็ค completed_at)
        // เพราะ branch "เกมจบไปแล้ว" ด้านล่างต้องใช้ config.min_reserve
        // ไปคำนวณ ipBreakdown ย้อนหลังด้วย
        const config = await getConfig();

        // เกมจบไปแล้ว (เช่น checkout/event เพิ่งบังคับ FAILED ไปก่อนหน้า)
        // ส่งผลเดิมกลับไปเฉย ๆ ไม่คำนวณซ้ำ ไม่ให้ IP ซ้ำ — แต่ยังคง
        // สร้าง ipBreakdown ย้อนหลังจากข้อมูลที่ persist ไว้แล้ว ไม่งั้น
        // ตอน refetch (เช่น refresh หน้า) จะเห็น base_ip/time_bonus_ip
        // เป็น 0 หมดทั้งที่ได้ IP ไปแล้วจริง ๆ (earned_ip ใน DB ไม่ใช่ 0)
        if (play.completed_at) {
            const userStats = await prisma.user_stats.findUnique({
                where: { user_id: userId },
                select: { integrity_points: true },
            });

            return res.status(200).json({
                message: "เกมนี้จบไปแล้ว",
                data: buildResultPayload(
                    treasurer,
                    userStats?.integrity_points ?? 0,
                    buildIpBreakdownFromStored(
                        treasurer,
                        config.min_reserve,
                        play.earned_ip
                    )
                ),
            });
        }

        const state = await computeGameState(playId);

        if (!state.requiredComplete) {
            return res.status(400).json({
                message: "ยังซื้อของจำเป็นไม่ครบ ยังจบภารกิจไม่ได้",
            });
        }

        const completedAt = new Date();

        const elapsedSeconds = Math.max(
            0,
            Math.floor(
                (completedAt.getTime() - play.started_at.getTime()) / 1000
            )
        );

        const isFast = elapsedSeconds <= config.limit_time;
        const balance = treasurer.final_balance;

        const success =
            !state.missingReceiptFlag &&
            !state.unnecessaryPurchaseFlag &&
            balance >= config.min_reserve;

        // คะแนนเต็ม 15 — 5 เงื่อนไข x 3 คะแนนเท่ากันทุกข้อ (ดู MAX_SCORE ด้านบน)
        // เก็บผลแต่ละเงื่อนไขเป็น array ไว้ด้วย เพื่อเอาไปนับ IP ต่อ
        // (1 เงื่อนไขที่ผ่าน = 1 IP — ดูส่วน IP ด้านล่าง)
        const criteriaMet = [
            state.requiredComplete,
            !state.missingReceiptFlag,
            balance >= 0,
            balance >= config.min_reserve,
            state.unnecessaryCount === 0,
        ];
        const criteriaMetCount = criteriaMet.filter(Boolean).length;

        let finalScore = criteriaMetCount * POINTS_PER_CRITERION;

        // หักคะแนนของไม่จำเป็น: -1 คะแนนต่อชิ้น สูงสุดไม่เกิน 3 คะแนน
        // (เท่ากับคะแนนของเงื่อนไข "ไม่ซื้อของไม่จำเป็น" ข้อเดียว)
        finalScore -= Math.min(state.unnecessaryCount, POINTS_PER_CRITERION);
        finalScore = Math.max(finalScore, 0);

        const grade = getGrade(finalScore);

        let failReason = null;

        if (!success) {
            if (state.missingReceiptFlag) {
                failReason = "มีใบเสร็จไม่ครบ";
            } else if (
                state.unnecessaryPurchaseFlag ||
                state.unnecessaryCount > 0
            ) {
                failReason = "มีการซื้อของที่ไม่จำเป็น";
            } else if (balance < config.min_reserve) {
                failReason = `เงินคงเหลือน้อยกว่าเงินสำรองขั้นต่ำ ${config.min_reserve.toLocaleString(
                    "th-TH"
                )} บาท`;
            } else {
                failReason = "ไม่ผ่านเงื่อนไขของภารกิจ";
            }
        }

        const feedback = getFeedback(
            success,
            state.missingReceiptFlag,
            state.unnecessaryPurchaseFlag,
            balance,
            config.min_reserve
        );

        const spentAmount = config.start_budget - balance;

        const updated = await prisma.game_play_history.updateMany({
            where: { play_id: playId, completed_at: null },
            data: {
                score: finalScore,
                max_score: MAX_SCORE,
                status: success ? "COMPLETED" : "FAILED",
                completed_at: completedAt,
            },
        });

        if (updated.count === 0) {
            // แพ้ race ให้ checkout/event ที่ยิง complete เข้ามาก่อน —
            // ต้องอ่าน earned_ip ที่เขา persist ไปแล้วจาก game_play_history
            // เอง ด้วย (ไม่ใช่แค่ game_play_treasurer) ไม่งั้น ipBreakdown
            // จะกลายเป็น 0 หมดทั้งที่ได้ IP ไปแล้วจริง ๆ
            const [existing, existingHistory] = await Promise.all([
                prisma.game_play_treasurer.findUnique({
                    where: { play_id: playId },
                }),
                prisma.game_play_history.findUnique({
                    where: { play_id: playId },
                    select: { earned_ip: true },
                }),
            ]);

            const userStats = await prisma.user_stats.findUnique({
                where: { user_id: userId },
                select: { integrity_points: true },
            });

            return res.status(200).json({
                message: "เกมนี้จบไปแล้ว",
                data: buildResultPayload(
                    existing,
                    userStats?.integrity_points ?? 0,
                    buildIpBreakdownFromStored(
                        existing,
                        config.min_reserve,
                        existingHistory?.earned_ip
                    )
                ),
            });
        }

        // ---- IP: ต้อง success ก่อนถึงนับ ----
        // baseIp = เงื่อนไขละ 1 IP (สูงสุด 5) + timeBonusIp = ทันเวลา +1 IP
        // รวมสูงสุด 6 IP (ไม่มี grade bonus แยกต่างหากแล้ว)
        const baseIp = success ? criteriaMetCount * CRITERIA_IP : 0;
        const timeBonusIp = success && isFast ? TIME_BONUS_IP : 0;
        const gradeBonusIp = 0;
        const earnedIp = baseIp + timeBonusIp;

        const treasurerRow = await prisma.game_play_treasurer.update({
            where: { play_id: playId },
            data: {
                score: finalScore,
                max_score: MAX_SCORE,
                grade,
                final_balance: balance,
                spent_amount: spentAmount,
                receipt_count: state.receiptCount,
                unnecessary_count: state.unnecessaryCount,
                missing_receipt: state.missingReceiptFlag,
                unnecessary_purchase: state.unnecessaryPurchaseFlag,
                elapsed_time: elapsedSeconds,
                hp_bonus: isFast,
                success,
                fail_reason: failReason,
                feedback,
                purchased_items: state.purchasedItemsJson,
                completed_at: completedAt,
            },
        });

        if (earnedIp > 0) {
            await prisma.game_play_history.update({
                where: { play_id: playId },
                data: { earned_ip: earnedIp },
            });

            await prisma.user_stats.upsert({
                where: { user_id: userId },
                update: {
                    integrity_points: { increment: earnedIp },
                },
                create: {
                    user_id: userId,
                    total_points: 0,
                    current_streak: 0,
                    highest_score: 0,
                    last_login_date: new Date(),
                    integrity_points: earnedIp,
                },
            });
        }

        const userStats = await prisma.user_stats.findUnique({
            where: { user_id: userId },
            select: { integrity_points: true },
        });

        return res.status(200).json({
            message: success
                ? "จบภารกิจเหรัญญิกสำเร็จ"
                : "ภารกิจเหรัญญิกไม่ผ่าน",
            data: buildResultPayload(
                treasurerRow,
                userStats?.integrity_points ?? 0,
                { baseIp, timeBonusIp, gradeBonusIp, earnedIp }
            ),
        });
    } catch (error) {
        console.error("Complete Treasurer Game Error:", error);

        return res.status(500).json({
            message: "ไม่สามารถจบเกม Treasurer ได้",
            error: error.message,
        });
    }
};

// =====================================================
// Get Final Level Data
// ใช้สำหรับดึงข้อมูลเกม FinalLevel จาก Database
// ยังไม่เกี่ยวกับประวัติการเล่น (อ่านอย่างเดียว ไม่มีประเด็นเรื่องความ
// น่าเชื่อถือของข้อมูล — ไม่ได้แก้ไขส่วนนี้)
// =====================================================
exports.getFinalLevelData = async (req, res) => {
    try {
        const levelId = FINAL_LEVEL_ID;

        // =====================================================
        // 1. ตรวจสอบ Level
        // =====================================================
        const level = await prisma.level.findUnique({
            where: {
                level_id: levelId,
            },
            select: {
                level_id: true,
                unit_id: true,
                title: true,
                is_final: true,
            },
        });

        if (!level) {
            return res.status(404).json({
                message: "ไม่พบ FinalLevel",
            });
        }

        if (!level.is_final) {
            return res.status(400).json({
                message: "Level นี้ไม่ใช่ FinalLevel",
            });
        }

        // =====================================================
        // 2. Final Level Config
        // =====================================================
        const configResult = await prisma.$queryRaw`
            SELECT
                id,
                level_id,
                start_budget,
                min_reserve,
                limit_time
            FROM final_level_config
            WHERE level_id = ${levelId}
            LIMIT 1
        `;

        if (configResult.length === 0) {
            return res.status(404).json({
                message: "ยังไม่มีข้อมูล FinalLevel Config",
            });
        }

        const config = configResult[0];

        // =====================================================
        // 3. Category Budgets
        // =====================================================
        const categoryBudgets = await prisma.$queryRaw`
            SELECT
                id,
                category,
                budget
            FROM final_level_category_budgets
            WHERE config_id = ${config.id}
            ORDER BY id
        `;

        // =====================================================
        // 4. Items
        // =====================================================
        const items = await prisma.$queryRaw`
            SELECT
                i.items_id AS item_id,
                i.name,
                i.description,
                i.image,
                i.category,
                i.price,
                it.code AS item_type,
                li.quantity,
                li.is_required
            FROM level_items li
            INNER JOIN items i
                ON i.items_id = li.item_id
            INNER JOIN item_types it
                ON it.id = li.item_type_id
            WHERE li.level_id = ${levelId}
              AND it.code IN ('need', 'want')
            ORDER BY li.id
        `;

        if (items.length === 0) {
            return res.status(404).json({
                message: "FinalLevel ยังไม่มี Items",
            });
        }

        // =====================================================
        // 5. Random Events
        // =====================================================
        const events = await prisma.$queryRaw`
            SELECT
                event_id,
                event_key,
                title,
                description,
                event_order,
                is_active
            FROM final_level_events
            WHERE level_id = ${levelId}
              AND is_active = TRUE
            ORDER BY event_order
        `;

        // =====================================================
        // 6. Event Choices
        // =====================================================
        const choices = await prisma.$queryRaw`
            SELECT
                c.choice_id,
                c.event_id,
                c.choice_key,
                c.choice_text,
                c.money_change,
                c.score_change,
                c.missing_receipt,
                c.unnecessary_purchase,
                c.recover_receipt,
                c.remove_need_item_id,
                c.feedback
            FROM final_level_event_choices c
            INNER JOIN final_level_events e
                ON e.event_id = c.event_id
            WHERE e.level_id = ${levelId}
              AND e.is_active = TRUE
            ORDER BY e.event_order, c.choice_id
        `;

        // =====================================================
        // 7. รวม Choices เข้าแต่ละ Event
        // =====================================================
        const formattedEvents = events.map((event) => ({
            event_id: event.event_id,
            event_key: event.event_key,
            title: event.title,
            description: event.description,
            event_order: event.event_order,
            choices: choices
                .filter(
                    (choice) =>
                        choice.event_id === event.event_id
                )
                .map((choice) => ({
                    choice_id: choice.choice_id,
                    choice_key: choice.choice_key,
                    choice_text: choice.choice_text,
                    money_change: choice.money_change,
                    score_change: choice.score_change,
                    missing_receipt:
                        choice.missing_receipt,
                    unnecessary_purchase:
                        choice.unnecessary_purchase,
                    recover_receipt:
                        choice.recover_receipt,
                    remove_need_item_id:
                        choice.remove_need_item_id,
                    feedback: choice.feedback,
                })),
        }));

        // =====================================================
        // 8. Response
        // =====================================================
        return res.status(200).json({
            message: "ดึงข้อมูล FinalLevel สำเร็จ",
            data: {
                level: {
                    level_id: level.level_id,
                    unit_id: level.unit_id,
                    title: level.title,
                    is_final: level.is_final,
                },

                config: {
                    start_budget: config.start_budget,
                    min_reserve: config.min_reserve,
                    limit_time: config.limit_time,
                },

                category_budgets: categoryBudgets.map(
                    (item) => ({
                        id: item.id,
                        category: item.category,
                        budget: item.budget,
                    })
                ),

                items: items.map((item) => ({
                    item_id: item.item_id,
                    name: item.name,
                    description: item.description,
                    image: item.image,
                    category: item.category,
                    price: item.price,
                    item_type: item.item_type,
                    quantity: item.quantity,
                    is_required: item.is_required,
                })),

                events: formattedEvents,
            },
        });
    } catch (error) {
        console.error(
            "Get Final Level Data Error:",
            error
        );

        return res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงข้อมูล FinalLevel",
            error: error.message,
        });
    }
};