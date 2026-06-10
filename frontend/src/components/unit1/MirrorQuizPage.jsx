import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgGameLevel1 from "../../assets/unit1/bgGameLevel1.jpg";
import Mirror from "../../assets/unit1/Mirror.png"
import MirrorIntroAnimation from "./MirrorIntroAnimation.jsx";

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
        question: "ร้านค้าทอนเงินเกินมา 100 บาท?",
        A: "คืนเงินให้ร้านทันที",
        B: "เก็บไว้ เพราะเป็นความผิดของร้าน",
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
    {
        question: "คุณมาสายกิจกรรม แต่ระบบยังเปิดให้ลงเวลา?",
        A: "ลงเวลาตามจริง",
        B: "ลงเวลาว่ามาตั้งแต่ต้น",
    },
    {
        question: "พบช่องโหว่ที่ช่วยเพิ่มคะแนนโหวตได้?",
        A: "แจ้งผู้ดูแลระบบ",
        B: "ใช้ประโยชน์จากช่องโหว่",
    },
    {
        question: "ผลการทดลองไม่ตรงทฤษฎี?",
        A: "รายงานตามจริง",
        B: "ปรับตัวเลขให้สวย",
    },
    {
        question: "ร้านค้าออนไลน์ส่งสินค้ามาเกิน?",
        A: "ติดต่อร้านและส่งคืน",
        B: "เก็บไว้เงียบ ๆ",
    },
];

export default function MirrorQuizPage() {
    const navigate = useNavigate();

    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [reaction, setReaction] = useState(null);
    const [hoverReaction, setHoverReaction] = useState(null); // เพิ่ม state สำหรับการ hover

    const question = mirrorQuestions[current];

    const handleAnswer = (choice) => {
        if (reaction !== null) return; // ป้องกันการกดซ้ำระหว่างแสดงรีแอคชั่น

        const isGood = choice === "A";
        setReaction(isGood ? "smile" : "frown");
        setHoverReaction(null); // รีเซ็ตตอนกด

        setTimeout(() => {
            let newScore = score + (isGood ? 10 : -5);
            setScore(newScore);

            if (current >= mirrorQuestions.length - 1) {
                localStorage.setItem("mirrorScore", newScore);
                navigate("/unit1/resultlevel1");
                return;
            }

            setCurrent((prev) => prev + 1);
            setReaction(null);
        }, 1200); // แสดงหน้ายิ้มหรือบึ้ง 1.2 วินาที ก่อนเปลี่ยนข้อ
    };

    const progress = ((current + 1) / mirrorQuestions.length) * 100;


    return (

        <div
            className="
            min-h-screen
            flex
            items-center
            justify-center
            relative
            overflow-hidden
        "
            style={{
                backgroundImage: `url(${bgGameLevel1})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Mirror */}
            <div
                className="
                relative

                w-[85vw]
                max-w-[1000px]

                h-[78vh]

                rounded-[40px]

                border-[10px]
                border-yellow-400

                bg-gradient-to-b
                from-yellow-200
                via-yellow-400
                to-yellow-600

                shadow-[0_0_60px_rgba(255,215,0,0.5)]

                overflow-hidden

                z-10
            "
            >
                {/* Inner Mirror */}
                <div
                    className="
                    absolute
                    inset-[10px]

                    rounded-[30px]

                    border-[4px]
                    border-yellow-100/80

                    bg-white/10
                    backdrop-blur-md

                    overflow-hidden
                "
                >
                    <MirrorIntroAnimation
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
    );
}