import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSearchPlus, FaChevronRight } from "react-icons/fa";
import BookLayout from "../BookLayout";
import useButtonHoverSound from "../useButtonHoverSound";
import { useSound } from "../../../hooks/useSound";
import useGameMuted from "../../../hooks/useGameMuted";
import correctAnswerSound from "../../../assets/sounds/Unit4/unit4-correct-answer.mp3";
import wrongAnswerSound from "../../../assets/sounds/Unit4/unit4-wrong-answer.mp3";
import ExhibitStrip from "./SlipCard";
import { HINTS } from "./slips";
import room from "../../../assets/unit4/investigation-room.png";
import "../../../styles/theme.css";
import "./level1.css";

export default function Game() {
    useButtonHoverSound();
    const [muted] = useGameMuted();
    const { play: playCorrect, stop: stopCorrect } = useSound(correctAnswerSound, { volume: 0.5 });
    const { play: playWrong, stop: stopWrong } = useSound(wrongAnswerSound, { volume: 0.5 });
    useEffect(() => stopWrong, [stopWrong]);
    useEffect(() => { if (muted) stopWrong(); }, [muted, stopWrong]);
    useEffect(() => stopCorrect, [stopCorrect]);
    useEffect(() => { if (muted) stopCorrect(); }, [muted, stopCorrect]);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // playId มาจาก IntroScene (POST /api/game-play/start)
    const playId = parseInt(searchParams.get("playId"));

    // ---------------- สถานะเกม ----------------
    const [slips, setSlips] = useState([]);
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [verdict, setVerdict] = useState(null);
    const [zoom, setZoom] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // ---------------- ไม่มี playId (เช่น กด "เล่นซ้ำ" จากหน้า Book) → เปิดรอบใหม่เอง ----------------
    // isStartingRef กัน React StrictMode ยิง /start ซ้ำ 2 รอบ (จะได้ play_id เกิน)
    const isStartingRef = useRef(false);
    const [startError, setStartError] = useState(null);

    useEffect(() => {
        if (playId || isStartingRef.current) return;
        isStartingRef.current = true;

        const startNewPlay = async () => {
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
                    setStartError(result.message || "เริ่มเกมไม่ได้");
                    return;
                }

                // ใส่ playId ลง URL (replace = กด Back แล้วไม่วนกลับมาหน้าที่ไม่มี playId)
                setSearchParams(
                    { playId: String(result.data.play_id) },
                    { replace: true }
                );
            } catch (error) {
                console.error("Error starting game:", error);
                setStartError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            } finally {
                isStartingRef.current = false;
            }
        };

        startNewPlay();
    }, [playId, setSearchParams]);

    // ---------------- เริ่มเกมใหม่ทุกครั้งที่เข้า Game ----------------
    useEffect(() => {
        // reset state ของเกม
        setIndex(0);
        setAnswers([]);
        setVerdict(null);
        setZoom(false);

        const fetchSlips = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/slips/level/11"
                );

                if (!response.ok) {
                    throw new Error("ไม่สามารถดึงข้อมูลสลิปได้");
                }

                const result = await response.json();

                if (result.success) {
                    setSlips(result.data);
                } else {
                    console.error("Get slips failed:", result.message);
                    setSlips([]);
                }
            } catch (error) {
                console.error("Error fetching slips:", error);
                setSlips([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSlips();
        // รีเซ็ตทุกครั้งที่ได้ playId ใหม่ (เล่นซ้ำ = รอบใหม่ เริ่มใบที่ 1)
    }, [playId]);

    // ---------------- เริ่มเกมไม่ได้ (เช่น Level ยังล็อก / token หมดอายุ) ----------------
    if (startError) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 18,
                    color: "var(--text-primary)",
                }}
            >
                {startError}
                <button
                    type="button"
                    className="primary-btn"
                    onClick={() => navigate("/unit4/book")}
                >
                    กลับไปหน้าสารบัญ
                </button>
            </div>
        );
    }

    // ---------------- กำลังโหลด (รอ slips หรือรอ playId) ----------------
    if (loading || !playId) {
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
                กำลังโหลดข้อมูลหลักฐาน...
            </div>
        );
    }

    // ---------------- ไม่พบข้อมูล ----------------
    if (!slips.length) {
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
                ไม่พบข้อมูลสลิป
            </div>
        );
    }

    const slip = slips[index];
    const score = answers.filter((a) => a.correct).length;
    const isLast = index === slips.length - 1;

    // ✅ NEW: บันทึกคำตอบเมื่อเลือก real/fake
    const decide = async (chosen) => {
        // ตอบแล้ว ห้ามกดซ้ำ
        if (verdict || submitting) return;

        setSubmitting(true);

        try {
            // ส่งคำตอบไปบ็อกแอนด์
            const response = await fetch(
                "http://localhost:5000/api/slip-hunt/answer",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        playId: playId,
                        slipId: slip.items_id,
                        slipOrder: index + 1,
                        playerChoice: chosen,
                    }),
                }
            );

            const result = await response.json();

            if (!result.success) {
                console.error("Failed to record answer:", result.message);
                alert("ไม่สามารถบันทึกคำตอบได้: " + result.message);
                return;
            }

            // อัปเดต UI
            const correct = result.data.isCorrect;
            if (correct && !muted) playCorrect();
            if (correct === false && !muted) playWrong();
            setVerdict({
                chosen,
                correct,
            });

            setAnswers((prev) => [
                ...prev,
                {
                    id: slip.items_id,
                    chosen,
                    correct,
                },
            ]);

            setZoom(false);
        } catch (error) {
            console.error("Error submitting answer:", error);
            alert("เกิดข้อผิดพลาด: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ UPDATED: ใบสุดท้าย → จบเกม (บันทึกผล + IP + ปลดล็อก) แล้วไปหน้า result
    const next = async () => {
        if (isLast) {
            if (submitting) return;
            setSubmitting(true);

            try {
                const response = await fetch(
                    "http://localhost:5000/api/game-play/complete",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            // ⚠️ ใช้ key เดียวกับที่ IntroScene ใช้
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify({ play_id: playId }),
                    }
                );

                if (!response.ok) {
                    const result = await response.json();
                    console.error("completeGame error:", result.message);
                }
            } catch (error) {
                console.error("Error completing game:", error);
            } finally {
                setSubmitting(false);
            }

            // ไปหน้า result เสมอ (คำตอบทั้ง 5 ใบบันทึกไว้แล้ว)
            navigate(`/unit4/level1/result?playId=${playId}`);
            return;
        }

        setIndex((i) => i + 1);
        setVerdict(null);
        setZoom(false);
    };

    return (
        <BookLayout
            title="ตรวจหลักฐาน"
            subtitle={`สลิปใบที่ ${index + 1} จาก ${slips.length}`}
            rightLabel={`${slip.bank} — ${slip.from}`}
            rightNote=""
            backgroundImage={room}
            onBack={() => navigate("/unit4/book")}
            /* ---------------- หน้าซ้าย : สถานะ + ตัวช่วย ---------------- */
            leftPage={
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        height: "100%",
                    }}
                >
                    <div
                        style={{
                            padding: "18px 20px",
                            borderRadius: "var(--radius-card)",
                            background: "var(--paper-sunken)",
                            border: "1px solid var(--paper-border)",
                            boxShadow: "var(--shadow-card)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                                marginBottom: 10,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "var(--text-primary)",
                                }}
                            >
                                ตรวจไปแล้ว {answers.length} / {slips.length} ใบ
                            </span>

                            <span
                                style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "var(--text-gold)",
                                }}
                            >
                                ถูก {score}
                            </span>
                        </div>

                        <div
                            style={{
                                height: 10,
                                borderRadius: 99,
                                background: "#E3DCCB",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: `${(answers.length / slips.length) * 100}%`,
                                    height: "100%",
                                    background: "var(--gold-gradient)",
                                    transition: "width .35s ease",
                                }}
                            />
                        </div>
                    </div>

                    <ExhibitStrip
                        slips={slips}
                        index={index}
                        answers={answers}
                    />

                    <div>
                        <h3
                            style={{
                                margin: "0 0 10px",
                                fontFamily: "var(--font-serif)",
                                fontSize: 17,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                            }}
                        >
                            เช็กลิสต์
                        </h3>

                        <ul
                            style={{
                                margin: 0,
                                padding: 0,
                                listStyle: "none",
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            {HINTS.map((hint) => (
                                <li
                                    key={hint.title}
                                    style={{
                                        padding: "10px 14px",
                                        borderRadius: 10,
                                        background: "rgba(255,255,255,.6)",
                                        border: "1px solid var(--paper-border)",
                                        fontSize: 13.5,
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    <strong
                                        style={{
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        {hint.title}
                                    </strong>{" "}
                                    — {hint.detail}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        type="button"
                        className="ghost-btn"
                        style={{
                            marginTop: "auto",
                            alignSelf: "flex-start",
                        }}
                        onClick={() => setZoom((z) => !z)}
                    >
                        <FaSearchPlus
                            style={{
                                marginRight: 8,
                                verticalAlign: -2,
                            }}
                        />

                        {zoom ? "ย่อสลิปกลับ" : "ซูมดูสลิป"}
                    </button>
                </div>
            }
            /* ---------------- หน้าขวา : หลักฐานและการตัดสิน ---------------- */
            rightPage={
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        height: "100%",
                        minHeight: 0,
                    }}
                >
                    <div className="evidence-stage">
                        <div className="evidence-frame">
                            <img
                                className={`evidence-img${zoom ? " zoomed" : ""}`}
                                src={slip.image}
                                alt={`สลิปโอนเงินจาก ${slip.from} ธนาคาร ${slip.bank}`}
                                onClick={() => setZoom((z) => !z)}
                            />

                            {verdict && (
                                <span
                                    className={`stamp ${verdict.correct
                                        ? "stamp--ok"
                                        : "stamp--no"
                                        }`}
                                >
                                    {verdict.correct ? "ถูกต้อง" : "พลาดแล้ว"}
                                </span>
                            )}
                        </div>
                    </div>

                    {!verdict ? (
                        <div className="verdict-row">
                            <button
                                type="button"
                                className="verdict verdict--real"
                                onClick={() => decide("real")}
                                disabled={submitting}
                            >
                                สลิปจริง
                                <small>
                                    รายละเอียดครบและสมเหตุสมผล
                                </small>
                            </button>

                            <button
                                type="button"
                                className="verdict verdict--fake"
                                onClick={() => decide("fake")}
                                disabled={submitting}
                            >
                                สลิปปลอม
                                <small>มีจุดที่ผิดปกติ</small>
                            </button>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                            }}
                        >
                            <div className="clue-box">
                                <strong
                                    style={{
                                        display: "block",
                                        marginBottom: 4,
                                        color: "var(--text-gold)",
                                    }}
                                >
                                    {slip.answer === "fake"
                                        ? "ใบนี้เป็นของปลอม"
                                        : "ใบนี้เป็นของจริง"}
                                </strong>

                                {slip.clue}
                            </div>

                            <button
                                type="button"
                                className="primary-btn"
                                onClick={next}
                            >
                                {isLast ? (
                                    "ดูผลการสืบสวน"
                                ) : (
                                    <>
                                        หลักฐานชิ้นต่อไป{" "}
                                        <FaChevronRight size={13} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            }
        />
    );
}
