import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/theme.css";

export default function BookLayout({
    title,
    subtitle,
    leftPage,
    rightPage,
    onBack,
    showBack = true,
}) {
    return (
        <div style={{
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            background: "var(--bg-radial)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            fontFamily: "var(--font-serif)",
            userSelect: "none",
        }}>
            {/* Background Ambient Glow */}
            <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                style={{
                    position: "absolute", width: 800, height: 800, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(212, 175, 55, 0.15), transparent 70%)",
                    filter: "blur(80px)", pointerEvents: "none",
                }}
            />

            {/* BOOK FRAME */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                    width: "92%",
                    maxWidth: 1380,
                    height: "86vh",
                    maxHeight: 820,
                    display: "flex",
                    position: "relative",
                    borderRadius: 24,
                    boxShadow: "0 30px 90px rgba(0,0,0,0.75), 0 0 0 12px #1E120A",
                    background: "#1E120A",
                }}
            >
                {/* LEFT PAGE */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "36px 42px",
                    position: "relative",
                    background: "var(--paper-bg-left)",
                    borderTopLeftRadius: 18,
                    borderBottomLeftRadius: 18,
                    overflow: "hidden",
                }}>
                    {/* Paper Texture Overlay */}
                    <div style={{
                        position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
                        backgroundImage: "repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 1px, transparent 4px)"
                    }} />

                    {/* Page Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2, marginBottom: 20 }}>
                        <div>
                            <span style={{ color: "var(--text-gold)", letterSpacing: 4, fontWeight: 800, fontSize: 11, fontFamily: "var(--font-title)" }}>
                                CYBER TRAP DOSSIER
                            </span>
                            <h1 style={{ margin: "4px 0 0 0", color: "var(--text-primary)", fontSize: 32, fontFamily: "var(--font-title)", fontWeight: 700, lineHeight: 1.1 }}>
                                {title}
                            </h1>
                            {subtitle && <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)", fontSize: 14 }}>{subtitle}</p>}
                        </div>
                        {showBack && (
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={onBack}
                                style={{
                                    width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--paper-border)",
                                    cursor: "pointer", background: "#FFF", color: "var(--text-primary)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                                }}
                            >
                                <FaArrowLeft size={14} />
                            </motion.button>
                        )}
                    </div>

                    {/* Left Page Content */}
                    <div style={{ flex: 1, zIndex: 2, overflowY: "auto", paddingRight: 4 }}>
                        {leftPage}
                    </div>
                </div>

                {/* BOOK SPINE (สันหนังสือตรงกลาง) */}
                <div style={{
                    width: 24, position: "relative", zIndex: 10,
                    background: "linear-gradient(90deg, #3A2312, #855829 40%, #D4AF37 50%, #855829 60%, #3A2312)",
                    boxShadow: "inset 2px 0 8px rgba(0,0,0,0.8), inset -2px 0 8px rgba(0,0,0,0.8)",
                }} />

                {/* RIGHT PAGE */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "36px 42px",
                    position: "relative",
                    background: "var(--paper-bg-right)",
                    borderTopRightRadius: 18,
                    borderBottomRightRadius: 18,
                    overflow: "hidden",
                }}>
                    {/* Bookmark Decoration */}
                    <div style={{
                        position: "absolute", top: 0, right: 60, width: 22, height: 110,
                        background: "linear-gradient(180deg, #991B1B, #7F1D1D)",
                        borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
                        boxShadow: "0 8px 16px rgba(0,0,0,0.3)", zIndex: 5,
                    }} />

                    {/* Page Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2, marginBottom: 20 }}>
                        <span style={{ color: "var(--text-gold)", fontWeight: 800, letterSpacing: 3, fontSize: 11, fontFamily: "var(--font-title)" }}>
                            EVIDENCE & RECORDS
                        </span>
                        <span style={{ color: "var(--text-secondary)", fontSize: 11, fontFamily: "var(--font-title)", letterSpacing: 1 }}>
                            CONFIDENTIAL
                        </span>
                    </div>

                    {/* Right Page Content */}
                    <div style={{ flex: 1, zIndex: 2, overflowY: "auto", paddingRight: 4 }}>
                        {rightPage}
                    </div>
                </div>

                {/* Inner Spine Shadow */}
                <div style={{
                    position: "absolute", left: "50%", top: 0, bottom: 0, width: 100, transform: "translateX(-50%)",
                    pointerEvents: "none", zIndex: 8,
                    background: "linear-gradient(90deg, rgba(0,0,0,0.18), transparent 45%, transparent 55%, rgba(0,0,0,0.18))",
                }} />
            </motion.div>
        </div>
    );
}