import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import ConfettiExplosion from "react-confetti-explosion";
import BackgroundImg from "../../../assets/unit2/Level2/bgLevel2.png";
import bonusSound from "../../../assets/sounds/BackgroundGame/Bonus.mp3";
import useGameMuted from "../../../hooks/useGameMuted";

const API_URL = "http://localhost:5000";
const LEVEL_ID = 6;

function useCountUp(
    target,
    { duration = 900, start = false, delay = 0 } = {}
) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!start) return;
        let raf;
        const startTime = performance.now() + delay;
        const tick = (now) => {
            if (now < startTime) {
                raf = requestAnimationFrame(tick);
                return;
            }
            const progress = Math.min(
                (now - startTime) / duration,
                1
            );
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) {
                raf = requestAnimationFrame(tick);
            }
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration, start, delay]);

    return value;
}

export default function ResultPage({
    result,
    resetGame,
}) {
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();

    /*
     * เดิมหน้านี้รับ passed/firstTryCorrect ที่ Frontend คำนวณเอง
     * (hp >= 15 ที่ไม่เคยตรวจกับ DB) แล้วเลือกข้อความ title/message/tip
     * จาก 4 ระดับที่ hardcode ไว้ในไฟล์นี้ทั้งหมด (getResultTitle,
     * getResultMessage, getTip) — ตอนนี้เปลี่ยนมารับผลจริงจาก Backend
     * (completeGame ของ level_id=6) ผ่าน prop `result` แทน และลดข้อความ
     * เหลือ PASS/FAIL 2 สถานะ ดึงจาก level_result_messages เหมือน
     * Level 1 (Need or Want?)
     */
    const isPass = result?.is_pass ?? false;
    const status = result?.status;
    const score = result?.score ?? 0;
    const maxScore = result?.max_score ?? 5;
    const earnedIP = result?.earned_ip ?? 0;
    const totalIntegrityPoints =
        result?.total_integrity_points ?? 0;

    const [resultText, setResultText] = useState(null);
    const [messageError, setMessageError] = useState(false);

    useEffect(() => {
        if (!status) return;

        const fetchResultMessage = async () => {
            try {
                setMessageError(false);

                const response = await fetch(
                    `${API_URL}/api/level-result/${LEVEL_ID}/${status}`
                );

                if (!response.ok) {
                    throw new Error(
                        "โหลดข้อความผลลัพธ์ไม่สำเร็จ"
                    );
                }

                const data = await response.json();
                setResultText(data.data);
            } catch (error) {
                console.error(
                    "Fetch Result Message Error:",
                    error
                );
                setMessageError(true);
            }
        };

        fetchResultMessage();
    }, [status]);

    // Animation
    const PRINT_DURATION = prefersReducedMotion ? 0 : 0.7;
    const animatedScore = useCountUp(score, {
        duration: 900,
        start: true,
        delay: 500,
    });

    // เสียง Bonus เล่นครั้งเดียวตอนหน้าผลลัพธ์แสดงขึ้นมา ไม่วน
    const [muted] = useGameMuted();
    const soundPlayedRef = useRef(false);

    useEffect(() => {
        if (!result || !resultText || soundPlayedRef.current) return;
        soundPlayedRef.current = true;

        if (muted) return;

        const audio = new Audio(bonusSound);
        audio.volume = 0.6;
        audio.play().catch(() => { });
    }, [result, resultText, muted]);

    const [showExplosion, setShowExplosion] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowExplosion(false);
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    if (!result || !resultText) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center sarabun-bold"
                style={{ backgroundImage: `url(${BackgroundImg})` }}
            >
                <p className="text-xl font-bold">
                    {messageError
                        ? "ไม่สามารถโหลดข้อมูลผลลัพธ์ได้"
                        : "กำลังโหลดผลลัพธ์..."}
                </p>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden sarabun-bold bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${BackgroundImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {showExplosion && isPass && (
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

            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.7,
                    y: 40,
                    rotate: -6,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotate: -1.5,
                }}
                transition={{
                    opacity: {
                        duration: PRINT_DURATION,
                    },
                    scale: {
                        duration: PRINT_DURATION,
                        type: "spring",
                        stiffness: 120,
                        damping: 12,
                    },
                    rotate: {
                        duration: PRINT_DURATION,
                        type: "spring",
                        stiffness: 90,
                        damping: 14,
                    },
                }}
                className="relative z-20 w-[620px] max-w-[94vw] flex-shrink-0"
            >

                <div
                    className="absolute inset-0 translate-y-4 translate-x-2 rounded-[24px]"
                    style={{
                        background: "#ffffffff",
                        opacity: 0.35,
                        filter: "blur(10px)",
                    }}
                />

                <div
                    className="absolute inset-0 rounded-[24px]"
                    style={{
                        background:
                            "linear-gradient(160deg, rgba(255, 250, 240, 0.55) 0%, rgba(255, 235, 185, 0.25) 100%)",
                        backdropFilter: "blur(8px)",
                        border: "2px solid rgba(255, 255, 255, 0.4)",
                        boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                    }}
                />

                <div
                    className="absolute inset-0 rounded-[24px] pointer-events-none"
                    style={{
                        background:
                            "rgba(120,90,45,0.06)",
                    }}
                />

                <div
                    className="relative z-10 flex flex-col items-center px-8
                        md:px-12
                        pt-8
                        pb-7">
                    <h1 className="text-3xl md:text-4xl font-black text-center text-black mb-1">ผลภารกิจ</h1>
                    <p className="text-xl md:text-2xl font-black text-green-700 mb-2">
                        {resultText.title}
                    </p>
                    <div className="w-40 h-[3px] mb-3 rounded-full"
                        style={{
                            background: "#8a6a3c",
                            opacity: 0.5,
                        }}
                    />

                    <p className="text-sm md:text-base text-center text-black sarabun-semibold mb-3 px-2">
                        {resultText.description}
                    </p>
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 15,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.5,
                        }}
                        className="w-full p-4 mb-5"
                    >
                        {/* จัดทั้งก้อนให้อยู่ตรงกลาง */}
                        <div className="flex items-center justify-center gap-8 w-full">

                            {/* EXP STAR */}
                            <motion.div
                                initial={{
                                    scale: 0,
                                    rotate: -30,
                                }}
                                animate={{
                                    scale: 1,
                                    rotate: 0,
                                }}
                                transition={{
                                    delay: 0.7,
                                    type: "spring",
                                    stiffness: 180,
                                    damping: 10,
                                }}
                                className="relative flex shrink-0 items-center justify-center w-24 h-24"
                            >
                                <div
                                    className="absolute inset-0 rotate-6 bg-gradient-to-b from-yellow-300 via-yellow-400
                                        to-orange-500 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_95%,50%_72%,21%_95%,32%_57%,2%_35%,39%_35%)]
                                        drop-shadow-[0_5px_4px_rgba(120,70,0,0.35)]"
                                />

                                <span
                                    className="relative z-10 text-xl font-black text-white"
                                    style={{
                                        textShadow:
                                            "0 2px 2px rgba(120,70,0,0.4)",
                                    }}
                                >
                                    IP
                                </span>
                            </motion.div>

                            {/* คะแนน + IP */}
                            <div className="flex flex-col justify-center">

                                <p className="text-lg font-bold mb-0">
                                    คะแนนรวม {animatedScore} / {maxScore}
                                </p>

                                {isPass && (
                                    <div className="text-3xl font-black leading-none text-green-700">
                                        +{earnedIP} IP
                                    </div>
                                )}
                            </div>

                        </div>
                    </motion.div>


                    {/* Tip box */}
                    {resultText.message && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            className="w-full rounded-[20px] border-2 border-[#C8D6A0] bg-[#F4F7E7] p-4 mb-6 flex items-center gap-4">
                            {/* Lightbulb */}
                            <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 border-2 border-yellow-300 text-3xl">
                                💡
                            </div>

                            <div className="text-center flex-1">
                                <p className="text-sm md:text-base font-bold leading-relaxed sarabun-bold text-black">
                                    {resultText.message}
                                </p>
                            </div>

                        </motion.div>
                    )}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 15,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 1.4,
                        }}
                        className="flex flex-wrap gap-3 w-full justify-center pb-4 min-h-[60px]"
                    >
                        {/* HOME */}
                        <button
                            onClick={() => navigate("/map")}
                            className="button-finish-game yellow">
                            <span className="button-finish-game-top">หน้าหลัก</span>
                            <span className="button-finish-game-bottom"></span>
                            <span className="button-finish-game-base"></span>
                        </button>

                        {/* RETRY - แสดงเฉพาะเมื่อยังไม่ผ่าน */}
                        {!isPass && (
                            <button onClick={resetGame} className="button-finish-game red">
                                <span className="button-finish-game-top">เล่นอีกครั้ง</span>
                                <span className="button-finish-game-bottom"></span>
                                <span className="button-finish-game-base"></span>
                            </button>
                        )}

                        {/* NEXT */}
                        <button
                            onClick={() =>
                                navigate("/unit2/final/intro", {
                                    state: {
                                        startAtIntro: true,
                                    },
                                })
                            }
                            disabled={!isPass}
                            className="button-finish-game">
                            <span className="button-finish-game-top">ไปต่อ</span>
                            <span className="button-finish-game-bottom"></span>
                            <span className="button-finish-game-base"></span>
                        </button>
                    </motion.div>

                </div>

            </motion.div>

            <style>{`
                @keyframes hpDotFloat {
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