import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRedo, FaBookOpen } from "react-icons/fa";
import BookLayout from "../BookLayout";
import room from "../../../assets/unit4/investigation-room.png";
import "../../../styles/theme.css";
import "./level1.css";

const API_URL = "http://localhost:5000";

// ทุก request ไป /api/slip-hunt ต้องแนบ token (backend ตรวจสิทธิ์เจ้าของรอบ)
const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const RANKS = {
    S: { label: "นักสืบระดับ S", note: "ตรวจถูกทุกใบ ไม่มีที่ติ" },
    A: { label: "นักสืบระดับ A", note: "แม่นมาก เหลืออีกนิดเดียว" },
    B: { label: "นักสืบระดับ B", note: "ใช้ได้ ลองทบทวนใบที่พลาดอีกครั้ง" },
    C: { label: "นักสืบฝึกหัด", note: "กลับไปดูเช็กลิสต์แล้วลองใหม่ได้เลย" },
};

export default function Result() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ✅ เล่นใหม่ = เปิดรอบใหม่ (play_id ใหม่) — ประวัติรอบเก่ายังอยู่ครบ
    const replay = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/game-play/start",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ level_id: 11 }),
                }
            );
            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "เริ่มเกมใหม่ไม่ได้");
                return;
            }

            navigate(`/unit4/level1/game?playId=${result.data.play_id}`);
        } catch (error) {
            console.error("Error starting replay:", error);
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        }
    };

    // Get playId from URL
    const playId = parseInt(searchParams.get("playId"));

    // ✅ NEW: State สำหรับเก็บข้อมูลจาก API
    const [loading, setLoading] = useState(true);
    const [slips, setSlips] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [summary, setSummary] = useState(null);

    // Fallback values
    const total = summary?.total_slips ?? 0;
    const score = summary?.correct_count ?? 0;
    const percent = summary?.accuracy_percentage ?? 0;
    const rank = percent === 100 ? "S" : percent >= 80 ? "A" : percent >= 60 ? "B" : "C";
    // IP ที่ได้จริงจาก backend (game_play_history.earned_ip)
    const earnedIP = summary?.earned_ip ?? 0;

    // ✅ NEW: ดึงข้อมูลจาก Backend
    useEffect(() => {
        const fetchGameData = async () => {
            try {
                setLoading(true);

                // ดึงประวัติ + สรุปผลพร้อมกัน (ต้องแนบ token)
                const [historyRes, summaryRes] = await Promise.all([
                    fetch(`${API_URL}/api/slip-hunt/play/${playId}`, {
                        headers: authHeaders(),
                    }),
                    fetch(`${API_URL}/api/slip-hunt/summary/${playId}`, {
                        headers: authHeaders(),
                    }),
                ]);

                // token หมดอายุ / ไม่ได้ login → กลับหน้า login
                if (historyRes.status === 401 || summaryRes.status === 401) {
                    navigate("/", { replace: true });
                    return;
                }

                const historyData = await historyRes.json();
                const summaryData = await summaryRes.json();

                if (!historyData.success) {
                    throw new Error(
                        historyData.message || "ไม่สามารถดึงประวัติการเล่นได้"
                    );
                }

                if (!summaryData.success) {
                    throw new Error(
                        summaryData.message || "ไม่สามารถดึงสรุปผลได้"
                    );
                }

                // อัปเดต state
                setAnswers(historyData.data);
                setSummary(summaryData.data);

                // ดึงข้อมูล slips สำหรับแสดงรูป
                const slipsRes = await fetch(
                    `${API_URL}/api/slips/level/11`,
                    { headers: authHeaders() }
                );
                const slipsData = await slipsRes.json();
                if (slipsData.success) {
                    setSlips(slipsData.data);
                }
            } catch (error) {
                console.error("Error fetching game data:", error);
                alert("ไม่สามารถโหลดผลลัพธ์: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (!Number.isInteger(playId)) {
            alert("ไม่พบรอบการเล่น");
            navigate("/unit4/book", { replace: true });
            return;
        }

        fetchGameData();
    }, [playId, navigate]);

    // ความคืบหน้า / ปลดล็อกด่านถัดไป / IP บันทึกที่ backend แล้ว
    // ตอน POST /api/game-play/complete → หน้า book อ่านจาก DB เอง
    const finish = () => {
        navigate("/unit4/book");
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 18,
                    color: "var(--text-primary)",
                }}
            >
                กำลังโหลดผลลัพธ์...
            </div>
        );
    }

    return (
        <BookLayout
            title="สรุปผลการสืบสวน"
            subtitle="บทที่ 1 — จับสลิปปลอม"
            rightLabel="ทบทวนทีละใบ"
            rightNote=""
            backgroundImage={room}
            showBack={false}
            /* ---------------- หน้าซ้าย : ผลรวม ---------------- */
            leftPage={
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                        height: "100%",
                    }}
                >
                    <div
                        style={{
                            textAlign: "center",
                            padding: "28px 20px",
                            borderRadius: "var(--radius-card)",
                            background: "var(--paper-sunken)",
                            border: "1px solid var(--paper-border)",
                            boxShadow: "var(--shadow-card)",
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 220,
                                damping: 16,
                            }}
                            style={{
                                width: 108,
                                height: 108,
                                margin: "0 auto 16px",
                                borderRadius: "50%",
                                display: "grid",
                                placeItems: "center",
                                background: "var(--gold-gradient)",
                                fontFamily: "var(--font-title)",
                                fontSize: 48,
                                fontWeight: 700,
                                color: "#3A2708",
                                boxShadow:
                                    "0 10px 24px rgba(138,95,20,.35), inset 0 2px 0 rgba(255,255,255,.7)",
                            }}
                        >
                            {rank}
                        </motion.div>

                        <h2
                            style={{
                                margin: "0 0 6px",
                                fontFamily: "var(--font-serif)",
                                fontSize: 24,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                            }}
                        >
                            {RANKS[rank].label}
                        </h2>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 14.5,
                                color: "var(--text-secondary)",
                            }}
                        >
                            {RANKS[rank].note}
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                padding: "16px 18px",
                                borderRadius: 12,
                                background: "rgba(255,255,255,.6)",
                                border: "1px solid var(--paper-border)",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 13,
                                    color: "var(--text-secondary)",
                                }}
                            >
                                ตรวจถูก
                            </span>
                            <div
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                }}
                            >
                                {score} / {total} ใบ
                            </div>
                        </div>
                        <div
                            style={{
                                padding: "16px 18px",
                                borderRadius: 12,
                                background: "rgba(255,255,255,.6)",
                                border: "1px solid var(--paper-border)",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 13,
                                    color: "var(--text-secondary)",
                                }}
                            >
                                ได้รับ
                            </span>
                            <div
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                }}
                            >
                                +{earnedIP} IP
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: "auto",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <button
                            type="button"
                            className="primary-btn"
                            style={{ alignSelf: "center" }}
                            onClick={finish}
                        >
                            <FaBookOpen size={14} /> กลับไปหน้าสารบัญ
                        </button>
                        <button
                            type="button"
                            className="ghost-btn"
                            style={{
                                alignSelf: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                gap: 2,
                            }}
                            onClick={replay}
                        >
                            <FaRedo />
                            ตรวจใหม่อีกครั้ง
                        </button>
                    </div>
                </div>
            }
            /* ---------------- หน้าขวา : ทบทวน ---------------- */
            rightPage={
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p
                        style={{
                            margin: "0 0 4px",
                            fontSize: 14,
                            color: "var(--text-secondary)",
                        }}
                    >
                        จุดที่ทำให้แต่ละใบจริงหรือปลอม อ่านทวนก่อนไปบทต่อไป
                    </p>

                    {answers.map((answer) => {
                        const ok = answer.is_correct;

                        return (
                            <div
                                key={answer.play_slip_id}
                                className={`review-row ${ok ? "review-row--ok" : "review-row--no"
                                    }`}
                            >
                                <img
                                    src={answer.image}
                                    alt=""
                                    aria-hidden="true"
                                />

                                <div style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                fontSize: 15,
                                                color: "var(--text-primary)",
                                            }}
                                        >
                                            #{answer.slip_id} {answer.bank}
                                        </strong>
                                        <span
                                            className={`chip ${answer.correct_answer ===
                                                "fake"
                                                ? "chip--lock"
                                                : "chip--done"
                                                }`}
                                            style={{
                                                padding: "3px 10px",
                                                fontSize: 11.5,
                                            }}
                                        >
                                            {answer.correct_answer ===
                                                "fake"
                                                ? "ของปลอม"
                                                : "ของจริง"}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 12.5,
                                                color: ok
                                                    ? "#15803D"
                                                    : "#B91C1C",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {ok
                                                ? "คุณตอบถูก"
                                                : "คุณตอบพลาด"}
                                        </span>
                                    </div>

                                    <p
                                        style={{
                                            margin: "6px 0 0",
                                            fontSize: 13.5,
                                            lineHeight: 1.75,
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        {answer.clue}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            }
        />
    );
}