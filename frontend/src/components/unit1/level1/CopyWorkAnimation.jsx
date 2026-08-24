import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import { useSound } from "../../../hooks/useSound";
import keyboardSfx from "../../../assets/sounds/keyboard.mp3";
import uiSoundSfx from "../../../assets/sounds/ui_sounds.mp3";

import studentBg from "../../../assets/unit1/level1/student_working.png";
import friend from "../../../assets/unit1/level1/friend5.png";
import QuizImg from "../../../assets/unit1/level1/QuizImg.png";;
import student5 from "../../../assets/unit1/level1/student5.png"

import AnimationLayout from "./components/AnimationLayout";
import ChoiceButtons from "./components/ChoiceButtons";
import QuestionBox from "./components/QuestionBox";

export default function CopyWorkAnimation({
    question,
    handleAnswer,
    reaction,
}) {
    const [step, setStep] = useState(1);
    const [typedQuestion, setTypedQuestion] = useState("");
    const [dialogue, setDialogue] = useState("");
    const [showFriendDialogue, setShowFriendDialogue] = useState(false);
    const [showStudentReaction, setShowStudentReaction] = useState(false); // student 5
    const [skipped, setSkipped] = useState(false);
    const timersRef = useRef([]);

    const handleSkip = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        setSkipped(true);
        setTypedQuestion(question.question);
        setShowFriendDialogue(true);
        setShowStudentReaction(true);
        setDialogue("ขอไฟล์หน่อย ส่งมาทั้งชุดเลยได้ไหม");
        stopKeyboard();
        setStep(5);
    };

    const { play: playKeyboard, stop: stopKeyboard } = useSound(keyboardSfx, { volume: 0.5, loop: true });
    const { play: playUI } = useSound(uiSoundSfx, { volume: 0.7 });

    useEffect(() => {
        setStep(1);
        setDialogue("");
        setTypedQuestion("");
        setShowFriendDialogue(false);
        setShowStudentReaction(false);
        setSkipped(false);

        timersRef.current = [
            setTimeout(() => setDialogue("ในที่สุด งานก็เสร็จสักที"), 1000),
            setTimeout(() => setDialogue(""), 2700),
            setTimeout(() => setStep(2), 2700),
            setTimeout(() => {
                setStep(3);
                setShowFriendDialogue(true);
                setDialogue("ขอไฟล์หน่อย ส่งมาทั้งชุดเลยได้ไหม");
            }, 4500),
            setTimeout(() => setShowStudentReaction(true), 5500),
            setTimeout(() => setStep(4), 6500)
        ];

        return () => timersRef.current.forEach(clearTimeout);
    }, [question.question]);

    useEffect(() => {
        if (step !== 4) return;
        if (skipped) return;

        let i = 0;
        playKeyboard();

        const typing = setInterval(() => {
            setTypedQuestion(
                question.question.slice(0, i + 1)
            );

            i++;

            if (
                i >= question.question.length
            ) {
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
            <img
                src={studentBg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover scale-110"
            />

            {/* Student Speech */}
            {dialogue === "ในที่สุด งานก็เสร็จสักที" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="
                        absolute
                        left-1/2
                        -translate-x-[90%]
                        top-[20%]
                        bg-white
                        text-black
                        px-5
                        py-3
                        rounded-2xl
                        shadow-xl
                        z-40
                    "
                >
                    {dialogue}
                </motion.div>
            )}
            <div className={`absolute inset-0 transition-colors duration-700 ${showFriendDialogue ? "bg-black/70" : "bg-black/40"}`} />

            {/* Friend */}
            {showFriendDialogue && (
                <motion.img
                    src={friend}
                    alt=""
                    className="
                        absolute
                        left-[-7%]
                        bottom-[0%]
                        w-85
                        z-30
                        scale-x-[-1]
                    "
                    initial={{
                        x: -200,
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

            {/* Student Reaction */}
            {showStudentReaction && (
                <motion.img
                    src={student5}
                    alt=""
                    className="
                        absolute
                        right-[3%]
                        bottom-[0%]
                        w-75
                        z-30
                    "
                    initial={{
                        opacity: 0,
                        x: 100,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: 0.6,
                    }}
                />
            )}
            {/* Speech */}
            {showFriendDialogue && dialogue === "ขอไฟล์หน่อย ส่งมาทั้งชุดเลยได้ไหม" && (
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    className="
                        absolute
                        left-[18%]
                        top-[15%]
                        bg-white
                        text-black
                        px-5
                        py-3
                        rounded-2xl
                        shadow-xl
                        z-40
                    "
                >
                    {dialogue}
                </motion.div>
            )}

            {step >= 4 && (
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
                show={step >= 5}
                question={question}
                handleAnswer={handleAnswer}
                reaction={reaction}
                playUI={playUI}
            />

            {/* Question Box */}
            <QuestionBox
                show={step >= 4}
                text={typedQuestion}
                isTyping={true}
            />
        </AnimationLayout>
    );
}
