import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import classroom from "../../assets/unit1/classroom.png";
import studentLate from "../../assets/unit1/student_late.png";
import studentMain from "../../assets/unit1/student_main.png";
import guardian from "../../assets/unit1/guardian.png";

export default function ClassroomIntroScene({
    question,
    handleAnswer,
}) {
    const [step, setStep] = useState(1);
    const [text, setText] = useState("");

    const guardianText =
        "ถ้าเป็นคุณ...จะช่วยเพื่อน หรือเลือกทำในสิ่งที่ถูกต้อง?";

    useEffect(() => {
        const timers = [];

        timers.push(setTimeout(() => setStep(2), 1000));
        timers.push(setTimeout(() => setStep(3), 2200));
        timers.push(setTimeout(() => setStep(4), 3500));
        timers.push(setTimeout(() => setStep(5), 4500));
        timers.push(setTimeout(() => setStep(6), 7000));

        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (step !== 5) return;

        let i = 0;

        const typing = setInterval(() => {
            setText(guardianText.slice(0, i + 1));
            i++;

            if (i >= guardianText.length) {
                clearInterval(typing);
            }
        }, 40);

        return () => clearInterval(typing);
    }, [step]);

    return (
        <div className="relative h-[600px] overflow-hidden rounded-3xl">

            {/* Classroom */}
            <motion.img
                src={classroom}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />

            {/* นักเรียนหลัก */}
            <motion.img
                src={studentMain}
                className="absolute right-24 bottom-28 w-48"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />

            {/* เพื่อนวิ่งเข้ามา */}
            {step >= 2 && (
                <motion.img
                    src={studentLate}
                    className="absolute left-20 bottom-28 w-44"
                    initial={{
                        x: -400,
                        opacity: 0,
                    }}
                    animate={{
                        x: 0,
                        opacity: 1,
                    }}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                    }}
                />
            )}

            {/* Speech Bubble */}
            {step >= 3 && (
                <motion.div
                    className="
            absolute
            left-52
            top-24
            bg-white
            p-4
            rounded-2xl
            shadow-xl
            max-w-xs
          "
                    initial={{
                        scale: 0,
                    }}
                    animate={{
                        scale: 1,
                    }}
                >
                    <p className="font-bold">
                        ขอร้องนะ!
                    </p>

                    <p>
                        เซ็นชื่อเข้าเรียนให้หน่อย
                        เรากำลังมาสาย
                    </p>
                </motion.div>
            )}

            {/* นักเรียนส่ายหัว */}
            {step >= 4 && (
                <motion.div
                    className="absolute right-28 bottom-52 text-6xl"
                    animate={{
                        rotate: [-8, 8, -8, 8, 0],
                    }}
                    transition={{
                        duration: 1,
                    }}
                >
                    🙅
                </motion.div>
            )}

            {/* Guardian */}
            {step >= 5 && (
                <motion.img
                    src={guardian}
                    className="absolute left-0 bottom-0 w-60"
                    initial={{
                        x: -200,
                        opacity: 0,
                    }}
                    animate={{
                        x: 0,
                        opacity: 1,
                    }}
                />
            )}

            {/* Dialog */}
            {step >= 5 && (
                <motion.div
                    className="
            absolute
            bottom-4
            left-1/2
            -translate-x-1/2
            w-[90%]
            bg-slate-900/90
            border-2
            border-yellow-400
            rounded-xl
            p-4
            text-white
          "
                >
                    <p className="text-lg">
                        {text}
                        <span className="animate-pulse">|</span>
                    </p>
                </motion.div>
            )}

            {/* Choice */}
            {step >= 6 && (
                <motion.div
                    className="
            absolute
            bottom-28
            left-1/2
            flex
            gap-4
            w-[90%]
            -translate-x-1/2
          "
                    initial={{
                        opacity: 0,
                        y: 40,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                >
                    <button
                        onClick={() => handleAnswer("A")}
                        className="
              flex-1
              bg-green-600
              hover:bg-green-700
              rounded-xl
              p-4
              text-white
            "
                    >
                        <div className="font-bold mb-2">
                            A
                        </div>

                        {question.A}
                    </button>

                    <button
                        onClick={() => handleAnswer("B")}
                        className="
              flex-1
              bg-red-600
              hover:bg-red-700
              rounded-xl
              p-4
              text-white
            "
                    >
                        <div className="font-bold mb-2">
                            B
                        </div>

                        {question.B}
                    </button>
                </motion.div>
            )}
        </div>
    );
}