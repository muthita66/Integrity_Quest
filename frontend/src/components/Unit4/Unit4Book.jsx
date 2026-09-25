import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaCheck, FaPlay } from "react-icons/fa";
import BookLayout from "./BookLayout";
import "../../styles/theme.css";

const CHAPTERS = [
    {
        id: 1,
        numeral: "I",
        name: "จับสลิปปลอม",
        en: "FAKE SLIP INVESTIGATION",
        note: "ตรวจสลิปโอนเงิน 5 ใบ หาใบที่ถูกตัดต่อ",
        route: "/unit4/level1/intro",
        key: "level1",
    },
    {
        id: 2,
        numeral: "II",
        name: "กับดักพนัน",
        en: "TAX INVESTIGATION",
        note: "ตามรอยเงินที่ไหลเข้าเว็บพนันออนไลน์",
        route: "/unit4/level2/intro",
        key: "level2",
    },
    {
        id: 3,
        numeral: "III",
        name: "ภารกิจสุดท้าย",
        en: "FINAL INVESTIGATION",
        note: "ปิดคดีและกันฐานข้อมูลไม่ให้ถูกเจาะ",
        route: "/unit4/level3/intro",
        key: "level3",
    },
];

export default function Unit4Book() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState({ level1: true, level2: false, level3: false });

    useEffect(() => {
        try {
            const save = JSON.parse(localStorage.getItem("unit4"));
            if (save?.level3done) {
                navigate("/unit4/complete", { replace: true });
                return;
            }
            if (save) setProgress({ ...save, level1: true });
        } catch {
            /* ไฟล์เซฟเสียก็เริ่มใหม่จากบทแรก */
        }
    }, []);

    // บทถือว่าผ่านแล้วเมื่อบทถัดไปถูกปลดล็อก (Result.jsx เขียนค่านี้ตอนจบด่าน)
    const state = useMemo(
        () =>
            CHAPTERS.map((chapter, i) => {
                const next = CHAPTERS[i + 1];
                const unlocked = Boolean(progress[chapter.key]);
                const done = next ? Boolean(progress[next.key]) : Boolean(progress.level3done);
                return { ...chapter, unlocked, done };
            }),
        [progress]
    );

    const cleared = state.filter((c) => c.done).length;
    const nextUp = state.find((c) => c.unlocked && !c.done) ?? state[0];

    return (
        <BookLayout
            title="แฟ้มคดี 04 — Cyber Trap"
            subtitle="เปิดสารบัญแล้วเลือกบทที่จะลงมือสืบ"
            rightLabel="สารบัญคดี"
            rightNote={`${cleared} / ${CHAPTERS.length} บท`}
            onBack={() => navigate("/map")}

            /* ---------------- หน้าซ้าย ---------------- */
            leftPage={
                <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>
                    {/* ภารกิจถัดไป — จุดที่ตาควรตกก่อนเพื่อน */}
                    <div
                        style={{
                            padding: "22px 24px",
                            borderRadius: "var(--radius-card)",
                            background: "linear-gradient(135deg,#FFFCF2,#FCF2DC)",
                            border: "1px solid var(--gold-main)",
                            boxShadow: "var(--shadow-card)",
                        }}
                    >
                        <span className="page-eyebrow">ภารกิจถัดไปของคุณ</span>
                        <h2
                            style={{
                                margin: "8px 0 6px",
                                fontFamily: "var(--font-serif)",
                                fontSize: 26,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                            }}
                        >
                            {nextUp.name}
                        </h2>
                        <p style={{ margin: "0 0 18px", fontSize: 14, color: "var(--text-secondary)" }}>
                            {nextUp.note}
                        </p>

                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate(nextUp.route)}
                            style={{
                                width: "100%",
                                minHeight: 56,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                                border: "none",
                                borderRadius: 12,
                                cursor: "pointer",
                                background: "var(--gold-gradient)",
                                color: "#3A2708",
                                fontFamily: "var(--font-ui)",
                                fontSize: 17,
                                fontWeight: 700,
                                boxShadow: "0 6px 16px rgba(138,95,20,.32), inset 0 1px 0 rgba(255,255,255,.65)",
                            }}
                        >
                            <FaPlay size={13} />
                            เริ่มบท {nextUp.numeral}
                        </motion.button>
                    </div>

                    {/* คำชี้แจง */}
                    <div
                        style={{
                            padding: "20px 22px",
                            borderRadius: "var(--radius-card)",
                            background: "rgba(255,255,255,.55)",
                            border: "1px dashed var(--paper-border)",
                        }}
                    >
                        <h3
                            style={{
                                margin: "0 0 8px",
                                fontFamily: "var(--font-serif)",
                                fontSize: 17,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                            }}
                        >
                            คำชี้แจงนักสืบ
                        </h3>
                        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", maxWidth: "58ch" }}>
                            ทำภารกิจทีละบท จบบทแล้วจะได้ Badge และแฟ้มคดีถัดไปจะเปิดให้เอง
                            ก่อนตัดสินใจทุกครั้ง ให้ดูหลักฐานให้ครบทั้งฟอนต์ เวลา และ QR Code
                        </p>
                    </div>

                    {/* ความคืบหน้า */}
                    <div
                        style={{
                            marginTop: "auto",
                            padding: "20px 22px",
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
                                marginBottom: 12,
                            }}
                        >
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                                ความคืบหน้าของยูนิต
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-gold)" }}>
                                {cleared} / {CHAPTERS.length}
                            </span>
                        </div>

                        <div style={{ display: "flex", gap: 6 }}>
                            {state.map((chapter) => (
                                <div
                                    key={chapter.id}
                                    style={{
                                        flex: 1,
                                        height: 10,
                                        borderRadius: 99,
                                        background: chapter.done
                                            ? "var(--gold-gradient)"
                                            : chapter.unlocked
                                                ? "rgba(192,138,46,.28)"
                                                : "#E3DCCB",
                                    }}
                                />
                            ))}
                        </div>

                        <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                            {cleared === CHAPTERS.length
                                ? "ปิดคดีครบทุกบทแล้ว"
                                : `เหลืออีก ${CHAPTERS.length - cleared} บทก่อนปิดคดีนี้`}
                        </p>
                    </div>
                </div>
            }

            /* ---------------- หน้าขวา ---------------- */
            rightPage={
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {state.map((chapter, i) => (
                        <motion.button
                            key={chapter.id}
                            type="button"
                            className="chapter-row"
                            disabled={!chapter.unlocked}
                            onClick={() => chapter.unlocked && navigate(chapter.route)}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 + i * 0.08, duration: 0.35 }}
                        >
                            <span
                                className={`chapter-seal${chapter.unlocked ? "" : " chapter-seal--locked"}`}
                                aria-hidden="true"
                            >
                                {chapter.unlocked ? chapter.numeral : <FaLock size={17} />}
                            </span>

                            <span style={{ flex: 1, minWidth: 0 }}>
                                <span className="chapter-en">{chapter.en}</span>
                                <span className="chapter-name">{chapter.name}</span>
                                <span className="chapter-note">
                                    {chapter.unlocked ? chapter.note : "ผ่านบทก่อนหน้าเพื่อเปิดแฟ้มนี้"}
                                </span>
                            </span>

                            {chapter.done ? (
                                <span className="chip chip--done">
                                    <FaCheck size={11} /> ผ่านแล้ว
                                </span>
                            ) : chapter.unlocked ? (
                                <span className="chip chip--open">เปิดแฟ้ม</span>
                            ) : (
                                <span className="chip chip--lock">ยังล็อก</span>
                            )}
                        </motion.button>
                    ))}

                    <p
                        style={{
                            margin: "6px 2px 0",
                            fontSize: 13,
                            color: "var(--text-muted)",
                        }}
                    >
                        ความคืบหน้าถูกบันทึกไว้ในเครื่องนี้ กลับมาเล่นต่อได้ตลอด
                    </p>
                </div>
            }
        />
    );
}
