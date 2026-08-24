import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ConfettiExplosion from "react-confetti-explosion";

import bgGame from "../../../../assets/unit1/level1/Result/bgGameLevel1.png";
import Gold from "../../../../assets/unit1/level1/Result/Gold.png";
import Mirror1 from "../../../../assets/unit1/level1/Result/mirror1.png";
import Mirror2 from "../../../../assets/unit1/level1/Result/mirror2.png";
import ResultPass from "../../../../assets/unit1/level1/Result/ResultPass.png";
import ResultPass2 from "../../../../assets/unit1/level1/Result/ResultPass2.png";
import ResultFailed from "../../../../assets/unit1/level1/Result/ResultFailed.png";

import Button from "../../../../assets/unit1/button/button.png";
import ButtonPass from "../../../../assets/unit1/button/buttonPass.png";
import ButtonFailed from "../../../../assets/unit1/button/buttonFailed.png";

// ละอองแสงลอย — ตำแหน่งคงที่ไม่ re-render ใหม่
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

export default function MirrorResultPage() {
    const navigate = useNavigate();

    const score = Number(localStorage.getItem("mirrorScore")) || 0;
    const wrongCount = Number(localStorage.getItem("wrongCount")) || 0;

    const correctCount = 5 - wrongCount;

    // เลือกรูปตัวละคร
    const characterImg = wrongCount === 0
        ? ResultPass
        : correctCount >= 3
            ? ResultPass2
            : ResultFailed;

    // เลือกตราประทับ
    const mirrorImg = correctCount > 3 ? Mirror2 : Mirror1;

    const isPerfect = wrongCount === 0;
    const shouldRetry = wrongCount > 3;

    // Glow color ของตัวละคร
    const charGlowColor = shouldRetry
        ? "rgba(220,80,80,0.55)"
        : isPerfect
            ? "rgba(238, 233, 124, 0.6)"
            : "rgba(120,180,255,0.5)";

    useEffect(() => {
        if (wrongCount === 0) {
            localStorage.setItem("bonusHP", "5");
        } else {
            localStorage.removeItem("bonusHP");
        }
    }, [wrongCount]);

    const handleReplay = () => {
        localStorage.removeItem("mirrorScore");
        localStorage.removeItem("wrongCount");
        localStorage.removeItem("bonusHP");
        navigate("/unit1/Quizlevel1");
    };

    const handleBackMap = () => {
        navigate("/map");
    };

    const verdictWord = shouldRetry ? "ทบทวน" : isPerfect ? "ผ่านระดับยอดเยี่ยม" : "ผ่าน";
    const sealColor = shouldRetry ? "#7A2E2E" : "#3F5A34";

    const [showExplosion, setShowExplosion] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowExplosion(false), 2200);
        return () => clearTimeout(timer);
    }, []);

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
                            animation: `mirrorDotFloat ${p.dur} ${p.delay} ease-in-out infinite alternate`,
                        }}
                    />
                ))}
            </div>

            {/* SVG filters */}
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

            {/* Layout หลัก */}
            <div className="relative z-20 flex items-end justify-center w-full max-w-6xl px-4">

                {/* ====== กระดาษ ====== */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.7 },
                        scale: { duration: 0.7, type: "spring", stiffness: 120, damping: 12 },
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

                    {/* ====== ลายเส้นใยกระดาษ ====== */}
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

                    {/* ====== ลายเส้นใยแบบเฉียง เพิ่มความเป็นกระดาษจริง ====== */}
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

                    {/* ตราประทับ */}
                    <div className="absolute -top-15 left-1/2 -translate-x-1/2 z-30 w-50 h-50 flex items-center justify-center">
                        {isPerfect ? (
                            <img
                                src={Gold}
                                alt="Gold Seal"
                                className="w-72 h-72 object-contain"
                            />
                        ) : correctCount >= 3 ? (
                            <img
                                src={Mirror2}
                                alt="Silver Seal"
                                className="w-72 h-72 object-contain"
                            />
                        ) : shouldRetry ? (
                            <img
                                src={Mirror1}
                                alt="Bronze Seal"
                                className="w-72 h-72 object-contain"
                            />
                        ) : null}
                    </div>

                    {/* เนื้อหา */}
                    <div className="relative z-10 flex flex-col items-center px-12 pt-35 pb-10">
                        <p className="text-xs tracking-[0.35em] mb-1">คำพิพากษาแห่งกระจกเงา</p>

                        <h1
                            className="text-3xl md:text-4xl font-black mb-3 text-center"
                            style={{
                                color: "#3B2A1E",
                                textShadow: "0 1px 0 rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.12)",
                            }}
                        >
                            {shouldRetry ? "ควรปรับปรุงการตัดสินใจ" : "ก้าวแรกสู่ผู้พิทักษ์"}
                        </h1>

                        <div className="w-40 h-[3px] mb-5 rounded-full" style={{ background: "#8a6a3c", opacity: 0.5 }} />

                        <p
                            className="text-base font-semibold mb-6 text-center leading-relaxed"
                            style={{ color: "#4a3826" }}
                        >
                            {isPerfect ? (
                                <>
                                    คุณเลือกได้ถูกต้องทั้งหมด <br />
                                    <span className="font-extrabold text-lg" style={{ color: "#3F5A34" }}>
                                        ได้รับโบนัสคะแนน +HP 5
                                    </span>
                                    <p className="text-xl mt-3 mb-3">คุณได้พิสูจน์แล้วว่าความซื่อสัตย์คือหลักยึดในการตัดสินใจของคุณ</p>
                                </>
                            ) : shouldRetry ? (
                                <>
                                    คุณตอบผิดมากกว่า 3 ข้อ <br />
                                    <span className="font-extrabold text-lg" style={{ color: "#7A2E2E" }}>
                                        จงใช้กระจกแห่งความจริงทบทวนการตัดสินใจ แล้วกลับมาพิสูจน์ตนเองอีกครั้ง
                                    </span>
                                </>
                            ) : (
                                <>
                                    ทุกการตัดสินใจคือบทเรียน ก้าวแรกของผู้พิทักษ์เริ่มต้นจากการกล้าทำในสิ่งที่ถูกต้อง <br />
                                    ถึงเวลาเผชิญบททดสอบถัดไป...
                                </>
                            )}
                        </p>

                        {/* ตราคำตัดสิน */}
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
                            {shouldRetry ? (
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
                            ) : (
                                <div className="plaque-button-wrapper">
                                    <button
                                        onClick={() => navigate("/unit1/level2/transition")}
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

                {/* ====== ตัวละครมุมขวาล่าง ====== */}
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
                        className="relative w-[340px] md:w-[430px] lg:w-[500px] object-contain"
                        style={{
                            filter: `drop-shadow(0 8px 24px ${charGlowColor}) drop-shadow(0 0 40px ${charGlowColor})`,
                        }}
                    />
                </motion.div>
            </div>

            {/* Keyframe animation ละอองแสง */}
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