import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CarTaxiFront } from 'lucide-react';

export default function Level2Intro() {
    const navigate = useNavigate();

    // ===== รูปภาพ (เปลี่ยน Path เอง) =====
    const policeImg = "/src/assets/unit5/Police.png";
    const mayorImg = "/src/assets/unit5/Mayor.png";

    const policeBG = "/src/assets/unit5/station.png";
    const cityBG = "/src/assets/unit5/cityhall.png";

    // ===== บทสนทนา =====
    const policeDialogue = [
        {
            speaker: "ตำรวจ",
            text: "ทำได้ดีมาก นักสืบ... คดีรับสินบนครั้งนี้ถือว่าปิดลงได้แล้ว \nแต่...งานของเรายังไม่จบ \nจากการสืบสวนเพิ่มเติม เราพบเรื่องที่น่าสนใจอีกอย่าง"
        },
        {
            speaker: "ตำรวจ",
            text: "ประชาชนจำนวนมากเชื่อว่า...\n \"ภาษีที่จ่ายไป หายไปหมด\""
        },
        {
            speaker: "ตำรวจ",
            text: "ผู้ว่าฯ เมือง Integrity Town อยากให้คุณไปช่วยอธิบายเรื่องนี้ \nลองไปดูด้วยตัวเองว่า... การบริหารงบประมาณของเมือง ไม่ใช่เรื่องง่าย"
        }
    ];

    const mayorDialogue = [
        {
            speaker: "นายกเทศมนตรี",
            text: "ยินดีต้อนรับครับ นักสืบ ตอนนี้เมืองของเรากำลังเผชิญปัญหาอีกแบบ"
        },
        {
            speaker: "นายกเทศมนตรี",
            text: "งบประมาณของเมืองมีจำกัด \n แต่ประชาชนหลายคนไม่เข้าใจว่า ภาษีที่จ่ายไปช่วยพัฒนาอะไรบ้าง"
        },
        {
            speaker: "นายกเทศมนตรี",
            text: "วันนี้ผมจะมอบหมายให้คุณทดลองบริหารเมือง \n คุณจะได้รับงบประมาณจากภาษี 100 เหรียญ \n และต้องตัดสินใจว่าจะนำเงินไปพัฒนาด้านใด"
        },
        {
            speaker: "นายกเทศมนตรี",
            text: "จำไว้นะครับ... การจัดสรรภาษีอย่างสมดุล สำคัญกว่าการทุ่มงบไปด้านเดียว \n พร้อมหรือยัง นักสืบ? \n ผมฝากเมืองนี้ไว้กับคุณ"
        }
    ];

    // ===== State =====
    const [scene, setScene] = useState("police");
    const [dialogIndex, setDialogIndex] = useState(0);

    const [displayText, setDisplayText] = useState("");
    const [charIndex, setCharIndex] = useState(0);

    const [typing, setTyping] = useState(true);
    const [fade, setFade] = useState(false);

    const dialogues = useMemo(() => {
        return scene === "police"
            ? policeDialogue
            : mayorDialogue;
    }, [scene]);

    const current = dialogues[dialogIndex];

    // ===== Typewriter =====
    useEffect(() => {

        setDisplayText("");
        setCharIndex(0);
        setTyping(true);

    }, [dialogIndex, scene]);

    useEffect(() => {

        if (!typing) return;

        if (charIndex < current.text.length) {

            const timer = setTimeout(() => {

                setDisplayText(
                    current.text.slice(0, charIndex + 1)
                );

                setCharIndex((prev) => prev + 1);

            }, 28);

            return () => clearTimeout(timer);

        } else {

            setTyping(false);

        }

    }, [charIndex, typing, current]);

    // ===== คลิกหน้าจอ =====
    const handleNext = () => {

        // ถ้าข้อความกำลังพิมพ์ ให้แสดงทั้งหมดก่อน
        if (typing) {

            setDisplayText(current.text);
            setTyping(false);

            return;
        }

        // ตำรวจยังพูดไม่หมด
        if (
            scene === "police" &&
            dialogIndex < policeDialogue.length - 1
        ) {

            setDialogIndex((prev) => prev + 1);
            return;
        }

        // เปลี่ยนฉาก
        if (
            scene === "police" &&
            dialogIndex === policeDialogue.length - 1
        ) {

            setFade(true);

            setTimeout(() => {

                setScene("mayor");
                setDialogIndex(0);

                setFade(false);

            }, 1200);

            return;
        }

        // นายกยังพูดไม่หมด
        if (
            scene === "mayor" &&
            dialogIndex < mayorDialogue.length - 1
        ) {

            setDialogIndex((prev) => prev + 1);

            return;
        }

    };
    return (
        <motion.div
            onClick={handleNext}
            className="relative w-screen h-screen overflow-hidden cursor-pointer select-none"
        >
            {/* ================= Background ================= */}
            <AnimatePresence mode="wait">
                <motion.img
                    key={scene}
                    src={scene === "police" ? policeBG : cityBG}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </AnimatePresence>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/35" />

            {/* Fade เปลี่ยนฉาก */}
            <AnimatePresence>
                {fade && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 bg-black z-40 flex items-center justify-center"
                    >
                        <div className="text-center">

                            <CarTaxiFront className="w-24 h-24 animate-pulse text-white mx-auto mb-4" />

                            <p className="text-5xl font-black text-white">
                                กำลังเดินทาง...
                            </p>

                            <p className="text-2xl text-gray-300 mt-4">
                                ศาลากลางเมือง Integrity Town
                            </p>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ================= Character ================= */}

            <AnimatePresence mode="wait">

                <motion.img
                    key={scene + "-character"}
                    src={scene === "police" ? policeImg : mayorImg}
                    initial={{
                        x: scene === "police" ? -250 : 250,
                        opacity: 0
                    }}
                    animate={{
                        x: 0,
                        opacity: 1
                    }}
                    exit={{
                        opacity: 0
                    }}
                    transition={{
                        duration: 0.5
                    }}
                    className={`absolute bottom-[-150px] h-[110%] object-contain z-20
                        ${scene === "police"
                            ? "left-18"
                            : "right-18"
                        }`}
                />

            </AnimatePresence>

            {/* ================= Dialogue Box ================= */}

            <motion.div

                initial={{ y: 250 }}
                animate={{ y: 0 }}

                className="
                absolute
                bottom-8
                left-60
                right-60

                h-[230px]
                rounded-t-4xl
                rounded-l-4xl
                rounded-r-4xl

                bg-white/45

                backdrop-blur-md

                border-t
                border-white/20

                z-30
                "

            >

                {/* Name */}

                <div
                    className={`
        absolute
        -top-8

        ${scene === "police" ? "left-20" : "right-20"}

        bg-[#7a1c0e]
        px-10
        py-3

        ${scene === "police"
                            ? "rounded-t-xl rounded-r-xl rounded-bl-xl"
                            : "rounded-t-xl rounded-l-xl rounded-br-xl"
                        }

        text-white
        font-black
        text-2xl

        shadow-lg
    `}
                >
                    {current.speaker}
                </div>

                {/* Dialogue */}

                <div
                    className="
                    px-18
                    pt-10
                    pr-20

                    text-[#2F1500]
                    text-[28px]
                    font-bold
                    line-height: 1.5;
                    letter-spacing: 1.0px;

                    leading-relaxed

                    font-medium

                    whitespace-pre-wrap
                    "
                >
                    {displayText}
                </div>

                {/* Hint */}


            </motion.div>
            {/* ================= ปุ่มเริ่มเกม ================= */}

            {scene === "mayor" &&
                dialogIndex === mayorDialogue.length - 1 &&
                !typing && (

                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        whileHover={{
                            scale: 1.08,
                            y: -4,
                        }}
                        whileTap={{
                            scale: 0.95,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate("/unit5/game2");
                        }}
                        className="
        relative
        group
        overflow-hidden

        px-10
        py-6

        rounded-2xl

        bg-gradient-to-r
        from-amber-500
        via-yellow-400
        to-amber-500

        text-[#2b1b12]
        font-black
        text-2xl
        tracking-wider

        shadow-[0_0_30px_rgba(251,191,36,.5)]

        border-4
        border-yellow-100

        absolute
        bottom-[-55%]
        left-[35%]
        z-[100]
    "
                    >
                        {/* Glow */}
                        <div
                            className="
            absolute
            inset-0
            bg-white/10
            opacity-0
            group-hover:opacity-100
            transition
        "
                        />

                        {/* วิ่งแสง */}
                        <span
                            className="
            absolute
            left-[-75%]
            top-0
            h-full
            w-[30%]
            bg-white/35
            rotate-12
            blur-md

            group-hover:left-[140%]

            transition-all
            duration-1000
        "
                        />

                        {/* กรอบแต่ง */}
                        <span className="absolute top-0 left-0 w-1/2 h-[25%] border-l-2 border-t-2 border-white rounded-tl-xl" />
                        <span className="absolute top-0 right-0 w-1/2 h-[25%] group-hover:h-[90%] transition-all duration-300 border-r-2 border-t-2 border-white rounded-tr-xl" />
                        <span className="absolute bottom-0 left-0 w-1/2 h-[25%] group-hover:h-[90%] transition-all duration-300 border-l-2 border-b-2 border-white rounded-bl-xl" />
                        <span className="absolute bottom-0 right-0 w-1/2 h-[25%] border-r-2 border-b-2 border-white rounded-br-xl" />

                        {/* เนื้อปุ่ม */}
                        <span className="relative z-20 flex items-center gap-3">
                            <span>เริ่มทดสอบการบริหารเมือง</span>
                        </span>
                    </motion.button>
                )}
        </motion.div>
    );
}