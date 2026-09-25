import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import bgLevel2 from "../../../assets/unit3/level2/bgLevel2.png";
import bonusSound from "../../../assets/sounds/BackgroundGame/Bonus.mp3";
import gameOverSound from "../../../assets/sounds/BackgroundGame/GameOver.mp3";
import useGameMuted from "../../../hooks/useGameMuted";

const API_URL = "http://localhost:5000";
const LEVEL_ID = 9;

// ข้อความ fallback เผื่อยังไม่ได้ insert แถวใน level_result_messages
// หรือดึงข้อมูลไม่สำเร็จ — หน้ายังใช้งานได้ปกติ ไม่ค้างจอเปล่า
const FALLBACK_MESSAGES = {
    PASS: {
        heading: "แยกเงินได้ถูกต้องตามหลักความโปร่งใส",
        message: "คุณแยกเงินส่วนตัวกับเงินชมรมได้ถูกต้องทั้งหมด",
        highlight_text:
            "เงินส่วนตัวและเงินกองกลางต้องแยกกันชัดเจน เพื่อความโปร่งใสและตรวจสอบได้",
    },
    FAIL_WRONG: {
        heading: "พบการปะปนเงินส่วนตัวกับเงินกองกลาง",
        message: "คุณแยกรายการเงินผิดบัญชี ต้องเริ่มภารกิจใหม่",
        highlight_text:
            "เงินส่วนตัวและเงินกองกลางต้องแยกกันชัดเจน เพื่อความโปร่งใสและตรวจสอบได้",
    },
    FAIL_TIMEOUT: {
        heading: "พบการปะปนเงินส่วนตัวกับเงินกองกลาง",
        message: "หมดเวลา คุณต้องเริ่มภารกิจใหม่",
        highlight_text:
            "เงินส่วนตัวและเงินกองกลางต้องแยกกันชัดเจน เพื่อความโปร่งใสและตรวจสอบได้",
    },
};

