import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import { useSound } from "../../../hooks/useSound";
import keyboardSfx from "../../../assets/sounds/keyboard.mp3";
import uiSoundSfx from "../../../assets/sounds/ui_sounds.mp3";

import score1 from "../../../assets/unit1/level1/score1.png";
import score2 from "../../../assets/unit1/level1/score2.png";
import friend from "../../../assets/unit1/level1/friend.png";
import QuizImg from "../../../assets/unit1/level1/QuizImg.png";

import AnimationLayout from "./components/AnimationLayout";
import ChoiceButtons from "./components/ChoiceButtons";
import QuestionBox from "./components/QuestionBox";

export default function ScoreAnimation({
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
        setStep(7);
    };

    const { play: playKeyboard, stop: stopKeyboard } = useSound(keyboardSfx, { volume: 0.5, loop: true });
    const { play: playUI } = useSound(uiSoundSfx, { volume: 0.7 });

    useEffect(() => {
        setStep(1);
        setText("");
        setSkipped(false);

        timersRef.current = [
            setTimeout(() => setStep(2), 2000),
            setTimeout(() => setStep(3), 3500),
            setTimeout(() => setStep(4), 4500),
            setTimeout(() => setStep(5), 6500),
            setTimeout(() => setStep(6), 8000),
        ];

        return () => timersRef.current.forEach(clearTimeout);
    }, [question.question]);

    useEffect(() => {
        if (step !== 6) return;
        if (skipped) return;

        let i = 0;
        playKeyboard();

        const typing = setInterval(() => {
            setText(
                question.question.slice(
                    0,
                    i + 1
                )
            );

            i++;

            if (
                i >= question.question.length
            ) {
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

            {/* Background */}
            <motion.img
                src={
                    step >= 2
                        ? score2
                        : score1
                }
                alt=""
                className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    object-cover
                "
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
                transition={{
                    duration: 0.5,
                }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Friend */}
            {step >= 3 && (
                <motion.img
                    src={friend}
                    alt=""
                    className="
                        absolute
                        right-5
                        bottom-0
                        w-72
                        md:w-75
                        z-30
                    "
                    initial={{
                        x: -300,
                    }}
                    animate={{
                        x: 0,
                    }}
                    transition={{
                        duration: 0.8,
                    }}
                />
            )}

            {/* Friend Bubble */}
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
                        right-[22%]
                        top-[18%]
                        bg-white
                        text-black
                        px-5
                        py-3
                        rounded-2xl
                        shadow-xl
                        z-40
                    "
                >
                    เฮ้ย!เธอได้เยอะกว่าที่ทำได้นี่นา
                </motion.div>
            )}

            {/* Zoom Effect */}
            {step >= 5 && (
                <motion.div
                    className="
                        absolute
                        inset-0
                        bg-black/30
                        z-20
                    "
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                />
            )}

            {/* Guardian */}
            {step >= 6 && (
                <motion.img
                    src={QuizImg}
                    alt=""
                    className="absolute -right-2 -bottom-10 w-30 md:w-48 z-50 pointer-events-none"
                    initial={{
                        x: 200,
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

            {/* Choices */}
            <ChoiceButtons
                show={step >= 7}
                question={question}
                handleAnswer={handleAnswer}
                reaction={reaction}
                playUI={playUI}
            />

            {/* Question Box */}
            <QuestionBox
                show={step >= 6}
                text={text}
                isTyping={true}
            />
        </AnimationLayout>
    );
}
