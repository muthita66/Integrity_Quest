import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaFolderOpen, FaStar } from "react-icons/fa";

// earnedIP มาจากผลของ /api/game-play/complete (IP ที่ได้จริงจาก DB)
export default function MissionComplete({ nextPath = "/unit5/2Intro", earnedIP }) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-[#160d09]/82 backdrop-blur-md p-5"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-[min(620px,94vw)] overflow-hidden rounded-[30px] bg-[#fff7e5] border-4 border-[#d18a22] shadow-[10px_12px_0_rgba(54,29,13,.35),0_25px_70px_rgba(0,0,0,.55)] p-7 md:p-10 text-center"
            >
                <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-[#f4c95d] via-[#e28b25] to-[#b75d18]" />
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#f2c45a]/25" />
                <div className="absolute -left-10 bottom-20 h-32 w-32 rounded-full bg-[#83c995]/15" />

                <div className="relative mb-5 flex items-center justify-center gap-2 text-[10px] font-black tracking-[3px] text-[#9a671b]">
                    <FaFolderOpen className="text-[#c37b1c]" />
                    CASE FILE 01 · MISSION COMPLETE
                </div>
                <div className="mb-6 flex justify-center">
                    <motion.div
                        initial={{ scale: 0.6, rotate: -12 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 180, damping: 12 }}
                        className="relative w-24 h-24 rounded-[28px] rotate-3 bg-[#2f8b52] border-4 border-[#bce5b8] flex items-center justify-center text-5xl text-white shadow-[6px_7px_0_rgba(47,108,63,.25),0_8px_20px_rgba(47,139,82,.25)]"
                    >
                        ✓
                    </motion.div>
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-black text-[#2f7544] drop-shadow-[2px_2px_0_rgba(47,117,68,.12)]"
                >
                    พบหลักฐานครบแล้ว
                </motion.h2>

                <p className="mt-2 text-[#806d58]">
                    คุณรวบรวมหลักฐานได้ครบทุกชิ้น
                </p>

                <div className="my-7 flex items-center gap-3 text-[#d4a34a]">
                    <span className="h-px flex-1 border-t border-dashed border-[#d9bd88]" />
                    <FaStar className="text-sm" />
                    <span className="h-px flex-1 border-t border-dashed border-[#d9bd88]" />
                </div>

                <motion.h1
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl md:text-6xl font-black tracking-[5px] text-[#a46618] drop-shadow-[3px_3px_0_rgba(196,123,28,.16)]"
                >
                    CASE CLOSED
                </motion.h1>

                <p className="mt-3 inline-flex rounded-full border border-[#d9bd88] bg-[#f4dfb5]/55 px-5 py-2 text-xl font-black text-[#49301d]">
                    MISSION COMPLETE
                </p>

                <div className="my-7 flex items-center gap-3 text-[#d4a34a]">
                    <span className="h-px flex-1 border-t border-dashed border-[#d9bd88]" />
                    <span className="text-[10px] font-black tracking-[3px]">CASE CLOSED</span>
                    <span className="h-px flex-1 border-t border-dashed border-[#d9bd88]" />
                </div>

                {earnedIP != null && (
                    <div className="space-y-2">
                        <div className="text-4xl md:text-5xl font-black text-[#b8791d] drop-shadow-[2px_2px_0_rgba(184,121,29,.15)]">
                            +{earnedIP} Integrity Point
                        </div>

                        <div className="text-base font-semibold text-[#8d6c3d]">
                            คะแนนสะสมของบทนี้
                        </div>
                    </div>
                )}

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(nextPath)}
                    className="
        mt-10
        w-full
        py-4
        rounded-[18px]
        bg-gradient-to-r from-[#f6c84f] via-[#e89a27] to-[#c56816] border-[#9a6214] border-b-[5px]
        text-[#2f1a08]
        text-2xl
        font-black
        tracking-widest
        shadow-lg
        shadow-[6px_7px_0_rgba(112,66,13,.3),0_8px_18px_rgba(154,98,20,.25)] hover:brightness-105
    "
                >
                    <span>ทำภารกิจต่อไป</span>
                    <FaArrowRight className="inline-block ml-2 text-lg" />
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
