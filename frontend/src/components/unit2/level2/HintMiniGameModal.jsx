import React, { useState, useEffect } from "react";
import { FaLock, FaUnlock, FaTimes } from "react-icons/fa";
import "../../../styles/unit2/button/level2/button.css";
import Hint from "../../../assets/unit2/Level2/Hint/Hint.png";

import Question1Img from "../../../assets/unit2/Level2/Hint/QuestionOne.png";
import One from "../../../assets/unit2/Level2/Hint/Q1/one.jpg";
import Five from "../../../assets/unit2/Level2/Hint/Q1/five.jpg";
import Ten from "../../../assets/unit2/Level2/Hint/Q1/ten.jpg";
import Twenty from "../../../assets/unit2/Level2/Hint/Q1/twenty.jpg";
import Fifty from "../../../assets/unit2/Level2/Hint/Q1/fifty.jpg";
import OneHundred from "../../../assets/unit2/Level2/Hint/Q1/onehundred.jpg";

import BagSchool from "../../../assets/unit2/Level2/Hint/BagSchool.jpg";
import BagFashion from "../../../assets/unit2/Level2/Hint/Fashion.jpg";
import BagBrand from "../../../assets/unit2/Level2/Hint/Luxurybrand.png";


import Rice from "../../../assets//unit2/Level2/Hint/Q5/Rice.png";
import Car from "../../../assets/unit2/Level2/Hint/Q5/Car.png";
import Water from "../../../assets/unit2/Level2/Hint/Q5/Water.png";
import Game from "../../../assets/unit2/Level2/Hint/Q5/Game.png";
import Shoes from "../../../assets/unit2/Level2/Hint/Q5/Shoes.png";


