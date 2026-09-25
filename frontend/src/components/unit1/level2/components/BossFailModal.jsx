import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import LogoFailed from "../../../../assets/unit1/level2/result/LogoFailed.png";
import ResultFailed from "../../../../assets/unit1/level2/result/Failed.png";
import ButtonRetry from "../../../../assets/unit1/button/buttonFailed.png";
import Button from "../../../../assets/unit1/button/button.png";

import gameOverSound from "../../../../assets/sounds/BackgroundGame/GameOver.mp3";
import useGameMuted from "../../../../hooks/useGameMuted";

// ละอองแสงลอย — ตำแหน่งคงที่
const PARTICLES = [
    { left: "8%", top: "15%", size: 5, delay: "0s", dur: "7s", opacity: 0.7 },
    { left: "15%", top: "65%", size: 3, delay: "1.2s", dur: "9s", opacity: 0.5 },
    { left: "25%", top: "35%", size: 4, delay: "2.5s", dur: "8s", opacity: 0.6 },
    { left: "45%", top: "80%", size: 3, delay: "0.8s", dur: "10s", opacity: 0.4 },
    { left: "60%", top: "20%", size: 5, delay: "3s", dur: "6.5s", opacity: 0.65 },
    { left: "72%", top: "55%", size: 4, delay: "1.8s", dur: "8.5s", opacity: 0.5 },
    { left: "85%", top: "30%", size: 3, delay: "0.4s", dur: "11s", opacity: 0.45 },
    { left: "90%", top: "70%", size: 5, delay: "2.1s", dur: "7.5s", opacity: 0.6 },
];

