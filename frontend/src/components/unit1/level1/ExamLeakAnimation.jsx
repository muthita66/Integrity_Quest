import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import { useSound } from "../../../hooks/useSound";
import keyboardSfx from "../../../assets/sounds/keyboard.mp3";
import uiSoundSfx from "../../../assets/sounds/ui_sounds.mp3";
import Notification from "../../../assets/sounds/notification.mp3"

import QuizImg from "../../../assets/unit1/level1/QuizImg.png";
import phone from "../../../assets/unit1/level1/exam1.png";
import friend from "../../../assets/unit1/level1/exam2.png";

import AnimationLayout from "./components/AnimationLayout";
import ChoiceButtons from "./components/ChoiceButtons";
import QuestionBox from "./components/QuestionBox";

export default function ExamLeakAnimation({
    question,
    handleAnswer,
    reaction,
}) {
    const [step, setStep] = useState(1);
    const [typedQuestion, setTypedQuestion] = useState("");
    const [skipped, setSkipped] = useState(false);
    const timersRef = useRef([]);

    const handleSkip = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        setSkipped(true);
        setTypedQuestion(question.question);
        stopKeyboard();
        setStep(7);
    };

    const { play: playKeyboard, stop: stopKeyboard } = useSound(keyboardSfx, { volume: 0.5, loop: true });
    const { play: playUI } = useSound(uiSoundSfx, { volume: 0.7 });
    const { play: playNotification } = useSound(Notification, { volume: 0.8 });

    useEffect(() => {
        setStep(1);
        setTypedQuestion("");
        setSkipped(false);

        timersRef.current = [
            setTimeout(() => setStep(2), 500),
            setTimeout(() => setStep(3), 2500),
            setTimeout(() => setStep(4), 4500),
            setTimeout(() => {
                setStep(5);
                playKeyboard();
                stopKeyboard();
            }, 6000),
            setTimeout(() => setStep(6), 7200),
        ];

        return () => timersRef.current.forEach(clearTimeout);
    }, [question.question]);

    useEffect(() => {
        if (step !== 6) return;
        if (skipped) return;

        let i = 0;
        playKeyboard();

        const typing = setInterval(() => {
            setTypedQuestion(
                question.question.slice(0, i + 1)
            );

            i++;

            if (i >= question.question.length) {
                clearInterval(typing);
                stopKeyboard();
                setStep(7);
            }
        }, 40);

        return () => {
            clearInterval(typing);
            stopKeyboard();
        };
    }, [step, question.question]);

    return (
        <AnimationLayout onSkip={handleSkip} showSkip={step < 7}>

            {/* Background base dark */}
            <div className="absolute inset-0 bg-slate-900" />

            {/* exam1 zoom-in */}
            {step >= 2 && (
                <motion.img
                    src={phone}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2.9, ease: "easeOut" }}
                    onAnimationComplete={() => playNotification()}
                />
            )}

            <div className="absolute inset-0 bg-black/40" />

            {/* Friend */}
            {step >= 3 && (
                <motion.img
                    src={friend}
                    alt=""
                    className="
                        absolute
                        left-[40%]
                        bottom-[42%]
                        w-32
                        md:w-44
                        z-30
                    "
                    initial={{
                        x: -250,
                        opacity: 0,
                    }}
                    animate={{
                        x: 0,
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.8,
                    }}
                />
            )}

            {/* Speech */}
            {step >= 4 && (
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    className="
                        absolute
                        left-[20%]
                        top-[12%]
                        bg-white
                        text-black
                        px-5
                        py-3
                        rounded-2xl
                        shadow-xl
                        z-40
                    "
                >
                    เฮ้ย! ข้อสอบหลุดนี่นา
                </motion.div>
            )}

            {/* Guardian */}
            {step >= 6 && (
                <motion.img
                    src={QuizImg}
                    alt=""
                    className="absolute -right-2 -bottom-10 w-30 md:w-48 z-50 pointer-events-none"
                    initial={{
                        opacity: 0,
                        x: 120,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: 0.8,
                    }}
                />
            )}

            {/* Choices */}
            <ChoiceButtons
                show={step >= 7}
                question={question}
                handleAnswer={handleAnswer}
                reaction={reaction}
                playUI={playUI}
            />

            {/* Question */}
            <QuestionBox
                show={step >= 6}
                text={typedQuestion}
                isTyping={true}
            />
        </AnimationLayout>
    );
}
