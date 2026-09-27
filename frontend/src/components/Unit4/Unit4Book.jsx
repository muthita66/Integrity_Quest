import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaCheck, FaPlay, FaMedal } from "react-icons/fa";
import BookLayout from "./BookLayout";
import "../../styles/theme.css";

const API_URL = "http://localhost:5000";
const UNIT_ID = 4;
const PASSED_STATUSES = ["PASS", "PERFECT"];

// ------------------------------------------------------------
// ปิดแล้ว: บท 1-2 บันทึกลง DB และบท 3 ปลดล็อกจาก DB ได้แล้ว
// (ค่า "unit4" เก่าใน localStorage ทำให้บท 3 ขึ้น "ผ่านแล้ว" ทั้งที่ยังไม่ได้เล่นจริง)
// เดิม: บทที่ยังไม่ได้บันทึกผลลง DB
// ให้ใช้ localStorage "unit4" เดิมช่วยได้ เพื่อไม่ให้ติดล็อก
// → เมื่อทุกบทบันทึกผลลง DB ครบแล้ว ให้เปลี่ยนเป็น false
// ------------------------------------------------------------
const LEGACY_LOCAL_FALLBACK = false;

const readLegacy = () => {
    if (!LEGACY_LOCAL_FALLBACK) return {};
    try {
        return JSON.parse(localStorage.getItem("unit4")) || {};
    } catch {
        return {};
    }
};

// แต่ละบทใน CHAPTERS จับคู่กับ Level ของ Unit 4 ใน DB ตามลำดับ order_no
// (บทที่ 1 = level ลำดับแรก, บทที่ 2 = ลำดับสอง, ...)
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
    const [levels, setLevels] = useState([]);
    const [unitLocked, setUnitLocked] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    // --------------------------------------------------------
    // โหลดความคืบหน้าจาก DB (แหล่งเดียวกับแผนที่)
    // --------------------------------------------------------
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/", { replace: true });
            return;
        }

        let isMounted = true;

        const load = async () => {
            try {
                const response = await fetch(`${API_URL}/api/user-progress`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 401) {
                    navigate("/", { replace: true });
                    return;
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "โหลดความคืบหน้าไม่สำเร็จ");
                }

                const unit = (data.data || []).find(
                    (u) => Number(u.unit_id) === UNIT_ID
                );

                if (!isMounted) return;

                setUnitLocked(!unit || unit.is_locked === true);
                setLevels(
                    [...(unit?.levels || [])].sort(
                        (a, b) => Number(a.order_no) - Number(b.order_no)
                    )
                );
            } catch (error) {
                console.error("Load Unit 4 progress error:", error);
                if (isMounted) setLoadError(error.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    // --------------------------------------------------------
    // สถานะของแต่ละบท — กติกาเดียวกับก้อนหินบนแผนที่
    //   บทล็อก → ล็อกทุกด่าน
    //   ด่านแรกของบทที่ปลดล็อกแล้ว → เล่นได้เสมอ
    //   ด่านอื่น → ต้อง is_locked = false (ด่านก่อนหน้าผ่านแล้ว)
    //   ผ่านแล้ว = status PASS / PERFECT
    // --------------------------------------------------------
    const state = useMemo(() => {
        const legacy = readLegacy();

        return CHAPTERS.map((chapter, i) => {
            const level = levels[i] || null;
            const next = CHAPTERS[i + 1];

            const dbUnlocked =
                !unitLocked &&
                Boolean(level) &&
                (i === 0 || level.is_locked === false);

            const dbDone = PASSED_STATUSES.includes(level?.status);

            const legacyUnlocked = i === 0 || Boolean(legacy[chapter.key]);
            const legacyDone = next ? Boolean(legacy[next.key]) : Boolean(legacy.level3done);

            return {
                ...chapter,
                levelId: level?.level_id ?? null,
                unlocked: !unitLocked && (dbUnlocked || legacyUnlocked),
                done: dbDone || (!unitLocked && legacyDone),
            };
        });
    }, [levels, unitLocked]);

    const cleared = state.filter((c) => c.done).length;
    const allDone = cleared === CHAPTERS.length;
    const nextUp = state.find((c) => c.unlocked && !c.done) ?? state[0];

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
                กำลังเปิดแฟ้มคดี...
            </div>
        );
    }

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
                            disabled={!nextUp.unlocked}
                            onClick={() => nextUp.unlocked && navigate(nextUp.route)}
                            style={{
                                width: "100%",
                                minHeight: 56,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                                border: "none",
                                borderRadius: 12,
                                cursor: nextUp.unlocked ? "pointer" : "not-allowed",
                                opacity: nextUp.unlocked ? 1 : 0.5,
                                background: "var(--gold-gradient)",
                                color: "#3A2708",
                                fontFamily: "var(--font-ui)",
                                fontSize: 17,
                                fontWeight: 700,
                                boxShadow: "0 6px 16px rgba(138,95,20,.32), inset 0 1px 0 rgba(255,255,255,.65)",
                            }}
                        >
                            <FaPlay size={13} />
                            {!nextUp.unlocked
                                ? "ยังไม่ปลดล็อก Unit นี้"
                                : allDone
                                    ? "เล่นซ้ำบท "
                                    : "เริ่มบท "}
                            {nextUp.unlocked && nextUp.numeral}
                        </motion.button>

                        {allDone && (
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate("/unit4/complete")}
                                style={{
                                    width: "100%",
                                    minHeight: 48,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 10,
                                    border: "1px solid var(--gold-main)",
                                    borderRadius: 12,
                                    cursor: "pointer",
                                    background: "transparent",
                                    color: "var(--text-gold)",
                                    fontFamily: "var(--font-ui)",
                                    fontSize: 15,
                                    fontWeight: 600,
                                    marginTop: 8,
                                }}
                            >
                                <FaMedal size={13} />
                                ดูผลสำเร็จ
                            </motion.button>
                        )}
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
                        {loadError
                            ? `โหลดความคืบหน้าไม่สำเร็จ: ${loadError}`
                            : "ความคืบหน้าบันทึกไว้ในบัญชีของคุณ เปลี่ยนเครื่องก็เล่นต่อได้"}
                    </p>
                </div>
            }
        />
    );
}