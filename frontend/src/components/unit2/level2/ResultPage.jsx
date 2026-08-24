import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import ConfettiExplosion from "react-confetti-explosion";
import BackgroundImg from "../../../assets/unit2/Level2/sceneLevel2.png";

const TOTAL_QUESTIONS = 5;

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
    passed,
    resetGame,

    // จำนวนข้อที่ตอบถูกตั้งแต่ครั้งแรก
    firstTryCorrect = 0,
}) {
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();

    // จำกัด EXP ให้อยู่ระหว่าง 0 - 5
    const expEarned = Math.max(
        0,
        Math.min(TOTAL_QUESTIONS, firstTryCorrect)
    );

    // EXP รวมของด่าน
    const expProgress = (expEarned / TOTAL_QUESTIONS) * 100;

    // Animation
    const PRINT_DURATION = prefersReducedMotion ? 0 : 0.7;

    const animatedExp = useCountUp(expEarned, {
        duration: 900,
        start: true,
        delay: 500,
    });

    const [showExplosion, setShowExplosion] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowExplosion(false);
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    const getResultTitle = () => {
        if (expEarned === 5) {
            return "ยอดเยี่ยมมาก!";
        }

        if (expEarned >= 3) {
            return "ทำได้ดีมาก!";
        }

        if (expEarned >= 1) {
            return "เก่งมาก! พยายามต่อไป";
        }

        return "ลองอีกครั้งนะ!";
    };


    const getResultMessage = () => {
        if (expEarned === 5) {
            return "คุณเปรียบเทียบราคา วางแผนค่าใช้จ่าย และคิดก่อนตัดสินใจซื้อได้อย่างดีเยี่ยม";
        }

        if (expEarned >= 3) {
            return "คุณเริ่มเข้าใจการเปรียบเทียบราคาและการวางแผนค่าใช้จ่ายได้ดี ลองคิดให้รอบคอบขึ้นอีกนิด";
        }

        if (expEarned >= 1) {
            return "คุณเริ่มเข้าใจการใช้เงินแล้ว ลองทบทวนการเปรียบเทียบราคาและความจำเป็นก่อนตัดสินใจซื้อ";
        }

        return "ไม่เป็นไรนะ ลองทบทวนแต่ละสถานการณ์ แล้วคิดก่อนตัดสินใจใช้เงินอีกครั้ง";
    };


    const getTip = () => {
        if (expEarned === 5) {
            return "จำไว้นะ... เงินทุกบาทมีค่า ก่อนจ่าย ลองถามตัวเองว่า จำเป็นจริงไหม และคุ้มค่าหรือเปล่า?";
        }

        if (expEarned >= 3) {
            return "ก่อนจ่าย ลองเปรียบเทียบราคาและคิดถึงความจำเป็นก่อนเสมอ";
        }

        return "ก่อนซื้อ ลองถามตัวเองว่า สิ่งนี้จำเป็นจริงไหม และมีทางเลือกที่คุ้มกว่าหรือเปล่า?";
    };


    return (
        <div
            className="
        min-h-screen
        flex
        items-center
        justify-center
        px-4
        py-8
        relative
        overflow-hidden
        sarabun-bold
        bg-cover
        bg-center
        bg-no-repeat
    "
            style={{
                backgroundImage: `url(${BackgroundImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
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
                            boxShadow: `
                                0 0 ${p.size * 3}px
                                ${p.size}px
                                rgba(255,255,230,0.8)
                            `,
                            animation: `
                                hpDotFloat
                                ${p.dur}
                                ${p.delay}
                                ease-in-out
                                infinite
                                alternate
                            `,
                        }}
                    />
                ))}
            </div>

            {showExplosion && passed && (
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
                className="
                    relative
                    z-20
                    w-[620px]
                    max-w-[94vw]
                    flex-shrink-0
                "
            >

                <div
                    className="
                        absolute
                        inset-0
                        translate-y-4
                        translate-x-2
                        rounded-[24px]
                    "
                    style={{
                        background: "#000",
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
                    className="
                        absolute
                        inset-0
                        rounded-[24px]
                        pointer-events-none
                    "
                    style={{
                        background:
                            "rgba(120,90,45,0.06)",
                    }}
                />

                <div
                    className="
                        relative
                        z-10
                        flex
                        flex-col
                        items-center
                        px-8
                        md:px-12
                        pt-8
                        pb-7
                    "
                >
                    <p
                        className="text-xs md:text-sm mb-2"
                        style={{
                            color: "#5a4326",
                        }}
                    >
                        สรุปผลการคำนวณ
                    </p>


                    <h1
                        className="
                            text-3xl
                            md:text-4xl
                            font-black
                            text-center
                            mb-1
                        "
                        style={{
                            color: "#3B2A1E",
                            textShadow:
                                "0 1px 0 rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.12)",
                        }}
                    >
                        สรุปผล
                    </h1>

                    <p
                        className="
                            text-xl
                            md:text-2xl
                            font-black
                            mb-2
                        "
                        style={{
                            color: "#3F5A34",
                        }}
                    >
                        {getResultTitle()}
                    </p>


                    <div
                        className="
                            w-40
                            h-[3px]
                            mb-5
                            rounded-full
                        "
                        style={{
                            background: "#8a6a3c",
                            opacity: 0.5,
                        }}
                    />

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
                                className="
                relative
                flex
                shrink-0
                items-center
                justify-center
                w-24
                h-24
            "
                            >
                                <div
                                    className="
                    absolute
                    inset-0
                    rotate-6
                    bg-gradient-to-b
                    from-yellow-300
                    via-yellow-400
                    to-orange-500
                    [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_95%,50%_72%,21%_95%,32%_57%,2%_35%,39%_35%)]
                    drop-shadow-[0_5px_4px_rgba(120,70,0,0.35)]
                "
                                />

                                <span
                                    className="
                    relative
                    z-10
                    text-xl
                    font-black
                    text-white
                "
                                    style={{
                                        textShadow:
                                            "0 2px 2px rgba(120,70,0,0.4)",
                                    }}
                                >
                                    EXP
                                </span>
                            </motion.div>


                            {/* EXP EARNED */}
                            <div className="flex flex-col justify-center">

                                <p
                                    className="
                    text-lg
                    font-bold
                    mb-0
                "
                                    style={{
                                        color: "#6b5636",
                                    }}
                                >
                                    EXP ที่ได้รับ
                                </p>

                                <div
                                    className="
                    text-5xl
                    font-black
                    leading-none
                "
                                    style={{
                                        color: "#3B2A1E",
                                    }}
                                >
                                    +{animatedExp}
                                </div>

                            </div>

                        </div>
                    </motion.div>

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
                            delay: 1.2,
                        }}
                        className="
                            w-full
                            rounded-[20px]
                            border-2
                            border-[#C8D6A0]
                            bg-[#F4F7E7]
                            p-4
                            mb-6
                            flex
                            items-center
                            gap-4
                        "
                    >

                        {/* Lightbulb */}
                        <div
                            className="
                                shrink-0
                                flex
                                items-center
                                justify-center
                                w-14
                                h-14
                                rounded-full
                                bg-yellow-100
                                border-2
                                border-yellow-300
                                text-3xl
                            "
                        >
                            💡
                        </div>


                        <div className="text-center flex-1">

                            <p
                                className="
                                    text-lg
                                    md:text-xl
                                    font-black
                                    mb-1
                                "
                                style={{
                                    color: "#4E7A42",
                                }}
                            >
                                จำไว้นะ... เงินทุกบาทมีค่า
                            </p>

                            <p
                                className="
                                    text-sm
                                    md:text-base
                                    font-bold
                                    leading-relaxed
                                "
                                style={{
                                    color: "#4A3826",
                                }}
                            >
                                ก่อนจ่าย ลองถามตัวเองว่า
                                <br />

                                <span
                                    className="
                                        text-base
                                        md:text-lg
                                        font-black
                                    "
                                    style={{
                                        color: "#D85B5B",
                                    }}
                                >
                                    “จำเป็นจริงไหม และคุ้มค่าหรือเปล่า?”
                                </span>
                            </p>

                        </div>

                    </motion.div>


                    {/* ==================================================
                        BUTTONS
                    ================================================== */}
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
                        className="
                            flex
                            gap-3
                            w-full
                        "
                    >

                        {/* HOME */}
                        <button
                            onClick={() => navigate("/unit2")}
                            className="
                                flex-1
                                h-14
                                rounded-[18px]
                                border-4
                                border-[#D99616]
                                bg-gradient-to-b
                                from-[#FFD95A]
                                to-[#F5B928]
                                text-[#5A3B0A]
                                font-black
                                text-base
                                md:text-lg
                                shadow-[0_5px_0_#B9780C,0_7px_12px_rgba(0,0,0,0.2)]
                                hover:-translate-y-1
                                active:translate-y-1
                                active:shadow-[0_2px_0_#B9780C]
                                transition-all
                            "
                        >
                            🏠 หน้าหลัก
                        </button>


                        {/* RETRY */}
                        <button
                            onClick={resetGame}
                            className="
                                flex-1
                                h-14
                                rounded-[18px]
                                border-4
                                border-[#2D8B2D]
                                bg-gradient-to-b
                                from-[#65D85D]
                                to-[#39B83C]
                                text-white
                                font-black
                                text-base
                                md:text-lg
                                shadow-[0_5px_0_#247524,0_7px_12px_rgba(0,0,0,0.2)]
                                hover:-translate-y-1
                                active:translate-y-1
                                active:shadow-[0_2px_0_#247524]
                                transition-all
                            "
                        >
                            🔄 เล่นอีกครั้ง
                        </button>


                        {/* NEXT */}
                        <button
                            onClick={() =>
                                navigate("/unit2/final", {
                                    state: {
                                        startAtIntro: true,
                                    },
                                })
                            }
                            disabled={!passed}
                            className="
                                flex-1
                                h-14
                                rounded-[18px]
                                border-4
                                border-[#2471B8]
                                bg-gradient-to-b
                                from-[#5DB7F5]
                                to-[#328DD3]
                                text-white
                                font-black
                                text-base
                                md:text-lg
                                shadow-[0_5px_0_#1E5A91,0_7px_12px_rgba(0,0,0,0.2)]
                                hover:-translate-y-1
                                active:translate-y-1
                                active:shadow-[0_2px_0_#1E5A91]
                                disabled:opacity-40
                                disabled:cursor-not-allowed
                                disabled:hover:translate-y-0
                                transition-all
                            "
                        >
                            ▶ ไปต่อ
                        </button>

                    </motion.div>

                </div>

            </motion.div>


            {/* ==================================================
                Animation
            ================================================== */}
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