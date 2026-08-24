import { useState } from "react";
import { FaLightbulb } from "react-icons/fa";
import { HiLockClosed, HiLockOpen } from "react-icons/hi";

import Food from "../../../../assets/unit2/Level1/Minigame/food.png";
import Game from "../../../../assets/unit2/Level1/Minigame/game.png";

import paper from "../../../../assets/unit2/Level1/Minigame/paper.png";
import decoration from "../../../../assets/unit2/Level1/Minigame/decorative.png";

import bus from "../../../../assets/unit2/Level1/Minigame/bus.png";
import snack from "../../../../assets/unit2/Level1/Minigame/snack.png";

import QuestionOne from "../../../../assets/unit2/level1/Minigame/QuestionOne.png";
import QuestionTwo from "../../../../assets/unit2/level1/Minigame/QuestionTwo.png";
import QuestionThree from "../../../../assets/unit2/level1/Minigame/QuestionThree.png";

const MINI_SCENARIOS = [
    {
        icon: QuestionOne,
        situation: (
            <>
                เงินของคุณเหลือ{" "}
                <span className="font-bold text-green-600">
                    50 บาทสุดท้าย
                </span>
                <br />
                วันนี้คุณยังไม่ได้กินข้าว แต่เกมที่อยากได้กำลังลดราคา
                <br />
                เหลือเพียง{" "}
                <span className="font-bold text-orange-500">
                    30 บาท
                </span>
            </>
        ),
        question: "คุณจะเลือกอะไร?",
        options: [
            {
                icon: Food,
                text: "ซื้ออาหาร",
                answer: "need",
            },
            {
                icon: Game,
                text: "ซื้อเกม",
                answer: "want",
            },
        ],
    },

    {
        icon: QuestionTwo,
        situation: (
            <>
                พรุ่งนี้คุณต้องส่งรายงาน
                <br />
                แต่กระดาษสำหรับพิมพ์งานหมดแล้ว
                <br />
                ขณะเดียวกันคุณเห็นของตกแต่งโต๊ะที่กำลังลดราคา
            </>
        ),
        question: "คุณจะเลือกอะไร?",
        options: [
            {
                icon: paper,
                text: "ซื้อกระดาษ",
                answer: "need",
            },
            {
                icon: decoration,
                text: "ซื้อของตกแต่ง",
                answer: "want",
            },
        ],
    },

    {
        icon: QuestionThree,
        situation: (
            <>
                วันนี้คุณต้องเดินทางไปเรียน แต่มีเงินติดตัวอยู่เพียง{" "}
                <span className="font-bold text-green-600">
                    40 บาท
                </span>
                <br />
                ระหว่างทางมีร้านขนมที่คุณชอบ แต่ค่าเดินทางก็ต้องจ่ายเช่นกัน
            </>
        ),
        question: "คุณจะเลือกอะไร?",
        options: [
            {
                icon: bus,
                text: "จ่ายค่าเดินทาง",
                answer: "need",
            },
            {
                icon: snack,
                text: "ซื้อขนม",
                answer: "want",
            },
        ],
    },
];

