const prisma = require("../lib/prisma");

// ============================================================
// gamePlayService.js
// ============================================================
//
// Logic ของ Unit 4 Level 1 : Slip Hunt (จับสลิปปลอม)
//          Unit 4 Level 2 : Slot (กับดักพนัน)
//          Unit 4 Level 3 : Firewall Defender
//          Unit 5 Level 1 : ตามหาคำจากคำใบ้
//          Unit 5 Level 2 : จัดสรรงบประมาณให้เมือง
//          Unit 5 Level 3 : ตัดสินใจเพื่อประชาชน
//          และ Unit 6 Level 1 : รับมือวิกฤตในโรงเรียน
// ที่ gamePlayController ใช้ตอน startGame / completeGame
//
// หน้าที่ของไฟล์นี้: คำนวณอย่างเดียว (นับคำตอบ + ตัดสินผล + IP)
// ส่วนการบันทึก game_play_history / Progress / IP รวม ยังอยู่ใน
// controller เหมือน Level อื่น ๆ เพื่อใช้ helper ชุดเดียวกัน
// (recalcIntegrityPoints, saveLevelProgress)
//
// คำตอบแต่ละใบถูกบันทึกลง game_play_slip_hunt ผ่าน
// POST /api/slip-hunt/answer (slipHuntService.recordSlipHuntAnswer)
// ============================================================

// ------------------------------------------------------------
// ค่าคงที่ (แก้ตรงนี้จุดเดียว)
// ------------------------------------------------------------

// level_id ของ Unit 4 Level 1 (ตรงกับ /api/slips/level/11 ใน Game.jsx)
const SLIP_HUNT_LEVEL_ID = 11;

// 1 รอบมีสลิป 5 ใบเสมอ
const SLIP_HUNT_TOTAL_SLIPS = 5;

// ตอบถูกอย่างน้อยกี่ใบถึงนับว่า "ผ่าน" (ปลดล็อก Level ถัดไป)
const SLIP_HUNT_PASS_SCORE = 3;

// กติกา IP : ตอบถูกได้ใบละ 50 IP (ไม่ขึ้นกับ PASS/FAIL)
//   ถูก 0 ใบ → 0 IP
//   ถูก 3 ใบ → 150 IP
//   ถูก 5 ใบ → 250 IP (สูงสุด)
// PASS/FAIL ใช้แค่ตัดสินปลดล็อก Level ถัดไป (ถูก >= 3)
// ถ้าอยากให้ PERFECT ได้โบนัสเพิ่ม ใส่ PERFECT_BONUS ได้เลย
const SLIP_HUNT_IP = {
    PER_CORRECT: 50,
    PERFECT_BONUS: 0,
};

// ------------------------------------------------------------
// Helper
// ------------------------------------------------------------

const isSlipHuntLevel = (levelId) =>
    Number(levelId) === SLIP_HUNT_LEVEL_ID;

// ============================================================
// นับคำตอบของรอบนี้จาก game_play_slip_hunt
// ============================================================
//
// ใช้ $queryRaw เพราะตาราง game_play_slip_hunt สร้างด้วย SQL
// (อาจยังไม่มี model ใน schema.prisma)
// ::int เพื่อให้ได้ number ไม่ใช่ BigInt
// ============================================================

const getSlipHuntAnswerStats = async (playId) => {
    const rows = await prisma.$queryRaw`
        SELECT
            COUNT(*)::int                                   AS answered,
            COUNT(*) FILTER (WHERE is_correct = true)::int  AS correct,
            COUNT(*) FILTER (WHERE is_correct = false)::int AS wrong
        FROM game_play_slip_hunt
        WHERE play_id = ${Number(playId)}
    `;

    const row = rows?.[0] ?? {};

    return {
        answered: row.answered ?? 0,
        correct: row.correct ?? 0,
        wrong: row.wrong ?? 0,
        total: SLIP_HUNT_TOTAL_SLIPS,
    };
};

// ============================================================
// ตัดสินผล + คำนวณ IP
// ============================================================

const calcSlipHuntResult = (correctCount) => {
    const correct = Number(correctCount) || 0;

    const isPerfect = correct === SLIP_HUNT_TOTAL_SLIPS;
    const isPass = correct >= SLIP_HUNT_PASS_SCORE;

    const status = isPerfect
        ? "PERFECT"
        : isPass
            ? "PASS"
            : "FAIL";

    // ได้ IP ทุกใบที่ถูก แม้รอบนั้นจะ FAIL
    const answerIP = correct * SLIP_HUNT_IP.PER_CORRECT;

    const perfectBonusIP = isPerfect
        ? SLIP_HUNT_IP.PERFECT_BONUS
        : 0;

    return {
        status,
        isPass,
        isPerfect,
        answerIP,
        perfectBonusIP,
        earnedIP: answerIP + perfectBonusIP,
    };
};

// ============================================================
// ดึงคำตอบรายใบ (ส่งกลับไปพร้อมผล completeGame)
// ============================================================

const getSlipHuntAnswers = async (playId) => {
    return prisma.$queryRaw`
        SELECT
            gsh.slip_order,
            gsh.slip_id,
            gsh.player_choice,
            gsh.is_correct,
            s.answer AS correct_answer,
            s.clue
        FROM game_play_slip_hunt gsh
        LEFT JOIN slip_details s ON s.items_id = gsh.slip_id
        WHERE gsh.play_id = ${Number(playId)}
        ORDER BY gsh.slip_order ASC
    `;
};

// ============================================================
// Unit 4 Level 2 : Slot (กับดักพนัน)
// ============================================================
//
// ตู้สล็อต "ถูกล็อกผล" ไว้เพื่อสอนกลไกของเว็บพนัน:
//   หมุนครั้งที่ 1 → 💎💎💎 ชนะ 5 เท่า (เหยื่อล่อ)
//   หมุนครั้งที่ 2 → 7️⃣7️⃣7️⃣ ชนะ 3 เท่า (สร้างความหวัง)
//   ครั้งต่อ ๆ ไป → เกือบชนะแต่แพ้ตลอด จนเครดิตหมด
//
// Backend เป็นคนตัดสินผล + คุมเครดิต (Frontend ส่งมาแค่ bet)
// ทุกครั้งที่หมุนบันทึก 1 แถวใน game_play_slot_rounds
// (ตารางสร้างด้วย SQL → ใช้ $queryRaw เหมือน game_play_slip_hunt)
//
// จบบท = เครดิตหมด (เหลือน้อยกว่าเดิมพันขั้นต่ำ) → PASS + SLOT_PASS_IP
// ============================================================

// level_id ของ Unit 4 Level 2 (ด่านถัดจาก Slip Hunt)
const SLOT_LEVEL_ID = 12;

const SLOT_START_BALANCE = 1500;
const SLOT_BETS = [100, 500, 1000];
const SLOT_MIN_BET = Math.min(...SLOT_BETS);

// จบบทนี้ได้ IP เท่าไร (ไม่มีถูก/ผิด — ได้เมื่อเล่นจนเห็นกลลวงครบ)
const SLOT_PASS_IP = 150;

// ผลที่ถูกล็อกไว้ตามลำดับการหมุน (สัญลักษณ์คั่นด้วยช่องว่าง)
const SLOT_SCRIPT = [
    { symbols: ["💎", "💎", "💎"], multiplier: 5 },
    { symbols: ["7️⃣", "7️⃣", "7️⃣"], multiplier: 3 },
];

