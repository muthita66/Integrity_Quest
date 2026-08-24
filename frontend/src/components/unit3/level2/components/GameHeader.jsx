import { FaPause } from "react-icons/fa";
import ProgressBadge from "./ProgressBadge";

export default function GameHeader({
    totalAnswered,
    totalItems,
    timeLeft,
    formattedTime,
    onPause,
}) {
    return (
        <div
            className="
                absolute top-4 left-5 right-5 z-30
                grid grid-cols-3 items-start
                pointer-events-none
                sarabun-bold
            "
        >
            {/* ฝั่งซ้าย: ProgressBadge */}
            <div className="flex justify-start">
                <ProgressBadge
                    current={totalAnswered}
                    total={totalItems}
                />
            </div>

            {/* ตรงกลาง: เวลา */}
            <div className="justify-self-center pointer-events-auto">
                <div
                    className="
                        min-w-[160px]
                        rounded-2xl border-4 border-white
                        bg-slate-900 px-6 py-3
                        text-center text-white shadow-lg
                    "
                >
                    <p className="text-sm font-bold">
                        เวลาคงเหลือ
                    </p>

                    <p
                        className={`
                            text-3xl font-black
                            ${timeLeft <= 10
                                ? "text-red-400 animate-pulse"
                                : "text-yellow-300"
                            }
                        `}
                    >
                        00:{formattedTime}
                    </p>
                </div>
            </div>

            {/* ฝั่งขวา: ปุ่ม pause */}
            <div className="flex gap-3 justify-self-end pointer-events-auto">
                <button
                    type="button"
                    onClick={onPause}
                    className="
                        flex h-[60px] w-[60px]
                        items-center justify-center
                        rounded-2xl border-4 border-white
                        bg-yellow-400 text-2xl text-slate-900
                        shadow-lg transition-all duration-200
                        hover:scale-105 hover:bg-yellow-500
                        active:scale-95
                    "
                    aria-label="หยุดเกมชั่วคราว"
                    title="หยุดเกม"
                >
                    <FaPause />
                </button>
            </div>
        </div>
    );
}