import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaChevronRight } from "react-icons/fa";
import BookLayout from "../BookLayout";
import { HINTS } from "./slips";
import room from "../../../assets/unit4/investigation-room.png";
import jane from "../../../assets/unit4/senior-detective.png";
import "../../../styles/theme.css";
import "./level1.css";

const DIALOGS = [
    "สวัสดี วันนี้มีเคสด่วนเข้ามา บริษัทได้รับสลิปโอนเงิน 5 ใบ แต่มีบางใบที่เราไม่แน่ใจ",
    "มิจฉาชีพทำสลิปปลอมได้เนียนขึ้นมาก แต่ยังไงก็ยังพลาดในรายละเอียดเล็ก ๆ เสมอ",
    "ดู 4 จุดนี้ให้ครบทุกใบ เวลา วันที่ QR Code และเลขที่รายการ แล้วค่อยตัดสิน",
    "ถ้าไม่แน่ใจ กดที่รูปสลิปเพื่อซูมดูใกล้ ๆ ได้ พร้อมแล้วเริ่มเลย",
];

export default function IntroScene() {
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const [text, setText] = useState("");
    const [typing, setTyping] = useState(true);
    const timer = useRef(null);

    useEffect(() => {
        const line = DIALOGS[index];
        let i = 0;
        setText("");
        setTyping(true);

        timer.current = setInterval(() => {
            i += 1;
            setText(line.slice(0, i));
            if (i >= line.length) {
                clearInterval(timer.current);
                setTyping(false);
            }
        }, 28);

        return () => clearInterval(timer.current);
    }, [index]);

    // กดครั้งแรกระหว่างพิมพ์ = แสดงข้อความทั้งบรรทัดทันที ไม่ต้องรอ
    const advance = () => {
        if (typing) {
            clearInterval(timer.current);
            setText(DIALOGS[index]);
            setTyping(false);
            return;
        }
        if (index < DIALOGS.length - 1) setIndex(index + 1);
        else navigate("/unit4/level1/game");
    };

    const last = index === DIALOGS.length - 1;

    return (
        <BookLayout
            title="บทที่ 1 — จับสลิปปลอม"
            subtitle="ฟังบรีฟจากพี่เจนก่อนลงพื้นที่"
            rightLabel="ห้องสืบสวน"
            rightNote={`${index + 1} / ${DIALOGS.length}`}
            backgroundImage={room}
            onBack={() => navigate("/unit4/book")}

            leftPage={
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ padding: "18px 20px", borderRadius: "var(--radius-card)", background: "var(--paper-sunken)", border: "1px solid var(--paper-border)", boxShadow: "var(--shadow-card)" }}>
                        <h3 style={{ margin: "0 0 4px", fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                            สิ่งที่ต้องทำ
                        </h3>
                        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
                            ตรวจสลิปทีละใบ ทั้งหมด 5 ใบ แล้วตัดสินว่าใบไหนจริงใบไหนปลอม
                        </p>
                    </div>

                    <div>
                        <h3 style={{ margin: "0 0 12px", fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                            4 จุดที่ของปลอมมักพลาด
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {HINTS.map((hint, i) => (
                                <div
                                    key={hint.title}
                                    style={{
                                        display: "flex", gap: 14, padding: "14px 16px",
                                        borderRadius: 12, background: "rgba(255,255,255,.6)",
                                        border: "1px solid var(--paper-border)",
                                    }}
                                >
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            width: 30, height: 30, flex: "none", borderRadius: "50%",
                                            display: "grid", placeItems: "center",
                                            background: "var(--gold-gradient)", color: "#3A2708",
                                            fontSize: 14, fontWeight: 700,
                                        }}
                                    >
                                        {i + 1}
                                    </span>
                                    <span>
                                        <strong style={{ display: "block", fontSize: 15, color: "var(--text-primary)" }}>
                                            {hint.title}
                                        </strong>
                                        <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                                            {hint.detail}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: "16px 18px", borderRadius: "var(--radius-card)", background: "rgba(192,138,46,.1)", border: "1px solid var(--gold-main)", fontSize: 14, color: "var(--text-primary)" }}>
                        ตรวจครบทั้ง 5 ใบแล้วได้ Badge นักสืบ และบทที่ 2 จะเปิดให้ทันที
                    </div>
                </div>
            }

            rightPage={
                <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>
                    <img className="scene-photo" src={jane} alt="พี่เจน นักสืบรุ่นพี่ที่โต๊ะทำงาน" />

                    <div className="dialog-box">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>พี่เจน</strong>
                            <span style={{ fontSize: 12.5, color: "var(--text-gold)" }}>นักสืบรุ่นพี่</span>
                        </div>

                        <p className="dialog-text">
                            {text}
                            {typing && <span className="caret" aria-hidden="true" />}
                        </p>
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="dots" aria-hidden="true">
                            {DIALOGS.map((_, i) => (
                                <span key={i} className={`dot${i <= index ? " dot--on" : ""}`} />
                            ))}
                        </div>

                        <button type="button" className="primary-btn" onClick={advance}>
                            {typing ? "แสดงทั้งหมด" : last ? <>เริ่มตรวจสลิป <FaPlay size={13} /></> : <>ต่อไป <FaChevronRight size={13} /></>}
                        </button>

                    </div>
                </div>
            }
        />
    );
}