// "เกือบชนะ" — สลับหน้าตาไปเรื่อย ๆ ให้ดูเหมือนสุ่มจริง
const SLOT_NEAR_MISS = [
    ["🍒", "🔔", "🍋"],
    ["💎", "💎", "🍋"],
    ["7️⃣", "7️⃣", "🔔"],
    ["🍒", "🍒", "💎"],
    ["🔔", "7️⃣", "7️⃣"],
];

const isSlotLevel = (levelId) =>
    Number(levelId) === SLOT_LEVEL_ID;

const getSlotOutcome = (spinNo) =>
    SLOT_SCRIPT[spinNo - 1] || {
        symbols:
            SLOT_NEAR_MISS[
            (spinNo - SLOT_SCRIPT.length - 1) % SLOT_NEAR_MISS.length
            ],
        multiplier: 0,
    };

const toSlotRound = (row) => ({
    spin_no: row.spin_no,
    bet: row.bet,
    balance_before: row.balance_before,
    reward: row.reward,
    balance_after: row.balance_after,
    symbols: String(row.result_symbols || "").split(" ").filter(Boolean),
    created_at: row.created_at,
});

// ประวัติการหมุนทั้งหมดของรอบนี้
const getSlotRounds = async (playId) => {
    const rows = await prisma.$queryRaw`
        SELECT spin_no, bet, balance_before, reward, balance_after,
               result_symbols, created_at
        FROM game_play_slot_rounds
        WHERE play_id = ${Number(playId)}
        ORDER BY spin_no ASC
    `;

    return rows.map(toSlotRound);
};

// สรุปรอบนี้ (ใช้ตอน complete และหน้า Result/แดชบอร์ด)
const getSlotSummary = async (playId) => {
    const rounds = await getSlotRounds(playId);
    const last = rounds[rounds.length - 1];
    const balance = last ? last.balance_after : SLOT_START_BALANCE;

    return {
        spins: rounds.length,
        start_balance: SLOT_START_BALANCE,
        balance,
        peak_balance: Math.max(
            SLOT_START_BALANCE,
            ...rounds.map((r) => r.balance_after)
        ),
        total_bet: rounds.reduce((sum, r) => sum + r.bet, 0),
        total_reward: rounds.reduce((sum, r) => sum + r.reward, 0),
        is_broke: balance < SLOT_MIN_BET,
        rounds,
    };
};

/**
 * หมุน 1 ครั้ง: ตรวจ bet + เครดิต → ตัดสินผล → บันทึก
 * คืน { ok: true, round, is_broke } หรือ { ok: false, status, message }
 * (ตรวจสิทธิ์/สถานะของ play ที่ controller ก่อนเรียก)
 */
const recordSlotSpin = async (playId, bet) => {
    const amount = Number(bet);

    if (!SLOT_BETS.includes(amount)) {
        return {
            ok: false,
            status: 400,
            message: `เดิมพันต้องเป็น ${SLOT_BETS.join(" / ")} เท่านั้น`,
        };
    }

    const last = await prisma.$queryRaw`
        SELECT spin_no, balance_after
        FROM game_play_slot_rounds
        WHERE play_id = ${Number(playId)}
        ORDER BY spin_no DESC
        LIMIT 1
    `;

    const spinNo = (last[0]?.spin_no ?? 0) + 1;
    const balanceBefore = last[0]?.balance_after ?? SLOT_START_BALANCE;

    if (amount > balanceBefore) {
        return {
            ok: false,
            status: 400,
            message: "เครดิตไม่พอสำหรับเดิมพันนี้",
        };
    }

    const outcome = getSlotOutcome(spinNo);
    const reward = amount * outcome.multiplier;
    const balanceAfter = balanceBefore - amount + reward;

    try {
        const inserted = await prisma.$queryRaw`
            INSERT INTO game_play_slot_rounds
                (play_id, spin_no, bet, balance_before, reward,
                 balance_after, result_symbols)
            VALUES
                (${Number(playId)}, ${spinNo}, ${amount}, ${balanceBefore},
                 ${reward}, ${balanceAfter}, ${outcome.symbols.join(" ")})
            RETURNING spin_no, bet, balance_before, reward, balance_after,
                      result_symbols, created_at
        `;

        return {
            ok: true,
            round: toSlotRound(inserted[0]),
            is_broke: balanceAfter < SLOT_MIN_BET,
        };
    } catch (error) {
        // กดหมุนรัว ๆ จนยิงพร้อมกัน → ชน UNIQUE (play_id, spin_no)
        if (String(error.message).includes("uq_slot_round_spin") ||
            String(error.message).includes("23505")) {
            return {
                ok: false,
                status: 409,
                message: "กำลังหมุนอยู่ กรุณารอสักครู่",
            };
        }

        throw error;
    }
};

// ============================================================
// Unit 4 Level 3 : Firewall Defender (ภารกิจสุดท้าย)
// ============================================================
//
// คำถาม/ตัวเลือกเก็บในตาราง question / choice (เหมือน Unit 1-2)
// คำตอบบันทึกผ่าน POST /api/game-play/answer → game_play_answers
//
// กติกา (ตามต้นฉบับของเพื่อน):
//   Firewall มี 4 หัวใจ — ตอบผิดครบ 4 ครั้ง = จบเกมทันที
//   คะแนน = ข้อถูก × 10 (เต็ม 100)
//   ถูก 10/10 → PERFECT / ถูก >= 6 → PASS / น้อยกว่า → FAIL
//   IP = ผลรวม choice.ip_reward ของข้อที่ตอบ (ข้อถูก = 16 → เต็ม 160)
//        ได้ทุกข้อที่ถูก แม้รอบนั้นจะ FAIL (แนวเดียวกับ Slip Hunt)
// ============================================================

const FIREWALL_LEVEL_ID = 13;
const FIREWALL_HEARTS = 4;
const FIREWALL_PASS_CORRECT = 6;

const isFirewallLevel = (levelId) =>
    Number(levelId) === FIREWALL_LEVEL_ID;

// คำถาม + ตัวเลือก (ไม่ส่ง is_correct / ip_reward ไปหน้าเว็บ)
const getFirewallQuestions = async (levelId) => {
    const questions = await prisma.question.findMany({
        where: { level_id: Number(levelId) },
        orderBy: { question_order: "asc" },
        select: {
            question_id: true,
            question_order: true,
            question_text: true,
            choice: {
                orderBy: { choice_key: "asc" },
                select: {
                    choice_id: true,
                    choice_key: true,
                    choice_text: true,
                },
            },
        },
    });

    return questions.map((q) => ({
        question_id: q.question_id,
        question_order: q.question_order,
        question_text: q.question_text,
        choices: q.choice.map((c) => ({
            choice_id: c.choice_id,
            choice_key: String(c.choice_key).trim(),
            choice_text: c.choice_text,
        })),
    }));
};

