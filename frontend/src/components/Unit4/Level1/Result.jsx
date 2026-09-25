import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRedo, FaBookOpen } from "react-icons/fa";
import BookLayout from "../BookLayout";
import { SLIPS } from "./slips";
import room from "../../../assets/unit4/investigation-room.png";
import "../../../styles/theme.css";
import "./level1.css";

const RANKS = {
    S: { label: "นักสืบระดับ S", note: "ตรวจถูกทุกใบ ไม่มีที่ติ" },
    A: { label: "นักสืบระดับ A", note: "แม่นมาก เหลืออีกนิดเดียว" },
    B: { label: "นักสืบระดับ B", note: "ใช้ได้ ลองทบทวนใบที่พลาดอีกครั้ง" },
    C: { label: "นักสืบฝึกหัด", note: "กลับไปดูเช็กลิสต์แล้วลองใหม่ได้เลย" },
};

export default function Result() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const total = state?.total ?? SLIPS.length;
    const score = state?.score ?? 0;
    const answers = state?.answers ?? [];
    const percent = Math.round((score / total) * 100);

    const rank = percent === 100 ? "S" : percent >= 80 ? "A" : percent >= 60 ? "B" : "C";
    const passed = score >= 3;

    const finish = () => {
        // ปลดล็อกบทถัดไปเฉพาะตอนที่ผ่านเกณฑ์ และไม่ลบความคืบหน้าเดิมทิ้ง
        try {
            const save = JSON.parse(localStorage.getItem("unit4")) || {};
            localStorage.setItem(
                "unit4",
                JSON.stringify({
                    ...save,
                    level1: true,
                    level2: save.level2 || passed,
                    level1Points: Math.min(250, Math.max(0, score * 50)),
                })
            );
        } catch {
            localStorage.setItem("unit4", JSON.stringify({ level1: true, level2: passed, level3: false }));
        }
        navigate("/unit4/book");
    };

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
                <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>
                    <div style={{ textAlign: "center", padding: "28px 20px", borderRadius: "var(--radius-card)", background: "var(--paper-sunken)", border: "1px solid var(--paper-border)", boxShadow: "var(--shadow-card)" }}>
                        <motion.div
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 220, damping: 16 }}
                            style={{
                                width: 108, height: 108, margin: "0 auto 16px", borderRadius: "50%",
                                display: "grid", placeItems: "center",
                                background: "var(--gold-gradient)",
                                fontFamily: "var(--font-title)", fontSize: 48, fontWeight: 700, color: "#3A2708",
                                boxShadow: "0 10px 24px rgba(138,95,20,.35), inset 0 2px 0 rgba(255,255,255,.7)",
                            }}
                        >
                            {rank}
                        </motion.div>

                        <h2 style={{ margin: "0 0 6px", fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)" }}>
                            {RANKS[rank].label}
                        </h2>
                        <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-secondary)" }}>
                            {RANKS[rank].note}
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(255,255,255,.6)", border: "1px solid var(--paper-border)" }}>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>ตรวจถูก</span>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
                                {score} / {total} ใบ
                            </div>
                        </div>
                        <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(255,255,255,.6)", border: "1px solid var(--paper-border)" }}>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>ได้รับ</span>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
                                +{score * 50} EXP
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <button type="button" className="primary-btn" style={{ alignSelf: "center" }} onClick={finish}>
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
                            onClick={() => navigate("/unit4/level1/game")}
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
                    <p style={{ margin: "0 0 4px", fontSize: 14, color: "var(--text-secondary)" }}>
                        จุดที่ทำให้แต่ละใบจริงหรือปลอม อ่านทวนก่อนไปบทต่อไป
                    </p>

                    {SLIPS.map((slip) => {
                        const result = answers.find((a) => a.id === slip.id);
                        const ok = result?.correct;

                        return (
                            <div key={slip.id} className={`review-row ${ok ? "review-row--ok" : "review-row--no"}`}>
                                <img src={slip.image} alt="" aria-hidden="true" />

                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>
                                            #{slip.id} {slip.bank}
                                        </strong>
                                        <span
                                            className={`chip ${slip.answer === "fake" ? "chip--lock" : "chip--done"}`}
                                            style={{ padding: "3px 10px", fontSize: 11.5 }}
                                        >
                                            {slip.answer === "fake" ? "ของปลอม" : "ของจริง"}
                                        </span>
                                        <span style={{ fontSize: 12.5, color: ok ? "#15803D" : "#B91C1C", fontWeight: 600 }}>
                                            {result ? (ok ? "คุณตอบถูก" : "คุณตอบพลาด") : "ยังไม่ได้ตรวจ"}
                                        </span>
                                    </div>

                                    <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.75, color: "var(--text-secondary)" }}>
                                        {slip.clue}
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
