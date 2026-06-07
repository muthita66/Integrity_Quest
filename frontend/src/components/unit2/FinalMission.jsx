import React, { useState, useEffect, useRef } from 'react';
import bgGame from "../../assets/bg_game.png";
import { FaLightbulb, FaTimes } from "react-icons/fa";
import { HiTrophy } from "react-icons/hi2";
import { LuAlarmClock } from "react-icons/lu";
import { IoIosStar } from "react-icons/io";
import { MdTask } from "react-icons/md";

// ข้อมูลฉากตามรูปภาพ image_a09f07.jpg, image_a09f2a.jpg, image_a09f63.jpg
const MISSIONS = [
    {
        id: 1,
        phase: "ช่วงเช้า",
        situation: "คุณเหลือเวลาอีก 20 นาที ต้องเลือกวิธีการเดินทางไปทำงาน (เงินเริ่มต้น 500 บ.)",
        options: [
            { id: "A", text: "เดินเท้า (0 บาท)", cost: 0, isCorrect: false, feedback: "เวลาเหลือแค่ 20 นาที เดินเท้าไปทำงานสายแน่นอน!" },
            { id: "B", text: "รถเมล์ (20 บาท)", cost: 20, isCorrect: true, feedback: "ถูกต้อง! ประหยัดและไปทันเวลาพอดี (เหลือเงิน 480 บ. ตรงตามฉากถัดไป)" },
            { id: "C", text: "วินมอไซต์ (50 บาท)", cost: 50, isCorrect: false, feedback: "วินมอเตอร์ไซค์เร็วดี แต่แพงเกินไปสำหรับเวลาที่ยังเหลือตั้ง 20 นาทีจ้า" }
        ]
    },
    {
        id: 2,
        phase: "ช่วงกลางวัน",
        situation: "คุณมีเวลา 2 ชั่วโมงในการพัก และต้องตัดสินใจในการเลือกมื้ออาหาร (เงินคงเหลือ 480 บ.)",
        options: [
            { id: "A", text: "เพื่อนชวนกินชาบู (399 บาท)", cost: 399, isCorrect: false, feedback: "กินชาบูปริมาณเงินจะลดฮวบ และเวลาพักอาจจะไม่พอนะ" },
            { id: "B", text: "ซื้อข้าวแถวบริษัท (50 บาท)", cost: 50, isCorrect: true, feedback: "ยอดเยี่ยม! ประหยัดเงินและใช้เวลาพักได้คุ้มค่าที่สุด" },
            { id: "C", text: "สั่งเดริเวอรี่ (120 บาท)", cost: 120, isCorrect: false, feedback: "สั่งเดลิเวอรีมีค่าส่งเพิ่ม ทำให้เงินเก็บช่วงเย็นไม่พอรับมือเหตุฉุกเฉิน" }
        ]
    },
    {
        id: 3,
        phase: "ช่วงเย็น",
        situation: "เกิดเหตุการณ์ไม่คาดฝันขึ้น! คุณเกิดอุบัติเหตุแต่เงินไม่พอจ่ายค่ารักษา (และไม่ได้พกเงินสดมา)",
        options: [
            { id: "A", text: "ขโมยเงินเพื่อนโต๊ะข้างๆ", cost: 0, isCorrect: false, feedback: "ผิดกฎหมายและศีลธรรมอย่างร้ายแรงนะ!" },
            { id: "B", text: "เอาของมีค่าไปจำนำไว้ก่อน", cost: 0, isCorrect: false, feedback: "โรงรับจำนำอาจปิดแล้ว หรือใช้เวลานานเกินไปในสถานการณ์ฉุกเฉินเจ็บป่วย" },
            { id: "C", text: "ขอยืมเพื่อนแล้วบอกพรุ่งนี้คืน", cost: 0, isCorrect: true, feedback: "เป็นทางออกที่ประนีประนอมและแก้ปัญหาเฉพาะหน้าได้ปลอดภัยที่สุดในตัวเลือกนี้" }
        ]
    }
];