// นับคำตอบของรอบนี้จาก game_play_answers
const getFirewallStats = async (playId, levelId) => {
    const [total, answers] = await Promise.all([
        prisma.question.count({ where: { level_id: Number(levelId) } }),
        prisma.game_play_answers.findMany({
            where: { play_id: Number(playId) },
            select: { is_correct: true, ip_reward: true },
        }),
    ]);

    const correct = answers.filter((a) => a.is_correct === true).length;
    const wrong = answers.filter((a) => a.is_correct === false).length;

    return {
        total,
        answered: answers.length,
        correct,
        wrong,
        answerIP: answers.reduce((sum, a) => sum + (a.ip_reward ?? 0), 0),
        heartsLeft: Math.max(0, FIREWALL_HEARTS - wrong),
        isBroken: wrong >= FIREWALL_HEARTS,
    };
};

const calcFirewallResult = (stats) => {
    const isPerfect = stats.total > 0 && stats.correct === stats.total;
    const isPass = stats.correct >= FIREWALL_PASS_CORRECT;

    return {
        status: isPerfect ? "PERFECT" : isPass ? "PASS" : "FAIL",
        isPerfect,
        isPass,
        earnedIP: stats.answerIP,
    };
};

// ============================================================
// Unit 5 Level 1 : ตามหาคำจากคำใบ้ (Word Clue)
// ============================================================
//
// โจทย์อยู่ในตาราง level_words (คำตอบ + คำใบ้ + จำนวนตัวที่เปิดให้)
// ทุกครั้งที่กด Enter บันทึก 1 แถวใน game_play_word_answers
// (ตารางสร้างด้วย SQL → ใช้ $queryRaw เหมือน slot / slip hunt)
//
// กติกา:
//   ต้องหาคำครบทุกคำถึงจะจบด่าน (ตามต้นฉบับของเพื่อน)
//   ไม่เคยพิมพ์ผิดเลย → PERFECT / เคยผิด → PASS
//   IP = ผลรวม ip_reward ของคำที่หาเจอ (ตอนนี้คำละ 10 → เต็ม 60)
//
// แบ่งตัวอักษรไทยด้วย Intl.Segmenter (grapheme) — ตรงกับ WordCard.jsx
// เช่น "ใต้โต๊ะ" = ใ|ต้|โ|ต๊|ะ = 5 ช่อง
// ============================================================

const WORD_CLUE_LEVEL_ID = 14;
const WORD_MAX_LENGTH = 100;
const WORD_CLUE_IP = 280;

const thaiSegmenter =
    typeof Intl !== "undefined" && Intl.Segmenter
        ? new Intl.Segmenter("th", { granularity: "grapheme" })
        : null;

const splitGraphemes = (value) =>
    thaiSegmenter
        ? Array.from(thaiSegmenter.segment(String(value)), (s) => s.segment)
        : Array.from(String(value));

// ตัดช่องว่างทั้งหมด + normalize ให้พิมพ์จากคีย์บอร์ดต่างกันยังเทียบได้
const normalizeWord = (value) =>
    String(value ?? "")
        .normalize("NFC")
        .replace(/\s+/g, "");

const isWordClueLevel = (levelId) =>
    Number(levelId) === WORD_CLUE_LEVEL_ID;

const getLevelWords = async (levelId) =>
    prisma.$queryRaw`
        SELECT word_id, word_order, answer, clue, revealed_count, ip_reward
        FROM level_words
        WHERE level_id = ${Number(levelId)}
          AND is_active = true
        ORDER BY word_order ASC
    `;

// โจทย์สำหรับส่งไปหน้าเว็บ (ไม่มีคำตอบเต็ม — มีแค่ตัวที่เปิดให้เห็น)
const getWordPuzzles = async (levelId) => {
    const words = await getLevelWords(levelId);

    return words.map((w) => {
        const chars = splitGraphemes(w.answer);
        const revealed = Math.min(w.revealed_count, chars.length);

        return {
            word_id: w.word_id,
            word_order: w.word_order,
            clue: w.clue,
            total_chars: chars.length,
            revealed_chars: chars.slice(0, revealed),
        };
    });
};

// คำที่ตอบถูกแล้วในรอบนี้
const getSolvedWordIds = async (playId) => {
    const rows = await prisma.$queryRaw`
        SELECT word_id
        FROM game_play_word_answers
        WHERE play_id = ${Number(playId)} AND is_correct = true
    `;
    return rows.map((r) => r.word_id);
};

/**
 * ตรวจ + บันทึก 1 ครั้ง (กด Enter)
 * ยอมรับทั้ง "พิมพ์ทั้งคำ" และ "พิมพ์เฉพาะตัวที่เหลือ" (เหมือนต้นฉบับ)
 * คืน { ok: true, ... } หรือ { ok: false, status, message }
 */
const recordWordAnswer = async (play, wordId, text) => {
    const typed = normalizeWord(text);

    if (!typed) {
        return { ok: false, status: 400, message: "กรุณาพิมพ์คำตอบ" };
    }

    if (typed.length > WORD_MAX_LENGTH) {
        return { ok: false, status: 400, message: "คำตอบยาวเกินไป" };
    }

    const words = await getLevelWords(play.level_id);
    const word = words.find((w) => w.word_id === Number(wordId));

    if (!word) {
        return { ok: false, status: 404, message: "ไม่พบคำนี้ในด่าน" };
    }

    const solved = await getSolvedWordIds(play.play_id);

    if (solved.includes(word.word_id)) {
        return { ok: false, status: 409, message: "คำนี้ตอบถูกไปแล้ว" };
    }

    const answer = normalizeWord(word.answer);
    const remaining = splitGraphemes(answer)
        .slice(word.revealed_count)
        .join("");

    const isCorrect = typed === answer || typed === remaining;

    const attempts = await prisma.$queryRaw`
        SELECT COALESCE(MAX(attempt_no), 0)::int AS last
        FROM game_play_word_answers
        WHERE play_id = ${play.play_id} AND word_id = ${word.word_id}
    `;
    const attemptNo = (attempts[0]?.last ?? 0) + 1;

    try {
        await prisma.$executeRaw`
            INSERT INTO game_play_word_answers
                (play_id, word_id, attempt_no, typed_text, is_correct)
            VALUES
                (${play.play_id}, ${word.word_id}, ${attemptNo},
                 ${typed}, ${isCorrect})
        `;
    } catch (error) {
        // กด Enter รัว ๆ → ชน UNIQUE (attempt_no ซ้ำ / ถูกซ้ำ)
        if (/uq_word_attempt|uq_word_correct_once|23505/.test(String(error.message))) {
            return { ok: false, status: 409, message: "กำลังตรวจคำตอบ กรุณารอสักครู่" };
        }
        throw error;
    }

    const solvedCount = solved.length + (isCorrect ? 1 : 0);

    return {
        ok: true,
        word_id: word.word_id,
        is_correct: isCorrect,
        attempt_no: attemptNo,
        solved_count: solvedCount,
        total_words: words.length,
        all_solved: solvedCount >= words.length,
    };
};

