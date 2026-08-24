import { useEffect, useMemo, useState } from "react";

import {
    ITEMS,
    REQUIRED_ITEMS,
    START_BUDGET,
    INITIAL_CATEGORY_BUDGET,
    getItemById,
} from "../data/items";

import {
    getRandomEvent,
} from "../data/randomEvents";

// GAME RULE
const MIN_RESERVE = 1000;

export default function useTreasurerGame(isPaused = false) {
    const [balance, setBalance] =
        useState(START_BUDGET);

    const [budget, setBudget] =
        useState(INITIAL_CATEGORY_BUDGET);

    const [cart, setCart] =
        useState([]);

    const [receipts, setReceipts] =
        useState([]);

    const [currentReceipt, setCurrentReceipt] =
        useState(null);

    const [event, setEvent] =
        useState(null);

    const [score, setScore] =
        useState(0);

    const [logs, setLogs] =
        useState([]);

    const [missingReceipt, setMissingReceipt] =
        useState(false);

    const [unnecessaryPurchase, setUnnecessaryPurchase] =
        useState(false);

    const [budgetWarning, setBudgetWarning] = useState(false);

    const purchasedItems = [
        ...receipts.flatMap(r => r.items),
        ...cart
    ];

    // ฟังก์ชันนับของไม่จำเป็น
    const unnecessaryItems =
        purchasedItems.filter(
            item => item.type === "want"
        );

    const unnecessaryCount =
        unnecessaryItems.length;

    const [finished, setFinished] =
        useState(false);

    const [result, setResult] =
        useState(null);

    // LOG
    const addLog = (text) => {
        setLogs(prev => [
            ...prev,
            {
                id: Date.now(),
                text
            }
        ]);
    };

    // TOTAL PRICE
    const totalPrice = useMemo(() => {
        return cart.reduce(
            (sum, item) =>
                sum +
                (
                    item.price *
                    (item.quantity || 1)
                ),
            0
        );
    }, [cart]);

    const remaining = balance - totalPrice;

    // CATEGORY CHECK
    const canBuyCategory = (item) => {
        if (item.type === "want") {
            return true;
        }
        if (!item.category) {
            return true;
        }
        return (
            budget[item.category] >= item.price

        );
    };
    const hasUnnecessaryPurchase = () => {
        const inCart = cart.some(item => item.type === "want");
        const inReceipts = receipts.some(receipt =>
            receipt.items.some(item => item.type === "want")
        );
        return inCart || inReceipts;
    };

    // ADD ITEM
    const addItem = (item) => {
        const exists = cart.find(x => x.id === item.id);
        const currentQty = exists ? (exists.quantity || 1) : 0;

        if (item.maxPurchase && currentQty >= item.maxPurchase) {
            addLog(`ซื้อ ${item.name} ได้สูงสุด ${item.maxPurchase} ชิ้น`);
            return;
        }

        const afterPurchaseMoney = balance - (totalPrice + item.price);

        if (afterPurchaseMoney < MIN_RESERVE) {
            if (hasUnnecessaryPurchase() || item.type === "want") {
                setBudgetWarning(true);
                addLog("เงินสำรองไม่เพียงพอ เนื่องจากมีการใช้จ่ายกับของไม่จำเป็น");
            } else {
                addLog(`ไม่สามารถซื้อ ${item.name} ได้ ต้องเหลืองบสำรอง 1,000 บาท`);
            }
            return;
        }

        if (!exists && !canBuyCategory(item)) {
            addLog(`งบหมวด ${item.category} ไม่เพียงพอ`);
            return;
        }

        if (exists) {
            setCart(prev => prev.map(x => x.id === item.id ? { ...x, quantity: currentQty + 1 } : x));
            addLog(`เพิ่ม ${item.name} อีก 1 ชิ้น`);
        } else {
            setCart(prev => [...prev, { ...item, quantity: 1 }]);
            addLog(`เพิ่ม ${item.name}`);
        }

    };

    // QUANTITY
    const increaseItem = (id) => {
        const item =
            cart.find(
                x => x.id === id
            );
        if (!item)
            return;
        addItem(item);
    };
    const decreaseItem = (id) => {
        setCart(prev =>
            prev.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        quantity:
                            Math.max(
                                1,
                                (item.quantity || 1) - 1
                            )
                    };
                }
                return item;
            })
        );
    };

    const removeItem = (id) => {
        const item =
            getItemById(id);
        setCart(prev =>
            prev.filter(
                x => x.id !== id
            )
        );
        addLog(
            `นำ ${item?.name} ออกจากตะกร้า`
        );
    };
    const clearCart = () => {
        setCart([]);
    };

    // CHECKOUT
    const checkout = () => {
        if (cart.length === 0)
            return;
        if (balance - totalPrice < MIN_RESERVE) {
            addLog(
                "ต้องเหลืองบสำรองขั้นต่ำ 1,000 บาท"
            );
            return;
        }

        const receipt = {
            id: Date.now(),
            number:
                "RC-" + Date.now(),
            items: [
                ...cart
            ],

            total:
                totalPrice,
            date:
                new Date()
                    .toLocaleString()
        };

        setBalance(prev =>

            prev - totalPrice
        );
        cart.forEach(item => {
            if (item.category) {
                setBudget(prev => ({
                    ...prev,
                    [item.category]:
                        prev[item.category]
                        -
                        (
                            item.price *
                            (item.quantity || 1)
                        )
                }));
            }
        });
        setReceipts(prev => [
            ...prev,
            receipt
        ]);
        setCurrentReceipt(receipt);
        setCart([]);
        addLog(
            `ชำระเงิน ${totalPrice} บาท`
        );
    };

    // RECEIPT
    const saveReceipt = () => {
        setCurrentReceipt(null);
        addLog(
            "เก็บใบเสร็จเรียบร้อย"
        );
        triggerEvent();
    };

    const discardReceipt = () => {
        setMissingReceipt(true);
        setCurrentReceipt(null);
        addLog(
            "ไม่เก็บใบเสร็จ"
        );
        triggerEvent();
    };

    // EVENT
    const triggerEvent = () => {
        if (Math.random() < 0.5) {
            setEvent(
                getRandomEvent()
            );
        }
    };

    const closeEvent = () => {
        setEvent(null);
    };

    const applyEvent = (choice) => {
        const data =
            choice.result;

        if (data.money) {
            setBalance(prev =>
                prev + data.money
            );
        }


        if (data.score) {
            setScore(prev =>
                prev + data.score
            );
        }

        if (data.missingReceipt) {
            setMissingReceipt(true);
        }
        if (data.unnecessaryPurchase) {
            setUnnecessaryPurchase(true);
        }
        addLog(
            data.message
        );
        closeEvent();
    };

    // REQUIRED
    const requiredComplete =
        REQUIRED_ITEMS.every(id => {
            return receipts.some(receipt =>
                receipt.items.some(item =>
                    item.id === id
                )
            );
        });

    const progress =
        Math.min(
            Math.round(
                cart.length /
                REQUIRED_ITEMS.length *
                100
            ),
            100
        );

    const calculateScore = () => {

        let score = 0;

        // ซื้อของจำเป็นครบ
        score += 40;

        // ใบเสร็จครบ
        if (!missingReceipt)
            score += 20;

        // เงินไม่ติดลบ
        if (balance >= 0)
            score += 10;

        // เงินสำรอง
        if (balance >= 1000)
            score += 20;

        // โบนัส ไม่ซื้อของไม่จำเป็น
        if (unnecessaryCount === 0)
            score += 10;

        // หักคะแนนของไม่จำเป็น
        score -= Math.min(unnecessaryCount * 5, 20);

        return Math.max(score, 0);
    };

    const getGrade = (score) => {

        if (score >= 90)
            return "A";

        if (score >= 80)
            return "B";

        if (score >= 70)
            return "C";

        if (score >= 60)
            return "D";

        return "F";

    }

    const getFeedback = (success, missingReceipt, unnecessaryPurchase, balance) => {
        if (success) return "ยอดเยี่ยม! คุณบริหารงบประมาณค่ายได้อย่างมีประสิทธิภาพ!";
        if (missingReceipt) return "ควรเก็บใบเสร็จทุกครั้งเพื่อตรวจสอบบัญชีได้";
        if (unnecessaryPurchase) return "ระวังการซื้อของที่ไม่จำเป็น จะทำให้งบประมาณไม่เพียงพอ";
        if (balance < MIN_RESERVE) return "ควรสำรองเงินไว้อย่างน้อย 500 บาทเพื่อความปลอดภัย";
        return "ลองอีกครั้ง และวางแผนการใช้จ่ายให้รอบคอบมากขึ้น";
    };

    // โบนัสเสริม (HP)
    const LIMIT_TIME = 110;
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {

        if (isPaused || finished) return;

        const timer = setInterval(() => {

            setElapsedTime(t => t + 1);

        }, 1000);

        return () => clearInterval(timer);

    }, [isPaused, finished]);

    const hpBonus =
        elapsedTime <= LIMIT_TIME;


    // FINISH
    const finishGame = () => {
        if (!requiredComplete) {
            addLog(
                "ซื้อของจำเป็นไม่ครบ"
            );
            return;
        }

        const finalScore = calculateScore();

        const success =
            !missingReceipt &&
            !unnecessaryPurchase &&
            balance >= MIN_RESERVE;

        setResult({
            success,
            score: finalScore,
            grade: getGrade(finalScore),
            unnecessaryCount,
            balance,
            spent: START_BUDGET - balance,
            receipts: receipts.length,
            feedback: getFeedback(success, missingReceipt, unnecessaryPurchase, balance),
            hpBonus,
            elapsedTime,
        });
        setFinished(true);
    };

    const closeBudgetWarning = () => {
        setBudgetWarning(false);
    };


    // RESET
    const resetGame = () => {
        setBalance(
            START_BUDGET
        );
        setBudget(
            INITIAL_CATEGORY_BUDGET
        );
        setCart([]);
        setReceipts([]);
        setCurrentReceipt(null);
        setEvent(null);
        setScore(0);
        setLogs([]);
        setMissingReceipt(false);
        setUnnecessaryPurchase(false);
        setBudgetWarning(false);
        setFinished(false);
        setResult(null);
        setElapsedTime(0);
    };

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
        missingReceipt,
        unnecessaryPurchase,
        finished,
        result,
        progress,
        requiredComplete,
        budgetWarning,
        elapsedTime,

        closeBudgetWarning,
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