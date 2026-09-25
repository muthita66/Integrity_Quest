const prisma = require("../lib/prisma"); // ตรงกับ backend/src/lib/prisma.js ในโปรเจกต์คุณ

const VALID_QUIZ_TYPES = ["pre_test", "post_test"];

/**
 * GET /api/quizzes?type=pre_test
 * ดึงคำถามทั้งหมดของ quiz_type ที่ระบุ เรียงตาม quiz_id
 */
async function getQuizzes(req, res) {
    try {
        const { type } = req.query;

        if (!type || !VALID_QUIZ_TYPES.includes(type)) {
            return res.status(400).json({
                message: `query "type" ต้องเป็นหนึ่งใน: ${VALID_QUIZ_TYPES.join(", ")}`,
            });
        }

        const quizzes = await prisma.quizzes.findMany({
            where: { quiz_type: type },
            orderBy: { quiz_id: "asc" },
            select: {
                quiz_id: true,
                quiz_type: true,
                question_text: true,
                max_score: true,
            },
        });

        return res.json({ quizzes });
    } catch (err) {
        console.error("getQuizzes error:", err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงคำถาม" });
    }
}

/**
 * POST /api/quiz-answers
 * body: { quiz_type: "pre_test" | "post_test", answers: [{ quiz_id: number, score: number }, ...] }
 * ต้องผ่าน auth middleware มาก่อน เพื่อให้มี req.user.id
 *
 * ทำได้ครั้งเดียวเท่านั้น: ถ้า user เคยทำ quiz_type นี้ไปแล้ว จะปฏิเสธด้วย 409
 */
async function submitQuizAnswers(req, res) {
    try {
        const userId = req.user?.id;
        const { quiz_type: quizType, answers } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ" });
        }

        if (!quizType || !VALID_QUIZ_TYPES.includes(quizType)) {
            return res.status(400).json({
                message: `quiz_type ต้องเป็นหนึ่งใน: ${VALID_QUIZ_TYPES.join(", ")}`,
            });
        }

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: "answers ต้องเป็น array ที่มีข้อมูล" });
        }

        for (const a of answers) {
            if (
                typeof a.quiz_id !== "number" ||
                typeof a.score !== "number" ||
                a.score < 1 ||
                a.score > 5
            ) {
                return res.status(400).json({
                    message: "แต่ละคำตอบต้องมี quiz_id และ score (1-5) ที่ถูกต้อง",
                });
            }
        }

        // เช็คว่า user เคยทำ quiz_type นี้ไปแล้วหรือยัง (ทำได้ครั้งเดียวเท่านั้น)
        const existingAnswer = await prisma.user_quiz_answers.findFirst({
            where: {
                user_id: userId,
                quizzes: { quiz_type: quizType },
            },
        });

        if (existingAnswer) {
            return res.status(409).json({
                message:
                    quizType === "pre_test"
                        ? "คุณทำ Pre-Test ไปแล้ว ไม่สามารถทำซ้ำได้"
                        : "คุณทำ Post-Test ไปแล้ว ไม่สามารถทำซ้ำได้",
            });
        }

        const rows = answers.map((a) => ({
            user_id: userId,
            quiz_id: a.quiz_id,
            score_given: a.score,
        }));

        await prisma.user_quiz_answers.createMany({ data: rows });

        return res.status(201).json({ message: "บันทึกคำตอบสำเร็จ", count: rows.length });
    } catch (err) {
        // เผื่อกรณี race condition หลุดผ่านเช็คด้านบนไปพร้อมกัน แล้วชน unique constraint
        if (err.code === "P2002") {
            return res.status(409).json({ message: "คุณทำแบบทดสอบนี้ไปแล้ว" });
        }

        console.error("submitQuizAnswers error:", err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกคำตอบ" });
    }
}

/**
 * GET /api/quiz-answers/status?type=pre_test
 * เช็คว่า user (จาก token) เคยทำ quiz_type นี้ไปแล้วหรือยัง
 * ต้องผ่าน auth middleware มาก่อน
 */
async function checkQuizStatus(req, res) {
    try {
        const userId = req.user?.id;
        const { type } = req.query;

        if (!userId) {
            return res.status(401).json({ message: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ" });
        }

        if (!type || !VALID_QUIZ_TYPES.includes(type)) {
            return res.status(400).json({
                message: `query "type" ต้องเป็นหนึ่งใน: ${VALID_QUIZ_TYPES.join(", ")}`,
            });
        }

        const existingAnswer = await prisma.user_quiz_answers.findFirst({
            where: {
                user_id: userId,
                quizzes: { quiz_type: type },
            },
        });

        return res.json({ completed: !!existingAnswer });
    } catch (err) {
        console.error("checkQuizStatus error:", err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเช็คสถานะ" });
    }
}

module.exports = { getQuizzes, submitQuizAnswers, checkQuizStatus };