import { motion, AnimatePresence } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";

export default function LevelUpAnimation({ show }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            scale: 1.2,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.6,
                            ease: "easeOut",
                        }}
                        className="relative flex flex-col items-center"
                    >
                        {/* แสงด้านหลัง */}
                        <motion.div
                            className="absolute w-72 h-72 rounded-full bg-yellow-300/30 blur-3xl"
                            animate={{
                                scale: [1, 1.3, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                            }}
                        />

                        {/* ไอคอน */}
                        <motion.div
                            animate={{
                                y: [0, -12, 0],
                                rotate: [0, 8, -8, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                            }}
                            className="z-10"
                        >
                            <FaArrowUp
                                size={90}
                                className="text-yellow-400 drop-shadow-lg"
                            />
                        </motion.div>

                        {/* LEVEL UP */}
                        <motion.h1
                            initial={{ scale: 0.5 }}
                            animate={{
                                scale: [0.8, 1.15, 1],
                            }}
                            transition={{
                                duration: 0.8,
                            }}
                            className="
                                mt-6
                                text-7xl
                                font-black
                                tracking-wider
                                text-yellow-300
                                drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]
                            "
                        >
                            LEVEL UP!
                        </motion.h1>

                        {/* ข้อความ */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                delay: 0.4,
                            }}
                            className="
                                mt-5
                                text-2xl
                                font-bold
                                text-white
                                text-center
                            "
                        >
                            🎉 ยินดีด้วย!
                            <br />
                            ก้าวสู่ระดับถัดไป
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}