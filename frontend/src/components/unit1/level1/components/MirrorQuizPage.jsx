import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgGameLevel1 from "../../../../assets/unit1/level1/bg_game.png";

import WalletAnimation from "../WalletAnimation";
import AttendanceIntroAnimation from "../AttendanceIntroAnimation";
import ScoreAnimation from "../ScoreAnimation";
import ExamLeakAnimation from "../ExamLeakAnimation";
import CopyWorkAnimation from "../CopyWorkAnimation";
import NavBar from "./NavBar";

const mirrorQuestions = [
    {
        question: "เจอกระเป๋าตังค์ตกอยู่ที่พื้นสโมฯ ในเวลาที่ไม่มีใครมองเห็นเลย?",
        A: "หยิบไปส่งคืนเจ้าหน้าที่ หรือประกาศตามหาเจ้าของทันที",
        B: "หันซ้ายหันขวา ลังเลว่าจะเก็บไว้เองดีไหม...",
    },
    {
        question: "เพื่อนขอให้เซ็นชื่อเข้าเรียนแทน เพราะกำลังมาสาย?",
        A: "ปฏิเสธและบอกให้เพื่อนรับผิดชอบด้วยตนเอง",
        B: "เซ็นให้ เพราะแค่ครั้งเดียวคงไม่เป็นไร",
    },
    {
        question: "อาจารย์บันทึกคะแนนคุณเกินจากความจริง?",
        A: "แจ้งอาจารย์ให้แก้ไขคะแนน",
        B: "เก็บเงียบไว้ เพราะเป็นผลดีกับตัวเอง",
    },
    {
        question: "พบข้อสอบหลุดก่อนวันสอบ?",
        A: "แจ้งอาจารย์ทันที",
        B: "แอบเปิดดูเพื่อเตรียมตัว",
    },
    {
        question: "เพื่อนขอให้ลอกงานทั้งชุด?",
        A: "ปฏิเสธและช่วยอธิบายแนวทาง",
        B: "ส่งไฟล์ให้ลอก",
    },
];

const animations = [
    WalletAnimation,            // ข้อ 1
    AttendanceIntroAnimation,   // ข้อ 2
    ScoreAnimation,             // ข้อ 3
    ExamLeakAnimation,          // ข้อ 4
    CopyWorkAnimation,          // ข้อ 5
];

export default function MirrorQuizPage() {
    const navigate = useNavigate();

    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [reaction, setReaction] = useState(null);
    const [wrongCount, setWrongCount] = useState(0);

    const question = mirrorQuestions[current];
    const CurrentAnimation = animations[current] || WalletAnimation;

    const handleAnswer = (choice) => {
        if (reaction !== null) return;

        const isGood = choice === "A";
        setReaction(isGood ? "smile" : "frown");

        setTimeout(() => {
            const newScore = score + (isGood ? 10 : -5);
            const newWrongCount = wrongCount + (isGood ? 0 : 1);

            setScore(newScore);
            setWrongCount(newWrongCount);

            if (current >= mirrorQuestions.length - 1) {
                localStorage.setItem("mirrorScore", newScore);
                localStorage.setItem("bonusHP", newWrongCount === 0 ? "5" : "0");
                localStorage.setItem("wrongCount", newWrongCount);

                navigate("/unit1/resultlevel1");
                return;
            }

            setCurrent((prev) => prev + 1);
            setReaction(null);
        }, 500);
    };

    return (
        <div
            className="
            min-h-screen
            flex
            flex-col
            items-center
            justify-center
            relative
            overflow-hidden
            py-5
            px-5
            md:px-10
            sarabun-bold
        "
            style={{
                backgroundImage: `url(${bgGameLevel1})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Container holding the NavBar and the connected Game Box */}
            <div className="relative z-10 w-full max-w-6xl flex flex-col items-center shadow-2xl">
                <NavBar isFixed={false} />

                {/* Box connected below the NavBar */}
                <div
                    className="
                        w-full
                        h-[620px]
                        border-4
                        border-t-0
                        border-black
                        bg-white
                        flex
                        flex-col
                        items-center
                        justify-center
                        overflow-hidden
                    "
                >
                    {/* Mirror */}
                    <div
                        className="
                        mirror-frame
                        relative
                        w-full
                        h-full
                        border-[10px]
                        border-blue-400
                        bg-gradient-to-b
                        from-blue-100
                        via-blue-200
                        to-blue-300
                        overflow-hidden
                    "
                    >
                        {/* Inner Mirror */}
                        <div
                            className="
                            absolute
                            inset-[10px]
                            rounded-[30px]
                            border-[4px]
                            border-blue-100/80
                            bg-white/10
                            backdrop-blur-md
                            overflow-hidden
                        "
                        >
                            <CurrentAnimation
                                question={question}
                                handleAnswer={handleAnswer}
                                reaction={reaction}
                            />

                            {/* Reflection */}
                            <div
                                className="
                                absolute
                                inset-0
                                bg-gradient-to-br
                                from-white/25
                                via-transparent
                                to-transparent
                                pointer-events-none
                            "
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