// สรุปรอบนี้ (ใช้ตอน completeGame)
const getWordStats = async (playId, levelId) => {
    const [words, rows] = await Promise.all([
        getLevelWords(levelId),
        prisma.$queryRaw`
            SELECT word_id, is_correct
            FROM game_play_word_answers
            WHERE play_id = ${Number(playId)}
        `,
    ]);

    const solvedIds = new Set(
        rows.filter((r) => r.is_correct).map((r) => r.word_id)
    );

    const wrong = rows.filter((r) => !r.is_correct).length;

    return {
        total: words.length,
        solved: solvedIds.size,
        wrong,
        attempts: rows.length,
        answerIP: words
            .filter((w) => solvedIds.has(w.word_id))
            .reduce((sum, w) => sum + (w.ip_reward ?? 0), 0),
        maxIP: words.reduce((sum, w) => sum + (w.ip_reward ?? 0), 0),
    };
};

const calcWordResult = (stats) => {
    const isPass = stats.total > 0 && stats.solved >= stats.total;
    const isPerfect = isPass && stats.wrong === 0;

    return {
        status: isPerfect ? "PERFECT" : isPass ? "PASS" : "FAIL",
        isPass,
        isPerfect,
        earnedIP: isPass ? WORD_CLUE_IP : 0,
    };
};

// ============================================================
// Unit 5 Level 2 : จัดสรรงบประมาณให้เมือง (Budget Allocation)
// ============================================================
//
// ผู้เล่นแบ่งงบ 100 เหรียญ (ครั้งละ 5) ให้ 6 ด้าน
// บันทึกการจัดสรรสุดท้ายใน game_play_budget_allocations (1 แถว/ด้าน)
// แล้ว backend คิดคะแนนเอง (สูตรเดียวกับ ResultPopup เดิมของเพื่อน):
//   ความสุข   = 100 - (ส่วนเบี่ยงเบนมาตรฐานของงบ × 2)   (ยิ่งกระจายยิ่งดี)
//   ต้องใช้งบครบ 100 ก่อนสรุปผล (BUDGET_REQUIRE_FULL)
//   ความครอบคลุม = ใช้งบ >= 80% → 20 / ไม่งั้นตามสัดส่วน (เต็ม 20)
//   คะแนน     = ความสุข × 0.8 + ความครอบคลุม            (เต็ม 100)
//   Rank S/A/B/C/D → IP 50/40/30/20/10 (ตาม hpReward เดิม)
// ไม่มีถูก/ผิด → จบแล้ว PASS เสมอ (Rank S = PERFECT)
// ============================================================

const BUDGET_LEVEL_ID = 15;
const BUDGET_TOTAL = 100;
const BUDGET_STEP = 5;
const BUDGET_CATEGORIES = ["school", "hospital", "road", "fire", "park", "water"];

// ต้องใช้งบให้ครบก่อนสรุปผล (กันกดสรุปทั้งที่ยังไม่จัดสรร แล้วได้ Rank A —
// สูตรเดิมคิดความสุขจากค่าเฉลี่ยของงบที่ "ใช้ไป" จึงได้ 100% ตอนงบเป็น 0 หมด)
const BUDGET_REQUIRE_FULL = true;

const BUDGET_RANKS = [
    { min: 90, rank: "S", ip: 250 },
    { min: 80, rank: "A", ip: 200 },
    { min: 70, rank: "B", ip: 150 },
    { min: 0, rank: "C", ip: 100 },
];

const isBudgetLevel = (levelId) =>
    Number(levelId) === BUDGET_LEVEL_ID;

// ตรวจงบที่ส่งมา → { ok, budgets } หรือ { ok: false, message }
const validateBudgets = (input) => {
    if (!input || typeof input !== "object") {
        return { ok: false, message: "กรุณาส่งข้อมูลงบประมาณ" };
    }

    const budgets = {};

    for (const code of BUDGET_CATEGORIES) {
        const amount = Number(input[code] ?? 0);

        if (!Number.isInteger(amount) || amount < 0 || amount % BUDGET_STEP !== 0) {
            return {
                ok: false,
                message: `งบของ ${code} ต้องเป็นจำนวนเต็มทีละ ${BUDGET_STEP}`,
            };
        }

        budgets[code] = amount;
    }

    const used = Object.values(budgets).reduce((sum, v) => sum + v, 0);

    if (used > BUDGET_TOTAL) {
        return { ok: false, message: `ใช้งบเกิน ${BUDGET_TOTAL} เหรียญ` };
    }

    if (BUDGET_REQUIRE_FULL && used < BUDGET_TOTAL) {
        return {
            ok: false,
            message: `ต้องจัดสรรงบให้ครบ ${BUDGET_TOTAL} เหรียญก่อนสรุปผล (เหลืออีก ${BUDGET_TOTAL - used})`,
        };
    }

    return { ok: true, budgets };
};

// บันทึก/แทนที่การจัดสรรของรอบนี้ (ส่งซ้ำได้จนกว่าจะจบเกม)
const saveBudgetAllocations = async (playId, budgets) => {
    await prisma.$transaction(
        BUDGET_CATEGORIES.map(
            (code) => prisma.$executeRaw`
                INSERT INTO game_play_budget_allocations
                    (play_id, category_code, amount)
                VALUES (${Number(playId)}, ${code}, ${budgets[code]})
                ON CONFLICT (play_id, category_code)
                DO UPDATE SET amount = EXCLUDED.amount, updated_at = now()
            `
        )
    );
};

const getBudgetAllocations = async (playId) => {
    const rows = await prisma.$queryRaw`
        SELECT category_code, amount
        FROM game_play_budget_allocations
        WHERE play_id = ${Number(playId)}
    `;

    if (rows.length === 0) return null;

    const budgets = Object.fromEntries(BUDGET_CATEGORIES.map((c) => [c, 0]));
    for (const r of rows) budgets[r.category_code] = r.amount;
    return budgets;
};

const calcBudgetResult = (budgets) => {
    const values = BUDGET_CATEGORIES.map((c) => budgets[c] ?? 0);
    const used = values.reduce((sum, v) => sum + v, 0);
    // เทียบกับ "ส่วนแบ่งเท่า ๆ กันของงบทั้งหมด" (ไม่ใช่ของงบที่ใช้ไป)
    const avg = BUDGET_TOTAL / values.length;
    const variance =
        values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const happiness = Math.min(100, Math.round(Math.max(0, 100 - stdDev * 2)));
    const coverage =
        used >= BUDGET_TOTAL * 0.8
            ? 20
            : Math.round((used / BUDGET_TOTAL) * 20);
    const score = Math.min(100, Math.round(happiness * 0.8 + coverage));

    const tier = BUDGET_RANKS.find((r) => score >= r.min);

    return {
        used,
        remaining: BUDGET_TOTAL - used,
        happiness,
        score,
        rank: tier.rank,
        earnedIP: tier.ip,
        status: tier.rank === "S" ? "PERFECT" : "PASS",
        isPass: true,
        isPerfect: tier.rank === "S",
    };
};

