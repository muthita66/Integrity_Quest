const prisma = require("../lib/prisma");
const { Prisma } = require("@prisma/client");

/**
 * บันทึกคำตอบการเล่นเกมสลิป
 *
 * @param {number} playId - Game session ID
 * @param {number} slipId - Slip ID (items_id)
 * @param {number} slipOrder - ลำดับที่ 1-5
 * @param {string} playerChoice - "real" or "fake"
 * @returns {object} ผลลัพธ์การบันทึก
 */
const recordSlipHuntAnswer = async (playId, slipId, slipOrder, playerChoice) => {
    try {
        // เช็ค answer ที่ถูกต้องจาก slip_details
        const slipAnswer = await prisma.$queryRaw`
            SELECT answer FROM slip_details
            WHERE items_id = ${slipId}
        `;

        if (!slipAnswer || slipAnswer.length === 0) {
            throw new Error("Slip not found");
        }

        const correctAnswer = slipAnswer[0].answer;
        const isCorrect = correctAnswer === playerChoice.toLowerCase();

        // บันทึกลงใน game_play_slip_hunt
        const result = await prisma.$queryRaw`
            INSERT INTO game_play_slip_hunt
                (play_id, slip_id, slip_order, player_choice, is_correct, answered_at)
            VALUES
                (${playId}, ${slipId}, ${slipOrder}, ${playerChoice.toLowerCase()}, ${isCorrect}, CURRENT_TIMESTAMP)
            RETURNING *
        `;

        return {
            success: true,
            data: {
                ...result[0],
                isCorrect,
                feedback: isCorrect ? "✅ ตรวจสลิปถูกต้อง" : "❌ ตรวจสลิปผิด",
            },
        };
    } catch (error) {
        console.error("Record Slip Hunt Answer Error:", error);
        throw error;
    }
};

/**
 * ดึงประวัติการเล่นเกมสลิปทั้งหมด
 *
 * @param {number} playId - Game session ID
 * @returns {object} ประวัติการเล่น
 */
const getSlipHuntHistory = async (playId) => {
    try {
        const history = await prisma.$queryRaw`
            SELECT
                gsh.play_slip_id,
                gsh.play_id,
                gsh.slip_id,
                gsh.slip_order,
                gsh.player_choice,
                gsh.is_correct,
                gsh.answered_at,

                i.items_id,
                i.name AS slip_name,

                s.bank,
                s."from",
                s.amount,
                s.answer AS correct_answer,
                s.clue,
                s.image

            FROM game_play_slip_hunt gsh

            LEFT JOIN items i ON gsh.slip_id = i.items_id
            LEFT JOIN slip_details s ON s.items_id = i.items_id

            WHERE gsh.play_id = ${playId}

            ORDER BY gsh.slip_order ASC
        `;

        if (!history || history.length === 0) {
            return {
                success: true,
                data: [],
                totalSlips: 0,
                correctCount: 0,
                wrongCount: 0,
                accuracy: 0,
            };
        }

        const correctCount = history.filter(h => h.is_correct).length;
        const wrongCount = history.filter(h => !h.is_correct).length;

        return {
            success: true,
            data: history,
            totalSlips: history.length,
            correctCount,
            wrongCount,
            accuracy: Math.round((correctCount / history.length) * 100),
        };
    } catch (error) {
        console.error("Get Slip Hunt History Error:", error);
        throw error;
    }
};

/**
 * ดึงประวัติการเล่นแต่ละสลิป
 *
 * @param {number} playSlipId - play_slip_id
 * @returns {object} ข้อมูลการตอบแต่ละสลิป
 */
const getSlipHuntAnswer = async (playSlipId) => {
    try {
        const answer = await prisma.$queryRaw`
            SELECT
                gsh.play_slip_id,
                gsh.play_id,
                gsh.slip_id,
                gsh.slip_order,
                gsh.player_choice,
                gsh.is_correct,
                gsh.answered_at,

                i.items_id,
                i.name AS slip_name,

                s.bank,
                s."from",
                s.amount,
                s.answer AS correct_answer,
                s.clue,
                s.image

            FROM game_play_slip_hunt gsh

            LEFT JOIN items i ON gsh.slip_id = i.items_id
            LEFT JOIN slip_details s ON s.items_id = i.items_id

            WHERE gsh.play_slip_id = ${playSlipId}
        `;

        if (!answer || answer.length === 0) {
            return {
                success: false,
                message: "Answer not found",
            };
        }

        return {
            success: true,
            data: answer[0],
        };
    } catch (error) {
        console.error("Get Slip Hunt Answer Error:", error);
        throw error;
    }
};

