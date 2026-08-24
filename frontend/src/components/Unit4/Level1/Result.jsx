import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/theme.css";

export default function Result() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const score = state?.score ?? 0;
    const total = state?.total ?? 5;
    const percent = Math.round((score / total) * 100);

    const getRank = () => {
        if (percent === 100) return "S";
        if (percent >= 80) return "A";
        if (percent >= 60) return "B";
        return "C";
    };

    const handleFinish = () => {
        localStorage.setItem("unit4", JSON.stringify({ level1: true, level2: true, level3: false }));
        navigate("/unit4/book");
    };

    return (
        <div style={{
            width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-radial)", fontFamily: "var(--font-serif)", overflow: "hidden", userSelect: "none"
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{
                    width: "90%", maxWidth: 520, background: "#FFF", borderRadius: 24, padding: 36,
                    boxShadow: "0 25px 60px rgba(0,0,0,0.5)", textAlign: "center", position: "relative"
                }}
            >
                <span style={{ color: "var(--text-gold)", fontSize: 12, fontWeight: 800, letterSpacing: 3, fontFamily: "var(--font-title)" }}>
                    MISSION COMPLETED
                </span>
                <h2 style={{ margin: "6px 0 16px 0", fontSize: 28, color: "var(--text-primary)" }}>สรุปผลการสืบสวน</h2>

                {/* Rank Circle */}
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                    style={{
                        width: 90, height: 90, borderRadius: "50%", background: "var(--gold-gradient)",
                        margin: "0 auto 20px auto", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 42, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-title)",
                        boxShadow: "0 10px 20px rgba(202,138,4,0.3)"
                    }}
                >
                    {getRank()}
                </motion.div>

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                    <div style={{ padding: 14, borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                        <span style={{ fontSize: 11, color: "#64748B" }}>ACCURACY SCORE</span>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>{score} / {total}</div>
                    </div>
                    <div style={{ padding: 14, borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                        <span style={{ fontSize: 11, color: "#64748B" }}>EXP EARNED</span>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>+{score * 50} XP</div>
                    </div>
                </div>

                {/* Action Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleFinish}
                    style={{
                        width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer",
                        background: "var(--gold-gradient)", color: "var(--text-primary)", fontWeight: 700,
                        fontSize: 15, fontFamily: "var(--font-title)", boxShadow: "0 4px 14px rgba(202,138,4,0.3)"
                    }}
                >
                    RETURN TO DOSSIER 📖
                </motion.button>
            </motion.div>
        </div>
    );
}