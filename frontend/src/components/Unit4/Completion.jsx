import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaMedal } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "../../styles/theme.css";

// ============================================================
// หน้าปิดคดี Unit 4 — คะแนนจาก DB (ไม่ใช้ localStorage แล้ว)
// ------------------------------------------------------------
// ใช้ GET /api/profile/overview (ตัวเดียวกับหน้า "ความคืบหน้าของฉัน")
//   IP ของแต่ละบท = best_ip (รอบที่ดีที่สุด) → รวม 3 บท
// เปิดได้เฉพาะตอนผ่านครบทุกบทแล้ว ไม่งั้นพากลับหน้าสารบัญ
// ============================================================

const API_URL = "http://localhost:5000";
const UNIT_ID = 4;

// IP เต็มของแต่ละบท: สลิป 250 + สล็อต 150 + Firewall 160
const MAX_POINTS = 560;

export default function Completion() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/", { replace: true });
            return;
        }

        let isMounted = true;

        const load = async () => {
            try {
                const response = await fetch(`${API_URL}/api/profile/overview`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 401) {
                    navigate("/", { replace: true });
                    return;
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "โหลดคะแนนไม่สำเร็จ");
                }

                const unit = (data.data?.units || []).find(
                    (u) => Number(u.unit_id) === UNIT_ID
                );

                if (!unit || unit.status !== "completed") {
                    alert("ต้องผ่านครบทั้ง 3 บทก่อน จึงจะปิดคดีได้");
                    navigate("/unit4/book", { replace: true });
                    return;
                }

                const total = (unit.levels || []).reduce(
                    (sum, level) => sum + (Number(level.best_ip) || 0),
                    0
                );

                if (isMounted) setPoints(Math.min(MAX_POINTS, total));
            } catch (error) {
                console.error("Load Unit 4 completion error:", error);
                alert("ไม่สามารถโหลดคะแนนได้ กรุณาลองใหม่อีกครั้ง");
                navigate("/unit4/book", { replace: true });
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    if (loading) {
        return (
            <main className="unit4-complete">
                <p style={{ fontSize: 18, color: "var(--text-primary)" }}>
                    กำลังปิดแฟ้มคดี...
                </p>
            </main>
        );
    }

    return (
        <main className="unit4-complete">
            <motion.section
                className="unit4-complete-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .45 }}
            >
                <div className="unit4-complete-eyebrow">INTEGRITY QUEST · CASE CLOSED</div>
                <div className="unit4-complete-medal"><FaMedal /></div>
                <p className="unit4-complete-kicker">ยินดีด้วย นักสืบ!</p>
                <h1>คุณปิดคดี Cyber Trap สำเร็จแล้ว</h1>
                <p className="unit4-complete-copy">
                    คุณผ่านภารกิจครบทั้ง 3 บท และพร้อมรับมือกับกลโกงดิจิทัลในวันทำงานจริง
                </p>

                <div className="unit4-complete-score">
                    <span>INTEGRITY POINT</span>
                    <strong>{points}</strong>
                    <small>/ {MAX_POINTS}</small>
                </div>

                <div className="unit4-complete-progress"><span style={{ width: `${(points / MAX_POINTS) * 100}%` }} /></div>

                <div className="unit4-complete-actions">
                    <button type="button" onClick={() => navigate("/map")}>
                        กลับหน้า Map <FaArrowRight />
                    </button>
                </div>
            </motion.section>
        </main>
    );
}