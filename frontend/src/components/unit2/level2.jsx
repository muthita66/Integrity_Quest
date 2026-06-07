import React, { useState, useEffect, useRef } from 'react';
import bgGame from "../../assets/bg_game.png";
import Latte from "../../assets/unit2/latte.png";
import Biryani from "../../assets/unit2/biryani.png";
import Handbag from "../../assets/unit2/handbag.png";
import LuxuryBags from "../../assets/unit2/handbag2.png";
import Ticket from "../../assets/unit2/ticket2.png";
import Bill from "../../assets/unit2/bill.png";
import Smartphone from "../../assets/unit2/smartphone.png"
import Money from "../../assets/unit2/money.png"
import Sneakers from "../../assets/unit2/sneakers.png"
import Sneakers2 from "../../assets/unit2/sneakers2.png"
import { FaLightbulb, FaTimes } from "react-icons/fa";
import { HiTrophy } from "react-icons/hi2";
import { LuAlarmClock } from "react-icons/lu";
import { IoIosStar } from "react-icons/io";
import { MdTask } from "react-icons/md";


const QUESTIONS = [
    {
        id: 1,
        title: "Level 2: Calculation Puzzle (1/5)",
        question: "ถ้าซื้อกาแฟ 1 แก้ว จะซื้อข้าวได้กี่จาน?",
        items: [
            { name: "กาแฟหรู", price: 150, src: Latte, alt: "กาแฟหรู" },
            { name: "ข้าวราดแกง", price: 50, src: Biryani, alt: "ข้าวราดแกง" }
        ],
        correctAnswer: "3",
        hint: "นำราคากาแฟหรู หารด้วย ราคาข้าวราดแกงนะ",
        buttonText: "CONTINUE"
    },
    {
        id: 2,
        title: "Level 2: Calculation Puzzle (2/5)",
        question: "เจนควรเลือกซื้อกระเป๋าใบใดที่คุ้มค่าที่สุด? (พิมพ์ราคาสินค้าชิ้นนั้น)",
        items: [
            { name: "กระเป๋าใช้งาน", price: 450, src: Handbag, alt: "กระเป๋าใช้งาน" },
            { name: "กระเป๋าแบรนด์เนม", price: 32000, src: LuxuryBags, alt: "กระเป๋าแบรนด์เนม" }
        ],
        correctAnswer: "450",
        hint: "เลือกราคาของกระเป๋าที่เน้นใช้งานจริงและประหยัดเงิน",
        buttonText: "CONTINUE"
    },
    {
        id: 3,
        title: "Level 2: Calculation Puzzle (3/5)",
        question: "ราคาตั๋วคอนเสิร์ต 1 ใบ สามารถเปลี่ยนเป็นค่าน้ำไฟได้กี่เดือน?",
        items: [
            { name: "ตั๋วคอนเสิร์ต", price: 4500, src: Ticket, alt: "ตั๋วคอนเสิร์ต" },
            { name: "ค่าน้ำไฟ / เดือน", price: 900, src: Bill, alt: "ค่าน้ำไฟ" }
        ],
        correctAnswer: "5",
        hint: "ลองคำนวณดูว่า เงินค่าตั๋วคอนเสิร์ตใบเดียว เลี้ยงค่าน้ำไฟได้กี่เดือน",
        buttonText: "CONTINUE"
    },
    {
        id: 4,
        title: "Level 2: Calculation Puzzle (4/5)",
        question: "ถ้าอยากได้มือถือรุ่นใหม่ราคา 24,000 บาท แต่ได้เงินค่าขนมวันละ 100 บาท ต้องออมเงินกี่วันถึงจะซื้อได้โดยไม่ขอเงินพ่อแม่เพิ่ม? (สมมติว่าออมวันละ 100 บาท)",
        items: [
            { name: "มือถือรุ่นใหม่", price: 24000, src: Smartphone, alt: "มือถือรุ่นใหม่" },
            { name: "เงินออม / วัน", price: 100, src: Money, alt: "เงินออม" }
        ],
        correctAnswer: "240",
        hint: "นำราคามือถือ หารด้วย เงินที่ออมได้ในแต่ละวันจ้า",
        buttonText: "CONTINUE"
    },
    {
        id: 5,
        title: "Level 2: Calculation Puzzle (5/5)",
        question: "ป๊อปซื้อรองเท้าผ้าใบแฟชั่นตามเพื่อนทั้งที่มีอยู่แล้ว 3 คู่ ถือว่าป๊อปเสียเงินไปกับสิ่งของประเภทใด? (พิมพ์เลข 1 หรือ 2: 1 = Needs, 2 = Wants)",
        items: [
            { name: "รองเท้าคู่ใหม่", price: 2500, src: Sneakers, alt: "รองเท้าคู่ใหม่" },
            { name: "รองเท้าเดิม 3 คู่", price: 0, src: Sneakers2, alt: "รองเท้าเดิม 3 คู่" }
        ],
        correctAnswer: "2",
        hint: "มีอยู่แล้ว 3 คู่ คู่ที่ 4 จึงเป็นแค่ความอยากตามเพื่อนเฉยๆ นะ",
        buttonText: "FINISH"
    }
];

