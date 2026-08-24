import React, { useState, useEffect, useRef } from "react";
import bgGameImg from "../../../assets/unit2/Level2/intro/bgmarket.jpg";
import bgGame from "../../../assets/unit2/Level2/bgLevel2.png";

import Coffee from "../../../assets/unit2/Level2/coffee.jpg";
import Rice from "../../../assets/unit2/Level2/rice.png";
import Bag from "../../../assets/unit2/Level2/bag.png";
import LuxuryBags from "../../../assets/unit2/Level2/luxuryBag.png";
import Ticket from "../../../assets/unit2/Level2/ticket2.png";
import Bill from "../../../assets/unit2/Level2/bill.png";
import Smartphone from "../../../assets/unit2/Level2/smartphone.png";
import Money from "../../../assets/unit2/Level2/money.png";
import Sneakers from "../../../assets/unit2/Level2/sneakers.png";
import Sneakers2 from "../../../assets/unit2/Level2/sneakers2.png";

import ResultPage from "./ResultPage";
import TimeoutModal from "./TimeoutModal";
import PauseModal from "./PauseModal";

import { MdTableRows } from "react-icons/md";
import { LuAlarmClock } from "react-icons/lu";
import { FaPause } from "react-icons/fa";
import ExitDialog from "../level1/components/ExitDialog";

import AnswerForm from "./components/AnswerForm";
import ProductComparison from "./components/ProductComparison";
import QuestionPanel from "./components/QuestionPanel";
import HintMiniGameModal from "./HintMiniGameModal";

const QUESTIONS = [
    {
        id: 1,
        title: "Level 2: Calculation Puzzle (1/5)",
        question: "ถ้าซื้อกาแฟ 1 แก้ว จะซื้อข้าวได้กี่จาน?",
        items: [
            { name: "กาแฟหรู", price: 150, src: Coffee, alt: "กาแฟหรู" },
            { name: "ข้าวราดแกง", price: 50, src: Rice, alt: "ข้าวราดแกง" },
        ],
        correctAnswer: "3",
        hint: "ลองเปรียบเทียบราคากาแฟกับราคาข้าว แล้วดูว่าราคาข้าวรวมกันกี่จานจึงจะเท่ากับกาแฟ 1 แก้ว",
        buttonText: "SUBMIT",
    },
    {
        id: 2,
        title: "Level 2: Calculation Puzzle (2/5)",
        question: "เจนควรเลือกซื้อกระเป๋าใบใดที่คุ้มค่าที่สุด? (พิมพ์ราคาสินค้าชิ้นนั้น)",
        items: [
            { name: "กระเป๋าแบรนด์เนม", price: 32000, src: LuxuryBags, alt: "กระเป๋าแบรนด์เนม" },
            { name: "กระเป๋าใช้งาน", price: 450, src: Bag, alt: "กระเป๋าใช้งาน" },
        ],
        correctAnswer: "450",
        hint: "ลองเปรียบเทียบประโยชน์ที่ได้รับกับเงินที่ต้องจ่ายของกระเป๋าทั้งสองใบ",
        buttonText: "SUBMIT",
    },
    {
        id: 3,
        title: "Level 2: Calculation Puzzle (3/5)",
        question: "ราคาตั๋วคอนเสิร์ต 1 ใบ สามารถเปลี่ยนเป็นค่าน้ำไฟได้กี่เดือน?",
        items: [
            { name: "ตั๋วคอนเสิร์ต", price: 4500, src: Ticket, alt: "ตั๋วคอนเสิร์ต" },
            { name: "ค่าน้ำไฟ / เดือน", price: 900, src: Bill, alt: "ค่าน้ำไฟ" },
        ],
        correctAnswer: "5",
        hint: "ถ้าแบ่งเงิน 4,500 บาทออกเป็นส่วนละ 900 บาท จะได้ทั้งหมดกี่ส่วน?",
        buttonText: "SUBMIT",
    },
    {
        id: 4,
        title: "Level 2: Calculation Puzzle (4/5)",
        question:
            "ถ้าอยากได้มือถือรุ่นใหม่ราคา 48,900 บาท แต่ได้เงินค่าขนมวันละ 100 บาท ต้องออมเงินกี่วันถึงจะซื้อได้โดยไม่ขอเงินพ่อแม่เพิ่ม?",
        items: [
            { name: "มือถือรุ่นใหม่", price: 48900, src: Smartphone, alt: "มือถือรุ่นใหม่" },
            { name: "เงินออม / วัน", price: 100, src: Money, alt: "เงินออม" },
        ],
        correctAnswer: "489",
        hint: "นำราคามือถือ หารด้วย เงินที่ออมได้ในแต่ละวันจ้า (โดยต้องออมวันละ 100 บาท)",
        buttonText: "SUBMIT",
    },
    {
        id: 5,
        title: "Level 2: Calculation Puzzle (5/5)",
        question: "ป๊อปมีรองเท้าอยู่แล้ว 3 คู่ แต่ซื้อคู่ใหม่ตามเพื่อน การซื้อครั้งนี้เป็นประเภทใด? (1 = ของจำเป็น, 2 = ของที่อยากได้)",
        items: [
            { name: "รองเท้าคู่ใหม่", price: 2500, src: Sneakers, alt: "รองเท้าคู่ใหม่" },
            { name: "รองเท้าเดิม 3 คู่", price: 0, src: Sneakers2, alt: "รองเท้าเดิม 3 คู่" },
        ],
        correctAnswer: "2",
        hint: "ลองคิดดูว่า รองเท้าคู่ใหม่เป็นสิ่งที่จำเป็นต้องมีเพิ่ม หรือเป็นเพียงสิ่งที่อยากได้มากขึ้น",
        buttonText: "FINISH",
    },
];

