import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function MissionComplete({ nextPath = "/unit5/2Intro" }) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-[#120b07]/75 backdrop-blur-sm p-5"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-[min(580px,94vw)] overflow-hidden rounded-[22px] bg-[#fff8e9] border-4 border-[#b8791d] shadow-[0_25px_70px_rgba(0,0,0,.55)] p-7 md:p-10 text-center"
            >
                <div className="relative mb-5 text-[10px] font-bold tracking-[3px] text-[#9a671b]">CASE FILE 01 · MISSION COMPLETE</div>
                <div className="mb-6 flex justify-center">
                    <motion.div
                        initial={{ scale: 0.6, rotate: -12 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 180, damping: 12 }}
                        className="relative w-24 h-24 rounded-full bg-[#2f8b52] border-4 border-[#bce5b8] flex items-center justify-center text-5xl text-white shadow-[0_8px_20px_rgba(47,139,82,.25)]"
                    >
                        ✓
                    </motion.div>
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-black text-[#2f7544]"
                >
                    พบหลักฐานครบแล้ว
                </motion.h2>

                <p className="mt-2 text-[#806d58]">
                    คุณรวบรวมหลักฐานได้ครบทุกชิ้น
                </p>

                <div className="my-7 border-t border-dashed border-[#d9bd88]"></div>

                <motion.h1
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl md:text-6xl font-black tracking-[6px] text-[#9a671b]"
                >
                    CASE CLOSED
                </motion.h1>

                <p className="mt-3 text-2xl font-bold text-[#49301d]">
                    Mission Complete
                </p>

                <div className="my-7 border-t border-dashed border-[#d9bd88]"></div>

                <div className="space-y-2">
                    <div className="text-4xl md:text-5xl font-black text-[#b8791d]">
                        +60 Integrity Point
                    </div>

                    <div className="text-base font-semibold text-[#8d6c3d]">
                        คะแนนสะสมของบทนี้
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
        bg-gradient-to-r from-[#d5a33f] to-[#a96c17] border-[#9a6214] border-b-[4px]
        text-[#2f1a08]
        text-2xl
        font-black
        tracking-widest
        shadow-lg
        shadow-[0_8px_18px_rgba(154,98,20,.25)] hover:brightness-105
    "
                >
                    ทำภารกิจต่อไป
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
