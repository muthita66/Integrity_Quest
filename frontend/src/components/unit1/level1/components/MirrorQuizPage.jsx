import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import bgGameLevel1 from "../../../../assets/unit1/level1/bg_game.png";
import bgMusic from "../../../../assets/sounds/BackgroundGame/1-Level1.mp3";

import { completeGame, startGame, submitAnswer } from "../../../services/gamePlayService";
import useBackgroundMusic from "../../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../../hooks/useGameMuted";

import WalletAnimation from "../WalletAnimation";
import AttendanceIntroAnimation from "../AttendanceIntroAnimation";
import ScoreAnimation from "../ScoreAnimation";
import ExamLeakAnimation from "../ExamLeakAnimation";
import CopyWorkAnimation from "../CopyWorkAnimation";
import NavBar from "./NavBar";

const LEVEL_ID = 1;
const animations = [WalletAnimation, AttendanceIntroAnimation, ScoreAnimation, ExamLeakAnimation, CopyWorkAnimation];

export default function MirrorQuizPage() {
    const navigate = useNavigate();
    const startedRef = useRef(false);
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [reaction, setReaction] = useState(null);
    const [wrongCount, setWrongCount] = useState(0);
    const [playId, setPlayId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gameError, setGameError] = useState(null);
    const [muted] = useGameMuted();

    useBackgroundMusic(bgMusic, { volume: 0.3, muted });

    const question = questions[current];
    const CurrentAnimation = animations[current] || WalletAnimation;

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        const initializeGame = async () => {
            try {
                const [questionResponse, gameResponse] = await Promise.all([
                    fetch(`http://localhost:5000/api/question/level/${LEVEL_ID}`),
                    startGame(LEVEL_ID),
                ]);

                if (!questionResponse.ok) throw new Error("ไม่สามารถดึงข้อมูลคำถามได้");

                const questionData = await questionResponse.json();
                const newPlayId = gameResponse?.data?.play_id;
                if (!newPlayId) throw new Error("ไม่พบ play_id จากเซิร์ฟเวอร์");

                setQuestions(questionData);
                setPlayId(newPlayId);
            } catch (error) {
                console.error("Error initializing game:", error);
                setGameError(error.response?.data?.message || error.message || "ไม่สามารถเริ่มเกมได้");
            } finally {
                setLoading(false);
            }
        };

        initializeGame();
    }, []);

    const handleAnswer = async (choiceKey) => {
        if (reaction !== null || isSubmitting || !playId || !question) return;

        const selectedChoice = question.choice?.find((item) => item.choice_key === choiceKey);
        if (!selectedChoice) return;

        setIsSubmitting(true);

        try {
            const answerResponse = await submitAnswer({
                playId,
                questionId: question.question_id,
                choiceId: selectedChoice.choice_id,
            });

            const isCorrect = answerResponse.data?.is_correct ?? selectedChoice.is_correct;
            const nextScore = answerResponse.data?.current_score ?? score + (selectedChoice.ip_reward || 0);
            const nextWrongCount = wrongCount + (isCorrect ? 0 : 1);

            setReaction(isCorrect ? "smile" : "frown");
            setScore(nextScore);
            setWrongCount(nextWrongCount);

            window.setTimeout(async () => {
                try {
                    if (current >= questions.length - 1) {
                        const completed = await completeGame(playId);

                        const result = completed?.data;

                        if (!result) {
                            throw new Error("ไม่พบข้อมูลผลการเล่นจากเซิร์ฟเวอร์");
                        }

                        navigate("/unit1/resultlevel1", {
                            state: {
                                result,
                            },
                        });

                        return;
                    }

                    setCurrent((prev) => prev + 1);
                    setReaction(null);
                    setIsSubmitting(false);
                } catch (error) {
                    console.error("Error completing game:", error);
                    setGameError(error.response?.data?.message || error.message || "ไม่สามารถจบเกมได้");
                    setIsSubmitting(false);
                }
            }, 500);
        } catch (error) {
            console.error("Error submitting answer:", error);
            setGameError(error.response?.data?.message || error.message || "ไม่สามารถบันทึกคำตอบได้");
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">กำลังเริ่มเกม...</div>;
    }

    if (gameError || !questions.length || !playId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p>{gameError || "ไม่พบข้อมูลเกม"}</p>
                <div className="flex gap-3">
                    <button onClick={() => window.location.reload()}>ลองใหม่</button>
                    <button onClick={() => navigate("/unit1/Level1IntroPage")}>กลับหน้าเริ่มเกม</button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-5 px-5 md:px-10 sarabun-bold"
            style={{ backgroundImage: `url(${bgGameLevel1})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 w-full max-w-6xl flex flex-col items-center shadow-2xl">
                <NavBar isFixed={false} />
                <div className="w-full h-[620px] border-4 border-t-0 border-black bg-white flex flex-col items-center justify-center overflow-hidden">
                    <div className="mirror-frame relative w-full h-full border-[10px] border-blue-400 bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 overflow-hidden">
                        <div className="absolute inset-[10px] rounded-[30px] border-[4px] border-blue-100/80 bg-white/10 backdrop-blur-md overflow-hidden">
                            <CurrentAnimation
                                key={question.question_id}
                                question={question}
                                handleAnswer={handleAnswer}
                                reaction={reaction}
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}