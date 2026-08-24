import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BookLayout from "../BookLayout";
import SlipCard from "./SlipCard";

import slip1 from "../../../assets/unit4/slip_fake_1.png";
import slip2 from "../../../assets/unit4/slip_real_1.png";
import slip3 from "../../../assets/unit4/slip_fake_2.png";
import slip4 from "../../../assets/unit4/slip_real_2.png";
import slip5 from "../../../assets/unit4/slip_fake_3.png";

export default function Game() {
    const navigate = useNavigate();
    const slips = useMemo(() => ([
        { id: 1, image: slip1, answer: "fake" },
        { id: 2, image: slip2, answer: "real" },
        { id: 3, image: slip3, answer: "fake" },
        { id: 4, image: slip4, answer: "real" },
        { id: 5, image: slip5, answer: "fake" },
    ]), []);

    const [current, setCurrent] = useState(null);
    const [score, setScore] = useState(0);
    const [index, setIndex] = useState(0);
    const [stamp, setStamp] = useState("");

    const answer = (type) => {
        if (!current) return;
        const isCorrect = current.answer === type;
        setStamp(isCorrect ? "CORRECT" : "WRONG");
        if (isCorrect) setScore(s => s + 1);

        setTimeout(() => {
            if (index === slips.length - 1) {
                navigate("/unit4/level1/result", { state: { score: isCorrect ? score + 1 : score, total: slips.length } });
            } else {
                setIndex(i => i + 1);
                setCurrent(null);
                setStamp("");
            }
        }, 1000);
    };

    return (
        <BookLayout
            title="Evidence Examination"
            subtitle="วิเคราะห์หลักฐานและบันทึกผล"
            onBack={() => navigate("/unit4/book")}
            leftPage={
                <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", justifyContent: "space-between" }}>
                    <div style={{ padding: 18, borderRadius: 14, background: "#FFF", border: "1px solid var(--paper-border)" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-gold)", fontFamily: "var(--font-title)" }}>PROGRESS</span>
                        <h3 style={{ margin: "4px 0 12px 0", color: "var(--text-primary)" }}>หลักฐานชิ้นที่ {index + 1} / {slips.length}</h3>
                        <div style={{ height: 6, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${((index + 1) / slips.length) * 100}%`, height: "100%", background: "var(--gold-gradient)" }} />
                        </div>
                    </div>

                    <div style={{ padding: 20, borderRadius: 14, background: "#FFF", border: "1px solid var(--paper-border)", textAlign: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-gold)", fontFamily: "var(--font-title)" }}>CURRENT SCORE</span>
                        <div style={{ fontSize: 36, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>{score}</div>
                    </div>

                    <div style={{ padding: 14, borderRadius: 12, background: "rgba(212,175,55,0.1)", borderLeft: "4px solid var(--gold-main)", fontSize: 12, color: "var(--text-primary)" }}>
                        💡 <b>คำแนะนำ:</b> สังเกตตัวอักษรย่อ หัวกระดาษ และ QR Code
                    </div>
                </div>
            }
            rightPage={
                <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    {/* Slip Grid */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
                        {slips.map((item, i) => (
                            <SlipCard
                                key={item.id} slip={item} active={i === index} disabled={i !== index}
                                onClick={() => i === index && setCurrent(item)}
                            />
                        ))}
                    </div>

                    {/* INSPECTION MODAL */}
                    <AnimatePresence>
                        {current && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{
                                    position: "absolute", inset: -10, background: "rgba(15, 23, 42, 0.75)",
                                    backdropFilter: "blur(4px)", borderRadius: 16, zIndex: 50,
                                    display: "flex", alignItems: "center", justifyContent: "center", padding: 20
                                }}
                            >
                                <div style={{
                                    background: "#FFF", padding: 20, borderRadius: 16, width: "100%", maxWidth: 420,
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: 16
                                }}>
                                    <div style={{ position: "relative", maxHeight: 260, overflow: "hidden", borderRadius: 8 }}>
                                        <img src={current.image} alt="Inspect" style={{ width: "100%", objectFit: "contain" }} />
                                        {stamp && (
                                            <div style={{
                                                position: "absolute", top: "35%", left: "20%", right: "20%", textAlign: "center",
                                                padding: "8px 0", borderRadius: 8, fontSize: 22, fontWeight: 800, border: "3px solid",
                                                borderColor: stamp === "CORRECT" ? "#16A34A" : "#DC2626",
                                                color: stamp === "CORRECT" ? "#16A34A" : "#DC2626",
                                                background: "rgba(255,255,255,0.9)", transform: "rotate(-10deg)"
                                            }}>
                                                {stamp}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <button
                                            disabled={Boolean(stamp)} onClick={() => answer("real")}
                                            style={{
                                                padding: "12px 0", borderRadius: 10, border: "none", background: "#16A34A",
                                                color: "#FFF", fontWeight: 700, cursor: "pointer"
                                            }}
                                        >
                                            ✅ ของจริง
                                        </button>
                                        <button
                                            disabled={Boolean(stamp)} onClick={() => answer("fake")}
                                            style={{
                                                padding: "12px 0", borderRadius: 10, border: "none", background: "#DC2626",
                                                color: "#FFF", fontWeight: 700, cursor: "pointer"
                                            }}
                                        >
                                            ❌ ของปลอม
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            }
        />
    );
}