// ============================================================
// Unit 5 Level 3 : ตัดสินใจเพื่อประชาชน (Integrity Inspector)
// ============================================================
//
// โจทย์อยู่ใน level_projects (เอกสารโครงการ + correct_action + สินบน)
// ทุกการตัดสินใจบันทึก 1 แถวใน game_play_project_decisions
//
// กติกาคะแนน (ตามต้นฉบับของเพื่อน — คิดที่ backend ทั้งหมด):
//   อนุมัติถูก +10 / ปฏิเสธถูก +15
//   อนุมัติโครงการมีพิรุธ -20 (Integrity -15) / ปฏิเสธโครงการดี -10
//   รับสินบน -15 (Integrity -20) นับเป็นผิดเสมอ
//   คะแนนไม่ติดลบ (สะสมทีละข้อ) / Integrity 0-100 / คะแนนเต็ม 100
//   Rank: S (>=90 และ Integrity >=85) / A >=75 / B >=55 / C >=35 / D
//   IP ตาม Rank: S 50 / A 40 / B 30 / C 20 / D 10 (แนวเดียวกับด่าน 2)
//   จบได้ 2 ทาง: ตัดสินครบทุกโครงการ / หมดเวลา (is_timeout)
//   ไม่มีตก (ต้นฉบับให้ไปด่านต่อได้เสมอ) — Rank S = PERFECT
// ============================================================

const INSPECTOR_LEVEL_ID = 16;
const INSPECTOR_SECONDS = 120;

const INSPECTOR_RANKS = [
    { rank: "S", ip: 200, test: (s) => s >= 7 },
    { rank: "A", ip: 170, test: (s) => s >= 5 },
    { rank: "B", ip: 120, test: () => true },
];

const isInspectorLevel = (levelId) =>
    Number(levelId) === INSPECTOR_LEVEL_ID;

const getLevelProjects = async (levelId) =>
    prisma.$queryRaw`
        SELECT project_id, project_order, name, budget_text, price_estimate,
               contractor, documents, history, correct_action,
               has_bribe, bribe_amount, explanation
        FROM level_projects
        WHERE level_id = ${Number(levelId)} AND is_active = true
        ORDER BY project_order ASC
    `;

// เอกสารสำหรับส่งไปหน้าเว็บ (ไม่มี correct_action / explanation)
const getInspectorProjects = async (levelId) => {
    const projects = await getLevelProjects(levelId);

    return projects.map((p) => ({
        project_id: p.project_id,
        project_order: p.project_order,
        name: p.name,
        budget: p.budget_text,
        priceEstimate: p.price_estimate,
        contractor: p.contractor,
        documents: p.documents,
        history: p.history,
        bribe: p.has_bribe,
        bribeAmount: p.bribe_amount,
    }));
};

// คะแนนของการตัดสิน 1 ครั้ง
const judgeProject = (project, action, tookBribe) => {
    const correct = project.correct_action === action;

    if (tookBribe) {
        return { isCorrect: false, scoreDelta: -15, integrityDelta: -20, note: "รับสินบน" };
    }
    if (action === "approve" && correct) {
        return { isCorrect: true, scoreDelta: 10, integrityDelta: 0, note: "อนุมัติถูกต้อง" };
    }
    if (action === "reject" && correct) {
        return { isCorrect: true, scoreDelta: 15, integrityDelta: 0, note: "ปฏิเสธโครงการโกงได้ถูกต้อง" };
    }
    if (action === "approve") {
        return { isCorrect: false, scoreDelta: -20, integrityDelta: -15, note: "อนุมัติโครงการที่มีพิรุธ" };
    }
    return { isCorrect: false, scoreDelta: -10, integrityDelta: 0, note: "ปฏิเสธโครงการที่ดี" };
};

const getProjectDecisions = async (playId) =>
    prisma.$queryRaw`
        SELECT d.project_id, d.decision_order, d.action, d.took_bribe,
               d.refused_bribe, d.is_correct, d.score_delta, d.integrity_delta,
               p.name, p.correct_action, p.has_bribe, p.explanation,
               p.budget_text, p.price_estimate
        FROM game_play_project_decisions d
        JOIN level_projects p ON p.project_id = d.project_id
        WHERE d.play_id = ${Number(playId)}
        ORDER BY d.decision_order ASC
    `;

// สะสมคะแนนตามลำดับที่ตัดสิน (คะแนนไม่ติดลบระหว่างทาง เหมือนต้นฉบับ)
const sumInspector = (decisions) => {
    let score = 0;
    let integrity = 100;

    for (const d of decisions) {
        score = Math.max(0, score + d.score_delta);
        integrity = Math.min(100, Math.max(0, integrity + d.integrity_delta));
    }

    return {
        score: Math.min(100, score),
        integrity,
        correct: decisions.filter((d) => d.is_correct).length,
        wrong: decisions.filter((d) => !d.is_correct).length,
        decided: decisions.length,
    };
};

/**
 * ตัดสิน 1 โครงการ → คืน { ok, ... } หรือ { ok: false, status, message }
 */
const recordProjectDecision = async (play, projectId, action, tookBribe, refusedBribe) => {
    if (!["approve", "reject"].includes(action)) {
        return { ok: false, status: 400, message: 'action ต้องเป็น "approve" หรือ "reject"' };
    }

    const projects = await getLevelProjects(play.level_id);
    const project = projects.find((p) => p.project_id === Number(projectId));

    if (!project) {
        return { ok: false, status: 404, message: "ไม่พบโครงการนี้ในด่าน" };
    }

    const bribeTaken = Boolean(tookBribe) && project.has_bribe;

    // รับสินบน = อนุมัติเสมอ
    if (bribeTaken && action !== "approve") {
        return { ok: false, status: 400, message: "รับสินบนแล้วต้องเป็นการอนุมัติ" };
    }

    const before = await getProjectDecisions(play.play_id);
    const judged = judgeProject(project, action, bribeTaken);

    try {
        await prisma.$executeRaw`
            INSERT INTO game_play_project_decisions
                (play_id, project_id, decision_order, action, took_bribe,
                 refused_bribe, is_correct, score_delta, integrity_delta)
            VALUES
                (${play.play_id}, ${project.project_id}, ${before.length + 1},
                 ${action}, ${bribeTaken},
                 ${Boolean(refusedBribe) && project.has_bribe && !bribeTaken},
                 ${judged.isCorrect}, ${judged.scoreDelta}, ${judged.integrityDelta})
        `;
    } catch (error) {
        if (/uq_project_decision|23505/.test(String(error.message))) {
            return { ok: false, status: 409, message: "ตัดสินโครงการนี้ไปแล้ว" };
        }
        throw error;
    }

    const totals = sumInspector([
        ...before,
        { ...judged, is_correct: judged.isCorrect, score_delta: judged.scoreDelta, integrity_delta: judged.integrityDelta },
    ]);

    return {
        ok: true,
        project_id: project.project_id,
        action,
        took_bribe: bribeTaken,
        is_correct: judged.isCorrect,
        score_delta: judged.scoreDelta,
        integrity_delta: judged.integrityDelta,
        note: judged.note,
        score: totals.score,
        integrity: totals.integrity,
        decided: totals.decided,
        total_projects: projects.length,
    };
};

const getInspectorStats = async (playId, levelId) => {
    const [projects, decisions] = await Promise.all([
        getLevelProjects(levelId),
        getProjectDecisions(playId),
    ]);

    return { total: projects.length, ...sumInspector(decisions) };
};

const calcInspectorResult = (stats) => {
    const tier = INSPECTOR_RANKS.find((r) => r.test(stats.correct));

    return {
        rank: tier.rank,
        earnedIP: tier.ip,
        status: tier.rank === "S" ? "PERFECT" : "PASS",
        isPass: true,
        isPerfect: tier.rank === "S",
    };
};

