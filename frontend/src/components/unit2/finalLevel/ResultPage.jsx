import React, { useEffect, useState } from 'react';
import bonusSound from "../../../assets/sounds/BackgroundGame/Bonus.mp3";
import useGameMuted from "../../../hooks/useGameMuted";
import { useNavigate } from 'react-router-dom';

import "../../../styles/unit2/components/debrief.css";
import "../../../styles/unit2/button/level1/button.css";
import SceneResult from "../../../assets/unit2/FinalLevel/Result/sceneResult.png"
import MedalGold from "../../../assets/unit2/FinalLevel/Result/gold.jpg";
import MedalSilver from "../../../assets/unit2/FinalLevel/Result/silver.jpg";
import MedalBronze from "../../../assets/unit2/FinalLevel/Result/bronze.jpg";

const API_URL = "http://localhost:5000";
const LEVEL_ID = 7;

export default function ResultPage({
    isPassed,
    timeLeft,
    totalCorrect,
    MISSIONS,
    userChoices,
    setGameState,
    setIntroStep,
    money,
    medal,
    baseIP,
    medalBonusIP,
    earnedIP,
    totalIntegrityPoints,
    playCount,
}) {
    const navigate = useNavigate();
    const verdict = isPassed ? 'PASSED' : 'FAILED';
    const verdictColor = isPassed ? '#2F6B4F' : '#A8412C';

    // เสียง Bonus เล่นครั้งเดียวตอนเปิดหน้า ไม่วน
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

    /*
     * ข้อความคำบรรยายใต้ชื่อเหรียญ เดิม hardcode ไว้ในไฟล์นี้ทั้งหมด
     * (รวมถึงเลขคะแนน "9/10" / "8/10" ที่ตายตัว ไม่ตรงกับ totalQuestions
     * จริงถ้าจำนวนคำถามเปลี่ยนในอนาคต) — ย้ายมาดึงจาก level_result_messages
     * เหมือน Level 1 / Level 2 โดยใช้ status = GOLD/SILVER/BRONZE
     * ข้อความที่เก็บใน DB เป็น template ที่มี {score}/{total} ให้แทนค่า
     * จากผลจริงตรงนี้แทน
     */
    const medalStatus = medal ? medal.toUpperCase() : null;
    const [medalText, setMedalText] = useState(null);

    useEffect(() => {
        if (!medalStatus) {
            setMedalText(null);
            return;
        }

        const fetchMedalMessage = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/level-result/${LEVEL_ID}/${medalStatus}`
                );

                if (!response.ok) {
                    throw new Error("โหลดข้อความเหรียญไม่สำเร็จ");
                }

                const data = await response.json();
                setMedalText(data.data?.message || "");
            } catch (error) {
                console.error("Fetch Medal Message Error:", error);
                setMedalText("");
            }
        };

        fetchMedalMessage();
    }, [medalStatus]);

    const medalCaption = medalText
        ? medalText
            .replace("{score}", totalCorrect)
            .replace("{total}", MISSIONS.length)
        : "";

    return (
        <div
            className="h-[100dvh] w-full flex flex-col items-center justify-center px-4 py-8 md:py-12 relative bg-cover bg-top overflow-hidden sarabun-bold"
            style={{ backgroundImage: `url(${SceneResult})` }}
        >
            {/* scene scrim: keeps the paper legible against whatever is in the photo */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse at center, rgba(20,17,12,0.25) 0%, rgba(15,13,9,0.55) 65%, rgba(10,9,6,0.75) 100%)',
                }}
            />

            {/* พอดีจอเดียวเหมือนเดิม (ไม่มี scroll ทั้งหน้า) — ที่เลื่อนได้
                มีแค่ในกล่อง DECISION LOG ข้างในกระดาษเท่านั้น */}
            <div className="w-full max-w-2xl h-full relative my-auto flex flex-col" style={{ transform: 'rotate(-0.6deg)' }}>
                {/* a strip of tape pinning the report to the scene */}
                <div
                    className="paper-tape"
                    style={{ top: '-14px', left: '38%', width: '110px', height: '26px', transform: 'rotate(-3deg)' }}
                />

                <div className="debrief-paper rounded-sm px-6 md:px-10 py-6 md:py-8 text-[#2A2620] flex flex-col h-full shadow-2xl" style={{ overflow: 'visible' }}>

                    {/* Header / verdict (shrink-0 prevents it from squishing) */}
                    <div className="flex items-start justify-between gap-4 shrink-0">
                        <div className="flex-1">
                            <p className="font-stamp text-sm tracking-[0.3em] text-[#8C806A] mb-1">
                                MISSION DEBRIEF
                            </p>

                            {/* Medal — ซ้ายบน ใต้ MISSION DEBRIEF */}
                            {isPassed && medal && (
                                <div className="flex items-center gap-3 mt-2 mb-2">
                                    <img
                                        src={
                                            medal === 'gold'
                                                ? MedalGold
                                                : medal === 'silver'
                                                    ? MedalSilver
                                                    : MedalBronze
                                        }
                                        alt={`${medal} medal`}
                                        className="w-16 h-16 md:w-20 md:h-20 object-contain"
                                        style={{
                                            filter:
                                                medal === 'gold'
                                                    ? 'drop-shadow(0 0 5px rgba(255, 215, 70, 0.95)) drop-shadow(0 0 12px rgba(255, 200, 40, 0.75)) drop-shadow(0 0 20px rgba(255, 190, 30, 0.45))'
                                                    : medal === 'silver'
                                                        ? 'drop-shadow(0 0 5px rgba(220, 225, 235, 0.95)) drop-shadow(0 0 12px rgba(190, 200, 215, 0.75)) drop-shadow(0 0 20px rgba(180, 190, 210, 0.45))'
                                                        : 'drop-shadow(0 0 5px rgba(220, 150, 80, 0.95)) drop-shadow(0 0 12px rgba(190, 120, 50, 0.75)) drop-shadow(0 0 20px rgba(180, 100, 40, 0.45))',
                                        }}
                                    />

                                    <div className="flex flex-col gap-0.5">
                                        <span
                                            className="font-stamp text-xs md:text-sm tracking-[0.2em]"
                                            style={{
                                                color:
                                                    medal === 'gold'
                                                        ? '#B8860B'
                                                        : medal === 'silver'
                                                            ? '#7A7A7A'
                                                            : '#8B5E3C',
                                            }}
                                        >
                                            {medal === 'gold'
                                                ? 'GOLD MEDAL'
                                                : medal === 'silver'
                                                    ? 'SILVER MEDAL'
                                                    : 'BRONZE MEDAL'}
                                        </span>

                                        {medalCaption && (
                                            <span className="font-thai text-[11px] md:text-xs text-[#5B5340]">
                                                {medalCaption}
                                            </span>
                                        )}

                                        {medalBonusIP > 0 && (
                                            <span
                                                className="font-stamp text-[10px] md:text-[11px] tracking-wide"
                                                style={{
                                                    color:
                                                        medal === 'gold'
                                                            ? '#B8860B'
                                                            : medal === 'silver'
                                                                ? '#7A7A7A'
                                                                : '#8B5E3C',
                                                }}
                                            >
                                                ⭐ โบนัสเหรียญ +{medalBonusIP} IP
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* IP รวมที่ได้จากภารกิจนี้ — เดิมหน้านี้แยกเป็น
                                EXP bonus / Coin bonus ที่ไม่เคยถูกบันทึกจริง
                                ในระบบเลย (มีแค่ integrity_points เท่านั้นที่
                                persist) เลยรวมเป็น IP ก้อนเดียวให้ตรงกับของจริง */}
                            {isPassed && (
                                <div className="mt-2 flex flex-col gap-0.5">
                                    <span className="font-stamp text-sm md:text-base font-bold text-[#2F6B4F]">
                                        +{earnedIP} IP
                                        {medalBonusIP > 0 && (
                                            <span className="ml-1 text-[10px] md:text-[11px] font-normal text-[#8C806A]">
                                                (พื้นฐาน {baseIP} + โบนัสเหรียญ {medalBonusIP})
                                            </span>
                                        )}
                                    </span>
                                    <span className="font-thai text-[11px] text-[#8C806A]">
                                        IP สะสมทั้งหมด {totalIntegrityPoints}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div
                            className="stamp-mark font-stamp shrink-0 px-3 py-2 text-center leading-none"
                            style={{ color: verdictColor }}
                        >
                            <span className="block text-xl md:text-3xl font-bold tracking-widest">
                                {verdict}
                            </span>
                            <span className="block text-[10px] md:text-[11px] tracking-[0.25em] mt-1 opacity-80">
                                FIELD REVIEW
                            </span>
                        </div>
                    </div>


                    {/* Balance sheet */}
                    <div className="mt-4 md:mt-6 font-ledger text-sm shrink-0">
                        <p className="font-stamp text-xs tracking-[0.25em] text-[#8C806A] mb-2">
                            BALANCE SHEET
                        </p>
                        <div className="flex items-baseline justify-between ledger-row pb-1 mb-2">
                            <span className="font-thai text-[#5B5340]">เงินคงเหลือ</span>
                            <span className="font-bold text-base md:text-lg">{Number(money).toLocaleString()} ฿</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="font-thai text-[#5B5340]">สรุปผลการเล่น</span>
                            <span>{totalCorrect}/{MISSIONS.length} ข้อ</span>
                        </div>
                    </div>

                    {/* Perforated receipt: decision log — ส่วนนี้ยังคงกินพื้นที่
                        ที่เหลือทั้งหมด (flex-1 min-h-0) และเลื่อนดูข้างในได้
                        เอง ไม่ทำให้การ์ดทั้งใบสูงเกินจอ */}
                    <div className="mt-5 md:mt-6 flex-1 min-h-0 flex flex-col">
                        <p className="font-stamp text-[11px] tracking-[0.25em] text-[#8C806A] mb-1 shrink-0">
                            DECISION LOG
                        </p>
                        <div className="perforation perforation-top shrink-0" />
                        <div className="bg-[#EDE6D2] flex-1 overflow-y-auto receipt-scroll px-1 md:px-3">
                            {MISSIONS.map((m, i) => {
                                const userAns = userChoices.find(c => c.missionId === m.id);
                                const skipped = !userAns;
                                const correct = userAns?.isCorrect ?? false;

                                // หาสาเหตุที่ไม่ได้ตอบ
                                let skipReason = null;
                                if (skipped) {
                                    if (timeLeft === 0) skipReason = 'timeout';
                                    else if (money <= 0) skipReason = 'bankrupt';
                                    else skipReason = 'notreached';
                                }

                                const tagColor = skipped ? '#8C806A' : (correct ? '#2F6B4F' : '#A8412C');
                                const tagLabel = skipped
                                    ? skipReason === 'timeout' ? 'หมดเวลา'
                                        : skipReason === 'bankrupt' ? 'เงินหมด'
                                            : 'ไม่ได้ตอบ'
                                    : (correct ? 'ถูกต้อง' : 'ยังไม่คุ้มค่า');

                                const skipText = skipped
                                    ? skipReason === 'timeout' ? 'หมดเวลาก่อนถึงข้อนี้'
                                        : skipReason === 'bankrupt' ? 'เงินหมดก่อนถึงข้อนี้'
                                            : '—'
                                    : null;

                                return (
                                    <div
                                        key={m.id}
                                        className="flex items-start gap-3 py-2.5 ledger-row font-thai text-sm md:text-base"
                                    >
                                        <span className="font-ledger text-[#8C806A] text-xs md:text-sm pt-0.5 shrink-0">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-[#3B362C]">{m.phase}</span>
                                                <span
                                                    className="font-stamp text-[11px] md:text-xs tracking-wide shrink-0"
                                                    style={{ color: tagColor }}
                                                >
                                                    {tagLabel}
                                                </span>
                                            </div>
                                            <p className="text-xs md:text-sm text-[#8C806A] mt-1">{m.situation}</p>
                                            <p className="text-xs md:text-sm font-semibold text-[#5B5340] mt-1.5">
                                                เลือก: {skipped
                                                    ? <span className="text-[#A8412C] font-bold">{skipText}</span>
                                                    : userAns.text}
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

                    {/* Actions — ระยะห่างด้านบนมากกว่าเดิมให้ปุ่มขยับลงมา
                        DECISION LOG เป็น flex-1 อยู่แล้ว จะหดพื้นที่ตัวเอง
                        ให้พอดีโดยอัตโนมัติ การ์ดจึงยังพอดีจอเดียวเหมือนเดิม */}
                    <div className="flex flex-wrap gap-4 justify-center mt-10 shrink-0 pb-6 min-h-[80px]" style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
                        <button
                            onClick={() => navigate('/map')}
                            className="button-finish-game gray">
                            <span className="button-finish-game-top">กลับหน้าหลัก</span>
                            <span className="button-finish-game-bottom"></span>
                            <span className="button-finish-game-base"></span>
                        </button>
                        {!isPassed ? (
                            <button
                                onClick={() => navigate('/unit2/final/introMission')}
                                className="button-finish-game yellow">
                                <span className="button-finish-game-top">เล่นอีกครั้ง</span>
                                <span className="button-finish-game-bottom"></span>
                                <span className="button-finish-game-base"></span>
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/map')}
                                className="button-finish-game green">
                                <span className="button-finish-game-top">ดำเนินการต่อ</span>
                                <span className="button-finish-game-bottom"></span>
                                <span className="button-finish-game-base"></span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}