export default function CalculationGame() {
    const [isStarted, setIsStarted] = useState(false); // State สำหรับหน้าแรก (ปุ่ม Start)
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', 'timeout'
    const [timeLeft, setTimeLeft] = useState(20);
    const [isFinished, setIsFinished] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const currentQ = QUESTIONS[currentStep];
    const passed = score === 50;
    const timerRef = useRef(null);

    // --- ระบบจัดการเวลานับถอยหลัง ---
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        // เริ่มจับเวลาเมื่อกด Start แล้ว และยังอยู่ในสถานะปกติ
        if (
            isStarted &&
            !isPaused &&
            feedback === null &&
            !isFinished
        ) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setFeedback('timeout');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timerRef.current);
    }, [isStarted, currentStep, feedback, isFinished, isPaused]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userInput || feedback !== null) return;

        if (userInput.trim() === currentQ.correctAnswer) {
            clearInterval(timerRef.current);
            setFeedback('correct');
            setScore(prev => prev + 10);

            setTimeout(() => {
                if (currentStep < QUESTIONS.length - 1) {
                    setCurrentStep(prev => prev + 1);
                    setIsPaused(false);
                    setUserInput("");
                    setTimeLeft(20);
                    setFeedback(null);
                } else {
                    setIsFinished(true);
                }
            }, 1500);
        } else {
            setFeedback('wrong');
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    const resetGame = () => {
        setCurrentStep(0);
        setScore(0);
        setUserInput("");
        setTimeLeft(20);
        setFeedback(null);
        setIsFinished(false);
        setIsStarted(false); // กลับไปหน้ากดปุ่ม Start เสมอเมื่อเริ่มใหม่
        setIsPaused(false);
    };

    // ================= 1. หน้าจอหลักก่อนเข้าเกม (Start Screen) =================
    if (!isStarted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
                style={{
                    backgroundImage: `url(${bgGame})`,
                }}>
                <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-3 border-black shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2 rounded-br-2xl text-lg shadow-md">
                        Unit 2: กับดักความอยาก
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 mb-8 mt-10 tracking-wider">Level 2: Calculation Puzzle</h2>

                    <div className="w-full max-w-xl mx-auto bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 md:p-8 mb-8 text-left text-slate-700 space-y-4 font-medium">
                        <p className="font-black text-slate-800 flex items-center justify-center gap-2 text-2xl mb-2">
                            <FaLightbulb className='text-amber-500 text-2xl' /> กติกา
                        </p>
                        <div className='text-lg grid grid-cols-[2.25rem_1fr] items-center gap-y-4'>
                            <MdTask className='text-slate-500 text-3xl' />
                            <span>คำถามทั้งหมด <span className="font-black text-slate-900 text-xl">5 ข้อ</span></span>

                            <IoIosStar className='text-yellow-500 text-3xl' />
                            <span>ตอบถูกรับข้อละ <span className="font-black text-emerald-600 text-xl">10 คะแนน</span></span>

                            <LuAlarmClock className='text-slate-600 text-3xl' />
                            <span>จับเวลาข้อละ <span className="font-black text-rose-500 text-xl">20 วินาที</span> เท่านั้น!</span>
                        </div>
                        <p className="text-base text-rose-400 font-semibold text-center pt-1 border-t border-amber-200">
                            หากหมดเวลาก่อนตอบ จะต้องเริ่มต้นใหม่หมดตั้งแต่ข้อแรก ตั้งสติให้ดีๆ
                        </p>
                    </div>

                    <button
                        onClick={() => setIsStarted(true)}
                        className="w-1/5 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-2xl rounded-2xl shadow-lg transform transition-all active:scale-95 animate-pulse"
                    >
                        START!
                    </button>
                </div>
            </div>
        );
    }

    // ================= 2. หน้าจอเมื่อตอบถูกครบทั้งหมด (Win Screen) =================
    if (isFinished) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
                style={{
                    backgroundImage: `url(${bgGame})`,
                }}
            >
                <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-3xl p-12 border-3 border-black shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[500px]">
                    <div className="text-6xl mb-4"><HiTrophy className='inline-block text-6xl text-yellow-500' /></div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">ยินดีด้วย! จบด่าน 2 แล้ว</h2>
                    <div className="text-5xl font-black text-green-600 mb-4">
                        {score} / 50
                    </div>

                    <div
                        className={`text-2xl font-black mb-3 ${passed
                            ? 'text-emerald-600'
                            : 'text-rose-500'
                            }`}
                    >
                        {passed
                            ? 'ผ่านด่านนี้'
                            : 'ไม่ผ่านด่านนี้'}
                    </div>

                    <p className="text-base md:text-lg text-slate-600 max-w-2xl font-medium mb-8">
                        ยอดเยี่ยมมาก คุณมีทักษะการคิดคำนวณและสามารถเปรียบเทียบคุณค่าของสิ่งของ <br />
                        เพื่อการตัดสินใจทางการเงินที่คุ้มค่าที่สุด!
                    </p>

                    <div className="flex justify-center gap-4 w-full">
                        <button onClick={resetGame} className="w-40 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-2xl transition-all">
                            REPLAY
                        </button>
                        <button
                            disabled={!passed}
                            className={`w-40 py-4 font-bold rounded-2xl shadow-lg transition-all ${passed ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                        >
                            CONTINUE
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ================= 3. หน้าจอระหว่างการเล่นเกม (Gameplay Screen) =================
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
            style={{
                backgroundImage: `url(${bgGame})`,
            }}
        >
            <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-3xl p-6 border-3 border-black shadow-2xl relative overflow-hidden text-center">

                {/* แดชบอร์ดเกมด้านบน */}
                <div className="flex justify-end items-center mb-6">
                    <div className="absolute top-0 left-0 bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2 rounded-br-2xl text-lg shadow-md">
                        Unit 2: กับดักความอยาก
                    </div>

                    {/* ตัวนับเวลาถอยหลัง */}
                    <div className="flex items-center gap-3">

                        <div
                            className={`flex items-center gap-2 px-4 py-1 rounded-xl border-2 font-black transition-colors duration-300
                                ${timeLeft <= 10
                                    ? 'bg-rose-100 border-rose-500 text-rose-600 animate-pulse'
                                    : 'bg-amber-50 border-amber-300 text-amber-600'
                                }`}
                        >
                            <span className="flex items-center gap-1">
                                <LuAlarmClock className="inline-block" size={22} /> เวลาที่เหลือ:
                            </span>
                            <span className="text-xl w-6 text-center">{timeLeft}</span>
                        </div>

                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={`px-4 py-2 rounded-xl text-white font-bold
        ${isPaused
                                    ? 'bg-emerald-500 hover:bg-emerald-600'
                                    : 'bg-orange-500 hover:bg-orange-600'
                                }`}
                        >
                            {isPaused ? '▶ Resume' : '⏸ Pause'}
                        </button>

                    </div>

                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-800 text-center mb-6">
                    {currentQ.title}
                </h2>

                {/* กราฟิกการ์ดสินค้า */}
                <div className="flex flex-col items-center">
                    <div className="flex justify-center items-center gap-4 md:gap-12 mb-8 w-full">
                        {currentQ.items.map((item, idx) => (
                            <React.Fragment key={item.name}>
                                <div className="flex flex-col items-center group">
                                    <div className="relative mb-3">
                                        {item.price > 0 && (
                                            <div className="absolute -top-3 -right-3 bg-amber-400 border-2 border-slate-800 px-3 py-0.5 rounded-full font-black text-xs md:text-sm shadow-sm">
                                                {item.price.toLocaleString()} บ.
                                            </div>
                                        )}
                                        <div className="w-24 h-24 md:w-40 md:h-40 bg-white border-4 border-slate-200 rounded-full flex items-center justify-center text-4xl md:text-6xl shadow-inner">
                                            <img src={item.src} alt={item.alt} className="w-16 h-16 md:w-24 md:h-24 object-contain" />
                                        </div>
                                    </div>
                                    <span className="font-bold text-xs md:text-sm text-slate-500 text-center">{item.name}</span>
                                </div>
                                {idx === 0 && <div className="text-2xl font-black text-slate-300">VS</div>}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* กล่องข้อความคำถาม */}
                    <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 mb-6 w-full max-w-2xl">
                        <p className="text-base md:text-lg font-bold text-slate-700 text-center leading-relaxed">
                            {currentQ.question}
                        </p>
                    </div>

                    {/* ฟอร์มส่งคำตอบ */}
                    <form onSubmit={handleSubmit} className="w-full max-w-xs">
                        <div className="relative mb-8">
                            <input
                                type="number"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="พิมพ์ตัวเลขคำตอบ..."
                                disabled={feedback !== null}
                                className={`w-full text-center text-xl md:text-2xl font-bold placeholder:text-base placeholder:font-medium py-3.5 px-6 rounded-2xl border-4 outline-none transition-all
                  ${feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                                        feedback === 'wrong' ? 'border-rose-500 bg-rose-50 animate-shake' :
                                            feedback === 'timeout' ? 'border-slate-400 bg-slate-100 text-slate-400' :
                                                'border-slate-300 focus:border-blue-500 bg-white'}`}
                            />

                            {feedback === 'correct' && (
                                <div className="absolute top-full mt-2 left-0 w-full text-emerald-600 font-bold text-sm text-center animate-bounce">
                                    ถูกต้อง! รับเพิ่ม 10 คะแนน
                                </div>
                            )}
                            {feedback === 'wrong' && (
                                <div className="absolute top-full mt-2 left-0 w-full text-rose-500 font-bold text-sm text-center">
                                    คำใบ้: {currentQ.hint}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!userInput || feedback !== null}
                            className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transform transition-all active:scale-95
                ${!userInput || feedback !== null ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        >
                            {currentQ.buttonText}
                        </button>
                    </form>
                </div>

                {/* ================= หน้าจอ POPUP เมื่อหมดเวลา 30 วินาที ================= */}
                {feedback === 'timeout' && (
                    <div className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center p-6 z-50 animate-in fade-in duration-300">
                        <span className="text-6xl mb-4 animate-bounce text-red-500"> <FaTimes /></span>
                        <h2 className="text-3xl md:text-4xl font-black text-rose-500 mb-2">หมดเวลา 20 วินาทีแล้ว!</h2>
                        <p className="text-base md:text-lg text-slate-700 max-w-md font-medium text-center mb-8 ">
                            การคำนวณข้อนี้ใช้เวลาเกินไปนิดนึง <br />คุณต้องกลับไปตั้งหลักใหม่ตั้งแต่ข้อแรกครับ
                        </p>
                        <button
                            onClick={resetGame}
                            className="px-10 py-4 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xl rounded-2xl shadow-xl transform active:scale-95 transition-all"
                        >
                            Return to the start
                        </button>
                    </div>
                )}
                {isPaused && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center z-50">
                        <h2 className="text-4xl font-black text-white mb-4">
                            ⏸ เกมถูกหยุดชั่วคราว
                        </h2>

                        <p className="text-white text-lg mb-6">
                            กด Resume เพื่อเล่นต่อ
                        </p>

                        <button
                            onClick={() => setIsPaused(false)}
                            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl"
                        >
                            Resume Game
                        </button>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
        </div>
    );
}