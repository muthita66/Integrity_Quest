import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ResultFailed from "../../../../assets/unit1/level2/resultFailed.png";

export default function BossFailModal({
    open,
    onFail,
    title = "GAME OVER",
    message = "คุณตอบคำถามผิด!\nสมาธิหลุดลอย ต้องเริ่มใหม่อีกครั้ง",
}) {
    const navigate = useNavigate();
    const sealColor = "#7A2E2E"; // สีแดงสำหรับ fail

    // โหลดฟอนต์ธีมกระดาษ/หมึก
    useEffect(() => {
        if (!open) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
            "https://fonts.googleapis.com/css2?family=Noto+Serif+Thai:wght@500;700;900&family=Sarabun:wght@400;600&display=swap";
        document.head.appendChild(link);
        return () => {
            if (document.head.contains(link)) document.head.removeChild(link);
        };
    }, [open]);

    if (!open) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
                opacity: { duration: 0.7 },
                scale: { duration: 0.7, type: "spring", stiffness: 120, damping: 12 },
                y: { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
            }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-[999] p-4 backdrop-blur-sm"
        >
            {/* ตัวกรอง SVG สำหรับขอบกระดาษฉีก */}
            <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                    <filter id="tornEdgeBubble" x="-10%" y="-10%" width="120%" height="120%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="3" seed="7" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                    <filter id="paperGrainBubble">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="grain" />
                        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0.29  0 0 0 0 0.22  0 0 0 0 0.13  0 0 0 0.05 0" />
                    </filter>
                </defs>
            </svg>

            <motion.div
                initial={{ rotate: -6 }}
                animate={{ rotate: -1.5 }}
                transition={{ duration: 0.7, type: "spring", stiffness: 90, damping: 14 }}
                className="relative w-[620px] max-w-[92vw]"
                style={{ fontFamily: "'Sarabun', sans-serif" }}
            >
                {/* เงาแผ่นกระดาษ */}
                <div
                    className="absolute inset-0 translate-y-3 translate-x-1"
                    style={{ background: "#000", opacity: 0.28, filter: "url(#tornEdgeBubble) blur(6px)" }}
                />

                {/* แผ่นกระดาษ (ขอบฉีก) */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(160deg, #F1E4C4 0%, #E9D8AE 45%, #DFC896 100%)",
                        filter: "url(#tornEdgeBubble)",
                        boxShadow: "inset 0 0 60px rgba(120,90,45,0.35), inset 0 0 140px rgba(90,60,25,0.25)",
                    }}
                />
                <div
                    className="absolute inset-0 mix-blend-multiply opacity-40"
                    style={{ filter: "url(#tornEdgeBubble) url(#paperGrainBubble)" }}
                />

                <img src={ResultFailed} alt="Fail" className="absolute z-10 w-[150px] h-[150px] object-contain -top-15 left-1/2 -translate-x-1/2 " />

                {/* เนื้อหา */}
                <div className="relative z-10 flex flex-col items-center px-12 pt-16 pb-10 mt-10 text-center">
                    <h1
                        className="text-3xl font-black mb-3 text-center"
                        style={{
                            color: "#7A2E2E",
                            fontFamily: "'Noto Serif Thai', serif",
                            textShadow: "0 1px 0 rgba(255,255,255,0.3)",
                        }}
                    >
                        {title}
                    </h1>

                    <div className="w-40 h-[3px] mb-5 rounded-full" style={{ background: "#8a6a3c", opacity: 0.5 }} />

                    <p className="text-xl font-bold mb-6 whitespace-pre-line" style={{ color: "#4a3826" }}>
                        {message}
                    </p>

                    {/* ตราประทับหมึกคำตัดสิน */}
                    <div
                        className="mb-7 px-6 py-1.5 select-none"
                        style={{
                            color: sealColor,
                            border: `3px solid ${sealColor}`,
                            transform: "rotate(-4deg)",
                            fontFamily: "'Noto Serif Thai', serif",
                            fontWeight: 900,
                            letterSpacing: "0.15em",
                            opacity: 0.85,
                            borderRadius: "4px",
                        }}
                    >
                        ไม่ผ่าน
                    </div>

                    <div className="flex flex-row gap-3 justify-center items-center w-full">
                        <button onClick={() => navigate("/map")}
                            className="result-button result-button-yellow">
                            <span className="result-button-top">กลับหน้าหลัก</span>
                        </button>

                        <button
                            onClick={() => {
                                if (onFail) {
                                    onFail();
                                } else {
                                    window.location.reload();
                                }
                            }}
                            className="result-button result-button-red">
                            <span className="result-button-top">ลองอีกครั้ง</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
