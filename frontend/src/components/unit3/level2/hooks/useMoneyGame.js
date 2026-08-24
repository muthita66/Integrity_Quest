import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const INITIAL_TIME = 60;

export default function useMoneyGame(initialItems = []) {
    const navigate = useNavigate();

    const messageTimeoutRef = useRef(null);

    const [items, setItems] = useState(initialItems);
    const [currentItem, setCurrentItem] = useState(null);
    const [score, setScore] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [message, setMessage] = useState("");
    const [personalItems, setPersonalItems] = useState([]);
    const [clubItems, setClubItems] = useState([]);

    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const [isPaused, setIsPaused] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);

    const totalItems = initialItems.length;
    const totalAnswered = totalItems - items.length;

    const formattedTime = String(timeLeft).padStart(2, "0");

    // ระบบจับเวลา
    useEffect(() => {
        if (isPaused || isGameEnded) {
            return;
        }

        if (timeLeft <= 0) {
            setIsGameEnded(true);

            navigate("/unit3/level2/result", {
                state: {
                    win: false,
                    score,
                    wrong,
                    timeLeft: 0,
                    reason: "หมดเวลา คุณต้องเริ่มภารกิจใหม่",
                },
            });

            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft((previousTime) => previousTime - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [
        timeLeft,
        isPaused,
        isGameEnded,
        navigate,
        score,
        wrong,
    ]);

    // ล้าง timeout ตอนออกจากหน้า
    useEffect(() => {
        return () => {
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
        };
    }, []);

    const showMessage = (text) => {
        setMessage(text);

        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }

        messageTimeoutRef.current = setTimeout(() => {
            setMessage("");
        }, 1000);
    };

    const handleDragStart = (item) => {
        if (isPaused || isGameEnded) {
            return;
        }

        setCurrentItem(item);
    };

    const handleDrop = (targetType) => {
        if (
            isPaused ||
            isGameEnded ||
            !currentItem
        ) {
            return;
        }

        const selectedItem = currentItem;

        // รายการกับดัก
        if (selectedItem.type === "trap") {
            const nextWrong = wrong + 1;

            setWrong(nextWrong);
            setCurrentItem(null);
            setIsGameEnded(true);

            navigate("/unit3/level2/result", {
                state: {
                    win: false,
                    score,
                    wrong: nextWrong,
                    timeLeft,
                    reason:
                        "คุณนำเงินกองกลางไปใช้ส่วนตัว ต้องเริ่มภารกิจใหม่",
                },
            });

            return;
        }

        // ลากผิดบัญชี
        if (selectedItem.type !== targetType) {
            const nextWrong = wrong + 1;

            setWrong(nextWrong);
            setCurrentItem(null);
            setIsGameEnded(true);

            navigate("/unit3/level2/result", {
                state: {
                    win: false,
                    score,
                    wrong: nextWrong,
                    timeLeft,
                    reason:
                        "คุณแยกรายการเงินผิดบัญชี ต้องเริ่มภารกิจใหม่",
                },
            });

            return;
        }

        // ลากถูกต้อง
        const nextScore = score + 1;

        setScore(nextScore);
        showMessage("ถูกต้อง!");

        if (targetType === "personal") {
            setPersonalItems((previousItems) => [
                ...previousItems,
                selectedItem,
            ]);
        }

        if (targetType === "club") {
            setClubItems((previousItems) => [
                ...previousItems,
                selectedItem,
            ]);
        }

        const remainingItems = items.filter(
            (item) => item.id !== selectedItem.id
        );

        setItems(remainingItems);
        setCurrentItem(null);

        // ผ่านเกมเมื่อแยกครบ
        if (remainingItems.length === 0) {
            setIsGameEnded(true);

            navigate("/unit3/level2/result", {
                state: {
                    win: true,
                    score: nextScore,
                    wrong,
                    timeLeft,
                    reason:
                        "คุณแยกเงินส่วนตัวกับเงินชมรมได้ถูกต้องทั้งหมด",
                },
            });
        }
    };

    const handlePause = () => {
        if (isGameEnded) {
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
            clearTimeout(messageTimeoutRef.current);
        }

        setItems(initialItems);
        setCurrentItem(null);
        setScore(0);
        setWrong(0);
        setMessage("");
        setPersonalItems([]);
        setClubItems([]);
        setTimeLeft(INITIAL_TIME);
        setIsPaused(false);
        setIsGameEnded(false);
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

        handleDragStart,
        handleDrop,
        handlePause,
        handleResume,
        resetGame,
    };
}