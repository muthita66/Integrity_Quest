import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function MissionComplete({ nextPath = "/unit5/2Intro" }) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-[650px] rounded-2xl bg-[#2b1b12] border-4 border-amber-700 shadow-[0_0_40px_rgba(0,0,0,0.6)] p-10 text-center"
            >
                <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-green-700 border-4 border-green-400 flex items-center justify-center text-5xl shadow-lg">
                        ✓
                    </div>
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-black text-green-300"
                >
                    พบหลักฐานครบแล้ว
                </motion.h2>

                <p className="mt-2 text-gray-300">
                    คุณรวบรวมหลักฐานได้ครบทุกชิ้น
                </p>

                <div className="my-8 border-t border-dashed border-amber-700"></div>

                <motion.h1
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-6xl font-black tracking-[10px] text-amber-300"
                >
                    CASE CLOSED
                </motion.h1>

                <p className="mt-3 text-2xl font-bold text-white">
                    Mission Complete
                </p>

                <div className="my-8 border-t border-dashed border-amber-700"></div>

                <div className="space-y-2">
                    <div className="text-5xl font-black text-yellow-400">
                        +60 HP
                    </div>

                    <div className="text-xl text-yellow-200">
                        คะแนน
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(nextPath)}
                    className="
        mt-10
        w-full
        py-4
        rounded-xl
        bg-[#663300] border-[#663300] border-b-[4px]
        text-white
        text-2xl
        font-black
        tracking-widest
        shadow-lg
        hover:brightness-110
    "
                >
                    ทำภารกิจต่อไป
                </motion.button>
            </motion.div>
        </motion.div>
    );
}