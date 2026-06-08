import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

    const question = mirrorQuestions[current];

    const handleAnswer = (choice) => {
        let newScore = score;


        if (choice === "A") {
            newScore += 10;
        } else {
            newScore -= 5;
        }

        setScore(newScore);

        if (current >= mirrorQuestions.length - 1) {
            localStorage.setItem(
                "mirrorScore",
                newScore
            );

            navigate("/unit1/resultlevel1");
            return;
        }

        setCurrent((prev) => prev + 1);


    };

    const progress =
        ((current + 1) / mirrorQuestions.length) * 100;

    const mirrorState = () => {
        if (score >= 80) return "🌟👑🪞👑🌟";
        if (score >= 50) return "✨🪞✨";
        return "💥🪞";
    };

    return (<div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-black flex items-center justify-center p-6"> <div className="max-w-3xl w-full">

        ```
        <div className="mb-5">
            <div className="flex justify-between text-white mb-2">
                <span>score : {score}</span>
                <span>
                    {current + 1}/{mirrorQuestions.length}
                </span>
            </div>

            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">

            <div className="text-center mb-8">

                <div className="text-7xl mb-4 animate-pulse">
                    {mirrorState()}
                </div>

                <h1 className="text-3xl text-yellow-300 font-bold mb-2">
                    Mirror of Integrity
                </h1>

                <p className="text-gray-300 mb-6">
                    กระจกวิเศษส่องจิต
                </p>

                <h2 className="text-white text-2xl font-semibold leading-relaxed">
                    {question.question}
                </h2>

            </div>

            <div className="grid md:grid-cols-2 gap-4">

                <button
                    onClick={() => handleAnswer("A")}
                    className="bg-green-600 hover:bg-green-700 p-5 rounded-xl text-left text-white transition"
                >
                    <div className="font-bold text-xl mb-2">
                        A
                    </div>

                    {question.A}
                </button>

                <button
                    onClick={() => handleAnswer("B")}
                    className="bg-red-600 hover:bg-red-700 p-5 rounded-xl text-left text-white transition"
                >
                    <div className="font-bold text-xl mb-2">
                        B
                    </div>

                    {question.B}
                </button>

            </div>

        </div>
    </div>
    </div>


    );
}
