import React, { useState, useEffect } from "react";
import { FaLock, FaUnlock, FaTimes } from "react-icons/fa";
import "../../../styles/unit2/button/level2/button.css";
import Hint from "../../../assets/unit2/Level2/Hint/Hint.png";
import Lock from "../../../assets/unit2/Level2/Hint/Lock.png";

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
                        <img src={Lock} alt="" className="w-full max-w-[100px] mb-1" />
                        <h2 className="text-xl font-black text-black mb-2 text-center">
                            เล่นเกมเพื่อปลดล็อคคำใบ้!
                        </h2>
                        <div className="w-50 h-px bg-[#8B5A2B] mb-4" />

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
    const [money, setMoney] = useState([]);
    const [selected, setSelected] = useState([]);
    const [target, setTarget] = useState(150);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchGame = async () => {
            try {
                setStatus("loading");
                setError("");

                const response = await fetch(`${API_URL}/api/hintMinigame/1`);

                if (!response.ok) {
                    throw new Error("ไม่สามารถโหลดข้อมูลมินิเกมได้");
                }

                const data = await response.json();

                if (!data?.options?.length) {
                    throw new Error("ไม่พบข้อมูลตัวเลือกของมินิเกม");
                }

                setTarget(data.target_value ?? 150);
                setMoney(data.options);
                setSelected([]);
                setStatus("playing");
            } catch (err) {
                console.error("Error fetching Money Match mini-game:", err);
                setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
                setStatus("error");
            }
        };

        fetchGame();
    }, [API_URL]);

    const total = selected.reduce((sum, value) => sum + value, 0);

    const addMoney = (value) => {
        if (state !== "playing" || status !== "playing") return;
        setSelected((prev) => [...prev, value]);
    };

    const reset = () => {
        if (state !== "playing" || status !== "playing") return;
        setSelected([]);
    };

    const checkAnswer = () => {
        if (state !== "playing" || status !== "playing") return;

        if (total === target) {
            onWin();
            return;
        }

        onWrong();
        setSelected([]);
    };

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center w-full text-center py-8">
                <div className="text-4xl mb-3">⏳</div>
                <p className="text-sm font-bold text-slate-600">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center w-full text-center py-6">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-sm font-bold text-red-500 mb-3">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full">
            <p className="text-lg font-bold mb-4">
                สร้างเงินให้ครบ {target} ฿
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-6 max-w-[400px]">
                {money.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => addMoney(Number(item.value))}
                        disabled={state !== "playing" || status !== "playing"}
                        className="
                            group flex items-center justify-center
                            w-28 h-20 rounded-xl transition-all duration-200
                            hover:-translate-y-1 hover:scale-105 active:scale-95
                            disabled:cursor-not-allowed
                        "
                    >
                        <img
                            src={item.image}
                            alt={`${item.value} บาท`}
                            className="
                                max-w-full max-h-full object-contain
                                drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]
                                transition-transform duration-200 group-hover:scale-110
                            "
                        />
                    </button>
                ))}
            </div>

            <div
                className={`
                    w-full max-w-[300px] p-4 rounded-2xl border-4
                    text-center mb-6 transition-all
                    ${state === "wrong"
                        ? "border-red-500 bg-red-100 scale-105"
                        : "border-slate-300 bg-white"
                    }
                `}
            >
                <p className="text-base text-slate-500 font-bold mb-1">จำนวนเงิน</p>
                <p className="text-4xl font-black text-black">{total} ฿</p>
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={reset}
                    disabled={state !== "playing" || status !== "playing"}
                    className="Minigame-button"
                >
                    <span className="button_top">ล้าง</span>
                </button>

                <button
                    type="button"
                    onClick={checkAnswer}
                    disabled={state !== "playing" || status !== "playing"}
                    className="Minigame-button green"
                >
                    <span className="button_top">ยืนยัน</span>
                </button>
            </div>
        </div>
    );
}

