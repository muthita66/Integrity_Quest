import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import bgGameLevel1 from "../../../assets/unit3/level1/bgGameLevel1.png";
import ResultPass from "../../../assets/unit3/level1/resultPass.png";
import bonusSound from "../../../assets/sounds/BackgroundGame/Bonus.mp3";
import useGameMuted from "../../../hooks/useGameMuted";

import ConfettiBurst from "./components/ConfettiBurst";

import "../../../styles/unit3/level1/resultAnimation.css";

export default function ResultPage() {
    const navigate = useNavigate();
    const { state } = useLocation();

    // =========================
    // ข้อมูลผลลัพธ์จากด่าน
    // =========================
    const found = state?.found ?? 8;
    const wrong = state?.wrong ?? 0;
    const timeLeft = state?.timeLeft ?? 0;

    // =========================
    // ตั้งค่าเวลา
    // =========================
    const MAX_TIME = 60;

    // เวลาที่ใช้จริง — เดิมคำนวณจาก MAX_TIME - timeLeft (นาฬิกาฝั่ง
    // client) ตอนนี้ใช้ elapsedSeconds ที่ backend คำนวณจริงจาก
    // started_at/completed_at ของ game_play_history เป็นหลักแทน
    // (เหลือ fallback ไว้กรณี state เก่าที่ยังไม่มีค่านี้)
    const timeUsed =
        state?.elapsedSeconds ?? (MAX_TIME - timeLeft);

    // =========================
    // คะแนนพิเศษ (IP) — เดิมคำนวณเองในหน้านี้จาก timeUsed/wrong
    // ที่ผ่าน state มาตรงๆ ไม่เคยถูกตรวจกับ DB เลย ตอนนี้รับค่าที่
    // backend (completeReceiptHunt) คำนวณจริงจากเวลา/wrong_count
    // ใน DB มาแสดงผลอย่างเดียว ไม่คำนวณเองในหน้านี้อีกต่อไป
    // =========================
    const isFast = state?.isFast ?? false;
    const isFlawless = state?.isFlawless ?? false;

    const baseIP = state?.baseIP ?? 0;
    const speedBonusIP = state?.speedBonusIP ?? 0;
    const noWrongBonusIP = state?.noWrongBonusIP ?? 0;
    const earnedIP = state?.earnedIP ?? 0;
    const totalIntegrityPoints =
        state?.totalIntegrityPoints ?? 0;

    // =========================
    // Animation — เดิมมีทั้ง paper-rise + paper-shake ต่อกัน และทุก
    // บรรทัดในกระดาษ (หัวข้อ, เส้นแบ่ง, สถิติแต่ละแถว, กล่อง IP,
    // ข้อความสรุป, ปุ่ม) มี animation ไล่ delay ของตัวเองแยกกันหมด
    // (8 จุด) ทำให้ดูรกและกว่าจะอ่านเนื้อหาได้ครบต้องรอนาน ตัดเหลือ
    // แค่กระดาษ fade+rise เข้ามาครั้งเดียว เนื้อหาข้างในโชว์พร้อมกัน
    // ทันที ส่วนตราปั๊ม "สำเร็จ" ยังคง pop ครั้งเดียวไว้เป็นจุดเน้น
    // =========================
    const [showConfetti, setShowConfetti] = useState(true);
    const [showPaper, setShowPaper] = useState(false);
    const [showStamp, setShowStamp] = useState(false);

    // =========================
    // เสียง Bonus เล่นครั้งเดียวตอนเปิดหน้า ไม่วน
    // =========================
    const [muted] = useGameMuted();

    useEffect(() => {
        if (muted) return;

        const audio = new Audio(bonusSound);
        audio.volume = 0.6;
        audio.play().catch(() => { });

        // ออกจากหน้านี้แล้วหยุดเสียงทันที
        return () => {
            audio.pause();
            audio.src = "";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================
    // สถิติ
    // =========================
    const stats = [
        {
            label: "เอกสารที่พบ",
            value: `${found}/8`,
            color: "#2F6B4F",
        },
        {
            label: "กดผิด",
            value: `${wrong}/3`,
            color: "#A63D2F",
        },
        {
            label: "เวลาเหลือ",
            value: `${timeLeft}s`,
            color: "#B4802E",
        },
    ];

    // =========================
    // Animation Timeline
    // =========================
    useEffect(() => {
        const t1 = setTimeout(() => setShowPaper(true), 200);
        const t2 = setTimeout(() => setShowStamp(true), 700);
        const t3 = setTimeout(() => setShowConfetti(false), 2000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    return (
        <div className="fixed inset-0 w-screen h-screen font-sara overflow-hidden touch-none overscroll-none sarabun-bold">

            {/* =========================================
                ฉากหลัง
            ========================================= */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 blur-[2px]"
                style={{
                    backgroundImage: `url(${bgGameLevel1})`,
                }}
            />

            <div className="absolute inset-0 bg-[#14100b]/70" />

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0c0906_85%)]" />

            {/* พลุตรงกลางจอ */}
            {showConfetti && <ConfettiBurst />}

            {/* กึ่งกลางจอ */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-6">

                {/* กระดาษ */}
                <div
                    className="relative w-full max-w-xl"
                    style={{
                        filter: "drop-shadow(0 20px 35px rgba(0,0,0,0.55))",
                        opacity: showPaper ? 1 : 0,
                        animation: showPaper
                            ? "paper-rise 0.6s cubic-bezier(0.22,1,0.36,1) forwards"
                            : "none",
                    }}
                >

                    {/* ใบเสร็จ */}
                    <div
                        className="relative pt-12 px-7 pb-12"
                        style={{
                            background: `
                                repeating-linear-gradient(
                                    0deg,
                                    rgba(0,0,0,0.015) 0px,
                                    rgba(0,0,0,0.015) 1px,
                                    transparent 1px,
                                    transparent 3px
                                ),
                                #F8F3E3
                            `,

                            border: "2px solid #000000",

                            borderTopLeftRadius: "0.75em",
                            borderTopRightRadius: "0.75em",
                            borderBottomLeftRadius: "0.75em",
                            borderBottomRightRadius: "0.75em",

                            boxShadow: "0px 6px 0px 0px #000000",
                        }}
                    >
                        <div className="text-center mb-4">
                            <p
                                className="text-[40px] font-bold"
                                style={{
                                    color: "#B4802E",
                                }}
                            >
                                ภารกิจสำเร็จ
                            </p>

                            <h1
                                className="text-2xl font-black mt-1"
                                style={{
                                    color: "#2B2118",
                                }}
                            >
                                ตามหาใบเสร็จ
                            </h1>
                        </div>

                        {/* เส้นแบ่ง */}
                        <div
                            className="border-t-2 border-dashed mb-4"
                            style={{
                                borderColor: "#c9b48f",
                            }}
                        />

                        {/* รายการสถิติ */}
                        <div className="flex flex-col gap-2.5 mb-4">
                            {stats.map((s) => (
                                <div
                                    key={s.label}
                                    className="flex items-baseline justify-between gap-3"
                                >
                                    <span
                                        className="text-base font-bold whitespace-nowrap"
                                        style={{
                                            color: "#2B2118",
                                        }}
                                    >
                                        {s.label}
                                    </span>

                                    <span
                                        className="flex-1 border-b border-dotted mb-1"
                                        style={{
                                            borderColor: "#c9b48f",
                                        }}
                                    />

                                    <span
                                        className="font-mono font-bold tracking-wider text-base whitespace-nowrap"
                                        style={{
                                            color: s.color,
                                        }}
                                    >
                                        {s.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* เส้นแบ่งก่อนคะแนนพิเศษ */}
                        <div
                            className="border-t-2 border-dashed mb-4"
                            style={{
                                borderColor: "#c9b48f",
                            }}
                        />

                        {/* คะแนน IP — เดิมมีทั้งหัวข้อป้าย emoji, ไอคอนใหญ่
                            สองไอคอน, และข้อความ "กดผิด: X ครั้ง" ที่ซ้ำกับ
                            สถิติด้านบนไปแล้ว (เอกสารที่พบ/กดผิด/เวลาเหลือ)
                            ตัดออกให้เหลือแค่รายการ base + bonus แต่ละบรรทัด
                            แล้วรวมยอดท้ายสุด ไม่ต้องพูดซ้ำ */}
                        <div className="relative rounded-2xl border-2 border-green-300 bg-green-50/80 px-4 py-3 mb-4">

                            {/* ป้ายหัวข้อ */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                <div className="bg-green-600 text-white px-6 py-1 rounded-lg font-black text-lg shadow-md whitespace-nowrap">
                                    คะแนนพิเศษ
                                </div>
                            </div>

                            {/* รายการ IP: พื้นฐาน + โบนัสแต่ละอย่าง */}
                            <div className="flex flex-col gap-2 pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-[#2B2118]">
                                        ผ่านภารกิจ
                                    </span>
                                    <span className="text-sm font-black text-green-700">
                                        +{baseIP} IP
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-[#2B2118]">
                                            ทำภารกิจภายใน 30 วินาที
                                        </p>
                                        <p className="text-xs text-[#5f5548]">
                                            ใช้เวลา {timeUsed} วินาที
                                        </p>
                                    </div>

                                    {isFast ? (
                                        <span className="text-sm font-black text-green-700 shrink-0">
                                            +{speedBonusIP} IP
                                        </span>
                                    ) : (
                                        <span className="text-sm font-bold text-gray-500 shrink-0">
                                            ไม่ได้รับ
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-[#2B2118]">
                                        ไม่เคยกดผิดเลย
                                    </span>

                                    {isFlawless ? (
                                        <span className="text-sm font-black text-green-700 shrink-0">
                                            +{noWrongBonusIP} IP
                                        </span>
                                    ) : (
                                        <span className="text-sm font-bold text-gray-500 shrink-0">
                                            ไม่ได้รับ
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* IP รวมที่ได้จากภารกิจนี้ */}
                            <div className="text-center mt-3 pt-2 border-t border-green-200">
                                <span className="text-base font-black text-green-700">
                                    ได้ IP ทั้งหมด +{earnedIP}
                                </span>
                            </div>

                        </div>

                        {/* ข้อความสรุป */}
                        <p
                            className="text-base leading-start text-center mb-1"
                            style={{
                                color: "#4a4033",
                            }}
                        >
                            ตามใบเสร็จครบแล้ว ควรเก็บหลักฐานทุกครั้งที่ใช้เงินกองกลาง
                        </p>

                        {/* เส้นแบ่ง */}
                        <div
                            className="border-t-2 border-dashed mt-4 mb-5"
                            style={{
                                borderColor: "#c9b48f",
                            }}
                        />

                        {/* ปุ่ม */}
                        <div className="flex justify-center items-center gap-3">
                            {/* กลับหน้าหลัก */}
                            <button
                                onClick={() => navigate("/map")}
                                className="result-button result-button-yellow"
                            >
                                <span className="result-button-top">
                                    กลับหน้าหลัก
                                </span>
                            </button>

                            {/* ด่านต่อไป */}
                            <button
                                onClick={() =>
                                    navigate("/unit3/level2/intro")
                                }
                                className="result-button result-button-green"
                            >
                                <span className="result-button-top">
                                    ด่านต่อไป
                                </span>
                            </button>
                        </div>

                    </div>
                </div>

                {/* ตราปั๊มหมึก "สำเร็จ" */}
                {showStamp && (
                    <div
                        className="absolute top-2 right-100 z-20 select-none"
                        style={{
                            animation: "stamp-pop 0.55s ease-out both",
                        }}
                    >
                        <div
                            className="w-40 h-40 rounded-full border-[3px] flex flex-col items-center justify-center gap-0.5 bg-[#F8F3E3]/90"
                            style={{
                                borderColor: "#2F6B4F",
                                mixBlendMode: "multiply",
                            }}
                        >
                            <div
                                className="w-[150px] h-[150px] rounded-full border border-dashed flex flex-col items-center justify-center"
                                style={{
                                    borderColor: "#2F6B4F",
                                }}
                            >
                                <img
                                    src={ResultPass}
                                    alt=""
                                    className="w-36 h-36 rounded-full object-cover mb-0.5 opacity-90"
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}