export default function CalculationGame() {
    const [isStarted, setIsStarted] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    const [hp, setHp] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [timeLeft, setTimeLeft] = useState(20);
    const [isFinished, setIsFinished] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [hasMistakeOnCurrent, setHasMistakeOnCurrent] = useState(false);
    const [showHintModal, setShowHintModal] = useState(false);
    const [firstTryCorrect, setFirstTryCorrect] = useState(0);

    const timerRef = useRef(null);
    const currentQ = QUESTIONS[currentStep];
    const passed = hp >= 15; // กำหนดเกณฑ์ผ่านคือ 15 HP ขึ้นไป (ตอบถูกครั้งแรก 3 ข้อ)

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (isStarted && !isPaused && !showHintModal && feedback === null && !isFinished) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setFeedback("timeout");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timerRef.current);
    }, [isStarted, currentStep, feedback, isFinished, isPaused, showHintModal]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!userInput || feedback !== null) return;

        if (userInput.trim() === currentQ.correctAnswer) {
            clearInterval(timerRef.current);
            setFeedback("correct");

            if (!hasMistakeOnCurrent) {
                setHp((prev) => prev + 5);
                setFirstTryCorrect((prev) => prev + 1);
            }

            setTimeout(() => {
                if (currentStep < QUESTIONS.length - 1) {
                    setCurrentStep((prev) => prev + 1);
                    setUserInput("");
                    setTimeLeft(20);
                    setFeedback(null);
                    setIsPaused(false);
                    setHasMistakeOnCurrent(false);
                } else {
                    setIsFinished(true);
                }
            }, 1500);
        } else {
            setFeedback("wrong");
            setHasMistakeOnCurrent(true);

            setTimeout(() => {
                setFeedback(null);
            }, 1500);
        }
    };

    const resetGame = () => {
        setCurrentStep(0);
        setHp(0);
        setUserInput("");
        setTimeLeft(20);
        setFeedback(null);
        setIsFinished(false);
        setIsStarted(true);
        setIsPaused(false);
        setHasMistakeOnCurrent(false);
        setFirstTryCorrect(0);
    };

    if (isFinished) {
        return (
            <ResultPage
                passed={passed}
                resetGame={resetGame}
                firstTryCorrect={firstTryCorrect}
            />
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 font-sara">
            {/* Background */}
            <img
                src={bgGameImg}
                alt=""
                className="absolute inset-0 z-0 h-full w-full object-cover"
            />
            {/* Overlay ฉากหลัง */}
            <div className="pointer-events-none absolute inset-0 z-0 bg-white/30" />

            {/* Game Board */}
            <div className="relative w-full max-w-6xl aspect-video overflow-hidden border-4 border-black shadow-2xl z-10">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgGame})` }}
                >
                    <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                </div>

                {/* Header แถบบน */}
                <div className="absolute top-4 left-0 right-0 z-30 flex w-full items-start justify-between px-6 pointer-events-none">

                    {/* นาฬิกา - ซ้ายสุด */}
                    <div className="pointer-events-auto">
                        <div className="min-w-[140px] text-white">
                            <p
                                className={`text-2xl font-black tracking-wider transition-all duration-300 ${timeLeft <= 10
                                    ? "text-red-500 animate-pulse"
                                    : "text-yellow-300"
                                    }`}
                            >
                                00:{String(timeLeft).padStart(2, "0")}
                            </p>
                        </div>
                    </div>

                    <div className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2">
                        <div className="flex items-center gap-3">

                            {QUESTIONS.map((_, index) => {
                                const isCompleted = index < currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <div
                                        key={index}
                                        className={`
                            rounded-full
                            transition-all
                            duration-300
                            ${isCompleted || isCurrent
                                                ? "h-3 w-3 bg-yellow-400 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                                                : "h-3 w-3 bg-gray-400"
                                            }
                            ${isCurrent
                                                ? "scale-125 ring-4 ring-yellow-400/40"
                                                : ""
                                            }
                        `}
                                        title={`ข้อที่ ${index + 1}`}
                                    />
                                );
                            })}

                        </div>
                    </div>

                    {/* ปุ่มควบคุม - ขวาสุด */}
                    <div className="flex gap-3 pointer-events-auto">
                        {!isPaused && (
                            <button
                                type="button"
                                onClick={() => setIsPaused(true)}
                                className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border-4 border-white bg-yellow-400 text-2xl text-slate-900 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-yellow-500 active:scale-95"
                                title="หยุดเกม"
                            >
                                <FaPause />
                            </button>
                        )}
                    </div>

                </div>

                {/* เนื้อหาภายในกรอบ */}
                <div className="relative z-20 flex flex-col items-center justify-center h-full pt-20 px-10 pb-4 sarabun-bold">
                    {/* สินค้า */}
                    <ProductComparison items={currentQ.items} />

                    {/* กล่องโจทย์ + คำตอบ */}
                    <div className="w-full max-w-3xl h-[200px] mx-auto flex flex-col gap-4 mt-2">
                        <QuestionPanel
                            question={currentQ.question}
                            onHintClick={() => setShowHintModal(true)}
                        >
                            <AnswerForm
                                userInput={userInput}
                                setUserInput={setUserInput}
                                feedback={feedback}
                                handleSubmit={handleSubmit}
                                buttonText={currentQ.buttonText}
                                hint={currentQ.hint}
                                hasMistakeOnCurrent={hasMistakeOnCurrent}
                            />
                        </QuestionPanel>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <HintMiniGameModal
                isOpen={showHintModal}
                onClose={() => setShowHintModal(false)}
                questionId={currentQ.id}
                hint={currentQ.hint}
            />
            {feedback === "timeout" && (
                <TimeoutModal resetGame={resetGame} />
            )}
            <PauseModal
                isOpen={isPaused}
                onResume={() => setIsPaused(false)}
                onRestart={resetGame}
                onExit={() => setShowExitDialog(true)}
            />
            <ExitDialog
                open={showExitDialog}
                onClose={() => setShowExitDialog(false)}
            />
        </div>
    );
}