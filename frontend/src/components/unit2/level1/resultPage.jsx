import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import ConfettiExplosion from "react-confetti-explosion";

import bgGame from "../../../assets/unit2/Level1/bgmarket.png";

import GoalCelebration from "../../../assets/unit2/Level1/result/GoalCelebration.png";
import SadExpression from "../../../assets/unit2/Level1/result/SadExpression.png";

import bonusSound from "../../../assets/sounds/BackgroundGame/Bonus.mp3";
import gameOverSound from "../../../assets/sounds/BackgroundGame/GameOver.mp3";
import useGameMuted from "../../../hooks/useGameMuted";

const API_URL = "http://localhost:5000";
const LEVEL_ID = 5;

// ละอองแสงลอย — ตำแหน่งคงที่ไม่ re-render ใหม่ (จาก MirrorResultPage)
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

function useCountUp(target, { duration = 900, start = false, delay = 0 } = {}) {
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
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration, start, delay]);

    return value;
}

const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const lineVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

// ====== ตราปั๊มขอบหยัก (rubber-stamp seal) ======
function StampMark({ win, sealColor, verdictWord, delay = 0 }) {
    const reactId = useId();
    const filterId = `mrp-rough-${reactId.replace(/:/g, "")}`;
    const color = sealColor ?? (win ? "#2E6B4F" : "#9C2F2F");
    const label = verdictWord ?? (win ? "ผ่านการตรวจสอบ" : "ไม่ผ่านการตรวจสอบ");

    return (
        <motion.div
            initial={{
                scale: 3,
                opacity: 0,
                rotate: -18,
            }}
            animate={{
                scale: 1,
                opacity: 0.9,
                rotate: -18,
            }}
            transition={{
                delay,
                type: "spring",
                stiffness: 260,
                damping: 18,
                mass: 0.9,
                opacity: { delay, duration: 0.15 },
            }}
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
        >
            <svg
                width="150"
                height="150"
                viewBox="0 0 150 150"
                style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}
            >
                <defs>
                    <filter id={filterId}>
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.045"
                            numOctaves="2"
                            result="noise"
                        />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
                    </filter>
                </defs>
                <g filter={`url(#${filterId})`} stroke={color} fill="none">
                    <circle cx="75" cy="75" r="66" strokeWidth="4" />
                    <circle cx="75" cy="75" r="56" strokeWidth="1.5" />
                    <text
                        x="75"
                        y="66"
                        textAnchor="middle"
                        fontFamily="Prompt, sans-serif"
                        fontWeight="700"
                        fontSize="15"
                        fill={color}
                        stroke="none"
                    >
                        {win ? "PASSED" : "FAILED"}
                    </text>
                    <text
                        x="75"
                        y="93"
                        textAnchor="middle"
                        fontFamily="Sarabun, sans-serif"
                        fontWeight="700"
                        fontSize="12.5"
                        fill={color}
                        stroke="none"
                    >
                        {label}
                    </text>
                </g>
            </svg>
        </motion.div>
    );
}