// ============================================================
// Unit 6 Level 1 : รับมือวิกฤตในโรงเรียน (Crisis Response)
// ============================================================
//
// โจทย์อยู่ใน level_crisis_events / level_crisis_choices
// หน้าเว็บสุ่มว่าเหตุการณ์ไหนเกิดที่ห้องไหน แต่คะแนนคิดที่ backend:
//   เลือกตัวเลือก / หลุดมือ / ครูเวรมาช่วย → game_play_crisis_responses
//   ข่าวปลอม / วันคุณธรรม / ครูเวรมาช่วย  → game_play_crisis_specials
//
// กติกา (ตามต้นฉบับของเพื่อน):
//   คะแนนสะสมไม่ติดลบ / Integrity 0-100 (เริ่ม 100) — เรียงตามเวลาที่เกิด
//   ข่าวปลอม Integrity -5 / วันคุณธรรม +10
//   ครูเวรมาช่วย = แก้เหตุการณ์แรกให้ด้วยตัวเลือกที่ Integrity สูงสุด
//   Rank: S (Integrity >= 90 และคะแนน >= 150) / A >= 110 / B >= 70 / C >= 30 / D
//   IP = คะแนนที่ได้ในรอบนั้น (ไม่มีเพดาน เกิน 100 ได้)
//   Rank ใช้แสดงผล + ตัดสิน PERFECT (Rank S) — ไม่มีตก
//
// กันโกง: เหตุการณ์พิเศษเกิดได้ไม่เกิน 1 ครั้งต่อ 12 วินาทีของเวลาเล่น
//         จำนวนเหตุการณ์ไม่เกินจำนวนวินาทีที่เล่น + 3
//         จบเกมได้เมื่อเล่นครบเวลา (CRISIS_SECONDS)
// ============================================================

const CRISIS_LEVEL_ORDER = 1; // Unit 6 ด่านที่ 1
const CRISIS_UNIT_ID = 6;
const CRISIS_SECONDS = 30;
const CRISIS_SPECIAL_INTERVAL = 12;

const CRISIS_SPECIALS = {
    fakeNews: { integrityDelta: -5 },
    virtueDay: { integrityDelta: 10 },
    teacherHelp: { integrityDelta: 0 },
};

const CRISIS_RANKS = [
    { rank: "S", test: (s, i) => i >= 90 && s >= 150 },
    { rank: "A", test: (s) => s >= 110 },
    { rank: "B", test: (s) => s >= 70 },
    { rank: "C", test: (s) => s >= 30 },
    { rank: "D", test: () => true },
];

// level_id ของด่านนี้ไม่ได้ hardcode — หาจาก unit 6 ลำดับ 1 (cache ไว้)
let crisisLevelIdCache = null;

const getCrisisLevelId = async () => {
    if (crisisLevelIdCache) return crisisLevelIdCache;

    const level = await prisma.level.findFirst({
        where: { unit_id: CRISIS_UNIT_ID, order_no: CRISIS_LEVEL_ORDER },
        select: { level_id: true },
    });

    crisisLevelIdCache = level?.level_id ?? null;
    return crisisLevelIdCache;
};

const isCrisisLevel = async (levelId) =>
    Number(levelId) === (await getCrisisLevelId());

// เหตุการณ์ + ตัวเลือก ส่งไปหน้าเว็บ (ไม่มีคะแนนของตัวเลือก)
const getCrisisEvents = async (levelId) => {
    const [events, choices] = await Promise.all([
        prisma.$queryRaw`
            SELECT event_id, event_code, location_code, title, description, time_limit
            FROM level_crisis_events
            WHERE level_id = ${Number(levelId)} AND is_active = true
            ORDER BY event_id ASC
        `,
        prisma.$queryRaw`
            SELECT c.choice_id, c.event_id, c.choice_order, c.choice_code,
                   c.label, c.icon_key
            FROM level_crisis_choices c
            JOIN level_crisis_events e ON e.event_id = c.event_id
            WHERE e.level_id = ${Number(levelId)} AND e.is_active = true
            ORDER BY c.event_id ASC, c.choice_order ASC
        `,
    ]);

    return events.map((e) => ({
        event_id: e.event_id,
        event_code: e.event_code,
        location_code: e.location_code,
        title: e.title,
        description: e.description,
        time_limit: e.time_limit,
        choices: choices
            .filter((c) => c.event_id === e.event_id)
            .map((c) => ({
                choice_id: c.choice_id,
                choice_code: c.choice_code,
                label: c.label,
                icon_key: c.icon_key,
            })),
    }));
};

// วินาทีที่เล่นไปแล้ว (นับจาก started_at)
const crisisElapsed = (play) =>
    Math.max(0, (Date.now() - new Date(play.started_at).getTime()) / 1000);

// เหตุการณ์ทั้งหมด (คะแนน + integrity) เรียงตามเวลาที่เกิดจริง
const getCrisisTimeline = async (playId) => {
    const [responses, specials] = await Promise.all([
        prisma.$queryRaw`
            SELECT r.response_id, r.spawn_no, r.outcome, r.integrity_delta,
                   r.score_delta, r.trust_delta, r.response_seconds,
                   r.responded_at AS at,
                   e.title, e.location_code, c.label AS choice_label, c.note,
                   e.timeout_note
            FROM game_play_crisis_responses r
            JOIN level_crisis_events e ON e.event_id = r.event_id
            LEFT JOIN level_crisis_choices c ON c.choice_id = r.choice_id
            WHERE r.play_id = ${Number(playId)}
        `,
        prisma.$queryRaw`
            SELECT special_id, special_code, integrity_delta, created_at AS at
            FROM game_play_crisis_specials
            WHERE play_id = ${Number(playId)}
        `,
    ]);

    return [
        ...responses.map((r) => ({ kind: "response", ...r })),
        ...specials.map((s) => ({ kind: "special", score_delta: 0, ...s })),
    ].sort((a, b) => new Date(a.at) - new Date(b.at));
};

const sumCrisis = (timeline) => {
    let score = 0;
    let integrity = 100;

    for (const t of timeline) {
        integrity = Math.min(100, Math.max(0, integrity + (t.integrity_delta || 0)));
        score = Math.max(0, score + (t.score_delta || 0));
    }

    const responses = timeline.filter((t) => t.kind === "response");

    return {
        score,
        integrity,
        helped: responses.filter((r) => r.outcome !== "timeout").length,
        missed: responses.filter((r) => r.outcome === "timeout").length,
        specials: timeline.filter((t) => t.kind === "special").length,
    };
};

const getCrisisTotals = async (playId) => sumCrisis(await getCrisisTimeline(playId));

// หาเหตุการณ์ + ตัวเลือกจาก DB (ตรวจว่าเป็นของด่านนี้)
const loadCrisisEvent = async (levelId, eventId) => {
    const rows = await prisma.$queryRaw`
        SELECT event_id, timeout_integrity_delta, timeout_score_delta, timeout_note, title
        FROM level_crisis_events
        WHERE event_id = ${Number(eventId)} AND level_id = ${Number(levelId)}
          AND is_active = true
    `;
    return rows[0] || null;
};

const loadCrisisChoices = async (eventId) =>
    prisma.$queryRaw`
        SELECT choice_id, choice_order, label, integrity_delta, score_delta, trust_delta, note
        FROM level_crisis_choices
        WHERE event_id = ${Number(eventId)}
        ORDER BY choice_order ASC
    `;

