import { FaPause, FaHeart, FaRegHeart } from "react-icons/fa";
import { GoHeartFill } from "react-icons/go";
import { motion } from "framer-motion";

export default function GameHeader({
    foundCount,
    totalDocuments = 8,
    wrong,
    maxWrong = 5,
    timeLeft,
    onPause,
    onExit,
}) {
    const formattedTime = String(Math.max(timeLeft, 0)).padStart(2, "0");

    return (
        <div
            className="
                absolute top-4 left-5 right-5 z-30
                grid grid-cols-3 items-start
                pointer-events-none
                sarabun-bold
            "
        >
            <div className="flex items-center gap-3 justify-self-start pointer-events-auto">
                {/* โอกาสกดผิด */}
                <div
                    className="
                        flex items-center gap-1
                        rounded-2xl
                        px-4 py-3
                        text-center text-white
                        shadow-xl
                    "
                >
                    {[...Array(3)].map((_, index) => {
                        const isAlive = index < 3 - wrong;

                        return (
                            <motion.div
                                key={index}
                                animate={
                                    isAlive
                                        ? {
                                            scale: [1, 1.1, 1],
                                        }
                                        : {}
                                }
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatDelay: index * 0.2, // ให้เต้นไม่พร้อมกัน
                                    ease: "easeInOut",
                                }}
                            >
                                {isAlive ? (
                                    <GoHeartFill className="text-2xl text-red-500" />
                                ) : (
                                    <GoHeartFill className="text-2xl text-white" />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ตรงกลาง: เวลา */}
            <div className="justify-self-center pointer-events-auto">
                <div
                    className="
                        min-w-[140px]
                        rounded-2xl
                        backdrop-blur-sm
                        px-4 py-4
                        text-center text-white
                        shadow-xl
                    ">
                    <p
                        className={`
                            text-4xl font-black
                            ${timeLeft <= 10
                                ? "text-red-500 animate-pulse"
                                : "text-yellow-300"
                            }
                        `}
                    >
                        00:{formattedTime}
                    </p>
                </div>
            </div>

            {/* ฝั่งขวา: ปุ่มควบคุม */}
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