export default function FinalMissionGame() {
    const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'result'
    const [currentStep, setCurrentStep] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30); // เวลาภาพรวม 30 วินาทีใช้ร่วมกันทั้งหมด
    const [userChoices, setUserChoices] = useState([]); // บันทึกผลการเลือกแต่ละข้อ
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef(null);

    // --- ระบบเวลารวม 30 วินาที นับต่อเนื่องจนกว่าจะจบหรือหมดเวลา ---
    useEffect(() => {
        if (gameState === 'playing' && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        // เมื่อหมดเวลา ส่งไปหน้าสรุปผลทันที
                        setGameState('result');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timerRef.current);
    }, [gameState, isPaused]);

    const handleSelectOption = (option) => {
        const updatedChoices = [...userChoices, { missionId: MISSIONS[currentStep].id, ...option }];
        setUserChoices(updatedChoices);

        if (currentStep < MISSIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // ทำครบ 3 ข้อแล้ว -> เคลียร์เวลาและไปหน้าสรุปผล
            clearInterval(timerRef.current);
            setGameState('result');
        }
    };

    const startMission = () => {
        setGameState('playing');
        setCurrentStep(0);
        setTimeLeft(30);
        setUserChoices([]);
        setIsPaused(false);
    };

    // คำนวณหาผลลัพธ์ว่า "ผ่าน" หรือไม่ (ต้องตอบถูกทุกข้อ และเวลาไม่หมด)
    const totalCorrect = userChoices.filter(choice => choice.isCorrect).length;
    const isPassed = totalCorrect === MISSIONS.length && timeLeft > 0;

    // ================= 1. หน้าจอ Ready ก่อนเริ่มภารกิจ =================
    if (gameState === 'start') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed relative"
                style={{
                    backgroundImage: `url(${bgGame})`,
                }}>

                {/* Main Card */}
                <div className="w-full max-w-2xl bg-slate-50/80 backdrop-blur-sm rounded-[2rem] p-16 border-4 border-slate-800 shadow-2xl relative text-center">
                    <h2 className="text-6xl font-black text-slate-900 mb-4 tracking-wider">Final Mission</h2>
                    <p className="text-3xl font-black text-slate-800 mb-10">1-Day Survival</p>

                    <button
                        onClick={startMission}
                        className="px-14 py-3 bg-[#FF4500] hover:bg-[#E23E00] text-white font-black text-2xl rounded-full shadow-lg transform transition-all active:scale-95"
                    >
                        START
                    </button>
                </div>
            </div>
        );
    }

    // ================= 2. หน้าจอสรุปผลลัพธ์ท้ายเกม =================
    if (gameState === 'result') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
                style={{
                    backgroundImage: `url(${bgGame})`,
                }}
            >
                <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-3 border-black shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[380px]">
                    <div className="text-6xl mb-4">
                        {isPassed ? <HiTrophy className='inline-block text-6xl text-yellow-500' /> : "❌"}
                    </div>
                    <h2 className={`text-4xl font-black mt-3 ${isPassed ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {isPassed ? "MISSION PASSED!" : "MISSION FAILED!"}
                    </h2>
                    <p className="text-slate-500 font-bold mt-1 mb-6">
                        {timeLeft === 0 ? "เหตุผล: คุณใช้เวลาเกิน 30 วินาที" : `ตอบถูกทั้งหมด ${totalCorrect} จาก 3 สถานการณ์`}
                    </p>

                    {/* สรุปรีวิวพฤติกรรมการตัดสินใจแต่ละข้อ */}
                    <div className="w-full max-w-2xl mx-auto text-left mb-4">
                        <h3 className="font-bold text-slate-700 border-b pb-2 mb-3">บันทึกการตัดสินใจของคุณ:</h3>
                        <div className="space-y-4 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                            {MISSIONS.map((m, idx) => {
                                const userAns = userChoices.find(c => c.missionId === m.id);
                                return (
                                    <div key={m.id} className={`p-4 rounded-xl border-2 ${userAns?.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-black text-slate-800">{m.phase}</span>
                                            <span className={`font-bold text-sm px-2 py-0.5 rounded ${userAns?.isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                                                {userAns ? (userAns.isCorrect ? "ถูกต้อง" : "ยังไม่คุ้มค่า") : "ไม่ได้ตอบ (หมดเวลา)"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2">{m.situation}</p>
                                        <p className="text-sm font-bold text-slate-700">
                                            เลือก: {userAns ? userAns.text : <span className="text-rose-500 font-black">หมดเวลาตัวเลือกถูกบล็อก</span>}
                                        </p>
                                        {userAns && <p className="text-xs italic text-slate-500 mt-1">วิเคราะห์: {userAns.feedback}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center mt-4">

                        <button
                            onClick={() => setGameState('start')}
                            className="px-8 py-4 bg-slate-700 hover:bg-slate-800 text-white font-black text-xl rounded-2xl shadow-md transition-all active:scale-95"
                        >
                            REPLAY
                        </button>

                        {isPassed && (
                            <button
                                disabled={!isPassed}
                                className={`px-8 py-4 text-white font-black text-xl rounded-2xl shadow-md transition-all active:scale-95
    ${isPassed
                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                CONTINUE
                            </button>
                        )}

                    </div>
                </div>
            </div>
        );
    }

    // ================= 3. หน้าจอการเล่น (Gameplay หน้าจอวิ่งต่อเนื่อง) =================
    const currentMission = MISSIONS[currentStep];

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
            style={{
                backgroundImage: `url(${bgGame})`,
            }}
        >
            <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-10 border-3 border-black shadow-2xl relative overflow-hidden text-center">

                <div className="absolute top-0 left-0 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2 rounded-br-2xl text-lg shadow-md">
                    🚨 FINAL MISSION
                </div>

                {/* แดชบอร์ดเกมด้านบน */}
                <div className="relative flex justify-center items-center mb-6 mt-10 md:mt-4">

                    {/* เวลารวมจับยิงยาว 30 วินาที และ ปุ่ม Pause */}
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border-2 font-black transition-all duration-300
                ${timeLeft <= 8 ? 'bg-rose-100 border-rose-500 text-rose-600 animate-pulse scale-105' : 'bg-amber-50 border-amber-300 text-amber-600'}`}>
                            <span className="flex items-center gap-1">
                                <LuAlarmClock className="inline-block" size={22} /> เวลารวมคงเหลือ:
                            </span>
                            <span className="text-xl w-8 text-center text-rose-600 font-black">{timeLeft}</span>
                        </div>

                        <button
                            onClick={() => setIsPaused(true)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all active:scale-95"
                        >
                            ⏸ Pause
                        </button>
                    </div>

                    <div className="absolute right-0 text-slate-500 font-bold text-sm">
                        ความคืบหน้า: <span className="text-rose-600 font-black">{currentStep + 1}/3</span>
                    </div>
                </div>

                {/* ชื่อเฟสของวัน */}
                <div className="text-center mb-4">
                    <span className="bg-amber-400 border-2 border-slate-800 font-black px-4 py-1 rounded-full text-slate-800 shadow-sm">
                        {currentMission.phase}
                    </span>
                </div>

                {/* รายละเอียดเหตุการณ์ */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-8 shadow-inner w-full max-w-2xl mx-auto">
                    <p className="text-base md:text-lg font-bold text-slate-700 text-center leading-relaxed">
                        {currentMission.situation}
                    </p>
                </div>

                {/* ช้อยส์ตัวเลือก 3 ปุ่มกดกระตุ้นไหวพริบ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {currentMission.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelectOption(option)}
                            className="p-5 bg-slate-50 hover:bg-rose-50 border-2 border-slate-200 hover:border-rose-400 rounded-2xl transition-all font-bold text-slate-700 text-center shadow-sm hover:shadow active:scale-95 flex flex-col items-center justify-center min-h-[100px]"
                        >
                            <span className="text-rose-600 text-xs font-black mb-1">ตัวเลือก {option.id}</span>
                            <span className="text-sm md:text-base">{option.text}</span>
                        </button>
                    ))}
                </div>

                {/* Pause Overlay Screen */}
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
                            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg transform transition-all active:scale-95"
                        >
                            Resume Game
                        </button>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{
                    __html: `
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #cbd5e1;
                border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: #94a3b8;
            }
          `}} />
            </div>
        </div>
    );
}