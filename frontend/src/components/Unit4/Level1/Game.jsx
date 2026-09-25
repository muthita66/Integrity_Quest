import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearchPlus, FaChevronRight } from "react-icons/fa";
import BookLayout from "../BookLayout";
import ExhibitStrip from "./SlipCard";
import { SLIPS, HINTS } from "./slips";
import room from "../../../assets/unit4/investigation-room.png";
import "../../../styles/theme.css";
import "./level1.css";

export default function Game() {
    const navigate = useNavigate();

    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState([]);   // { id, chosen, correct }
    const [verdict, setVerdict] = useState(null); // ผลของใบปัจจุบัน
    const [zoom, setZoom] = useState(false);

    const slip = SLIPS[index];
    const score = answers.filter((a) => a.correct).length;
    const isLast = index === SLIPS.length - 1;

    const decide = (chosen) => {
        if (verdict) return;
        const correct = chosen === slip.answer;
        setVerdict({ chosen, correct });
        setAnswers((prev) => [...prev, { id: slip.id, chosen, correct }]);
        setZoom(false);
    };

    const next = () => {
        if (isLast) {
            const finalScore = answers.filter((a) => a.correct).length;
            navigate("/unit4/level1/result", {
                state: { score: finalScore, total: SLIPS.length, answers },
            });
            return;
        }
        setIndex((i) => i + 1);
        setVerdict(null);
        setZoom(false);
    };

    return (
        <BookLayout
            title="ตรวจหลักฐาน"
            subtitle={`สลิปใบที่ ${index + 1} จาก ${SLIPS.length}`}
            rightLabel={`${slip.bank} — ${slip.from}`}
            rightNote=""
            backgroundImage={room}
            onBack={() => navigate("/unit4/book")}

            /* ---------------- หน้าซ้าย : สถานะ + ตัวช่วย ---------------- */
            leftPage={
                <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
                    <div style={{ padding: "18px 20px", borderRadius: "var(--radius-card)", background: "var(--paper-sunken)", border: "1px solid var(--paper-border)", boxShadow: "var(--shadow-card)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                                ตรวจไปแล้ว {answers.length} / {SLIPS.length} ใบ
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-gold)" }}>
                                ถูก {score}
                            </span>
                        </div>

                        <div style={{ height: 10, borderRadius: 99, background: "#E3DCCB", overflow: "hidden" }}>
                            <div
                                style={{
                                    width: `${(answers.length / SLIPS.length) * 100}%`,
                                    height: "100%",
                                    background: "var(--gold-gradient)",
                                    transition: "width .35s ease",
                                }}
                            />
                        </div>
                    </div>

                    <ExhibitStrip slips={SLIPS} index={index} answers={answers} />

                    <div>
                        <h3 style={{ margin: "0 0 10px", fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 600, color: "var(--text-primary)" }}>
                            เช็กลิสต์
                        </h3>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                            {HINTS.map((hint) => (
                                <li
                                    key={hint.title}
                                    style={{
                                        padding: "10px 14px", borderRadius: 10,
                                        background: "rgba(255,255,255,.6)",
                                        border: "1px solid var(--paper-border)",
                                        fontSize: 13.5, color: "var(--text-secondary)",
                                    }}
                                >
                                    <strong style={{ color: "var(--text-primary)" }}>{hint.title}</strong> — {hint.detail}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        type="button"
                        className="ghost-btn"
                        style={{ marginTop: "auto", alignSelf: "flex-start" }}
                        onClick={() => setZoom((z) => !z)}
                    >
                        <FaSearchPlus style={{ marginRight: 8, verticalAlign: -2 }} />
                        {zoom ? "ย่อสลิปกลับ" : "ซูมดูสลิป"}
                    </button>
                </div>
            }

            /* ---------------- หน้าขวา : หลักฐานและการตัดสิน ---------------- */
            rightPage={
                <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", minHeight: 0 }}>
                    <div className="evidence-stage">
                        <div className="evidence-frame">
                            <img
                                className={`evidence-img${zoom ? " zoomed" : ""}`}
                                src={slip.image}
                                alt={`สลิปโอนเงินจาก ${slip.from} ธนาคาร ${slip.bank}`}
                                onClick={() => setZoom((z) => !z)}
                            />

                            {verdict && (
                                <span className={`stamp ${verdict.correct ? "stamp--ok" : "stamp--no"}`}>
                                    {verdict.correct ? "ถูกต้อง" : "พลาดแล้ว"}
                                </span>
                            )}
                        </div>
                    </div>

                    {!verdict ? (
                        <div className="verdict-row">
                            <button type="button" className="verdict verdict--real" onClick={() => decide("real")}>
                                สลิปจริง
                                <small>รายละเอียดครบและสมเหตุสมผล</small>
                            </button>
                            <button type="button" className="verdict verdict--fake" onClick={() => decide("fake")}>
                                สลิปปลอม
                                <small>มีจุดที่ผิดปกติ</small>
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div className="clue-box">
                                <strong style={{ display: "block", marginBottom: 4, color: "var(--text-gold)" }}>
                                    {slip.answer === "fake" ? "ใบนี้เป็นของปลอม" : "ใบนี้เป็นของจริง"}
                                </strong>
                                {slip.clue}
                            </div>

                            <button type="button" className="primary-btn" onClick={next}>
                                {isLast ? "ดูผลการสืบสวน" : <>หลักฐานชิ้นต่อไป <FaChevronRight size={13} /></>}
                            </button>
                        </div>
                    )}
                </div>
            }
        />
    );
}
