import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MdWarning } from "react-icons/md";

import stationBg from "../../assets/unit5/station.png";
import sendChar from "../../assets/unit5/send.png";

export default function IntroScene() {
    const navigate = useNavigate();

    const [showNarration, setShowNarration] = useState(true);
    const [showCharacter, setShowCharacter] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => {
            setShowNarration(false);
        }, 2500);

        const t2 = setTimeout(() => {
            setShowCharacter(true);
        }, 2800);

        const t3 = setTimeout(() => {
            setShowMessage(true);
        }, 4300);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">

            {/* Background */}
            <img
                src={stationBg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/20" />

            {/* Narration */}
            <AnimatePresence>
                {showNarration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="
                        absolute
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        "
                    >
                        <motion.div
                            initial={{ y: 30 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="
                            text-white
                            text-3xl
                            font-bold
                            "
                        >
                            เช้าที่แสนวุ่นวายในสถานีตำรวจ...
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Character */}
            <AnimatePresence>
                {showCharacter && (
                    <motion.img
                        src={sendChar}
                        alt=""
                        className="
                        absolute
                        bottom-0
                        right-8
                        h-[82vh]
                        w-auto
                        z-20
                        pointer-events-none
                        "
                        initial={{
                            x: 700,
                            opacity: 0,
                            scale: 0.9,
                        }}
                        animate={{
                            x: 0,
                            opacity: 1,
                            scale: 1,
                        }}
                        transition={{
                            duration: 1.2,
                            ease: "easeOut",
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Message Bubble */}
            <AnimatePresence>
                {showMessage && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.2,
                            x: 420,
                            y: 180,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.8,
                            type: "spring",
                            stiffness: 120,
                        }}
                        className="
                        absolute
                        top-[22%]
                        right-[36%]
                        z-40
                        max-w-[650px]
                        "
                    >
                        {/* หางกล่องชี้ไปมือถือ */}
                        <div
                            className="
                            absolute
                            right-[-24px]
                            top-[210px]
                            w-0
                            h-0
                            border-t-[24px]
                            border-b-[24px]
                            border-l-[24px]
                            border-t-transparent
                            border-b-transparent
                            border-l-white
                            "
                        />

                        <div
                            className="
                            bg-white
                            rounded-[32px]
                            shadow-[0_25px_60px_rgba(0,0,0,0.35)]
                            p-8
                            "
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <MdWarning className="text-red-600 text-5xl" />

                                <h2 className="text-3xl font-bold text-red-600">
                                    เบาะแสใหม่
                                </h2>
                            </div>

                            <p className="text-xl text-gray-800 leading-relaxed">
                                คุณได้รับเบาะแสเกี่ยวกับการคอร์รัปชันภายในองค์กร
                                <br />
                                จงค้นหาคำศัพท์ที่เกี่ยวข้อง
                                เพื่อเปิดโปงความจริง
                            </p>

                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                }}
                                whileTap={{
                                    scale: 0.95,
                                }}
                                onClick={() => navigate("/unit5/tutorial")}
                                className="
                                mt-8
                                px-10
                                py-4
                                rounded-2xl
                                text-xl
                                font-bold
                                text-white
                                bg-gradient-to-r
                                from-yellow-500
                                via-orange-500
                                to-red-500
                                shadow-xl
                                "
                            >
                                เริ่มภารกิจ
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}