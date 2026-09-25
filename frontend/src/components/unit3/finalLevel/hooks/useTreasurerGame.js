import { useEffect, useMemo, useRef, useState } from "react";

const API_URL = "http://localhost:5000/api/final-level/data";
const GAME_PLAY_START_URL = "http://localhost:5000/api/game-play/start";
const CHECKOUT_URL = "http://localhost:5000/api/final-level/checkout";
const RECEIPT_DECIDE_URL =
    "http://localhost:5000/api/final-level/receipt/decide";
const EVENT_APPLY_URL =
    "http://localhost:5000/api/final-level/event/apply";
const COMPLETE_URL = "http://localhost:5000/api/final-level/complete";

export default function useTreasurerGame(isPaused = false) {
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [balance, setBalance] = useState(0);
    // budget = งบต่อหมวดสำหรับ "แสดงผล" เท่านั้น ไม่ใช้ตรวจสอบจริง —
    // การตรวจงบจริงทำที่ backend จากข้อมูลใน DB เสมอ (ดู checkoutCart)
    const [budget, setBudget] = useState({});
    const [cart, setCart] = useState([]);
    const [receipts, setReceipts] = useState([]);
    const [currentReceipt, setCurrentReceipt] = useState(null);
    const [event, setEvent] = useState(null);
    const [score, setScore] = useState(0);
    const [logs, setLogs] = useState([]);
    const [budgetFail, setBudgetFail] = useState({
        open: false,
        gameOverMessage: "",
        failReasons: [],
    });
    const [finished, setFinished] = useState(false);
    const [result, setResult] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // =====================================================
    // GAME PLAY HISTORY
    // =====================================================

    const [playId, setPlayId] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [savingResult, setSavingResult] = useState(false);
    const startingPlayRef = useRef(false);

    const getToken = () => localStorage.getItem("token");

    const getHeaders = () => {
        const token = getToken();

        return {
            "Content-Type": "application/json",
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
        };
    };

    // =====================================================
    // LOAD DATA FROM API
    // =====================================================

    useEffect(() => {
        let cancelled = false;

        const loadGameData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(
                        `ไม่สามารถโหลดข้อมูล FinalLevel ได้ (${response.status})`
                    );
                }

                const result = await response.json();

                if (!result?.data) {
                    throw new Error(
                        "ข้อมูล FinalLevel จาก API ไม่ถูกต้อง"
                    );
                }

                if (cancelled) {
                    return;
                }

                const data = result.data;

                // =====================================================
                // ITEMS
                // แปลงข้อมูลจาก DB ให้ตรงกับรูปแบบที่เกมใช้
                // =====================================================

                const items = (data.items || []).map((item) => ({
                    id: item.item_id,
                    item_id: item.item_id,
                    name: item.name,
                    price: Number(item.price || 0),
                    type: item.item_type,
                    category: item.category,
                    maxPurchase: Number(item.quantity || 0),
                    description: item.description,
                    image: item.image,
                    is_required: item.is_required,
                }));

                // =====================================================
                // CATEGORY BUDGET
                // =====================================================

                const categoryBudget = {};

                (data.category_budgets || []).forEach((item) => {
                    categoryBudget[item.category] = Number(
                        item.budget || 0
                    );
                });

                // =====================================================
                // SET GAME DATA
                // =====================================================

                setGameData({
                    level: data.level,
                    config: data.config,
                    items,
                    requiredItems: items
                        .filter((item) => item.is_required)
                        .map((item) => item.id),
                    categoryBudget,
                    events: data.events || [],
                });

                setBalance(
                    Number(data.config?.start_budget || 0)
                );

                setBudget(categoryBudget);
            } catch (err) {
                console.error(
                    "FinalLevel Data Error:",
                    err
                );

                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadGameData();

        return () => {
            cancelled = true;
        };
    }, []);

    // =====================================================
    // START GAME PLAY
    // สร้าง game_play_history + game_play_treasurer
    // =====================================================

    useEffect(() => {
        if (loading || error || !gameData || playId) {
            return;
        }

        if (startingPlayRef.current) {
            return;
        }

        const startGamePlay = async () => {
            const token = getToken();

            if (!token) {
                setError("ไม่พบ token สำหรับเริ่มเกม");
                return;
            }

            startingPlayRef.current = true;

            try {
                const response = await fetch(
                    GAME_PLAY_START_URL,
                    {
                        method: "POST",
                        headers: getHeaders(),
                        body: JSON.stringify({
                            level_id: 10,
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "ไม่สามารถเริ่มรอบการเล่นได้"
                    );
                }

                const newPlayId =
                    Number(data?.data?.play_id || 0);

                if (!newPlayId) {
                    throw new Error(
                        "API ไม่ส่ง play_id กลับมา"
                    );
                }

                setPlayId(newPlayId);
            } catch (err) {
                console.error(
                    "Start Treasurer Play Error:",
                    err
                );
                setError(err.message);
            } finally {
                startingPlayRef.current = false;
            }
        };

        startGamePlay();
    }, [loading, error, gameData, playId]);

    // =====================================================
    // GAME DATA
    // =====================================================

    const ITEMS = gameData?.items || [];

    const REQUIRED_ITEMS =
        gameData?.requiredItems || [];

    const START_BUDGET =
        Number(gameData?.config?.start_budget || 0);

    const MIN_RESERVE =
        Number(gameData?.config?.min_reserve || 0);

    const LIMIT_TIME =
        Number(gameData?.config?.limit_time || 0);

    // =====================================================
    // LOG
    // =====================================================

    const addLog = (text) => {
        setLogs((prev) => [
            ...prev,
            {
                id: Date.now(),
                text,
            },
        ]);
    };

    // =====================================================
    // TOTAL PRICE
    // =====================================================

    const totalPrice = useMemo(() => {
        return cart.reduce(
            (sum, item) =>
                sum +
                Number(item.price || 0) *
                Number(item.quantity || 1),
            0
        );
    }, [cart]);

    const remaining =
        balance - totalPrice;

    // =====================================================
    // FIND ITEM
    // =====================================================

    const getItemById = (id) => {
        return ITEMS.find(
            (item) => item.id === id
        );
    };

    // =====================================================
    // CART
    // ยังเป็น state ฝั่ง client ล้วน ๆ ก่อน checkout — ยังไม่กระทบเงิน
    // หรือคะแนนจริง ปลอดภัยเพราะการตรวจสอบทั้งหมดเกิดตอน checkout()
    // ที่ backend เท่านั้น
    // =====================================================

    const addItem = (item) => {
        if (!item) {
            return;
        }

        const exists = cart.find(
            (x) => x.id === item.id
        );

        const currentQty = exists
            ? Number(exists.quantity || 1)
            : 0;

        if (
            item.maxPurchase &&
            currentQty >= item.maxPurchase
        ) {
            addLog(
                `ซื้อ ${item.name} ได้สูงสุด ${item.maxPurchase} ชิ้น`
            );

            return;
        }

        if (exists) {
            setCart((prev) =>
                prev.map((x) =>
                    x.id === item.id
                        ? {
                            ...x,
                            quantity:
                                currentQty + 1,
                        }
                        : x
                )
            );

            addLog(
                `เพิ่ม ${item.name} อีก 1 ชิ้น`
            );
        } else {
            setCart((prev) => [
                ...prev,
                {
                    ...item,
                    quantity: 1,
                },
            ]);

            addLog(
                `เพิ่ม ${item.name}`
            );
        }
    };

    const increaseItem = (id) => {
        const item = cart.find(
            (x) => x.id === id
        );

        if (!item) {
            return;
        }

        addItem(item);
    };

    const decreaseItem = (id) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    return {
                        ...item,
                        quantity: Math.max(
                            1,
                            Number(
                                item.quantity || 1
                            ) - 1
                        ),
                    };
                }

                return item;
            })
        );
    };

    const removeItem = (id) => {
        const item = getItemById(id);

        setCart((prev) =>
            prev.filter(
                (x) => x.id !== id
            )
        );

        addLog(
            `นำ ${item?.name} ออกจากตะกร้า`
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    // =====================================================
    // BACKEND-DRIVEN "จบเกมทันที" (งบเกิน / เงินสำรองไม่พอ)
    // ไม่ set result เพื่อให้ตรงกับพฤติกรรมเดิม — จอที่แสดงตอนนี้คือ
    // BudgetFailModal เท่านั้น (ResultModal ไม่ถูกใช้ในเคสนี้)
    // =====================================================

    const handleBackendFailure = (failData, fallbackMessage) => {
        setFinished(true);

        setBudgetFail({
            open: true,
            gameOverMessage:
                failData?.feedback || fallbackMessage,
            failReasons:
                failData?.fail_reasons || [fallbackMessage],
        });
    };

    // =====================================================
    // CHECKOUT (server-authoritative)
    // ส่งแค่ item_id + quantity ราคา/งบ/เงินสำรองตรวจที่ backend ทั้งหมด
    // =====================================================

    const checkout = async () => {
        if (cart.length === 0 || !playId) {
            return;
        }

        try {
            const response = await fetch(CHECKOUT_URL, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    play_id: playId,
                    cart: cart.map((item) => ({
                        item_id: item.id,
                        quantity: item.quantity,
                    })),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                addLog(
                    result?.message ||
                    "ไม่สามารถชำระเงินได้"
                );
                return;
            }

            const data = result.data;

            // งบเกิน / เงินสำรองไม่พอ — backend ตัดสินให้จบเกมแล้ว
            if (data.fail_reasons) {
                setBalance(data.final_balance);
                handleBackendFailure(data, result.message);
                return;
            }

            setBalance(data.balance);

            const receipt = {
                id: data.receipt_id,
                number: "RC-" + data.receipt_id,
                items: data.items.map((row) => ({
                    ...(getItemById(row.item_id) || {}),
                    id: row.item_id,
                    item_id: row.item_id,
                    quantity: row.quantity,
                    price: row.unit_price,
                    category: row.category,
                    type: row.item_type,
                })),
                total: data.total_amount,
                date: new Date().toLocaleString(),
            };

            setReceipts((prev) => [...prev, receipt]);
            setCurrentReceipt(receipt);
            setCart([]);

            addLog(`ชำระเงิน ${data.total_amount} บาท`);
        } catch (err) {
            console.error("Checkout Error:", err);
            addLog(err.message || "ไม่สามารถชำระเงินได้");
        }
    };

    // =====================================================
    // RECEIPT DECISION (เก็บ / ไม่เก็บ) — สุ่ม Event ต่อจาก backend
    // =====================================================

    const decideReceipt = async (save) => {
        if (!currentReceipt || !playId) {
            return;
        }

        try {
            const response = await fetch(RECEIPT_DECIDE_URL, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    play_id: playId,
                    receipt_id: currentReceipt.id,
                    save,
                }),
            });

            const result = await response.json();

            setCurrentReceipt(null);

            if (!response.ok) {
                addLog(
                    result?.message ||
                    "ไม่สามารถบันทึกการตัดสินใจใบเสร็จได้"
                );
                return;
            }

            addLog(
                save ? "เก็บใบเสร็จเรียบร้อย" : "ไม่เก็บใบเสร็จ"
            );

            if (result.data.event) {
                setEvent(result.data.event);
            }
        } catch (err) {
            console.error("Decide Receipt Error:", err);
            setCurrentReceipt(null);
        }
    };

    const saveReceipt = () => decideReceipt(true);
    const discardReceipt = () => decideReceipt(false);

    // =====================================================
    // EVENT
    // ส่งแค่ event_id/choice_id ผลกระทบ (money_change/score_change)
    // อ่านจาก DB ที่ backend เท่านั้น ไม่เชื่อค่าจาก choice ที่ client
    // ถืออยู่ (แม้จะเป็นค่าเดียวกันที่โหลดมาจาก DB ตอนแรกก็ตาม)
    // =====================================================

    const closeEvent = () => {
        setEvent(null);
    };

    const applyEvent = async (choice) => {
        if (!choice || !playId || !event) {
            return;
        }

        try {
            const response = await fetch(EVENT_APPLY_URL, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    play_id: playId,
                    event_id: event.event_id,
                    choice_id: choice.choice_id,
                }),
            });

            const result = await response.json();
            const data = result.data;

            addLog(data?.feedback || "");
            closeEvent();

            if (!response.ok) {
                addLog(
                    result?.message ||
                    "ไม่สามารถบันทึกการตอบ Event ได้"
                );
                return;
            }

            if (data.fail_reasons) {
                setBalance(data.final_balance);
                handleBackendFailure(data, result.message);
                return;
            }

            setBalance(data.balance);
            setScore(data.score);
        } catch (err) {
            console.error("Apply Event Error:", err);
            closeEvent();
        }
    };

    // =====================================================
    // REQUIRED ITEMS / PROGRESS
    // แสดงผลฝั่ง client เฉยๆ (ตัดสินใจจริงว่าจบภารกิจได้ไหม ทำที่
    // backend อีกครั้งตอน /complete)
    // =====================================================

    const requiredComplete =
        REQUIRED_ITEMS.every(
            (id) => {
                return receipts.some(
                    (receipt) =>
                        receipt.items.some(
                            (item) =>
                                item.id === id
                        )
                );
            }
        );

    const purchasedRequiredCount =
        REQUIRED_ITEMS.filter(
            (id) =>
                receipts.some(
                    (receipt) =>
                        receipt.items.some(
                            (item) =>
                                item.id === id
                        )
                )
        ).length;

    const progress =
        REQUIRED_ITEMS.length === 0
            ? 0
            : Math.min(
                Math.round(
                    (purchasedRequiredCount /
                        REQUIRED_ITEMS.length) *
                    100
                ),
                100
            );

    // =====================================================
    // TIMER
    // =====================================================

    useEffect(() => {
        if (
            loading ||
            error ||
            isPaused ||
            finished
        ) {
            return;
        }

        const timer =
            setInterval(() => {
                setElapsedTime(
                    (time) => time + 1
                );
            }, 1000);

        return () =>
            clearInterval(timer);
    }, [
        loading,
        error,
        isPaused,
        finished,
    ]);

    // =====================================================
    // FINISH (server-authoritative)
    // ส่งแค่ play_id — score/grade/success/IP ทั้งหมดคำนวณที่ backend
    // จากข้อมูลจริงใน DB
    // =====================================================

    const mapResultData = (data) => ({
        success: data.success,
        score: data.score,
        maxScore: data.max_score,
        grade: data.grade,
        unnecessaryCount: data.unnecessary_count,
        missingReceipt: data.missing_receipt,
        balance: data.final_balance,
        spent: data.spent_amount,
        receipts: data.receipt_count,
        feedback: data.feedback,
        hpBonus: data.hp_bonus,
        elapsedTime: data.elapsed_time,
        minReserve: MIN_RESERVE,

        // IP ทั้งหมดคำนวณที่ backend (finalLevelController.js) จาก
        // ข้อมูลจริงใน DB เท่านั้น
        baseIP: data.base_ip,
        timeBonusIP: data.time_bonus_ip,
        gradeBonusIP: data.grade_bonus_ip,
        earnedIP: data.earned_ip,
        totalIntegrityPoints: data.total_integrity_points,
    });

    const finishGame = async () => {
        if (!requiredComplete || !playId) {
            addLog(
                "ซื้อของจำเป็นไม่ครบ"
            );

            return;
        }

        try {
            setSavingResult(true);
            setSaveError(null);

            const response = await fetch(COMPLETE_URL, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ play_id: playId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "ไม่สามารถจบเกม Treasurer ได้"
                );
            }

            setBalance(result.data.final_balance);
            setResult(mapResultData(result.data));
            setFinished(true);
        } catch (err) {
            console.error(
                "Finish Treasurer Game Error:",
                err
            );
            setSaveError(err.message);
        } finally {
            setSavingResult(false);
        }
    };

    // =====================================================
    // RESET
    // =====================================================

    const resetGame = () => {
        setBalance(
            START_BUDGET
        );

        setBudget({
            ...(
                gameData?.categoryBudget ||
                {}
            ),
        });

        setCart([]);
        setReceipts([]);
        setCurrentReceipt(null);
        setEvent(null);
        setScore(0);
        setLogs([]);
        setBudgetFail({
            open: false,
            gameOverMessage: "",
            failReasons: [],
        });
        setFinished(false);
        setResult(null);
        setElapsedTime(0);
        setSaveError(null);
        setPlayId(null);
    };

    // =====================================================
    // RETURN
    // =====================================================

    return {
        ITEMS,

        cart,
        balance,
        budget,
        remaining,
        totalPrice,
        receipts,
        currentReceipt,
        event,
        score,
        logs,

        finished,
        result,
        progress,
        playId,
        savingResult,
        saveError,
        requiredComplete,
        budgetFail,
        elapsedTime,

        loading,
        error,

        addItem,
        increaseItem,
        decreaseItem,
        removeItem,
        clearCart,

        checkout,

        saveReceipt,
        discardReceipt,

        applyEvent,
        closeEvent,

        finishGame,
        resetGame,
    };
}