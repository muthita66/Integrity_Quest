import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";
const LEVEL_ID = 8;
const INITIAL_TIME = 60;
const MAX_WRONG = 3;
const GOOD_COUNT = 8;
const TOTAL_DOCUMENTS = 13;

// ============================================================
// วางเอกสารแบบ "ตาราง + สุ่มเยื้องเล็กน้อย" (แทนสุ่มอิสระเดิม)
// ------------------------------------------------------------
// เดิมสุ่มตำแหน่งอิสระแล้วเช็กระยะห่างขั้นต่ำ ทำให้บางรอบรูปซ้อนกัน
// จนกดรูปด้านล่างไม่ได้ → เปลี่ยนเป็นแบ่งกระดานเป็นช่อง (5 x 3)
// แต่ละเอกสารได้ 1 ช่องของตัวเอง แล้วเยื้องแบบสุ่มเล็กน้อยให้ดูเป็น
// ธรรมชาติ ยังซ้อนขอบกันได้นิดหน่อย แต่ไม่ทับกันจนกดไม่ได้
//
// หน่วยเป็น % ของกระดาน (มุมซ้ายบนของการ์ด)
// ปรับตัวเลขตรงนี้ได้ถ้าขนาดการ์ด / กระดานเปลี่ยน
// ============================================================

const GRID_COLUMNS = [3, 21, 39, 57, 75]; // left (%)
const GRID_ROWS = [13, 39, 64];           // top (%)
const JITTER_X = 3;                        // เยื้องซ้าย-ขวาได้ ±3%
const JITTER_Y = 3;                        // เยื้องขึ้น-ลงได้ ±3%

// ช่องที่ห้ามวาง (ทับกล่อง "เอกสารที่ต้องหา" มุมซ้ายล่าง)
const BLOCKED_CELLS = [
    { col: 0, row: 2 },
];

const shuffle = (array) => {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
};

const jitter = (range) => (Math.random() * 2 - 1) * range;

// ------------------------------------------------------------
// มุมเอียงของเอกสาร (องศา) — สุ่มจากชุดนี้แบบ "ไม่ซ้ำกัน"
// มีทั้งเอียงซ้าย (ลบ) เอียงขวา (บวก) และกลับหัว (~180)
// กลับหัวมีแค่ 2 ค่า → ต่อรอบกลับหัวไม่เกิน 2 ใบ (ยังอ่านง่าย)
// ต้องมีค่าอย่างน้อยเท่าจำนวนเอกสาร (13)
// ------------------------------------------------------------
const ROTATIONS = [
    -16, -12, -8, -5, -2,   // เอียงซ้าย
    3, 6, 9, 12, 15, 18,    // เอียงขวา
    0,                      // ตรง
    174, 187,               // กลับหัว (เยื้องนิด ๆ ให้ดูเป็นธรรมชาติ)
];

const generateRandomPositions = (count) => {
    const cells = [];

    GRID_ROWS.forEach((top, row) => {
        GRID_COLUMNS.forEach((left, col) => {
            const blocked = BLOCKED_CELLS.some(
                (cell) => cell.col === col && cell.row === row
            );

            if (!blocked) cells.push({ left, top });
        });
    });

    const rotations = shuffle(ROTATIONS);

    return shuffle(cells)
        .slice(0, count)
        .map((cell, index) => ({
            left: `${Math.max(1, cell.left + jitter(JITTER_X))}%`,
            top: `${Math.max(11, cell.top + jitter(JITTER_Y))}%`,
            rotate: rotations[index % rotations.length], // องศา ไม่ซ้ำกันในรอบเดียว
        }));
};

