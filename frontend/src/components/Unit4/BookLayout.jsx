import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import "../../styles/theme.css";
import defaultBackground from "../../assets/unit4/investigation-room.png";

export default function BookLayout({
    eyebrow = "CYBER TRAP DOSSIER",
    title,
    subtitle,
    rightLabel = "หลักฐานและบันทึก",
    rightNote = "ลับเฉพาะ",
    leftPage,
    rightPage,
    backgroundImage = defaultBackground,
    onBack,
    showBack = true,
    variant = "default",
}) {
    return (
        <div
            className={`book-stage ${variant !== "default" ? `book-stage--${variant}` : ""}`}
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >

            <motion.div
                className={`book-frame ${variant !== "default" ? `book-frame--${variant}` : ""}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* ---------- หน้าซ้าย : บรีฟและความคืบหน้า ---------- */}
                <div className="book-page book-page--left">
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute", inset: 0, opacity: 0.035, pointerEvents: "none",
                            backgroundImage:
                                "repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 5px)",
                        }}
                    />

                    <header
                        style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", gap: 16, zIndex: 2, marginBottom: 22,
                            paddingLeft: showBack ? 62 : 0,
                        }}
                    >
                        <div style={{ minWidth: 0 }}>
                            <span className="page-eyebrow">{eyebrow}</span>
                            <h1 className="page-title">{title}</h1>
                            {subtitle && <p className="page-sub">{subtitle}</p>}
                        </div>

                        {showBack && (
                            <button
                                type="button"
                                className="icon-btn"
                                onClick={onBack}
                                aria-label="ย้อนกลับ"
                            >
                                <FaArrowLeft size={15} />
                            </button>
                        )}
                    </header>

                    <div className="book-scroll" style={{ zIndex: 2 }}>{leftPage}</div>
                </div>

                <div className="book-spine" aria-hidden="true" />

                {/* ---------- หน้าขวา : เนื้อหาหลักที่ต้องกด ---------- */}
                <div className="book-page book-page--right">
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute", top: 0, right: 56, width: 20, height: 96,
                            background: "linear-gradient(180deg,#9B1C1C,#7A1717)",
                            borderRadius: "0 0 6px 6px",
                            boxShadow: "0 8px 16px rgba(0,0,0,.25)", zIndex: 5,
                        }}
                    />

                    <header
                        style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", gap: 16, zIndex: 2, marginBottom: 22,
                            paddingRight: 90,
                        }}
                    >
                        <span className="page-eyebrow">{rightLabel}</span>
                        <span style={{ fontSize: 11, letterSpacing: 1, color: "var(--text-muted)" }}>
                            {rightNote}
                        </span>
                    </header>

                    <div className="book-scroll" style={{ zIndex: 2 }}>{rightPage}</div>
                </div>

                <div className="book-gutter" aria-hidden="true" />
            </motion.div>
        </div>
    );
}