export default function HintMiniGameModal({ isOpen, onClose, questionId, hint }) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [gameState, setGameState] = useState("playing"); // playing, win, wrong

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsUnlocked(false);
            setGameState("playing");
        }
    }, [isOpen, questionId]);

    const handleWin = () => {
        setGameState("win");
        setTimeout(() => setIsUnlocked(true), 1000);
    };

    const handleWrong = () => {
        setGameState("wrong");
        setTimeout(() => setGameState("playing"), 1000);
    };

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sarabun-bold">
            <div className="relative w-full max-w-[500px] rounded-[32px] border-4 border-[#8B5A2B] bg-[#FFF4D6] p-6 shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#8B5A2B] bg-red-500 text-white shadow-lg hover:scale-105 active:scale-95 z-50"
                >
                    <FaTimes size={18} />
                </button>

                {isUnlocked ? (
                    <div className="flex flex-col items-center text-center animate-fade-in py-4">
                        <img src={Hint} alt="" className="w-full max-w-[250px] mb-2" />
                        <h2 className="text-2xl font-black text-[#3D2B1F] mb-4">ปลดล็อคคำใบ้สำเร็จ!</h2>
                        <div className="w-full rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
                            <p className="text-lg font-bold text-emerald-800">"{hint}"</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <img src={Question1Img} alt="" className="w-full max-w-[100px] mb-2" />
                        <h2 className="text-xl font-black text-[#3D2B1F] mb-6 text-center">
                            เล่นมินิเกมเพื่อปลดล็อคคำใบ้!
                        </h2>

                        <div className="w-full min-h-[200px] flex items-center justify-center">
                            {questionId === 1 && <MoneyMatchGame onWin={handleWin} onWrong={handleWrong} state={gameState} />}
                            {questionId === 2 && <WorthGame onWin={handleWin} onWrong={handleWrong} state={gameState} />}
                            {questionId === 3 && <SurviveGame onWin={handleWin} />}
                            {questionId === 4 && <SavingsGame onWin={handleWin} />}
                            {questionId === 5 && <NeedsWantsGame onWin={handleWin} />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ================= Mini Game 1: Money Match =================
function MoneyMatchGame({ onWin, onWrong, state }) {
    const [selected, setSelected] = useState([]);
    const target = 150;
    const coins = [
        { value: 1, src: One },
        { value: 5, src: Five },
        { value: 10, src: Ten },
        { value: 20, src: Twenty },
        { value: 50, src: Fifty },
        { value: 100, src: OneHundred },
    ];

    const total = selected.reduce((a, b) => a + b, 0);

    const addCoin = (val) => {
        setSelected([...selected, val]);
    };

    const reset = () => {
        setSelected([]);
    };

    const check = () => {
        if (total === target) onWin();
        else {
            onWrong();
            reset();
        }
    };

    return (
        <div className="flex flex-col items-center w-full">
            <p className="text-lg font-bold mb-4">สร้างเงินให้ครบ {target} ฿</p>

            <div className="flex flex-wrap justify-center gap-4 mb-6 max-w-[400px]">
                {coins.map((coin, i) => (
                    <button
                        key={i}
                        onClick={() => addCoin(coin.value)}
                        className="
                group
                flex
                items-center
                justify-center
                w-28
                h-20
                rounded-xl
                transition-all
                duration-200
                hover:-translate-y-1
                hover:scale-105
                active:scale-95
            "
                    >
                        <img
                            src={coin.src}
                            alt={`${coin.value} บาท`}
                            className="
                    max-w-full
                    max-h-full
                    object-contain
                    drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]
                    transition-transform
                    duration-200
                    group-hover:scale-110
                "
                        />
                    </button>
                ))}
            </div>

            <div className={`w-full max-w-[300px] p-4 rounded-2xl border-4 text-center mb-6 transition-all ${state === "wrong" ? "border-red-500 bg-red-100 scale-105" : "border-slate-300 bg-white"}`}>
                <p className="text-base text-slate-500 font-bold mb-1">เงินที่เลือก</p>
                <p className="text-4xl font-black text-blue-600">{total} ฿</p>
            </div>

            <div className="flex gap-8">
                <button onClick={reset} className="Minigame-button Minigame-button--red">
                    <span className="button-highlight"></span>
                    <span className="button-text">ล้าง</span>
                </button>

                <button onClick={check} className="Minigame-button Minigame-button--green">
                    <span className="button-highlight"></span>
                    <span className="button-text">ยืนยัน</span>
                </button>
            </div>
        </div>
    );
}

// ================= Mini Game 2: Worth =================
function WorthGame({ onWin, onWrong, state }) {
    const check = (choice) => {
        if (choice === 'A') onWin();
        else onWrong();
    };

    return (
        <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center">
                <p className="text-lg font-bold text-slate-700">วันนี้มีงบ <span className="text-blue-600 font-black text-xl">1,000 บาท</span></p>
                <p className="text-sm font-bold text-slate-600 mt-1">ต้องซื้อกระเป๋าสำหรับใส่โน้ตบุ๊กไปมหาวิทยาลัย</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-4 w-full justify-center">
                {/* Choice A */}
                <button
                    onClick={() => check('A')}
                    className="flex flex-col items-center p-3 border-4 border-slate-300 rounded-xl bg-white hover:border-gray-500 hover:bg-gray-100 active:scale-95 transition-all shadow-sm flex-1 max-w-[120px]"
                >
                    <img src={BagSchool} alt="" className="w-full max-w-[120px]" />
                </button>

                {/* Choice B */}
                <button
                    onClick={() => check('B')}
                    className="flex flex-col items-center p-3 border-4 border-slate-300 rounded-xl bg-white hover:border-gray-500 hover:bg-gray-100 active:scale-95 transition-all shadow-sm flex-1 max-w-[120px]"
                >
                    <img src={BagFashion} alt="" className="w-full h-full object-contain scale-120" />
                </button>

                {/* Choice C */}
                <button
                    onClick={() => check('C')}
                    className="flex flex-col items-center justify-center p-3 border-4 border-slate-300 rounded-xl bg-white hover:border-gray-500 hover:bg-gray-100 active:scale-95 transition-all shadow-sm flex-1 max-w-[120px] overflow-hidden"
                >
                    <img src={BagBrand} alt="" className="w-full h-full object-contain scale-150" />
                </button>
            </div>

            {state === "wrong" && (
                <p className="text-red-500 font-bold text-sm">งบไม่พอ หรือไม่เหมาะกับการใช้งานนะ ลองคิดดูใหม่!</p>
            )}
        </div>
    );
}

// ================= Mini Game 3: Survive =================
function SurviveGame({ onWin }) {
    const [step, setStep] = useState(1);
    const [budget, setBudget] = useState(4500);
    const [status, setStatus] = useState("playing"); // playing, gameover
    const [failReason, setFailReason] = useState("");

    const handleChoice = (action, cost) => {
        if (action === "pay_bill") {
            setBudget(prev => prev - 900);
            if (step === 5) {
                setTimeout(onWin, 500);
            } else {
                setStep(prev => prev + 1);
            }
        } else {
            // Spent money on something else
            setBudget(prev => prev - cost);
            setStatus("gameover");
            if (step === 2) setFailReason("คุณใช้เงินไปกับสิ่งอื่น ทำให้เงินไม่พอจ่ายค่าน้ำไฟ 5 เดือน!");
            if (step === 3) setFailReason("เงินก้อนนี้มีไว้สำหรับค่าน้ำไฟเท่านั้น การนำไปใช้จ่ายฉุกเฉินทำให้เงินไม่พอ!");
            if (step === 4) setFailReason("คุณพ่ายแพ้ต่อความอยากได้ ทำให้เงินค่าน้ำไฟไม่พอในเดือนสุดท้าย!");
        }
    };

    const reset = () => {
        setStep(1);
        setBudget(4500);
        setStatus("playing");
        setFailReason("");
    };

    if (status === "gameover") {
        return (
            <div className="flex flex-col items-center w-full text-center">
                <h3 className="text-xl font-black text-red-600 mb-2">เงินไม่พอ!</h3>
                <p className="text-sm font-bold text-slate-700 mb-6">{failReason}</p>
                <button onClick={reset} className="Minigame-button Minigame-button--red">
                    <span className="button-highlight"></span>
                    <span className="button-text">ลองใหม่</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center">
                <p className="text-lg font-bold text-slate-700">งบทั้งหมด <span className="text-blue-600 font-black text-xl">{budget.toLocaleString()} ฿</span></p>

                {/* Progress indicators */}
                <div className="flex gap-1 mt-2 justify-center">
                    {[1, 2, 3, 4, 5].map(m => (
                        <div key={m} className={`w-8 h-2 rounded-full ${m < step ? 'bg-emerald-500' : m === step ? 'bg-blue-400 animate-pulse' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="w-full max-w-[320px] bg-white border-4 border-slate-300 rounded-xl p-4 text-center">
                <h4 className="font-black text-slate-800 mb-4 text-lg">เดือนที่ {step}</h4>

                {step === 1 && (
                    <div className="flex flex-col gap-3">
                        <p className="text-md font-bold text-slate-600 mb-2">ถึงเวลาจ่ายค่าน้ำไฟแล้ว!</p>
                        <button onClick={() => handleChoice("pay_bill", 900)} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-sm">จ่ายค่าน้ำไฟ (900 ฿)</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-3">
                        <p className="text-md font-bold text-slate-600 mb-2">เหตุการณ์พิเศษ: หนังสือลิมิเต็ดออกใหม่ น่าสะสมมาก!</p>
                        <button onClick={() => handleChoice("spend", 500)} className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-blue-300">ซื้อเลย! (500 ฿)</button>
                        <button onClick={() => handleChoice("pay_bill", 900)} className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-blue-300">ไม่ซื้อ! จ่ายค่าน้ำไฟ (900 ฿)</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-3">
                        <p className="text-md font-bold text-slate-600 mb-2">เหตุฉุกเฉิน: ต้องจ่ายค่าซ่อมโทรศัพท์!</p>
                        <button onClick={() => handleChoice("spend", 1000)} className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-blue-300">ใช้เงินก้อนนี้จ่าย (1,000 ฿)</button>
                        <button onClick={() => handleChoice("pay_bill", 900)} className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-blue-300">ใช้เงินสำรองฉุกเฉิน! จ่ายน้ำไฟตามเดิม (900 ฿)</button>
                    </div>
                )}

                {step === 4 && (
                    <div className="flex flex-col gap-3">
                        <p className="text-md font-bold text-slate-600 mb-2">สิ่งที่อยากได้: เสื้อผ้าคอลเลกชันใหม่!</p>
                        <button onClick={() => handleChoice("spend", 800)} className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-blue-300">ของมันต้องมี (800 ฿)</button>
                        <button onClick={() => handleChoice("pay_bill", 900)} className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-blue-300">ไม่จำเป็น! จ่ายค่าน้ำไฟ (900 ฿)</button>
                    </div>
                )}

                {step === 5 && (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm font-bold text-slate-600 mb-2">เดือนสุดท้ายแล้ว เงินเหลือพอดี!</p>
                        <button onClick={() => handleChoice("pay_bill", 900)} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-sm">จ่ายค่าน้ำไฟ (900 ฿)</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ================= Mini Game 4: Savings =================
function SavingsGame({ onWin }) {
    const [step, setStep] = useState(1);
    const [saved, setSaved] = useState(0);
    const [status, setStatus] = useState("playing"); // playing, result
    const goal = 48900;

    const events = [
        { id: 1, title: "ชานมไข่มุกเจ้าดัง", cost: 60 },
        { id: 2, title: "สุ่มกาชาในเกม", cost: 50 },
        { id: 3, title: "แวะซื้อขนมขบเคี้ยว", cost: 30 },
    ];

    const currentEvent = events[step - 1];

    const handleChoice = (isBuy) => {
        const savedToday = isBuy ? (100 - currentEvent.cost) : 100;
        setSaved(prev => prev + savedToday);

        if (step >= events.length) {
            setStatus("result");
        } else {
            setStep(prev => prev + 1);
        }
    };

    if (status === "result") {
        const avg = saved / 3;
        const daysNeeded = Math.ceil(goal / avg);

        return (
            <div className="flex flex-col items-center w-full text-center">
                <h3 className="text-lg font-black text-[#3D2B1F] mb-2">สรุปผลการออม (จำลอง 3 วัน)</h3>
                <p className="text-sm font-bold text-slate-700 mb-2">คุณออมเงินเฉลี่ยได้ <span className="text-blue-600 font-black text-xl">{Math.floor(avg)} ฿/วัน</span></p>
                <div className="w-full bg-slate-100 p-3 rounded-xl border-2 border-slate-200 mb-4">
                    <p className="text-sm text-slate-600 mb-1">เป้าหมาย {goal.toLocaleString()} ฿</p>
                    <p className="font-bold text-rose-600">ต้องใช้เวลาเก็บถึง <span className="text-2xl">{daysNeeded.toLocaleString()}</span> วัน!</p>
                </div>
                {avg < 80 ? (
                    <>
                        <p className="text-xs font-bold text-rose-500 mb-4">การใช้จ่ายเล็กน้อยในแต่ละวัน ทำให้เป้าหมายไกลออกไปเยอะเลย!</p>
                        <button onClick={() => { setStep(1); setSaved(0); setStatus("playing"); }}
                            className="Minigame-button Minigame-button--red">
                            <span className="button-highlight"></span>
                            <span className="button-text">ลองวางแผนใหม่</span>
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-xs font-bold text-emerald-600 mb-4">ยอดเยี่ยม! คุณมีวินัยในการควบคุมรายจ่ายย่อยได้ดีมาก</p>
                        <button onClick={onWin} className="Minigame-button Minigame-button--green">
                            <span className="button-highlight"></span>
                            <span className="button-text">ปลดล็อคคำใบ้</span>
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center w-full max-w-[320px]">
                <p className="text-sm font-bold text-slate-500">เป้าหมาย: <span className="text-slate-800 font-black">{goal.toLocaleString()} ฿</span></p>
                <div className="w-full bg-slate-200 h-4 mt-2 rounded-full overflow-hidden relative border-2 border-slate-300">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min((saved / 300) * 100, 100)}%` }} />
                </div>
                <p className="text-xs font-bold text-blue-600 mt-1">เงินออม: {saved} ฿ (จำลองจาก 300 ฿)</p>
            </div>

            <div className="w-full max-w-[320px] bg-white border-4 border-slate-300 rounded-xl p-4 text-center">
                <h4 className="font-black text-slate-800 mb-2">วันที่ {step}/3</h4>
                <p className="text-md font-bold text-slate-500 mb-4">ได้เงินค่าขนม 100 ฿</p>

                <div className="bg-rose-50 p-3 rounded-xl border-2 border-rose-100 mb-4">
                    <p className="text-md font-bold text-rose-700">{currentEvent.title}</p>
                    <p className="font-black text-rose-600 text-lg">{currentEvent.cost} ฿</p>
                </div>

                <div className="flex gap-2 w-full">
                    <button
                        onClick={() => handleChoice(true)}
                        className="flex-1 py-2 flex flex-col items-center bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-blue-300"
                    >
                        <span className="text-sm mb-1">ซื้อเลย!</span>
                        <span className="text-xs opacity-80">(ออม {100 - currentEvent.cost} ฿)</span>
                    </button>
                    <button
                        onClick={() => handleChoice(false)}
                        className="flex-1 py-2 flex flex-col items-center bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-blue-300"
                    >
                        <span className="text-sm mb-1">อดใจไว้</span>
                        <span className="text-xs opacity-80">(ออม 100 ฿)</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ================= Mini Game 5: Needs or Wants =================
function NeedsWantsGame({ onWin }) {
    const [items, setItems] = useState([
        {
            id: 1,
            name: "ข้าว",
            image: Rice,
            price: 50,
            type: "need",
            bucket: null,
        },
        {
            id: 2,
            name: "ค่าเดินทาง",
            image: Car,
            price: 40,
            type: "need",
            bucket: null,
        },
        {
            id: 3,
            name: "น้ำดื่ม",
            image: Water,
            price: 15,
            type: "need",
            bucket: null,
        },
        {
            id: 4,
            name: "เกม",
            image: Game,
            price: 60,
            type: "want",
            bucket: null,
        },
        {
            id: 5,
            name: "รองเท้า",
            image: Shoes,
            price: 2500,
            type: "want",
            bucket: null,
        },
    ]);
    const [status, setStatus] = useState("playing");

    const assignBucket = (id, bucket) => {
        if (status === "wrong") return;
        setItems(prev => prev.map(item => item.id === id ? { ...item, bucket } : item));
    };

    const checkWin = () => {
        const allAssigned = items.every(item => item.bucket !== null);
        if (!allAssigned) return;

        const isCorrect = items.every(item => item.type === item.bucket);
        if (isCorrect) {
            setTimeout(onWin, 500);
        } else {
            setStatus("wrong");
            setTimeout(() => {
                setStatus("playing");
                setItems(prev => prev.map(item => ({ ...item, bucket: null })));
            }, 2000);
        }
    };

    useEffect(() => {
        if (items.every(item => item.bucket !== null)) {
            checkWin();
        }
    }, [items]);

    const unassigned = items.filter(i => i.bucket === null);
    const needs = items.filter(i => i.bucket === "need");
    const wants = items.filter(i => i.bucket === "want");

    const currentItem = unassigned[0];

    return (
        <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center w-full max-w-[320px]">
                <p className="text-sm font-bold text-slate-500">วันนี้มีเงินเหลือ <span className="text-blue-600 font-black">500 ฿</span></p>
                <p className="text-md font-bold text-slate-800">แยกสิ่งที่ควรซื้อก่อน และสิ่งที่รอได้</p>
            </div>

            {status === "wrong" && (
                <div className="mb-2 w-full max-w-[320px] p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-bold text-center">
                    ยังจัดไม่ถูกนะ ลองคิดดูใหม่ว่าอะไรจำเป็นต้องซื้อจริงๆ!
                </div>
            )}

            {currentItem ? (
                <div className="w-full max-w-[320px] bg-white border-4 border-slate-300 rounded-xl p-4 text-center mb-4 transition-all">
                    <p className="text-xs font-bold text-slate-500 mb-2">เลือกหมวดหมู่ให้ของชิ้นนี้</p>
                    <div className="flex flex-col items-center mb-4">
                        {/* รูปสินค้า */}
                        <div className="w-28 h-28 flex items-center justify-center mb-2">
                            <img
                                src={currentItem.image}
                                alt={currentItem.name}
                                className="
                w-full
                h-full
                object-contain
                drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]
            "
                            />
                        </div>

                        {/* ชื่อสินค้า */}
                        <span className="font-bold text-lg text-slate-700">
                            {currentItem.name}
                        </span>

                        {/* ราคา */}
                        <span className="font-black text-rose-500 text-xl">
                            {currentItem.price.toLocaleString()} ฿
                        </span>
                    </div>

                    <div className="flex gap-2 w-full">
                        <button
                            onClick={() => assignBucket(currentItem.id, 'need')}
                            className="flex-1 py-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-yellow-300 shadow-sm"
                        >
                            ควรซื้อก่อน
                        </button>
                        <button
                            onClick={() => assignBucket(currentItem.id, 'want')}
                            className="flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-blue-300 shadow-sm"
                        >
                            รอได้
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-[320px] h-[180px] flex items-center justify-center p-4 text-center mb-4 text-slate-500 font-bold border-4 border-dashed border-slate-300 rounded-xl">
                    กำลังตรวจสอบ...
                </div>
            )}

            <div className="flex w-full max-w-[320px] gap-2">
                <div className="flex-1 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-2 min-h-[100px]">
                    <h5 className="text-center font-bold text-yellow-700 text-xs mb-2 border-b-2 border-yellow-200 pb-1">ควรซื้อก่อน</h5>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {needs.map(i => <span key={i.id} className="text-xs bg-white px-2 py-1 rounded-md border border-yellow-200 shadow-sm">{i.name}</span>)}
                    </div>
                </div>
                <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-xl p-2 min-h-[100px]">
                    <h5 className="text-center font-bold text-blue-700 text-xs mb-2 border-b-2 border-blue-200 pb-1">รอได้</h5>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {wants.map(i => <span key={i.id} className="text-xs bg-white px-2 py-1 rounded-md border border-blue-200 shadow-sm">{i.name}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
