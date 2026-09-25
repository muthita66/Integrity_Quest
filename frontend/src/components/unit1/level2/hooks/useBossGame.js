import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

const ANSWER_DELAY = 500;
const FINISH_DELAY = 1500;

const generateBossParticles = () => {
    return Array.from(
        { length: 20 },
        (_, index) => ({
            id: `${Date.now()}-${index}-${Math.random()}`,
            size: Math.random() * 30 + 15,
            offsetX: (Math.random() - 0.5) * 300,
            offsetY: (Math.random() - 0.5) * 200,
            duration: Math.random() * 0.8 + 0.6,
        })
    );
};

export default function useBossGame({
    levelId,
    playId,
    onFinish,
    onFail,
    playPopSound,
}) {
    const navigate = useNavigate();

    const [bossQuestions, setBossQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [flashStatus, setFlashStatus] = useState(null);
    const [isDefeated, setIsDefeated] = useState(false);
    const [particles, setParticles] = useState([]);
    const [showFailPopup, setShowFailPopup] = useState(false);
    const timeoutIdsRef = useRef([]);

    // ==========================================
    // Fetch Boss Questions
    // ==========================================
    const fetchBossQuestions = useCallback(async () => {
        if (!levelId) return;
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(
                `http://localhost:5000/api/question/level/${levelId}`
            );
            if (!response.ok) {
                throw new Error(`ไม่สามารถโหลดคำถามได้ (${response.status})`);
            }
            const data = await response.json();
            console.log("Boss Questions:", data);
            const questionData = Array.isArray(data) ? data : data.questions || [];
            const formattedQuestions = questionData.map((question) => {
                // Prisma relation จาก backend ใช้ชื่อ `choice`
                const choices = question.choices || question.choice || [];
                const formattedChoices = choices.map((choice) => ({
                    text: choice.choice_text,
                    value: choice.choice_key,
                }));
                const correctChoice = choices.find((c) => c.is_correct === true);
                return {
                    id: question.question_id,
                    question: question.question_text,
                    choices: formattedChoices,
                    // เก็บ rawChoices ไว้เพื่อใช้ choice_id ตอนส่ง API
                    rawChoices: choices.map((c) => ({
                        choice_id: c.choice_id,
                        choice_key: c.choice_key,
                    })),
                    correct: correctChoice?.choice_key,
                };
            });
            setBossQuestions(formattedQuestions);
            setCurrentQuestionIndex(0);
        } catch (err) {
            console.error("โหลด Boss Questions ไม่สำเร็จ:", err);
            setError(err.message || "ไม่สามารถโหลดคำถามได้");
        } finally {
            setIsLoading(false);
        }
    }, [levelId]);

    useEffect(() => {
        fetchBossQuestions();
    }, [fetchBossQuestions]);

    const currentQuestion = bossQuestions[currentQuestionIndex];

    // ==========================================
    // Timeout helpers
    // ==========================================
    const clearSavedTimeouts = useCallback(() => {
        timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
        timeoutIdsRef.current = [];
    }, []);

    const addTimeout = useCallback((callback, delay) => {
        const id = window.setTimeout(() => {
            callback();
            timeoutIdsRef.current = timeoutIdsRef.current.filter((s) => s !== id);
        }, delay);
        timeoutIdsRef.current.push(id);
        return id;
    }, []);

    // ==========================================
    // บันทึกคำตอบ Boss → game_play_answers
    // ==========================================
    const saveAnswer = useCallback(async (questionId, choiceId) => {
        if (!playId) {
            console.warn("saveAnswer: ไม่มี playId — ข้ามการบันทึก");
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("saveAnswer: ไม่มี token");
            return;
        }
        try {
            const res = await fetch(
                "http://localhost:5000/api/game-play/answer",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        play_id: playId,
                        question_id: questionId,
                        choice_id: choiceId,
                    }),
                }
            );
            const result = await res.json();
            console.log("บันทึกคำตอบ Boss:", result);
            if (!res.ok) {
                console.error("saveAnswer API error:", result.message);
            }
        } catch (err) {
            console.error("saveAnswer error:", err);
        }
    }, [playId]);

    // ==========================================
    // Boss defeated → COMPLETED ใน game_play_history
    // ==========================================
    const completeGame = useCallback(async () => {
        if (!playId) {
            console.warn("completeGame: ไม่มี playId");
            onFinish?.();
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("completeGame: ไม่มี token");
            onFinish?.();
            return;
        }
        try {
            const res = await fetch(
                "http://localhost:5000/api/game-play/complete",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ play_id: playId }),
                }
            );
            const result = await res.json();
            console.log("จบเกม Level 2:", result);

            if (!res.ok) {
                console.error("completeGame API error:", result.message);
                setError(
                    result.message || "ไม่สามารถจบเกมได้"
                );
                // ไม่ navigate ไปหน้า Result ถ้า backend ปฏิเสธ
                // (เช่นยังตอบ Boss ไม่ครบ / ยังไม่ผ่านด่าน Bubble)
                return;
            }

            // ----------------------------------------------
            // เก็บผลลัพธ์ทั้งก้อน (status, earned_ip, bonus_ip,
            // wrong_count, total_integrity_points, ...) ไว้ให้
            // หน้า Result อ่านต่อ แล้วค่อย navigate ไป
            // ----------------------------------------------
            localStorage.setItem(
                "level2Result",
                JSON.stringify(result.data)
            );

            navigate("/unit1/level2/result");
        } catch (err) {
            console.error("completeGame error:", err);
            setError(
                err.message || "ไม่สามารถจบเกมได้"
            );
        } finally {
            onFinish?.();
        }
    }, [playId, onFinish, navigate]);

    // ==========================================
    // Handle Answer
    // ==========================================
    const handleAnswer = useCallback((choiceValue) => {
        if (flashStatus || isDefeated || showFailPopup) return;
        if (!currentQuestion) return;

        playPopSound();

        const isCorrect = choiceValue === currentQuestion.correct;
        setFlashStatus(isCorrect ? "correct" : "wrong");

        // หา choice_id จาก choice_key เพื่อส่ง API
        const matchedChoice = currentQuestion.rawChoices?.find(
            (c) => c.choice_key === choiceValue
        );
        if (matchedChoice) {
            saveAnswer(currentQuestion.id, matchedChoice.choice_id);
        }

        addTimeout(() => {
            setFlashStatus(null);

            if (!isCorrect) {
                setShowFailPopup(true);
                return;
            }

            const isLast = currentQuestionIndex >= bossQuestions.length - 1;

            if (isLast) {
                setIsDefeated(true);
                setParticles(generateBossParticles());
                // เรียก completeGame → status: PERFECT/PASS → เก็บผล
                // ลง localStorage แล้ว navigate ไปหน้า Result
                addTimeout(() => { completeGame(); }, FINISH_DELAY);
                return;
            }

            setCurrentQuestionIndex((prev) => prev + 1);
        }, ANSWER_DELAY);
    }, [
        addTimeout,
        bossQuestions,
        completeGame,
        currentQuestion,
        currentQuestionIndex,
        flashStatus,
        isDefeated,
        playPopSound,
        saveAnswer,
        showFailPopup,
    ]);

    // ==========================================
    // Handle Fail (ตอบผิด → Restart)
    // ==========================================
    const handleFail = useCallback(() => {
        setShowFailPopup(false);
        onFail?.();
    }, [onFail]);

    // ==========================================
    // Reset Boss Game
    // ==========================================
    const resetBossGame = useCallback(() => {
        clearSavedTimeouts();
        setCurrentQuestionIndex(0);
        setFlashStatus(null);
        setIsDefeated(false);
        setParticles([]);
        setShowFailPopup(false);
    }, [clearSavedTimeouts]);

    useEffect(() => {
        return () => { clearSavedTimeouts(); };
    }, [clearSavedTimeouts]);

    return {
        currentQuestion,
        currentQuestionIndex,
        totalQuestions: bossQuestions.length,
        flashStatus,
        isDefeated,
        particles,
        showFailPopup,
        isLoading,
        error,
        handleAnswer,
        handleFail,
        resetBossGame,
        fetchBossQuestions,
    };
}