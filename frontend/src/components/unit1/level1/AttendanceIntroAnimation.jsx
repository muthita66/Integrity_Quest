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

const EMPTY_STORIES = [];

export default function AttendanceIntroAnimation({
    question,
    stories = EMPTY_STORIES,
    handleAnswer,
    reaction,
}) {
    const [step, setStep] = useState(1);
    const [dialogue, setDialogue] = useState("");
    const [typedQuestion, setTypedQuestion] = useState("");
    const [skipped, setSkipped] = useState(false);

    const timersRef = useRef([]);

    const { play: playKeyboard, stop: stopKeyboard } = useSound(
        keyboardSfx,
        {
            volume: 0.5,
            loop: true,
        }
    );

    const { play: playUI } = useSound(
        uiSoundSfx,
        {
            volume: 0.7,
        }
    );

    // ==========================================
    // Story จาก Database
    // ==========================================
    const storyTexts = [...stories]
        .sort((a, b) => a.story_order - b.story_order)
        .map((story) => story.text || "");

    // ==========================================
    // Question จาก Database
    // ==========================================
    const questionText = question?.question_text || "";

    // ==========================================
    // Skip
    // ==========================================
    const handleSkip = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        setSkipped(true);
        stopKeyboard();

        // แสดงคำถามเต็มทันที
        setTypedQuestion(questionText);

        setStep(7);
    };

    // ==========================================
    // Story Animation
    // ==========================================
    useEffect(() => {
        if (!question) return;

        // Reset
        setStep(1);
        setDialogue(storyTexts[0] || "");
        setTypedQuestion("");
        setSkipped(false);

        // ถ้ายังไม่มี Story
        if (storyTexts.length === 0) {
            setStep(6);
            return;
        }

        // Story 1
        const timer1 = setTimeout(() => {
            setStep(2);
            setDialogue(storyTexts[1] || "");
        }, 2000);

        // Story 2
        const timer2 = setTimeout(() => {
            setStep(3);
            setDialogue(storyTexts[2] || "");
        }, 4000);

        // Story 3
        const timer3 = setTimeout(() => {
            setStep(4);
            setDialogue(storyTexts[3] || "");
        }, 5500);

        // ไปหน้าคำถาม
        const timer4 = setTimeout(() => {
            setStep(6);
        }, 9500);

        timersRef.current = [
            timer1,
            timer2,
            timer3,
            timer4,
        ];

        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, [question?.question_id, stories]);

    // ==========================================
    // Typing Question
    // ==========================================
    useEffect(() => {
        if (step !== 6) return;
        if (skipped) return;
        if (!questionText) {
            setStep(7);
            return;
        }

        setTypedQuestion("");

        let i = 0;

        playKeyboard();

        const typing = setInterval(() => {
            setTypedQuestion(
                questionText.slice(0, i + 1)
            );

            i++;

            if (i >= questionText.length) {
                clearInterval(typing);
                stopKeyboard();
                setStep(7);
            }
        }, 40);

        return () => {
            clearInterval(typing);
            stopKeyboard();
        };
    }, [
        step,
        skipped,
        questionText,
    ]);

    return (
        <AnimationLayout
            onSkip={handleSkip}
            showSkip={step < 7}
        >
            <img
                src={classroom}
                alt=""
                className="
                    absolute inset-0
                    w-full h-full
                    object-cover
                    z-0
                "
            />

            <div
                className="
                    absolute inset-0
                    bg-black/40
                "
            />

            {step >= 2 && (
                <motion.img
                    src={
                        step >= 7
                            ? attendance2
                            : attendance1
                    }
                    alt=""
                    className="
                        absolute
                        left-1/2
                        top-[12%]
                        -translate-x-1/2
                        z-30
                        w-64
                    "
                    initial={{
                        scale: 0,
                        opacity: 0,
                        rotate: -10,
                    }}
                    animate={{
                        opacity: 1,
                        rotate: 0,
                        scale:
                            step >= 7
                                ? 1
                                : 1.2,
                    }}
                />
            )}

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
                        left-[12%]
                        top-[11%]
                        bg-white
                        text-black
                        px-5
                        py-3
                        rounded-2xl
                        max-w-xs
                        z-40
                        shadow-xl
                    "
                >
                    {storyTexts[2] ||
                        "ช่วยเซ็นชื่อให้หน่อย เรากำลังมาสาย"}
                </motion.div>
            )}

            {step >= 6 && (
                <motion.img
                    src={QuizImg}
                    alt=""
                    className="
                        absolute
                        -right-2
                        -bottom-10
                        w-30
                        md:w-48
                        z-50
                        pointer-events-none
                    "
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

            <QuestionBox
                show={!!dialogue || step >= 6}
                text={
                    step >= 6
                        ? typedQuestion
                        : dialogue
                }
                isTyping={
                    step === 6
                }
            />

            <ChoiceButtons
                show={step >= 7}
                question={question}
                handleAnswer={handleAnswer}
                reaction={reaction}
                playUI={playUI}
            />

        </AnimationLayout>
    );
}
