import { BASE_URL } from "../../../../config";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ConfettiExplosion from "react-confetti-explosion";

import bgGame from "../../../../assets/unit1/level2/bgBubble.png";

import bonusSound from "../../../../assets/sounds/BackgroundGame/Bonus.mp3";
import goodSound from "../../../../assets/sounds/BackgroundGame/Good.mp3";
import useGameMuted from "../../../../hooks/useGameMuted";

import "../../../../styles/unit1/Level1/button.css";

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
    const [playResult, setPlayResult] = useState(() => {
        try {
            const raw = localStorage.getItem("level2Result");
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.error("อ่าน level2Result ไม่สำเร็จ:", err);
            return null;
        }
    });

    const status = playResult?.status || "PASS";
    const isPerfect = status === "PERFECT";
    const shouldRetry = false; // หน้านี้มาถึงได้ก็ต่อเมื่อจบเกมสำเร็จแล้วเท่านั้น
    const [resultText, setResultText] = useState(null);
    const [messageError, setMessageError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchResultMessage = async () => {
            try {
                const token = getToken();

                const response = await fetch(
                    `${BASE_URL}/api/level-result/${LEVEL_ID}/${status}`,
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

    const sealColor = shouldRetry ? "#991B1B" : "#166534";

    const [showExplosion, setShowExplosion] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowExplosion(false), 2200);
        return () => clearTimeout(timer);
    }, []);

    const bubbleIP = playResult?.bubble_ip ?? 0;
    const bonusIP = playResult?.bonus_ip ?? 0;
    const earnedIP = playResult?.earned_ip ?? bubbleIP + bonusIP;
    const totalIP = playResult?.total_integrity_points ?? null;

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

    if (!resultText) {
        return (
            <div className="h-dvh w-screen flex items-center justify-center bg-black">
                <p className="text-2xl sarabun-bold text-white">
                    {messageError
                        ? "ไม่สามารถโหลดข้อมูลผลลัพธ์ได้"
                        : "กำลังโหลดผลลัพธ์..."}
                </p>
            </div>
        );
    }

    const verdictWord = resultText.verdict_label;

    return (
        <div
            className="h-dvh w-screen flex items-center justify-center bg-cover bg-center bg-fixed relative overflow-hidden sarabun-bold"
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

            <div className="relative z-20 flex items-center justify-center w-full max-w-6xl px-4">
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.7,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    transition={{
                        opacity: { duration: 0.7 },
                        scale: {
                            duration: 0.7,
                            type: "spring",
                            stiffness: 120,
                            damping: 12,
                        },
                    }}
                    className="relative w-[900px] min-h-[460px] max-w-[95vw] flex-shrink-0"
                >
                    {/* เงากระดาษ */}
                    <div
                        className="absolute inset-0 translate-y-4 translate-x-2"
                        style={{
                            background: "#000",
                            opacity: 0.35,
                            filter: "url(#tornEdge) blur(10px)",
                        }}
                    />

                    {/* ไฮไลต์ขอบบน */}
                    <div
                        className="absolute inset-0 pointer-events-none z-30"
                        style={{
                            background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 25%)",
                            filter: "url(#tornEdge)",
                        }}
                    />

                    {/* เนื้อกระดาษ */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(160deg, #FFFEFB 0%, #FDF9EF 35%, #F8F1DE 65%, #F1E7CC 100%)",
                            filter: "url(#tornEdge)",
                            boxShadow:
                                "inset 0 0 60px rgba(180,160,120,0.18), inset 0 0 140px rgba(160,140,100,0.15), inset 2px 2px 10px rgba(255,255,255,0.8)",
                        }}
                    />
                    <div
                        className="absolute inset-0 pointer-events-none z-[5]"
                        style={{
                            opacity: 0.28,
                            filter: "url(#tornEdge)",
                            backgroundImage: `
                                repeating-linear-gradient(
                                    0deg,
                                    rgba(105, 75, 35, 0.10) 0px,
                                    rgba(105, 75, 35, 0.10) 1px,
                                    transparent 1px,
                                    transparent 5px
                                ),
                                repeating-linear-gradient(
                                    90deg,
                                    rgba(255, 245, 210, 0.16) 0px,
                                    rgba(255, 245, 210, 0.16) 1px,
                                    transparent 1px,
                                    transparent 7px
                                )
                            `,
                        }}
                    />
                    <div
                        className="absolute inset-0 pointer-events-none z-[6]"
                        style={{
                            opacity: 0.12,
                            filter: "url(#tornEdge)",
                            backgroundImage: `
                                repeating-linear-gradient(
                                    115deg,
                                    transparent 0px,
                                    transparent 8px,
                                    rgba(90, 60, 25, 0.18) 9px,
                                    transparent 10px,
                                    transparent 18px
                                )
                            `,
                            mixBlendMode: "multiply",
                        }}
                    />

                    {/* grain */}
                    <div
                        className="absolute inset-0 mix-blend-multiply opacity-40 pointer-events-none z-[7]"
                        style={{ filter: "url(#tornEdge) url(#paperGrain)" }}
                    />

                    {/* กล่องตรา/เหรียญ: centered พอดีบนขอบบนของกระดาษ ครึ่งบนโผล่พ้นกระดาษ ครึ่งล่างอยู่ในกระดาษ */}
                    <div
                        className="absolute left-1/2 z-30 w-36 h-36 flex items-center justify-center"
                        style={{ top: 0, transform: "translate(-50%, -50%)" }}
                    >
                        <motion.div
                            className="relative w-full h-full flex items-center justify-center"
                            animate={{ y: [-6, 6, -6] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatType: "mirror",
                                ease: "easeInOut",
                            }}
                        >
                            {/* แสงฟุ้งชั้นนอกสุด */}
                            <div
                                className="
                                    absolute
                                    w-44
                                    h-44
                                    rounded-full
                                    bg-yellow-200/40
                                    blur-3xl
                                "
                            />

                            {/* แสงเรืองรองด้านหลังตรา */}
                            <div
                                className="
                                    absolute
                                    w-28
                                    h-28
                                    rounded-full
                                    bg-yellow-300/70
                                    blur-2xl
                                    animate-pulse
                                "
                            />

                            {/* แสงชั้นในสุด ฟุ้งนุ่ม */}
                            <div
                                className="
                                absolute
                                w-16
                                h-16
                                rounded-full
                                bg-white/60
                                blur-xl
                            "
                            />

                            {/* รูปตรา/เหรียญ */}
                            {resultText.mirror_image && (
                                <img
                                    src={resultText.mirror_image}
                                    alt=""
                                    className="
                                    relative
                                    z-10
                                    w-48
                                    h-48
                                    object-contain
                                    drop-shadow-[0_0_16px_rgba(255,215,0,1)]
                                    drop-shadow-[0_0_32px_rgba(255,255,255,0.9)]
                                "
                                />
                            )}
                        </motion.div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center px-12 pt-[76px] pb-5">
                        <h1
                            className="text-3xl md:text-4xl font-black mb-3 text-center"
                            style={{
                                color: "#3B2A1E",
                                textShadow: "0 1px 0 rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.12)",
                            }}
                        >
                            {resultText.title}
                        </h1>

                        <div className="w-40 h-[3px] mb-5 rounded-full" style={{ background: "#8a6a3c", opacity: 0.5 }} />

                        <p
                            className="text-lg font-semibold mb-1 text-center leading-relaxed"
                            style={{ color: "#4a3826" }}
                        >
                            {resultText.description}
                        </p>

                        <p
                            className="font-extrabold text-md mb-4 text-center"
                            style={{ color: isPerfect ? "#166534" : "#8a6a3c" }}
                        >
                            {resultText.highlight_text}
                        </p>

                        <div className="text-xl font-bold text-green-800 mb-1 text-center">
                            You Earned Integrity Points!
                        </div>

                        <div className="mb-5 flex items-center gap-2">
                            <span className="text-3xl font-black"
                                style={{ color: "#166534" }}>
                                {earnedIP} IP
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
                            className="mb-7 px-6 py-2 select-none text-xl"
                            style={{
                                color: sealColor,
                                border: `2px solid ${sealColor}`,
                                transform: "rotate(-4deg)",
                                fontWeight: 900,
                                letterSpacing: "0.15em",
                                opacity: 1,
                                borderRadius: "4px",
                                textShadow: `0 0 10px ${sealColor}bb`,
                                boxShadow: `0 0 18px ${sealColor}88, inset 0 0 10px ${sealColor}55`,
                            }}
                        >
                            {verdictWord}
                        </div>

                        <div className="flex flex-row gap-3 mt-3 justify-center items-center w-full">
                            <button
                                onClick={handleBackMap}
                                className="button-finish-game gray"
                            >
                                <span className="button-finish-game-top">
                                    กลับหน้าหลัก
                                </span>
                                <span className="button-finish-game-bottom"></span>
                                <span className="button-finish-game-base"></span>
                            </button>

                            <button
                                onClick={() => navigate("/unit1/final")}
                                className="button-finish-game green"
                            >
                                <span className="button-finish-game-top">
                                    ด่านถัดไป
                                </span>
                                <span className="button-finish-game-bottom"></span>
                                <span className="button-finish-game-base"></span>
                            </button>
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
                        top: "-15%",
                        right: "-2  %",
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
                        className="relative w-[240px] md:w-[330px] lg:w-[380px] object-contain"
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