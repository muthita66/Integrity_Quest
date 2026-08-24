import { LuAlarmClock } from "react-icons/lu";
import { FaPauseCircle } from "react-icons/fa";

export default function GameHeader({
    timeLeft,
    isPaused,
    setIsPaused,
}) {
    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-1 font-black transition-colors duration-300
                    ${timeLeft <= 10 ? "text-red-700 animate-pulse" : "text-black"}`}
                >
                    <span className="text-xl w-16 text-center tracking-widest">
                        00.{String(timeLeft).padStart(2, '0')}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {!isPaused && (
                    <button
                        onClick={() => setIsPaused(true)}
                        className="flex items-center gap-2 px-1 py-1 rounded-full bg-white text-black hover:text-white hover:bg-black transition"
                    >
                        <FaPauseCircle size={18} />
                    </button>
                )}
            </div>
        </div>
    )
}