/**
 * ดึงสรุปผลการเล่น (สำหรับ Result Page)
 *
 * @param {number} playId - Game session ID
 * @returns {object} สรุปผลการเล่น
 */
const getSlipHuntSummary = async (playId) => {
    try {
        const summary = await prisma.$queryRaw`
            SELECT
                gph.play_id,
                gph.earned_ip,
                gph.status,
                gph.completed_at,
                -- ::int เพราะ COUNT ของ Postgres คืนเป็น bigint
                -- (res.json() แปลง BigInt ไม่ได้ → 500)
                COUNT(gsh.play_slip_id)::int AS total_slips,
                COUNT(gsh.play_slip_id) FILTER (WHERE gsh.is_correct = true)::int AS correct_count,
                COUNT(gsh.play_slip_id) FILTER (WHERE gsh.is_correct = false)::int AS wrong_count,
                COALESCE(ROUND(
                    COUNT(gsh.play_slip_id) FILTER (WHERE gsh.is_correct = true) * 100.0
                    / NULLIF(COUNT(gsh.play_slip_id), 0)
                ), 0)::int AS accuracy_percentage
            FROM game_play_history gph
            LEFT JOIN game_play_slip_hunt gsh ON gsh.play_id = gph.play_id
            WHERE gph.play_id = ${playId}
            GROUP BY gph.play_id, gph.earned_ip, gph.status, gph.completed_at
        `;

        if (!summary || summary.length === 0) {
            return {
                success: true,
                data: {
                    total_slips: 0,
                    correct_count: 0,
                    wrong_count: 0,
                    accuracy_percentage: 0,
                    earned_ip: 0,
                    status: null,
                },
            };
        }

        return {
            success: true,
            data: summary[0],
        };
    } catch (error) {
        console.error("Get Slip Hunt Summary Error:", error);
        throw error;
    }
};

/**
 * เช็คว่าเกมจบแล้วหรือยัง (ตอบครบ 5 สลิป)
 *
 * @param {number} playId - Game session ID
 * @returns {object} สถานะการจบเกม
 */
const checkGameComplete = async (playId) => {
    try {
        const result = await prisma.$queryRaw`
            SELECT
                COUNT(*) as answer_count
            FROM game_play_slip_hunt
            WHERE play_id = ${playId}
        `;

        if (!result || result.length === 0) {
            return {
                success: true,
                isComplete: false,
                answerCount: 0,
            };
        }

        const answerCount = parseInt(result[0].answer_count);

        return {
            success: true,
            isComplete: answerCount === 5,
            answerCount,
        };
    } catch (error) {
        console.error("Check Game Complete Error:", error);
        throw error;
    }
};

/**
 * ดึงประวัติเกมทั้งหมดของผู้เล่น (สำหรับ Dashboard)
 *
 * @param {number} userId - User ID
 * @param {number} levelId - Level ID (optional)
 * @returns {object} ประวัติการเล่นทั้งหมด
 */
const getUserSlipHuntStats = async (userId, levelId = null) => {
    try {
        const levelFilter = levelId
            ? Prisma.sql`AND gph.level_id = ${Number(levelId)}`
            : Prisma.empty;

        const stats = await prisma.$queryRaw`
            SELECT
                gph.play_id,
                gph.user_id,
                gph.level_id,
                gph.score,
                gph.max_score,
                gph.status,
                gph.started_at,
                gph.completed_at,
                COUNT(gsh.play_slip_id)::int AS total_answers,
                COUNT(*) FILTER (WHERE gsh.is_correct = true)::int AS correct_answers,
                COALESCE(ROUND(
                    COUNT(*) FILTER (WHERE gsh.is_correct = true) * 100.0
                    / NULLIF(COUNT(gsh.play_slip_id), 0)
                ), 0)::int AS accuracy
            FROM game_play_history gph
            LEFT JOIN game_play_slip_hunt gsh ON gph.play_id = gsh.play_id
            WHERE gph.user_id = ${Number(userId)}
            ${levelFilter}
            GROUP BY gph.play_id, gph.user_id, gph.level_id, gph.score,
                     gph.max_score, gph.status, gph.started_at, gph.completed_at
            ORDER BY gph.started_at DESC
        `;

        return {
            success: true,
            data: stats,
            totalGames: stats.length,
        };
    } catch (error) {
        console.error("Get User Slip Hunt Stats Error:", error);
        throw error;
    }
};

module.exports = {
    recordSlipHuntAnswer,
    getSlipHuntHistory,
    getSlipHuntAnswer,
    getSlipHuntSummary,
    checkGameComplete,
    getUserSlipHuntStats,
};