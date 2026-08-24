import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

export default function BookCover() {
    const navigate = useNavigate();
    const [opening, setOpening] = useState(false);

    const handleOpen = () => {
        setOpening(true);
        setTimeout(() => {
            navigate("/unit4/book");
        }, 800);
    };

    return (
        <div style={{
            width: "100vw", height: "100vh", overflow: "hidden", position: "relative",
            display: "flex", justifyContent: "center", alignItems: "center",
            background: "var(--bg-radial)", fontFamily: "var(--font-serif)", userSelect: "none",
        }}>
            {/* Magic Glow Effect */}
            <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                style={{
                    position: "absolute", width: 700, height: 700, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }}
            />

            {/* BOOK OBJECT */}
            <motion.div
                animate={opening ? { scale: 1.15, rotateY: -15, opacity: 0 } : { y: [0, -10, 0] }}
                transition={opening ? { duration: 0.8 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
                onClick={handleOpen}
                style={{
                    width: 360, height: 500, cursor: "pointer", borderRadius: 16, position: "relative",
                    background: "linear-gradient(145deg, #1E293B, #0F172A)",
                    border: "4px solid var(--gold-main)",
                    boxShadow: "0 30px 70px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.8)",
                    padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
                }}
            >
                {/* Leather Texture */}
                <div style={{
                    position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none",
                    backgroundImage: "radial-gradient(#FFF 1px, transparent 1px)", backgroundSize: "8px 8px",
                }} />

                {/* Gold Frame Border */}
                <div style={{
                    position: "absolute", inset: 12, border: "1px solid rgba(212,175,55,0.4)", borderRadius: 10, pointerEvents: "none",
                }} />

                {/* Header */}
                <div style={{ textAlign: "center", marginTop: 20, zIndex: 2 }}>
                    <span style={{ color: "var(--gold-main)", fontWeight: 700, fontSize: 11, letterSpacing: 5, fontFamily: "var(--font-title)" }}>
                        INTEGRITY QUEST
                    </span>
                    <h1 style={{
                        margin: "12px 0 0 0", fontSize: 42, fontFamily: "var(--font-title)", fontWeight: 800,
                        background: "var(--gold-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        letterSpacing: 2, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
                    }}>
                        CYBER TRAP
                    </h1>
                    <div style={{ width: 60, height: 2, background: "var(--gold-main)", margin: "12px auto 0 auto" }} />
                </div>

                {/* Emblem / Badge */}
                <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    style={{
                        width: 110, height: 110, borderRadius: "50%",
                        background: "radial-gradient(circle, #2A1A0A, #0F0904)",
                        border: "2px solid var(--gold-main)", boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, zIndex: 2
                    }}
                >
                    🕵️
                </motion.div>

                {/* Bottom Call to Action */}
                <div style={{ textAlign: "center", marginBottom: 15, zIndex: 2 }}>
                    <p style={{ color: "#94A3B8", fontSize: 13, margin: "0 0 16px 0", letterSpacing: 1 }}>
                        Digital Fraud Investigation
                    </p>
                    <div style={{
                        padding: "10px 24px", borderRadius: 99, background: "rgba(212,175,55,0.15)",
                        border: "1px solid var(--gold-main)", color: "var(--gold-light)",
                        fontSize: 12, fontWeight: 700, letterSpacing: 2, fontFamily: "var(--font-title)",
                    }}>
                        CLICK TO UNFOLD
                    </div>
                </div>
            </motion.div>
        </div>
    );
}