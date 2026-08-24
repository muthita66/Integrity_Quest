import { LuAlarmClock } from "react-icons/lu";

export default function GameHeader({
    timeLeft,
    currentStep,
    totalMission,
    setIsPaused,
    money,
}) {
    return (
        <div className="w-full flex items-center justify-center">
            {/* Money (Left) */}
            <div className="px-4 py-2 rounded-2xl bg-emerald-100 border-2 border-emerald-500 shadow-md min-w-[120px]">
                <p className="text-base font-bold text-emerald-700 text-center">
                    เงินคงเหลือ
                </p>
                <p className="text-2xl font-black text-emerald-600 text-center">
                    {money} <span className="text-2xl font-bold">บาท</span>
                </p>
            </div>
        </div>
    );
}