import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ConfettiExplosion from "react-confetti-explosion";

import bgGame from "../../../../assets/unit1/level1/Result/bgGameLevel1.png";

import Button from "../../../../assets/unit1/button/button.png";
import ButtonPass from "../../../../assets/unit1/button/buttonPass.png";
import ButtonFailed from "../../../../assets/unit1/button/buttonFailed.png";

import bonusSound from "../../../../assets/sounds/BackgroundGame/Bonus.mp3";
import goodSound from "../../../../assets/sounds/BackgroundGame/Good.mp3";
import gameOverSound from "../../../../assets/sounds/BackgroundGame/GameOver.mp3";
import useGameMuted from "../../../../hooks/useGameMuted";

const API_BASE_URL = "http://localhost:5000/api";

// เสียงตามผลการเล่น
const RESULT_SOUNDS = {
    PERFECT: bonusSound,
    PASS: goodSound,
    FAIL: gameOverSound,
};

const PARTICLES = [
    {
        left: "8%",
        top: "15%",
        size: 5,
        delay: "0s",
        dur: "7s",
        opacity: 0.7,
    },
    {
        left: "15%",
        top: "65%",
        size: 3,
        delay: "1.2s",
        dur: "9s",
        opacity: 0.5,
    },
    {
        left: "25%",
        top: "35%",
        size: 4,
        delay: "2.5s",
        dur: "8s",
        opacity: 0.6,
    },
    {
        left: "45%",
        top: "80%",
        size: 3,
        delay: "0.8s",
        dur: "10s",
        opacity: 0.4,
    },
    {
        left: "60%",
        top: "20%",
        size: 5,
        delay: "3s",
        dur: "6.5s",
        opacity: 0.65,
    },
    {
        left: "72%",
        top: "55%",
        size: 4,
        delay: "1.8s",
        dur: "8.5s",
        opacity: 0.5,
    },
    {
        left: "85%",
        top: "30%",
        size: 3,
        delay: "0.4s",
        dur: "11s",
        opacity: 0.45,
    },
    {
        left: "90%",
        top: "70%",
        size: 5,
        delay: "2.1s",
        dur: "7.5s",
        opacity: 0.6,
    },
];