// ================= Mini Game 2: Worth =================
function WorthGame({ onWin, onWrong, state }) {
    const [options, setOptions] = useState([]);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchGame = async () => {
            try {
                setStatus("loading");
                setError("");

                const response = await fetch(`${API_URL}/api/hintMinigame/2`);

                if (!response.ok) {
                    throw new Error("ไม่สามารถโหลดข้อมูลมินิเกมได้");
                }

                const data = await response.json();

                if (!data?.options?.length) {
                    throw new Error("ไม่พบข้อมูลตัวเลือกของมินิเกม");
                }

                setOptions(data.options);
                setStatus("playing");
            } catch (err) {
                console.error("Error fetching Worth mini-game:", err);
                setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
                setStatus("error");
            }
        };

        fetchGame();
    }, [API_URL]);

    const check = (option) => {
        if (state !== "playing" || status !== "playing") return;

        if (option.is_correct) {
            onWin();
        } else {
            onWrong();
        }
    };

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center w-full text-center py-8">
                <div className="text-4xl mb-3">⏳</div>
                <p className="text-sm font-bold text-slate-600">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center w-full text-center py-6">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-sm font-bold text-red-500 mb-3">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center">
                <p className="text-lg font-bold text-slate-700">
                    วันนี้มีงบ{" "}
                    <span className="text-blue-600 font-black text-xl">1,000 บาท</span>
                </p>

                <p className="text-sm font-bold text-slate-600 mt-1">
                    ต้องซื้อกระเป๋าสำหรับใส่โน้ตบุ๊กไปมหาวิทยาลัย
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-4 w-full justify-center">
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => check(option)}
                        disabled={state !== "playing" || status !== "playing"}
                        className="
                            flex flex-col items-center justify-center p-3
                            border-4 border-slate-300 rounded-xl bg-white
                            hover:border-gray-500 hover:bg-gray-100
                            active:scale-95 transition-all shadow-sm
                            flex-1 max-w-[120px] overflow-hidden
                            disabled:cursor-not-allowed
                        "
                    >
                        <img
                            src={option.image}
                            alt={option.option_text || `ตัวเลือก ${option.option_key}`}
                            className={`w-full h-full object-contain ${option.option_key === "B"
                                ? "scale-120"
                                : option.option_key === "C"
                                    ? "scale-150"
                                    : ""
                                }`}
                        />
                    </button>
                ))}
            </div>

            {state === "wrong" && (
                <p className="text-red-500 font-bold text-sm text-center">
                    งบไม่พอ หรือไม่เหมาะกับการใช้งานนะ
                    ลองคิดดูใหม่!
                </p>
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
                <button onClick={reset} className="Minigame-button">
                    <span className="button_top">ลองใหม่</span>
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

            <div className="w-full max-w-[400px] bg-white border-4 border-slate-300 rounded-xl p-4 text-center">
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
    const [gameData, setGameData] = useState(null);
    const [step, setStep] = useState(1);
    const [saved, setSaved] = useState(0);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchGame = async () => {
            try {
                setStatus("loading");
                setError("");

                const response = await fetch(`${API_URL}/api/hintMinigame/4`);

                if (!response.ok) {
                    throw new Error("ไม่สามารถโหลดข้อมูลมินิเกมได้");
                }

                const data = await response.json();

                if (!data?.scenarios?.length) {
                    throw new Error("ไม่พบข้อมูลสถานการณ์ของมินิเกม");
                }

                setGameData(data);
                setStep(1);
                setSaved(0);
                setStatus("playing");
            } catch (err) {
                console.error("Error fetching Savings mini-game:", err);
                setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
                setStatus("error");
            }
        };

        fetchGame();
    }, [API_URL]);

    const scenarios = gameData?.scenarios || [];
    const goal = gameData?.target_value ?? 600;
    const totalDays = scenarios.length;
    const dailySaving = totalDays > 0 ? Math.floor(goal / totalDays) : 100;
    const currentScenario = scenarios[step - 1];

    const handleChoice = (option) => {
        if (status !== "playing" || !option) return;

        if (!option.is_correct) {
            setStatus("fail");
            return;
        }

        const newSaved = Math.min(saved + dailySaving, goal);
        setSaved(newSaved);

        if (step >= totalDays) {
            setStatus("result");
        } else {
            setStep((prev) => prev + 1);
        }
    };

    const handleRestart = () => {
        setStep(1);
        setSaved(0);
        setStatus("playing");
    };

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center w-full text-center py-8">
                <div className="text-4xl mb-3">⏳</div>
                <p className="text-sm font-bold text-slate-600">
                    กำลังโหลดข้อมูล...
                </p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center w-full text-center py-4">
                <div className="text-4xl mb-3">⚠️</div>

                <h3 className="text-lg font-black text-red-600 mb-2">
                    โหลดข้อมูลไม่สำเร็จ
                </h3>

                <p className="text-sm font-bold text-slate-600 mb-4">
                    {error}
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="Minigame-button"
                >
                    <span className="button_top">
                        🔄 ลองใหม่
                    </span>
                </button>
            </div>
        );
    }

    // ================= Result =================
    if (status === "result") {
        return (
            <div className="flex flex-col items-center w-full text-center">
                <div className="mb-4">
                    <div className="text-5xl mb-2">🎉</div>

                    <h3 className="text-lg font-black text-[#3D2B1F] mb-2">
                        ภารกิจสำเร็จ!
                    </h3>

                    <p className="text-sm font-bold text-slate-700">
                        คุณสามารถรักษาแผนการออมจนถึงเป้าหมายได้
                    </p>
                </div>

                <div className="w-full max-w-[320px] bg-slate-100 p-4 rounded-xl border-2 border-slate-200 mb-4">
                    <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-slate-600">
                            เงินออม
                        </span>

                        <span className="text-blue-600">
                            {saved.toLocaleString()} /{" "}
                            {goal.toLocaleString()} ฿
                        </span>
                    </div>

                    <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{
                                width: `${Math.min(
                                    (saved / goal) * 100,
                                    100
                                )}%`,
                            }}
                        />
                    </div>

                    <p className="text-xs font-bold text-emerald-600 mt-2">
                        เป้าหมายการออมสำเร็จ 100%
                    </p>
                </div>

                <p className="text-sm font-bold text-emerald-600 mb-4">
                    คุณมีวินัยในการวางแผนและควบคุมการใช้จ่ายได้ดี!
                </p>

                <button
                    onClick={onWin}
                    className="Minigame-button green"
                >
                    <span className="button_top">
                        🔓 ปลดล็อกคำใบ้
                    </span>
                </button>
            </div>
        );
    }

    // ================= Fail =================
    if (status === "fail") {
        return (
            <div className="flex flex-col items-center w-full text-center">
                <div className="text-5xl mb-3">😥</div>

                <h3 className="text-lg font-black text-[#3D2B1F] mb-2">
                    แผนการออมไม่สำเร็จ
                </h3>

                <p className="text-sm font-bold text-rose-500 mb-2">
                    การตัดสินใจครั้งนี้ทำให้คุณไม่สามารถรักษาแผนการออมได้
                </p>

                <p className="text-sm text-slate-600 mb-4">
                    ลองวางแผนการใช้เงินใหม่อีกครั้ง
                </p>

                <button
                    onClick={handleRestart}
                    className="Minigame-button red"
                >
                    <span className="button_top">
                        🔄 เริ่มภารกิจใหม่
                    </span>
                </button>
            </div>
        );
    }

    if (!currentScenario) {
        return (
            <div className="flex flex-col items-center w-full text-center py-6">
                <p className="text-sm font-bold text-red-500">
                    ไม่พบข้อมูลสถานการณ์
                </p>
            </div>
        );
    }

    // ================= Playing =================
    return (
        <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center w-full max-w-[320px]">
                <p className="text-sm font-bold text-slate-500">
                    🎯 เป้าหมาย:
                    <span className="text-slate-800 font-black ml-1">
                        ซื้อหูฟัง {goal.toLocaleString()} ฿
                    </span>
                </p>

                <p className="text-sm font-bold text-slate-600 mt-1">
                    ต้องออมวันละ {dailySaving.toLocaleString()} ฿ เป็นเวลา {totalDays} วัน
                </p>

                <div className="w-full bg-slate-200 h-4 mt-3 rounded-full overflow-hidden border-2 border-slate-300">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{
                            width: `${Math.min(
                                (saved / goal) * 100,
                                100
                            )}%`,
                        }}
                    />
                </div>

                <div className="flex justify-between mt-1">
                    <p className="text-xs font-bold text-blue-600">
                        เงินออม {saved.toLocaleString()} ฿
                    </p>

                    <p className="text-xs font-bold text-slate-500">
                        เป้าหมาย {goal.toLocaleString()} ฿
                    </p>
                </div>
            </div>

            <div className="w-full max-w-[320px] bg-white border-4 border-slate-300 rounded-xl p-4 text-center">
                <h4 className="font-black text-slate-800 mb-3">
                    วันที่ {currentScenario.month_no}
                </h4>

                <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-100 mb-4">
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                        {currentScenario.scenario_text}
                    </p>
                </div>

                <div className="flex flex-col gap-2 w-full">
                    {currentScenario.options.map((option, index) => (
                        <button
                            key={option.id}
                            onClick={() => handleChoice(option)}
                            className="w-full py-3 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-blue-300 text-sm"
                        >
                            {option.option_key || String.fromCharCode(65 + index)}.{" "}
                            {option.option_text}
                        </button>
                    ))}
                </div>

                <p className="text-xs font-bold text-slate-400 mt-4">
                    วันที่ {step} / {totalDays}
                </p>
            </div>
        </div>
    );
}

