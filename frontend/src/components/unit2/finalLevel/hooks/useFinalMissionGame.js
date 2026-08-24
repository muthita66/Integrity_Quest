import { useState, useEffect, useRef } from "react";
import { MISSIONS } from "../data/missions";

const INITIAL_MONEY = 500;
const INITIAL_TIME = 70;
const PASS_SCORE = 8;

/**
 * useFinalMissionGame
 * ควบคุม state และ logic ทั้งหมดของเกม Final Mission
 *
 * @param {boolean} skipStartPage - ถ้า true จะเริ่ม state เป็น 'playing' ทันที
 */
export function useFinalMissionGame({ skipStartPage = false } = {}) {
    const [gameState, setGameState] = useState(skipStartPage ? "playing" : "intro");
    const [introStep, setIntroStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const [userChoices, setUserChoices] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [money, setMoney] = useState(INITIAL_MONEY);
    const [playCount, setPlayCount] = useState(0);
    const timerRef = useRef(null);

    // --- Shuffle helper (Fisher-Yates) ---
    const shuffleOptions = (missions) =>
        missions.map((m) => ({
            ...m,
            options: [...m.options].sort(() => Math.random() - 0.5),
        }));

    const [shuffledMissions, setShuffledMissions] = useState(() => shuffleOptions(MISSIONS));

    // Reset เมื่อเข้ามาแบบข้าม StartPage
    useEffect(() => {
        if (skipStartPage) {
            setCurrentStep(0);
            setTimeLeft(INITIAL_TIME);
            setMoney(INITIAL_MONEY);
            setUserChoices([]);
            setIsPaused(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // รันครั้งเดียวตอน mount

    // Timer countdown
    useEffect(() => {
        if (gameState === "playing" && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setGameState("result");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timerRef.current);
    }, [gameState, isPaused]);

    // เลือกตัวเลือก
    const handleSelectOption = (option) => {
        const newMoney = money - (option.cost || 0);

        const updatedChoices = [
            ...userChoices,
            {
                missionId: shuffledMissions[currentStep].id,
                ...option,
                moneyAfter: newMoney,
            },
        ];

        setMoney(newMoney);
        setUserChoices(updatedChoices);

        if (newMoney <= 0) {
            clearInterval(timerRef.current);
            setGameState("result");
            return;
        }

        if (currentStep < shuffledMissions.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            clearInterval(timerRef.current);
            setGameState("result");
        }
    };

    // เริ่มเล่นใหม่ (กดจาก StartPage หรือ Replay) — สลับ options ใหม่ทุกรอบ
    const startMission = () => {
        setShuffledMissions(shuffleOptions(MISSIONS)); // สลับตำแหน่งช้อยใหม่
        setGameState("playing");
        setCurrentStep(0);
        setTimeLeft(INITIAL_TIME);
        setMoney(INITIAL_MONEY);
        setUserChoices([]);
        setIsPaused(false);
        setPlayCount((prev) => prev + 1);
    };

    // คำนวณผลลัพธ์
    const totalCorrect = userChoices.filter((c) => c.isCorrect).length;
    const isPassed = money > 0 && totalCorrect >= PASS_SCORE && timeLeft > 0;
    const currentMission = shuffledMissions[currentStep];

    // คำนวณเหรียญรางวัลและ EXP bonus (ได้เฉพาะรอบแรกเท่านั้น)
    const allCorrectOnTime = totalCorrect === MISSIONS.length && timeLeft > 0;
    const medal = isPassed && playCount === 1
        ? allCorrectOnTime
            ? 'gold'
            : totalCorrect >= MISSIONS.length - 1
            ? 'silver'
            : totalCorrect >= MISSIONS.length - 2
            ? 'bronze'
            : null
        : null;
    const expBonus = medal === 'gold' ? 5 : 0;

    return {
        // state
        gameState,
        setGameState,
        introStep,
        setIntroStep,
        currentStep,
        timeLeft,
        userChoices,
        isPaused,
        setIsPaused,
        money,
        playCount,
        // computed
        currentMission,
        shuffledMissions,
        totalCorrect,
        isPassed,
        medal,
        expBonus,
        // actions
        handleSelectOption,
        startMission,
    };
}
