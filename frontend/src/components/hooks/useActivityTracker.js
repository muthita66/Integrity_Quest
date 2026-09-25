import { useEffect } from "react";

// ============================================================
// useActivityTracker
// ------------------------------------------------------------
// นับเวลาใช้งานจริง: ส่ง heartbeat ไป backend ทุก 1 นาที
// เฉพาะนาทีที่
//   1. login อยู่ (มี token)
//   2. แท็บนี้เปิดอยู่ด้านหน้า (ไม่ได้สลับแท็บ / ย่อหน้าต่าง)
//   3. มีการขยับเมาส์ / คลิก / พิมพ์ / แตะจอ / เลื่อน ใน 3 นาทีล่าสุด
//
// ใส่ครั้งเดียวใน App.jsx ก็ครอบทุกหน้า
// ============================================================

const API_URL = "http://localhost:5000/api";

const HEARTBEAT_MS = 60 * 1000;     // ส่งทุก 1 นาที
const IDLE_LIMIT_MS = 3 * 60 * 1000; // ไม่ขยับเกิน 3 นาที = ไม่นับ

const ACTIVITY_EVENTS = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "wheel",
];

export default function useActivityTracker() {
    useEffect(() => {
        let lastActivity = Date.now();

        const markActive = () => {
            lastActivity = Date.now();
        };

        ACTIVITY_EVENTS.forEach((event) =>
            window.addEventListener(event, markActive, { passive: true })
        );

        const sendHeartbeat = async () => {
            const token = localStorage.getItem("token");

            if (!token) return;
            if (document.visibilityState !== "visible") return;
            if (Date.now() - lastActivity > IDLE_LIMIT_MS) return;

            try {
                await fetch(`${API_URL}/activity/heartbeat`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch {
                // เน็ตหลุด / server ปิด → ข้ามนาทีนี้ไป ไม่ต้องแจ้งผู้ใช้
            }
        };

        const timer = setInterval(sendHeartbeat, HEARTBEAT_MS);

        return () => {
            clearInterval(timer);
            ACTIVITY_EVENTS.forEach((event) =>
                window.removeEventListener(event, markActive)
            );
        };
    }, []);
}