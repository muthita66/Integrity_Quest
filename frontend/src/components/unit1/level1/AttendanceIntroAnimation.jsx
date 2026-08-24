import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import { useSound } from "../../../hooks/useSound";
import keyboardSfx from "../../../assets/sounds/keyboard.mp3";
import uiSoundSfx from "../../../assets/sounds/ui_sounds.mp3";

import classroom from "../../../assets/unit1/level1/classroom_small.jpg";
import attendance1 from "../../../assets/unit1/level1/attendance1.png";
import attendance2 from "../../../assets/unit1/level1/attendance2.png";
import QuizImg from "../../../assets/unit1/level1/QuizImg.png";

import AnimationLayout from "./components/AnimationLayout";
import ChoiceButtons from "./components/ChoiceButtons";
import QuestionBox from "./components/QuestionBox";

const storyTexts = [
    "คุณกำลังเดินเข้าห้องเรียนก่อนเวลา...",
    "ทันใดนั้น เพื่อนโทรหาคุณ",
    "ช่วยเซ็นชื่อให้หน่อย เรากำลังมาสาย!",
    "อีกไม่กี่นาทีอาจารย์จะเช็กชื่อแล้ว...",
];

export default function AttendanceIntroAnimation({
    question,
    handleAnswer,
    reaction,
}) {
    const [step, setStep] = useState(1);
    const [dialogue, setDialogue] = useState(storyTexts[0]);
    const [typedQuestion, setTypedQuestion] = useState("");
    const [skipped, setSkipped] = useState(false);

    const timersRef = useRef([]);

    const { play: playKeyboard, stop: stopKeyboard } = useSound(keyboardSfx, { volume: 0.5, loop: true });
    const { play: playUI } = useSound(uiSoundSfx, { volume: 0.7 });

    const handleSkip = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        setSkipped(true);
        stopKeyboard();
        setTypedQuestion(question.question);
        setStep(6);
    };

    useEffect(() => {
        setStep(1);
        setDialogue(storyTexts[0]);
        setTypedQuestion("");
        setSkipped(false);

        timersRef.current = [
            setTimeout(() => { setStep(2); setDialogue(storyTexts[1]); }, 2000),
            setTimeout(() => { setStep(3); setDialogue(storyTexts[2]); }, 4000),
            setTimeout(() => { setStep(4); setDialogue(storyTexts[3]); }, 5500),
            setTimeout(() => { setStep(6); }, 9500),
        ];

        return () => timersRef.current.forEach(clearTimeout);
    }, [question.question]);

    useEffect(() => {
        if (step !== 6) return;
        if (skipped) return;

        setTypedQuestion("");

        let i = 0;
        playKeyboard();

        const typing = setInterval(() => {
            setTypedQuestion(question.question.slice(0, i + 1));
            i++;

            if (i >= question.question.length) {
                clearInterval(typing);
                stopKeyboard();
            }
        }, 40);

        return () => {
            clearInterval(typing);
            stopKeyboard();
        };
    }, [step, question.question]);

    return (
        <AnimationLayout onSkip={handleSkip} showSkip={step < 6}>

            {/* Background */}
            <img
                src={classroom}
                alt=""
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            <div className="absolute inset-0 bg-black/40" />

            {/* Attendance Sheet */}
            {step >= 2 && (
                <motion.img
                    src={
                        step >= 6 && typedQuestion.length === question.question.length
                            ? attendance2
                            : attendance1
                    }
                    alt=""
                    className="absolute left-1/2 top-[12%] -translate-x-1/2 z-30 w-64"
                    initial={{ scale: 0, opacity: 0, rotate: -10 }}
                    animate={{
                        opacity: 1,
                        rotate: 0,
                        scale:
                            step >= 6 && typedQuestion.length === question.question.length
                                ? 1
                                : 1.2,
                    }}
                />
            )}


            {/* Friend Speech Bubble */}
            {step >= 4 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute left-[12%] top-[11%] bg-white text-black px-5 py-3 rounded-2xl max-w-xs z-40 shadow-xl"
                >
                    ช่วยเซ็นชื่อให้หน่อย เรากำลังมาสาย
                </motion.div>
            )}

            {/* Guardian */}
            {step >= 6 && (
                <motion.img
                    src={QuizImg}
                    alt=""
                    className="absolute -right-2 -bottom-10 w-30 md:w-48 z-50 pointer-events-none"
                    initial={{ opacity: 0, x: 120 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                />
            )}

            {/* Question Box */}
            <QuestionBox
                show={dialogue || step >= 6}
                text={step >= 6 ? typedQuestion : dialogue}
                isTyping={step >= 6 && typedQuestion.length < question.question.length}
            />

            {/* Choices */}
            <ChoiceButtons
                show={step >= 6 && typedQuestion.length === question.question.length}
                question={question}
                handleAnswer={handleAnswer}
                reaction={reaction}
                playUI={playUI}
            />
        </AnimationLayout>
    );
}