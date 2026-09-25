const prisma = require("../lib/prisma");

const LEVEL_ID = 6;

const saveComparisonAnswer = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            play_id,
            comparison_question_id,
            user_answer,
        } = req.body;

        if (!play_id || !comparison_question_id || user_answer === undefined) {
            return res.status(400).json({
                message: "กรุณาระบุ play_id, comparison_question_id และ user_answer",
            });
        }

        const playId = Number(play_id);
        const questionId = Number(comparison_question_id);
        const answer = Number(user_answer);

        if (
            !Number.isInteger(playId) ||
            !Number.isInteger(questionId) ||
            !Number.isInteger(answer)
        ) {
            return res.status(400).json({
                message: "ข้อมูลต้องเป็นตัวเลขที่ถูกต้อง",
            });
        }

        // ตรวจสอบรอบการเล่น
        const play = await prisma.game_play_history.findUnique({
            where: {
                play_id: playId,
            },
        });

        if (!play) {
            return res.status(404).json({
                message: "ไม่พบประวัติการเล่น",
            });
        }

        // ป้องกันไม่ให้ user คนอื่นส่ง play_id ของคนอื่น
        if (play.user_id !== userId) {
            return res.status(403).json({
                message: "ไม่มีสิทธิ์บันทึกข้อมูลของรอบการเล่นนี้",
            });
        }

        // ต้องเป็น Level 2
        if (play.level_id !== LEVEL_ID) {
            return res.status(400).json({
                message: "play_id นี้ไม่ใช่การเล่นของ Level 2",
            });
        }

        // ตรวจสอบคำถาม
        const question = await prisma.comparison_questions.findUnique({
            where: {
                id: questionId,
            },
        });

        if (!question) {
            return res.status(404).json({
                message: "ไม่พบคำถาม",
            });
        }

        if (question.level_id !== LEVEL_ID) {
            return res.status(400).json({
                message: "คำถามนี้ไม่ใช่ของ Level 2",
            });
        }

        // ตรวจสอบว่า play นี้ตอบคำถามนี้ไปแล้วกี่ครั้ง
        const previousAttempts =
            await prisma.game_play_comparison.count({
                where: {
                    play_id: playId,
                    comparison_question_id: questionId,
                },
            });

        const attemptNumber = previousAttempts + 1;

        const isCorrect = answer === question.correct_answer;

        // ถูกตั้งแต่ครั้งแรกเท่านั้น
        const firstTryCorrect =
            attemptNumber === 1 && isCorrect;

        // บันทึกคำตอบ
        const savedAnswer =
            await prisma.game_play_comparison.create({
                data: {
                    play_id: playId,
                    comparison_question_id: questionId,
                    user_answer: answer,
                    is_correct: isCorrect,
                    attempt_number: attemptNumber,
                    first_try_correct: firstTryCorrect,
                    answered_at: new Date(),
                },
            });

        // นับจำนวนข้อที่ถูกครั้งแรกทั้งหมด
        const firstTryCorrectCount =
            await prisma.game_play_comparison.count({
                where: {
                    play_id: playId,
                    first_try_correct: true,
                },
            });

        // Level 2 มี 5 ข้อ
        const maxScore = 5;

        // Score = จำนวนข้อที่ถูกครั้งแรก
        await prisma.game_play_history.update({
            where: {
                play_id: playId,
            },
            data: {
                score: firstTryCorrectCount,
                max_score: maxScore,
            },
        });

        return res.status(201).json({
            message: "บันทึกคำตอบ Level 2 สำเร็จ",
            data: {
                id: savedAnswer.id,
                play_id: savedAnswer.play_id,
                comparison_question_id:
                    savedAnswer.comparison_question_id,
                user_answer: savedAnswer.user_answer,
                is_correct: savedAnswer.is_correct,
                attempt_number: savedAnswer.attempt_number,
                first_try_correct:
                    savedAnswer.first_try_correct,
                first_try_correct_count:
                    firstTryCorrectCount,
                max_score: maxScore,
            },
        });
    } catch (error) {
        console.error(
            "Error saving comparison answer:",
            error
        );

        return res.status(500).json({
            message: "Failed to save comparison answer",
            error: error.message,
        });
    }
};

module.exports = {
    saveComparisonAnswer,
};