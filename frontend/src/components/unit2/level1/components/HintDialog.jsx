import { useEffect, useState } from "react";
import { HiLockClosed, HiLockOpen } from "react-icons/hi";
import Lamp from "../../../../assets/unit2/Level1/intro/lamp.png";

import QuestionOne from "../../../../assets/unit2/level1/Minigame/QuestionOne.png";
import QuestionTwo from "../../../../assets/unit2/level1/Minigame/QuestionTwo.png";
import QuestionThree from "../../../../assets/unit2/level1/Minigame/QuestionThree.png";

const API_URL = "http://localhost:5000";
const LEVEL_ID = 5;

const QUESTION_IMAGES = [
    QuestionOne,
    QuestionTwo,
    QuestionThree,
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

    const [questions, setQuestions] = useState([]);
    const [hints, setHints] = useState([]);

    const [questionLoading, setQuestionLoading] = useState(false);
    const [hintLoading, setHintLoading] = useState(false);

    const [questionError, setQuestionError] = useState(null);
    const [hintError, setHintError] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchQuestions = async () => {
            try {
                setQuestionLoading(true);
                setQuestionError(null);

                const response = await fetch(
                    `${API_URL}/api/question/level/${LEVEL_ID}`
                );

                if (!response.ok) {
                    throw new Error(
                        "ไม่สามารถโหลดข้อมูลคำถามได้"
                    );
                }

                const data = await response.json();

                setQuestions(data);
            } catch (error) {
                console.error(
                    "Error fetching questions:",
                    error
                );

                setQuestionError(error.message);
            } finally {
                setQuestionLoading(false);
            }
        };

        const fetchHints = async () => {
            try {
                setHintLoading(true);
                setHintError(null);

                const response = await fetch(
                    `${API_URL}/api/levelHint/level/${LEVEL_ID}/hints`
                );

                if (!response.ok) {
                    throw new Error(
                        "ไม่สามารถโหลดข้อมูลคำใบ้ได้"
                    );
                }

                const data = await response.json();

                setHints(data);
            } catch (error) {
                console.error(
                    "Error fetching hints:",
                    error
                );

                setHintError(error.message);
            } finally {
                setHintLoading(false);
            }
        };

        fetchQuestions();
        fetchHints();
    }, [isOpen]);

    useEffect(() => {
        if (hintUnlocked && step === "game") {
            setStep("hint");
        }
    }, [hintUnlocked, step]);

    if (!isOpen) return null;

    const scenario = questions[questionIndex];

    const needsHint = hints.find(
        (hint) => hint.hint_order === 1
    );

    const wantsHint = hints.find(
        (hint) => hint.hint_order === 2
    );

    const handleAnswer = (choice) => {
        if (selectedAnswer) return;

        setSelectedAnswer(choice.choice_id);

        const isCorrect = choice.is_correct;

        if (isCorrect) {
            setMessage("ถูกต้อง!");
            setScore((prev) => prev + 1);
        } else {
            setMessage("ยังไม่ถูก ลองคิดดูอีกครั้ง!");
        }

        setTimeout(() => {
            if (questionIndex === questions.length - 1) {
                const finalScore =
                    score + (isCorrect ? 1 : 0);

                if (finalScore === questions.length) {
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

    const handleRetry = () => {
        setStep("game");
        setQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setMessage("");
    };

    const handleClose = () => {
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
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-3xl border-4 border-[#8B5A2B] bg-[#DEB887] p-6 shadow-2xl"
            >
                {/* HEADER BADGE */}
                <div className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border-4 border-gray-300 bg-white p-3 shadow-md">
                    <img
                        src={Lamp}
                        alt=""
                        className="h-12 w-12"
                    />
                </div>

                {/* GAME */}
                {step === "game" && (
                    <div className="mt-6 rounded-2xl border-2 border-orange-200 bg-white/95 p-5 shadow-inner">
                        <h2 className="mb-2 flex items-center justify-center gap-2 text-center text-2xl font-bold text-slate-800">
                            <HiLockClosed size={28} />
                            ปลดล็อกคำใบ้
                        </h2>

                        <p className="mb-4 text-center text-sm text-slate-600">
                            อ่านสถานการณ์แล้วเลือกสิ่งที่ควรทำ
                        </p>

                        {/* LOADING */}
                        {questionLoading && (
                            <div className="py-10 text-center text-sm font-medium text-slate-600">
                                กำลังโหลดคำถาม...
                            </div>
                        )}

                        {/* ERROR */}
                        {!questionLoading && questionError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                                <p className="font-bold text-red-600">
                                    ไม่สามารถโหลดคำถามได้
                                </p>

                                <p className="mt-1 text-sm text-red-500">
                                    {questionError}
                                </p>
                            </div>
                        )}

                        {/* QUESTION */}
                        {!questionLoading &&
                            !questionError &&
                            scenario && (
                                <>
                                    {/* PROGRESS */}
                                    <div className="mb-1 flex justify-center gap-2">
                                        {questions.map(
                                            (_, index) => (
                                                <div
                                                    key={index}
                                                    className={`h-3 w-3 rounded-full transition-all ${index <
                                                            questionIndex
                                                            ? "bg-green-500"
                                                            : index ===
                                                                questionIndex
                                                                ? "bg-orange-400"
                                                                : "bg-slate-200"
                                                        }`}
                                                />
                                            )
                                        )}
                                    </div>

                                    {/* SITUATION */}
                                    <div className="p-5">
                                        <div className="mb-2 flex justify-center">
                                            <img
                                                src={
                                                    QUESTION_IMAGES[
                                                    questionIndex
                                                    ]
                                                }
                                                alt="สถานการณ์"
                                                className="h-32 w-full object-contain"
                                            />
                                        </div>

                                        <p className="text-center text-sm font-medium leading-relaxed text-slate-700">
                                            {scenario.question_text}
                                        </p>
                                    </div>

                                    {/* QUESTION */}
                                    <p className="mt-2 text-center text-sm font-bold text-slate-600">
                                        คุณจะเลือกอะไร?
                                    </p>

                                    {/* ANSWER BUTTONS */}
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        {scenario.choice?.map(
                                            (option) => {
                                                const isSelected =
                                                    selectedAnswer ===
                                                    option.choice_id;

                                                const isCorrect =
                                                    option.is_correct;

                                                return (
                                                    <button
                                                        key={
                                                            option.choice_id
                                                        }
                                                        onClick={() =>
                                                            handleAnswer(
                                                                option
                                                            )
                                                        }
                                                        disabled={
                                                            !!selectedAnswer
                                                        }
                                                        className={`rounded-xl border-2 px-3 py-1 font-bold transition active:scale-95 ${isSelected
                                                                ? isCorrect
                                                                    ? "border-green-500 bg-green-200 text-green-800"
                                                                    : "border-red-400 bg-red-100 text-red-600"
                                                                : "border-orange-500 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                                            }`}
                                                    >
                                                        {/* IMAGE FROM DATABASE */}
                                                        <div className="flex h-20 items-center justify-center">
                                                            <img
                                                                src={
                                                                    option.image
                                                                }
                                                                alt={
                                                                    option.choice_text
                                                                }
                                                                className="h-20 w-20 object-contain drop-shadow-md transition-transform hover:scale-110"
                                                            />
                                                        </div>

                                                        {/* TEXT FROM DATABASE */}
                                                        <div className="mt-1 text-sm">
                                                            {
                                                                option.choice_text
                                                            }
                                                        </div>
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>

                                    {/* MESSAGE */}
                                    <div className="mt-2 min-h-6 text-center text-sm font-bold">
                                        {message}
                                    </div>
                                </>
                            )}
                    </div>
                )}

                {/* FAILED */}
                {step === "failed" && (
                    <div className="mt-6 rounded-2xl border-2 border-orange-200 bg-white/95 p-6 text-center shadow-inner">
                        <div className="text-6xl">
                            💭
                        </div>

                        <h2 className="mt-3 text-2xl font-bold text-slate-800">
                            ยังไม่ผ่าน!
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            ลองคิดถึงสิ่งที่จำเป็นต่อการใช้ชีวิต
                            <br />
                            แล้วเลือกสิ่งนั้นก่อน
                        </p>

                        <div className="mt-4 rounded-xl bg-orange-50 p-3">
                            <p className="font-bold text-orange-600">
                                คะแนน {score} / {questions.length}
                            </p>
                        </div>

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

                {/* HINT */}
                {step === "hint" && (
                    <div className="mt-6 rounded-2xl border-2 border-orange-200 bg-white/95 p-5 shadow-inner">
                        <h2 className="mb-4 flex items-center justify-center gap-2 text-center text-2xl font-bold text-slate-800">
                            <HiLockOpen size={28} />
                            คำใบ้การเล่น
                        </h2>

                        {/* LOADING */}
                        {hintLoading && (
                            <div className="py-8 text-center text-sm font-medium text-slate-600">
                                กำลังโหลดคำใบ้...
                            </div>
                        )}

                        {/* ERROR */}
                        {!hintLoading && hintError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                                <p className="font-bold text-red-600">
                                    ไม่สามารถโหลดคำใบ้ได้
                                </p>

                                <p className="mt-1 text-sm text-red-500">
                                    {hintError}
                                </p>
                            </div>
                        )}

                        {/* HINT DATA */}
                        {!hintLoading && !hintError && (
                            <div className="space-y-4">
                                {/* NEEDS */}
                                {needsHint && (
                                    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                                        <h3 className="flex items-center gap-2 text-xl font-bold text-green-700">
                                            {needsHint.title}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {
                                                needsHint.description
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* WANTS */}
                                {wantsHint && (
                                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                                        <h3 className="flex items-center gap-2 text-xl font-bold text-orange-600">
                                            {wantsHint.title}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {
                                                wantsHint.description
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* NO DATA */}
                                {!needsHint && !wantsHint && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                                        ไม่พบข้อมูลคำใบ้
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CLOSE BUTTON */}
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