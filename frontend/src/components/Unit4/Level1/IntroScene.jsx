import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BookLayout from "../BookLayout";
import jane from "../../../assets/unit4/Jane.png";
import "../styles/theme.css";

export default function Intro() {
    const navigate = useNavigate();
    const dialogs = [
        "ยินดีต้อนรับสู่ภารกิจแรกของ Cyber Trap!",
        "วันนี้เราได้รับแจ้งเหตุเกี่ยวกับสลิปโอนเงินปลอมระบาด",
        "สังเกตฟอนต์ ตัวเลข วันเวลา และ QR Code ให้ดีๆ ก่อนยืนยันนะครับ",
        "ถ้าพร้อมแล้ว กดปุ่มเริ่มภารกิจได้เลย!"
    ];

    const [index, setIndex] = useState(0);
    const [text, setText] = useState("");

    useEffect(() => {
        let i = 0;
        const current = dialogs[index];
        setText("");
        const timer = setInterval(() => {
            i++;
            setText(current.slice(0, i));
            if (i >= current.length) clearInterval(timer);
        }, 20);
        return () => clearInterval(timer);
    }, [index]);

    return (
        <BookLayout
            title="Chapter I: Investigation"
            subtitle="คู่มือและรายละเอียดภารกิจ"
            onBack={() => navigate("/unit4/book")}
            leftPage={
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ padding: 18, borderRadius: 14, background: "#FFF", border: "1px solid var(--paper-border)" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "var(--text-gold)", fontFamily: "var(--font-title)" }}>🎯 TARGET OBJECTIVES</h4>
                        <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-primary)", fontSize: 13, lineHeight: 1.8 }}>
                            <li>แยกแยะสลิปโอนเงินจริง และ สลิปปลอม</li>
                            <li>วิเคราะห์ความผิดปกติของตัวอักษรและเวลา</li>
                            <li>ทำคะแนนให้ได้ระดับ Rank A ขึ้นไป</li>
                        </ul>
                    </div>

                    <div style={{ padding: 18, borderRadius: 14, background: "rgba(212,175,55,0.08)", border: "1px solid var(--gold-main)" }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "var(--text-gold)", fontFamily: "var(--font-title)" }}>🏆 MISSION REWARD</h4>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)" }}>
                            +250 EXP • Detective Badge • Unlocks Chapter II
                        </p>
                    </div>
                </div>
            }
            rightPage={
                <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    {/* NPC Character */}
                    <motion.img
                        src={jane} alt="Jane"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        style={{ height: 220, objectFit: "contain", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }}
                    />

                    {/* Dialog Box */}
                    <div style={{
                        width: "100%", padding: 20, borderRadius: 16, background: "#FFF",
                        border: "1px solid var(--paper-border)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>พี่เจน (Senior Detective)</span>
                            <span style={{ fontSize: 12, color: "var(--text-gold)" }}>{index + 1}/{dialogs.length}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", minHeight: 48, lineHeight: 1.6 }}>
                            {text}
                        </p>
                    </div>

                    {/* Action Button */}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                            if (index < dialogs.length - 1) setIndex(index + 1);
                            else navigate("/unit4/level1/game");
                        }}
                        style={{
                            width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer",
                            background: "var(--gold-gradient)", color: "var(--text-primary)", fontWeight: 700,
                            fontSize: 15, fontFamily: "var(--font-title)", boxShadow: "0 4px 14px rgba(202,138,4,0.3)"
                        }}
                    >
                        {index < dialogs.length - 1 ? "NEXT DIALOG ▶" : "START MISSION 🚀"}
                    </motion.button>
                </div>
            }
        />
    );
}