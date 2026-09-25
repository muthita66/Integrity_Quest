import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegClock, FaStopwatch, FaLightbulb } from "react-icons/fa";

import gameOverSound from "../../../assets/sounds/BackgroundGame/GameOver.mp3";
import useGameMuted from "../../../hooks/useGameMuted";

import "../../../styles/unit2/components/debrief.css";
import "../../../styles/unit2/button/level1/button.css";
import SceneResult from "../../../assets/unit2/FinalLevel/Result/sceneResult.png";

// ============================================================
// Unit 2 FinalLevel — หน้า "หมดเวลา"
// ------------------------------------------------------------
// หน้าตาเดียวกับ ResultPage (กระดาษรายงาน MISSION DEBRIEF)
// แต่โทนแดง: ฉากหลังแดง / ตรายาง TIME OUT / ข้อที่ยังไม่ได้ตอบเป็นสีแดง
//
// props ชุดเดียวกับ ResultPage (ใช้แค่บางตัว)
//   MISSIONS, userChoices, money, totalCorrect
// ============================================================

const RED = "#B42318";
const RED_DARK = "#7A1A12";

export default function TimeoutPage({
    MISSIONS = [],
    userChoices = [],
    money = 0,
    totalCorrect = 0,
}) {
    const navigate = useNavigate();
    const [muted] = useGameMuted();

    // เสียง GameOver เล่นครั้งเดียวตอนเปิดหน้า ไม่วน
    useEffect(() => {
        if (muted) return;

        const audio = new Audio(gameOverSound);
        audio.volume = 0.6;
        audio.play().catch(() => { });

        // ออกจากหน้านี้ (กลับหน้าหลัก / ลองอีกครั้ง) แล้วหยุดเสียงทันที
        return () => {
            audio.pause();
            audio.src = "";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const total = MISSIONS.length;
    const answered = userChoices.length;
    const remaining = Math.max(total - answered, 0);
    const answeredPercent = total ? Math.round((answered / total) * 100) : 0;

    return (
        <div
            className="h-[100dvh] w-full flex flex-col items-center justify-center px-4 py-8 md:py-12 relative bg-cover bg-top overflow-hidden sarabun-bold"
            style={{ backgroundImage: `url(${SceneResult})` }}
        >
            {/* ฉากหลังโทนแดง (แทน scrim สีน้ำตาลของหน้าสรุปผลปกติ) */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(90,10,10,0.35) 0%, rgba(70,8,8,0.7) 60%, rgba(35,4,4,0.88) 100%)",
                }}
            />

            {/* แสงแดงกะพริบเบา ๆ รอบขอบจอ = สัญญาณเตือน */}
            <div
                className="pointer-events-none absolute inset-0 animate-pulse"
                style={{ boxShadow: "inset 0 0 120px 30px rgba(220,38,38,0.35)" }}
            />

            <div
                className="w-full max-w-2xl h-full relative my-auto flex flex-col"
                style={{ transform: "rotate(-0.6deg)" }}
            >
                <div
                    className="paper-tape"
                    style={{ top: "-14px", left: "38%", width: "110px", height: "26px", transform: "rotate(-3deg)" }}
                />

                <div
                    className="debrief-paper rounded-sm px-6 md:px-10 py-6 md:py-8 text-[#2A2620] flex flex-col h-full shadow-2xl"
                    style={{ overflow: "visible", borderTop: `8px solid ${RED}` }}
                >
                    {/* ================= HEADER ================= */}
                    <div className="flex items-start justify-between gap-4 shrink-0">
                        <div className="flex-1">
                            <p className="font-stamp text-sm tracking-[0.3em] text-[#8C806A] mb-1">
                                MISSION DEBRIEF
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                                <span
                                    className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full"
                                    style={{
                                        background: "rgba(180,35,24,0.12)",
                                        border: `3px solid ${RED}`,
                                        color: RED,
                                    }}
                                >
                                    <FaRegClock className="text-3xl md:text-4xl" />
                                </span>
                                <div>
                                    <h1
                                        className="font-thai text-3xl md:text-4xl font-black leading-tight"
                                        style={{ color: RED }}
                                    >
                                        หมดเวลา!
                                    </h1>
                                    <p className="font-thai text-xs md:text-sm text-[#5B5340] mt-1">
                                        เวลาหมดก่อนตัดสินใจครบทุกสถานการณ์ ภารกิจนี้ยังไม่สำเร็จ
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ตรายาง */}
                        <div
                            className="stamp-mark font-stamp shrink-0 px-3 py-2 text-center leading-none"
                            style={{ color: RED, transform: "rotate(6deg)" }}
                        >
                            <span className="block text-xl md:text-3xl font-bold tracking-widest">
                                TIME OUT
                            </span>
                            <span className="block text-[10px] md:text-[11px] tracking-[0.25em] mt-1 opacity-80">
                                MISSION FAILED
                            </span>
                        </div>
                    </div>

                    {/* ================= สรุปตัวเลข ================= */}
                    <div className="mt-5 grid grid-cols-3 gap-2 md:gap-3 shrink-0">
                        <div className="rounded-md border-2 px-2 py-2 text-center" style={{ borderColor: RED, background: "rgba(180,35,24,0.08)" }}>
                            <p className="font-ledger text-xl md:text-2xl font-bold" style={{ color: RED }}>
                                {answered}/{total}
                            </p>
                            <p className="font-thai text-[11px] md:text-xs text-[#5B5340]">ตัดสินใจแล้ว</p>
                        </div>
                        <div className="rounded-md border-2 border-[#CFC4A8] bg-[#F4EEDD] px-2 py-2 text-center">
                            <p className="font-ledger text-xl md:text-2xl font-bold text-[#3B362C]">
                                {Number(money).toLocaleString()} ฿
                            </p>
                            <p className="font-thai text-[11px] md:text-xs text-[#5B5340]">เงินคงเหลือ</p>
                        </div>
                        <div className="rounded-md border-2 border-[#CFC4A8] bg-[#F4EEDD] px-2 py-2 text-center">
                            <p className="font-ledger text-xl md:text-2xl font-bold text-[#8C806A]">+0 IP</p>
                            <p className="font-thai text-[11px] md:text-xs text-[#5B5340]">คะแนนรอบนี้</p>
                        </div>
                    </div>

                    {/* ================= DECISION LOG ================= */}
                    <div className="mt-5 flex-1 min-h-0 flex flex-col">
                        <p className="font-stamp text-[11px] tracking-[0.25em] text-[#8C806A] mb-1 shrink-0">
                            DECISION LOG
                        </p>
                        <div className="perforation perforation-top shrink-0" />
                        <div className="bg-[#EDE6D2] flex-1 overflow-y-auto receipt-scroll px-1 md:px-3">
                            {MISSIONS.map((m, i) => {
                                const userAns = userChoices.find((c) => c.missionId === m.id);
                                const skipped = !userAns;
                                const correct = userAns?.isCorrect ?? false;

                                const tagColor = skipped ? RED : correct ? "#2F6B4F" : "#A8412C";
                                const tagLabel = skipped ? "หมดเวลา" : correct ? "ถูกต้อง" : "ยังไม่คุ้มค่า";

                                return (
                                    <div
                                        key={m.id}
                                        className="flex items-start gap-3 py-2.5 ledger-row font-thai text-sm md:text-base"
                                        style={skipped ? { background: "rgba(180,35,24,0.06)" } : undefined}
                                    >
                                        <span className="font-ledger text-[#8C806A] text-xs md:text-sm pt-0.5 shrink-0">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`font-bold ${skipped ? "text-[#8C806A]" : "text-[#3B362C]"}`}>
                                                    {m.phase}
                                                </span>
                                                <span
                                                    className="font-stamp inline-flex items-center gap-1 text-[11px] md:text-xs tracking-wide shrink-0"
                                                    style={{ color: tagColor }}
                                                >
                                                    {skipped && <FaStopwatch />}
                                                    {tagLabel}
                                                </span>
                                            </div>
                                            <p className="text-xs md:text-sm text-[#8C806A] mt-1">{m.situation}</p>
                                            <p className="text-xs md:text-sm font-semibold text-[#5B5340] mt-1.5">
                                                เลือก:{" "}
                                                {skipped ? (
                                                    <span className="font-bold" style={{ color: RED }}>
                                                        หมดเวลาก่อนถึงข้อนี้
                                                    </span>
                                                ) : (
                                                    userAns.text
                                                )}
                                            </p>
                                            {userAns?.feedback && (
                                                <p className="text-xs md:text-sm italic text-[#8C806A] mt-1">
                                                    วิเคราะห์: {userAns.feedback}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="perforation shrink-0" />
                    </div>

                    {/* เคล็ดลับ */}
                    <div
                        className="mt-4 shrink-0 flex items-start gap-2 rounded-md border-l-4 px-3 py-2 font-thai text-xs md:text-sm"
                        style={{ borderColor: RED, background: "rgba(180,35,24,0.08)", color: RED_DARK }}
                    >
                        <FaLightbulb className="mt-0.5 shrink-0 text-sm md:text-base" style={{ color: "#D97706" }} />
                        <span>
                            ภารกิจนี้มีเวลาจำกัด ลองอ่านสถานการณ์แล้วตัดสินใจให้เร็วขึ้น
                            โดยยังคิดถึงความคุ้มค่าของเงินทุกบาท
                        </span>
                    </div>

                    {/* ================= ACTIONS ================= */}
                    <div
                        className="flex flex-wrap gap-4 justify-center mt-8 shrink-0 pb-6 min-h-[80px]"
                        style={{ position: "relative", zIndex: 1, overflow: "visible" }}
                    >
                        <button onClick={() => navigate("/map")} className="button-finish-game gray">
                            <span className="button-finish-game-top">กลับหน้าหลัก</span>
                            <span className="button-finish-game-bottom"></span>
                            <span className="button-finish-game-base"></span>
                        </button>

                        <button
                            onClick={() => navigate("/unit2/final/introMission")}
                            className="button-finish-game red"
                        >
                            <span className="button-finish-game-top">ลองอีกครั้ง</span>
                            <span className="button-finish-game-bottom"></span>
                            <span className="button-finish-game-base"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}