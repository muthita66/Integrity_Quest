import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ResultHappy from "../../../../assets/unit1/level2/resultHappy.png";
import LevelUpSound from "../../../../assets/sounds/level_up.mp3";

function useCountUp(target, duration = 900) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            setValue(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);
    return value;
}

export default function BubbleResultModal({ score }) {
    const navigate = useNavigate();
    const displayScore = useCountUp(score);
    const sealColor = "#3F5A34"; // เขียว = ผ่าน (เปลี่ยนเป็น #7A2E2E ถ้าอยากได้โทนแดงสำหรับ fail)

    useEffect(() => {
        const audio = new Audio(LevelUpSound);
        audio.play().catch(() => { });
        return () => audio.pause();
    }, []);

    // โหลดฟอนต์ธีมกระดาษ/หมึก
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
            "https://fonts.googleapis.com/css2?family=Noto+Serif+Thai:wght@500;700;900&family=Sarabun:wght@400;600&display=swap";
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
                opacity: { duration: 0.7 },
                scale: { duration: 0.7, type: "spring", stiffness: 120, damping: 12 },
                y: { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
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

                {/* confetti บางๆ */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.span
                        key={i}
                        className="absolute top-0 w-2 h-2 rounded-sm z-10"
                        style={{
                            left: `${(i * 71) % 100}%`,
                            backgroundColor: ["#C0392B", "#27735E", "#2E5C8A", "#B7791F"][i % 4],
                        }}
                        initial={{ y: -20, opacity: 0, rotate: 0 }}
                        animate={{ y: 400, opacity: [0, 1, 1, 0], rotate: 360 }}
                        transition={{
                            duration: 2.2 + (i % 5) * 0.3,
                            delay: i * 0.08,
                            repeat: Infinity,
                            repeatDelay: 1.5,
                            ease: "easeIn",
                        }}
                    />
                ))}

                <img src={ResultHappy} alt="" className="absolute z-10 w-[150px] h-[150px] object-contain -top-15 left-1/2 -translate-x-1/2 " />

                {/* เนื้อหา */}
                <div className="relative z-10 flex flex-col items-center px-12 pt-16 pb-10 mt-10 mb-4">
                    <h1
                        className="text-2xl font-black mb-3 text-center"
                        style={{
                            color: "#3B2A1E",
                        }}
                    >
                        คุณทำลายข้ออ้างของการโกงได้ทั้งหมด
                    </h1>
                    <p className="text-base mb-2">เมื่อรู้เท่าทันข้ออ้าง คุณก็เลือกทำสิ่งที่ถูกต้องได้เสมอ</p>

                    <div className="w-40 h-[3px] mb-5 rounded-full" style={{ background: "#8a6a3c", opacity: 0.5 }} />

                    <p className="text-2xl font-bold" style={{ color: "#4a3826" }}>คะแนน</p>
                    <p
                        className="text-5xl font-black mb-1"
                        style={{ color: "#3B2A1E", fontFamily: "'Noto Serif Thai', serif" }}
                    >
                        {displayScore}
                    </p>
                    <p className="font-bold text-sm mb-6" style={{ color: "#3F5A34" }}>+ 5 HP</p>

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
                        ผ่าน
                    </div>

                    <div className="flex flex-row gap-3 justify-center items-center w-full">
                        <button onClick={() => navigate("/map")}
                            className="result-button result-button-yellow">
                            <span className="result-button-top">กลับหน้าหลัก</span>
                        </button>
                        <button onClick={() => navigate("/unit1/final")}
                            className="result-button result-button-green">
                            <span className="result-button-top">ด่านต่อไป</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}