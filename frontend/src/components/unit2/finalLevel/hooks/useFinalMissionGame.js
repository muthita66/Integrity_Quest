import { useState, useEffect, useRef } from "react";

const API_URL = "http://localhost:5000";

const INITIAL_MONEY = 500;
const INITIAL_TIME = 70;
const PASS_SCORE = 8;

export function useFinalMissionGame({ skipStartPage = false } = {}) {
    const [gameState, setGameState] = useState(
        skipStartPage ? "playing" : "intro"
    );
    const [introStep, setIntroStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const [userChoices, setUserChoices] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [money, setMoney] = useState(INITIAL_MONEY);
    const [playCount, setPlayCount] = useState(skipStartPage ? 1 : 0);

    const [missions, setMissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playId, setPlayId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    /*
     * ผลจริงจาก Backend (completeGame ของ level_id=7) — เดิม isPassed/
     * medal/expBonus/coinBonus/money ทั้งหมดคำนวณเองที่ Frontend และ
     * "เล่นครั้งแรก" (เงื่อนไขได้เหรียญ) ใช้ playCount ที่เป็น state
     * ในเครื่อง (รีเซ็ตได้ถ้า refresh) ไม่เคยตรวจกับ DB เลย ตอนนี้เก็บ
     * response จริงจาก backend ไว้ใช้แทนค่าที่เคยคำนวณเอง
     */
    const [result, setResult] = useState(null);

    // จบเกมเพราะหมดเวลา → แสดงหน้า TimeoutPage แทน ResultPage
    const [isTimedOut, setIsTimedOut] = useState(false);

    const timerRef = useRef(null);
    const playIdRef = useRef(null);
    const startRequestRef = useRef(false);

    // ================= Game Play API =================
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");

        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    };

    const startGamePlay = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/game-play/start`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        level_id: 7,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "ไม่สามารถเริ่มบันทึกการเล่นได้"
                );
            }

            const newPlayId = data?.data?.play_id;

            if (!newPlayId) {
                throw new Error("ไม่พบ play_id จาก API");
            }

            playIdRef.current = newPlayId;
            setPlayId(newPlayId);

            console.log(
                "Unit 2 Final Level Game Play Started:",
                data
            );

            return newPlayId;
        } catch (err) {
            console.error("Game Play Start Error:", err);
            setError(
                err.message || "ไม่สามารถเริ่มบันทึกการเล่นได้"
            );
            return null;
        }
    };

    const saveGameAnswer = async ({
        questionId,
        choiceId,
    }) => {
        const currentPlayId = playIdRef.current;

        if (!currentPlayId) {
            throw new Error("ไม่พบ play_id ของเกม");
        }

        const response = await fetch(
            `${API_URL}/api/game-play/answer`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    play_id: currentPlayId,
                    question_id: questionId,
                    choice_id: choiceId,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.message || "ไม่สามารถบันทึกคำตอบได้"
            );
        }

        console.log(
            "Unit 2 Final Level Answer Saved:",
            data
        );

        return data;
    };

    const completeGamePlay = async ({ isTimeout = false } = {}) => {
        const currentPlayId = playIdRef.current;

        if (!currentPlayId) {
            throw new Error("ไม่พบ play_id ของเกม");
        }

        const response = await fetch(
            `${API_URL}/api/game-play/complete`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    play_id: currentPlayId,
                    // หมดเวลา → backend ยอมให้จบแม้ตอบไม่ครบ (ผล = FAIL)
                    ...(isTimeout ? { is_timeout: true } : {}),
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.message || "ไม่สามารถจบการเล่นได้"
            );
        }

        console.log(
            "Unit 2 Final Level Game Play Completed:",
            data
        );

        if (data?.data) {
            setResult(data.data);
        }

        return data;
    };

    // ================= Helper สำหรับ Image URL =================
    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            return "";
        }

        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
        ) {
            return imagePath;
        }

        return imagePath;
    };

    // ================= Fetch Final Level =================
    useEffect(() => {
        const fetchMissions = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(
                    `${API_URL}/api/final-level/7`
                );

                if (!response.ok) {
                    throw new Error(
                        `HTTP error: ${response.status}`
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error(
                        "ข้อมูล Final Level ไม่ใช่ Array"
                    );
                }

                // ================= แปลงข้อมูลจาก DB =================
                const formattedMissions = data
                    .sort(
                        (a, b) =>
                            a.case_number - b.case_number
                    )
                    .map((item) => {
                        const question = item.question?.[0];

                        return {
                            id: item.case_number,
                            caseId: item.case_id,

                            phase: item.title,

                            image: getImageUrl(
                                item.background_image
                            ),

                            situation: item.description,

                            options: (
                                question?.choice || []
                            )
                                .sort(
                                    (a, b) =>
                                        a.choice_id -
                                        b.choice_id
                                )
                                .map((choice) => ({
                                    id: choice.choice_key,

                                    image: getImageUrl(
                                        choice.image
                                    ),

                                    text: choice.choice_text,

                                    cost: choice.cost ?? 0,

                                    isCorrect:
                                        choice.is_correct,

                                    feedback:
                                        choice.feedback ?? "",

                                    choiceId:
                                        choice.choice_id,

                                    questionId:
                                        question?.question_id ??
                                        null,
                                })),
                        };
                    });

                console.log(
                    "Final Level missions from API:",
                    formattedMissions
                );

                setMissions(formattedMissions);
            } catch (err) {
                console.error(
                    "Final Level API Error:",
                    err
                );

                setError(
                    "ไม่สามารถโหลดข้อมูล Final Level ได้"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchMissions();
    }, []);

    // ================= Shuffle Helper =================
    const shuffleOptions = (missionList) => {
        return missionList.map((mission) => ({
            ...mission,

            options: [...mission.options].sort(
                () => Math.random() - 0.5
            ),
        }));
    };

    // ================= Initial Shuffle =================
    const [shuffledMissions, setShuffledMissions] =
        useState([]);

    // เมื่อโหลดข้อมูลจาก API สำเร็จ
    useEffect(() => {
        if (missions.length > 0) {
            setShuffledMissions(
                shuffleOptions(missions)
            );
        }
    }, [missions]);

    // ================= Reset เมื่อเข้ามาแบบข้าม StartPage =================
    useEffect(() => {
        if (skipStartPage) {
            setCurrentStep(0);
            setTimeLeft(INITIAL_TIME);
            setMoney(INITIAL_MONEY);
            setUserChoices([]);
            setIsPaused(false);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ================= Auto Start สำหรับหน้า Game ที่ข้าม StartPage =================
    useEffect(() => {
        if (
            !skipStartPage ||
            missions.length === 0 ||
            playIdRef.current ||
            startRequestRef.current
        ) {
            return;
        }

        startRequestRef.current = true;

        const startDirectGame = async () => {
            const newPlayId = await startGamePlay();

            if (!newPlayId) {
                startRequestRef.current = false;
                return;
            }

            setShuffledMissions(shuffleOptions(missions));
            setCurrentStep(0);
            setTimeLeft(INITIAL_TIME);
            setMoney(INITIAL_MONEY);
            setUserChoices([]);
            setIsPaused(false);
            setPlayCount(1);
            setGameState("playing");
        };

        startDirectGame();
    }, [skipStartPage, missions]);

    // ================= Timer Countdown =================
    useEffect(() => {
        if (
            gameState === "playing" &&
            !isPaused &&
            shuffledMissions.length > 0
        ) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsTimedOut(true);

                        completeGamePlay({ isTimeout: true })
                            .catch((err) => {
                                // บันทึกผลไม่สำเร็จ → ยังแสดงหน้าหมดเวลา
                                // จากข้อมูลในเครื่องได้ ไม่ต้องขึ้นหน้า Error
                                console.error(
                                    "Final Level Timeout Complete Error:",
                                    err
                                );
                            })
                            .finally(() => {
                                setGameState("result");
                            });
                        return 0;
                    }

                    return prev - 1;
                });
            }, 1000);
        }

        return () =>
            clearInterval(timerRef.current);
    }, [
        gameState,
        isPaused,
        shuffledMissions.length,
    ]);

    // ================= เลือกตัวเลือก =================
    const handleSelectOption = async (option) => {
        if (isSubmitting) {
            return;
        }

        const currentMission =
            shuffledMissions[currentStep];

        if (!currentMission) {
            return;
        }

        if (!option.questionId || !option.choiceId) {
            setError(
                "ไม่พบข้อมูล Question หรือ Choice สำหรับบันทึกคำตอบ"
            );
            return;
        }

        setIsSubmitting(true);

        if (!playIdRef.current) {
            const newPlayId = await startGamePlay();

            if (!newPlayId) {
                setIsSubmitting(false);
                return;
            }
        }
        setError(null);

        const newMoney =
            money - (option.cost || 0);

        try {
            await saveGameAnswer({
                questionId: option.questionId,
                choiceId: option.choiceId,
            });

            const updatedChoices = [
                ...userChoices,
                {
                    missionId: currentMission.id,
                    caseId: currentMission.caseId,
                    ...option,
                    moneyAfter: newMoney,
                },
            ];

            setMoney(newMoney);
            setUserChoices(updatedChoices);

            // ================= เล่นครบทุก Mission =================
            if (
                currentStep >=
                shuffledMissions.length - 1
            ) {
                clearInterval(timerRef.current);

                await completeGamePlay();

                setGameState("result");
                return;
            }

            // ================= เงินหมด =================
            if (newMoney <= 0) {
                clearInterval(timerRef.current);
                await completeGamePlay();
                setGameState("result");
                return;
            }

            // ================= ยังมี Mission ต่อ =================
            setCurrentStep(
                (prev) => prev + 1
            );
        } catch (err) {
            console.error(
                "Final Level Game Play Save Error:",
                err
            );

            setError(
                err.message ||
                "ไม่สามารถบันทึกข้อมูลการเล่นได้"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ================= เริ่ม Mission / เล่นใหม่ =================
    const startMission = async () => {
        if (
            missions.length === 0 ||
            isSubmitting ||
            startRequestRef.current
        ) {
            return;
        }

        startRequestRef.current = true;

        clearInterval(timerRef.current);

        setError(null);

        const newPlayId = await startGamePlay();

        if (!newPlayId) {
            startRequestRef.current = false;
            return;
        }

        setShuffledMissions(
            shuffleOptions(missions)
        );

        setGameState("playing");
        setCurrentStep(0);
        setTimeLeft(INITIAL_TIME);
        setMoney(INITIAL_MONEY);
        setUserChoices([]);
        setIsPaused(false);
        setResult(null);
        setIsTimedOut(false);

        setPlayCount(
            (prev) => prev + 1
        );

        startRequestRef.current = false;
    };

    /*
     * totalCorrect / isPassed / medal ด้านล่างนี้เดิมคำนวณเองทั้งหมด
     * ที่ Frontend (ดูคอมเมนต์ด้านบนที่ประกาศ `result`) ตอนนี้ใช้ผล
     * จริงจาก backend (completeGame) เป็นหลัก ถ้ายังไม่มี response
     * กลับมา (เช่นระหว่างที่ request ยังไม่เสร็จ) จะ fallback ไปใช้
     * ค่าที่คำนวณจาก userChoices ไปพลางๆ เพื่อไม่ให้ UI พัง แต่หน้า
     * Result จะไม่ render จนกว่า gameState เปลี่ยนเป็น "result" ซึ่ง
     * เกิดขึ้นหลัง completeGamePlay() resolve แล้วเท่านั้น ดังนั้น
     * result จะมีค่าเสมอตอนแสดงผลจริง
     */
    const localTotalCorrect =
        userChoices.filter(
            (choice) => choice.isCorrect
        ).length;

    const totalCorrect =
        result?.score ?? localTotalCorrect;

    const isPassed = result?.is_pass ?? false;

    // ================= Mission ปัจจุบัน =================
    const currentMission =
        shuffledMissions[currentStep];

    // เหรียญ/เงินคงเหลือ/IP มาจาก backend ล้วนๆ ไม่มี fallback คำนวณ
    // เองฝั่งนี้อีกต่อไป เพราะเงื่อนไข "เล่นครั้งแรก" ต้องเช็คกับ DB
    // เท่านั้น (playCount ฝั่งนี้ไว้ใช้แค่แสดงผล ไม่ใช่เงื่อนไขตัดสิน)
    const medal = result?.medal
        ? result.medal.toLowerCase()
        : null;

    const verifiedMoney =
        result?.money_remaining ?? money;

    const baseIP = result?.base_ip ?? 0;
    const medalBonusIP = result?.medal_bonus_ip ?? 0;
    const earnedIP = result?.earned_ip ?? 0;
    const totalIntegrityPoints =
        result?.total_integrity_points ?? 0;
    const isFirstTry = result?.is_first_try ?? false;

    // ================= Return =================
    return {
        // ================= State =================
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

        playId,

        isSubmitting,

        // ================= API =================
        missions,

        isLoading,

        error,

        // ================= Computed =================
        currentMission,

        shuffledMissions,

        totalCorrect,

        isPassed,

        medal,

        verifiedMoney,

        baseIP,

        medalBonusIP,

        earnedIP,

        totalIntegrityPoints,

        isFirstTry,

        isTimedOut,

        // ================= Actions =================
        handleSelectOption,

        startMission,
    };
}