const isUniqueViolation = (error) =>
    /23505|unique|uq_crisis_spawn/i.test(String(error.message));

/**
 * บันทึกผลของเหตุการณ์ 1 ครั้ง
 * outcome: "choice" (ต้องมี choiceId) / "timeout" / "auto" (ครูเวร — ใช้ตัวเลือกที่ดีที่สุด)
 */
const recordCrisisResponse = async (play, { spawnNo, eventId, choiceId, outcome, responseSeconds }) => {
    const spawn = Number(spawnNo);
    const elapsed = crisisElapsed(play);

    if (!Number.isInteger(spawn) || spawn < 1 || spawn > Math.floor(elapsed) + 3) {
        return { ok: false, status: 400, message: "ลำดับเหตุการณ์ไม่ถูกต้อง" };
    }

    const event = await loadCrisisEvent(play.level_id, eventId);
    if (!event) {
        return { ok: false, status: 404, message: "ไม่พบเหตุการณ์นี้ในด่าน" };
    }

    let picked = null;
    let delta;

    if (outcome === "timeout") {
        delta = {
            integrity: event.timeout_integrity_delta,
            score: event.timeout_score_delta,
            trust: 0,
            note: event.timeout_note,
        };
    } else {
        const choices = await loadCrisisChoices(event.event_id);

        picked =
            outcome === "auto"
                ? choices.reduce((a, b) => (b.integrity_delta > a.integrity_delta ? b : a))
                : choices.find((c) => c.choice_id === Number(choiceId));

        if (!picked) {
            return { ok: false, status: 400, message: "ตัวเลือกนี้ไม่ใช่ของเหตุการณ์นี้" };
        }

        delta = {
            integrity: picked.integrity_delta,
            score: picked.score_delta,
            trust: picked.trust_delta,
            note: picked.note,
        };
    }

    const seconds = Number.isFinite(Number(responseSeconds))
        ? Math.max(0, Math.round(Number(responseSeconds)))
        : null;

    try {
        await prisma.$executeRaw`
            INSERT INTO game_play_crisis_responses
                (play_id, spawn_no, event_id, outcome, choice_id,
                 integrity_delta, score_delta, trust_delta, response_seconds)
            VALUES
                (${play.play_id}, ${spawn}, ${event.event_id}, ${outcome},
                 ${picked ? picked.choice_id : null},
                 ${delta.integrity}, ${delta.score}, ${delta.trust}, ${seconds})
        `;
    } catch (error) {
        if (isUniqueViolation(error)) {
            return { ok: false, status: 409, message: "บันทึกเหตุการณ์นี้ไปแล้ว" };
        }
        throw error;
    }

    const totals = await getCrisisTotals(play.play_id);

    return {
        ok: true,
        spawn_no: spawn,
        outcome,
        title: event.title,
        choice_label: picked?.label ?? null,
        note: delta.note,
        integrity_delta: delta.integrity,
        score_delta: delta.score,
        ...totals,
    };
};

/**
 * เหตุการณ์พิเศษ — เกิดได้ไม่เกิน 1 ครั้งต่อ 12 วินาทีของเวลาเล่น
 * teacherHelp: ส่ง { eventId, spawnNo } ของเหตุการณ์ที่จะให้ครูแก้ (ถ้ามี)
 */