export default function useReceiptGame() {
    const navigate = useNavigate();
    const messageTimerRef = useRef(null);
    const playIdRef = useRef(null);
    const startRequestRef = useRef(false);

    const [documents, setDocuments] = useState([]);
    const [playId, setPlayId] = useState(null);
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const [found, setFound] = useState([]);
    // เอกสารที่เลือกผิดไปแล้ว → กดซ้ำไม่ได้ (กันกดซ้ำแล้วหัวใจไม่ลด)
    const [wrongIds, setWrongIds] = useState([]);
    const [wrong, setWrong] = useState(0);
    const [message, setMessage] = useState("");
    const [gameStatus, setGameStatus] = useState("loading");
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const foundCount = found.length;

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("ไม่พบ Token กรุณาเข้าสู่ระบบก่อน");
        }

        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    };

    const applyPositions = (items) => {
        const positions = generateRandomPositions(
            TOTAL_DOCUMENTS
        );

        return items.map((item, index) => ({
            ...item,
            id: item.play_item_id,
            type: "document",
            ...positions[index],
        }));
    };

    const startGame = async () => {
        if (startRequestRef.current) {
            return playIdRef.current;
        }

        startRequestRef.current = true;
        setIsLoading(true);
        setError(null);
        setGameStatus("loading");

        try {
            const response = await fetch(
                `${API_URL}/api/game-play/start`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        level_id: LEVEL_ID,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "ไม่สามารถเริ่มเกม Receipt Hunt ได้"
                );
            }

            const newPlayId = data?.data?.play_id;
            const apiItems = data?.data?.items || [];

            if (!newPlayId) {
                throw new Error("ไม่พบ play_id จาก API");
            }

            if (apiItems.length !== TOTAL_DOCUMENTS) {
                throw new Error(
                    "จำนวนเอกสารที่ได้รับจาก API ไม่ครบ 13 รายการ"
                );
            }

            playIdRef.current = newPlayId;

            setPlayId(newPlayId);
            setDocuments(applyPositions(apiItems));
            setTimeLeft(INITIAL_TIME);
            setFound([]);
            setWrongIds([]);
            setWrong(0);
            setMessage("");
            setGameStatus("playing");
            setIsPaused(false);
            setIsLoading(false);

            console.log(
                "Receipt Hunt Game Started:",
                data
            );

            return newPlayId;
        } catch (err) {
            console.error(
                "Receipt Hunt Start Error:",
                err
            );

            setError(
                err.message ||
                "ไม่สามารถเริ่มเกม Receipt Hunt ได้"
            );
            setGameStatus("error");
            setIsLoading(false);

            return null;
        } finally {
            startRequestRef.current = false;
        }
    };

    useEffect(() => {
        startGame();

        return () => {
            if (messageTimerRef.current) {
                window.clearTimeout(
                    messageTimerRef.current
                );
            }
        };
    }, []);

    useEffect(() => {
        if (
            gameStatus !== "playing" ||
            isPaused
        ) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [gameStatus, isPaused]);

    useEffect(() => {
        if (
            timeLeft === 0 &&
            gameStatus === "playing"
        ) {
            setGameStatus("lose");
            showMessage("หมดเวลา เกมจบ");
        }
    }, [timeLeft, gameStatus]);

    const showMessage = (text) => {
        setMessage(text);

        if (messageTimerRef.current) {
            window.clearTimeout(
                messageTimerRef.current
            );
        }

        messageTimerRef.current =
            window.setTimeout(() => {
                setMessage("");
            }, 1200);
    };

    const handleClickDoc = async (doc) => {
        if (
            gameStatus !== "playing" ||
            isPaused ||
            isSubmitting
        ) {
            return;
        }

        if (!playIdRef.current) {
            showMessage("ไม่พบรอบการเล่น");
            return;
        }

        if (found.includes(doc.id)) {
            return;
        }

        // เคยเลือกผิดไปแล้ว → ไม่ส่งซ้ำ (backend จะไม่นับผิดซ้ำ
        // ทำให้ดูเหมือน "กดผิดแต่หัวใจไม่ลด")
        if (wrongIds.includes(doc.id)) {
            showMessage("เลือกเอกสารนี้ไปแล้ว ลองหาชิ้นอื่น");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${API_URL}/api/receipt-hunt/select`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        play_id: playIdRef.current,
                        play_item_id:
                            doc.play_item_id,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "ไม่สามารถเลือก Receipt ได้"
                );
            }

            const result = data?.data;

            if (!result) {
                throw new Error(
                    "ไม่พบผลลัพธ์จาก API"
                );
            }

            const isCorrect =
                result.is_correct === true;

            if (isCorrect) {
                setFound((previous) => {
                    if (previous.includes(doc.id)) {
                        return previous;
                    }

                    return [
                        ...previous,
                        doc.id,
                    ];
                });

                showMessage(
                    `พบ ${doc.name} แล้ว!`
                );
            } else {
                setWrongIds((previous) =>
                    previous.includes(doc.id)
                        ? previous
                        : [...previous, doc.id]
                );

                // ใช้ค่าจาก backend ถ้ามี / ถ้าไม่มีให้ +1 เอง
                // (เดิม fallback เป็น 0 → หัวใจเด้งกลับเต็ม)
                setWrong((previous) =>
                    Math.max(
                        previous + 1,
                        Number(result.wrong_count) || 0
                    )
                );

                showMessage(
                    "นี่ไม่ใช่เอกสารการเงิน"
                );
            }

            if (result.is_failed) {
                setWrong(
                    result.wrong_count ??
                    MAX_WRONG
                );

                setGameStatus("lose");

                showMessage(
                    "เลือกผิดครบ 3 ครั้ง เกมจบ"
                );
            }
        } catch (err) {
            console.error(
                "Receipt Hunt Select Error:",
                err
            );

            showMessage(
                err.message ||
                "ไม่สามารถเลือก Receipt ได้"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const completeGame = async () => {
        const currentPlayId =
            playIdRef.current;

        if (!currentPlayId) {
            throw new Error(
                "ไม่พบ play_id ของเกม"
            );
        }

        const response = await fetch(
            `${API_URL}/api/receipt-hunt/complete`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    play_id: currentPlayId,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error ||
                data?.message ||
                "ไม่สามารถจบเกม Receipt Hunt ได้"
            );
        }

        return data;
    };

    useEffect(() => {
        if (
            gameStatus !== "playing" ||
            foundCount < GOOD_COUNT
        ) {
            return;
        }

        let cancelled = false;

        const finishGame = async () => {
            try {
                setIsSubmitting(true);

                const result =
                    await completeGame();

                if (cancelled) {
                    return;
                }

                setGameStatus("win");

                /*
                 * เดิมหน้า ResultPage คำนวณ "คะแนนพิเศษ" (speedBonus /
                 * noWrongBonus) เองจาก timeUsed/wrong ที่ผ่าน state มา
                 * ไม่เคยตรวจกับ DB เลย — ตอนนี้ backend
                 * (completeReceiptHunt) คำนวณ IP จริงจากเวลาที่ใช้จริง
                 * (started_at/completed_at) และ wrong_count จริงใน DB
                 * แล้วส่งผลลัพธ์กลับมา ส่งต่อทั้งก้อนผ่าน state แทน
                 * ไม่ให้ ResultPage คำนวณเองอีกต่อไป
                 */
                navigate(
                    "/unit3/level1/result",
                    {
                        state: {
                            found:
                                result?.data
                                    ?.correct_count ??
                                foundCount,
                            wrong:
                                result?.data
                                    ?.wrong_count ??
                                wrong,
                            timeLeft,
                            score:
                                result?.data
                                    ?.score ??
                                GOOD_COUNT,
                            maxScore:
                                result?.data
                                    ?.max_score ??
                                GOOD_COUNT,
                            playId:
                                result?.data
                                    ?.play_id ??
                                playIdRef.current,
                            status:
                                result?.data
                                    ?.status ??
                                "COMPLETED",

                            elapsedSeconds:
                                result?.data
                                    ?.elapsed_seconds ??
                                null,
                            isFast:
                                result?.data
                                    ?.is_fast ??
                                false,
                            isFlawless:
                                result?.data
                                    ?.is_flawless ??
                                false,

                            baseIP:
                                result?.data
                                    ?.base_ip ??
                                0,
                            speedBonusIP:
                                result?.data
                                    ?.speed_bonus_ip ??
                                0,
                            noWrongBonusIP:
                                result?.data
                                    ?.no_wrong_bonus_ip ??
                                0,
                            earnedIP:
                                result?.data
                                    ?.earned_ip ??
                                0,
                            totalIntegrityPoints:
                                result?.data
                                    ?.total_integrity_points ??
                                0,
                        },
                    }
                );
            } catch (err) {
                console.error(
                    "Receipt Hunt Complete Error:",
                    err
                );

                if (!cancelled) {
                    setError(
                        err.message ||
                        "ไม่สามารถจบเกม Receipt Hunt ได้"
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsSubmitting(false);
                }
            }
        };

        finishGame();

        return () => {
            cancelled = true;
        };
    }, [
        foundCount,
        gameStatus,
        navigate,
        timeLeft,
        wrong,
    ]);

    const restartGame = async () => {
        if (messageTimerRef.current) {
            window.clearTimeout(
                messageTimerRef.current
            );
        }

        playIdRef.current = null;

        setPlayId(null);
        setDocuments([]);
        setTimeLeft(INITIAL_TIME);
        setFound([]);
        setWrongIds([]);
        setWrong(0);
        setMessage("");
        setGameStatus("loading");
        setIsPaused(false);
        setError(null);

        await startGame();
    };

    const handlePause = () => {
        if (
            gameStatus !== "playing" ||
            isSubmitting
        ) {
            return;
        }

        setIsPaused(true);
    };

    const handleResume = () => {
        if (gameStatus !== "playing") {
            return;
        }

        setIsPaused(false);
    };

    const handleBackToMap = () => {
        navigate("/map");
    };

    return {
        documents,
        found,
        wrongIds,
        foundCount,
        wrong,
        timeLeft,
        message,
        playId,

        gameStatus,
        isPaused,
        isLoading,
        isSubmitting,
        error,

        totalDocuments: GOOD_COUNT,
        maxWrong: MAX_WRONG,

        handleClickDoc,
        restartGame,
        handlePause,
        handleResume,
        handleBackToMap,
        startGame,
        completeGame,
    };
}