const prisma = require("../lib/prisma");
const gamePlayService = require("../services/gamePlayService");
const userProgressController = require("./userProgressController");

// Unit 6 Level 3 : ShadowMirror (กระจกสะท้อนใจ)
const TRAIT_KEYS = ["logic", "empathy", "responsibility", "consistency"];
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
async function analyzeWithGemini(answers) {
    if (!GEMINI_API_KEY) {
        throw new Error("ยังไม่ได้ตั้งค่า GEMINI_API_KEY ใน .env");
    }

    const qaText = answers
        .map((a, i) => `ข้อ ${i + 1}. ${a.question}\nคำตอบ: ${a.answer}`)
        .join("\n\n");

    const prompt = `คุณคือนักจิตวิทยาที่วิเคราะห์คำตอบปลายเปิดของนิสิตในเกมเพื่อการศึกษาเรื่องความซื่อสัตย์ (Integrity) ชื่อกิจกรรมคือ "กระจกสะท้อนใจ"

ต่อไปนี้คือคำถามและคำตอบ 6 ข้อของผู้เล่น:

${qaText}

วิเคราะห์คำตอบทั้งหมด แล้วให้คะแนน 0-100 ใน 4 ด้าน (trait) ต่อไปนี้ พร้อมคำอธิบายสั้น ๆ (1 ประโยคภาษาไทย) ต่อด้าน:
- logic: การใช้เหตุผลประกอบการตัดสินใจ
- empathy: ความเห็นใจ/คำนึงถึงผู้อื่น
- responsibility: ความรับผิดชอบต่อผลของการกระทำ
- consistency: ความสอดคล้องกับหลักการที่ยึดถือ

พร้อมเขียน:
- overall_reflection: บทสรุปภาพรวมตัวตนของผู้เล่นจากคำตอบทั้งหมด (2-3 ประโยคภาษาไทย น้ำเสียงให้กำลังใจ ไม่ตัดสิน)
- shadow_message: ข้อความสั้น ๆ 1-2 ประโยค ในมุมมอง "เงาสะท้อน" ที่บอกความจริงบางอย่างที่ผู้เล่นอาจไม่กล้ายอมรับกับตัวเอง (โทนลึกลับ กวี แต่ไม่น่ากลัวจนเกินไป)

ตอบกลับเป็น JSON เท่านั้น ตาม schema นี้ (ห้ามมีข้อความอื่นนอก JSON):
{
  "overall_reflection": "string",
  "logic": { "score": number, "note": "string" },
  "empathy": { "score": number, "note": "string" },
  "responsibility": { "score": number, "note": "string" },
  "consistency": { "score": number, "note": "string" },
  "shadow_message": "string"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                responseMimeType: "application/json",
            },
        }),
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
        throw new Error("Gemini ไม่ส่งผลลัพธ์กลับมา");
    }

    try {
        return JSON.parse(rawText);
    } catch (e) {
        throw new Error("ไม่สามารถแปลงผลลัพธ์จาก Gemini เป็น JSON ได้");
    }
}

function sanitizeResult(raw) {
    const clampScore = (v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(100, Math.round(n)));
    };

    const traits = {};
    for (const key of TRAIT_KEYS) {
        traits[key] = {
            score: clampScore(raw?.[key]?.score),
            note: typeof raw?.[key]?.note === "string" ? raw[key].note.trim() : "",
        };
    }

    return {
        overall_reflection:
            typeof raw?.overall_reflection === "string" ? raw.overall_reflection.trim() : "",
        shadow_message:
            typeof raw?.shadow_message === "string" ? raw.shadow_message.trim() : "",
        ...traits,
    };
}

async function buildStoredResultPayload(playId) {
    const row = await prisma.game_play_shadow_mirror.findUnique({
        where: { play_id: playId },
    });

    if (!row) return null;

    return {
        play_id: playId,
        overall_reflection: row.overall_reflection || "",
        shadow_message: row.shadow_message || "",
        logic: { score: row.logic_score, note: row.logic_note || "" },
        empathy: { score: row.empathy_score, note: row.empathy_note || "" },
        responsibility: {
            score: row.responsibility_score,
            note: row.responsibility_note || "",
        },
        consistency: { score: row.consistency_score, note: row.consistency_note || "" },
        avg_score: Number(row.avg_score),
        badge: row.badge_key,
    };
}

exports.submitReflection = async (req, res) => {
    try {
        const userId = req.user.id;
        const { play_id, answers } = req.body;

        const playId = Number(play_id);

        if (!Number.isInteger(playId) || playId <= 0) {
            return res.status(400).json({
                message:
                    "กรุณาระบุ play_id ให้ถูกต้อง (เรียก POST /api/game-play/start ก่อน)",
            });
        }

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                message: "กรุณาส่งคำตอบมาด้วย",
            });
        }

        // ---- ตรวจสอบรอบการเล่นให้เป็นของ user นี้จริง และเป็น ShadowMirror จริง ----
        const play = await prisma.game_play_history.findUnique({
            where: { play_id: playId },
        });

        if (!play) {
            return res.status(404).json({ message: "ไม่พบรอบการเล่นนี้" });
        }

        if (play.user_id !== userId) {
            return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึงรอบการเล่นนี้" });
        }

        const isShadowMirror = await gamePlayService.isShadowMirrorLevel(play.level_id);

        if (!isShadowMirror) {
            return res.status(400).json({ message: "รอบการเล่นนี้ไม่ใช่ ShadowMirror" });
        }

        // ---- เล่นจบไปแล้ว (เช่น refresh หน้า / เรียกซ้ำ) → คืนผลเดิม ไม่เรียก AI ซ้ำ ----
        if (play.completed_at) {
            const stored = await buildStoredResultPayload(playId);

            if (stored) {
                return res.status(200).json(stored);
            }
        }

        // ---- เรียก AI วิเคราะห์คำตอบ ----
        const rawResult = await analyzeWithGemini(answers);
        const result = sanitizeResult(rawResult);

        const avgScore =
            TRAIT_KEYS.reduce((sum, key) => sum + result[key].score, 0) / TRAIT_KEYS.length;
        const { badge } = gamePlayService.calcShadowMirrorResult(avgScore);

        const completedAt = new Date();

        // ---- idempotency: กันบันทึกผลซ้ำ (เช่น double-submit) — earned_ip
        // ไม่ถูกตั้งค่าเลย (ค่า default 0 ของ game_play_history) ----
        const updated = await prisma.game_play_history.updateMany({
            where: { play_id: playId, completed_at: null },
            data: {
                score: Math.round(avgScore),
                max_score: 100,
                status: "COMPLETED",
                completed_at: completedAt,
            },
        });

        if (updated.count === 0) {
            // แพ้ race ให้ request อื่นที่จบไปก่อนแล้ว → คืนผลที่ persist ไว้แล้ว
            const stored = await buildStoredResultPayload(playId);

            if (stored) return res.status(200).json(stored);

            return res.status(409).json({ message: "เกมนี้จบไปแล้ว" });
        }

        // ---- บันทึกผลละเอียด (ตารางสร้างด้วย SQL → ใช้ $executeRaw) ----
        await prisma.$executeRaw`
            INSERT INTO game_play_shadow_mirror (
                play_id, logic_score, logic_note,
                empathy_score, empathy_note,
                responsibility_score, responsibility_note,
                consistency_score, consistency_note,
                avg_score, badge_key,
                overall_reflection, shadow_message, answers, created_at
            ) VALUES (
                ${playId}, ${result.logic.score}, ${result.logic.note},
                ${result.empathy.score}, ${result.empathy.note},
                ${result.responsibility.score}, ${result.responsibility.note},
                ${result.consistency.score}, ${result.consistency.note},
                ${avgScore}, ${badge},
                ${result.overall_reflection}, ${result.shadow_message},
                ${JSON.stringify(answers)}::jsonb, ${completedAt}
            )
        `;

        try {
            await userProgressController.updateLevelProgress({
                userId,
                levelId: play.level_id,
                score: Math.round(avgScore),
                status: "COMPLETED",
                passed: true,
            });
        } catch (error) {
            console.error("updateLevelProgress error (ShadowMirror):", error);
        }

        return res.status(200).json({
            play_id: playId,
            overall_reflection: result.overall_reflection,
            shadow_message: result.shadow_message,
            logic: result.logic,
            empathy: result.empathy,
            responsibility: result.responsibility,
            consistency: result.consistency,
            avg_score: avgScore,
            badge,
        });
    } catch (error) {
        console.error("submitReflection error:", error);

        return res.status(500).json({
            message: "ไม่สามารถวิเคราะห์ผลได้ กรุณาลองใหม่อีกครั้ง",
            error: error.message,
        });
    }
};