const recordCrisisSpecial = async (play, { specialCode, eventId, spawnNo }) => {
    const special = CRISIS_SPECIALS[specialCode];
    if (!special) {
        return { ok: false, status: 400, message: "ไม่รู้จักเหตุการณ์พิเศษนี้" };
    }

    const elapsed = Math.min(crisisElapsed(play), CRISIS_SECONDS + 2);
    const allowed = Math.floor(elapsed / CRISIS_SPECIAL_INTERVAL);

    const used = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS n FROM game_play_crisis_specials
        WHERE play_id = ${play.play_id}
    `;

    if ((used[0]?.n ?? 0) >= allowed) {
        return { ok: false, status: 429, message: "ยังไม่ถึงเวลาเหตุการณ์พิเศษ" };
    }

    await prisma.$executeRaw`
        INSERT INTO game_play_crisis_specials (play_id, special_code, integrity_delta)
        VALUES (${play.play_id}, ${specialCode}, ${special.integrityDelta})
    `;

    let resolved = null;

    if (specialCode === "teacherHelp" && eventId && spawnNo) {
        const r = await recordCrisisResponse(play, {
            spawnNo,
            eventId,
            outcome: "auto",
            responseSeconds: null,
        });
        if (r.ok) resolved = { spawn_no: r.spawn_no, title: r.title, choice_label: r.choice_label };
    }

    const totals = await getCrisisTotals(play.play_id);

    return {
        ok: true,
        special_code: specialCode,
        integrity_delta: special.integrityDelta,
        resolved,
        ...totals,
    };
};

const calcCrisisResult = (totals) => {
    const tier = CRISIS_RANKS.find((r) => r.test(totals.score, totals.integrity));

    return {
        rank: tier.rank,
        // IP = คะแนนของรอบนี้ตรง ๆ (ไม่มีเพดาน)
        earnedIP: totals.score,
        status: tier.rank === "S" ? "PERFECT" : "PASS",
        isPass: true,
        isPerfect: tier.rank === "S",
    };
};

// ============================================================
// Unit 6 Level 2 : เครือข่ายความดี (Good Network)
// ============================================================
//
// คำถามอยู่ในตาราง question / choice (question_order = จุดบนแผนที่)
// ตอบผ่าน POST /api/game-play/answer เหมือน Firewall
//
// กติกา (ตามต้นฉบับของเพื่อน):
//   มี 3 หัวใจ — ตอบผิดไม่หยุดเส้นทาง แต่เสีย 1 หัวใจ
//   ผิดครบ 3 ครั้ง → FAIL ทันที (ตอบต่อไม่ได้)
//   ไปถึง "ศาลยุติธรรม" (คำถามข้อสุดท้าย) ได้ → PASS / ไม่ผิดเลย → PERFECT
//   IP = ผลรวม choice.ip_reward ของข้อที่ถูก (ข้อละ 10 → เต็ม 100) ได้แม้ FAIL
// ============================================================

const NETWORK_UNIT_ID = 6;
const NETWORK_LEVEL_ORDER = 2;
const NETWORK_LIVES = 3;

let networkLevelIdCache = null;

const isGoodNetworkLevel = async (levelId) => {
    if (!networkLevelIdCache) {
        const level = await prisma.level.findFirst({
            where: { unit_id: NETWORK_UNIT_ID, order_no: NETWORK_LEVEL_ORDER },
            select: { level_id: true },
        });
        networkLevelIdCache = level?.level_id ?? null;
    }
    return Number(levelId) === networkLevelIdCache;
};

// สลับลำดับตัวเลือก (ต้นฉบับคำตอบถูกเกือบทุกข้อเป็นตัวเลือกแรก เดาง่าย)
const shuffled = (list) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

const getGoodNetworkQuestions = async (levelId) =>
    (await getFirewallQuestions(levelId)).map((q) => ({
        ...q,
        choices: shuffled(q.choice ?? q.choices),
    }));

const getGoodNetworkStats = async (playId, levelId) => {
    const [lastQuestion, answers] = await Promise.all([
        prisma.question.findFirst({
            where: { level_id: Number(levelId) },
            orderBy: { question_order: "desc" },
            select: { question_id: true },
        }),
        prisma.game_play_answers.findMany({
            where: { play_id: Number(playId) },
            select: { question_id: true, is_correct: true, ip_reward: true },
        }),
    ]);

    const wrong = answers.filter((a) => a.is_correct === false).length;

    return {
        answered: answers.length,
        correct: answers.filter((a) => a.is_correct === true).length,
        wrong,
        livesLeft: Math.max(0, NETWORK_LIVES - wrong),
        isOutOfLives: wrong >= NETWORK_LIVES,
        reachedGoal: answers.some((a) => a.question_id === lastQuestion?.question_id),
        answerIP: answers.reduce((sum, a) => sum + (a.ip_reward ?? 0), 0),
    };
};

const calcGoodNetworkResult = (stats) => {
    const isPass = stats.reachedGoal && !stats.isOutOfLives;
    const isPerfect = isPass && stats.wrong === 0;

    return {
        status: isPerfect ? "PERFECT" : isPass ? "PASS" : "FAIL",
        isPass,
        isPerfect,
        earnedIP: stats.answerIP,
    };
};

const calcSlotResult = () => ({
    status: "PASS",
    isPass: true,
    isPerfect: false,
    earnedIP: SLOT_PASS_IP,
});

// ============================================================
// Unit 6 Level 3 : ShadowMirror (กระจกสะท้อนใจ)
// คำถามปลายเปิด 6 ข้อ ให้ AI (Gemini) วิเคราะห์เป็นคะแนน 4 trait
// (logic / empathy / responsibility / consistency) — คำถาม hardcode
// อยู่ฝั่ง frontend (ShadowMirror.jsx) ไม่ได้ดึงจากตาราง question
// ไม่มีคำตอบถูก/ผิด จึงไม่มีเงื่อนไข FAIL — เล่นจบ = ได้ผลเสมอ
//
// *** ไม่แจก Integrity Points (IP) ***
// เป็นกิจกรรมสะท้อนตัวตน ไม่ใช่แบบทดสอบที่มีคะแนนนับ IP — เก็บคะแนน/
// badge ไว้แค่ให้ "อาจารย์" ดูย้อนหลังในหน้า TeacherPage เท่านั้น
// (ดู buildShadowMirrorSection ใน teacherController.js)
// earned_ip ของ game_play_history แถวนี้จะเป็น 0 เสมอ ไม่ถูกนับรวมใน
// recalcIntegrityPoints ของผู้เล่น
//
// คำนวณ/บันทึกผลจริงที่ controllers/reflectController.js
// (POST /api/reflect) ไม่ใช่ที่ gamePlayController.completeGame
// เพราะ flow ต่างจาก Level อื่น
// ============================================================

const SHADOW_MIRROR_UNIT_ID = 6;
const SHADOW_MIRROR_LEVEL_ORDER = 3;

let shadowMirrorLevelIdCache = null;

const isShadowMirrorLevel = async (levelId) => {
    if (!shadowMirrorLevelIdCache) {
        const level = await prisma.level.findFirst({
            where: { unit_id: SHADOW_MIRROR_UNIT_ID, order_no: SHADOW_MIRROR_LEVEL_ORDER },
            select: { level_id: true },
        });
        shadowMirrorLevelIdCache = level?.level_id ?? null;
    }
    return Number(levelId) === shadowMirrorLevelIdCache;
};

// เกณฑ์ badge จากคะแนนเฉลี่ย 4 trait — ใช้แค่ "แสดงผล" (ไม่มี IP ผูกอยู่
// แล้ว) เกณฑ์ตรงกับ badgeFromScore() ฝั่ง frontend (ShadowMirror.jsx)
const SHADOW_MIRROR_RANKS = [
    { key: "LEGEND", th: "ตำนานแห่งกระจก", test: (avg) => avg >= 90 },
    { key: "PLATINUM", th: "ตรารางวัลระดับแพลทินัม", test: (avg) => avg >= 78 },
    { key: "GOLD", th: "ตรารางวัลระดับทอง", test: (avg) => avg >= 63 },
    { key: "SILVER", th: "ตรารางวัลระดับเงิน", test: (avg) => avg >= 48 },
    { key: "BRONZE", th: "ตรารางวัลระดับบรอนซ์", test: () => true },
];

const calcShadowMirrorResult = (avgScore) => {
    const rank =
        SHADOW_MIRROR_RANKS.find((r) => r.test(avgScore)) ||
        SHADOW_MIRROR_RANKS[SHADOW_MIRROR_RANKS.length - 1];

    return {
        status: "PASS", // ไม่มีเงื่อนไข FAIL
        isPass: true,
        isPerfect: rank.key === "LEGEND",
        badge: rank.key,
        badgeTh: rank.th,
        earnedIP: 0, // ไม่แจก IP — เก็บ field ไว้ให้ shape เดียวกับ Level อื่น
    };
};

module.exports = {
    SLIP_HUNT_LEVEL_ID,
    SLIP_HUNT_TOTAL_SLIPS,
    SLIP_HUNT_PASS_SCORE,
    SLIP_HUNT_IP,

    isSlipHuntLevel,
    getSlipHuntAnswerStats,
    calcSlipHuntResult,
    getSlipHuntAnswers,

    SLOT_LEVEL_ID,
    SLOT_START_BALANCE,
    SLOT_BETS,
    SLOT_MIN_BET,
    SLOT_PASS_IP,

    isSlotLevel,
    getSlotRounds,
    getSlotSummary,
    recordSlotSpin,
    calcSlotResult,

    FIREWALL_LEVEL_ID,
    FIREWALL_HEARTS,
    FIREWALL_PASS_CORRECT,

    isFirewallLevel,
    getFirewallQuestions,
    getFirewallStats,
    calcFirewallResult,

    WORD_CLUE_LEVEL_ID,

    isWordClueLevel,
    splitGraphemes,
    getWordPuzzles,
    recordWordAnswer,
    getWordStats,
    calcWordResult,

    BUDGET_LEVEL_ID,
    BUDGET_TOTAL,
    BUDGET_CATEGORIES,

    isBudgetLevel,
    validateBudgets,
    saveBudgetAllocations,
    getBudgetAllocations,
    calcBudgetResult,

    INSPECTOR_LEVEL_ID,
    INSPECTOR_SECONDS,

    isInspectorLevel,
    getInspectorProjects,
    getProjectDecisions,
    recordProjectDecision,
    getInspectorStats,
    calcInspectorResult,

    CRISIS_SECONDS,

    isCrisisLevel,
    getCrisisEvents,
    crisisElapsed,
    getCrisisTimeline,
    getCrisisTotals,
    recordCrisisResponse,
    recordCrisisSpecial,
    calcCrisisResult,

    NETWORK_LIVES,

    isGoodNetworkLevel,
    getGoodNetworkQuestions,
    getGoodNetworkStats,
    calcGoodNetworkResult,

    SHADOW_MIRROR_UNIT_ID,
    SHADOW_MIRROR_LEVEL_ORDER,
    SHADOW_MIRROR_RANKS,

    isShadowMirrorLevel,
    calcShadowMirrorResult,
};