export default function MoneyResultPage() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const win = state?.win ?? false;
    const score = state?.score ?? 0;
    const wrong = state?.wrong ?? 0;
    const resultStatus =
        state?.resultStatus ??
        (win ? "PASS" : "FAIL_WRONG");
    const total = 11;

    // เสียงผลลัพธ์ เล่นครั้งเดียวตอนเปิดหน้า ไม่วน
    // ผ่าน → Bonus / ไม่ผ่าน (ผิด หรือหมดเวลา) → GameOver
    const [muted] = useGameMuted();

    useEffect(() => {
        if (muted) return;

        const audio = new Audio(win ? bonusSound : gameOverSound);
        audio.volume = 0.6;
        audio.play().catch(() => { });

        // ออกจากหน้านี้แล้วหยุดเสียงทันที
        return () => {
            audio.pause();
            audio.src = "";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ข้อความบรรยายผล (heading / reason / บทเรียนที่ได้รับ) มาจาก
    // level_result_messages ผ่าน /api/level-result/9/:status ทั้งหมด
    // ไม่ hardcode ในไฟล์นี้อีกต่อไป — เริ่มด้วย fallback ของ state.reason
    // (ถ้ามี) หรือ FALLBACK_MESSAGES ระหว่างรอโหลดจาก DB
    const [resultText, setResultText] = useState({
        heading:
            FALLBACK_MESSAGES[resultStatus]?.heading ?? "",
        message:
            state?.reason ??
            FALLBACK_MESSAGES[resultStatus]?.message ??
            "",
        highlight_text:
            FALLBACK_MESSAGES[resultStatus]?.highlight_text ?? "",
    });

    useEffect(() => {
        let isCancelled = false;

        const fetchResultText = async () => {
            try {
                const token =
                    localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/level-result/${LEVEL_ID}/${resultStatus}`,
                    {
                        headers: {
                            "Content-Type":
                                "application/json",
                            ...(token
                                ? {
                                    Authorization: `Bearer ${token}`,
                                }
                                : {}),
                        },
                    }
                );

                if (!response.ok) {
                    return;
                }

                const result = await response.json();
                const data = result.data;

                if (!data || isCancelled) {
                    return;
                }

                setResultText({
                    heading:
                        data.heading ||
                        FALLBACK_MESSAGES[resultStatus]
                            ?.heading ||
                        "",
                    message:
                        data.message ||
                        state?.reason ||
                        FALLBACK_MESSAGES[resultStatus]
                            ?.message ||
                        "",
                    highlight_text:
                        data.highlight_text ||
                        FALLBACK_MESSAGES[resultStatus]
                            ?.highlight_text ||
                        "",
                });
            } catch (error) {
                console.error(
                    "Get Money Game Result Message Error:",
                    error
                );
            }
        };

        fetchResultText();

        return () => {
            isCancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resultStatus]);

    // IP ทั้งหมดคำนวณที่ backend (moneyGameController.completeMoneyGame)
    // จากเวลาจริงใน DB — หน้านี้แค่แสดงผลตรง ๆ ไม่คำนวณเอง
    const baseIP = state?.baseIP ?? 0;
    const speedBonusIP = state?.speedBonusIP ?? 0;
    const isFast = state?.isFast ?? false;
    const elapsedSeconds = state?.elapsedSeconds ?? null;
    const earnedIP = state?.earnedIP ?? 0;
    const totalIntegrityPoints = state?.totalIntegrityPoints ?? null;

    const caseNo = `M2-${String(score).padStart(2, "0")}${String(wrong).padStart(2, "0")}`;
    const today = new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-y-auto p-4 sarabun-medium">
            <style>{`
                @keyframes mrp-stamp-slam {
                    0%   { opacity: 0; transform: translate(-50%, -50%) rotate(-18deg) scale(2.4); }
                    55%  { opacity: 1; transform: translate(-50%, -50%) rotate(-10deg) scale(0.92); }
                    72%  { transform: translate(-50%, -50%) rotate(-13deg) scale(1.04); }
                    100% { opacity: 1; transform: translate(-50%, -50%) rotate(-11deg) scale(1); }
                }
                @keyframes mrp-rise {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes mrp-coin-pop {
                    from { opacity: 0; transform: scale(0.4); }
                    to   { opacity: 1; transform: scale(1); }
                }
                .mrp-stamp {
                    animation: mrp-stamp-slam 0.62s cubic-bezier(.2,.8,.3,1.1) 0.15s both;
                }
                .mrp-rise-1 { animation: mrp-rise 0.5s ease-out 0.05s both; }
                .mrp-rise-2 { animation: mrp-rise 0.5s ease-out 0.2s both; }
                .mrp-rise-3 { animation: mrp-rise 0.5s ease-out 0.35s both; }
                .mrp-coin { animation: mrp-coin-pop 0.35s ease-out both; }

                @media (prefers-reduced-motion: reduce) {
                    .mrp-stamp, .mrp-rise-1, .mrp-rise-2, .mrp-rise-3, .mrp-coin {
                        animation: none !important;
                    }
                }

                .mrp-ledger-lines {
                    background-image: repeating-linear-gradient(
                        to bottom,
                        transparent,
                        transparent 33px,
                        rgba(184, 134, 59, 0.22) 34px
                    );
                }
            `}</style>

            {/* Background */}
            <img
                src={bgLevel2}
                alt=""
                className="absolute inset-0 z-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 z-0 bg-[#0E2318]/80" />

            {/* Report card */}
            <div className="mrp-root relative z-10 w-full max-w-3xl">
                <div
                    className="relative rounded-sm border border-[#B8863B]/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]"
                    style={{
                        background:
                            "linear-gradient(180deg, #FAF4E3 0%, #F5EEDB 100%)",
                    }}
                >
                    {/* double-rule frame, like an official form border */}
                    <div className="pointer-events-none absolute inset-[10px] border border-[#B8863B]/40" />

                    <div className="relative px-7 py-6 sm:px-10 sm:py-7 sarabun-bold">
                        {/* Letterhead */}
                        <div className="mrp-rise-1 flex items-start justify-between gap-4 border-b-2 border-[#1E2A44]/80 pb-3">
                            <div>
                                <p className="mrp-display text-[11px] font-semibold tracking-[0.25em] text-[#B8863B]">
                                    รายงานผลการตรวจสอบ
                                </p>
                                <h1 className="mrp-display text-2xl font-bold text-[#1E2A44] sm:text-3xl">
                                    ภารกิจแยกเงินส่วนตัว–เงินกองกลาง
                                </h1>
                            </div>
                            <div className="shrink-0 text-right text-xs text-[#1E2A44]/70">
                                <p>เลขที่ {caseNo}</p>
                                <p>{today}</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="mrp-ledger-lines relative mt-4 min-h-[80px] pb-2">
                            {/* Stamp */}
                            <div
                                className="mrp-stamp pointer-events-none absolute right-2 top-2 z-10 sm:right-6"
                                style={{ left: "82%", top: "18px" }}
                            >
                                <StampMark win={win} />
                            </div>

                            <div className="mrp-rise-2 max-w-[74%] pr-2 sm:max-w-[68%]">
                                <p
                                    className={`mrp-display text-xl font-bold sm:text-2xl ${win ? "text-[#2E6B4F]" : "text-[#9C2F2F]"
                                        }`}
                                >
                                    {resultText.heading}
                                </p>
                                <p className="mt-3 text-[15px] leading-relaxed text-[#1E2A44]/85">
                                    {resultText.message}
                                </p>
                            </div>
                        </div>

                        {/* Score row, as counted coins out of 11 */}
                        <div className="mrp-rise-2 mt-3 rounded border border-[#1E2A44]/15 bg-white/60 px-5 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="mrp-display text-sm font-semibold tracking-wide text-[#1E2A44]">
                                    คะแนนรวม
                                </p>
                                <p className="mrp-display text-lg font-bold text-[#1E2A44]">
                                    {score}
                                    <span className="text-[#1E2A44]/50"> / {total}</span>
                                </p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {Array.from({ length: total }).map((_, i) => (
                                    <span
                                        key={i}
                                        className="mrp-coin flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                                        style={{
                                            animationDelay: `${0.4 + i * 0.03}s`,
                                            background:
                                                i < score
                                                    ? "radial-gradient(circle at 32% 28%, #F3D68A, #B8863B 70%)"
                                                    : "#E4DBC3",
                                            color: i < score ? "#5B3E12" : "#B9AC85",
                                            border: `1px solid ${i < score ? "#8F651F" : "#CBBE96"}`,
                                        }}
                                    >
                                        ฿
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* IP breakdown — เฉพาะตอนผ่านด่านเท่านั้น */}
                        {win && (
                            <div className="mrp-rise-2 mt-3 rounded border border-[#1E2A44]/15 bg-white/60 px-5 py-3">
                                <p className="mrp-display text-sm font-semibold tracking-wide text-[#1E2A44]">
                                    IP ที่ได้รับ
                                </p>
                                <div className="mt-2 space-y-1.5 text-sm text-[#1E2A44]/85">
                                    <div className="flex items-center justify-between">
                                        <span>ผ่านภารกิจ</span>
                                        <span className="font-semibold">+{baseIP} IP</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>
                                            ทำภารกิจภายใน 30 วินาที
                                            {elapsedSeconds !== null
                                                ? ` (ใช้เวลา ${elapsedSeconds} วินาที)`
                                                : ""}
                                        </span>
                                        <span
                                            className={`font-semibold ${isFast ? "" : "text-[#1E2A44]/40"
                                                }`}
                                        >
                                            {isFast
                                                ? `+${speedBonusIP} IP`
                                                : "ไม่ได้รับ"}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between border-t border-[#1E2A44]/15 pt-2">
                                    <span className="mrp-display text-sm font-semibold text-[#1E2A44]">
                                        ได้ IP ทั้งหมด
                                    </span>
                                    <span className="mrp-display text-lg font-bold text-[#2E6B4F]">
                                        +{earnedIP}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Lesson note, pinned like an attached memo */}
                        <div className="mrp-rise-3 relative mt-3 rounded-sm bg-[#FCEEA5]/90 px-5 py-2.5 shadow-[2px_3px_10px_rgba(0,0,0,0.15)]">
                            <div className="absolute -top-2 left-6 h-4 w-8 rotate-[-4deg] rounded-sm bg-[#D9CBA3]/80" />
                            <p className="mrp-display text-xs font-semibold tracking-[0.2em] text-[#7A5A12]">
                                หมายเหตุ · บทเรียนที่ได้รับ
                            </p>
                            <p className="mt-1 text-[15px] font-medium leading-relaxed text-[#4A3B10]">
                                {resultText.highlight_text}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mrp-rise-3 mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button
                                onClick={() => navigate("/map")}
                                className="result-button result-button-yellow"
                            >
                                <span className="result-button-top">กลับหน้าหลัก</span>
                            </button>

                            {win ? (
                                <button
                                    onClick={() => navigate("/unit3/final/start")}
                                    className="result-button result-button-green"
                                >
                                    <span className="result-button-top">ด่านถัดไป</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate("/unit3/level2/game")}
                                    className="result-button result-button-red"
                                >
                                    <span className="result-button-top">เล่นอีกครั้ง</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function StampMark({ win }) {
    const color = win ? "#2E6B4F" : "#9C2F2F";
    const label = win ? "ผ่านการตรวจสอบ" : "ไม่ผ่านการตรวจสอบ";
    const id = win ? "mrp-rough-pass" : "mrp-rough-fail";

    return (
        <svg
            width="150"
            height="150"
            viewBox="0 0 150 150"
            className="opacity-90"
            style={{ filter: `drop-shadow(0 2px 3px rgba(0,0,0,0.25))` }}
        >
            <defs>
                <filter id={id}>
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.045"
                        numOctaves="2"
                        result="noise"
                    />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
                </filter>
            </defs>
            <g filter={`url(#${id})`} stroke={color} fill="none">
                <circle cx="75" cy="75" r="66" strokeWidth="4" />
                <circle cx="75" cy="75" r="56" strokeWidth="1.5" />
                <text
                    x="75"
                    y="66"
                    textAnchor="middle"
                    fontFamily="Prompt, sans-serif"
                    fontWeight="700"
                    fontSize="15"
                    fill={color}
                    stroke="none"
                >
                    {win ? "PASSED" : "FAILED"}
                </text>
                <text
                    x="75"
                    y="93"
                    textAnchor="middle"
                    fontFamily="Sarabun, sans-serif"
                    fontWeight="700"
                    fontSize="12.5"
                    fill={color}
                    stroke="none"
                >
                    {label}
                </text>
            </g>
        </svg>
    );
}