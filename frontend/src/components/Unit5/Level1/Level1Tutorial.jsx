import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    FaKeyboard,
    FaCheckCircle,
    FaArrowRight,
    FaSearch,
    FaFolderOpen,
} from "react-icons/fa";

import bgOffice from "../../../assets/unit5/station.png";

const PARTICLES = [
    [8, 18, 7], [18, 72, 9], [31, 35, 8], [46, 82, 6],
    [58, 22, 10], [71, 64, 8], [84, 28, 7], [93, 78, 9],
    [12, 48, 6], [39, 12, 8], [64, 46, 7], [77, 88, 6],
];

export default function Tutorial() {
    const navigate = useNavigate();

    const steps = [
        {
            icon: <FaSearch />,
            title: "อ่านคำใบ้",
            desc: "อ่านคำใบ้ที่ได้รับเพื่อหาคำตอบที่ถูกต้อง",
        },
        {
            icon: <FaFolderOpen />,
            title: "คลิกช่องว่าง",
            desc: "เลือกช่องว่างที่ต้องการกรอกคำตอบ",
        },
        {
            icon: <FaKeyboard />,
            title: "พิมพ์คำตอบ",
            desc: "กรอกคำศัพท์ที่สอดคล้องกับคำใบ้",
        },
        {
            icon: <FaCheckCircle />,
            title: "ผ่านด่าน",
            desc: "ตอบถูกครบทุกคำจึงจะผ่านภารกิจ",
        },
    ];

    return (
        <div
            className="
            min-h-screen
            flex
            items-center
            justify-center
            p-6
            relative
            overflow-hidden
            bg-cover
            bg-center
            "
            style={{
                backgroundImage: `url(${bgOffice})`,
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#170d08]/65 backdrop-blur-[3px]" />

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {PARTICLES.map(([left, top, duration], i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-amber-300/30"
                        style={{ left: `${left}%`, top: `${top}%` }}
                        initial={{ opacity: 0.2 }}
                        animate={{
                            y: [0, -120],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration,
                            repeat: Infinity,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="
                relative
                z-10
                max-w-5xl
                w-full
                bg-[#24170f]/90
                backdrop-blur-xl
                border
                border-amber-300/35
                rounded-[32px]
                overflow-hidden
                shadow-[0_20px_80px_rgba(0,0,0,.45)]
                "
            >
                {/* Header */}
                <div
                    className="
                    relative
                    bg-gradient-to-r from-[#3a2416] to-[#24150d]
                    backdrop-blur-md
                    border-b
                    border-white/10
                    p-8
                    "
                >
                    <div className="text-center">
                        <div
                            className="
                            inline-flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-full
                            bg-amber-400/15
                            border
                            border-amber-400/30
                            text-amber-200
                            text-xs
                            font-bold
                            tracking-[3px]
                            mb-4
                            "
                        >
                            คู่มือภารกิจ
                        </div>

                        <h1 className="mb-2 text-3xl md:text-4xl font-black tracking-wide text-[#fff4dc]">
                            เตรียมตัวก่อนเริ่มภารกิจ
                        </h1>
                        <p className="text-[#e6d4bd]">
                            ศึกษาวิธีเล่นก่อนเริ่มสืบสวนคดีคอร์รัปชัน
                        </p>
                    </div>

                    <div
                        className="
                        absolute
                        right-8
                        top-1/2
                        -translate-y-1/2
                        text-[120px]
                        text-white/5
                        hidden md:block
                        "
                    >
                        <FaFolderOpen />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10">
                    <div className="grid md:grid-cols-2 gap-5">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -5 }}
                                className="
                                relative
                                overflow-hidden
                                bg-gradient-to-br from-[#fffaf0] to-[#f3e1bd]
                                border
                                border-[#d4a94f]/55
                                rounded-2xl
                                p-6
                                shadow-lg
                                "
                            >
                                <div
                                    className="
                                    absolute
                                    top-5
                                    right-4
                                    text-[#8b651e]/20
                                    text-5xl
                                    "
                                >
                                    {step.icon}
                                </div>

                                <div
                                    className="
                                    w-10
                                    h-10
                                    rounded-full
                                    bg-gradient-to-br from-[#e5b653] to-[#a86b14]
                                    text-[#3a2208]
                                    flex
                                    items-center
                                    justify-center
                                    font-bold
                                    mb-4
                                    "
                                >
                                    {index + 1}
                                </div>

                                <h3 className="text-xl font-black text-[#3a2416] mb-2">
                                    {step.title}
                                </h3>

                                <p className="text-[#725d46] leading-relaxed">
                                    {step.desc}
                                </p>

                                <div
                                    className="
                                    absolute
                                    bottom-0
                                    left-0
                                    h-1
                                    w-full
                                    bg-gradient-to-r
                                    from-amber-500
                                    to-orange-600
                                    "
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Mission */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="
                        mt-6
                        rounded-2xl
                        bg-gradient-to-r from-[#5a3b1e] to-[#3b2819]
                        backdrop-blur-md
                        border
                        border-amber-300/35
                        p-6
                        "
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <FaFolderOpen className="text-amber-300 text-2xl" />

                            <h2 className="font-black text-2xl text-[#fff1cf]">
                                เป้าหมายภารกิจ
                            </h2>
                        </div>

                        <p className="text-[#e6d4bd] leading-relaxed">
                            ค้นหาคำศัพท์ที่เกี่ยวข้องกับการคอร์รัปชัน
                            เพื่อรวบรวมหลักฐานและเปิดโปงความจริง
                        </p>
                    </motion.div>

                    {/* Button */}
                    <div className="text-center mt-10">
                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow:
                                    "0 0 40px rgba(180,120,40,.45)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/unit5/game")}
                            className="
                            relative
                            group
                            overflow-hidden
                            px-12
                            py-4
                            rounded-2xl
                            bg-gradient-to-r
                            from-[#e4b34f]
                            via-[#c27d1e]
                            to-[#8c5110]
                            text-[#2e1a07]
                            font-bold
                            text-xl
                            shadow-xl
                            "
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                เริ่มสืบสวน
                                <FaArrowRight />
                            </span>

                            <div
                                className="
                                absolute
                                inset-0
                                bg-white/20
                                -translate-x-full
                                group-hover:translate-x-full
                                transition-all
                                duration-1000
                                "
                            />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