function HintDialog({
    isOpen,
    onClose,
    hintUnlocked,
    onUnlock,
}) {
    const [step, setStep] = useState(
        hintUnlocked ? "hint" : "game"
    );

    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [message, setMessage] = useState("");

    // ถ้า hintUnlocked เปลี่ยนจาก false -> true
    // ให้แสดงหน้าคำใบ้ทันที
    if (hintUnlocked && step === "game") {
        setStep("hint");
    }

    if (!isOpen) return null;

    const scenario = MINI_SCENARIOS[questionIndex];

    // =========================
    // ตอบคำถาม
    // =========================
    const handleAnswer = (answer) => {
        if (selectedAnswer) return;

        setSelectedAnswer(answer);

        const isCorrect = answer === "need";

        if (isCorrect) {
            setMessage("ถูกต้อง!");
            setScore((prev) => prev + 1);
        } else {
            setMessage("ยังไม่ถูก ลองคิดดูอีกครั้ง!");
        }

        setTimeout(() => {
            if (questionIndex === MINI_SCENARIOS.length - 1) {
                const finalScore =
                    score + (isCorrect ? 1 : 0);

                if (finalScore === 3) {
                    setStep("hint");
                    onUnlock?.();
                } else {
                    setStep("failed");
                }
            } else {
                setQuestionIndex((prev) => prev + 1);
                setSelectedAnswer(null);
                setMessage("");
            }
        }, 900);
    };

    // =========================
    // เล่นใหม่
    // =========================
    const handleRetry = () => {
        setStep("game");
        setQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setMessage("");
    };

    // =========================
    // ปิด Dialog
    // =========================
    const handleClose = () => {
        /*
         * ถ้ายังไม่ได้ปลดล็อกคำใบ้
         * ถือว่ายังเล่นไม่จบ
         *
         * ดังนั้นเมื่อออกจาก Dialog
         * จะไม่ถือว่าเล่นสำเร็จ
         * และเมื่อเปิดใหม่จะเริ่มตั้งแต่ข้อแรก
         */
        if (!hintUnlocked) {
            setStep("game");
            setQuestionIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setMessage("");
        }

        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
            onClick={handleClose}
        >
            {/* =========================
                Dialog
            ========================= */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-3xl border-4 border-[#8B5A2B] bg-[#DEB887] p-6 shadow-2xl"
            >

                {/* =========================
                    HEADER BADGE
                ========================= */}
                <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-green-500 p-3 shadow-md">
                    <FaLightbulb
                        size={28}
                        className="text-white"
                    />
                </div>

                {/* =========================
                    GAME
                ========================= */}
                {step === "game" && (
                    <div className="mt-6 rounded-2xl border-2 border-orange-200 bg-white/95 p-5 shadow-inner">

                        {/* Title */}
                        <h2 className="mb-2 flex items-center justify-center gap-2 text-center text-2xl font-bold text-slate-800">
                            <HiLockClosed size={28} />
                            ปลดล็อกคำใบ้
                        </h2>

                        <p className="mb-4 text-center text-sm text-slate-600">
                            อ่านสถานการณ์แล้วเลือกสิ่งที่ควรทำ
                        </p>

                        {/* =========================
                            PROGRESS
                        ========================= */}
                        <div className="mb-1 flex justify-center gap-2">
                            {MINI_SCENARIOS.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-3 w-3 rounded-full transition-all ${index < questionIndex
                                            ? "bg-green-500"
                                            : index === questionIndex
                                                ? "bg-orange-400"
                                                : "bg-slate-200"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* =========================
                            SITUATION
                        ========================= */}
                        <div className="p-5">

                            {/* Scenario Image */}
                            <div className="mb-2 flex justify-center">
                                <img
                                    src={scenario.icon}
                                    alt="สถานการณ์"
                                    className="h-32 w-full object-contain"
                                />
                            </div>

                            {/* Scenario Text */}
                            <p className="text-center text-sm font-medium leading-relaxed text-slate-700">
                                {scenario.situation}
                            </p>

                        </div>

                        {/* =========================
                            QUESTION
                        ========================= */}
                        <p className="mt-2 text-center text-sm font-bold text-slate-600">
                            {scenario.question}
                        </p>

                        {/* =========================
                            ANSWER BUTTONS
                        ========================= */}
                        <div className="mt-4 grid grid-cols-2 gap-3">

                            {scenario.options.map((option) => {
                                const isSelected =
                                    selectedAnswer === option.answer;

                                const isCorrect =
                                    option.answer === "need";

                                return (
                                    <button
                                        key={option.answer}
                                        onClick={() =>
                                            handleAnswer(
                                                option.answer
                                            )
                                        }
                                        disabled={
                                            !!selectedAnswer
                                        }
                                        className={`rounded-xl border-2 px-3 py-1 font-bold transition active:scale-95 ${isSelected
                                                ? isCorrect
                                                    ? "border-green-500 bg-green-200 text-green-800"
                                                    : "border-red-400 bg-red-100 text-red-600"
                                                : isCorrect
                                                    ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                                                    : "border-orange-500 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                            }`}
                                    >

                                        {/* =========================
                                            IMAGE
                                        ========================= */}
                                        <div className="flex h-20 items-center justify-center">

                                            <img
                                                src={option.icon}
                                                alt={option.text}
                                                className="h-20 w-20 object-contain drop-shadow-md transition-transform hover:scale-110"
                                            />

                                        </div>

                                        {/* Text */}
                                        <div className="mt-1 text-sm">
                                            {option.text}
                                        </div>

                                    </button>
                                );
                            })}

                        </div>

                        {/* =========================
                            MESSAGE
                        ========================= */}
                        <div className="mt-2 min-h-6 text-center text-sm font-bold">
                            {message}
                        </div>

                    </div>
                )}

                {/* =========================
                    FAILED
                ========================= */}
                {step === "failed" && (
                    <div className="mt-6 rounded-2xl border-2 border-orange-200 bg-white/95 p-6 text-center shadow-inner">

                        {/* Icon */}
                        <div className="text-6xl">
                            💭
                        </div>

                        {/* Title */}
                        <h2 className="mt-3 text-2xl font-bold text-slate-800">
                            ยังไม่ผ่าน!
                        </h2>

                        {/* Description */}
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            ลองคิดถึงสิ่งที่จำเป็นต่อการใช้ชีวิต
                            <br />
                            แล้วเลือกสิ่งนั้นก่อน
                        </p>

                        {/* Score */}
                        <div className="mt-4 rounded-xl bg-orange-50 p-3">
                            <p className="font-bold text-orange-600">
                                คะแนน {score} / 3
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="mt-5 flex justify-center gap-3">

                            <button
                                onClick={handleRetry}
                                className="rounded-xl bg-green-500 px-6 py-3 font-bold text-white shadow-md transition hover:bg-green-600 active:scale-95"
                            >
                                เล่นอีกครั้ง
                            </button>

                            <button
                                onClick={handleClose}
                                className="rounded-xl bg-[#8B5A2B] px-6 py-3 font-bold text-white shadow-md transition hover:bg-[#6b441f] active:scale-95"
                            >
                                ปิด
                            </button>

                        </div>

                    </div>
                )}

                {/* =========================
                    HINT
                ========================= */}
                {step === "hint" && (
                    <div className="mt-6 rounded-2xl border-2 border-orange-200 bg-white/95 p-5 shadow-inner">

                        {/* Title */}
                        <h2 className="mb-4 flex items-center justify-center gap-2 text-center text-2xl font-bold text-slate-800">
                            <HiLockOpen size={28} />
                            คำใบ้การเล่น
                        </h2>

                        <div className="space-y-4">

                            {/* NEEDS */}
                            <div className="rounded-xl border border-green-200 bg-green-50 p-3">

                                <h3 className="flex items-center gap-2 text-xl font-bold text-green-700">
                                    Needs (สิ่งจำเป็น)
                                </h3>

                                <p className="mt-1 text-sm text-slate-600">
                                    สิ่งของที่ขาดไม่ได้
                                    ต้องใช้ในการดำรงชีวิตพื้นฐาน
                                    เช่น อาหาร เสื้อผ้า
                                    ที่อยู่อาศัย หรือยารักษาโรค
                                </p>

                            </div>

                            {/* WANTS */}
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">

                                <h3 className="flex items-center gap-2 text-xl font-bold text-orange-600">
                                    Wants (สิ่งที่อยากได้)
                                </h3>

                                <p className="mt-1 text-sm text-slate-600">
                                    สิ่งของที่ทำให้เรามีความสุข
                                    หรือสะดวกสบายขึ้น
                                    แต่หากไม่มีก็ยังสามารถใช้ชีวิตต่อไปได้
                                </p>

                            </div>

                        </div>

                        {/* Close Button */}
                        <div className="mt-6 flex justify-center">

                            <button
                                onClick={handleClose}
                                className="rounded-xl bg-green-500 px-8 py-3 font-bold text-white shadow-md transition hover:bg-green-600 active:scale-95"
                            >
                                เข้าใจแล้ว !
                            </button>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

export default HintDialog;