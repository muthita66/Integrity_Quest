const prisma = require("../lib/prisma");

// ============================================================
// Activity (นับเวลาใช้งานจริงด้วย heartbeat)
// ------------------------------------------------------------
// หน้าเว็บส่ง POST /api/activity/heartbeat ทุก 1 นาที
// เฉพาะนาทีที่ "ใช้งานจริง" (แท็บเปิดอยู่ + มีการขยับ/คลิก/พิมพ์)
//
// 1 heartbeat = ใช้งาน 1 นาที
//   - ยังอยู่ในรอบเดิม (ห่างจาก heartbeat ล่าสุดไม่เกิน SESSION_GAP)
//       → active_minutes + 1
//   - หายไปนานเกิน SESSION_GAP / ยังไม่มีรอบ
//       → ปิดรอบเก่า แล้วเปิดรอบใหม่
//   - ส่งถี่กว่า MIN_INTERVAL (เช่นเปิดหลายแท็บ) → ไม่นับซ้ำ
// ============================================================

const MINUTE_MS = 60 * 1000;
const MIN_INTERVAL_MS = 50 * 1000;    // กันนับซ้ำ
const SESSION_GAP_MS = 5 * MINUTE_MS; // หายเกินนี้ = เริ่มรอบใหม่

// ปิดทุกรอบที่ยังเปิดอยู่ของ user (ใช้ตอน logout)
const closeOpenSessions = async (userId, endedAt = new Date()) =>
    prisma.user_sessions.updateMany({
        where: { user_id: Number(userId), ended_at: null },
        data: { ended_at: endedAt },
    });

exports.closeOpenSessions = closeOpenSessions;

// ============================================================
// POST /api/activity/heartbeat
// ============================================================

exports.heartbeat = async (req, res) => {
    try {
        const userId = Number(req.user.id);
        const now = new Date();

        const current = await prisma.user_sessions.findFirst({
            where: { user_id: userId, ended_at: null },
            orderBy: { started_at: "desc" },
        });

        // ----------------------------------------------------
        // ยังอยู่ในรอบเดิม
        // ----------------------------------------------------
        if (
            current &&
            now.getTime() - current.last_seen_at.getTime() <= SESSION_GAP_MS
        ) {
            // นับเฉพาะเมื่อห่างจากครั้งก่อน >= 50 วินาที
            // (updateMany + เงื่อนไขเวลา = กันหลายแท็บยิงพร้อมกัน)
            const updated = await prisma.user_sessions.updateMany({
                where: {
                    session_id: current.session_id,
                    last_seen_at: {
                        lte: new Date(now.getTime() - MIN_INTERVAL_MS),
                    },
                },
                data: {
                    last_seen_at: now,
                    active_minutes: { increment: 1 },
                },
            });

            return res.json({
                session_id: current.session_id,
                counted: updated.count > 0,
                active_minutes: current.active_minutes + updated.count,
            });
        }

        // ----------------------------------------------------
        // หายไปนาน → ปิดรอบเก่า (จบที่ heartbeat สุดท้าย)
        // ----------------------------------------------------
        if (current) {
            await prisma.user_sessions.update({
                where: { session_id: current.session_id },
                data: { ended_at: current.last_seen_at },
            });
        }

        // ----------------------------------------------------
        // เปิดรอบใหม่ (heartbeat แรก = ใช้งานมาแล้ว 1 นาที)
        // ----------------------------------------------------
        const session = await prisma.user_sessions.create({
            data: {
                user_id: userId,
                started_at: new Date(now.getTime() - MINUTE_MS),
                last_seen_at: now,
                active_minutes: 1,
            },
        });

        return res.json({
            session_id: session.session_id,
            counted: true,
            active_minutes: session.active_minutes,
        });
    } catch (error) {
        console.error("Heartbeat error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};