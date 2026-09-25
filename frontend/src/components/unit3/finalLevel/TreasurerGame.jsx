import React, { useEffect, useState } from "react";
import { FaPause } from "react-icons/fa";

import useTreasurerGame from "./hooks/useTreasurerGame";
import BudgetHeader from "./components/BudgetHeader";
import ShopPanel from "./components/ShopPanel";
import CartPanel from "./components/CartPanel";
import InventoryPanel from "./components/InventoryPanel";
import CheckoutModal from "./components/CheckoutModal";
import ReceiptModal from "./components/ReceiptModal";
import EventModal from "./components/EventModal";
import ResultModal from "./components/ResultModal";
import BudgetFailModal from "./components/BudgetFailModal";
import PauseModal from "./components/PauseModal";

import { useNavigate } from "react-router-dom";

import bgLevel2 from "../../../assets/unit3/level2/bgLevel2.png";
import bgGameLevel2 from "../../../assets/unit3/level2/bgGameLevel2.png";
import bgMusic from "../../../assets/sounds/Unit3/FinalLevel.mp3";
import gameOverSound from "../../../assets/sounds/BackgroundGame/GameOver.mp3";

import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../hooks/useGameMuted";

export default function TreasurerGame() {
    const navigate = useNavigate();
    const [exitOpen, setExitOpen] = useState(false);
    const game = useTreasurerGame(exitOpen);

    // =====================================================
    // เพลงพื้นหลัง เบา ๆ เล่นวน (เปิด/ปิดได้จากปุ่มใน PauseModal)
    // จบเกม (สรุปผล / งบไม่พอ) แล้วเพลงหยุด
    // กดเริ่มใหม่แล้วเพลงเล่นใหม่ตั้งแต่ต้น
    // ต้องเรียกก่อน if (game.loading) / if (game.error) ตามกฎ hook ของ React
    // =====================================================
    const [muted] = useGameMuted();
    const isGameOver = Boolean(game.finished || game.budgetFail?.open);

    const musicRef = useBackgroundMusic(bgMusic, {
        volume: 0.15,
        muted: muted || isGameOver,
    });

    useEffect(() => {
        const audio = musicRef.current;
        if (!audio || !isGameOver) return;

        audio.pause();
        audio.currentTime = 0;
    }, [isGameOver, musicRef]);

    // =====================================================
    // งบไม่พอ ต้องเริ่มเกมใหม่ (BudgetFailModal) → เสียง GameOver ครั้งเดียว
    // =====================================================
    const isBudgetFail = Boolean(game.budgetFail?.open);

    useEffect(() => {
        if (!isBudgetFail || muted) return;

        const audio = new Audio(gameOverSound);
        audio.volume = 0.6;
        audio.play().catch(() => { });

        return () => {
            audio.pause();
            audio.src = "";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBudgetFail]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${mins}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    // =====================================================
    // REQUIRED ITEMS
    // ดึงจากข้อมูล DB ผ่าน game.ITEMS
    // =====================================================

    const requiredItems = game.ITEMS
        .filter((item) => item.is_required)
        .map((item) => item.id);

    // =====================================================
    // LOADING
    // =====================================================

    if (game.loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900">
                <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-xl">
                    <div className="mb-3 text-4xl">
                        🏕️
                    </div>

                    <p className="text-xl font-black">
                        กำลังเตรียมภารกิจเหรัญญิก...
                    </p>

                    <p className="mt-2 text-gray-500">
                        กำลังโหลดข้อมูลเกม
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (game.error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
                <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl">
                    <div className="mb-3 text-5xl">
                        ❌
                    </div>

                    <h2 className="text-2xl font-black text-red-600">
                        ไม่สามารถโหลดข้อมูลเกมได้
                    </h2>

                    <p className="mt-3 text-gray-600">
                        {game.error}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="
                            mt-6
                            rounded-xl
                            bg-yellow-400
                            px-6
                            py-3
                            font-black
                            shadow-lg
                            transition
                            hover:bg-yellow-500
                            active:scale-95
                        "
                    >
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-y-auto sarabun-bold">

            {/* Background */}
            <img
                src={bgLevel2}
                alt=""
                className="fixed inset-0 z-0 h-full w-full object-cover"
            />

            {/* Background Overlay */}
            <div className="fixed inset-0 z-0 bg-white/70" />

            {/* Game Content */}
            <div
                className="
                    relative
                    z-10
                    min-h-screen
                    w-full
                    overflow-y-auto
                "
                style={{
                    backgroundImage: `url(${bgGameLevel2})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="relative z-10 p-4 md:p-8">

                    {/* Timer + Pause */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">

                        {/* Timer */}
                        <div
                            className="
                                flex
                                items-center
                                justify-center
                                rounded-lg
                                px-4
                                py-2
                                text-4xl
                                text-yellow-400
                                shadow-lg
                            "
                            title="เวลาที่ใช้ไป"
                        >
                            {formatTime(
                                game.elapsedTime
                            )}
                        </div>

                        {/* Pause */}
                        <button
                            type="button"
                            onClick={() =>
                                setExitOpen(true)
                            }
                            className="
                                flex
                                h-[60px]
                                w-[60px]
                                items-center
                                justify-center
                                rounded-2xl
                                border-4
                                border-white
                                bg-yellow-400
                                text-2xl
                                text-slate-900
                                shadow-lg
                                transition-all
                                duration-200
                                hover:scale-105
                                hover:bg-yellow-500
                                active:scale-95
                            "
                            title="หยุดเกม"
                        >
                            <FaPause />
                        </button>
                    </div>

                    {/* Title */}
                    <h1
                        className="
                            mt-0
                            mb-3
                            text-center
                            text-3xl
                            font-black
                            text-white
                            drop-shadow-md
                            md:text-4xl
                        "
                    >
                        🏕️ ภารกิจเหรัญญิกค่าย
                    </h1>

                    {/* Game Layout */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                        {/* Left Side */}
                        <div className="space-y-4 lg:col-span-2">

                            <BudgetHeader
                                balance={game.balance}
                                receipts={game.receipts}
                                score={game.score}
                            />

                            <ShopPanel
                                items={game.ITEMS}
                                addItem={game.addItem}
                            />

                            {/* Activity Log */}
                            <div
                                className="
                                    rounded-2xl
                                    border-4
                                    border-black
                                    bg-white/90
                                    p-4
                                    shadow-xl
                                "
                            >
                                <h2 className="mb-2 text-xl font-black">
                                    📝 บันทึกกิจกรรม
                                </h2>

                                <div
                                    className="
                                        h-28
                                        space-y-2
                                        overflow-y-auto
                                        rounded-xl
                                        border-2
                                        border-gray-200
                                        bg-gray-50
                                        p-2
                                    "
                                >
                                    {game.logs.length === 0 ? (
                                        <p className="text-center font-bold text-gray-500">
                                            ยังไม่มีบันทึก
                                        </p>
                                    ) : (
                                        game.logs
                                            .slice()
                                            .reverse()
                                            .map((log) => (
                                                <p
                                                    key={log.id}
                                                    className="
                                                        border-b
                                                        border-gray-300
                                                        pb-1
                                                        text-sm
                                                        font-bold
                                                    "
                                                >
                                                    - {log.text}
                                                </p>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="space-y-6">

                            <CartPanel
                                cart={game.cart}
                                totalPrice={game.totalPrice}
                                remaining={game.remaining}
                                removeItem={game.removeItem}
                                increaseItem={
                                    game.increaseItem
                                }
                                decreaseItem={
                                    game.decreaseItem
                                }
                                checkout={game.checkout}
                            />

                            <InventoryPanel
                                requiredItems={game.ITEMS.filter(
                                    (item) => item.is_required
                                )}
                                cart={game.receipts
                                    .flatMap((r) => r.items)
                                    .concat(game.cart)}
                            />

                            <button
                                onClick={
                                    game.finishGame
                                }
                                disabled={
                                    !game.requiredComplete
                                }
                                className={`
                                    w-full
                                    rounded-xl
                                    border-4
                                    border-black
                                    py-2.5
                                    text-lg
                                    font-black
                                    shadow-xl
                                    transition-transform
                                    active:scale-95

                                    ${game.requiredComplete
                                        ? "bg-green-500 text-white hover:bg-green-600"
                                        : "cursor-not-allowed bg-red-600 text-white"
                                    }
                                `}
                            >
                                {game.requiredComplete
                                    ? "สรุปผลงานเหรัญญิก"
                                    : "ต้องซื้อรายการจำเป็นให้ครบก่อน"}
                            </button>
                        </div>
                    </div>

                    {/* Modals */}

                    <ReceiptModal
                        receipt={
                            game.currentReceipt
                        }
                        saveReceipt={
                            game.saveReceipt
                        }
                        discardReceipt={
                            game.discardReceipt
                        }
                    />

                    <EventModal
                        event={game.event}
                        applyEvent={
                            game.applyEvent
                        }
                        closeEvent={
                            game.closeEvent
                        }
                    />

                    <BudgetFailModal
                        open={game.budgetFail.open}
                        gameOverMessage={
                            game.budgetFail.gameOverMessage
                        }
                        failReasons={
                            game.budgetFail.failReasons
                        }
                        resetGame={game.resetGame}
                    />

                    <ResultModal
                        finished={
                            game.finished
                        }
                        result={game.result}
                        resetGame={
                            game.resetGame
                        }
                    />

                    <PauseModal
                        isOpen={exitOpen}
                        onResume={() =>
                            setExitOpen(false)
                        }
                        onRestart={() => {
                            setExitOpen(false);
                            game.resetGame();
                        }}
                        onExit={() =>
                            navigate("/map")
                        }
                    />
                </div>
            </div>
        </div>
    );
}