// ================= Mini Game 5: Needs or Wants =================
function NeedsWantsGame({ onWin }) {
    const [gameData, setGameData] = useState(null);
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchGame = async () => {
            try {
                setStatus("loading");
                setError("");

                const response = await fetch(`${API_URL}/api/hintMinigame/5`);

                if (!response.ok) {
                    throw new Error("ไม่สามารถโหลดข้อมูลมินิเกมได้");
                }

                const data = await response.json();

                if (!data?.scenarios?.length) {
                    throw new Error("ไม่พบข้อมูลสถานการณ์ของมินิเกม");
                }

                setGameData(data);

                const dbItems = data.scenarios
                    .filter((scenario) => scenario.item)
                    .map((scenario) => ({
                        id: scenario.item.items_id,
                        name: scenario.item.name,
                        image: scenario.item.image,
                        price: scenario.options?.find(
                            (option) => option.is_correct
                        )?.amount ?? 0,
                        type: scenario.options?.find(
                            (option) => option.is_correct
                        )?.option_key === "A" ? "need" : "want",
                        bucket: null,
                    }));

                setItems(dbItems);
                setStatus("playing");
            } catch (err) {
                console.error("Error fetching Needs/Wants mini-game:", err);
                setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
                setStatus("error");
            }
        };

        fetchGame();
    }, [API_URL]);

    const assignBucket = (id, bucket) => {
        if (status === "wrong" || status !== "playing") return;

        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, bucket } : item
            )
        );
    };

    const checkWin = () => {
        const allAssigned = items.every((item) => item.bucket !== null);

        if (!allAssigned) return;

        const scenarios = gameData?.scenarios || [];

        const isCorrect = items.every((item) => {
            const scenario = scenarios.find(
                (s) => s.item?.items_id === item.id
            );

            if (!scenario) return false;

            const selectedOption = scenario.options?.find(
                (option) => option.option_key ===
                    (item.bucket === "need" ? "A" : "B")
            );

            return selectedOption?.is_correct === true;
        });

        if (isCorrect) {
            setTimeout(onWin, 500);
        } else {
            setStatus("wrong");

            setTimeout(() => {
                setStatus("playing");
                setItems((prev) =>
                    prev.map((item) => ({ ...item, bucket: null }))
                );
            }, 2000);
        }
    };

    useEffect(() => {
        if (
            status === "playing" &&
            items.length > 0 &&
            items.every((item) => item.bucket !== null)
        ) {
            checkWin();
        }
    }, [items, status]);

    const unassigned = items.filter((item) => item.bucket === null);
    const needs = items.filter((item) => item.bucket === "need");
    const wants = items.filter((item) => item.bucket === "want");
    const currentItem = unassigned[0];

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center w-full text-center py-8">
                <div className="text-4xl mb-3">⏳</div>
                <p className="text-sm font-bold text-slate-600">
                    กำลังโหลดข้อมูล...
                </p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center w-full text-center py-6">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-sm font-bold text-red-500 mb-3">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center w-full max-w-[320px]">
                <p className="text-sm font-bold text-slate-500">
                    วันนี้มีเงินเหลือ{" "}
                    <span className="text-blue-600 font-black">
                        500 ฿
                    </span>
                </p>

                <p className="text-md font-bold text-slate-800">
                    {gameData?.title || "แยกสิ่งที่ควรซื้อก่อน และสิ่งที่รอได้"}
                </p>
            </div>

            {status === "wrong" && (
                <div className="mb-2 w-full max-w-[320px] p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-bold text-center">
                    ยังจัดไม่ถูกนะ ลองคิดดูใหม่ว่าอะไรจำเป็นต้องซื้อจริงๆ!
                </div>
            )}

            {currentItem ? (
                <div className="w-full max-w-[320px] bg-white border-4 border-slate-300 rounded-xl p-4 text-center mb-4 transition-all">
                    <p className="text-xs font-bold text-slate-500 mb-2">
                        เลือกหมวดหมู่ให้ของชิ้นนี้
                    </p>

                    <div className="flex flex-col items-center mb-4">
                        <div className="w-28 h-28 flex items-center justify-center mb-2">
                            <img
                                src={currentItem.image}
                                alt={currentItem.name}
                                className="
                                    w-full h-full object-contain
                                    drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]
                                "
                            />
                        </div>

                        <span className="font-bold text-lg text-slate-700">
                            {currentItem.name}
                        </span>

                        <span className="font-black text-rose-500 text-xl">
                            {currentItem.price.toLocaleString()} ฿
                        </span>
                    </div>

                    <div className="flex gap-2 w-full">
                        <button
                            onClick={() => assignBucket(currentItem.id, "need")}
                            className="flex-1 py-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold rounded-xl active:scale-95 transition-all border-2 border-yellow-300 shadow-sm"
                        >
                            ควรซื้อก่อน
                        </button>

                        <button
                            onClick={() => assignBucket(currentItem.id, "want")}
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
                    <h5 className="text-center font-bold text-yellow-700 text-xs mb-2 border-b-2 border-yellow-200 pb-1">
                        ควรซื้อก่อน
                    </h5>

                    <div className="flex flex-wrap gap-1 justify-center">
                        {needs.map((item) => (
                            <span
                                key={item.id}
                                className="text-xs bg-white px-2 py-1 rounded-md border border-yellow-200 shadow-sm"
                            >
                                {item.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-xl p-2 min-h-[100px]">
                    <h5 className="text-center font-bold text-blue-700 text-xs mb-2 border-b-2 border-blue-200 pb-1">
                        รอได้
                    </h5>

                    <div className="flex flex-wrap gap-1 justify-center">
                        {wants.map((item) => (
                            <span
                                key={item.id}
                                className="text-xs bg-white px-2 py-1 rounded-md border border-blue-200 shadow-sm"
                            >
                                {item.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
