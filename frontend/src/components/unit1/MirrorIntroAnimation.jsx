import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import wallet from "../../assets/unit1/wallet.png";
import guardian from "../../assets/unit1/guardian.png";
import gym from "../../assets/unit1/gym.jpg";

export default function MirrorIntroAnimation({
    question,
    handleAnswer,
    reaction,
}) {
    const [step, setStep] = useState(1);
    const [text, setText] = useState("");

    useEffect(() => {
        setStep(1);
        setText("");

        const timers = [];

        timers.push(setTimeout(() => setStep(3), 2200));
        timers.push(setTimeout(() => setStep(4), 4200));

        return () => timers.forEach(clearTimeout);
    }, [question.question]);

    useEffect(() => {
        if (step !== 4) return;

        let i = 0;

        const typing = setInterval(() => {
            setText(question.question.slice(0, i + 1));
            i++;

            if (i >= question.question.length) {
                clearInterval(typing);
                setStep(5);
            }
        }, 40);

        return () => clearInterval(typing);
    }, [step, question.question]);

    return (
        <div className="relative w-full h-full overflow-hidden rounded-[30px]">

            {/* Background */}
            <motion.img
                src={gym}
                alt="background"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            />

            <div className="absolute inset-0 bg-black/40" />

            {/* Wallet */}
            {step !== 1 && (
                <motion.img
                    src={wallet}
                    alt="wallet"
                    className="
                        absolute
                        left-1/2
                        w-24
                        md:w-32
                        -translate-x-1/2
                        z-20
                    "
                    initial={{ opacity: 0 }}
                    animate={
                        step === 2
                            ? {
                                top: "0%",
                                y: 350,
                                rotate: 20,
                                opacity: 1,
                            }
                            : step === 3
                                ? {
                                    top: "72%",
                                    y: [0, -10, 5, 0],
                                    rotate: 0,
                                    opacity: 1,
                                }
                                : step === 4
                                    ? {
                                        top: "72%",
                                        y: 0,
                                        opacity: 1,
                                    }
                                    : step === 5
                                        ? {
                                            top: "38%",
                                            scale: 1.15,
                                            opacity: 1,
                                            y: 0,
                                        }
                                        : {
                                            opacity: 0,
                                        }
                    }
                    transition={{
                        duration: 0.9,
                    }}
                />
            )}

            {/* Guardian */}
            {step >= 4 && (
                <motion.img
                    src={guardian}
                    alt="guardian"
                    className="
                        absolute
                        -right-6
                        -bottom-2
                        w-40
                        md:w-56
                        z-50
                        pointer-events-none
                    "
                    initial={{ opacity: 0, x: 120 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                />
            )}

            {/* Choices */}
            {step >= 5 && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="
                        absolute
                        bottom-[18%]
                        left-1/2
                        -translate-x-1/2
                        w-[90%]
                        flex
                        flex-col
                        md:flex-row
                        gap-4
                        z-40
                    "
                >
                    <button
                        onClick={() => handleAnswer("A")}
                        disabled={reaction !== null}
                        className="
                            flex-1
                            bg-green-600/95
                            hover:bg-green-500
                            p-4
                            rounded-2xl
                            text-white
                            transition
                        "
                    >
                        <div className="font-black text-xl mb-2">
                            A
                        </div>
                        {question.A}
                    </button>

                    <button
                        onClick={() => handleAnswer("B")}
                        disabled={reaction !== null}
                        className="
                            flex-1
                            bg-red-600/95
                            hover:bg-red-500
                            p-4
                            rounded-2xl
                            text-white
                            transition
                        "
                    >
                        <div className="font-black text-xl mb-2">
                            B
                        </div>
                        {question.B}
                    </button>
                </motion.div>
            )}

            {/* Dialogue */}
            {step >= 4 && (
                <motion.div
                    className="
                        absolute
                        bottom-[2%]
                        left-1/2
                        -translate-x-1/2
                        w-[92%]
                        bg-slate-900/90
                        backdrop-blur-sm
                        p-4
                        md:p-5
                        text-white
                        z-30
                        rounded-2xl
                    "
                >
                    <p className="text-base md:text-xl text-center">
                        {text}
                        <span className="animate-pulse">|</span>
                    </p>
                </motion.div>
            )}
        </div>
    );
}