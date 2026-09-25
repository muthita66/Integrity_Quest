import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdTableRows, MdArrowBack } from "react-icons/md";
import { FaLightbulb, FaStar } from "react-icons/fa";
import bgGameImg from "../../../assets/unit2/Level1/bgmarket.png";
import bgMusic from "../../../assets/sounds/Unit2/bg_Level1.mp3";
import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../hooks/useGameMuted";

import PoolZone from "./components/PoolZone";
import BasketZone from "./components/BasketZone";
import FinishButton from "./components/FinishButton";

import useShoppingGame from "./hooks/useShoppingGame";
import useDragDrop from "./hooks/useDragDrop";
import ExitDialog from "./components/ExitDialog";
import HintDialog from "./components/HintDialog";

export default function ShoppingGame() {
    const {
        poolItems,
        needsBasket,
        wantsBasket,
        isAllPlaced,
        moveItemBetweenZones,
        checkAnswers,
        resetGame,
    } = useShoppingGame();

    const {
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleTouchCancel,
    } = useDragDrop(moveItemBetweenZones);

    const dragProps = {
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchCancel,
    };
    const navigate = useNavigate();
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [showHintDialog, setShowHintDialog] = useState(false);
    const [hintUnlocked, setHintUnlocked] = useState(false);

    // เพลงพื้นหลัง เบา ๆ เล่นวน เปิด/ปิดได้จากปุ่มใน ExitDialog
    const [muted] = useGameMuted();
    useBackgroundMusic(bgMusic, { volume: 0.15, muted });

    return (
        <div
            className="relative flex min-h-screen flex-col items-center overflow-hidden bg-cover bg-center font-sans text-slate-800 sarabun-bold"
            style={{
                backgroundImage: `url(${bgGameImg})`,
            }}
        >
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

            {/* Top Navigation */}
            <div className="relative z-10 flex w-full items-center justify-between px-2 py-4 md:px-4">
                {/* Back Button */}
                {/*
                 * เดิมปุ่มนี้ navigate ไปที่ "/unit2/level1/SceneMission"
                 * ตรงๆ ซึ่ง route นั้น render <SceneMission /> เดี่ยวๆ
                 * โดยไม่มีใครส่ง prop scene/onBack/onNext/handleSkip ให้
                 * เลย (ดู App.jsx) ทำให้หน้า Mission ที่เห็นว่างเปล่า —
                 * ที่ถูกต้องคือกลับไปที่หน้า intro จริง (Unit2IntroPage
                 * ที่ mount อยู่ที่ "/unit2/intro") แล้วบอกให้เริ่มที่
                 * ฉาก Mission (ฉากสุดท้าย) ผ่าน router state แทน
                 */}
                <button
                    onClick={() =>
                        navigate("/unit2/intro", {
                            state: { startAtMission: true },
                        })
                    }
                    className="flex h-12 w-12 shrink-0 -translate-y-5 items-center justify-center rounded-full border-4 border-white bg-amber-700 text-white shadow-lg transition hover:scale-105 active:scale-95"
                >
                    <MdArrowBack size={28} />
                </button>

                {/* Wooden Banner */}
                <div className="relative mx-3 flex min-h-[80px] w-full max-w-3xl items-center justify-center rounded-2xl border-4 border-[#8B5A2B] bg-[#DEB887] px-8 py-3 shadow-xl">
                    <p className="text-center text-lg font-bold text-black md:text-xl">
                        ลากสินค้าจากด้านล่างลงในช่อง{" "}
                        <span className="text-emerald-800">
                            Needs (สิ่งจำเป็น)
                        </span>{" "}
                        หรือ{" "}
                        <span className="text-amber-800">
                            Wants (สิ่งที่อยากได้)
                        </span>
                        <br />
                        ให้ถูกต้อง แล้วกด{" "}
                        <span className="text-emerald-800">Finish</span>{" "}
                        เพื่อตรวจคำตอบ
                    </p>

                    {/* Decorative Star */}
                    <div className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-yellow-400 shadow-lg">
                        <FaStar className="text-yellow-100" size={24} />
                    </div>
                </div>

                {/* Menu Button */}
                <button
                    onClick={() => setShowExitDialog(true)}
                    className="flex h-12 w-12 shrink-0 -translate-y-5 items-center justify-center rounded-full border-4 border-white bg-amber-700 text-white shadow-lg transition hover:scale-105 active:scale-95"
                >
                    <MdTableRows size={24} />
                </button>
            </div>

            {/* Main Game Area */}
            <div className="relative z-10 flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pb-4">

                {/* Zones (Needs / Wants) */}
                <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 mt-4">
                    <BasketZone
                        id="zone-need"
                        zone="need"
                        title="Needs"
                        subtitle="สิ่งจำเป็น"
                        items={needsBasket}
                        colorTheme="green"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        {...dragProps}
                    />

                    <BasketZone
                        id="zone-want"
                        zone="want"
                        title="Wants"
                        subtitle="สิ่งที่อยากได้"
                        items={wantsBasket}
                        colorTheme="orange"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        {...dragProps}
                    />
                </div>

                {/* Pool Zone / Footer */}
                <div className="mt-auto flex w-full flex-col">
                    <PoolZone
                        items={poolItems}
                        isAllPlaced={isAllPlaced}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        {...dragProps}
                    />

                    {/* Action Footer */}
                    <div className="mb-6 mt-4 flex items-center justify-between rounded-xl bg-white/30 p-2 backdrop-blur-md">
                        {/* Hint Button */}
                        <div
                            onClick={() => setShowHintDialog(true)}
                            className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                                <FaLightbulb size={20} />
                            </div>
                            <div className="hidden sm:block pr-2">
                                <p className="text-xs font-bold text-slate-700">ต้องการความช่วยเหลือ?</p>
                                <p className="text-xs text-slate-500">คลิกดูคำใบ้</p>
                            </div>
                        </div>

                        {/* Finish Button */}
                        <div className="flex-1 flex justify-center">
                            <FinishButton
                                show={isAllPlaced}
                                onClick={checkAnswers}
                            />
                        </div>

                        {/* Mission Badge */}
                        <div className="flex items-center gap-2 rounded-full border-4 border-[#8B5A2B] bg-[#DEB887] px-4 py-2 shadow-sm text-[#5c3a21] font-bold">
                            <FaStar className="text-yellow-400 drop-shadow-md" size={20} />
                            <span>ภารกิจ</span>
                            <span className="rounded-full bg-white/50 px-2 py-0.5 text-sm">
                                {(needsBasket.length + wantsBasket.length)}/10
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <ExitDialog
                isOpen={showExitDialog}
                onResume={() => setShowExitDialog(false)}
                onRestart={() => {
                    resetGame();
                    setShowExitDialog(false);
                }}
                onExit={() => navigate("/map")}
            />

            <HintDialog
                isOpen={showHintDialog}
                onClose={() => setShowHintDialog(false)}
                hintUnlocked={hintUnlocked}
                onUnlock={() => setHintUnlocked(true)}
            />
        </div>
    );
}