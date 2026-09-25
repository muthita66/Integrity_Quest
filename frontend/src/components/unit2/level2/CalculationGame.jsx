import React, { useState, useEffect, useRef } from "react";
import bgGame from "../../../assets/unit2/Level2/bgLevel2.png";
import bgMusic from "../../../assets/sounds/Unit2/bg_Level2.mp3";
import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../hooks/useGameMuted";

import ResultPage from "./ResultPage";
import TimeoutModal from "./TimeoutModal";
import PauseModal from "./PauseModal";

import { FaPause } from "react-icons/fa";
import ExitDialog from "../level1/components/ExitDialog";

import AnswerForm from "./components/AnswerForm";
import ProductComparison from "./components/ProductComparison";
import QuestionPanel from "./components/QuestionPanel";
import HintMiniGameModal from "./HintMiniGameModal";

export default function CalculationGame() {
    const [isStarted, setIsStarted] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userInput, setUserInput] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [timeLeft, setTimeLeft] = useState(20);
    const [isFinished, setIsFinished] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [hasMistakeOnCurrent, setHasMistakeOnCurrent] = useState(false);
    const [showHintModal, setShowHintModal] = useState(false);
    const [playId, setPlayId] = useState(null);
    /*
     * ผลจริงจาก Backend (completeGame ของ level_id=6) — เดิมหน้า
     * Result รับ passed/firstTryCorrect ที่ Frontend คำนวณเอง (hp >= 15,
     * ไม่เคยถูกตรวจสอบกับ DB เลย) ตอนนี้เก็บ response ดิบจาก backend
     * ไว้ใช้ส่งต่อให้หน้า Result แทน (hp/passed/firstTryCorrect ที่เคย
     * คำนวณเองฝั่งนี้ตัดออกไปด้วย เพราะไม่มีใครใช้แล้ว)
     */
    const [result, setResult] = useState(null);

    const timerRef = useRef(null);
    const hasStartedRef = useRef(false);

    const currentQ = questions[currentStep];

    // ==========================================
    // เพลงพื้นหลัง เบา ๆ เล่นวนระหว่างเล่น
    // พอจบเกม (หน้า Result) หรือหมดเวลา (TimeoutModal) เพลงจะหยุด
    // แล้วเริ่มใหม่ตั้งแต่ต้นเมื่อกดเล่นอีกครั้ง
    // ==========================================
    const [muted] = useGameMuted();
    const isMusicStopped = isFinished || feedback === "timeout";

    const musicRef = useBackgroundMusic(bgMusic, {
        volume: 0.15,
        muted: muted || isMusicStopped,
    });

    useEffect(() => {
        const audio = musicRef.current;
        if (!audio || !isMusicStopped) return;

        audio.pause();
        audio.currentTime = 0;
    }, [isMusicStopped, musicRef]);

    const startGame = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
            }

            const response = await fetch(
                "http://localhost:5000/api/game-play/start",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        level_id: 6,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "ไม่สามารถเริ่มเกมได้"
                );
            }

            setPlayId(result.data.play_id);
        } catch (error) {
            console.error("Error starting game:", error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        const fetchGameData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const [questionsResponse, hintsResponse] =
                    await Promise.all([
                        fetch(
                            "http://localhost:5000/api/comparisonQuestion/level/6"
                        ),
                        fetch(
                            "http://localhost:5000/api/levelHint/level/6/hints"
                        ),
                    ]);

                if (!questionsResponse.ok) {
                    throw new Error(
                        "Failed to fetch comparison questions"
                    );
                }

                if (!hintsResponse.ok) {
                    throw new Error("Failed to fetch level hints");
                }

                const questionsData = await questionsResponse.json();
                const hintsData = await hintsResponse.json();

                const formattedQuestions = questionsData.map((item) => {
                    const currentHint = hintsData.find(
                        (hint) =>
                            hint.comparison_question_id === item.id
                    );

                    return {
                        id: item.id,

                        title: `Level 2: Calculation Puzzle (${item.question_order}/5)`,

                        question: item.question_text,

                        items: [
                            {
                                name: item
                                    .items_comparison_questions_left_item_idToitems
                                    .name,

                                price: item.left_price,

                                src: item
                                    .items_comparison_questions_left_item_idToitems
                                    .image,

                                alt: item
                                    .items_comparison_questions_left_item_idToitems
                                    .name,
                            },
                            {
                                name: item
                                    .items_comparison_questions_right_item_idToitems
                                    .name,

                                price: item.right_price,

                                src: item
                                    .items_comparison_questions_right_item_idToitems
                                    .image,

                                alt: item
                                    .items_comparison_questions_right_item_idToitems
                                    .name,
                            },
                        ],

                        correctAnswer: String(item.correct_answer),

                        hint: currentHint?.description || "",

                        buttonText:
                            item.question_order === questionsData.length
                                ? "FINISH"
                                : "SUBMIT",
                    };
                });

                setQuestions(formattedQuestions);

                await startGame();
            } catch (error) {
                console.error("Error fetching game data:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameData();
    }, []);

    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (
            isStarted &&
            !isPaused &&
            !showHintModal &&
            feedback === null &&
            !isFinished
        ) {
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
    }, [
        isStarted,
        currentStep,
        feedback,
        isFinished,
        isPaused,
        showHintModal,
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userInput || feedback !== null || !playId) {
            return;
        }

        const userAnswer = Number(userInput.trim());
        const isCorrect =
            userInput.trim() === currentQ.correctAnswer;

        if (isCorrect) {
            clearInterval(timerRef.current);
            setFeedback("correct");

            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error(
                        "ไม่พบ Token กรุณาเข้าสู่ระบบใหม่"
                    );
                }

                const response = await fetch(
                    "http://localhost:5000/api/game-play/comparison",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            play_id: playId,
                            comparison_question_id: currentQ.id,
                            user_answer: userAnswer,
                        }),
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "ไม่สามารถบันทึกคำตอบได้"
                    );
                }

                setTimeout(async () => {
                    if (currentStep < questions.length - 1) {
                        setCurrentStep((prev) => prev + 1);
                        setUserInput("");
                        setTimeLeft(20);
                        setFeedback(null);
                        setIsPaused(false);
                        setHasMistakeOnCurrent(false);
                    } else {
                        try {
                            const completeResponse = await fetch(
                                "http://localhost:5000/api/game-play/complete",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                        play_id: playId,
                                    }),
                                }
                            );

                            const completeResult =
                                await completeResponse.json();

                            if (!completeResponse.ok) {
                                throw new Error(
                                    completeResult.message ||
                                    "ไม่สามารถจบเกมได้"
                                );
                            }

                            setResult(completeResult.data);
                            setIsFinished(true);
                        } catch (completeError) {
                            console.error(
                                "Error completing game:",
                                completeError
                            );
                            setFeedback(null);
                            setError(completeError.message);
                        }
                    }
                }, 1500);
            } catch (error) {
                console.error(
                    "Error saving comparison answer:",
                    error
                );
                setFeedback(null);
                setError(error.message);
            }
        } else {
            // บันทึกคำตอบที่ผิดด้วย
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error(
                        "ไม่พบ Token กรุณาเข้าสู่ระบบใหม่"
                    );
                }

                const response = await fetch(
                    "http://localhost:5000/api/game-play/comparison",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            play_id: playId,
                            comparison_question_id: currentQ.id,
                            user_answer: userAnswer,
                        }),
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "ไม่สามารถบันทึกคำตอบได้"
                    );
                }

                setFeedback("wrong");
                setHasMistakeOnCurrent(true);

                setTimeout(() => {
                    setFeedback(null);
                }, 1500);
            } catch (error) {
                console.error(
                    "Error saving comparison answer:",
                    error
                );
                setFeedback(null);
                setError(error.message);
            }
        }
    };

    const resetGame = async () => {
        setCurrentStep(0);
        setUserInput("");
        setTimeLeft(20);
        setFeedback(null);
        setIsFinished(false);
        setIsStarted(true);
        setIsPaused(false);
        setHasMistakeOnCurrent(false);
        setError(null);
        setPlayId(null);
        setResult(null);

        await startGame();
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-xl font-bold">
                    กำลังโหลดข้อมูลเกม...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-xl font-bold text-red-500">
                    ไม่สามารถโหลดข้อมูลเกมได้
                </p>
            </div>
        );
    }

    if (!currentQ) {
        return null;
    }

    if (isFinished) {
        return (
            <ResultPage
                result={result}
                resetGame={resetGame}
            />
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 font-sara">
            {/* Background */}
            <img
                src={bgGame}
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

                    {/* จุดแสดงจำนวนข้อ */}
                    <div className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2">
                        <div className="flex items-center gap-3">
                            {questions.map((_, index) => {
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