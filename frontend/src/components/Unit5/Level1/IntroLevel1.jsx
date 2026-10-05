import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MdWarning } from "react-icons/md";
import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../hooks/useGameMuted";
import { useSound } from "../../../hooks/useSound";
import messageNotification from "../../../assets/sounds/Unit5/level1-message-notification.mp3";
import policeAtmosphere from "../../../assets/sounds/Unit5/level1-police-station-atmosphere.mp3";

import officeBg from "../../../assets/unit5/office.png";
import heroChar from "../../../assets/unit5/hero.png";

export default function IntroScene() {
    const [muted] = useGameMuted();
    useBackgroundMusic(policeAtmosphere, { volume: 0.35, muted });
    const navigate = useNavigate();

    const [showNarration, setShowNarration] = useState(true);
    const [showCharacter, setShowCharacter] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const notificationPlayed = useRef(false);
    const { play: playNotification, stop: stopNotification } = useSound(messageNotification, { volume: 0.3, preload: true });
    useEffect(() => stopNotification, [stopNotification]);
    useEffect(() => { if (muted) stopNotification(); }, [muted, stopNotification]);
    useEffect(() => {
        if (!showMessage || notificationPlayed.current) return;
        notificationPlayed.current = true;
        if (!muted) playNotification();
    }, [showMessage, muted, playNotification]);

    useEffect(() => {
        const t1 = setTimeout(() => {
            setShowNarration(false);
        }, 2500);

        const t2 = setTimeout(() => {
            setShowCharacter(true);
        }, 2800);

        const t3 = setTimeout(() => {
            setShowMessage(true);
        }, 4300);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">

            {/* Background */}
            <img
                src={officeBg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/20" />

            {/* Narration */}
            <AnimatePresence>
                {showNarration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="
                        absolute
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        "
                    >
                        <motion.div
                            initial={{ y: 30 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="
                            text-white
                            text-3xl
                            font-bold
                            "
                        >
                            เช้าที่แสนวุ่นวายในสถานีตำรวจ...
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Character */}
            <AnimatePresence>
                {showCharacter && (
                    <motion.img
                        src={heroChar}
                        alt=""
                        className="
                        absolute
                        bottom-0
                        right-8
                        h-[82vh]
                        w-auto
                        z-20
                        pointer-events-none
                        "
                        initial={{
                            x: 700,
                            opacity: 0,
                            scale: 0.9,
                        }}
                        animate={{
                            x: 0,
                            opacity: 1,
                            scale: 1,
                        }}
                        transition={{
                            duration: 1.2,
                            ease: "easeOut",
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Message Bubble */}
            <AnimatePresence>
                {showMessage && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.2,
                            x: 420,
                            y: 180,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.8,
                            type: "spring",
                            stiffness: 120,
                        }}
                        className="
                        absolute
                        top-[22%]
                        right-[36%]
                        z-40
                        max-w-[650px]
                        "
                    >
                        {/* หางกล่องชี้ไปมือถือ */}
                        <div
                            className="
                            absolute
                            right-[-24px]
                            top-[210px]
                            w-0
                            h-0
                            border-t-[24px]
                            border-b-[24px]
                            border-l-[24px]
                            border-t-transparent
                            border-b-transparent
                            border-l-[rgba(255,255,255,0.78)]
                            "
                        />

                        <div
                            className="
                            relative
                            overflow-hidden
                            border border-white/80
                            bg-white/[0.78]
                            backdrop-blur-md
                            rounded-[32px]
                            shadow-[0_25px_60px_rgba(15,23,42,0.32)]
                            p-8
                            before:absolute before:inset-3 before:rounded-[24px]
                            before:border before:border-white/50 before:pointer-events-none
                            "
                        >
                            <div className="relative z-10">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <span className="rounded-full border border-slate-700/20 bg-slate-900/10 px-3 py-1 text-[11px] font-bold tracking-[0.22em] text-slate-700">
                                        CASE FILE // NEW LEAD
                                    </span>
                                    <span className="text-xs font-semibold tracking-widest text-slate-600/80">
                                        PRIORITY 01
                                    </span>
                                </div>

                                <div className="mb-5 flex items-center gap-3">
                                    <MdWarning className="text-red-600 text-5xl drop-shadow-sm" />

                                    <h2 className="text-3xl font-bold tracking-wide text-red-600">
                                        แฟ้มคดีใหม่
                                    </h2>
                                </div>

                                <p className="text-xl leading-relaxed text-slate-800">
                                    เบาะแสเกี่ยวกับการคอร์รัปชันภายในองค์กรถูกส่งถึงคุณแล้ว
                                    <br />
                                    เตรียมเปิดแฟ้มคดี ค้นหาคำศัพท์ที่เกี่ยวข้องเพื่อเปิดโปงความจริง
                                </p>

                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                    }}
                                    whileTap={{
                                        scale: 0.95,
                                    }}
                                    onClick={() => navigate("/unit5/tutorial")}
                                    className="
                                    mt-8
                                    rounded-2xl
                                    border border-orange-300/60
                                    bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500
                                    px-10 py-4
                                    text-xl font-bold text-white
                                    shadow-[0_12px_24px_rgba(234,88,12,0.28)]
                                    "
                                >
                                    เปิดแฟ้มคดี
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
