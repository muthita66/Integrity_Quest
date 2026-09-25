import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stamp, Receipt, Coins, ScrollText, BadgeCheck, BadgeX, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SummaryPanel from "./SummaryPanel";

import bonusSound from "../../../../assets/sounds/BackgroundGame/Bonus.mp3";
import gameOverSound from "../../../../assets/sounds/BackgroundGame/GameOver.mp3";
import useGameMuted from "../../../../hooks/useGameMuted";

const INK = "#2B2A24";
const PAPER = "#F4EEDB";
const PAPER_DARK = "#E7DCB8";
const LINE = "#C9B98C";
const CAMP_GREEN = "#2F5233";
const BRASS = "#A9822C";
const STAMP_RED = "#A63A2E";
const STAMP_GREEN = "#2F6B3E";

export default function ResultModal({ finished, result, resetGame }) {
    const navigate = useNavigate();
    const [muted] = useGameMuted();

    const isOpen = Boolean(finished && result);
    const isSuccess = Boolean(result?.success);

    // เสียงผลลัพธ์ เล่นครั้งเดียวตอนหน้าสรุปขึ้นมา ไม่วน
    // ผ่าน → Bonus / ไม่ผ่าน → GameOver
    // (hook ต้องอยู่ก่อน return null ตามกฎของ React)
    useEffect(() => {
        if (!isOpen || muted) return;

        const audio = new Audio(isSuccess ? bonusSound : gameOverSound);
        audio.volume = 0.6;
        audio.play().catch(() => { });

        // กดเล่นอีกครั้ง / ออกจากหน้า แล้วหยุดเสียงทันที
        return () => {
            audio.pause();
            audio.src = "";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const formatTime = (seconds = 0) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // คะแนนเต็ม 15 — 5 เงื่อนไข x 3 คะแนนเท่ากัน (ต้องตรงกับ
    // finalLevelController.js: MAX_SCORE / POINTS_PER_CRITERION)
    const POINTS_PER_CRITERION = 3;
    const MAX_SCORE = result.maxScore ?? 15;
    const unnecessaryPenalty = Math.min(result.unnecessaryCount, POINTS_PER_CRITERION);
    const minReserve = result.minReserve ?? 1000;

    const ledgerRows = [
        // ต้องซื้อของจำเป็นครบก่อนถึงจะกด "จบเกม" ได้ (backend เช็คบังคับ
        // ใน completeTreasurerGame) เลยเป็น true เสมอถ้ามาถึงหน้านี้
        { label: "ซื้อของจำเป็นครบ", value: `+${POINTS_PER_CRITERION}`, positive: true },
        {
            label: "เก็บใบเสร็จครบ",
            value: result.missingReceipt ? "+0" : `+${POINTS_PER_CRITERION}`,
            positive: !result.missingReceipt,
        },
        {
            label: "ไม่ติดลบ",
            value: result.balance >= 0 ? `+${POINTS_PER_CRITERION}` : "+0",
            positive: result.balance >= 0,
        },
        {
            label: `เงินสำรอง ≥ ${minReserve.toLocaleString("th-TH")} บาท`,
            value: result.balance >= minReserve ? `+${POINTS_PER_CRITERION}` : "+0",
            positive: result.balance >= minReserve,
        },
        {
            label: `ของไม่จำเป็น (${result.unnecessaryCount} รายการ)`,
            value: `-${unnecessaryPenalty}`,
            positive: false,
            isDeduction: true,
        },
        {
            label: "โบนัสไม่ซื้อของไม่จำเป็น",
            value: result.unnecessaryCount === 0 ? `+${POINTS_PER_CRITERION}` : "+0",
            positive: result.unnecessaryCount === 0,
        },
    ];

    // ----- IP: ต้อง success ก่อนถึงนับ (ดู finalLevelController.js) -----
    // baseIP = เงื่อนไขละ 1 IP (สูงสุด 5), timeBonusIP = ทันเวลา +1 IP
    // ใช้ earnedIP (ผลรวมจริงจาก backend) เป็นตัวตัดสินการแสดงผล
    // ไม่ใช้ hpBonus/isFast เฉย ๆ เพราะทันเวลาอย่างเดียวไม่พอ ต้อง
    // success ด้วยถึงจะได้ IP จริง (ไม่งั้นภารกิจ FAILED แต่ทันเวลา
    // จะขึ้นข้อความหลอกว่าได้ IP ทั้งที่ไม่ได้)
    const baseIP = result.baseIP ?? 0;
    const timeBonusIP = result.timeBonusIP ?? 0;
    const earnedIP = result.earnedIP ?? 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 py-10"
                style={{
                    background:
                        "radial-gradient(circle at 50% 20%, rgba(60,50,30,0.55), rgba(10,10,8,0.88))",
                }}
            >
                <motion.div
                    initial={{ scale: 0.85, y: 40, rotate: -1 }}
                    animate={{ scale: 1, y: 0, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="relative w-full max-w-5xl overflow-hidden rounded-sm shadow-2xl"
                    style={{
                        background: PAPER,
                        border: `1px solid ${LINE}`,
                        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                    }}
                >
                    {/* torn / perforated top edge */}
                    <div
                        className="h-3 w-full"
                        style={{
                            backgroundImage: `radial-gradient(circle, ${PAPER_DARK} 3px, transparent 3.5px)`,
                            backgroundSize: "14px 14px",
                            backgroundPosition: "0 -6px",
                            backgroundColor: INK,
                        }}
                    />

                    {/* rotated audit stamp badge */}
                    <motion.div
                        initial={{ scale: 0, rotate: -25, opacity: 0 }}
                        animate={{ scale: 1, rotate: -12, opacity: 1 }}
                        transition={{ delay: 0.35, type: "spring", stiffness: 200, damping: 12 }}
                        className="absolute right-5 top-16 sm:right-8 sm:top-14 flex h-24 w-24 sm:h-28 sm:w-28 select-none items-center justify-center rounded-full text-center"
                        style={{
                            border: `3px solid ${result.success ? STAMP_GREEN : STAMP_RED}`,
                            color: result.success ? STAMP_GREEN : STAMP_RED,
                            boxShadow: `0 0 0 3px ${PAPER}, 0 0 0 4px ${result.success ? STAMP_GREEN : STAMP_RED}`,
                            mixBlendMode: "multiply",
                        }}
                    >
                        <div className="leading-tight">
                            {result.success ? (
                                <BadgeCheck size={22} className="mx-auto mb-0.5" />
                            ) : (
                                <BadgeX size={22} className="mx-auto mb-0.5" />
                            )}
                            <p className="text-[11px] font-black tracking-wide">
                                {result.success ? "ตรวจสอบแล้ว" : "ตีกลับ"}
                            </p>
                            <p className="text-[9px] font-bold">เหรัญญิกค่าย</p>
                        </div>
                    </motion.div>

                    {/* header — ledger masthead */}
                    <div
                        className="px-6 pb-5 pt-6 sm:px-8"
                        style={{ borderBottom: `2px dashed ${LINE}` }}
                    >
                        <h2
                            className="mt-0 max-w-[75%] text-2xl font-black leading-tight sm:text-3xl"
                            style={{ color: INK }}
                        >
                            ภารกิจเหรัญญิกค่าย: {result.success ? "ปิดบัญชีสำเร็จ" : "บัญชีไม่ผ่านการตรวจ"}
                        </h2>
                        <p className="mt-2 max-w-[80%] text-sm font-bold" style={{ color: "#5b5646" }}>
                            {result.success
                                ? "คุณทำหน้าที่เหรัญญิกได้ยอดเยี่ยม โปร่งใสและมีประสิทธิภาพ"
                                : "ยังมีข้อผิดพลาดในการทำบัญชีหรือการใช้จ่าย ตรวจทานแล้วลองยื่นใหม่"}
                        </p>
                    </div>

                    <div className="px-6 py-6 sm:px-8 max-h-[calc(100vh-8rem)] overflow-y-auto sm:max-h-none sm:overflow-visible">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-stretch">
                            {/* left column */}
                            <div className="flex h-full flex-col gap-5">
                                <SummaryPanel result={result} />

                                {/* score ledger */}
                                <div
                                    className="rounded-sm p-4"
                                    style={{ background: PAPER_DARK, border: `1px solid ${LINE}` }}
                                >
                                    <div className="mb-2 flex items-center gap-2 text-sm font-black" style={{ color: CAMP_GREEN }}>
                                        <Coins size={18} />
                                        <span>สรุปคะแนนตรวจบัญชี</span>
                                    </div>
                                    <div className="flex items-baseline justify-between border-b" style={{ borderColor: LINE }}>
                                        <span className="font-bold" style={{ color: INK }}>คะแนนรวม</span>
                                        <span className="font-mono text-2xl font-black" style={{ color: INK }}>
                                            {result.score}<span className="text-base font-bold">/{MAX_SCORE}</span>
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-baseline justify-between">
                                        <span className="font-bold" style={{ color: INK }}>ระดับผลงาน</span>
                                        <span className="font-mono text-xl font-black" style={{ color: BRASS }}>
                                            {result.grade}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* right column */}
                            <div className="flex h-full flex-col gap-5">
                                {/* itemized receipt breakdown */}
                                <div
                                    className="rounded-sm p-5"
                                    style={{ background: PAPER, border: `1px solid ${LINE}` }}
                                >
                                    <div className="mb-3 flex items-center gap-2 text-sm font-black" style={{ color: INK }}>
                                        <Receipt size={18} />
                                        <span>ใบแจ้งรายการคะแนน</span>
                                    </div>
                                    <div className="space-y-1.5 font-mono text-sm">
                                        {ledgerRows.map((row, i) => {
                                            // แถวหักคะแนน (isDeduction) โชว์ ✗/แดงเสมอ ตามความหมายเดิม
                                            // ส่วนแถวอื่น ต้องเช็คจาก row.positive จริง ไม่ใช่เขียวตายตัว
                                            const achieved = row.isDeduction ? false : row.positive;
                                            const showCross = row.isDeduction || !achieved;

                                            return (
                                                <div key={i} className="flex items-end gap-2">
                                                    <span
                                                        className="whitespace-nowrap font-sans font-bold"
                                                        style={{ color: showCross ? STAMP_RED : INK }}
                                                    >
                                                        {showCross ? "✗" : "✓"} {row.label}
                                                    </span>
                                                    <span
                                                        className="flex-1 border-b border-dotted translate-y-[-3px]"
                                                        style={{ borderColor: LINE }}
                                                    />
                                                    <span
                                                        className="font-black"
                                                        style={{ color: showCross ? STAMP_RED : STAMP_GREEN }}
                                                    >
                                                        {row.value}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm" style={{ borderColor: LINE }}>
                                        <span className="font-bold" style={{ color: INK }}>⏱ เวลาที่ใช้</span>
                                        <span className="font-mono font-black" style={{ color: INK }}>{formatTime(result.elapsedTime)}</span>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs" style={{ borderColor: LINE }}>
                                        <p>Bonus (Integrity Points)</p>
                                        <span className="font-bold" style={{ color: INK }}>
                                            {result.success
                                                ? `ผ่าน ${baseIP} จาก 5 เงื่อนไข +${baseIP} IP${timeBonusIP > 0 ? " และทันเวลา +1 IP" : ""}`
                                                : "ภารกิจไม่ผ่าน — ไม่ได้ IP"}
                                        </span>
                                        <span
                                            className="font-black text-xl"
                                            style={{ color: earnedIP > 0 ? STAMP_GREEN : "#b17a2e" }}
                                        >
                                            {earnedIP > 0 ? ` +${earnedIP} IP` : "+0 IP"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`mt-4 grid grid-cols-1 gap-5 sm:items-stretch ${!result.success ? "sm:grid-cols-2" : ""
                                }`}
                        >
                            {!result.success && (
                                <div
                                    className="flex h-full flex-col justify-center rounded-sm p-4 text-sm font-bold"
                                    style={{ background: "#F7E3DE", border: `1px solid ${STAMP_RED}`, color: STAMP_RED }}
                                >
                                    <div className="mb-2 flex items-center gap-2 font-black">
                                        <Stamp size={16} />
                                        <span>สิ่งที่ต้องแก้ไขก่อนยื่นใหม่</span>
                                    </div>
                                    <ul className="ml-5 grid grid-cols-2 list-disc gap-x-4 gap-y-0.5">
                                        <li>ซื้อของที่จำเป็นครบถ้วน</li>
                                        <li>เก็บใบเสร็จทุกครั้งที่ซื้อของ</li>
                                        <li>ไม่ซื้อของที่ไม่จำเป็น</li>
                                        <li>เงินคงเหลือไม่ติดลบ</li>
                                    </ul>
                                </div>
                            )}

                            {/* feedback note */}
                            <div
                                className="relative flex h-full flex-col justify-center rounded-sm p-5"
                                style={{
                                    background: "#FBF6E3",
                                    border: `1px solid ${LINE}`,
                                    borderLeft: `4px solid ${BRASS}`,
                                }}
                            >
                                <div className="mb-2 flex items-center gap-2 text-sm font-black" style={{ color: BRASS }}>
                                    <PiggyBank size={18} />
                                    <span>บันทึกจากฝ่ายตรวจสอบ</span>
                                </div>
                                <p className="font-bold leading-relaxed" style={{ color: INK }}>
                                    {result.feedback}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-4 sm:flex-row justify-center items-center">

                            {!result.success ? (
                                <>
                                    <button
                                        onClick={resetGame}
                                        className="result-button result-button-red"
                                    >
                                        <span className="result-button-top">เล่นอีกครั้ง</span>
                                    </button>

                                    {/* กลับหน้าหลัก */}
                                    <button
                                        onClick={() => navigate("/map")}
                                        className="result-button result-button-yellow"
                                    >
                                        <span className="result-button-top">กลับหน้าหลัก</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* กลับหน้าหลัก */}
                                    <button
                                        onClick={() => navigate("/map")}
                                        className="result-button result-button-yellow"
                                    >
                                        <span className="result-button-top">กลับหน้าหลัก</span>
                                    </button>

                                    {/* ด่านถัดไป */}
                                    <button
                                        onClick={() => navigate("/unit3/level-next")}
                                        className="result-button result-button-green"
                                    >
                                        <span className="result-button-top">ด่านถัดไป</span>
                                    </button>
                                </>
                            )}

                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}