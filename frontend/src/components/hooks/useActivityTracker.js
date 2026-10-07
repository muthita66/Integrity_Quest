import { useEffect } from "react";

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