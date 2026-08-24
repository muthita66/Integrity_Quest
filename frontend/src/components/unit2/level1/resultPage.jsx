import { useEffect, useId, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import ConfettiExplosion from "react-confetti-explosion";

import Vegetable from "../../../assets/unit2/Level1/vegetable.png";
import Ticket from "../../../assets/unit2/Level1/ticket.png";
import Bill from "../../../assets/unit2/Level1/utility-bill.png";
import LuxuryBags from "../../../assets/unit2/Level1/shopping-bag.png";
import Coffee from "../../../assets/unit2/Level1/coffee.png";
import Car from "../../../assets/unit2/Level1/car.png";
import Medicine from "../../../assets/unit2/Level1/medicine.png";
import SmartPhone from "../../../assets/unit2/Level1/smartphone.png";
import House from "../../../assets/unit2/Level1/house.png";
import Shirt from "../../../assets/unit2/Level1/shirt.png";
import bgGame from "../../../assets/unit2/Level1/bgGame.png";

import GoalCelebration from "../../../assets/unit2/Level1/result/GoalCelebration.png";
import SadExpression from "../../../assets/unit2/Level1/result/SadExpression.png";

const MAX_SCORE = 10;

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

const FALLBACK_ITEMS = [
    { id: 1, src: Vegetable, alt: "Vegetable", name: "Vegetable", type: "need", userType: "need" },
    { id: 2, src: Ticket, alt: "Ticket", name: "Ticket", type: "want", userType: "want" },
    { id: 3, src: Bill, alt: "Bill", name: "Bill", type: "need", userType: "need" },
    { id: 4, src: LuxuryBags, alt: "LuxuryBags", name: "LuxuryBags", type: "want", userType: "want" },
    { id: 5, src: Coffee, alt: "Coffee", name: "Coffee", type: "want", userType: "need" },
    { id: 6, src: Car, alt: "Car", name: "Car", type: "need", userType: "need" },
    { id: 7, src: Medicine, alt: "Medicine", name: "Medicine", type: "need", userType: "need" },
    { id: 8, src: SmartPhone, alt: "SmartPhone", name: "SmartPhone", type: "want", userType: "want" },
    { id: 9, src: House, alt: "House", name: "House", type: "need", userType: "need" },
    { id: 10, src: Shirt, alt: "Shirt", name: "Shirt", type: "need", userType: "want" },
];

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

    const pass = state?.pass ?? false;
    const rawItems = state?.items ?? FALLBACK_ITEMS;
    const items = rawItems.map((item) => ({
        ...item,
        correct: item.type === item.userType,
    }));
    const score = state?.score ?? items.filter((i) => i.correct).length;
    const correctCount = items.filter((i) => i.correct).length;
    const wrongCount = items.length - correctCount;

    const verdictWord = pass ? "ผ่านแล้ว" : "ยังไม่ผ่าน";
    const sealColor = pass ? "#3F5A34" : "#7A2E2E";

    // ตัวละคร
    const characterImg = pass ? GoalCelebration : SadExpression;
    const charGlowColor = pass
        ? "rgba(238, 233, 124, 0.6)"
        : "rgba(220,80,80,0.55)";

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
                            บันทึกการตัดสินใจใช้สอย
                        </p>

                        <h1
                            className="text-2xl md:text-3xl font-black mb-3 text-center"
                            style={{
                                color: "#000000",
                                textShadow: "0 1px 0 rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.12)",
                            }}
                        >
                            {pass ? "จำแนก 'ความจำเป็น' และ 'ความต้องการ' สำเร็จ" : "ทบทวนการตัดสินใจ"}
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
                                        key={item.id}
                                        variants={lineVariants}
                                        className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-md"
                                        style={{
                                            background: item.correct
                                                ? "rgba(63,90,52,0.08)"
                                                : "rgba(122,46,46,0.08)",
                                        }}
                                    >
                                        <span className="flex items-center gap-2 min-w-0">
                                            <img
                                                src={item.src}
                                                alt={item.alt}
                                                className="w-6 h-6 object-contain shrink-0"
                                                style={{
                                                    filter: item.correct
                                                        ? "none"
                                                        : "grayscale(70%)",
                                                    opacity: item.correct ? 1 : 0.55,
                                                }}
                                            />

                                            <span
                                                className="shrink-0 text-sm font-bold"
                                                style={{
                                                    color: item.correct
                                                        ? "#3F5A34"
                                                        : "#7A2E2E",
                                                }}
                                            >
                                                {item.correct ? "✓" : "✕"}
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
                                            {item.type}
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

                        {/* สรุปคะแนน */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: scoreDelay - 0.1 }}
                            className="w-full max-w-md mb-4"
                        >
                            <div className="    flex items-center justify-between text-lg font-black" style={{ color: "#3B2A1E" }}>
                                <span className="uppercase tracking-wide">คะแนนรวม</span>
                                <span className="tabular-nums">{animatedScore} / {MAX_SCORE}</span>
                            </div>
                            <p className="text-sm font-light">คุณได้เรียนรู้ผ่านการลงมือจำแนกสิ่งของ และทบทวนเหตุผลในการตัดสินใจว่าอะไรคือ “ความจำเป็น” และอะไรคือ “ความต้องการ”</p>
                        </motion.div>

                        <div className="flex flex-row gap-3 mt-1 justify-center items-center w-full">
                            <button onClick={handleBackMap} className="box-button-result ">
                                <div className="button-box-result"><span>กลับหน้าหลัก</span></div>
                            </button>
                            {pass ? (
                                <button onClick={handleNext} className="box-button-result button-green">
                                    <div className="button-box-result"><span>ไปด่านต่อไป</span></div>
                                </button>
                            ) : (
                                <button onClick={handleRetry} className="box-button-result">
                                    <div className="button-box-result"><span>ลองใหม่อีกครั้ง</span></div>
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