export default function MirrorResultPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // ผลการเล่นจาก MirrorQuizPage
    const result = location.state?.result;

    // Result Message จาก DB
    const [resultMessage, setResultMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Confetti
    const [showExplosion, setShowExplosion] = useState(true);

    // เสียง
    const [muted] = useGameMuted();
    const soundPlayedRef = useRef(false);

    // ดึงข้อมูล Result จาก DB
    useEffect(() => {
        const fetchResultMessage = async () => {
            try {
                if (!result) {
                    throw new Error("ไม่พบข้อมูลผลการเล่น");
                }

                const status = String(result.status || "")
                    .trim()
                    .toUpperCase();

                // ตรวจสอบ status
                if (!["PERFECT", "PASS", "FAIL"].includes(status)) {
                    throw new Error("สถานะผลการเล่นไม่ถูกต้อง");
                }

                // GET Result Message
                const response = await fetch(
                    `${API_BASE_URL}/level-result/1/${status}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || "ไม่สามารถดึงข้อมูล Result ได้"
                    );
                }

                setResultMessage(data.data);
            } catch (err) {
                console.error("Fetch Result Message Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResultMessage();
    }, [result]);

    // Confetti
    useEffect(() => {
        if (result?.status === "FAIL") {
            setShowExplosion(false);
            return;
        }

        const timer = setTimeout(() => {
            setShowExplosion(false);
        }, 2200);

        return () => clearTimeout(timer);
    }, [result]);

    // เล่นเสียงผลลัพธ์ครั้งเดียวตอนเปิดหน้า ไม่วน
    useEffect(() => {
        if (!result || !resultMessage || soundPlayedRef.current) return;
        soundPlayedRef.current = true;

        if (muted) return;

        const status = String(result.status || "").trim().toUpperCase();
        const src = RESULT_SOUNDS[status];
        if (!src) return;

        const audio = new Audio(src);
        audio.volume = 0.6;
        audio.play().catch(() => { });
    }, [result, resultMessage, muted]);

    // Loading
    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center"
                style={{
                    backgroundImage: `url(${bgGame})`,
                    fontFamily: "'Sarabun', sans-serif",
                }}
            >
                <div className="text-white text-2xl font-bold">
                    กำลังโหลดผลการเล่น...
                </div>
            </div>
        );
    }

    // Error / ไม่พบ Result
    if (error || !result || !resultMessage) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center gap-5"
                style={{
                    backgroundImage: `url(${bgGame})`,
                    fontFamily: "'Sarabun', sans-serif",
                }}
            >
                <div className="text-white text-2xl font-bold">
                    ไม่สามารถแสดงผลการเล่นได้
                </div>

                <div className="text-red-300 text-lg">
                    {error || "ไม่พบข้อมูล Result"}
                </div>

                <button
                    onClick={() => navigate("/unit1/Quizlevel1")}
                    className="px-6 py-3 bg-white/90 rounded-lg font-bold"
                >
                    กลับไปเล่นอีกครั้ง
                </button>
            </div>
        );
    }

    // ข้อมูลจาก Backend
    const status = String(result.status || "")
        .trim()
        .toUpperCase();

    const correctCount = Number(result.correct_count) || 0;
    const wrongCount = Number(result.wrong_count) || 0;

    const answerIP = Number(result.answer_ip) || 0;
    const perfectBonusIP = Number(result.perfect_bonus_ip) || 0;
    const earnedIP = Number(result.earned_ip) || 0;

    const totalIntegrityPoints =
        Number(result.total_integrity_points) || 0;

    const isPerfect = status === "PERFECT";
    const shouldRetry = status === "FAIL";

    const characterImg = resultMessage.character_image;
    const mirrorImg = resultMessage.mirror_image;

    const charGlowColor = shouldRetry
        ? "rgba(220,80,80,0.55)"
        : isPerfect
            ? "rgba(238, 233, 124, 0.6)"
            : "rgba(120,180,255,0.5)";
    const sealColor = shouldRetry ? "#7A2E2E" : "#3F5A34";

    const handleReplay = () => {
        navigate("/unit1/Quizlevel1");
    };

    const handleBackMap = () => {
        navigate("/map");
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed relative overflow-hidden sarabun-bold"
            style={{
                backgroundImage: `url(${bgGame})`,
                fontFamily: "'Sarabun', sans-serif",
            }}
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

            <svg
                width="0"
                height="0"
                style={{ position: "absolute" }}
            >
                <defs>
                    <filter
                        id="tornEdge"
                        x="-10%"
                        y="-10%"
                        width="120%"
                        height="120%"
                    >
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.012 0.03"
                            numOctaves="3"
                            seed="7"
                            result="noise"
                        />

                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="14"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>

                    <filter id="paperGrain">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.9"
                            numOctaves="2"
                            seed="4"
                            result="grain"
                        />

                        <feColorMatrix
                            in="grain"
                            type="matrix"
                            values="0 0 0 0 0.29  0 0 0 0 0.22  0 0 0 0 0.13  0 0 0 0.05 0"
                        />
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
                        colors={[
                            "#FFD700",
                            "#FF6B6B",
                            "#4ECDC4",
                            "#A29BFE",
                            "#FFFFFF",
                            "#FDCB6E",
                        ]}
                    />
                </div>
            )}

            <div className="relative z-20 flex items-end justify-center w-full max-w-6xl px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.7 },
                        scale: {
                            duration: 0.7,
                            type: "spring",
                            stiffness: 120,
                            damping: 12,
                        },
                    }}
                    className="relative w-[900px] min-h-[500px] max-w-[95vw] flex-shrink-0"
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
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 25%)",
                            filter: "url(#tornEdge)",
                        }}
                    />

                    {/* เนื้อกระดาษ */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(160deg, #F7EDD5 0%, #EDDA9E 40%, #DFCA8A 70%, #D3B96A 100%)",
                            filter: "url(#tornEdge)",
                            boxShadow:
                                "inset 0 0 60px rgba(120,90,45,0.4), inset 0 0 140px rgba(90,60,25,0.3), inset 2px 2px 8px rgba(255,255,200,0.5)",
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
                        style={{
                            filter: "url(#tornEdge) url(#paperGrain)",
                        }}
                    />
                    <div className="absolute -top-15 left-1/2 -translate-x-1/2 z-30 w-50 h-50 flex items-center justify-center">
                        {mirrorImg && (
                            <img
                                src={mirrorImg}
                                alt="Result Seal"
                                className="w-72 h-72 object-contain"
                            />
                        )}
                    </div>

                    <div className="relative z-10 flex flex-col items-center px-12 pt-35 pb-10">

                        {/* Heading จาก DB */}
                        <p className="text-xs tracking-[0.35em] mb-1">
                            {resultMessage.heading}
                        </p>

                        {/* Title จาก DB */}
                        <h1
                            className="text-3xl md:text-4xl font-black mb-3 text-center"
                            style={{
                                color: "#3B2A1E",
                                textShadow:
                                    "0 1px 0 rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.12)",
                            }}
                        >
                            {resultMessage.title}
                        </h1>

                        <div
                            className="w-40 h-[3px] mb-5 rounded-full"
                            style={{
                                background: "#8a6a3c",
                                opacity: 0.5,
                            }}
                        />

                        {/* Description จาก DB */}
                        {resultMessage.description && (
                            <p
                                className="text-base font-semibold mb-3 text-center leading-relaxed"
                                style={{
                                    color: "#4a3826",
                                }}
                            >
                                {resultMessage.description}
                            </p>
                        )}

                        <div
                            className="mb-4 text-center"
                            style={{
                                color: "#4a3826",
                            }}
                        >
                            {isPerfect ? (
                                <div className="text-center">
                                    <div className="text-lg font-bold">
                                        ได้รับ IP +{earnedIP}
                                    </div>

                                    <div
                                        className="text-sm font-bold"
                                        style={{
                                            color: "#3F5A34",
                                        }}
                                    >
                                        คะแนนจากคำตอบ +{correctCount} | โบนัส PERFECT +{perfectBonusIP}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="text-lg font-bold">
                                        คะแนน +{correctCount}
                                    </div>

                                    <div
                                        className="text-sm font-bold"
                                        style={{
                                            color: "#7A2E2E",
                                        }}
                                    >
                                        ครั้งนี้ไม่ได้รับ Integrity Points
                                    </div>
                                </div>
                            )}
                        </div>

                        {resultMessage.highlight_text && (
                            <p
                                className="font-extrabold text-lg mb-4 text-center"
                                style={{
                                    color: shouldRetry
                                        ? "#7A2E2E"
                                        : "#3F5A34",
                                }}
                            >
                                {resultMessage.highlight_text}
                            </p>
                        )}

                        {resultMessage.message && (
                            <p
                                className="text-xl mt-1 mb-5 text-center leading-relaxed"
                                style={{
                                    color: "#4a3826",
                                }}
                            >
                                {resultMessage.message}
                            </p>
                        )}

                        <div
                            className="mb-7 px-6 py-1.5 select-none"
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
                            {resultMessage.verdict_label}
                        </div>

                        <div className="flex flex-row gap-3 mt-3 justify-center items-center w-full">
                            {/* กลับหน้าหลัก */}
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

                            {!isPerfect && (
                                <div className="plaque-button-wrapper">
                                    <button
                                        onClick={handleReplay}
                                        className="plaque-button"
                                    >
                                        <img
                                            src={ButtonFailed}
                                            alt=""
                                            className="plaque-image"
                                        />

                                        <span className="plaque-text-red">
                                            เล่นอีกครั้ง
                                        </span>
                                    </button>
                                </div>
                            )}

                            {!shouldRetry && (
                                <div className="plaque-button-wrapper">
                                    <button
                                        onClick={() =>
                                            navigate("/unit1/level2/transition")
                                        }
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
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ตัวละครมุมขวาล่าง รูปจาก DB*/}
                <motion.div
                    initial={{
                        opacity: 0,
                        x: 60,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                        y: [0, -10, 0],
                    }}
                    transition={{
                        opacity: {
                            duration: 0.8,
                            delay: 0.4,
                        },
                        x: {
                            duration: 0.8,
                            delay: 0.4,
                            type: "spring",
                            stiffness: 100,
                        },
                        y: {
                            duration: 4,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut",
                            delay: 0.5,
                        },
                    }}
                    className="absolute bottom-0 right-0 z-30"
                    style={{
                        top: "-3%",
                        right: "-10%",
                    }}
                >
                    {/* เงาตัวละคร */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-6 rounded-full"
                        style={{
                            background: "rgba(0,0,0,0.35)",
                            filter: "blur(10px)",
                            zIndex: -1,
                        }}
                    />

                    {characterImg && (
                        <img
                            src={characterImg}
                            alt="Result character"
                            className="relative w-[340px] md:w-[430px] lg:w-[500px] object-contain"
                            style={{
                                filter: `drop-shadow(0 8px 24px ${charGlowColor}) drop-shadow(0 0 40px ${charGlowColor})`,
                            }}
                        />
                    )}
                </motion.div>
            </div>

            <style>{`
                @keyframes mirrorDotFloat {
                    0% {
                        transform: translateY(0px) scale(1);
                        opacity: 0.3;
                    }

                    50% {
                        transform: translateY(-18px) scale(1.3);
                        opacity: 0.8;
                    }

                    100% {
                        transform: translateY(-32px) scale(0.7);
                        opacity: 0.1;
                    }
                }
            `}</style>
        </div>
    );
}