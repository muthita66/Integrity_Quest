import GameHeader from "./components/GameHeader";
import MoneyJar from "./components/MoneyJar";
import MoneyList from "./components/MoneyList";
import SuccessPopup from "./components/SuccessPopup";
import PauseModal from "./components/PauseModal";

import { useNavigate } from "react-router-dom";

import useMoneyGame from "./hooks/useMoneyGame";

import bgLevel2 from "../../../assets/unit3/level2/bgLevel2.png";
import bgGameLevel2 from "../../../assets/unit3/level2/bgGameLevel2.png";
import bgMusic from "../../../assets/sounds/Unit3/Level2.mp3";

import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../hooks/useGameMuted";

export default function MoneyGamePage() {
    const navigate = useNavigate();

    const {
        items,
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
        isLoading,
        loadError,

        handleDragStart,
        handleDrop,
        handlePause,
        handleResume,
        resetGame,
    } = useMoneyGame();

    // ============================================================
    // เพลงพื้นหลัง เบา ๆ เล่นวน (เปิด/ปิดได้จากปุ่มใน PauseModal)
    // ต้องเรียกก่อน if (isLoading) / if (loadError) ตามกฎ hook ของ React
    // ============================================================
    const [muted] = useGameMuted();
    useBackgroundMusic(bgMusic, { volume: 0.15, muted });

    const displayItems = items.map((item) => ({
        ...item,
        id: item.item_id,
        text: item.name,
    }));

    const displayPersonalItems = personalItems.map((item) => ({
        ...item,
        id: item.item_id,
        text: item.name,
    }));

    const displayClubItems = clubItems.map((item) => ({
        ...item,
        id: item.item_id,
        text: item.name,
    }));

    // ============================================================
    // Loading / Error state
    // เดิมหน้านี้ไม่มี branch นี้เลย ทำให้ถ้า backend โหลดเกมไม่สำเร็จ
    // (เช่น ตอนที่ level 9 ยังไม่มี branch ใน startGame()) จะเห็นกระดาน
    // เกมเปล่า ๆ แสดง "ทำแล้ว 11/11" ทันทีโดยไม่มีใครกดอะไรเลย เพราะ
    // totalAnswered คำนวณจาก totalItems - items.length และ items ยังว่าง
    // อยู่ ตอนนี้กันไว้ด้วย Loading/Error UI ตรง ๆ ก่อนจะ render กระดานเกม
    // ============================================================
    if (isLoading) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
                <img
                    src={bgLevel2}
                    alt=""
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 z-0 bg-white/70" />

                <div className="relative z-10 flex flex-col items-center gap-4 rounded-lg bg-emerald-950/90 px-10 py-8 text-center sarabun-bold text-white shadow-2xl">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                    <p className="text-lg">
                        กำลังโหลดเกม...
                    </p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
                <img
                    src={bgLevel2}
                    alt=""
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 z-0 bg-white/70" />

                <div className="relative z-10 flex max-w-md flex-col items-center gap-4 rounded-lg bg-emerald-950/90 px-10 py-8 text-center sarabun-bold text-white shadow-2xl">
                    <p className="text-lg text-red-300">
                        โหลดเกมไม่สำเร็จ
                    </p>
                    <p className="text-sm text-white/80">
                        {loadError}
                    </p>
                    <div className="mt-2 flex gap-3">
                        <button
                            onClick={resetGame}
                            className="rounded bg-amber-500 px-5 py-2 text-sm font-bold text-emerald-950 hover:bg-amber-400"
                        >
                            ลองใหม่
                        </button>
                        <button
                            onClick={() => navigate("/map")}
                            className="rounded border border-white/40 px-5 py-2 text-sm hover:bg-white/10"
                        >
                            กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
            {/* Background */}
            <img
                src={bgLevel2}
                alt=""
                className="absolute inset-0 z-0 h-full w-full object-cover"
            />

            {/* White Overlay */}
            <div className="absolute inset-0 z-0 bg-white/70" />
            <div
                className="
                    relative min-h-[620px] w-full max-w-6xl
                    overflow-hidden
                    border-4 border-emerald-950
                    bg-emerald-800 shadow-2xl
                    sarabun-bold
                "
            >
                {/* Background */}
                <img
                    src={bgGameLevel2}
                    alt=""
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                />

                {/* Content */}
                <div className="relative z-10 px-6 pb-6 pt-32">
                    <GameHeader
                        totalAnswered={totalAnswered}
                        totalItems={totalItems}
                        timeLeft={timeLeft}
                        formattedTime={formattedTime}
                        onPause={handlePause}
                    />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr_1fr]">
                        <MoneyJar
                            type="personal"
                            items={displayPersonalItems}
                            onDrop={handleDrop}
                        />

                        <MoneyList
                            items={displayItems}
                            totalAnswered={totalAnswered}
                            totalItems={totalItems}
                            onDragStart={handleDragStart}
                        />

                        <MoneyJar
                            type="club"
                            items={displayClubItems}
                            onDrop={handleDrop}
                        />
                    </div>
                </div>

                <PauseModal
                    isOpen={isPaused}
                    onResume={handleResume}
                    onRestart={resetGame}
                    onExit={() => navigate("/map")}
                />
            </div>
        </div>
    );
}