export default function BossFailModal({
    open,
    onFail,
    title = "ภารกิจไม่สำเร็จ!",
    message = "คุณยังแยกแยะเหตุผลที่บิดเบือนออกจากเหตุผลที่ถูกต้องได้ไม่ครบ",
}) {
    const navigate = useNavigate();
    const sealColor = "#7A2E2E";
    const [muted] = useGameMuted();

    // เสียง GameOver เล่นครั้งเดียวทุกครั้งที่ modal เปิดขึ้นมา ไม่วน
    useEffect(() => {
        if (!open || muted) return;

        const audio = new Audio(gameOverSound);
        audio.volume = 0.6;
        audio.play().catch(() => { });

        // ปิด modal (กดลองอีกครั้ง/กลับหน้าหลัก) แล้วหยุดเสียงทันที
        return () => {
            audio.pause();
            audio.src = "";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

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
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.5, type: "spring", stiffness: 120, damping: 12 },
            }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-[999] p-4 backdrop-blur-sm"
            style={{ fontFamily: "'Sarabun', sans-serif" }}
        >
            {/* ละอองแสง */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {PARTICLES.map((p, i) => (
                    <span
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            opacity: p.opacity,
                            background: "white",
                            boxShadow: `0 0 ${p.size * 3}px ${p.size}px rgba(255,255,230,0.8)`,
                            animation: `bossFailDotFloat ${p.dur} ${p.delay} ease-in-out infinite alternate`,
                        }}
                    />
                ))}
            </div>

            {/* SVG filters */}
            <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                    <filter id="tornEdgeBossModal" x="-10%" y="-10%" width="120%" height="120%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="3" seed="7" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                    <filter id="paperGrainBossModal">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="grain" />
                        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0.29  0 0 0 0 0.22  0 0 0 0 0.13  0 0 0 0.05 0" />
                    </filter>
                </defs>
            </svg>

            {/* Layout: กระดาษ + ตัวละคร */}
            <div className="relative z-20 flex items-end justify-center w-full max-w-6xl px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
                    animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
                    transition={{
                        opacity: { duration: 0.7 },
                        scale: { duration: 0.7, type: "spring", stiffness: 120, damping: 12 },
                        rotate: { duration: 0.7, type: "spring", stiffness: 90, damping: 14 },
                    }}
                    className="relative w-[900px] min-h-[500px] max-w-[95vw] flex-shrink-0"
                >
                    {/* เงากระดาษ */}
                    <div
                        className="absolute inset-0 translate-y-4 translate-x-2"
                        style={{
                            background: "#000",
                            opacity: 0.35,
                            filter: "url(#tornEdgeBossModal) blur(10px)",
                        }}
                    />

                    {/* shimmer ขอบบน */}
                    <div
                        className="absolute inset-0 pointer-events-none z-30"
                        style={{
                            background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 25%)",
                            filter: "url(#tornEdgeBossModal)",
                        }}
                    />

                    {/* กระดาษหลัก */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: "linear-gradient(160deg, #F1E4C4 0%, #E9D8AE 40%, #DFC896 70%, #D3B96A 100%)",
                            filter: "url(#tornEdgeBossModal)",
                            boxShadow:
                                "inset 0 0 60px rgba(120,90,45,0.4), inset 0 0 140px rgba(90,60,25,0.3), inset 2px 2px 8px rgba(255,255,200,0.5)",
                        }}
                    />
                    <div
                        className="absolute inset-0 mix-blend-multiply opacity-40"
                        style={{ filter: "url(#tornEdgeBossModal) url(#paperGrainBossModal)" }}
                    />

                    {/* เนื้อหา */}
                    <div className="relative z-50 flex flex-col items-center px-12 pt-20 pb-10">
                        {/* Logo */}
                        <img
                            src={LogoFailed}
                            alt="Failed"
                            className="w-50 h-50 object-contain absolute -top-20 left-1/2 -translate-x-1/2"
                        />

                        <h1
                            className="text-3xl md:text-4xl font-black mt-12 mb-3 text-center"
                            style={{
                                color: "#3B2A1E",
                                fontFamily: "'Noto Serif Thai', serif",
                                textShadow: "0 1px 0 rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.12)",
                            }}
                        >
                            {title}
                        </h1>

                        <div className="w-40 h-[3px] mb-5 rounded-full" style={{ background: "#8a6a3c", opacity: 0.5 }} />

                        <p
                            className="text-lg font-semibold mb-6 text-center leading-relaxed"
                            style={{ color: "#4a3826" }}
                        >
                            {message}
                            <br />
                            <span className="font-extrabold text-xl" style={{ color: "#7A2E2E" }}>
                                ทบทวนแต่ละแนวคิดอย่างรอบคอบ <br />แล้วกลับมาพิสูจน์การตัดสินใจของคุณอีกครั้ง
                            </span>
                        </p>

                        {/* ตราประทับ */}
                        <div
                            className="mb-7 px-6 py-1.5 select-none text-xl"
                            style={{
                                color: sealColor,
                                border: `3px solid ${sealColor}`,
                                transform: "rotate(-4deg)",
                                fontFamily: "'Noto Serif Thai', serif",
                                fontWeight: 900,
                                letterSpacing: "0.15em",
                                opacity: 0.85,
                                borderRadius: "4px",
                                textShadow: `0 0 8px ${sealColor}66`,
                                boxShadow: `0 0 14px ${sealColor}44`,
                            }}
                        >
                            ไม่ผ่าน
                        </div>

                        {/* ปุ่ม */}
                        <div className="flex flex-row gap-3 mt-3 justify-center items-center w-full">
                            <div className="plaque-button-wrapper">
                                <button onClick={() => navigate("/map")} className="plaque-button">
                                    <img src={Button} alt="" className="plaque-image" />
                                    <span className="plaque-text">กลับหน้าหลัก</span>
                                </button>
                            </div>

                            <div className="plaque-button-wrapper">
                                <button
                                    onClick={() => {
                                        if (onFail) {
                                            onFail();
                                        } else {
                                            window.location.reload();
                                        }
                                    }}
                                    className="plaque-button"
                                >
                                    <img src={ButtonRetry} alt="" className="plaque-image" />
                                    <span className="plaque-text-red">ลองอีกครั้ง</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ตัวละคร fail ลอยด้านขวา */}
                <motion.div
                    initial={{ opacity: 0, x: 60, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
                    transition={{
                        opacity: { duration: 0.8, delay: 0.4 },
                        x: { duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 },
                        y: { duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.5 },
                    }}
                    className="absolute bottom-0 right-0 z-30"
                    style={{ top: "-3%", right: "-4%" }}
                >
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-6 rounded-full"
                        style={{ background: "rgba(0,0,0,0.35)", filter: "blur(10px)", zIndex: -1 }}
                    />
                    <img
                        src={ResultFailed}
                        alt="Fail character"
                        className="relative w-[340px] md:w-[430px] lg:w-[500px] object-contain"
                        style={{
                            filter: `drop-shadow(0 8px 24px rgba(220,80,80,0.55)) drop-shadow(0 0 40px rgba(220,80,80,0.55))`,
                        }}
                    />
                </motion.div>
            </div>

            <style>{`
                @keyframes bossFailDotFloat {
                    0%   { transform: translateY(0px) scale(1);     opacity: 0.3; }
                    50%  { transform: translateY(-18px) scale(1.3); opacity: 0.8; }
                    100% { transform: translateY(-32px) scale(0.7); opacity: 0.1; }
                }
            `}</style>
        </motion.div>
    );
}