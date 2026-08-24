import GameHeader from "./components/GameHeader";
import MoneyJar from "./components/MoneyJar";
import MoneyList from "./components/MoneyList";
import SuccessPopup from "./components/SuccessPopup";
import PauseModal from "./components/PauseModal";

import { useNavigate } from "react-router-dom";

import useMoneyGame from "./hooks/useMoneyGame";

import bgLevel2 from "../../../assets/unit3/level2/bgLevel2.png";
import bgGameLevel2 from "../../../assets/unit3/level2/bgGameLevel2.png";

const moneyItems = [
    {
        id: 1,
        text: "เงินค่าขนมจากแม่",
        amount: "300 บาท",
        type: "personal",
    },
    {
        id: 2,
        text: "เงินสนับสนุนจากคณะ",
        amount: "3,000 บาท",
        type: "club",
    },
    {
        id: 3,
        text: "เงินเดือนพาร์ทไทม์",
        amount: "2,000 บาท",
        type: "personal",
    },
    {
        id: 4,
        text: "เงินขายเสื้อชมรม",
        amount: "1,500 บาท",
        type: "club",
    },
    {
        id: 5,
        text: "งบซื้ออุปกรณ์กิจกรรม",
        amount: "2,500 บาท",
        type: "club",
    },
    {
        id: 6,
        text: "เงินรางวัลส่วนตัวจากการแข่งขัน",
        amount: "1,000 บาท",
        type: "personal",
    },
    {
        id: 7,
        text: "เงินบริจาคเข้ากองกลางชมรม",
        amount: "800 บาท",
        type: "club",
    },
    {
        id: 8,
        text: "เงินเก็บส่วนตัว",
        amount: "500 บาท",
        type: "personal",
    },
    {
        id: 9,
        text: "เงินค่าลงทะเบียนกิจกรรม",
        amount: "1,200 บาท",
        type: "club",
    },
    {
        id: 10,
        text: "เพื่อนคืนเงินที่ยืมส่วนตัว",
        amount: "200 บาท",
        type: "personal",
    },
    {
        id: 11,
        text: "เงินคณะสำหรับซื้อของค่าย",
        amount: "4,000 บาท",
        type: "club",
    }
];

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

        handleDragStart,
        handleDrop,
        handlePause,
        handleResume,
        resetGame,
    } = useMoneyGame(moneyItems);

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
                            items={personalItems}
                            onDrop={handleDrop}
                        />

                        <MoneyList
                            items={items}
                            totalAnswered={totalAnswered}
                            totalItems={totalItems}
                            onDragStart={handleDragStart}
                        />

                        <MoneyJar
                            type="club"
                            items={clubItems}
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