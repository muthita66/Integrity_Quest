import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

const ANSWER_DELAY = 500;
const FINISH_DELAY = 1500;

const bossQuestions = [
    {
        id: 1,
        question:
            "ทุกคนในห้องก็ลอกการบ้านกัน ถ้าเราลอกด้วยก็คงไม่เป็นไร?",
        choices: [
            {
                text: "เห็นด้วย",
                value: "A",
            },
            {
                text: "ไม่เห็นด้วย",
                value: "B",
            },
        ],
        correct: "B",
    },
    {
        id: 2,
        question:
            "การยืมงานเพื่อนส่งก่อน แล้วค่อยแก้ทีหลัง ถือว่าไม่ผิดเพราะไม่ได้คัดลอกทั้งหมด?",
        choices: [
            {
                text: "เห็นด้วย",
                value: "A",
            },
            {
                text: "ไม่เห็นด้วย",
                value: "B",
            },
        ],
        correct: "B",
    },
    {
        id: 3,
        question:
            "ความซื่อสัตย์ควรยึดถือ แม้ไม่มีใครเห็นหรือจับได้?",
        choices: [
            {
                text: "เห็นด้วย",
                value: "A",
            },
            {
                text: "ไม่เห็นด้วย",
                value: "B",
            },
        ],
        correct: "A",
    },
];

const generateBossParticles = () => {
    return Array.from(
        { length: 20 },
        (_, index) => ({
            id: `${Date.now()}-${index}-${Math.random()}`,
            size: Math.random() * 30 + 15,
            offsetX:
                (Math.random() - 0.5) * 300,
            offsetY:
                (Math.random() - 0.5) * 200,
            duration:
                Math.random() * 0.8 + 0.6,
        })
    );
};

export default function useBossGame({
    onFinish,
    onFail,
    playPopSound,
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] =
        useState(0);

    const [flashStatus, setFlashStatus] =
        useState(null);

    const [isDefeated, setIsDefeated] =
        useState(false);

    const [particles, setParticles] =
        useState([]);

    const [showFailPopup, setShowFailPopup] =
        useState(false);

    const timeoutIdsRef = useRef([]);

    const currentQuestion =
        bossQuestions[currentQuestionIndex];

    const clearSavedTimeouts = useCallback(() => {
        timeoutIdsRef.current.forEach(
            (timeoutId) => {
                window.clearTimeout(timeoutId);
            }
        );

        timeoutIdsRef.current = [];
    }, []);

    const addTimeout = useCallback(
        (callback, delay) => {
            const timeoutId = window.setTimeout(
                () => {
                    callback();

                    timeoutIdsRef.current =
                        timeoutIdsRef.current.filter(
                            (savedId) =>
                                savedId !== timeoutId
                        );
                },
                delay
            );

            timeoutIdsRef.current.push(timeoutId);

            return timeoutId;
        },
        []
    );

    const handleAnswer = useCallback(
        (choiceValue) => {
            if (
                flashStatus ||
                isDefeated ||
                showFailPopup
            ) {
                return;
            }

            playPopSound();

            const isCorrect =
                choiceValue ===
                currentQuestion.correct;

            setFlashStatus(
                isCorrect ? "correct" : "wrong"
            );

            addTimeout(() => {
                setFlashStatus(null);

                if (!isCorrect) {
                    setShowFailPopup(true);
                    return;
                }

                const isLastQuestion =
                    currentQuestionIndex >=
                    bossQuestions.length - 1;

                if (isLastQuestion) {
                    setIsDefeated(true);
                    setParticles(
                        generateBossParticles()
                    );

                    addTimeout(() => {
                        onFinish?.();
                    }, FINISH_DELAY);

                    return;
                }

                setCurrentQuestionIndex(
                    (previousIndex) =>
                        previousIndex + 1
                );
            }, ANSWER_DELAY);
        },
        [
            addTimeout,
            currentQuestion,
            currentQuestionIndex,
            flashStatus,
            isDefeated,
            onFinish,
            playPopSound,
            showFailPopup,
        ]
    );

    const handleFail = useCallback(() => {
        setShowFailPopup(false);
        onFail?.();
    }, [onFail]);

    const resetBossGame = useCallback(() => {
        clearSavedTimeouts();

        setCurrentQuestionIndex(0);
        setFlashStatus(null);
        setIsDefeated(false);
        setParticles([]);
        setShowFailPopup(false);
    }, [clearSavedTimeouts]);

    useEffect(() => {
        return () => {
            clearSavedTimeouts();
        };
    }, [clearSavedTimeouts]);

    return {
        currentQuestion,
        currentQuestionIndex,
        totalQuestions: bossQuestions.length,

        flashStatus,
        isDefeated,
        particles,
        showFailPopup,

        handleAnswer,
        handleFail,
        resetBossGame,
    };
}