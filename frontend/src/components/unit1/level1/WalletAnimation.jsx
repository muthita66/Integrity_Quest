import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import { useSound } from "../../../hooks/useSound";
import keyboardSfx from "../../../assets/sounds/keyboard.mp3";
import uiSoundSfx from "../../../assets/sounds/ui_sounds.mp3";
import walletDropSfx from "../../../assets/sounds/wallet_drop.mp3";

import wallet from "../../../assets/unit1/level1/wallet.png";
import QuizImg from "../../../assets/unit1/level1/QuizImg.png";
import gym from "../../../assets/unit1/level1/gym.jpg";

import AnimationLayout from "./components/AnimationLayout";
import ChoiceButtons from "./components/ChoiceButtons";
import QuestionBox from "./components/QuestionBox";

export default function WalletAnimation({
    question,
    handleAnswer,
    reaction,
}) {
    const [step, setStep] = useState(1);
    const [text, setText] = useState("");

    const [skipped, setSkipped] = useState(false);

    const timersRef = useRef([]);

    const handleSkip = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        setSkipped(true);
        setText(question.question);
        stopKeyboard();
        setStep(5);
    };

    const { play: playKeyboard, stop: stopKeyboard } = useSound(keyboardSfx, { volume: 0.5, loop: true });
    const { play: playUI } = useSound(uiSoundSfx, { volume: 0.7 });
    const { play: playWalletDrop } = useSound(walletDropSfx, { volume: 0.8 });

    useEffect(() => {
        setStep(1);
        setText("");
        setSkipped(false);

        timersRef.current = [
            setTimeout(() => setStep(3), 2200),
            setTimeout(() => playWalletDrop(), 2470),
            setTimeout(() => setStep(4), 4200)
        ];

        return () => timersRef.current.forEach(clearTimeout);
    }, [question.question]);

    useEffect(() => {
        if (step !== 4) return;
        if (skipped) return;

        let i = 0;
        playKeyboard();

        const typing = setInterval(() => {
            setText(question.question.slice(0, i + 1));
            i++;

            if (i >= question.question.length) {
                clearInterval(typing);
                stopKeyboard();
                setStep(5);
            }
        }, 40);

        return () => {
            clearInterval(typing);
            stopKeyboard();
        };
    }, [step, question.question]);

    return (
        <AnimationLayout onSkip={handleSkip} showSkip={step < 5}>

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
                    src={QuizImg}
                    alt="guardian"
                    className="absolute -right-2 -bottom-10 w-30 md:w-48 z-50 pointer-events-none
                    "
                    initial={{ opacity: 0, x: 120 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                />
            )}

            {/* Choices */}
            <ChoiceButtons
                show={step >= 5}
                question={question}
                handleAnswer={handleAnswer}
                reaction={reaction}
                playUI={playUI}
            />

            {/* Dialogue */}
            <QuestionBox
                show={step >= 4}
                text={text}
                isTyping={true}
            />
        </AnimationLayout>
    );
}
