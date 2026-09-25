import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ConfettiExplosion from "react-confetti-explosion";

import bgGame from "../../../../assets/unit1/level2/bgBubble.png";
import ButtonPass from "../../../../assets/unit1/button/buttonPass.png";
import ButtonRetry from "../../../../assets/unit1/button/buttonFailed.png";
import Button from "../../../../assets/unit1/button/button.png";

import bonusSound from "../../../../assets/sounds/BackgroundGame/Bonus.mp3";
import goodSound from "../../../../assets/sounds/BackgroundGame/Good.mp3";
import useGameMuted from "../../../../hooks/useGameMuted";

// character_image / mirror_image ที่เก็บใน DB เป็น path เต็มของไฟล์
// ในโฟลเดอร์ public (เช่น "/image/unit1/Result/LevelTwo/ResultPass.png")
// จึงใช้เป็น src ของ <img> ได้ตรง ๆ ไม่ต้อง import ผ่าน JS
const LEVEL_ID = 2;

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

const getToken = () => {
    return localStorage.getItem("token");
};

export default function BubbleResultPage() {
    const navigate = useNavigate();

    // ----------------------------------------------------------
    // ผลลัพธ์ของรอบนี้ (ค่าที่เปลี่ยนทุกครั้งที่เล่น)
    // เก็บมาจาก completeGame() ตอนจบเกม — ดูจุดที่ setItem ใน
    // useBossGame.js (key: "level2Result")
    // ----------------------------------------------------------
    const [playResult, setPlayResult] = useState(() => {
        try {
            const raw = localStorage.getItem("level2Result");
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.error("อ่าน level2Result ไม่สำเร็จ:", err);
            return null;
        }
    });

    // status จาก backend เป็น "PERFECT" หรือ "PASS" เสมอ
    // (Level 2 จบเกมได้แค่ 2 สถานะนี้ ไม่มี FAIL ค้าง)
    const status = playResult?.status || "PASS";
    const isPerfect = status === "PERFECT";
    const shouldRetry = false; // หน้านี้มาถึงได้ก็ต่อเมื่อจบเกมสำเร็จแล้วเท่านั้น

    // ----------------------------------------------------------
    // ข้อความ Static จาก DB (level_result_messages) — ไม่ hardcode
    // เนื้อหาซ้ำในไฟล์นี้ ถ้ายังไม่มาก็โชว์ loading จนกว่าจะมาถึง
    // ----------------------------------------------------------
    const [resultText, setResultText] = useState(null);
    const [messageError, setMessageError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchResultMessage = async () => {
            try {
                const token = getToken();

                const response = await fetch(
                    `http://localhost:5000/api/level-result/${LEVEL_ID}/${status}`,
                    {
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {},
                    }
                );

                if (!response.ok) {
                    if (!cancelled) setMessageError(true);
                    return;
                }

                const result = await response.json();

                if (!cancelled && result?.data) {
                    setResultText(result.data);
                }
            } catch (err) {
                console.error(
                    "ดึงข้อความ Result ไม่สำเร็จ:",
                    err
                );
                if (!cancelled) setMessageError(true);
            }
        };

        fetchResultMessage();

        return () => {
            cancelled = true;
        };
    }, [status]);

    const characterImg = resultText?.character_image;

    const charGlowColor = shouldRetry
        ? "rgba(220,80,80,0.55)"
        : "rgba(243, 219, 89, 0.5)";

    useEffect(() => {
        if (isPerfect) {
            localStorage.setItem("bonusHP", "5");
        } else {
            localStorage.removeItem("bonusHP");
        }
    }, [isPerfect]);

    const handleReplay = () => {
        localStorage.removeItem("level2Result");
        localStorage.removeItem("bonusHP");
        navigate("/unit1/level2");
    };

    const handleBackMap = () => {
        navigate("/map");
    };

    const sealColor = shouldRetry ? "#7A2E2E" : "#3F5A34";

    const [showExplosion, setShowExplosion] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowExplosion(false), 2200);
        return () => clearTimeout(timer);
    }, []);

    // ----------------------------------------------------------
    // IP ที่ได้รอบนี้
    // ----------------------------------------------------------
    const bubbleIP = playResult?.bubble_ip ?? 0;
    const bonusIP = playResult?.bonus_ip ?? 0;
    const earnedIP = playResult?.earned_ip ?? bubbleIP + bonusIP;
    const totalIP = playResult?.total_integrity_points ?? null;

    // ----------------------------------------------------------
    // เสียงผลลัพธ์ เล่นครั้งเดียวตอนเปิดหน้า ไม่วน
    // - ผ่านรอบแรก ได้โบนัส +3  → Bonus
    // - ผ่านธรรมดา ไม่มีโบนัส   → Good
    // (กรณีผิดจะเล่น GameOver ใน BossFailModal แทน)
    // ----------------------------------------------------------
    const [muted] = useGameMuted();
    const soundPlayedRef = useRef(false);
    const gotBonus = isPerfect && bonusIP > 0;

    useEffect(() => {
        // รอให้ข้อความจาก DB มาก่อน เสียงจะได้ดังพร้อมหน้าจอผลลัพธ์
        if (!resultText || soundPlayedRef.current) return;
        soundPlayedRef.current = true;

        if (muted) return;

        const audio = new Audio(gotBonus ? bonusSound : goodSound);
        audio.volume = 0.6;
        audio.play().catch(() => { });
    }, [resultText, gotBonus, muted]);

    // ----------------------------------------------------------
    // ระหว่างรอ fetch ข้อความจาก DB — ไม่มี fallback text/image
    // hardcode ในไฟล์นี้แล้ว ต้องรอข้อมูลจริงจาก DB เท่านั้น
    // ----------------------------------------------------------
    if (!resultText) {
        return (
            <div
                className="h-screen w-screen flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: `url(${bgGame})` }}
            >
                <div className="bg-white/90 border-4 border-black rounded-2xl px-10 py-6 text-center shadow-[6px_6px_0px_black]">
                    <p className="text-2xl sarabun-bold">
                        {messageError
                            ? "ไม่สามารถโหลดข้อมูลผลลัพธ์ได้"
                            : "กำลังโหลดผลลัพธ์..."}
                    </p>
                </div>
            </div>
        );
    }

    const verdictWord = resultText.verdict_label;

    return (
        <div
            className="h-screen w-screen flex items-center justify-center bg-cover bg-center bg-fixed relative overflow-hidden sarabun-bold"
            style={{ backgroundImage: `url(${bgGame})`, fontFamily: "'Sarabun', sans-serif" }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(20,14,8,0.35) 0%, rgba(10,7,4,0.78) 100%)",
                }}
            />

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
                            animation: `mirrorDotFloat ${p.dur} ${p.delay} ease-in-out infinite alternate`,
                        }}
                    />
                ))}
            </div>

            <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                    <filter id="tornEdge" x="-10%" y="-10%" width="120%" height="120%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="3" seed="7" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                    <filter id="paperGrain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="grain" />
                        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0.29  0 0 0 0 0.22  0 0 0 0 0.13  0 0 0 0.05 0" />
                    </filter>
                </defs>
            </svg>

            {showExplosion && !shouldRetry && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[100]">
                    <ConfettiExplosion
                        force={0.5}
                        duration={2200}
                        particleCount={220}
                        width={1800}
                        colors={["#FFD700", "#FF6B6B", "#4ECDC4", "#A29BFE", "#FFFFFF", "#FDCB6E"]}
                    />
                </div>
            )}

            <div className="relative z-20 flex items-end justify-center w-full max-w-6xl px-4">
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.7,
                        rotate: -6,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: -1.5,
                    }}
                    transition={{
                        opacity: { duration: 0.7 },
                        scale: {
                            duration: 0.7,
                            type: "spring",
                            stiffness: 120,
                            damping: 12,
                        },
                        rotate: {
                            duration: 0.7,
                            type: "spring",
                            stiffness: 90,
                            damping: 14,
                        },
                    }}
                    className="relative w-[900px] min-h-[500px] max-w-[95vw] flex-shrink-0"
                >
                    <div
                        className="absolute inset-0 translate-y-4 translate-x-2"
                        style={{
                            background: "#000",
                            opacity: 0.35,
                            filter: "url(#tornEdge) blur(10px)",
                        }}
                    />

                    <div
                        className="absolute inset-0 pointer-events-none z-30"
                        style={{
                            background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 25%)",
                            filter: "url(#tornEdge)",
                        }}
                    />

                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(160deg, #F1E4C4 0%, #E9D8AE 40%, #DFC896 70%, #D3B96A 100%)",
                            filter: "url(#tornEdge)",
                            boxShadow:
                                "inset 0 0 60px rgba(120,90,45,0.4), inset 0 0 140px rgba(90,60,25,0.3), inset 2px 2px 8px rgba(255,255,200,0.5)",
                        }}
                    />
                    <div
                        className="absolute inset-0 mix-blend-multiply opacity-40"
                        style={{ filter: "url(#tornEdge) url(#paperGrain)" }}
                    />

                    <div className="relative z-50 flex flex-col items-center px-12 pt-20 pb-10">
                        <img
                            src={resultText.mirror_image}
                            alt=""
                            className="w-50 h-50 object-contain absolute -top-20 left-1/2 -translate-x-1/2"
                        />

                        <h1
                            className="text-3xl md:text-4xl font-black mt-12 mb-3 text-center"
                            style={{
                                color: "#3B2A1E",
                                textShadow: "0 1px 0 rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.12)",
                            }}
                        >
                            {resultText.title}
                        </h1>

                        <div className="w-40 h-[3px] mb-5 rounded-full" style={{ background: "#8a6a3c", opacity: 0.5 }} />

                        <p
                            className="text-lg font-semibold mb-4 text-center leading-relaxed"
                            style={{ color: "#4a3826" }}
                        >
                            {resultText.description} <br />
                            <span
                                className="font-extrabold text-xl"
                                style={{ color: isPerfect ? "#3F5A34" : "#8a6a3c" }}
                            >
                                {resultText.highlight_text}
                            </span>
                        </p>

                        {/* ----------------------------------------------------
                            ป้าย IP ที่ได้รอบนี้
                        ---------------------------------------------------- */}
                        <div className="mb-5 flex items-center gap-2">
                            <span className="text-2xl font-black"
                                style={{ color: "#3F5A34" }}>
                                +{earnedIP} IP
                            </span>

                            {isPerfect && bonusIP > 0 && (
                                <span
                                    className="text-sm font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: "#F3DB59",
                                        color: "#5A4416",
                                    }}
                                >
                                    โบนัสผ่านรอบแรก +{bonusIP}
                                </span>
                            )}
                        </div>

                        <div
                            className="mb-7 px-6 py-1.5 select-none text-xl"
                            style={{
                                color: sealColor,
                                border: `3px solid ${sealColor}`,
                                transform: "rotate(-4deg)",
                                fontWeight: 900,
                                letterSpacing: "0.15em",
                                opacity: 0.85,
                                borderRadius: "4px",
                                textShadow: `0 0 8px ${sealColor}66`,
                                boxShadow: `0 0 14px ${sealColor}44`,
                            }}
                        >
                            {verdictWord}
                        </div>

                        <div className="flex flex-row gap-3 mt-3 justify-center items-center w-full">
                            <div className="plaque-button-wrapper">
                                <button
                                    onClick={handleBackMap}
                                    className="plaque-button"
                                >
                                    <img
                                        src={Button}
                                        alt=""
                                        className="plaque-image"
                                    />

                                    <span className="plaque-text">
                                        กลับหน้าหลัก
                                    </span>
                                </button>
                            </div>

                            <div className="plaque-button-wrapper">
                                <button
                                    onClick={() => navigate("/unit1/final")}
                                    className="plaque-button"
                                >
                                    <img
                                        src={ButtonPass}
                                        alt=""
                                        className="plaque-image"
                                    />

                                    <span className="plaque-text-green">
                                        ภารกิจถัดไป
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 60, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
                    transition={{
                        opacity: { duration: 0.8, delay: 0.4 },
                        x: { duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 },
                        y: { duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.5 },
                    }}
                    className="absolute bottom-0 right-0 z-30"
                    style={{
                        top: "-3%",
                        right: "-4%",
                    }}
                >
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-6 rounded-full"
                        style={{
                            background: "rgba(0,0,0,0.35)",
                            filter: "blur(10px)",
                            zIndex: -1,
                        }}
                    />
                    <img
                        src={characterImg}
                        alt="Result character"
                        className="relative w-[340px] md:w-[430px] lg:w-[500px] object-contain"
                        style={{
                            filter: `drop-shadow(0 8px 24px ${charGlowColor}) drop-shadow(0 0 40px ${charGlowColor})`,
                        }}
                    />
                </motion.div>
            </div>

            <style>{`
                @keyframes mirrorDotFloat {
                    0%   { transform: translateY(0px) scale(1);     opacity: 0.3; }
                    50%  { transform: translateY(-18px) scale(1.3); opacity: 0.8; }
                    100% { transform: translateY(-32px) scale(0.7); opacity: 0.1; }
                }
            `}</style>
        </div>
    );
}