import React, { useState } from "react";
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
import BudgetWarningModal from "./components/BudgetWarningModal";
import PauseModal from "./components/PauseModal";

import { useNavigate } from "react-router-dom";
import { REQUIRED_ITEMS } from "./data/items";

import bgLevel2 from "../../../assets/unit3/level2/bgLevel2.png";
import bgGameLevel2 from "../../../assets/unit3/level2/bgGameLevel2.png";

export default function TreasurerGame() {
    const navigate = useNavigate();
    const [exitOpen, setExitOpen] = useState(false);
    const game = useTreasurerGame(exitOpen);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative flex h-screen overflow-y-auto flex-col p-2 md:p-6 sarabun-bold">
            {/* Background from Level 2 */}
            <img
                src={bgLevel2}
                alt=""
                className="fixed inset-0 z-0 h-full w-full object-cover"
            />
            <div className="fixed inset-0 z-0 bg-white/70" />

            {/* Box*/}
            <div
                className="
                    relative z-10 w-full max-w-7xl mx-auto my-4
                    border-4 border-emerald-950
                    bg-emerald-800 shadow-2xl 
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
                            className="flex items-center justify-center rounded-lg px-4 py-2 text-yellow-400 text-4xl shadow-lg"
                            title="เวลาที่ใช้ไป"
                        >
                            {formatTime(game.elapsedTime)}
                        </div>

                        {/* Pause */}
                        <button
                            type="button"
                            onClick={() => setExitOpen(true)}
                            className="flex h-[60px] w-[60px]
                        items-center justify-center
                        rounded-2xl border-4 border-white
                        bg-yellow-400 text-2xl text-slate-900
                        shadow-lg transition-all duration-200
                        hover:scale-105 hover:bg-yellow-500
                        active:scale-95"
                            title="หยุดเกม"
                        >
                            <FaPause />
                        </button>
                    </div>


                    <h1 className="text-3xl md:text-4xl font-black text-center mb-3 mt-0 text-white drop-shadow-md">
                        🏕️ ภารกิจเหรัญญิกค่าย
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <BudgetHeader
                                balance={game.balance}
                                receipts={game.receipts}
                                score={game.score}
                            />
                            <ShopPanel
                                items={game.ITEMS}
                                addItem={game.addItem}
                            />
                            <div className="bg-white/90 border-4 border-black rounded-2xl p-4 shadow-xl">
                                <h2 className="text-xl font-black mb-2">📝 บันทึกกิจกรรม</h2>
                                <div className="h-28 overflow-y-auto space-y-2 border-2 border-gray-200 p-2 rounded-xl bg-gray-50">
                                    {game.logs.length === 0 ? (
                                        <p className="text-gray-500 text-center font-bold">ยังไม่มีบันทึก</p>
                                    ) : (
                                        game.logs.slice().reverse().map(log => (
                                            <p key={log.id} className="text-sm font-bold border-b pb-1 border-gray-300">
                                                - {log.text}
                                            </p>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <CartPanel
                                cart={game.cart}
                                totalPrice={game.totalPrice}
                                remaining={game.remaining}
                                removeItem={game.removeItem}
                                increaseItem={game.increaseItem}
                                decreaseItem={game.decreaseItem}
                                checkout={game.checkout}
                            />
                            <InventoryPanel
                                requiredItems={REQUIRED_ITEMS}
                                cart={game.receipts.flatMap(r => r.items).concat(game.cart)}
                            />
                            {!game.finished && (
                                <button
                                    onClick={game.finishGame}
                                    disabled={!game.requiredComplete}
                                    className={`
            w-full
            border-4
            border-black
            rounded-xl
            py-4
            font-black
            text-xl
            shadow-xl
            transition-transform
            active:scale-95

            ${game.requiredComplete
                                            ?
                                            "bg-green-500 hover:bg-green-600 text-white"
                                            :
                                            "bg-red-600 text-white cursor-not-allowed"
                                        }
        `}
                                >
                                    {
                                        game.requiredComplete
                                            ?
                                            "สรุปผลงานเหรัญญิก"
                                            :
                                            "ต้องซื้อรายการจำเป็นให้ครบก่อน"
                                    }
                                </button>
                            )}
                        </div>
                    </div>

                    <ReceiptModal
                        receipt={game.currentReceipt}
                        saveReceipt={game.saveReceipt}
                        discardReceipt={game.discardReceipt}
                    />

                    <EventModal
                        event={game.event}
                        applyEvent={game.applyEvent}
                        closeEvent={game.closeEvent}
                    />

                    <BudgetWarningModal

                        open={game.budgetWarning}

                        close={game.closeBudgetWarning}

                        resetGame={game.resetGame}

                    />

                    <ResultModal
                        finished={game.finished}
                        result={game.result}
                        resetGame={game.resetGame}
                    />

                    <PauseModal
                        isOpen={exitOpen}
                        onResume={() => setExitOpen(false)}
                        onRestart={() => {
                            setExitOpen(false);
                            game.resetGame();
                        }}
                        onExit={() => navigate("/map")}
                    />
                </div>
            </div>
        </div>
    );
}