export default function Unit2Level1ResultPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const prefersReducedMotion = useReducedMotion();

    /*
     * ผลจริงจาก Backend (completeGame ของ level_id=5) — ไม่มีการ
     * คำนวณ pass/score/items ที่ Frontend อีกต่อไป เดิมหน้านี้รับค่า
     * ที่ Frontend คำนวณเองผ่าน router state (ไม่เคยตรวจกับ DB) และ
     * มี FALLBACK_ITEMS/ข้อความ hardcode ไว้เผื่อไม่มี state เลย ซึ่ง
     * ทำให้ดูผลลัพธ์ปลอมได้ถ้าเข้าหน้านี้ตรง ๆ — ตอนนี้ถ้าไม่มีผลจริง
     * ส่งมา ให้ถือว่าเข้าหน้านี้มาไม่ถูกทาง พากลับไปเล่นใหม่แทน
     */
    const result = state?.result;

    useEffect(() => {
        if (!result) {
            navigate("/unit2/level1", { replace: true });
        }
    }, [result, navigate]);

    const pass = result?.is_pass ?? false;
    const status = result?.status;
    const items = result?.items ?? [];
    const score = result?.score ?? 0;
    const maxScore = result?.max_score ?? items.length;
    const earnedIP = result?.earned_ip ?? 0;
    const baseIP = result?.base_ip ?? 0;
    const bonusIP = result?.bonus_ip ?? 0;
    const totalIntegrityPoints = result?.total_integrity_points ?? 0;

    /*
     * ข้อความ verdict/feedback — ดึงจาก DB (level_result_messages,
     * level_id=5, status PASS/FAIL) เหมือนแนวทางที่ใช้กับ Level 2/3
     * เดิมข้อความเหล่านี้ hardcode ไว้ในไฟล์นี้ตรง ๆ
     */
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
                    throw new Error("โหลดข้อความผลลัพธ์ไม่สำเร็จ");
                }

                const data = await response.json();
                setResultText(data.data);
            } catch (error) {
                console.error("Fetch Result Message Error:", error);
                setMessageError(true);
            }
        };

        fetchResultMessage();
    }, [status]);

    const verdictWord = resultText?.verdict_label ?? (pass ? "ผ่านแล้ว" : "ยังไม่ผ่าน");
    const sealColor = pass ? "#3F5A34" : "#7A2E2E";

    /*
     * รูปตัวละคร — ยังเป็นไฟล์ local 2 รูปตายตัวตามผล PASS/FAIL
     * (ไม่ใช่เนื้อหาที่ทีม content ต้องแก้บ่อยเหมือนข้อความ จึงยังไม่
     * ย้ายเข้า DB รอบนี้ ต่างจาก character_image ของ FinalLevel ที่มี
     * ถึง 4 แบบตาม Rank และเก็บเป็น asset สาธารณะอยู่แล้ว)
     */
    const characterImg = pass ? GoalCelebration : SadExpression;
    const charGlowColor = pass
        ? "rgba(238, 233, 124, 0.6)"
        : "rgba(220,80,80,0.55)";

    // เสียงผลลัพธ์ เล่นครั้งเดียวตอนหน้าผลลัพธ์แสดงขึ้นมา ไม่วน
    // ผ่าน → Bonus / ไม่ผ่าน → GameOver
    const [muted] = useGameMuted();
    const soundPlayedRef = useRef(false);

    useEffect(() => {
        if (!result || !resultText || soundPlayedRef.current) return;
        soundPlayedRef.current = true;

        if (muted) return;

        const audio = new Audio(pass ? bonusSound : gameOverSound);
        audio.volume = 0.1;
        audio.play().catch(() => { });
    }, [result, resultText, pass, muted]);

    const [showExplosion, setShowExplosion] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowExplosion(false), 2200);
        return () => clearTimeout(timer);
    }, []);

    const PRINT_DURATION = prefersReducedMotion ? 0 : 0.7;
    const listDelay = PRINT_DURATION + 0.15;
    const scoreDelay = listDelay + items.length * 0.08 + 0.2;
    const animatedScore = useCountUp(score, {
        duration: 700,
        start: true,
        delay: scoreDelay * 1000,
    });

    const handleRetry = () => navigate("/unit2/level1");
    const handleNext = () => navigate("/unit2/level2/intro");
    const handleBackMap = () => navigate("/map");

    if (!result || !resultText) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center sarabun-bold"
                style={{ backgroundImage: `url(${bgGame})` }}
            >
                <p className="text-xl text-white drop-shadow">
                    {messageError
                        ? "ไม่สามารถโหลดข้อมูลผลลัพธ์ได้"
                        : "กำลังโหลดผลลัพธ์..."}
                </p>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed relative overflow-hidden sarabun-bold"
            style={{ backgroundImage: `url(${bgGame})`, fontFamily: "'Sarabun', sans-serif" }}
        >
            {/* Overlay มืด */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(20,14,8,0.35) 0%, rgba(10,7,4,0.78) 100%)",
                }}
            />

            {/* ละอองแสงลอยรอบฉาก */}
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
                            animation: `resultDotFloat ${p.dur} ${p.delay} ease-in-out infinite alternate`,
                        }}
                    />
                ))}
            </div>

            {/* SVG filters สำหรับกระดาษขาดและลายกระดาษ */}
            <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                    <filter id="tornEdge2" x="-10%" y="-10%" width="120%" height="120%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="3" seed="7" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                    <filter id="paperGrain2">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="grain" />
                        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0.29  0 0 0 0 0.22  0 0 0 0 0.13  0 0 0 0.05 0" />
                    </filter>
                </defs>
            </svg>

            {showExplosion && pass && (
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

            {/* Layout หลัก */}
            <div className="relative z-20 flex items-end justify-center w-full max-w-6xl px-4">
                {/* ====== กระดาษ ====== */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: 40, rotate: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: -1.5 }}
                    transition={{
                        opacity: { duration: PRINT_DURATION },
                        scale: { duration: PRINT_DURATION, type: "spring", stiffness: 120, damping: 12 },
                        rotate: { duration: PRINT_DURATION, type: "spring", stiffness: 90, damping: 14 },
                    }}
                    className="relative w-[780px] min-h-[320px] max-w-[90vw] flex-shrink-0"
                >
                    {/* เงากระดาษ */}
                    <div
                        className="absolute inset-0 translate-y-4 translate-x-2"
                        style={{ background: "#000", opacity: 0.35, filter: "url(#tornEdge2) blur(10px)" }}
                    />

                    {/* ไฮไลต์ขอบบน */}
                    <div
                        className="absolute inset-0 pointer-events-none z-30"
                        style={{
                            background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 25%)",
                            filter: "url(#tornEdge2)",
                        }}
                    />

                    {/* เนื้อกระดาษ */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(160deg, #F7EDD5 0%, #eae9e3ff 40%, #e9dfdfff 70%, #dddcd9ff 100%)",
                            filter: "url(#tornEdge2)",
                            boxShadow:
                                "inset 0 0 60px rgba(120,90,45,0.4), inset 0 0 140px rgba(90,60,25,0.3), inset 2px 2px 8px rgba(255,255,200,0.5)",
                        }}
                    />
                    {/* grain */}
                    <div
                        className="absolute inset-0 mix-blend-multiply opacity-40"
                        style={{ filter: "url(#tornEdge2) url(#paperGrain2)" }}
                    />

                    {/* เนื้อหา */}
                    <div className="relative z-10 flex flex-col items-center px-10 pt-10 pb-10 sarabun-bold">
                        <p className="text-sm mb-1" style={{ color: "#5a4326" }}>
                            บันทึกการตัดสินใจ
                        </p>

                        <h1
                            className="text-xl md:text-2xl font-black mb-3 text-center"
                            style={{
                                color: "#000000",
                                textShadow: "0 1px 0 rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.12)",
                            }}
                        >
                            {resultText.title}
                        </h1>

                        {/* รายการสินค้าแบบลิสต์บนกระดาษ */}
                        <div className="relative w-full max-w-md mb-5">

                            <motion.ul
                                variants={listVariants}
                                initial="hidden"
                                animate="show"
                                transition={{ delayChildren: listDelay }}
                                className="w-full space-y-2"
                            >
                                {items.map((item) => (
                                    <motion.li
                                        key={item.item_id}
                                        variants={lineVariants}
                                        className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-md"
                                        style={{
                                            background: item.is_correct
                                                ? "rgba(63,90,52,0.08)"
                                                : "rgba(122,46,46,0.08)",
                                        }}
                                    >
                                        <span className="flex items-center gap-2 min-w-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-6 h-6 object-contain shrink-0"
                                                style={{
                                                    filter: item.is_correct
                                                        ? "none"
                                                        : "grayscale(70%)",
                                                    opacity: item.is_correct ? 1 : 0.55,
                                                }}
                                            />

                                            <span
                                                className="shrink-0 text-sm font-bold"
                                                style={{
                                                    color: item.is_correct
                                                        ? "#3F5A34"
                                                        : "#7A2E2E",
                                                }}
                                            >
                                                {item.is_correct ? "✓" : "✕"}
                                            </span>

                                            <span
                                                className="truncate font-semibold"
                                                style={{ color: "#3B2A1E" }}
                                            >
                                                {item.name}
                                            </span>
                                        </span>

                                        <span
                                            className="text-xs uppercase tracking-wide shrink-0 font-bold"
                                            style={{ color: "#6b5636" }}
                                        >
                                            {item.correct_type_label || item.correct_type}
                                        </span>
                                    </motion.li>
                                ))}
                            </motion.ul>

                            {/* ตราคำตัดสิน - ประทับทับรายการ (ขอบหยักแบบตรายางจริง) */}
                            <StampMark
                                win={pass}
                                sealColor={sealColor}
                                verdictWord={verdictWord}
                                delay={scoreDelay + 0.4}
                            />

                        </div>

                        {/* สรุปคะแนน + IP */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: scoreDelay - 0.1 }}
                            className="w-full max-w-md mb-4"
                        >
                            <div className="flex items-center justify-between text-sm font-black" style={{ color: "#3B2A1E" }}>
                                <span className="uppercase tracking-wide">คะแนนรวม</span>
                                <span className="tabular-nums">{animatedScore} / {maxScore}</span>
                            </div>

                            {pass && (
                                <div className="flex items-center justify-between text-base font-bold mt-1" style={{ color: "#2F6B4F" }}>
                                    <span>Integrity Points</span>
                                    <span className="tabular-nums">
                                        +{earnedIP} IP
                                        {bonusIP > 0 && (
                                            <span className="ml-1 text-xs font-semibold" style={{ color: "#8A6D3B" }}>
                                                (พื้นฐาน {baseIP} + โบนัสรอบแรก {bonusIP})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}

                            <p className="text-sm font-light mt-2">
                                {resultText.description}
                            </p>
                        </motion.div>

                        <div className="flex flex-row gap-3 mt-1 justify-center items-center w-full">
                            <button onClick={handleBackMap} className="button-finish-game gray">
                                <span className="button-finish-game-top">กลับหน้าหลัก</span>
                                <span className="button-finish-game-bottom"></span>
                                <span className="button-finish-game-base"></span>
                            </button>
                            {pass ? (
                                <button onClick={handleNext} className="button-finish-game green">
                                    <span className="button-finish-game-top">ไปด่านต่อไป</span>
                                    <span className="button-finish-game-bottom"></span>
                                    <span className="button-finish-game-base"></span>
                                </button>
                            ) : (
                                <button onClick={handleRetry} className="button-finish-game red">
                                    <span className="button-finish-game-top">ลองใหม่อีกครั้ง</span>
                                    <span className="button-finish-game-bottom"></span>
                                    <span className="button-finish-game-base"></span>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ====== ตัวละครมุมขวาล่าง ====== */}
                <motion.div
                    initial={{ opacity: 0, x: 60, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
                    transition={{
                        opacity: { duration: 0.8, delay: 0.4 },
                        x: { duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 },
                        y: { duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.5 },
                    }}
                    className="absolute z-30"
                    style={{
                        top: "16%",
                        right: "2%",
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
                    {/* รูปตัวละคร */}
                    <img
                        src={characterImg}
                        alt="Result character"
                        className="relative w-[280px] md:w-[360px] lg:w-[420px] object-contain"
                        style={{
                            filter: `drop-shadow(0 8px 24px ${charGlowColor}) drop-shadow(0 0 40px ${charGlowColor})`,
                        }}
                    />
                </motion.div>
            </div>

            {/* Keyframe animation ละอองแสง */}
            <style>{`
                @keyframes resultDotFloat {
                    0%   { transform: translateY(0px) scale(1);     opacity: 0.3; }
                    50%  { transform: translateY(-18px) scale(1.3); opacity: 0.8; }
                    100% { transform: translateY(-32px) scale(0.7); opacity: 0.1; }
                }
            `}</style>
        </div>
    );
}