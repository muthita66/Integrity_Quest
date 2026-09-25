import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import failed from "../../../assets/unit2/Level2/failed.png";
import BackgroundImg from "../../../assets/unit2/Level2/bgLevel2.png";
import gameOverSound from "../../../assets/sounds/BackgroundGame/GameOver.mp3";
import useGameMuted from "../../../hooks/useGameMuted";

// ละอองแสงลอยพื้นหลัง — ตำแหน่งคงที่ ไม่ re-render ใหม่ (แนวเดียวกับ
// การ์ดผลลัพธ์อื่นๆ ในเกม เพื่อให้ลุคของ modal นี้ไปทางเดียวกัน)
const PARTICLES = [
    { left: "10%", top: "20%", size: 4, delay: "0s", dur: "8s", opacity: 0.5 },
    { left: "20%", top: "70%", size: 3, delay: "1.5s", dur: "10s", opacity: 0.4 },
    { left: "82%", top: "25%", size: 4, delay: "0.6s", dur: "9s", opacity: 0.5 },
    { left: "90%", top: "65%", size: 3, delay: "2.3s", dur: "11s", opacity: 0.4 },
];

export default function TimeoutModal({ resetGame }) {
    const prefersReducedMotion = useReducedMotion();
    const [ticking, setTicking] = useState(true);
    const [muted] = useGameMuted();

    // เสียง GameOver เล่นครั้งเดียวตอนหน้านี้ขึ้นมา ไม่วน
    useEffect(() => {
        if (muted) return;

        const audio = new Audio(gameOverSound);
        audio.volume = 0.6;
        audio.play().catch(() => { });

        // กดเล่นอีกครั้งแล้วหยุดเสียงทันที
        return () => {
            audio.pause();
            audio.src = "";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // นาฬิกาสั่นเบาๆ ต่อเนื่อง ให้ความรู้สึก "หมดเวลา" มีชีวิตชีวาขึ้น
    useEffect(() => {
        if (prefersReducedMotion) return;
        const interval = setInterval(() => setTicking((t) => !t), 900);
        return () => clearInterval(interval);
    }, [prefersReducedMotion]);

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 sarabun-bold"
            style={{ backgroundImage: `url(${BackgroundImg})` }}
        >
            {/* Overlay มืด + vignette ให้การ์ดเด่นขึ้น */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(20,10,10,0.55) 0%, rgba(10,5,5,0.85) 100%)",
                    backdropFilter: "blur(2px)",
                }}
            />

            {/* ละอองแสงลอย */}
            <div className="absolute inset-0 pointer-events-none">
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
                            boxShadow: `0 0 ${p.size * 3}px ${p.size}px rgba(255,220,220,0.7)`,
                            animation: `timeoutDotFloat ${p.dur} ${p.delay} ease-in-out infinite alternate`,
                        }}
                    />
                ))}
            </div>

            {/* การ์ดหลัก */}
            <motion.div
                initial={{ opacity: 0, scale: 0.75, y: 30, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                transition={{
                    duration: prefersReducedMotion ? 0 : 0.55,
                    type: "spring",
                    stiffness: 160,
                    damping: 16,
                }}
                className="relative z-10 w-full max-w-md"
            >
                {/* เงาการ์ด */}
                <div
                    className="absolute inset-0 translate-y-3 rounded-[28px] bg-black/40"
                    style={{ filter: "blur(14px)" }}
                />

                <div className="relative rounded-[28px] border-[3px] border-[#8B5A2B] bg-gradient-to-b from-[#FFF9E8] to-[#FCEBC2] shadow-[0_20px_45px_rgba(0,0,0,0.4)] overflow-hidden">
                    {/* แถบหัวการ์ดสีแดงอ่อนบอกสถานะ */}
                    <div className="bg-gradient-to-r from-[#E84855] via-[#EF5D68] to-[#E84855] px-6 py-3 text-center">
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                            Time&nbsp;Out
                        </span>
                    </div>

                    <div className="flex flex-col items-center px-7 py-8 text-center">
                        {/* ตัวละคร + นาฬิกาสั่น */}
                        <motion.div
                            animate={
                                prefersReducedMotion
                                    ? undefined
                                    : { rotate: ticking ? -4 : 4 }
                            }
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                            className="relative mb-3"
                        >
                            <div
                                className="absolute inset-0 rounded-full blur-2xl"
                                style={{ background: "rgba(232,72,85,0.35)" }}
                            />
                            <img
                                src={failed}
                                alt="หมดเวลา"
                                className="relative w-44 md:w-52 h-auto select-none drop-shadow-[0_8px_10px_rgba(0,0,0,0.3)]"
                                draggable={false}
                            />
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mb-4 text-3xl md:text-4xl font-black text-[#E84855]"
                        >
                            หมดเวลาแล้ว!
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-7 w-full rounded-2xl border-2 border-[#E3C98A] bg-white/70 px-6 py-4 shadow-[inset_0_2px_8px_rgba(139,90,43,0.1)]"
                        >
                            <p className="mb-1 text-lg md:text-xl font-black text-[#8B5A2B]">
                                คุณเล่นไม่ทันเวลา
                            </p>
                            <p className="text-sm md:text-base font-medium leading-relaxed text-[#5A4633]">
                                ไม่เป็นไรนะ! ลองกลับไปเริ่มใหม่
                                <br />
                                และวางแผนการคำนวณให้เร็วขึ้น
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <button
                                onClick={resetGame}
                                className="button-finish-game red transition-transform hover:scale-105 active:scale-95"
                            >
                                <span className="button-finish-game-top">เล่นอีกครั้ง</span>
                                <span className="button-finish-game-bottom"></span>
                                <span className="button-finish-game-base"></span>
                            </button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <style>{`
                @keyframes timeoutDotFloat {
                    0%   { transform: translateY(0px) scale(1);     opacity: 0.25; }
                    50%  { transform: translateY(-16px) scale(1.25); opacity: 0.7; }
                    100% { transform: translateY(-28px) scale(0.7);  opacity: 0.1; }
                }
            `}</style>
        </div>
    );
}