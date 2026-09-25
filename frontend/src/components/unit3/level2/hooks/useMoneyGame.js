import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";
const LEVEL_ID = 9;
const INITIAL_TIME = 60;
const TOTAL_ITEMS = 11;

export default function useMoneyGame() {
    const navigate = useNavigate();

    const messageTimeoutRef = useRef(null);
    const playIdRef = useRef(null);

    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);
    const [score, setScore] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [message, setMessage] = useState("");
    const [personalItems, setPersonalItems] = useState([]);
    const [clubItems, setClubItems] = useState([]);

    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const [isPaused, setIsPaused] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const totalItems = TOTAL_ITEMS;
    const totalAnswered =
        totalItems - items.length;

    const formattedTime = String(timeLeft).padStart(2, "0");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const getHeaders = () => {
        const token = getToken();

        return {
            "Content-Type": "application/json",
            ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {}),
        };
    };

    const startGame = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoadError("");
            setIsGameEnded(false);
            setIsPaused(false);
            setTimeLeft(INITIAL_TIME);
            setScore(0);
            setWrong(0);
            setMessage("");
            setItems([]);
            setPersonalItems([]);
            setClubItems([]);
            setCurrentItem(null);

            const startResponse = await fetch(
                `${API_BASE_URL}/api/game-play/start`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        level_id: LEVEL_ID,
                    }),
                }
            );

            const startResult =
                await startResponse.json();

            if (!startResponse.ok) {
                throw new Error(
                    startResult.message ||
                    "ไม่สามารถเริ่มเกมได้"
                );
            }

            const play = startResult.data;
            const playId = play.play_id;

            if (!playId) {
                throw new Error(
                    "ไม่พบ play_id จากการเริ่มเกม"
                );
            }

            if (
                !Array.isArray(play.items) ||
                play.items.length !== TOTAL_ITEMS
            ) {
                throw new Error(
                    `จำนวนรายการเงินไม่ถูกต้อง ต้องมี ${TOTAL_ITEMS} รายการ`
                );
            }

            playIdRef.current = playId;
            setItems(play.items);
            setIsLoading(false);
        } catch (error) {
            console.error(
                "Money Game Start Error:",
                error
            );

            setIsLoading(false);
            // ไม่ set isGameEnded ตรงนี้ — โหลดล้มเหลว (เช่น backend
            // ยังไม่ได้ผูก branch level 9 หรือ network error) ไม่ใช่
            // "เล่นจบแล้ว" ทำให้หน้าจอควรแสดง Error state แยกต่างหาก
            // ไม่ใช่กระดานเกมเปล่า ๆ ที่ดูเหมือนเล่นจบไปแล้ว
            setLoadError(
                error.message ||
                "ไม่สามารถโหลดเกมได้ กรุณาลองใหม่อีกครั้ง"
            );
        }
    }, []);

    useEffect(() => {
        startGame();

        return () => {
            if (messageTimeoutRef.current) {
                clearTimeout(
                    messageTimeoutRef.current
                );
            }
        };
    }, [startGame]);

    useEffect(() => {
        if (
            isPaused ||
            isGameEnded ||
            isLoading ||
            loadError
        ) {
            return;
        }

        if (timeLeft <= 0) {
            setIsGameEnded(true);

            const failGame = async () => {
                try {
                    if (playIdRef.current) {
                        await fetch(
                            `${API_BASE_URL}/api/money-game/fail`,
                            {
                                method: "POST",
                                headers: getHeaders(),
                                body: JSON.stringify({
                                    play_id:
                                        playIdRef.current,
                                }),
                            }
                        );
                    }
                } catch (error) {
                    console.error(
                        "Money Game Fail Error:",
                        error
                    );
                }

                navigate(
                    "/unit3/level2/result",
                    {
                        state: {
                            win: false,
                            score,
                            wrong,
                            timeLeft: 0,
                            // reason เป็น fallback เผื่อ resultStatus
                            // ยังไม่มีข้อความใน DB (level_result_messages)
                            // — หน้า Result จะพยายามดึงข้อความจริงจาก
                            // /api/level-result/9/:resultStatus ก่อน
                            reason:
                                "หมดเวลา คุณต้องเริ่มภารกิจใหม่",
                            resultStatus: "FAIL_TIMEOUT",
                        },
                    }
                );
            };

            failGame();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(
                (previousTime) =>
                    previousTime - 1
            );
        }, 1000);

        return () => clearTimeout(timer);
    }, [
        timeLeft,
        isPaused,
        isGameEnded,
        isLoading,
        loadError,
        navigate,
        score,
        wrong,
    ]);

    const showMessage = (text) => {
        setMessage(text);

        if (messageTimeoutRef.current) {
            clearTimeout(
                messageTimeoutRef.current
            );
        }

        messageTimeoutRef.current = setTimeout(
            () => {
                setMessage("");
            },
            1000
        );
    };

    const handleDragStart = (item) => {
        if (
            isPaused ||
            isGameEnded ||
            isLoading
        ) {
            return;
        }

        setCurrentItem(item);
    };

    const handleDrop = async (targetType) => {
        if (
            isPaused ||
            isGameEnded ||
            isLoading ||
            !currentItem ||
            !playIdRef.current
        ) {
            return;
        }

        const selectedItem = currentItem;

        const selectedTypeId =
            targetType === "personal"
                ? 5
                : targetType === "club"
                    ? 6
                    : null;

        if (!selectedTypeId) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/money-game/classify`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        play_id:
                            playIdRef.current,
                        item_id:
                            selectedItem.item_id,
                        selected_type_id: selectedTypeId,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "ไม่สามารถตรวจคำตอบได้"
                );
            }

            const data = result.data;

            setCurrentItem(null);

            if (!data.is_correct) {
                const nextWrong = wrong + 1;

                setWrong(nextWrong);
                setIsGameEnded(true);

                navigate(
                    "/unit3/level2/result",
                    {
                        state: {
                            win: false,
                            score,
                            wrong: nextWrong,
                            timeLeft,
                            reason:
                                "คุณแยกรายการเงินผิดบัญชี ต้องเริ่มภารกิจใหม่",
                            resultStatus: "FAIL_WRONG",
                        },
                    }
                );

                return;
            }

            const nextScore =
                data.correct_count ?? score + 1;

            setScore(nextScore);
            showMessage("ถูกต้อง!");

            if (targetType === "personal") {
                setPersonalItems(
                    (previousItems) => [
                        ...previousItems,
                        selectedItem,
                    ]
                );
            }

            if (targetType === "club") {
                setClubItems(
                    (previousItems) => [
                        ...previousItems,
                        selectedItem,
                    ]
                );
            }

            const remainingItems = items.filter(
                (item) =>
                    item.item_id !==
                    selectedItem.item_id
            );

            setItems(remainingItems);

            if (data.is_completed) {
                setIsGameEnded(true);

                const completeResponse =
                    await fetch(
                        `${API_BASE_URL}/api/money-game/complete`,
                        {
                            method: "POST",
                            headers: getHeaders(),
                            body: JSON.stringify({
                                play_id:
                                    playIdRef.current,
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

                // IP ทั้งหมดคำนวณที่ backend (moneyGameController.completeMoneyGame)
                // จากเวลาจริงใน DB — ส่งต่อให้หน้า Result แสดงผลตรง ๆ
                // ไม่คำนวณเองฝั่งนี้
                const completeData =
                    completeResult.data || {};

                navigate(
                    "/unit3/level2/result",
                    {
                        state: {
                            win: true,
                            score: nextScore,
                            wrong,
                            timeLeft,
                            reason:
                                "คุณแยกเงินส่วนตัวกับเงินชมรมได้ถูกต้องทั้งหมด",
                            resultStatus: "PASS",

                            elapsedSeconds:
                                completeData.elapsed_seconds,
                            isFast: completeData.is_fast,
                            baseIP: completeData.base_ip,
                            speedBonusIP:
                                completeData.speed_bonus_ip,
                            earnedIP: completeData.earned_ip,
                            totalIntegrityPoints:
                                completeData.total_integrity_points,
                        },
                    }
                );
            }
        } catch (error) {
            console.error(
                "Money Game Classify Error:",
                error
            );
            setCurrentItem(null);
            showMessage(error.message);
        }
    };

    const handlePause = () => {
        if (isGameEnded || isLoading) {
            return;
        }

        setIsPaused(true);
    };

    const handleResume = () => {
        if (isGameEnded) {
            return;
        }

        setIsPaused(false);
    };

    const resetGame = () => {
        if (messageTimeoutRef.current) {
            clearTimeout(
                messageTimeoutRef.current
            );
        }

        startGame();
    };

    return {
        items,
        currentItem,
        score,
        wrong,
        message,
        personalItems,
        clubItems,
        totalItems,
        totalAnswered,

        timeLeft,
        formattedTime,
        isPaused,
        isGameEnded,
        isLoading,
        loadError,

        handleDragStart,
        handleDrop,
        handlePause,
        handleResume,
        resetGame,
    };
}